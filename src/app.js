import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { connect, testConnection } from "./models/db.js";
import { ensureAppSchema } from "./models/schemaGuard.js";
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import orderRoutes from "./routes/orders.js";
import adminRoutes from "./routes/admin.js";
import analyticsRoutes from "./routes/analytics.js";

dotenv.config();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDistPath = path.join(__dirname, "..", "frontend", "dist");

app.use(cors());
app.use(express.json({ limit: "12mb" }));
app.use(express.urlencoded({ extended: true, limit: "12mb" }));
app.use(express.static(frontendDistPath));

await connect().catch((err) => {
  console.warn("No se pudo conectar al pool de SQL Server");
  console.warn(`  ${err.message}`);
});

await testConnection().catch((err) => {
  console.warn("SQL Server no disponible. El servidor seguira activo sin BD.");
  console.warn("  Para activar la base, inicia SQL Server y ejecuta 'npm run init-db'.");
  console.warn(`  ${err.message}`);
});

await ensureAppSchema().catch((err) => {
  console.warn("No se pudo verificar el esquema extendido de Moda Engell.");
  console.warn(`  ${err.message}`);
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/analytics", analyticsRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "API Moda Engell online" });
});

app.get("/api/dbcheck", async (req, res) => {
  try {
    await testConnection();
    res.json({ status: "SQL Server conectado", database: "Moda Engell DB" });
  } catch (err) {
    res.status(500).json({ status: "SQL Server no disponible", error: err.message });
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(frontendDistPath, "index.html"));
});

app.use((req, res, next) => {
  if (!req.path.startsWith("/api")) {
    res.sendFile(path.join(frontendDistPath, "index.html"));
    return;
  }
  next();
});

app.use((req, res) => {
  res.status(404).json({ message: "Ruta API no encontrada" });
});

app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ message: err.message || "Error interno del servidor" });
});

const PORT = parseInt(process.env.PORT, 10) || 3000;
const server = app.listen(PORT, () => {
  const actualPort = server.address().port;
  console.log(`Servidor Moda Engell corriendo en http://localhost:${actualPort}`);
  console.log(`Health check en http://localhost:${actualPort}/api/health`);
});

server.on("error", (err) => {
  if (err.code === "EACCES") {
    console.error(`No tienes permisos para usar el puerto ${PORT}`);
  } else if (err.code === "EADDRINUSE") {
    console.error(`El puerto ${PORT} ya esta en uso`);
  } else {
    console.error("Error en el servidor:", err);
  }
  process.exit(1);
});

export default app;
