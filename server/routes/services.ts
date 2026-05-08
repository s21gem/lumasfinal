import { Router } from "express";
import { prisma } from "../db";
import { requireAuth } from "../middleware/auth";

const router = Router();

// GET all services (Public)
router.get("/", async (req, res) => {
  try {
    const services = await prisma.service.findMany({
      orderBy: { sortOrder: "asc" },
    });
    res.json(services);
  } catch (error) {
    console.error("Error fetching services:", error);
    res.status(500).json({ error: "Failed to fetch services" });
  }
});

// GET single service
router.get("/:id", async (req, res) => {
  try {
    const service = await prisma.service.findUnique({
      where: { id: req.params.id },
    });
    if (!service) return res.status(404).json({ error: "Service not found" });
    res.json(service);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch service" });
  }
});

// POST new service (Protected)
router.post("/", requireAuth, async (req, res) => {
  try {
    const { title, description, iconIdentifier } = req.body;
    if (!title || !description) {
      return res.status(400).json({ error: "Title and description are required" });
    }

    const count = await prisma.service.count();
    const service = await prisma.service.create({
      data: { title, description, iconIdentifier, sortOrder: count },
    });
    res.status(201).json(service);
  } catch (error) {
    console.error("Error creating service:", error);
    res.status(500).json({ error: "Failed to create service" });
  }
});

// PUT update service (Protected)
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const { title, description, iconIdentifier, sortOrder } = req.body;
    const service = await prisma.service.update({
      where: { id: req.params.id },
      data: { title, description, iconIdentifier, sortOrder },
    });
    res.json(service);
  } catch (error) {
    console.error("Error updating service:", error);
    res.status(500).json({ error: "Failed to update service" });
  }
});

// DELETE service (Protected)
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    await prisma.service.delete({ where: { id: req.params.id } });
    res.json({ message: "Service deleted" });
  } catch (error) {
    console.error("Error deleting service:", error);
    res.status(500).json({ error: "Failed to delete service" });
  }
});

export default router;
