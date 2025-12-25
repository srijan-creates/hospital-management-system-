const nodemailer = require("nodemailer");

const transporter = async () => {
  try {
    return await nodemailer.createTransport({
      service: "gmail",
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASS, 
      },
    });
  } catch (error) {
    console.error("Error creating transporter:", error);
    throw error; 
  }
};

module.exports = transporter;
