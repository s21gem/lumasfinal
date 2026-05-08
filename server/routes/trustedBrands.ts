import { Router } from "express";
import { prisma } from "../db";
import { requireAuth } from "../middleware/auth";

const router = Router();

// GET all trusted brands (Public)
router.get("/", async (req, res) => {
  try {
    const brands = await prisma.trustedBrand.findMany({
      orderBy: { sortOrder: "asc" },
    });
    res.json(brands);
  } catch (error) {
    console.error("Error fetching trusted brands:", error);
    res.status(500).json({ error: "Failed to fetch trusted brands" });
  }
});

// GET single trusted brand
router.get("/:id", async (req, res) => {
  try {
    const brand = await prisma.trustedBrand.findUnique({
      where: { id: req.params.id },
    });
    if (!brand) return res.status(404).json({ error: "Brand not found" });
    res.json(brand);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch brand" });
  }
});

// POST new trusted brand (Protected)
router.post("/", requireAuth, async (req, res) => {
  try {
    const { name, logoUrl } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Brand name is required" });
    }

    const count = await prisma.trustedBrand.count();
    const brand = await prisma.trustedBrand.create({
      data: { name, logoUrl, sortOrder: count },
    });
    res.status(201).json(brand);
  } catch (error) {
    console.error("Error creating trusted brand:", error);
    res.status(500).json({ error: "Failed to create trusted brand" });
  }
});

// PUT update trusted brand (Protected)
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const { name, logoUrl, sortOrder } = req.body;
    const brand = await prisma.trustedBrand.update({
      where: { id: req.params.id },
      data: { name, logoUrl, sortOrder },
    });
    res.json(brand);
  } catch (error) {
    console.error("Error updating trusted brand:", error);
    res.status(500).json({ error: "Failed to update trusted brand" });
  }
});

// DELETE trusted brand (Protected)
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    await prisma.trustedBrand.delete({ where: { id: req.params.id } });
    res.json({ message: "Brand deleted" });
  } catch (error) {
    console.error("Error deleting trusted brand:", error);
    res.status(500).json({ error: "Failed to delete trusted brand" });
  }
});

export default router;
