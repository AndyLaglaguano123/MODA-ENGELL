import { query } from "../models/db.js";
import { ensureAppSchema } from "../models/schemaGuard.js";

export const registerVisit = async (req, res) => {
  try {
    await ensureAppSchema();

    const { session_id, page } = req.body;
    if (!session_id || !page) {
      return res.status(400).json({ message: "session_id y page son requeridos" });
    }

    await query(
      `INSERT INTO site_visits (session_id, page, user_id, visitor_name, visitor_email)
       VALUES (@sessionId, @page, @userId, @visitorName, @visitorEmail)`,
      {
        sessionId: session_id,
        page,
        userId: req.user?.id || null,
        visitorName: req.user?.name || null,
        visitorEmail: req.user?.email || null
      }
    );

    res.status(201).json({ message: "Visita registrada" });
  } catch (error) {
    console.error("Visit tracking error:", error);
    res.status(500).json({ message: "No se pudo registrar la visita" });
  }
};

export const registerProductView = async (req, res) => {
  try {
    await ensureAppSchema();

    const id = parseInt(req.params.id, 10);
    await query(
      "UPDATE products SET views_count = ISNULL(views_count, 0) + 1 WHERE id = @id AND active = 1",
      { id }
    );

    res.json({ message: "Vista registrada" });
  } catch (error) {
    console.error("Product view tracking error:", error);
    res.status(500).json({ message: "No se pudo registrar la vista del producto" });
  }
};
