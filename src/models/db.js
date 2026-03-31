import sql from "mssql";
import dotenv from "dotenv";

dotenv.config();

const config = {
  server: process.env.DB_SERVER || "localhost",
  authentication: {
    type: "default",
    options: {
      userName: process.env.DB_USERNAME || "sa",
      password: process.env.DB_PASSWORD || ""
    }
  },
  options: {
    database: process.env.DB_DATABASE || "moda_engell",
    trustServerCertificate: true,
    encrypt: false,
    enableKeepAlive: true,
    connectionTimeout: 30000,
    requestTimeout: 30000,
    port: 1433
  }
};

export const pool = new sql.ConnectionPool(config);

pool.on("error", (err) => {
  console.error("❌ Pool error:", err);
});

export async function connect() {
  try {
    await pool.connect();
    console.log("✅ Conexión a SQL Server establecida");
  } catch (err) {
    console.error("❌ Error conectando a SQL Server:", err.message);
    throw err;
  }
}

export async function query(sqlQuery, values = {}) {
  try {
    const request = pool.request();
    
    // Agregar parámetros nombrados
    Object.keys(values).forEach((key) => {
      request.input(key, values[key]);
    });
    
    const result = await request.query(sqlQuery);
    return result.recordset || [];
  } catch (err) {
    console.error("Error en query:", err.message);
    throw err;
  }
}

export async function queryReturnId(sqlQuery, values = {}) {
  try {
    const request = pool.request();
    
    // Agregar parámetros nombrados
    Object.keys(values).forEach((key) => {
      request.input(key, values[key]);
    });
    
    // Agregar SCOPE_IDENTITY para obtener el último ID insertado
    const result = await request.query(sqlQuery + "; SELECT SCOPE_IDENTITY() as id");
    return result.recordset[0]?.id || null;
  } catch (err) {
    console.error("Error en queryReturnId:", err.message);
    throw err;
  }
}

export async function testConnection() {
  try {
    if (!pool.connected) {
      await pool.connect();
      console.log("✅ Pool de SQL Server conectado desde testConnection");
    }

    const request = pool.request();
    await request.query("SELECT 1");
    console.log("✅ Conexión a SQL Server exitosa");
  } catch (err) {
    console.error("❌ Error de conexión a SQL Server:", err.message);
    throw err;
  }
}
