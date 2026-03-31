import { query, queryReturnId } from "../models/db.js";
import { uploadImage, deleteImage } from "../utils/cloudinary.js";
import { body, validationResult } from "express-validator";
import { ensureAppSchema } from "../models/schemaGuard.js";

export const validateProduct = [
  body("name").trim().notEmpty().withMessage("Nombre requerido"),
  body("description").trim().notEmpty().withMessage("Descripcion requerida"),
  body("price").isFloat({ min: 0 }).withMessage("Precio invalido"),
  body("stock").isInt({ min: 0 }).withMessage("Stock invalido"),
  body("image_url").optional().trim(),
  body("category").optional().trim(),
  body("material").optional().trim(),
  body("colors").optional().trim(),
  body("sizes").optional().trim(),
  body("sku").optional().trim()
];

export const listProducts = async (req, res) => {
  try {
    await ensureAppSchema();
    const rows = await query(
      `SELECT id, name, description, price, stock, image_url, views_count, category, material, colors, sizes, sku, created_at
       FROM products
       WHERE active = 1
       ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (error) {
    console.error("List error:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const getProduct = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await ensureAppSchema();

    await query(
      "UPDATE products SET views_count = ISNULL(views_count, 0) + 1 WHERE id = @id AND active = 1",
      { id }
    );

    const rows = await query(
      "SELECT * FROM products WHERE id = @id AND active = 1",
      { id }
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Get error:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const createProduct = async (req, res) => {
  try {
    await ensureAppSchema();

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, price, stock, image_url, category, material, colors, sizes, sku } = req.body;
    let imageUrl = image_url || "";

    if (req.file) {
      imageUrl = await uploadImage(req.file.path);
    }

    const productId = await queryReturnId(
      `INSERT INTO products (name, description, price, stock, image_url, views_count, category, material, colors, sizes, sku)
       VALUES (@name, @description, @price, @stock, @imageUrl, 0, @category, @material, @colors, @sizes, @sku)`,
      {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock, 10),
        imageUrl,
        category: category || 'Moda mujer',
        material: material || 'Tela premium',
        colors: colors || 'Rosado, Negro',
        sizes: sizes || 'S, M, L',
        sku: sku || `ME-${Date.now()}`,
      }
    );

    res.status(201).json({
      id: productId,
      message: "Producto creado exitosamente",
      product: { id: productId, name, description, price, stock, image_url: imageUrl, views_count: 0, category, material, colors, sizes, sku }
    });
  } catch (error) {
    console.error("Create error:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const updateProduct = async (req, res) => {
  try {
    await ensureAppSchema();

    const id = parseInt(req.params.id, 10);
    const { name, description, price, stock, image_url, category, material, colors, sizes, sku } = req.body;

    const productRows = await query(
      `SELECT image_url, name AS oldName, description AS oldDesc, price AS oldPrice, stock AS oldStock,
              category AS oldCategory, material AS oldMaterial, colors AS oldColors, sizes AS oldSizes, sku AS oldSku
       FROM products
       WHERE id = @id`,
      { id }
    );

    if (productRows.length === 0) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    const product = productRows[0];
    let imageUrl = image_url || product.image_url;

    if (req.file) {
      if (imageUrl) {
        await deleteImage(imageUrl);
      }
      imageUrl = await uploadImage(req.file.path);
    }

    await query(
      `UPDATE products
       SET name = @name,
           description = @description,
           price = @price,
           stock = @stock,
           image_url = @imageUrl,
           category = @category,
           material = @material,
           colors = @colors,
           sizes = @sizes,
           sku = @sku
       WHERE id = @id`,
      {
        id,
        name: name || product.oldName,
        description: description || product.oldDesc,
        price: price ? parseFloat(price) : product.oldPrice,
        stock: stock !== undefined ? parseInt(stock, 10) : product.oldStock,
        imageUrl,
        category: category || product.oldCategory || 'Moda mujer',
        material: material || product.oldMaterial || 'Tela premium',
        colors: colors || product.oldColors || 'Rosado, Negro',
        sizes: sizes || product.oldSizes || 'S, M, L',
        sku: sku || product.oldSku || `ME-${id}`,
      }
    );

    res.json({ message: "Producto actualizado", id });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    await ensureAppSchema();

    const id = parseInt(req.params.id, 10);
    const productRows = await query("SELECT image_url FROM products WHERE id = @id", { id });
    if (productRows.length === 0) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    if (productRows[0].image_url) {
      await deleteImage(productRows[0].image_url);
    }

    await query("UPDATE products SET active = 0 WHERE id = @id", { id });

    res.json({ message: "Producto eliminado" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const searchProducts = async (req, res) => {
  try {
    await ensureAppSchema();

    const { q } = req.query;
    if (!q || q.length < 2) {
      return res.status(400).json({ message: "Busqueda muy corta" });
    }

    const searchTerm = `%${q}%`;
    const rows = await query(
      `SELECT id, name, description, price, image_url, views_count, category, material, colors, sizes, sku
       FROM products
       WHERE active = 1 AND (name LIKE @search OR description LIKE @search OR category LIKE @search)`,
      { search: searchTerm }
    );

    res.json(rows);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
