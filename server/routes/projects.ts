import { Router } from "express";
import { prisma } from "../db";
import { requireAuth } from "../middleware/auth";

const router = Router();

// GET all projects (Public)
router.get("/", async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

// GET projects by category (Public)
router.get("/category/:category", async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: { category: req.params.category },
      orderBy: { createdAt: "desc" },
    });
    res.json(projects);
  } catch (error) {
    console.error("Error fetching projects by category:", error);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

// GET single project (Public)
router.get("/:id", async (req, res) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
    });
    if (!project) return res.status(404).json({ error: "Project not found" });
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch project" });
  }
});

// POST new project (Protected)
router.post("/", requireAuth, async (req, res) => {
  try {
    const { title, category, videoUrl, thumbnailUrl, clientName, shortDescription, results, contentType } = req.body;
    
    if (!title || !category) {
      return res.status(400).json({ error: "Title and category are required" });
    }

    const project = await prisma.project.create({
      data: {
        title,
        category,
        videoUrl,
        thumbnailUrl,
        clientName,
        shortDescription,
        results,
        contentType: contentType || "video",
      },
    });
    
    res.status(201).json(project);
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ error: "Failed to create project" });
  }
});

// PUT update project (Protected)
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const { title, category, videoUrl, thumbnailUrl, clientName, shortDescription, results, contentType } = req.body;
    
    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: {
        title,
        category,
        videoUrl,
        thumbnailUrl,
        clientName,
        shortDescription,
        results,
        contentType,
      },
    });
    
    res.json(project);
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ error: "Failed to update project" });
  }
});

// DELETE project (Protected)
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    await prisma.project.delete({
      where: { id: req.params.id },
    });
    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ error: "Failed to delete project" });
  }
});

export default router;
