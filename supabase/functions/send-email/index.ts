import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'npm:@supabase/supabase-js@2.50.0';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface EmailRequest {
  to: string;
  toName?: string;
  from?: string;
  fromName?: string;
  replyTo?: string;
  subject: string;
  html: string;
  text?: string;
  templateType?: string;
  templateData?: Record<string, any>;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY');

    console.log('Environment check:', {
      hasSupabaseUrl: !!supabaseUrl,
      hasSupabaseKey: !!supabaseServiceKey,
      hasResendKey: !!resendApiKey,
      resendKeyLength: resendApiKey?.length || 0,
    });

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (req.method === 'POST') {
      const emailData: EmailRequest = await req.json();

      const {
        to,
        toName,
        from = 'noreply@contact.fegesport224.org',
        fromName = 'FEGESPORT',
        replyTo,
        subject,
        html,
        text,
        templateType,
        templateData,
      } = emailData;

      const { data: emailRecord, error: insertError } = await supabase
        .from('email_queue')
        .insert({
          to_email: to,
          to_name: toName,
          from_email: from,
          from_name: fromName,
          reply_to: replyTo,
          subject,
          html_content: html,
          text_content: text,
          template_type: templateType,
          template_data: templateData || {},
          status: 'pending',
          priority: 2,
        })
        .select()
        .single();

      if (insertError) {
        throw new Error(`Failed to queue email: ${insertError.message}`);
      }

      if (resendApiKey) {
        try {
          const { data: updateData, error: updateError } = await supabase
            .from('email_queue')
            .update({ status: 'sending', attempts: 1 })
            .eq('id', emailRecord.id)
            .select()
            .single();

          if (updateError) {
            console.error('Failed to update email status to sending:', updateError);
          }

          const resendResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${resendApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: `${fromName} <${from}>`,
              to: toName ? `${toName} <${to}>` : to,
              reply_to: replyTo,
              subject,
              html,
              text: text || html.replace(/<[^>]*>/g, ''),
            }),
          });

          if (!resendResponse.ok) {
            const errorData = await resendResponse.json();
            throw new Error(`Resend API error: ${JSON.stringify(errorData)}`);
          }

          const resendData = await resendResponse.json();

          await supabase
            .from('email_queue')
            .update({
              status: 'sent',
              sent_at: new Date().toISOString(),
            })
            .eq('id', emailRecord.id);

          return new Response(
            JSON.stringify({
              success: true,
              message: 'Email sent successfully',
              emailId: emailRecord.id,
              resendId: resendData.id,
            }),
            {
              status: 200,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        } catch (error) {
          console.error('Failed to send email via Resend:', error);

          await supabase
            .from('email_queue')
            .update({
              status: 'failed',
              error_message: error.message,
              attempts: 1,
            })
            .eq('id', emailRecord.id);

          return new Response(
            JSON.stringify({
              success: false,
              message: 'Email queued but failed to send',
              emailId: emailRecord.id,
              error: error.message,
            }),
            {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }
      } else {
        return new Response(
          JSON.stringify({
            success: true,
            message: 'Email queued (RESEND_API_KEY not configured)',
            emailId: emailRecord.id,
          }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    }

    if (req.method === 'GET') {
      const url = new URL(req.url);
      const action = url.searchParams.get('action');

      if (action === 'status') {
        return new Response(
          JSON.stringify({
            success: true,
            message: 'Email function is running',
            hasResendKey: !!resendApiKey,
            resendKeyLength: resendApiKey?.length || 0,
            environment: {
              hasSupabaseUrl: !!supabaseUrl,
              hasSupabaseKey: !!supabaseServiceKey,
            }
          }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      if (action === 'process') {
        const resendApiKey = Deno.env.get('RESEND_API_KEY');

        if (!resendApiKey) {
          return new Response(
            JSON.stringify({
              success: false,
              message: 'RESEND_API_KEY not configured',
            }),
            {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }

        const { data: pendingEmails, error: fetchError } = await supabase
          .from('email_queue')
          .select('*')
          .eq('status', 'pending')
          .lt('attempts', 3)
          .order('priority', { ascending: true })
          .order('created_at', { ascending: true })
          .limit(10);

        if (fetchError) {
          throw new Error(`Failed to fetch pending emails: ${fetchError.message}`);
        }

        if (!pendingEmails || pendingEmails.length === 0) {
          return new Response(
            JSON.stringify({
              success: true,
              message: 'No pending emails to process',
              processed: 0,
            }),
            {
              status: 200,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }

        let successCount = 0;
        let failCount = 0;

        for (const email of pendingEmails) {
          try {
            await supabase
              .from('email_queue')
              .update({ status: 'sending', attempts: email.attempts + 1 })
              .eq('id', email.id);

            const resendResponse = await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${resendApiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                from: `${email.from_name} <${email.from_email}>`,
                to: email.to_name ? `${email.to_name} <${email.to_email}>` : email.to_email,
                reply_to: email.reply_to,
                subject: email.subject,
                html: email.html_content,
                text: email.text_content || email.html_content.replace(/<[^>]*>/g, ''),
              }),
            });

            if (!resendResponse.ok) {
              throw new Error('Resend API error');
            }

            await supabase
              .from('email_queue')
              .update({
                status: 'sent',
                sent_at: new Date().toISOString(),
              })
              .eq('id', email.id);

            successCount++;
          } catch (error) {
            failCount++;

            await supabase
              .from('email_queue')
              .update({
                status: email.attempts + 1 >= email.max_attempts ? 'failed' : 'pending',
                error_message: error.message,
              })
              .eq('id', email.id);
          }
        }

        return new Response(
          JSON.stringify({
            success: true,
            message: 'Email processing completed',
            total: pendingEmails.length,
            sent: successCount,
            failed: failCount,
          }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      return new Response(
        JSON.stringify({
          success: false,
          message: 'Invalid action parameter',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: false,
        message: 'Method not allowed',
      }),
      {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in send-email function:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
