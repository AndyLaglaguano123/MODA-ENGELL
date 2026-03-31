import express from "express";
import { optional } from "../middlewares/authMiddleware.js";
import { registerVisit, registerProductView } from "../controllers/analyticsController.js";

const router = express.Router();

router.post("/visit", optional, registerVisit);
router.post("/products/:id/view", optional, registerProductView);

export default router;
