require("dotenv").config();
const transporter = require("./transporter");

const verificationMail = async (to, token) => {
  const frontendUrl = process.env.FRONTEND_URL

  const appName = "Healing Care";

  const verificationUrl = `${frontendUrl}/auth/verify/${token}`;

  const html = `
  <div style="font-family: Inter, Arial, sans-serif; background-color:#f8fafc; padding:40px 0;">
    <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.08);">
      
      <!-- Header -->
      <div style="background:#0284c7; padding:20px; text-align:center;">
        <h2 style="color:#ffffff; margin:0;">${appName}</h2>
      </div>

      <!-- Body -->
      <div style="padding:30px;">
        <h3 style="color:#0369a1; margin-top:0;">Verify Your Email Address</h3>

        <p style="color:#334155; line-height:1.6;">
          Thank you for registering with <strong>${appName}</strong>.
          Please confirm your email address by clicking the button below.
        </p>

        <!-- Button -->
        <div style="text-align:center; margin:30px 0;">
          <a
            href="${verificationUrl}"
            style="
              background:#0f766e;
              color:#ffffff;
              padding:14px 28px;
              text-decoration:none;
              border-radius:6px;
              font-weight:600;
              display:inline-block;
            "
          >
            Verify Email
          </a>
        </div>

        <p style="color:#64748b; font-size:14px;">
          If the button doesn’t work, copy and paste the following link into your browser:
        </p>

        <p style="word-break:break-all; font-size:14px;">
          <a href="${verificationUrl}" style="color:#0284c7;">
            ${verificationUrl}
          </a>
        </p>

        <p style="color:#64748b; font-size:14px; margin-top:30px;">
          If you didn’t create an account, you can safely ignore this email.
        </p>
      </div>

      <!-- Footer -->
      <div style="background:#f1f5f9; padding:15px; text-align:center;">
        <p style="margin:0; font-size:12px; color:#64748b;">
          &copy; ${new Date().getFullYear()} ${appName}. All rights reserved.
        </p>
      </div>

    </div>
  </div>
  `;

  const mailOptions = {
    to,
    subject: `Verify your email – ${appName}`,
    html,
    from: `"${appName}" <${process.env.SMTP_EMAIL}>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Verification email sent successfully!");
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}



const accountCreatedMail = async (to, { name, email, password }) => {
  const frontendUrl =
    process.env.FRONTEND_URL;
  const appName = "Healing Care";

  const loginUrl = `${frontendUrl}/auth/login`;

  const html = `
  <div style="font-family: Inter, Arial, sans-serif; background-color:#f8fafc; padding:40px 0;">
    <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.08);">
      
      <!-- Header -->
      <div style="background:#0284c7; padding:20px; text-align:center;">
        <h2 style="color:#ffffff; margin:0;">${appName}</h2>
      </div>

      <!-- Body -->
      <div style="padding:30px;">
        <h3 style="color:#0369a1; margin-top:0;">Account Created Successfully</h3>

        <p style="color:#334155; line-height:1.6;">
          Hello <strong>${name}</strong>,<br/>
          Your patient account has been created by the receptionist.
        </p>

        <div style="background:#f1f5f9; padding:15px; border-radius:6px; margin:20px 0;">
          <p style="margin:0 0 10px 0; color:#475569; font-size:14px;"><strong>Login Credentials:</strong></p>
          <p style="margin:0; font-family:monospace; color:#0f172a;">Email: ${email}</p>
          <p style="margin:0; font-family:monospace; color:#0f172a;">Password: ${password}</p>
        </div>

        <p style="color:#334155; line-height:1.6;">
          Please login securely using the button below. We recommend changing your password after your first login.
        </p>

        <!-- Button -->
        <div style="text-align:center; margin:30px 0;">
          <a
            href="${loginUrl}"
            style="
              background:#0f766e;
              color:#ffffff;
              padding:14px 28px;
              text-decoration:none;
              border-radius:6px;
              font-weight:600;
              display:inline-block;
            "
          >
            Login to Portal
          </a>
        </div>

        <p style="color:#64748b; font-size:14px; margin-top:30px;">
          If you have any questions, please contact the hospital administration.
        </p>
      </div>

      <!-- Footer -->
      <div style="background:#f1f5f9; padding:15px; text-align:center;">
        <p style="margin:0; font-size:12px; color:#64748b;">
          © ${new Date().getFullYear()} ${appName}. All rights reserved.
        </p>
      </div>

    </div>
  </div>
  `;

  const mailOptions = {
    to,
    subject: `Account Created – ${appName}`,
    html,
    from: `"${appName}" <${process.env.SMTP_EMAIL}>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Account created email sent successfully!");
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};

const verifyOTPMail = async (to, otp) => {
  const appName = "Healing Care";

  const html = `
    <div style="font-family: Inter, Arial, sans-serif; background-color:#f8fafc; padding:40px 0;">
      <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.08);">
        
        <div style="background:#0284c7; padding:20px; text-align:center;">
          <h2 style="color:#ffffff; margin:0;">${appName}</h2>
        </div>

        <div style="padding:30px; text-align:center;">
          <h3 style="color:#0369a1; margin-top:0;">Your Login OTP</h3>
          <p style="color:#334155;">Enter the following One-Time Password to access your account:</p>
          
          <div style="background:#f1f5f9; padding:20px; border-radius:8px; margin:20px 0; display:inline-block;">
            <h1 style="color:#0f172a; margin:0; letter-spacing:8px; font-weight:700;">${otp}</h1>
          </div>

          <p style="color:#64748b; font-size:14px;">This OTP is valid for 5 minutes. Do not share it with anyone.</p>
        </div>

        <div style="background:#f1f5f9; padding:15px; text-align:center;">
          <p style="margin:0; font-size:12px; color:#64748b;">
            &copy; ${new Date().getFullYear()} ${appName}. Login Verification.
          </p>
        </div>

      </div>
    </div>
    `;

  try {
    console.log("📧 Sending OTP email...");
    console.log("  To:", to);
    console.log("  From:", process.env.SMTP_EMAIL);
    console.log("  OTP:", otp);

    await transporter.sendMail({
      to,
      subject: `Your Login OTP – ${appName}`,
      html,
      from: `"${appName}" <${process.env.SMTP_EMAIL}>`,
    });

    console.log(`✅ OTP email sent successfully to ${to}`);
    return true;
  } catch (error) {
    console.error("❌ Error sending OTP email:");
    console.error("  Error type:", error.name);
    console.error("  Error message:", error.message);
    console.error("  Error code:", error.code);
    if (error.response) {
      console.error("  SMTP Response:", error.response);
    }
    console.error("  Full error:", error);
    return false;
  }
};

module.exports = { verificationMail, accountCreatedMail, verifyOTPMail };


