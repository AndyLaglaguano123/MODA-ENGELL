import sql from "mssql";
import dotenv from "dotenv";

dotenv.config();

const config = {
  server: process.env.DB_SERVER || "localhost\\SQLEXPRESS",
  authentication: {
    type: "default",
    options: {
      userName: process.env.DB_USERNAME || "sa",
      password: process.env.DB_PASSWORD || ""
    }
  },
  options: {
    trustServerCertificate: true,
    encrypt: true,
    enableKeepAlive: true,
    connectionTimeout: 30000,
    requestTimeout: 30000,
    port: 1433
  }
};

const pool = new sql.ConnectionPool(config);

try {
  await pool.connect();

  const dbName = process.env.DB_DATABASE || "velonet_shop";
  const request = pool.request();

  await request.query(`
    IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = '${dbName}')
    BEGIN
      CREATE DATABASE ${dbName}
    END
  `);

  const pool2 = new sql.ConnectionPool({
    ...config,
    options: {
      ...config.options,
      database: dbName
    }
  });
  await pool2.connect();
  const request2 = pool2.request();

  await request2.query(`
    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'users')
    CREATE TABLE users (
      id INT IDENTITY(1,1) PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(120) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
      created_at DATETIME2 DEFAULT GETDATE(),
      updated_at DATETIME2 DEFAULT GETDATE()
    )
  `);

  await request2.query(`
    IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_users_email')
    CREATE INDEX IX_users_email ON users(email)
  `);

  await request2.query(`
    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'products')
    CREATE TABLE products (
      id INT IDENTITY(1,1) PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      description TEXT,
      price DECIMAL(10, 2) NOT NULL,
      stock INT DEFAULT 0,
      image_url VARCHAR(MAX),
      category VARCHAR(80) DEFAULT 'Moda mujer',
      material VARCHAR(120),
      colors VARCHAR(200),
      sizes VARCHAR(200),
      sku VARCHAR(50),
      active BIT DEFAULT 1,
      created_at DATETIME2 DEFAULT GETDATE(),
      updated_at DATETIME2 DEFAULT GETDATE()
    )
  `);

  await request2.query(`
    IF COL_LENGTH('products', 'category') IS NULL
    BEGIN
      ALTER TABLE products ADD category VARCHAR(80) DEFAULT 'Moda mujer'
    END
  `);

  await request2.query(`
    IF COL_LENGTH('products', 'material') IS NULL
    BEGIN
      ALTER TABLE products ADD material VARCHAR(120)
    END
  `);

  await request2.query(`
    IF COL_LENGTH('products', 'colors') IS NULL
    BEGIN
      ALTER TABLE products ADD colors VARCHAR(200)
    END
  `);

  await request2.query(`
    IF COL_LENGTH('products', 'sizes') IS NULL
    BEGIN
      ALTER TABLE products ADD sizes VARCHAR(200)
    END
  `);

  await request2.query(`
    IF COL_LENGTH('products', 'sku') IS NULL
    BEGIN
      ALTER TABLE products ADD sku VARCHAR(50)
    END
  `);

  await request2.query(`
    IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_products_active')
    CREATE INDEX IX_products_active ON products(active)
  `);

  await request2.query(`
    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'orders')
    CREATE TABLE orders (
      id INT IDENTITY(1,1) PRIMARY KEY,
      user_id INT NOT NULL,
      total_amount DECIMAL(10, 2) NOT NULL,
      shipping_address TEXT NOT NULL,
      city VARCHAR(50) NOT NULL,
      status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
      created_at DATETIME2 DEFAULT GETDATE(),
      updated_at DATETIME2 DEFAULT GETDATE(),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  await request2.query(`
    IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_orders_user_id')
    CREATE INDEX IX_orders_user_id ON orders(user_id)
  `);

  await request2.query(`
    IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_orders_status')
    CREATE INDEX IX_orders_status ON orders(status)
  `);

  await request2.query(`
    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'order_items')
    CREATE TABLE order_items (
      id INT IDENTITY(1,1) PRIMARY KEY,
      order_id INT NOT NULL,
      product_id INT NOT NULL,
      quantity INT NOT NULL,
      price DECIMAL(10, 2) NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `);

  await request2.query(`
    IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_order_items_order_id')
    CREATE INDEX IX_order_items_order_id ON order_items(order_id)
  `);

  await request2.query(`
    IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_order_items_product_id')
    CREATE INDEX IX_order_items_product_id ON order_items(product_id)
  `);

  console.log("Base de datos inicializada correctamente");

  await request2.query(`
    IF NOT EXISTS (SELECT * FROM products WHERE name = 'Vestido Satinado Aurora')
    BEGIN
      INSERT INTO products (name, description, price, stock, image_url, category, material, colors, sizes, sku)
      VALUES
        ('Vestido Satinado Aurora', 'Vestido elegante de caida suave para eventos y cenas especiales.', 39.99, 18, 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80', 'Vestidos', 'Satin', 'Rosado, Champan, Negro', 'S, M, L', 'ME-VES-001'),
        ('Blusa Romantic Bloom', 'Blusa femenina con mangas ligeras y acabado delicado para outfits casuales.', 24.50, 26, 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80', 'Blusas', 'Chiffon', 'Blanco, Rosa palo', 'S, M, L, XL', 'ME-BLU-002'),
        ('Set Urban Muse', 'Conjunto moderno de dos piezas para salidas de fin de semana.', 44.90, 14, 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80', 'Conjuntos', 'Algodon premium', 'Beige, Negro', 'S, M, L', 'ME-SET-003'),
        ('Falda Midi Verona', 'Falda midi con silueta estilizada y cintura comoda.', 27.75, 20, 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80', 'Faldas', 'Lino blend', 'Perla, Negro, Terracota', 'S, M, L', 'ME-FAL-004'),
        ('Top Nocturne Chic', 'Top ajustado ideal para combinar con denim o faldas elevadas.', 19.90, 32, 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80', 'Tops', 'Rib suave', 'Negro, Vino, Marfil', 'S, M, L', 'ME-TOP-005')
    END
  `);

  console.log("Productos de ejemplo de Moda Engell insertados");
  await pool2.close();
} catch (error) {
  console.error("Error inicializando BD:", error.message);
  process.exit(1);
} finally {
  await pool.close();
  console.log("Setup completado. Inicia con: npm run dev");
}
