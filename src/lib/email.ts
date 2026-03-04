import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendBillNotification(
  toEmail: string,
  userName: string,
  billType: string,
  amount: number,
  roomName: string,
  description?: string
) {
  // Skip if SMTP is not configured
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(
      `[Email] SMTP not configured. Would send to ${toEmail}: New ${billType} bill of ₹${amount}`
    );
    return;
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.SMTP_USER || "noreply@pgmanagement.com",
    to: toEmail,
    subject: `New ${billType} Bill Added - ₹${amount.toFixed(2)}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e40af;">PG Management - New Bill Added</h2>
        <p>Hi ${userName},</p>
        <p>A new <strong>${billType}</strong> bill has been added to your account.</p>
        <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p><strong>Room:</strong> ${roomName}</p>
          <p><strong>Bill Type:</strong> ${billType}</p>
          <p><strong>Your Share:</strong> ₹${amount.toFixed(2)}</p>
          ${description ? `<p><strong>Description:</strong> ${description}</p>` : ""}
        </div>
        <p>Please log in to view details and make payment.</p>
        <p style="color: #6b7280; font-size: 12px;">This is an automated notification from PG Management System.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`[Email] Bill notification sent to ${toEmail}`);
  } catch (error) {
    console.error(`[Email] Failed to send notification to ${toEmail}:`, error);
  }
}
