const Faq = require("../models/faqSchema");

// Get all FAQs
const getAllFaqs = async (req, res) => {
    try {
        const faqs = await Faq.find().sort({ priority: -1, createdAt: -1 });
        res.json(faqs);
    } catch (error) {
        console.error('Error fetching FAQs:', error);
        res.status(500).json({ message: 'Failed to fetch FAQs', error: error.message });
    }
};

// Get single FAQ
const getFaqById = async (req, res) => {
    try {
        const faq = await Faq.findById(req.params.id);

        if (!faq) {
            return res.status(404).json({ message: 'FAQ not found' });
        }

        res.json(faq);
    } catch (error) {
        console.error('Error fetching FAQ:', error);
        res.status(500).json({ message: 'Failed to fetch FAQ', error: error.message });
    }
};

// Create new FAQ
const createFaq = async (req, res) => {
    try {
        const { keywords, response, language, category, isActive, priority } = req.body;

        if (!keywords || keywords.length === 0 || !response) {
            return res.status(400).json({ message: 'Keywords and response are required' });
        }

        const faq = new Faq({
            keywords,
            response,
            language: language || 'en',
            category: category || 'general',
            isActive: isActive !== undefined ? isActive : true,
            priority: priority || 0
        });

        await faq.save();
        res.status(201).json(faq);
    } catch (error) {
        console.error('Error creating FAQ:', error);
        res.status(500).json({ message: 'Failed to create FAQ', error: error.message });
    }
};

// Update FAQ
const updateFaq = async (req, res) => {
    try {
        const { keywords, response, language, category, isActive, priority } = req.body;

        const faq = await Faq.findByIdAndUpdate(
            req.params.id,
            {
                keywords,
                response,
                language,
                category,
                isActive,
                priority
            },
            { new: true, runValidators: true }
        );

        if (!faq) {
            return res.status(404).json({ message: 'FAQ not found' });
        }

        res.json(faq);
    } catch (error) {
        console.error('Error updating FAQ:', error);
        res.status(500).json({ message: 'Failed to update FAQ', error: error.message });
    }
};

// Delete FAQ
const deleteFaq = async (req, res) => {
    try {
        const faq = await Faq.findByIdAndDelete(req.params.id);

        if (!faq) {
            return res.status(404).json({ message: 'FAQ not found' });
        }

        res.json({ message: 'FAQ deleted successfully' });
    } catch (error) {
        console.error('Error deleting FAQ:', error);
        res.status(500).json({ message: 'Failed to delete FAQ', error: error.message });
    }
};

// Get active FAQs by category
const getFaqsByCategory = async (req, res) => {
    try {
        const { category } = req.params;

        const faqs = await Faq.find({
            category,
            isActive: true
        }).sort({ priority: -1 });

        res.json(faqs);
    } catch (error) {
        console.error('Error fetching FAQs by category:', error);
        res.status(500).json({ message: 'Failed to fetch FAQs', error: error.message });
    }
};

module.exports = {
    getAllFaqs,
    getFaqById,
    createFaq,
    updateFaq,
    deleteFaq,
    getFaqsByCategory
};
