import { Router } from "express";
import { prisma } from "../db";
import { requireAuth } from "../middleware/auth";

const router = Router();

// GET all process steps (Public)
router.get("/", async (req, res) => {
  try {
    const steps = await prisma.processStep.findMany({
      orderBy: { sortOrder: "asc" },
    });
    res.json(steps);
  } catch (error) {
    console.error("Error fetching process steps:", error);
    res.status(500).json({ error: "Failed to fetch process steps" });
  }
});

// GET single process step
router.get("/:id", async (req, res) => {
  try {
    const step = await prisma.processStep.findUnique({
      where: { id: req.params.id },
    });
    if (!step) return res.status(404).json({ error: "Process step not found" });
    res.json(step);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch process step" });
  }
});

// POST new process step (Protected)
router.post("/", requireAuth, async (req, res) => {
  try {
    const { number, title, description, iconIdentifier } = req.body;
    if (!number || !title || !description) {
      return res.status(400).json({ error: "Number, title, and description are required" });
    }

    const count = await prisma.processStep.count();
    const step = await prisma.processStep.create({
      data: { number, title, description, iconIdentifier, sortOrder: count },
    });
    res.status(201).json(step);
  } catch (error) {
    console.error("Error creating process step:", error);
    res.status(500).json({ error: "Failed to create process step" });
  }
});

// PUT update process step (Protected)
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const { number, title, description, iconIdentifier, sortOrder } = req.body;
    const step = await prisma.processStep.update({
      where: { id: req.params.id },
      data: { number, title, description, iconIdentifier, sortOrder },
    });
    res.json(step);
  } catch (error) {
    console.error("Error updating process step:", error);
    res.status(500).json({ error: "Failed to update process step" });
  }
});

// DELETE process step (Protected)
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    await prisma.processStep.delete({ where: { id: req.params.id } });
    res.json({ message: "Process step deleted" });
  } catch (error) {
    console.error("Error deleting process step:", error);
    res.status(500).json({ error: "Failed to delete process step" });
  }
});

export default router;
