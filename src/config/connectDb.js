const mongoose = require("mongoose");

async function connectDb() {
    try {
        const connect = await mongoose.connect(process.env.MONGO_URI);
        console.log(`Database connected successfully!`);
        return connect;
    } catch (error) {
        console.error("Database connection failed:", error.message);
        process.exit(1);
    }
}

module.exports = connectDb