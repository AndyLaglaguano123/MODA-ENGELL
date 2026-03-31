# 🚀 VeloNet Shop - Setup Completado

## ✅ Qué se implementó

- ✅ Backend Node.js + Express
- ✅ Base de datos MySQL con 4 tablas (users, products, orders, order_items)
- ✅ Autenticación JWT + bcrypt
- ✅ Upload de imágenes con Cloudinary
- ✅ Validaciones con express-validator
- ✅ CRUD completo de productos
- ✅ Sistema de órdenes y compras
- ✅ Rutas protegidas y públicas
- ✅ Documentación Postman

---

## 📝 Pasos para activar

### 1️⃣ Configurar base de datos MySQL

Si tienes MySQL instalado:

```bash
# Abre una terminal como admin y corre:
npm run init-db
```

Esto creará:
- Base de datos `velonet_shop`
- Todas las tablas necesarias
- Datos de ejemplo (5 productos)

### 2️⃣ Configurar Cloudinary (opcional pero recomendado)

1. Ve a https://cloudinary.com/users/register/free
2. Regístrate gratis
3. Ve a Settings → API Keys
4. Copia: Cloud Name, API Key, API Secret
5. Pega en `.env`:

```env
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

Sin esto, pueden crear productos sin imágenes.

### 3️⃣ Configurar JWT en `.env`

Si quieres cambiar la contraseña de tokens:

```env
JWT_SECRET=tu_secreto_super_seguro_aqui
JWT_EXPIRES_IN=7d
```

### 4️⃣ Iniciar servidor

**Desarrollo (rerecarga automática):**
```bash
npm run dev
```

**Producción:**
```bash
npm start
```

El servidor estará en: **http://localhost:4000**

---

## 🧪 Prueba inmediata

### Test 1: Registrarse
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test\",\"email\":\"test@test.com\",\"password\":\"123456\"}"
```

### Test 2: Listar productos
```bash
curl http://localhost:4000/api/products
```

### Test 3: Login
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@test.com\",\"password\":\"123456\"}"
```

Copias el `token` devuelto y lo usas en:

### Test 4: Crear orden
```bash
curl -X POST http://localhost:4000/api/orders \
  -H "Authorization: Bearer TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d "{\"items\":[{\"product_id\":1,\"quantity\":1}],\"shipping_address\":\"Mi casa\",\"city\":\"Quito\"}"
```

---

## 📱 Integrar en frontend (index.ejs)

En tu Alpine.js:

```javascript
// Registro
async function register(email, password, name) {
  const res = await fetch('http://localhost:4000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });
  return res.json();
}

// Login
async function login(email, password) {
  const res = await fetch('http://localhost:4000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  localStorage.setItem('token', data.token);
  return data;
}

// Listar productos
async function loadProducts() {
  const res = await fetch('http://localhost:4000/api/products');
  return res.json();
}

// Crear orden
async function createOrder(items, shipping_address, city) {
  const token = localStorage.getItem('token');
  const res = await fetch('http://localhost:4000/api/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ items, shipping_address, city })
  });
  return res.json();
}
```

---

## 📚 Documentación completa

Ver archivo: `README_SHOP.md` para:
- Todos los endpoints
- Ejemplos de requests/responses
- Estructura de carpetas
- Troubleshooting

---

## 🔌 Postman Collection

Importa `VeloNet_Shop.postman_collection.json` en Postman:

1. Abre Postman
2. Click "Import"
3. Selecciona el archivo
4. Configura `{{BASE_URL}}` = `http://localhost:4000`
5. ¡Listo para testear!

---

## 📁 Archivos creados

```
✅ .env                                    # Config
✅ package.json                            # Dependencias
✅ src/app.js                              # App principal
✅ src/models/db.js                        # Conexión MySQL
✅ src/utils/cloudinary.js                 # Upload imágenes
✅ src/middlewares/authMiddleware.js       # JWT auth
✅ src/controllers/authController.js       # Rutas auth
✅ src/controllers/productController.js    # Rutas productos
✅ src/controllers/orderController.js      # Rutas órdenes
✅ src/routes/auth.js
✅ src/routes/products.js
✅ src/routes/orders.js
✅ database/schema.js                      # Inicialización BD
✅ README_SHOP.md                          # Documentación
✅ VeloNet_Shop.postman_collection.json   # Collection
```

---

## 🐛 Si algo falla

### Error de conexión MySQL
```bash
# Verifica que MySQL esté corriendo
mysql -u root
# Si no funciona, instala MySQL Community Server
```

### Error 404 en API
- Revisa que el servidor esté corriendo en puerto 4000
- Verifica la URL: `http://localhost:4000/api/health`

### Token inválido
- Después de login, copia exactamente el token
- Usa formato: `Authorization: Bearer <token>`

### Cloudinary no funciona
- Sin Cloudinary, productos se crean SIN imagen
- Para arreglarlo: ve a https://cloudinary.com y configura `.env`

---

## 🎯 Próximos pasos

1. **Integrar en frontend**: Usa fetch() para conectar index.ejs con la API
2. **Stripe/Paypal**: Agregar pagos online
3. **Email**: Notificaciones de órdenes
4. **Admin panel**: Dashboard para ver órdenes y productos
5. **Deploy**: Render.com o Railway.app (gratis)

---

## 💡 Comandos útiles

```bash
# Ver logs en tiempo real
npm run dev

# Reiniciar base de datos
npm run init-db

# Auditar seguridad
npm audit

# Actualizar paquetes
npm update

# Generar documentación OpenAPI
# (puedes agregar después)
```

---

## 🎉 ¡Listo para usar!

Tu tienda VeloNet está completa. 

**Próximo paso:** `npm run dev` y empieza a testear 🚀

¿Necesitas ayuda? Revisa README_SHOP.md o ejecuta los tests curl arriba.
