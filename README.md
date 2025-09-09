# 🚀 Backend - API de Gestión de Cobros

API REST desarrollada con Express.js, Sequelize y SQLite para el sistema de gestión de cobros.

## 📋 Requisitos

- Node.js 18+
- npm o pnpm
- SQLite (incluido)

## ⚡ Inicio Rápido

### 1. Instalar dependencias

```bash
npm install
# o
pnpm install
```

### 2. Configurar variables de entorno

Crear archivo `.env` basado en `.env.example`:

```bash
NODE_ENV=development
PORT=5000
DB_DIALECT=sqlite
DB_STORAGE=./database.sqlite
DEBUG=true
```

### 3. Inicializar base de datos

```bash
# Inicializar Sequelize (si no está hecho)
npx sequelize-cli init

# Ejecutar migraciones
npm run db:migrate

# Cargar datos de prueba (opcional)
npm run db:seed
```

### 4. Iniciar servidor

```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## 🌐 Endpoints Disponibles

### Información General

- `GET /` - Información de la API
- `GET /health` - Estado del servidor
- `GET /api` - Rutas disponibles

### Clientes

- `GET /api/clientes` - Obtener todos los clientes
- `GET /api/clientes/:id` - Obtener cliente por ID
- `POST /api/clientes` - Crear nuevo cliente
- `PUT /api/clientes/:id` - Actualizar cliente
- `DELETE /api/clientes/:id` - Eliminar cliente
- `PATCH /api/clientes/:id/estado` - Cambiar estado del cliente

## 📊 Estructura del Proyecto

```
src/
├── routes/           # Rutas de la API
│   ├── index.js      # Rutas principales
│   └── clientes.js   # Rutas de clientes
├── models/           # Modelos de Sequelize
├── controllers/      # Controladores (próximamente)
├── middleware/       # Middlewares personalizados (próximamente)
├── utils/           # Utilidades (próximamente)
├── database.js      # Configuración de base de datos
└── index.js         # Archivo principal
```

## 🧪 Probar la API

### Con curl

```bash
# Obtener información de la API
curl http://localhost:5000

# Estado del servidor
curl http://localhost:5000/health

# Listar clientes
curl http://localhost:5000/api/clientes

# Crear cliente
curl -X POST http://localhost:5000/api/clientes \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan",
    "apellido": "Pérez",
    "telefono": "1234567890",
    "direccion": "Calle 123",
    "precioBase": 25.00
  }'
```

### Con navegador

- http://localhost:5000 - Información de la API
- http://localhost:5000/health - Estado del servidor
- http://localhost:5000/api - Rutas disponibles
- http://localhost:5000/api/clientes - Lista de clientes

## 📝 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Iniciar con nodemon
npm run lint         # Verificar código con ESLint
npm run lint:fix     # Corregir errores de ESLint
npm run prettier     # Verificar formato
npm run prettier:fix # Corregir formato

# Base de datos
npm run db:migrate   # Ejecutar migraciones
npm run db:seed      # Cargar datos de prueba
npm run db:reset     # Reset completo de BD

# Producción
npm start           # Iniciar servidor
```

## 🔧 Configuración

### Variables de Entorno

- `NODE_ENV` - Entorno (development/production)
- `PORT` - Puerto del servidor (default: 5000)
- `DB_DIALECT` - Tipo de base de datos (sqlite)
- `DB_STORAGE` - Archivo de base de datos SQLite
- `DEBUG` - Modo debug (true/false)

### Base de Datos

- **Tipo**: SQLite
- **Archivo**: `database.sqlite`
- **ORM**: Sequelize
- **Migraciones**: Automáticas en desarrollo

## 🚨 Solución de Problemas

### Error: "Cannot find module"

```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

### Error de base de datos

```bash
# Reset de base de datos
npm run db:reset
```

### Error de puerto ocupado

```bash
# Cambiar puerto en .env
PORT=5001
```

## 📈 Próximos Pasos

1. ✅ Servidor Express configurado
2. ✅ Conexión a base de datos
3. ✅ Rutas básicas de clientes
4. 🔄 Implementar modelos Sequelize
5. ⏳ Controladores completos
6. ⏳ Middleware de validación
7. ⏳ Sistema de autenticación
8. ⏳ Tests unitarios

## 🤝 Desarrollo

### Flujo de trabajo

1. Crear rama para nueva feature
2. Implementar cambios
3. Ejecutar tests y linting
4. Hacer commit con mensaje descriptivo
5. Crear pull request

### Convenciones de código

- Usar ESLint y Prettier
- Nombres en español para rutas y modelos
- Comentarios en español
- Commits en español

---

🎯 **Estado actual**: Servidor básico funcionando con rutas de ejemplo
📅 **Próxima actualización**: Implementación de modelos Sequelize
