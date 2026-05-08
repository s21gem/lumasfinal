import { Router } from "express";
import { prisma } from "../db";
import { requireAuth } from "../middleware/auth";

const router = Router();

// GET /api/messages — Get all messages (Protected)
router.get("/", requireAuth, async (req, res) => {
  try {
    const messages = await prisma.message.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// PATCH /api/messages/:id — Mark message as read (Protected)
router.patch("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { isRead } = req.body;
    const message = await prisma.message.update({
      where: { id },
      data: { isRead },
    });
    res.json(message);
  } catch (error) {
    res.status(500).json({ error: "Failed to update message" });
  }
});

// DELETE /api/messages/:id — Delete a message (Protected)
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.message.delete({
      where: { id },
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete message" });
  }
});

export default router;
