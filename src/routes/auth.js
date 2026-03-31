import express from "express";
import { register, login, getProfile, updateUserRole, validateRegister, validateLogin } from "../controllers/authController.js";
import { withAuth, withRole } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);
router.get("/validate", withAuth, (req, res) => {
  res.json({ message: "Token valido", user: req.user });
});
router.get("/profile", withAuth, getProfile);
router.put("/users/:id/role", withAuth, withRole("admin"), updateUserRole);

export default router;
