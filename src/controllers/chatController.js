const Chat = require("../models/chatSchema");
const Faq = require("../models/faqSchema");
const chatSession = require("../models/sessionSchema");


async function findMatchfaq(userText) {
  const words = userText.toLowerCase().trim().split(/\s+/);
  const faq = await Faq.findOne({
    isActive: true,
    keywords: { $in: words }
  }).sort({ priority: -1 }).limit(1);

  return faq;
};


const sendMessage = async (req, res) => {
  try {
    // Use validated data from middleware
    const { sessionId, message } = req.validatedData || req.body;

    if (!sessionId || !message) {
      return res.status(400).json({ error: 'sessionId and message are required' });
    }

    const userMessage = new Chat({
      sessionId,
      role: 'user',
      content: message.trim()
    });
    await userMessage.save();

    // Update or create session
    await chatSession.findOneAndUpdate(
      { sessionId },
      { lastActivity: new Date() },
      { upsert: true, new: true }
    );

    let botResponse = "I'm sorry, I didn't understand that. You can ask about appointments, departments, visiting hours, location, insurance, or emergency services.";
    let detectedIntent = null;

    const matchedFaq = await findMatchfaq(message);
    if (matchedFaq) {
      botResponse = matchedFaq.response;
      detectedIntent = matchedFaq.category;
    }

    const botMessage = new Chat({
      sessionId,
      role: 'bot',
      content: botResponse,
      intent: detectedIntent
    });
    await botMessage.save();

    res.json({ reply: botResponse });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getChatHistory = async (req, res) => {
  try {
    // Use validated data from middleware
    const { sessionId } = req.validatedData || req.query;

    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId is required' });
    }

    const messages = await Chat.find({ sessionId })
      .sort({ createdAt: 1 })
      .select('role content createdAt intent');

    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const updateSessionInfo = async (req, res) => {
  try {
    // Use validated data from middleware
    const validatedData = req.validatedData || req.body;
    const { sessionId, userInfo } = validatedData;
    const { name, email, phone } = userInfo || validatedData;

    const updated = await chatSession.findOneAndUpdate(
      { sessionId },
      { userInfo: { name, email, phone }, lastActivity: new Date() },
      { new: true }
    );

    res.json({ success: true, session: updated });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};


module.exports = { updateSessionInfo, getChatHistory, sendMessage }