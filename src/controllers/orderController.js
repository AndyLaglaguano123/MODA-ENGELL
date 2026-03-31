import { query, queryReturnId } from "../models/db.js";
import { body, validationResult } from "express-validator";
import { ensureAppSchema } from "../models/schemaGuard.js";

export const validateOrder = [
  body("items").isArray({ min: 1 }).withMessage("Items requeridos"),
  body("items.*.product_id").isInt().withMessage("Product ID invalido"),
  body("items.*.quantity").isInt({ min: 1 }).withMessage("Cantidad invalida"),
  body("shipping_address").optional().trim(),
  body("city").optional().trim(),
  body("customer_notes").optional().trim(),
  body("payment_method").optional().isIn(["transfer"]).withMessage("Metodo de pago invalido")
];

export const createOrder = async (req, res) => {
  try {
    await ensureAppSchema();

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      items,
      shipping_address = "Confirmar direccion por WhatsApp",
      city = "Por confirmar",
      customer_notes = "",
      payment_method = "transfer"
    } = req.body;
    const userId = req.user.id;

    let totalAmount = 0;
    for (const item of items) {
      const products = await query(
        "SELECT price, stock FROM products WHERE id = @id",
        { id: item.product_id }
      );
      if (products.length === 0) {
        return res.status(404).json({ message: `Producto ${item.product_id} no encontrado` });
      }
      const product = products[0];
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Stock insuficiente para producto ${item.product_id}` });
      }
      totalAmount += Number(product.price) * item.quantity;
    }

    const orderId = await queryReturnId(
      `INSERT INTO orders (user_id, total_amount, shipping_address, city, status, payment_method, payment_status, customer_notes)
       VALUES (@userId, @totalAmount, @shippingAddress, @city, @status, @paymentMethod, @paymentStatus, @customerNotes)`,
      {
        userId,
        totalAmount,
        shippingAddress: shipping_address,
        city,
        status: "pending",
        paymentMethod: payment_method,
        paymentStatus: "pending",
        customerNotes: customer_notes
      }
    );

    for (const item of items) {
      const products = await query("SELECT price FROM products WHERE id = @id", { id: item.product_id });
      const price = products[0].price;

      await query(
        "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (@orderId, @productId, @quantity, @price)",
        { orderId, productId: item.product_id, quantity: item.quantity, price }
      );

      await query(
        "UPDATE products SET stock = stock - @quantity WHERE id = @id",
        { quantity: item.quantity, id: item.product_id }
      );
    }

    res.status(201).json({
      message: "Orden creada",
      order: {
        id: orderId,
        total_amount: totalAmount,
        status: "pending",
        payment_method
      }
    });
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const getOrders = async (req, res) => {
  try {
    await ensureAppSchema();

    const rows = await query(
      "SELECT id, total_amount, status, payment_method, payment_status, created_at FROM orders WHERE user_id = @userId ORDER BY created_at DESC",
      { userId: req.user.id }
    );
    res.json(rows);
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const getOrder = async (req, res) => {
  try {
    await ensureAppSchema();

    const id = parseInt(req.params.id, 10);
    const orders = await query(
      "SELECT * FROM orders WHERE id = @id AND user_id = @userId",
      { id, userId: req.user.id }
    );

    if (orders.length === 0) {
      return res.status(404).json({ message: "Orden no encontrada" });
    }

    const items = await query(
      "SELECT oi.id, oi.product_id, p.name, oi.quantity, oi.price FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = @orderId",
      { orderId: id }
    );

    res.json({ order: orders[0], items });
  } catch (error) {
    console.error("Get order error:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    await ensureAppSchema();

    const id = parseInt(req.params.id, 10);
    const orders = await query("SELECT status FROM orders WHERE id = @id AND user_id = @userId", { id, userId: req.user.id });
    if (orders.length === 0) {
      return res.status(404).json({ message: "Orden no encontrada" });
    }

    if (orders[0].status !== "pending") {
      return res.status(400).json({ message: "Solo se pueden cancelar ordenes pendientes" });
    }

    const items = await query("SELECT product_id, quantity FROM order_items WHERE order_id = @orderId", { orderId: id });
    for (const item of items) {
      await query("UPDATE products SET stock = stock + @quantity WHERE id = @id", { quantity: item.quantity, id: item.product_id });
    }

    await query("UPDATE orders SET status = @status WHERE id = @id", { status: "cancelled", id });

    res.json({ message: "Orden cancelada" });
  } catch (error) {
    console.error("Cancel order error:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
