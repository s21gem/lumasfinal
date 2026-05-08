import { Router } from "express";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/test-token", requireAuth, (req, res) => {
  res.json({ message: "Token is valid", user: req.user });
});

export default router;
