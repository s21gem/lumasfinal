import express from "express";
import { prisma } from "../db";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const [
      settings,
      projects,
      teamMembers,
      services,
      processSteps,
      testimonials,
      trustedBrands
    ] = await Promise.all([
      prisma.settings.findUnique({ where: { id: "global" } }),
      prisma.project.findMany({ orderBy: { sortOrder: 'asc' } }),
      prisma.teamMember.findMany({ orderBy: { sortOrder: 'asc' } }),
      prisma.service.findMany({ orderBy: { sortOrder: 'asc' } }),
      prisma.processStep.findMany({ orderBy: { sortOrder: 'asc' } }),
      prisma.testimonial.findMany({ orderBy: { sortOrder: 'asc' } }),
      prisma.trustedBrand.findMany({ orderBy: { sortOrder: 'asc' } })
    ]);

    res.json({
      settings,
      projects,
      teamMembers,
      services,
      processSteps,
      testimonials,
      trustedBrands
    });
  } catch (error) {
    console.error("Error fetching initialization data:", error);
    res.status(500).json({ error: "Failed to fetch initialization data" });
  }
});

export default router;
