import express from "express";
import { prisma } from "../db";
import { requireAuth } from "../middleware/auth";

const router = express.Router();

// Get settings
router.get("/", async (req, res) => {
  try {
    let settings = await prisma.settings.findUnique({
      where: { id: "global" },
    });

    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          id: "global",
          teamCarouselDistance: 380,
          heroSubtitle: "From Idea to Conversion — Turning Creativity into Growth.",
          heroTitle: "Small in size,",
          heroTitleHighlight: "Big in impact.",
          heroDescription: "Creative Production and Post-production Studio helping brands with Commercial | Documentary | Podcast | VFX | Animation",
          heroVideoUrl: "https://videos.pexels.com/video-files/3121459/3121459-uhd_2560_1440_24fps.mp4",
          phone: "+1 (555) 123-4567",
          email: "hello@lumascreative.com",
          address: "123 Creative Blvd, Suite 400",
          city: "Los Angeles, CA 90015",
          footerTagline: "A creative production and post-production studio helping brands turn ideas into conversion-driven assets.",
          copyrightText: "Lumas Creative Studio",
          siteTitle: "Lumas Creative Studio",
          siteDescription: "Creative Production and Post-production Studio",
          trustedBrandsGrayscale: true,
          trustedBrandsMarqueeSpeed: 40,
        },
      });
    }

    res.json(settings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({ error: "Failed to fetch settings" });
  }
});

// Update settings
router.put("/", requireAuth, async (req, res) => {
  try {
    const {
      // Hero
      heroSubtitle,
      heroTitle,
      heroTitleHighlight,
      heroDescription,
      heroVideoUrl,
      heroPosterUrl,
      // Logo
      logoLightUrl,
      logoDarkUrl,
      // Contact
      phone,
      email,
      whatsappNumber,
      calendlyUrl,
      address,
      city,
      // Social
      instagramUrl,
      twitterUrl,
      linkedinUrl,
      youtubeUrl,
      // Team
      teamCarouselDistance,
      // Footer
      footerTagline,
      copyrightText,
      // SEO
      siteTitle,
      siteDescription,
      faviconUrl,
      // Brands
      trustedBrandsGrayscale,
      trustedBrandsMarqueeSpeed,
    } = req.body;

    const updateData: any = {};

    // Only include fields that are explicitly provided
    if (heroSubtitle !== undefined) updateData.heroSubtitle = heroSubtitle;
    if (heroTitle !== undefined) updateData.heroTitle = heroTitle;
    if (heroTitleHighlight !== undefined) updateData.heroTitleHighlight = heroTitleHighlight;
    if (heroDescription !== undefined) updateData.heroDescription = heroDescription;
    if (heroVideoUrl !== undefined) updateData.heroVideoUrl = heroVideoUrl;
    if (heroPosterUrl !== undefined) updateData.heroPosterUrl = heroPosterUrl;
    if (logoLightUrl !== undefined) updateData.logoLightUrl = logoLightUrl;
    if (logoDarkUrl !== undefined) updateData.logoDarkUrl = logoDarkUrl;
    if (faviconUrl !== undefined) updateData.faviconUrl = faviconUrl;
    if (phone !== undefined) updateData.phone = phone;
    if (email !== undefined) updateData.email = email;
    if (whatsappNumber !== undefined) updateData.whatsappNumber = whatsappNumber;
    if (calendlyUrl !== undefined) updateData.calendlyUrl = calendlyUrl;
    if (address !== undefined) updateData.address = address;
    if (city !== undefined) updateData.city = city;
    if (instagramUrl !== undefined) updateData.instagramUrl = instagramUrl;
    if (twitterUrl !== undefined) updateData.twitterUrl = twitterUrl;
    if (linkedinUrl !== undefined) updateData.linkedinUrl = linkedinUrl;
    if (youtubeUrl !== undefined) updateData.youtubeUrl = youtubeUrl;
    if (teamCarouselDistance !== undefined) updateData.teamCarouselDistance = teamCarouselDistance;
    if (footerTagline !== undefined) updateData.footerTagline = footerTagline;
    if (copyrightText !== undefined) updateData.copyrightText = copyrightText;
    if (siteTitle !== undefined) updateData.siteTitle = siteTitle;
    if (siteDescription !== undefined) updateData.siteDescription = siteDescription;
    if (trustedBrandsGrayscale !== undefined) updateData.trustedBrandsGrayscale = trustedBrandsGrayscale;

    const settings = await prisma.settings.upsert({
      where: { id: "global" },
      update: updateData,
      create: {
        id: "global",
        teamCarouselDistance: teamCarouselDistance ?? 380,
        ...updateData,
      },
    });

    res.json(settings);
  } catch (error) {
    console.error("Error updating settings:", error);
    res.status(500).json({ error: "Failed to update settings" });
  }
});

export default router;
