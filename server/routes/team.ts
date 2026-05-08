import express from "express";
import { prisma } from "../db";
import { requireAuth } from "../middleware/auth";

const router = express.Router();

// Get all team members
router.get("/", async (req, res) => {
  try {
    const teamMembers = await prisma.teamMember.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(teamMembers);
  } catch (error) {
    console.error("Error fetching team members:", error);
    res.status(500).json({ error: "Failed to fetch team members" });
  }
});

// Get a single team member
router.get("/:id", async (req, res) => {
  try {
    const teamMember = await prisma.teamMember.findUnique({
      where: { id: req.params.id },
    });
    if (!teamMember) {
      return res.status(404).json({ error: "Team member not found" });
    }
    res.json(teamMember);
  } catch (error) {
    console.error("Error fetching team member:", error);
    res.status(500).json({ error: "Failed to fetch team member" });
  }
});

// Create a new team member
router.post("/", requireAuth, async (req, res) => {
  try {
    const { name, role, imageUrl } = req.body;
    const teamMember = await prisma.teamMember.create({
      data: {
        name,
        role,
        imageUrl,
      },
    });
    res.status(201).json(teamMember);
  } catch (error) {
    console.error("Error creating team member:", error);
    res.status(500).json({ error: "Failed to create team member" });
  }
});

// Update a team member
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const { name, role, imageUrl } = req.body;
    const teamMember = await prisma.teamMember.update({
      where: { id: req.params.id },
      data: {
        name,
        role,
        imageUrl,
      },
    });
    res.json(teamMember);
  } catch (error) {
    console.error("Error updating team member:", error);
    res.status(500).json({ error: "Failed to update team member" });
  }
});

// Delete a team member
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    await prisma.teamMember.delete({
      where: { id: req.params.id },
    });
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting team member:", error);
    res.status(500).json({ error: "Failed to delete team member" });
  }
});

export default router;
