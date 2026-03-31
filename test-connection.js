import sql from "mssql";
import dotenv from "dotenv";

dotenv.config();

console.log("🔍 Intentando conectar a SQL Server...");
console.log("Servidor:", process.env.DB_SERVER);
console.log("Usuario:", process.env.DB_USERNAME);

const config = {
  server: "localhost",
  port: 1433,
  authentication: {
    type: "default",
    options: {
      userName: "sa",
      password: "12345"
    }
  },
  options: {
    trustServerCertificate: true,
    encrypt: false,
    enableKeepAlive: true,
    connectionTimeout: 30000,
    requestTimeout: 30000
  }
};

try {
  const pool = new sql.ConnectionPool(config);
  await pool.connect();
  console.log("✅ Conexión exitosa a SQL Server!");
  
  const result = await pool.request().query("SELECT @@VERSION as version");
  console.log("Versión:", result.recordset[0].version);
  
  await pool.close();
} catch (error) {
  console.error("❌ Error de conexión:", error.message);
  console.error("\nSoluciones posibles:");
  console.error("1. Verifica que SQL Server esté corriendo");
  console.error("2. Verifica el puerto 1433 esté activo");
  console.error("3. Habilita TCP/IP en SQL Server Configuration Manager");
  console.error("4. Reinicia el servicio SQL Server");
}
