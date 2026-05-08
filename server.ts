import express from "express";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

// Load environment variables before importing routes
dotenv.config();

import authRoutes from "./server/routes/auth";
import projectsRoutes from "./server/routes/projects";
import teamRoutes from "./server/routes/team";
import settingsRoutes from "./server/routes/settings";
import servicesRoutes from "./server/routes/services";
import processRoutes from "./server/routes/process";
import testimonialsRoutes from "./server/routes/testimonials";
import trustedBrandsRoutes from "./server/routes/trustedBrands";
import contactRoutes from "./server/routes/contact";
import uploadRoutes from "./server/routes/upload";
import messagesRoutes from "./server/routes/messages";

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || "3000");

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // API Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/projects", projectsRoutes);
  app.use("/api/team", teamRoutes);
  app.use("/api/settings", settingsRoutes);
  app.use("/api/services", servicesRoutes);
  app.use("/api/process", processRoutes);
  app.use("/api/testimonials", testimonialsRoutes);
  app.use("/api/trusted-brands", trustedBrandsRoutes);
  app.use("/api/contact", contactRoutes);
  app.use("/api/upload", uploadRoutes);
  app.use("/api/messages", messagesRoutes);

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile("index.html", { root: "dist" });
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
