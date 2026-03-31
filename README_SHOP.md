# 🛍️ VeloNet Shop API

Backend completo de tienda online para VeloNet con Node.js, Express, MySQL, Cloudinary y JWT.

## 📋 Requisitos

- Node.js 16+
- MySQL 8.0+
- npm o yarn

## 🚀 Inicio rápido

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Edita `.env`:

```env
PORT=4000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=velonet_shop
JWT_SECRET=supersecreto_velonet_2026
CLOUDINARY_CLOUD_NAME=tu_cloud
CLOUDINARY_API_KEY=tu_key
CLOUDINARY_API_SECRET=tu_secret
```

### 3. Inicializar base de datos

```bash
npm run init-db
```

Este comando:
- Crea la base de datos MySQL
- Crea todas las tablas
- Inserta datos de ejemplo

### 4. Iniciar servidor

**Desarrollo (con hot-reload):**
```bash
npm run dev
```

**Producción:**
```bash
npm start
```

El servidor estará en `http://localhost:4000`

## 📡 Endpoints API

### 🔐 Autenticación

#### Registrarse
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "password": "password123"
}
```

#### Iniciar sesión
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "juan@example.com",
  "password": "password123"
}
```

Respuesta:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan Pérez",
    "email": "juan@example.com"
  }
}
```

#### Perfil
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

### 🛍️ Productos

#### Listar productos
```http
GET /api/products
```

#### Buscar productos
```http
GET /api/products/search?q=router
```

#### Obtener producto
```http
GET /api/products/:id
```

#### Crear producto (admin)
```http
POST /api/products
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "name": "Nuevo Producto",
  "description": "Descripción",
  "price": "99.99",
  "stock": "10",
  "image": <archivo>
}
```

#### Actualizar producto (admin)
```http
PUT /api/products/:id
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

#### Eliminar producto (admin)
```http
DELETE /api/products/:id
Authorization: Bearer <token>
```

### 📦 Órdenes

#### Crear orden
```http
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "items": [
    {
      "product_id": 1,
      "quantity": 2
    }
  ],
  "shipping_address": "Av. Principal 123",
  "city": "Quito"
}
```

#### Listar mis órdenes
```http
GET /api/orders
Authorization: Bearer <token>
```

#### Obtener orden
```http
GET /api/orders/:id
Authorization: Bearer <token>
```

#### Cancelar orden
```http
DELETE /api/orders/:id
Authorization: Bearer <token>
```

## 🔑 Headers requeridos

Todos los endpoints protegidos requieren:

```
Authorization: Bearer <JWT_TOKEN>
```

## 📁 Estructura

```
src/
├── app.js              # Aplicación principal
├── models/
│   └── db.js          # Conexión MySQL
├── controllers/
│   ├── authController.js
│   ├── productController.js
│   └── orderController.js
├── routes/
│   ├── auth.js
│   ├── products.js
│   └── orders.js
├── middlewares/
│   └── authMiddleware.js
└── utils/
    └── cloudinary.js   # Upload de imágenes

database/
└── schema.js          # Inicialización de BD

.env                   # Variables de entorno
package.json
```

## 🔒 Seguridad

- Contraseñas hasheadas con bcrypt
- Tokens JWT con expiración
- Validación de inputs con express-validator
- CORS habilitado y configurable

## 📸 Imágenes con Cloudinary

1. Regístrate en [cloudinary.com](https://cloudinary.com)
2. Obtén tus credenciales
3. Configura en `.env`

Las imágenes se suben automáticamente al crear/editar productos.

## 🧪 Testear API

### Con Postman
1. Importa los endpoints documentados
2. Configura `{{BASE_URL}}` = `http://localhost:4000`
3. Usa la variable `{{TOKEN}}` en requests protegidas

### Con curl
```bash
# Registrar
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"123456"}'

# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}'

# Listar productos
curl http://localhost:4000/api/products
```

## 🐛 Troubleshooting

### Error de conexión MySQL
- Verifica que MySQL esté corriendo
- Revisa credenciales en `.env`
- Ejecuta `npm run init-db`

### Error de subida de imágenes
- Valida credenciales de Cloudinary
- Revisa que la ruta de archivos existe

### Token inválido
- Verifica formato: `Bearer <token>`
- Comprueba que no expiró

## 📞 Soporte

Para problemas, revisa:
- Logs en consola (`npm run dev`)
- Validación de inputs
- Estado de conexiones

## 📄 Licencia

MIT - VeloNet 2026
