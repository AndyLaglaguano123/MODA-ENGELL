import { query } from "../models/db.js";
import { ensureAppSchema } from "../models/schemaGuard.js";

export const getAdminSummary = async (req, res) => {
  try {
    await ensureAppSchema();

    const [metrics] = await query(`
      SELECT
        (SELECT COUNT(*) FROM users) AS total_users,
        (SELECT COUNT(*) FROM users WHERE role = 'customer') AS total_customers,
        (SELECT COUNT(*) FROM products WHERE active = 1) AS total_products,
        (SELECT COUNT(*) FROM orders) AS total_orders,
        (SELECT COUNT(*) FROM orders WHERE status = 'pending') AS pending_orders,
        (SELECT COUNT(*) FROM site_visits) AS total_visits,
        (SELECT COUNT(DISTINCT session_id) FROM site_visits) AS unique_visitors,
        ISNULL((SELECT SUM(total_amount) FROM orders WHERE status <> 'cancelled'), 0) AS revenue
    `);

    const recentUsers = await query(`
      SELECT TOP 8 id, name, email, role, created_at
      FROM users
      ORDER BY created_at DESC
    `);

    const topProducts = await query(`
      SELECT TOP 8 id, name, price, stock, image_url, ISNULL(views_count, 0) AS views_count
      FROM products
      WHERE active = 1
      ORDER BY ISNULL(views_count, 0) DESC, created_at DESC
    `);

    const recentVisits = await query(`
      SELECT TOP 12 id, session_id, page, user_id, visitor_name, visitor_email, created_at
      FROM site_visits
      ORDER BY created_at DESC
    `);

    const recentOrders = await query(`
      SELECT TOP 10
        o.id,
        o.total_amount,
        o.status,
        o.payment_method,
        o.payment_status,
        o.created_at,
        u.name AS customer_name,
        u.email AS customer_email
      FROM orders o
      INNER JOIN users u ON u.id = o.user_id
      ORDER BY o.created_at DESC
    `);

    res.json({
      metrics: metrics || {},
      recent_users: recentUsers,
      top_products: topProducts,
      recent_visits: recentVisits,
      recent_orders: recentOrders
    });
  } catch (error) {
    console.error("Admin summary error:", error);
    res.status(500).json({ message: "No se pudo cargar el resumen administrativo" });
  }
};

export const listUsers = async (req, res) => {
  try {
    await ensureAppSchema();

    const rows = await query(`
      SELECT id, name, email, role, created_at
      FROM users
      ORDER BY created_at DESC
    `);

    res.json(rows);
  } catch (error) {
    console.error("List users error:", error);
    res.status(500).json({ message: "No se pudieron cargar los usuarios" });
  }
};

export const listAdminOrders = async (req, res) => {
  try {
    await ensureAppSchema();

    const rows = await query(`
      SELECT
        o.id,
        o.total_amount,
        o.status,
        o.payment_method,
        o.payment_status,
        o.shipping_address,
        o.city,
        o.customer_notes,
        o.created_at,
        u.id AS user_id,
        u.name AS customer_name,
        u.email AS customer_email
      FROM orders o
      INNER JOIN users u ON u.id = o.user_id
      ORDER BY o.created_at DESC
    `);

    res.json(rows);
  } catch (error) {
    console.error("List admin orders error:", error);
    res.status(500).json({ message: "No se pudieron cargar los pedidos" });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    await ensureAppSchema();

    const id = parseInt(req.params.id, 10);
    const { status, payment_status } = req.body;
    const allowedStatus = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
    const allowedPaymentStatus = ["pending", "confirmed"];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ message: "Estado de pedido invalido" });
    }

    if (payment_status && !allowedPaymentStatus.includes(payment_status)) {
      return res.status(400).json({ message: "Estado de pago invalido" });
    }

    const rows = await query("SELECT id FROM orders WHERE id = @id", { id });
    if (rows.length === 0) {
      return res.status(404).json({ message: "Pedido no encontrado" });
    }

    await query(
      `UPDATE orders
       SET status = @status,
           payment_status = @paymentStatus
       WHERE id = @id`,
      {
        id,
        status,
        paymentStatus: payment_status || "pending"
      }
    );

    res.json({ message: "Pedido actualizado" });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({ message: "No se pudo actualizar el pedido" });
  }
};
