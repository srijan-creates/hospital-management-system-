const chatSession = require("../models/sessionSchema");
const Chat = require("../models/chatSchema");

const getAllSessions = async (req, res) => {
    try {
        const sessions = await chatSession.find()
            .sort({ lastActivity: -1 })
            .limit(100); 

        res.json(sessions);
    } catch (error) {
        console.error('Error fetching sessions:', error);
        res.status(500).json({ message: 'Failed to fetch sessions', error: error.message });
    }
};

// Get single session with messages
const getSessionById = async (req, res) => {
    try {
        const session = await chatSession.findById(req.params.id);

        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        const messages = await Chat.find({ sessionId: session.sessionId })
            .sort({ createdAt: 1 })
            .select('role content createdAt intent');

        res.json({
            session,
            messages
        });
    } catch (error) {
        console.error('Error fetching session:', error);
        res.status(500).json({ message: 'Failed to fetch session', error: error.message });
    }
};

// Get sessions by status
const getSessionsByStatus = async (req, res) => {
    try {
        const { status } = req.params;

        const sessions = await chatSession.find({ status })
            .sort({ lastActivity: -1 });

        res.json(sessions);
    } catch (error) {
        console.error('Error fetching sessions by status:', error);
        res.status(500).json({ message: 'Failed to fetch sessions', error: error.message });
    }
};

// Update session status
const updateSessionStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!['active', 'ended', 'transferred'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const session = await chatSession.findByIdAndUpdate(
            req.params.id,
            {
                status,
                ...(status === 'ended' && { endedAt: new Date() })
            },
            { new: true }
        );

        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        res.json(session);
    } catch (error) {
        console.error('Error updating session:', error);
        res.status(500).json({ message: 'Failed to update session', error: error.message });
    }
};

// Delete session and its messages
const deleteSession = async (req, res) => {
    try {
        const session = await chatSession.findById(req.params.id);

        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        await Chat.deleteMany({ sessionId: session.sessionId });

        await chatSession.findByIdAndDelete(req.params.id);

        res.json({ message: 'Session and messages deleted successfully' });
    } catch (error) {
        console.error('Error deleting session:', error);
        res.status(500).json({ message: 'Failed to delete session', error: error.message });
    }
};

// Get session analytics
const getSessionAnalytics = async (req, res) => {
    try {
        const totalSessions = await chatSession.countDocuments();
        const activeSessions = await chatSession.countDocuments({ status: 'active' });
        const endedSessions = await chatSession.countDocuments({ status: 'ended' });

        const totalMessages = await Chat.countDocuments();
        const userMessages = await Chat.countDocuments({ role: 'user' });
        const botMessages = await Chat.countDocuments({ role: 'bot' });

        const sessionsWithInfo = await chatSession.countDocuments({
            'userInfo.email': { $exists: true, $ne: null }
        });

        res.json({
            sessions: {
                total: totalSessions,
                active: activeSessions,
                ended: endedSessions,
                withUserInfo: sessionsWithInfo
            },
            messages: {
                total: totalMessages,
                user: userMessages,
                bot: botMessages
            }
        });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ message: 'Failed to fetch analytics', error: error.message });
    }
};

module.exports = {
    getAllSessions,
    getSessionById,
    getSessionsByStatus,
    updateSessionStatus,
    deleteSession,
    getSessionAnalytics
};
