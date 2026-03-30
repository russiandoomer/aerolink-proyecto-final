# AeroLink

Sistema web de simulacion y logistica aerea para la gestion de vuelos, reservas, rutas y monitoreo de flota. El proyecto fue desarrollado con una arquitectura separada de backend en Laravel y frontend en React, con una base de datos relacional en MySQL o MariaDB.

## Descripcion

AeroLink centraliza operaciones academicas de una aerolinea en un panel administrativo moderno y sobrio. Permite registrar aviones, aeropuertos, rutas, vuelos, pasajeros y reservas, ademas de visualizar indicadores operativos en un dashboard con graficas.

El objetivo es que el sistema se vea profesional y realista, pero manteniendo una complejidad defendible para un proyecto final universitario.

## Modulos principales

- Dashboard operativo
- Gestion de aerolineas
- Gestion de flota
- Gestion de aeropuertos
- Gestion de rutas
- Gestion de vuelos
- Gestion de pasajeros
- Gestion de reservas
- Estados de vuelo y filtros

## Stack tecnologico

- Backend: Laravel 10
- Base de datos: MySQL o MariaDB
- Frontend: React + Vite
- Cliente HTTP: Axios
- Graficas: Recharts
- Animaciones: Framer Motion
- Iconos: Lucide React
- Alertas: SweetAlert2
- Notificaciones: React Toastify

## Arquitectura general

```text
tecnoweb2/
├── app/                    # Modelos, controladores, middleware y logica Laravel
├── config/                 # Configuracion del backend
├── database/
│   ├── migrations/         # Estructura de base de datos
│   └── seeders/            # Datos demo para pruebas
├── docs/                   # Entregas por fases del proyecto
├── frontend/               # Aplicacion React
├── resources/              # Recursos Blade heredados del proyecto base
├── routes/                 # Rutas web y API
└── README.md
```

## Flujo funcional principal

1. Registrar un avion
2. Registrar aeropuertos
3. Registrar una ruta
4. Registrar un vuelo
5. Registrar un pasajero
6. Crear una reserva
7. Filtrar vuelos
8. Cambiar el estado del vuelo
9. Ver el cambio reflejado en el dashboard

## Requisitos

### Backend

- PHP 8.1 o superior
- Composer
- MySQL o MariaDB

### Frontend

- Node.js 18 o superior
- npm

## Instalacion del backend

Desde la raiz del proyecto:

```bash
cd C:\xampp\htdocs\tecnoweb2
composer install
copy .env.example .env
php artisan key:generate
```

Configurar el archivo `.env` con los datos de la base:

```env
APP_NAME=AeroLink
APP_URL=http://127.0.0.1:8000
FRONTEND_URL=http://127.0.0.1:5173

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=tecnoweb2
DB_USERNAME=root
DB_PASSWORD=

API_KEY=aero123
```

Crear la base de datos y ejecutar migraciones con seeders:

```bash
php artisan migrate --seed
```

Levantar Laravel:

```bash
php artisan serve
```

## Instalacion del frontend

Entrar a la carpeta del cliente:

```bash
cd C:\xampp\htdocs\tecnoweb2\frontend
npm install
copy .env.example .env
```

Variables esperadas:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
VITE_API_KEY=aero123
```

Levantar React:

```bash
npm run dev
```

## Variables de entorno

### Backend Laravel

- `APP_NAME`: nombre de la aplicacion
- `APP_URL`: URL base del backend
- `FRONTEND_URL`: URL recomendada del cliente React
- `DB_CONNECTION`: tipo de conexion
- `DB_HOST`: host de la base de datos
- `DB_PORT`: puerto de MySQL o MariaDB
- `DB_DATABASE`: nombre de la base
- `DB_USERNAME`: usuario
- `DB_PASSWORD`: contrasena
- `API_KEY`: clave simple para operaciones de escritura en la API

### Frontend React

- `VITE_API_BASE_URL`: URL de la API Laravel
- `VITE_API_KEY`: misma clave definida en el backend

## Base de datos y trabajo en equipo

La estructura de base de datos se comparte por GitHub mediante:

- migraciones
- seeders

No se debe compartir el archivo `.env` ni exportaciones locales de base de datos como si fueran la unica fuente oficial.

El flujo recomendado para compartir el proyecto es:

1. Clonar el repositorio
2. Crear la base de datos vacia
3. Configurar `.env`
4. Ejecutar `php artisan migrate --seed`

Eso garantiza que otro integrante o docente pueda reconstruir el sistema sin depender de archivos privados.

## Archivos que si se suben a GitHub

- `app/`
- `config/`
- `database/migrations/`
- `database/seeders/`
- `routes/`
- `frontend/src/`
- `frontend/package.json`
- `frontend/vite.config.js`
- `frontend/.env.example`
- `composer.json`
- `composer.lock`
- `package.json`
- `package-lock.json`
- `.env.example`
- `.gitignore`
- `README.md`
- `docs/`

## Archivos que no se suben a GitHub

- `.env`
- `frontend/.env`
- `vendor/`
- `node_modules/`
- `frontend/node_modules/`
- `frontend/dist/`
- archivos generados localmente
- credenciales reales

## Seguridad basica para GitHub

- Nunca subir `.env`
- Nunca subir contrasenas reales de base de datos
- Nunca subir tokens personales
- Usar siempre `.env.example` para mostrar la estructura esperada
- Verificar `.gitignore` antes del primer commit

## Endpoints destacados

- `GET /api/dashboard/resumen`
- `GET /api/vuelos`
- `GET /api/reservas`
- `GET /api/pasajeros`
- `POST /api/aviones`
- `POST /api/rutas`
- `POST /api/vuelos`
- `POST /api/pasajeros`
- `POST /api/reservas`
- `PATCH /api/vuelos/{id}/estado`

## Documentacion interna

Las fases del proyecto quedaron documentadas en:

- `docs/01-arquitectura-general.md`
- `docs/02-base-de-datos.md`
- `docs/03-backend-laravel.md`
- `docs/04-frontend-react.md`
- `docs/05-dashboard-y-experiencia-visual.md`
- `docs/06-conexion-del-sistema.md`
- `docs/07-github-y-base-de-datos-compartida.md`

## Validacion realizada

Durante esta sesion se verifico el proyecto en entorno local con:

- PHP `8.3.26`
- Node.js `24.12.0`
- npm `11.6.2`
- Git `2.47.1`

Comprobaciones realizadas:

- `php artisan migrate:fresh --seed`
- `php artisan migrate:status`
- `php artisan route:list --path=api`
- `npm install` en `frontend/`
- `npm run build` en `frontend/`
- inicializacion del repositorio Git local y commit base

Estado actual del repositorio:

- rama principal: `main`
- commit base: `feat: initialize AeroLink project`
- remoto GitHub: pendiente de configurar

## Recomendacion para la presentacion

Para una defensa clara del proyecto:

1. Mostrar arquitectura general
2. Explicar entidades y relaciones
3. Levantar dashboard
4. Registrar avion, ruta, vuelo y pasajero
5. Crear reserva
6. Cambiar estado del vuelo
7. Volver al dashboard y mostrar el impacto visual
