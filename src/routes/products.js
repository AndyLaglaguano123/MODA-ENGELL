import express from "express";
import multer from "multer";
import { withAuth, optional, withRole } from "../middlewares/authMiddleware.js";
import {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  validateProduct
} from "../controllers/productController.js";

const upload = multer({ dest: "uploads/" });
const router = express.Router();

router.get("/", optional, listProducts);
router.get("/search", optional, searchProducts);
router.get("/:id", optional, getProduct);

router.post("/", withAuth, withRole("admin"), upload.single("image"), validateProduct, createProduct);
router.put("/:id", withAuth, withRole("admin"), upload.single("image"), validateProduct, updateProduct);
router.delete("/:id", withAuth, withRole("admin"), deleteProduct);

export default router;
