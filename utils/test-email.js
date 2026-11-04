const nodemailer = require("nodemailer");

async function sendLoginEmail({ success, errorMessage = "" }) {
  const requiredVariables = [
    "SMTP_HOST",
    "SMTP_PORT",
    "SMTP_USERNAME",
    "SMTP_PASSWORD",
    "ALERT_TO",
  ];

  for (const variable of requiredVariables) {
    if (!process.env[variable]) {
      throw new Error(`${variable} is missing from the environment variables.`);
    }
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USERNAME.trim(),
      pass: process.env.SMTP_PASSWORD.replace(/\s/g, ""),
    },
  });

  const status = success ? "SUCCESS" : "FAILED";

  const mailOptions = {
    from: process.env.ALERT_FROM || process.env.SMTP_USERNAME,
    to: process.env.ALERT_TO,
    subject: `EduEmissary Login Check: ${status}`,
    text: `
EduEmissary Login Monitoring Report

Status: ${status}
Website: ${process.env.LOGIN_URL || "Not configured"}
Date: ${new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
    })}

${
  success
    ? "EduEmissary login was successful."
    : `EduEmissary login failed.\nError: ${errorMessage}`
}

This is an automated notification from your Playwright monitoring project.
    `,
  };

  const info = await transporter.sendMail(mailOptions);

  console.log("Email notification sent successfully.");
  console.log("Message ID:", info.messageId);
}

module.exports = { sendLoginEmail };
