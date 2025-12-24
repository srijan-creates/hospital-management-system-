const Message = require('../models/messageSchema');
const Subscriber = require('../models/subscriberSchema');

const submitContactMessage = async (req, res) => {
    try {
        const { firstName, lastName, email, message } = req.body;

        if (!firstName || !lastName || !email || !message) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const newMessage = await Message.create({
            firstName,
            lastName,
            email,
            message
        });

        res.status(201).json({
            success: true,
            message: "Message sent successfully!",
            data: newMessage 
        });
    } catch (error) {
        console.error("Error submitting contact message:", error);
        res.status(500).json({ message: "Server error, please try again later." });
    }
};

const subscribeNewsletter = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const existingSubscriber = await Subscriber.findOne({ email });
        if (existingSubscriber) {
            return res.status(400).json({ message: "This email is already subscribed." });
        }

        await Subscriber.create({ email });

        res.status(201).json({
            success: true,
            message: "Successfully subscribed to the newsletter!"
        });
    } catch (error) {
        console.error("Error subscribing to newsletter:", error);
        res.status(500).json({ message: "Server error, please try again later." });
    }
};

module.exports = {
    submitContactMessage,
    subscribeNewsletter
};
