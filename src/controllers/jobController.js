const Job = require('../models/jobSchema');

const getAllJobs = async (req, res) => {
    try {
        const jobs = await Job.find({ isOpen: true }).sort({ postedAt: -1 });
        res.status(200).json({
            success: true,
            jobs
        });
    } catch (error) {
        console.error("Error fetching jobs:", error);
        res.status(500).json({ message: "Server error" });
    }
};

const createJob = async (req, res) => {
    try {
        const { title, type, location, department, description, requirements } = req.body;

        if (!title || !type || !location) {
            return res.status(400).json({ message: "Title, Type, and Location are required." });
        }

        const job = await Job.create({
            title,
            type,
            location,
            department,
            description,
            requirements
        });

        res.status(201).json({
            success: true,
            message: "Job position created successfully",
            job
        });
    } catch (error) {
        console.error("Error creating job:", error);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = {
    getAllJobs,
    createJob
};
