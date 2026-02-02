import { supabase } from './supabase';

export interface EmailTemplate {
  name: string;
  email: string;
  subject?: string;
  message?: string;
  membershipType?: string;
  memberNumber?: string;
  [key: string]: any;
}

export interface SendEmailOptions {
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

class EmailService {
  private supabaseUrl: string;
  private supabaseAnonKey: string;

  constructor() {
    this.supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    this.supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  }

  private escapeHtml(unsafe: string): string {
    if (typeof unsafe !== 'string') {
      return String(unsafe);
    }
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
      .replace(/\//g, '&#x2F;');
  }

  private async callEmailFunction(options: SendEmailOptions): Promise<any> {
    const functionUrl = `${this.supabaseUrl}/functions/v1/send-email`;

    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.supabaseAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to send email');
    }

    return await response.json();
  }

  async sendEmail(options: SendEmailOptions): Promise<{ success: boolean; emailId?: string; error?: string }> {
    try {
      const result = await this.callEmailFunction(options);
      return {
        success: result.success,
        emailId: result.emailId,
      };
    } catch (error: any) {
      console.error('Error sending email:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async sendEmailFromTemplate(
    templateType: string,
    recipientEmail: string,
    recipientName: string,
    templateData: Record<string, any>
  ): Promise<{ success: boolean; emailId?: string; error?: string }> {
    try {
      const { data: template, error: templateError } = await supabase
        .from('email_templates')
        .select('*')
        .eq('type', templateType)
        .eq('is_active', true)
        .single();

      if (templateError || !template) {
        throw new Error(`Template ${templateType} not found`);
      }

      let htmlContent = template.html_content;
      let textContent = template.text_content || '';
      let subject = template.subject;

      // Sanitize template data to prevent XSS attacks
      Object.keys(templateData).forEach((key) => {
        const value = templateData[key];
        const escapedValue = this.escapeHtml(String(value));
        htmlContent = htmlContent.replace(new RegExp(`{{${key}}}`, 'g'), escapedValue);
        textContent = textContent.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
        subject = subject.replace(new RegExp(`{{${key}}}`, 'g'), this.escapeHtml(String(value)));
      });

      return await this.sendEmail({
        to: recipientEmail,
        toName: recipientName,
        subject,
        html: htmlContent,
        text: textContent,
        templateType,
        templateData,
      });
    } catch (error: any) {
      console.error('Error sending email from template:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async sendContactConfirmation(data: EmailTemplate): Promise<{ success: boolean; emailId?: string; error?: string }> {
    return await this.sendEmailFromTemplate(
      'contact_confirmation',
      data.email,
      data.name,
      {
        name: data.name,
        subject: data.subject,
        message: data.message || '',
      }
    );
  }

  async sendContactNotification(data: EmailTemplate): Promise<{ success: boolean; emailId?: string; error?: string }> {
    const adminEmail = 'emmanuelfob@gmail.com';

    return await this.sendEmailFromTemplate(
      'contact_notification',
      adminEmail,
      'Admin FEGESPORT',
      {
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message || '',
      }
    );
  }

  async sendMembershipConfirmation(data: EmailTemplate): Promise<{ success: boolean; emailId?: string; error?: string }> {
    return await this.sendEmailFromTemplate(
      'membership_confirmation',
      data.email,
      data.name,
      {
        name: data.name,
        membershipType: data.membershipType || 'Standard',
        memberNumber: data.memberNumber || 'N/A',
      }
    );
  }

  async getEmailQueue(status?: string): Promise<any[]> {
    try {
      let query = supabase
        .from('email_queue')
        .select('*')
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching email queue:', error);
      return [];
    }
  }

  async getEmailLogs(emailQueueId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('email_logs')
        .select('*')
        .eq('email_queue_id', emailQueueId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching email logs:', error);
      return [];
    }
  }

  async processEmailQueue(): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const functionUrl = `${this.supabaseUrl}/functions/v1/send-email?action=process`;

      const response = await fetch(functionUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.supabaseAnonKey}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process email queue');
      }

      const result = await response.json();
      return {
        success: result.success,
        message: result.message,
      };
    } catch (error: any) {
      console.error('Error processing email queue:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

export const emailService = new EmailService();
