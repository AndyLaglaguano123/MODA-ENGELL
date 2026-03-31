import express from "express";
import { withAuth, withRole } from "../middlewares/authMiddleware.js";
import {
  getAdminSummary,
  listUsers,
  listAdminOrders,
  updateOrderStatus
} from "../controllers/adminController.js";
import { updateUserRole } from "../controllers/authController.js";

const router = express.Router();

router.use(withAuth, withRole("admin"));

router.get("/summary", getAdminSummary);
router.get("/users", listUsers);
router.put("/users/:id/role", updateUserRole);
router.get("/orders", listAdminOrders);
router.put("/orders/:id/status", updateOrderStatus);

export default router;
