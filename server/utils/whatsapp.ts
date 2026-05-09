export const sendWhatsAppNotification = async (phone: string, apiKey: string, message: string) => {
  if (!phone || !apiKey) {
    console.warn("WhatsApp notification skipped: Missing phone or API key.");
    return false;
  }

  try {
    const encodedMessage = encodeURIComponent(message);
    const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodedMessage}&apikey=${apiKey}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`CallMeBot API responded with status: ${response.status}`);
    }
    return true;
  } catch (error) {
    console.error('WhatsApp Notification Error:', error);
    return false;
  }
};
