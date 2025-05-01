import nodemailer from "nodemailer";

interface SendAnnouncementNotificationEmailParams {
  to: string;
  subject: string;
  message: string;
}

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  secure: process.env.EMAIL_SERVER_SECURE === "true", // false for port 587
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

export async function sendAnnouncementNotificationEmail({
  to,
  subject,
  message,
}: SendAnnouncementNotificationEmailParams): Promise<void> {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; font-size: 16px; line-height: 1.6;">
          <h2>${subject}</h2>
          <p>${message}</p>
        </div>
      `,
    });

    console.log(`✅ Announcement email sent to ${to}`);
  } catch (error) {
    console.error("❌ Failed to send email:", error);
    throw new Error("Email sending failed");
  }
}
