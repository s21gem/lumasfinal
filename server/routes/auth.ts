import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../db";
import { sendOTP } from "../utils/email";
import { requireAuth } from "../middleware/auth";

const router = Router();
const otps = new Map<string, { code: string; expires: number }>();

// Login Route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const secret = process.env.JWT_SECRET || "supersecretjwtkey";

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    
    // For demo purposes, if no user exists, create the first admin user
    if (!user) {
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
        },
      });
      
      const token = jwt.sign({ id: newUser.id, email: newUser.email }, secret, {
        expiresIn: "7d",
      });
      
      return res.json({ token, user: { id: newUser.id, email: newUser.email } });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate token
    const token = jwt.sign({ id: user.id, email: user.email }, secret, {
      expiresIn: "7d",
    });

    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Request OTP to change credentials
router.post("/request-otp", requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: (req as any).user.id } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otps.set(user.id, { code: otp, expires: Date.now() + 10 * 60 * 1000 }); // 10 mins

    await sendOTP(user.email, otp);
    res.json({ message: "OTP sent to your email" });
  } catch (error) {
    console.error("OTP Error:", error);
    res.status(500).json({ error: "Failed to send OTP. Check SMTP settings." });
  }
});

// Verify and Update Credentials (Direct update for now without SMTP)
router.put("/update-credentials", requireAuth, async (req, res) => {
  try {
    const { newEmail, newPassword } = req.body;
    const userId = (req as any).user.id;

    if (!newEmail && !newPassword) {
      return res.status(400).json({ error: "No changes provided" });
    }

    const updateData: any = {};
    if (newEmail) updateData.email = newEmail;
    if (newPassword) updateData.password = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: updateData
    });

    res.json({ message: "Credentials updated successfully" });
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ error: "Failed to update credentials" });
  }
});

export default router;
