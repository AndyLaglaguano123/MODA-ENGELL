const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database', 'velonet.db');
const db = new sqlite3.Database(dbPath);

async function initDB() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Crear tabla de planes
      db.run(`CREATE TABLE IF NOT EXISTS planes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        velocidad TEXT NOT NULL,
        precio_mensual REAL NOT NULL,
        precio_anual REAL,
        descripcion TEXT,
        caracteristicas TEXT,
        destacado BOOLEAN DEFAULT 0,
        activo BOOLEAN DEFAULT 1
      )`);

      // Crear tabla de usuarios
      db.run(`CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        telefono TEXT,
        password_hash TEXT NOT NULL,
        rol TEXT DEFAULT 'cliente',
        fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
        activo BOOLEAN DEFAULT 1
      )`);

      // Crear tabla de pedidos
      db.run(`CREATE TABLE IF NOT EXISTS pedidos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_id INTEGER,
        plan_id INTEGER,
        estado TEXT DEFAULT 'pendiente',
        fecha_pedido DATETIME DEFAULT CURRENT_TIMESTAMP,
        direccion TEXT,
        notas TEXT,
        FOREIGN KEY (usuario_id) REFERENCES usuarios (id),
        FOREIGN KEY (plan_id) REFERENCES planes (id)
      )`);

      // Insertar datos iniciales de planes
      const planes = [
        ['Hogar Básico', '100 Mbps', 25, 240, 'Plan básico para hogares', '100 Mbps simétrico,Hasta 4 dispositivos,Router WiFi 5 incluido,Soporte por chat,Sin permanencia', 0],
        ['Hogar Pro', '300 Mbps', 40, 384, 'Plan recomendado para familias', '300 Mbps simétrico,Hasta 10 dispositivos,Router WiFi 6 incluido,Soporte 24/7 prioritario,IP fija opcional,Sin permanencia', 1],
        ['Hogar Ultra', '1 Gbps', 65, 624, 'Máxima velocidad para gaming y streaming', '1000 Mbps simétrico,Dispositivos ilimitados,Router WiFi 6E Mesh,Soporte VIP en sitio,IP fija incluida,Sin permanencia', 0],
        ['Empresas', '10 Gbps', 120, 1152, 'Plan empresarial dedicado', 'Hasta 10 Gbps dedicado,SLA 99.9% garantizado,Enlace redundante,Soporte técnico dedicado,Factura empresarial', 0]
      ];

      const stmt = db.prepare('INSERT OR IGNORE INTO planes (nombre, velocidad, precio_mensual, precio_anual, descripcion, caracteristicas, destacado) VALUES (?, ?, ?, ?, ?, ?, ?)');
      planes.forEach(plan => stmt.run(plan));
      stmt.finalize();

      // Insertar usuario admin por defecto
      bcrypt.hash('admin123', 10, (err, hashedPassword) => {
        if (err) reject(err);
        db.run('INSERT OR IGNORE INTO usuarios (nombre, email, password_hash, rol) VALUES (?, ?, ?, ?)',
          ['Administrador', 'admin@velonet.ec', hashedPassword, 'admin'], (err) => {
          if (err) reject(err);
          console.log('Base de datos inicializada correctamente');
          resolve();
        });
      });
    });
  });
}

initDB().then(() => db.close());