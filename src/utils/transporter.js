const nodemailer = require("nodemailer");

// Validate environment variables
if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASS) {
  console.error("❌ CRITICAL: SMTP_EMAIL or SMTP_PASS not configured!");
  console.error("Please set these environment variables in your deployment platform.");
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASS,
  },
  // Additional options for better reliability
  pool: true,
  maxConnections: 1,
  rateDelta: 20000,
  rateLimit: 5,
});

// Verify transporter configuration on startup
transporter.verify(function (error, success) {
  if (error) {
    console.error("❌ Email transporter verification failed:", error.message);
    console.error("Please check your SMTP credentials and configuration.");
  } else {
    console.log("✅ Email server is ready to send messages");
  }
});

module.exports = transporter;
