import { Router } from "express";
import nodemailer from "nodemailer";
import { prisma } from "../db";
import { emitEvent } from "../socket";

const router = Router();

// POST /api/contact — Send contact form email
router.post("/", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: "Name, email, and message are required" });
    }

    // 1. Save to Database (this is the primary action)
    const newMessage = await prisma.message.create({
      data: {
        name,
        email,
        message,
      },
    });

    // 2. Send success response immediately — don't wait for email
    res.json({ 
      success: true, 
      message: "Message received! We'll get back to you soon." 
    });

    // 3. Emit Realtime Update
    emitEvent("new_message", newMessage);

    // 4. Try to send email notification in the background (best-effort, non-blocking)
    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (
      !smtpHost || !smtpUser || !smtpPass ||
      smtpUser.includes("your-email") || smtpPass.includes("your-app-password")
    ) {
      console.warn("SMTP not configured or using placeholder credentials. Skipping email.");
      return;
    }

    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_PORT === "465",
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      const receiverEmail = process.env.CONTACT_RECEIVER_EMAIL || smtpUser;

      await transporter.sendMail({
        from: `"Lumas Portfolio" <${smtpUser}>`,
        to: receiverEmail,
        replyTo: email,
        subject: `New Contact Form: ${name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #0891b2; border-bottom: 2px solid #0891b2; padding-bottom: 10px;">
              New Contact Form Submission
            </h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 12px 0; font-weight: bold; color: #666; width: 100px;">Name:</td>
                <td style="padding: 12px 0;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; font-weight: bold; color: #666;">Email:</td>
                <td style="padding: 12px 0;"><a href="mailto:${email}">${email}</a></td>
              </tr>
            </table>
            <div style="margin-top: 20px; padding: 20px; background: #f8f9fa; border-radius: 8px;">
              <h3 style="margin-top: 0; color: #333;">Message:</h3>
              <p style="color: #555; line-height: 1.6; white-space: pre-wrap;">${message}</p>
            </div>
            <p style="margin-top: 20px; font-size: 12px; color: #999;">
              This email was sent from the Lumas Portfolio contact form.
            </p>
          </div>
        `,
      });
      console.log("Contact form email sent successfully.");
    } catch (emailError: any) {
      console.error("SMTP email failed (message was still saved):", emailError.message);
    }
  } catch (error: any) {
    console.error("Contact form error:", error);
    res.status(500).json({ error: "Failed to send message. Please try again later." });
  }
});

export default router;
