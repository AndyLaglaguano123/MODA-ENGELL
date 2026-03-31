import express from "express";
import { withAuth } from "../middlewares/authMiddleware.js";
import {
  createOrder,
  getOrders,
  getOrder,
  cancelOrder,
  validateOrder
} from "../controllers/orderController.js";

const router = express.Router();

router.post("/", withAuth, validateOrder, createOrder);
router.get("/", withAuth, getOrders);
router.get("/:id", withAuth, getOrder);
router.delete("/:id", withAuth, cancelOrder);

export default router;
