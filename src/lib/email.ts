// Email utility functions for client-side email handling
// Note: This is a client-side implementation and should not include server-side dependencies

interface EmailConfig {
  to: string;
  subject: string;
  body: string;
}

export const createMailtoLink = (config: EmailConfig): string => {
  const { to, subject, body } = config;
  const encodedSubject = encodeURIComponent(subject);
  const encodedBody = encodeURIComponent(body);
  
  return `mailto:${to}?subject=${encodedSubject}&body=${encodedBody}`;
};

export const openEmailClient = (config: EmailConfig): void => {
  const mailtoLink = createMailtoLink(config);
  window.open(mailtoLink, '_blank');
};

export const sendEmail = async (to: string, subject: string, html: string): Promise<boolean> => {
  try {
    // For client-side implementation, we'll use mailto links
    // In a real application, this would be handled by a backend service
    const mailtoLink = createMailtoLink({
      to,
      subject,
      body: html.replace(/<[^>]*>/g, '') // Strip HTML tags for mailto
    });
    
    window.open(mailtoLink, '_blank');
    return true;
  } catch (error) {
    console.error('Error opening email client:', error);
    return false;
  }
};

// Template functions for common email types
export const createContactReplyTemplate = (originalMessage: string, senderName: string): string => {
  return `Bonjour ${senderName},

Merci pour votre message concernant :
"${originalMessage}"

Nous vous répondrons dans les plus brefs délais.

Cordialement,
L'équipe FEGESPORT`;
};

export const createMembershipConfirmationTemplate = (memberName: string, membershipType: string): string => {
  return `Bonjour ${memberName},

Votre adhésion en tant que ${membershipType} à la FEGESPORT a été confirmée.

Bienvenue dans la communauté esport guinéenne !

Cordialement,
L'équipe FEGESPORT`;
};