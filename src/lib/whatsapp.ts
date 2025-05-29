import { Client } from 'whatsapp-web.js';

const client = new Client({
  puppeteer: {
    args: ['--no-sandbox'],
  }
});

let isReady = false;

client.on('ready', () => {
  isReady = true;
  console.log('WhatsApp client is ready!');
});

client.on('qr', (qr) => {
  console.log('QR Code received:', qr);
});

client.initialize().catch(console.error);

export const sendWhatsAppMessage = async (to: string, message: string) => {
  try {
    if (!isReady) {
      throw new Error('WhatsApp client not ready');
    }
    
    const number = to.replace(/\D/g, '');
    const chatId = `${number}@c.us`;
    
    await client.sendMessage(chatId, message);
    return true;
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return false;
  }
};