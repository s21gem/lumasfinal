import { Router } from "express";
import { prisma } from "../db";
import { requireAuth } from "../middleware/auth";

const router = Router();

// GET testimonials with pagination (Public)
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 2;
    const skip = (page - 1) * limit;

    const [testimonials, total] = await Promise.all([
      prisma.testimonial.findMany({
        orderBy: { sortOrder: "asc" },
        skip,
        take: limit,
      }),
      prisma.testimonial.count(),
    ]);

    res.json({
      testimonials,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    res.status(500).json({ error: "Failed to fetch testimonials" });
  }
});

// GET all testimonials without pagination (for admin)
router.get("/all", async (req, res) => {
  try {
    const testimonials = await prisma.testimonial.findMany({
      orderBy: { sortOrder: "asc" },
    });
    res.json(testimonials);
  } catch (error) {
    console.error("Error fetching all testimonials:", error);
    res.status(500).json({ error: "Failed to fetch testimonials" });
  }
});

// GET single testimonial
router.get("/:id", async (req, res) => {
  try {
    const testimonial = await prisma.testimonial.findUnique({
      where: { id: req.params.id },
    });
    if (!testimonial) return res.status(404).json({ error: "Testimonial not found" });
    res.json(testimonial);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch testimonial" });
  }
});

// POST new testimonial (Protected)
router.post("/", requireAuth, async (req, res) => {
  try {
    const { clientName, role, company, quote, videoUrl, imageUrl, ytSubscribers, ytViews, igFollowers, fbFollowers, tiktokFollowers } = req.body;
    if (!clientName || !quote) {
      return res.status(400).json({ error: "Client name and quote are required" });
    }

    const count = await prisma.testimonial.count();
    const testimonial = await prisma.testimonial.create({
      data: { clientName, role, company, quote, videoUrl, imageUrl, ytSubscribers, ytViews, igFollowers, fbFollowers, tiktokFollowers, sortOrder: count },
    });
    res.status(201).json(testimonial);
  } catch (error) {
    console.error("Error creating testimonial:", error);
    res.status(500).json({ error: "Failed to create testimonial" });
  }
});

// PUT update testimonial (Protected)
router.put("/:id", requireAuth, async (req, res) => {
  if (req.params.id === "reorder") {
    try {
      const { items } = req.body;
      await prisma.$transaction(
        items.map((item: any) =>
          prisma.testimonial.update({
            where: { id: item.id },
            data: { sortOrder: item.sortOrder },
          })
        )
      );
      return res.json({ message: "Testimonials reordered" });
    } catch (error) {
      console.error("Error reordering testimonials:", error);
      return res.status(500).json({ error: "Failed to reorder testimonials" });
    }
  }

  try {
    const { clientName, role, company, quote, videoUrl, imageUrl, sortOrder, ytSubscribers, ytViews, igFollowers, fbFollowers, tiktokFollowers } = req.body;
    const testimonial = await prisma.testimonial.update({
      where: { id: req.params.id },
      data: { clientName, role, company, quote, videoUrl, imageUrl, sortOrder, ytSubscribers, ytViews, igFollowers, fbFollowers, tiktokFollowers },
    });
    res.json(testimonial);
  } catch (error) {
    console.error("Error updating testimonial:", error);
    res.status(500).json({ error: "Failed to update testimonial" });
  }
});

// DELETE testimonial (Protected)
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    await prisma.testimonial.delete({ where: { id: req.params.id } });
    res.json({ message: "Testimonial deleted" });
  } catch (error) {
    console.error("Error deleting testimonial:", error);
    res.status(500).json({ error: "Failed to delete testimonial" });
  }
});

export default router;
