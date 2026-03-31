# VeloNet - Aplicación Web de Servicios de Internet

Una aplicación web completa para la gestión de servicios de internet de VeloNet, construida con Node.js, Express, SQLite y EJS.

## Características

- **Frontend moderno**: Interfaz responsiva con diseño futurista
- **Panel de administración**: Gestión completa de planes, usuarios y pedidos
- **Base de datos**: SQLite para almacenamiento local
- **Autenticación**: Sistema de login seguro con bcrypt
- **Gestión de pedidos**: Sistema completo para contratación de servicios

## Tecnologías utilizadas

- **Backend**: Node.js + Express
- **Base de datos**: SQLite3
- **Templates**: EJS
- **Frontend**: HTML5, CSS3, JavaScript
- **Autenticación**: bcrypt + express-session

## Instalación

1. Clona o descarga el proyecto
2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Inicializa la base de datos:
   ```bash
   npm run init-db
   ```

4. Inicia el servidor:
   ```bash
   npm start
   ```

5. Abre tu navegador en `http://localhost:3000`

## Uso

### Acceso al panel de administración

- **Usuario**: admin@velonet.ec
- **Contraseña**: admin123
- URL: `http://localhost:3000/admin`

### Funcionalidades principales

- **Página principal**: Landing page con planes disponibles
- **Contratación**: Formulario de pedido con validación
- **Verificación de cobertura**: Lista de ciudades con cobertura
- **Panel admin**: Gestión de planes, usuarios y pedidos

## Estructura del proyecto

```
practicaa/
├── database/
│   └── init.js          # Inicialización de base de datos
├── public/
│   ├── css/
│   │   └── styles.css   # Estilos CSS
│   └── js/
│       └── script.js    # JavaScript del frontend
├── src/
│   └── server.js        # Servidor principal
├── views/
│   ├── index.ejs        # Página principal
│   ├── login.ejs        # Página de login
│   └── admin.ejs        # Panel de administración
├── package.json         # Dependencias
└── README.md           # Este archivo
```

## API Endpoints

### Planes
- `GET /` - Página principal con planes
- `POST /admin/planes` - Crear nuevo plan
- `PUT /admin/planes/:id` - Actualizar plan
- `DELETE /admin/planes/:id` - Eliminar plan

### Usuarios
- `POST /login` - Iniciar sesión
- `POST /logout` - Cerrar sesión
- `POST /register` - Registrar usuario

### Pedidos
- `POST /pedido` - Crear pedido
- `PUT /admin/pedidos/:id` - Actualizar estado de pedido

## Desarrollo

Para desarrollo con recarga automática:
```bash
npm run dev
```

## Base de datos

La aplicación utiliza SQLite con las siguientes tablas:

- **planes**: Información de los planes de internet
- **usuarios**: Usuarios registrados (clientes y administradores)
- **pedidos**: Pedidos de contratación de servicios

## Seguridad

- Contraseñas hasheadas con bcrypt
- Sesiones seguras con express-session
- Validación de entrada en formularios
- Middleware de autenticación para rutas protegidas

## Próximas mejoras

- [ ] Sistema de pagos integrado
- [ ] Notificaciones por email
- [ ] API REST completa
- [ ] Panel de usuario para clientes
- [ ] Sistema de tickets de soporte
- [ ] Dashboard con estadísticas

## Licencia

Este proyecto es de uso educativo y no tiene licencia específica.