// CENTRE MÉDIA FEGESPORT — Envoi de newsletters via Resend
//
// POST { action: 'send' | 'test', campaign_id: string, test_email?: string }   (admin JWT)
// GET  ?action=unsubscribe&token=<uuid>                                        (public, lien email)
// POST { action: 'webhook', ... }  ou webhook Resend (type: email.opened...)   (stats ouvertures/clics)
//
// Déployer avec --no-verify-jwt (le contrôle admin est fait dans le code,
// l'endpoint de désabonnement et le webhook Resend doivent rester publics).
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import {
  corsHeaders,
  jsonResponse,
  getServiceClient,
  requireAdmin,
  logPublication,
} from '../_shared/mediaCenter.ts';

const SITE_URL = Deno.env.get('SITE_URL') ?? 'https://fegesport224.org';
const FROM_EMAIL = Deno.env.get('NEWSLETTER_FROM_EMAIL') ?? 'newsletter@fegesport224.org';
const FROM_NAME = 'FEGESPORT';
const BATCH_SIZE = 100; // limite de l'endpoint batch Resend

function unsubscribePage(message: string): Response {
  return new Response(
    `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><title>FEGESPORT — Newsletter</title>
<style>body{font-family:system-ui,sans-serif;background:#111827;color:#f9fafb;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}
.card{background:#1f2937;border-radius:12px;padding:40px;max-width:420px;text-align:center}
a{color:#ef4444}</style></head>
<body><div class="card"><h1 style="font-size:20px">FEGESPORT</h1><p>${message}</p>
<a href="${SITE_URL}">Retour au site</a></div></body></html>`,
    { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
  );
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 200, headers: corsHeaders });

  const supabase = getServiceClient();
  const url = new URL(req.url);

  try {
    // ----- Désabonnement one-click (lien dans les emails, public) -----
    if (req.method === 'GET' && url.searchParams.get('action') === 'unsubscribe') {
      const token = url.searchParams.get('token');
      if (!token) return unsubscribePage('Lien de désabonnement invalide.');

      const { data: sub } = await supabase
        .from('newsletter_subscriptions')
        .update({ status: 'unsubscribed' })
        .eq('unsubscribe_token', token)
        .select('id, email')
        .maybeSingle();

      if (sub) {
        return unsubscribePage('Vous êtes désabonné(e) de la newsletter FEGESPORT. À bientôt !');
      }
      return unsubscribePage('Ce lien de désabonnement est invalide ou déjà utilisé.');
    }

    if (req.method !== 'POST') return jsonResponse({ error: 'Méthode non autorisée' }, 405);
    const body = await req.json().catch(() => ({}));

    // ----- Webhook Resend : ouvertures / clics / bounces -----
    if (body.type && typeof body.type === 'string' && body.type.startsWith('email.')) {
      const campaignId = body.data?.tags?.campaign_id ?? body.data?.tags?.find?.((t: any) => t.name === 'campaign_id')?.value;
      if (campaignId) {
        const column = body.type === 'email.opened' ? 'opens_count'
          : body.type === 'email.clicked' ? 'clicks_count'
          : body.type === 'email.bounced' ? 'bounces_count'
          : body.type === 'email.delivered' ? 'delivered_count'
          : null;
        if (column) {
          const { data: campaign } = await supabase
            .from('newsletter_campaigns').select(`id, ${column}`).eq('id', campaignId).maybeSingle();
          if (campaign) {
            await supabase.from('newsletter_campaigns')
              .update({ [column]: ((campaign as any)[column] ?? 0) + 1 })
              .eq('id', campaignId);
          }
        }
      }
      return jsonResponse({ received: true });
    }

    // ----- Actions admin : envoi de campagne / email de test -----
    const admin = await requireAdmin(req, supabase);
    if (!admin) return jsonResponse({ error: 'Accès réservé aux administrateurs' }, 401);

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) return jsonResponse({ error: 'RESEND_API_KEY non configurée' }, 500);

    const { action, campaign_id, test_email } = body;
    if (!campaign_id) return jsonResponse({ error: 'campaign_id requis' }, 400);

    const { data: campaign, error: campaignError } = await supabase
      .from('newsletter_campaigns').select('*').eq('id', campaign_id).single();
    if (campaignError || !campaign) return jsonResponse({ error: 'Campagne introuvable' }, 404);

    // --- Email de test (n'importe quel statut) ---
    if (action === 'test') {
      if (!test_email) return jsonResponse({ error: 'test_email requis' }, 400);
      const html = campaign.html_content
        .replaceAll('{{UNSUBSCRIBE_URL}}', `${SITE_URL}`)
        .replaceAll('{{ARTICLE_URL}}', `${SITE_URL}/news`);
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: `${FROM_NAME} <${FROM_EMAIL}>`,
          to: [test_email],
          subject: `[TEST] ${campaign.subject}`,
          html,
          tags: [{ name: 'campaign_id', value: campaign.id }],
        }),
      });
      if (!res.ok) return jsonResponse({ error: `Resend: ${await res.text()}` }, 502);
      return jsonResponse({ success: true, message: `Email de test envoyé à ${test_email}` });
    }

    // --- Envoi réel ---
    if (action !== 'send') return jsonResponse({ error: 'action invalide' }, 400);
    if (!['approved', 'scheduled', 'draft', 'pending_review'].includes(campaign.status)) {
      return jsonResponse({ error: `Campagne déjà ${campaign.status}` }, 409);
    }

    // Segmentation (Agent 8) : la campagne cible un ou plusieurs segments d'abonnés.
    // target_segments = ["general"] par défaut ; un segment null en base = "general".
    const targetSegments: string[] = Array.isArray(campaign.target_segments) && campaign.target_segments.length
      ? campaign.target_segments
      : ['general'];

    let subsQuery = supabase
      .from('newsletter_subscriptions')
      .select('email, unsubscribe_token, segment')
      .eq('status', 'active');
    if (!targetSegments.includes('all')) {
      subsQuery = targetSegments.includes('general')
        ? subsQuery.or(`segment.in.(${targetSegments.join(',')}),segment.is.null`)
        : subsQuery.in('segment', targetSegments);
    }
    const { data: subscribers } = await subsQuery;

    if (!subscribers || subscribers.length === 0) {
      return jsonResponse({ error: `Aucun abonné actif dans le(s) segment(s) : ${targetSegments.join(', ')}` }, 400);
    }

    await supabase.from('newsletter_campaigns')
      .update({ status: 'sending', recipients_count: subscribers.length })
      .eq('id', campaign.id);

    const functionsBase = `${Deno.env.get('SUPABASE_URL')}/functions/v1/newsletter-send`;
    let sent = 0;
    const errors: string[] = [];

    for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
      const batch = subscribers.slice(i, i + BATCH_SIZE).map((sub) => ({
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to: [sub.email],
        subject: campaign.subject,
        html: campaign.html_content
          .replaceAll('{{UNSUBSCRIBE_URL}}', `${functionsBase}?action=unsubscribe&token=${sub.unsubscribe_token}`)
          .replaceAll('{{ARTICLE_URL}}', `${SITE_URL}/news`),
        tags: [{ name: 'campaign_id', value: campaign.id }],
      }));

      const res = await fetch('https://api.resend.com/emails/batch', {
        method: 'POST',
        headers: { Authorization: `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(batch),
      });

      if (res.ok) {
        sent += batch.length;
      } else {
        errors.push(`Lot ${i / BATCH_SIZE + 1}: ${(await res.text()).slice(0, 200)}`);
      }
      // Respect du rate limit Resend (2 req/s)
      if (i + BATCH_SIZE < subscribers.length) await new Promise((r) => setTimeout(r, 600));
    }

    const finalStatus = sent > 0 ? 'sent' : 'failed';
    await supabase.from('newsletter_campaigns').update({
      status: finalStatus,
      sent_at: new Date().toISOString(),
      error_message: errors.length ? errors.join(' | ') : null,
    }).eq('id', campaign.id);

    await logPublication(supabase, {
      entity_type: 'newsletter_campaign',
      entity_id: campaign.id,
      action: 'sent',
      channel: 'newsletter',
      performed_by: admin.id,
      performed_by_email: admin.email,
      details: { recipients: subscribers.length, sent, errors: errors.length },
    });

    return jsonResponse({
      success: finalStatus === 'sent',
      sent,
      recipients: subscribers.length,
      errors,
    });
  } catch (error) {
    console.error('newsletter-send error:', error);
    return jsonResponse({ error: `Envoi échoué : ${String(error).slice(0, 300)}` }, 500);
  }
});
