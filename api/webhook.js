const { GoogleGenerativeAI } = require("@google/generative-ai");

export default async function handler(req, res) {
  // Only allow POST requests (messages from Telegram)
  if (req.method !== 'POST') return res.status(200).send('Bot is running');

  const { message } = req.body;
  if (!message || !message.text) return res.status(200).send('OK');

  try {
    // 1. Initialize Gemini using your API Key
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 2. Send user message to Gemini
    const result = await model.generateContent(message.text);
    const responseText = result.response.text();

    // 3. Send Gemini's response back to Telegram
    await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: message.chat.id,
        text: responseText
      }),
    });

    return res.status(200).send('OK');
  } catch (e) {
    console.error(e);
    return res.status(200).send('Error');
  }
}
