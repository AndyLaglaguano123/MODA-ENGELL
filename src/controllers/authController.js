import { query } from "../models/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import { ensureAppSchema } from "../models/schemaGuard.js";

const saltRounds = 10;

export const validateRegister = [
  body("name").trim().notEmpty().withMessage("Nombre requerido"),
  body("email").isEmail().withMessage("Email invalido"),
  body("password").isLength({ min: 6 }).withMessage("Password minimo 6 caracteres")
];

export const validateLogin = [
  body("email").isEmail().withMessage("Email invalido"),
  body("password").notEmpty().withMessage("Password requerido")
];

export const register = async (req, res) => {
  try {
    await ensureAppSchema();

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    const rows = await query("SELECT id FROM users WHERE email = @email", { email });
    if (rows.length > 0) {
      return res.status(400).json({ message: "Email ya registrado" });
    }

    const hash = await bcrypt.hash(password, saltRounds);
    await query(
      "INSERT INTO users (name, email, password, role) VALUES (@name, @email, @password, @role)",
      { name, email, password: hash, role: "customer" }
    );

    const userRows = await query(
      "SELECT TOP 1 id, name, email, role FROM users WHERE email = @email ORDER BY id DESC",
      { email }
    );

    const user = userRows[0];
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    res.status(201).json({
      message: "Usuario registrado exitosamente",
      token,
      user
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const login = async (req, res) => {
  try {
    await ensureAppSchema();

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const rows = await query(
      "SELECT id, password, name, email, role FROM users WHERE email = @email",
      { email }
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Credenciales invalidas" });
    }

    const user = rows[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ message: "Credenciales invalidas" });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const getProfile = async (req, res) => {
  try {
    await ensureAppSchema();

    const rows = await query(
      "SELECT id, name, email, role, created_at FROM users WHERE id = @id",
      { id: req.user.id }
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    await ensureAppSchema();

    const id = parseInt(req.params.id, 10);
    const { role } = req.body;
    if (!["customer", "admin"].includes(role)) {
      return res.status(400).json({ message: "Rol invalido" });
    }

    const rows = await query("SELECT id FROM users WHERE id = @id", { id });
    if (rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    await query("UPDATE users SET role = @role WHERE id = @id", { role, id });
    res.json({ message: "Rol actualizado correctamente" });
  } catch (error) {
    console.error("Update role error:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
