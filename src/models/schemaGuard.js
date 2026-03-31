import { query } from "./db.js";

let schemaReady = false;

export async function ensureAppSchema() {
  if (schemaReady) {
    return;
  }

  await query(`
    IF EXISTS (
      SELECT 1
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'products'
        AND COLUMN_NAME = 'image_url'
        AND (CHARACTER_MAXIMUM_LENGTH IS NOT NULL AND CHARACTER_MAXIMUM_LENGTH < 8000)
    )
    BEGIN
      ALTER TABLE products ALTER COLUMN image_url VARCHAR(MAX) NULL
    END
  `);

  await query(`
    IF COL_LENGTH('products', 'views_count') IS NULL
    BEGIN
      ALTER TABLE products ADD views_count INT NOT NULL CONSTRAINT DF_products_views_count DEFAULT 0
    END
  `);

  await query(`
    IF COL_LENGTH('products', 'category') IS NULL
    BEGIN
      ALTER TABLE products ADD category VARCHAR(80) NOT NULL CONSTRAINT DF_products_category DEFAULT 'Moda mujer'
    END
  `);

  await query(`
    IF COL_LENGTH('products', 'material') IS NULL
    BEGIN
      ALTER TABLE products ADD material VARCHAR(120) NULL
    END
  `);

  await query(`
    IF COL_LENGTH('products', 'colors') IS NULL
    BEGIN
      ALTER TABLE products ADD colors VARCHAR(200) NULL
    END
  `);

  await query(`
    IF COL_LENGTH('products', 'sizes') IS NULL
    BEGIN
      ALTER TABLE products ADD sizes VARCHAR(200) NULL
    END
  `);

  await query(`
    IF COL_LENGTH('products', 'sku') IS NULL
    BEGIN
      ALTER TABLE products ADD sku VARCHAR(50) NULL
    END
  `);

  await query(`
    IF COL_LENGTH('orders', 'payment_method') IS NULL
    BEGIN
      ALTER TABLE orders ADD payment_method VARCHAR(30) NOT NULL CONSTRAINT DF_orders_payment_method DEFAULT 'transfer'
    END
  `);

  await query(`
    IF COL_LENGTH('orders', 'payment_status') IS NULL
    BEGIN
      ALTER TABLE orders ADD payment_status VARCHAR(30) NOT NULL CONSTRAINT DF_orders_payment_status DEFAULT 'pending'
    END
  `);

  await query(`
    IF COL_LENGTH('orders', 'customer_notes') IS NULL
    BEGIN
      ALTER TABLE orders ADD customer_notes VARCHAR(500) NULL
    END
  `);

  await query(`
    IF OBJECT_ID('site_visits', 'U') IS NULL
    BEGIN
      CREATE TABLE site_visits (
        id INT IDENTITY(1,1) PRIMARY KEY,
        session_id VARCHAR(120) NOT NULL,
        page VARCHAR(120) NOT NULL,
        user_id INT NULL,
        visitor_name VARCHAR(120) NULL,
        visitor_email VARCHAR(160) NULL,
        created_at DATETIME2 DEFAULT GETDATE(),
        CONSTRAINT FK_site_visits_user FOREIGN KEY (user_id) REFERENCES users(id)
      )
    END
  `);

  await query(`
    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_site_visits_created_at')
    BEGIN
      CREATE INDEX IX_site_visits_created_at ON site_visits(created_at DESC)
    END
  `);

  await query(`
    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_site_visits_session_id')
    BEGIN
      CREATE INDEX IX_site_visits_session_id ON site_visits(session_id)
    END
  `);

  schemaReady = true;
}
