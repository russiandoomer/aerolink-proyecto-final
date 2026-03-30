# AeroLink - Conexion del Sistema

## 1. Objetivo de esta fase

Esta guia explica como levantar el proyecto completo en una maquina local, conectando:

- base de datos MySQL o MariaDB
- backend Laravel
- frontend React

La idea es que cualquier docente, companero o integrante del equipo pueda montar el sistema sin depender de configuraciones ocultas.

## 2. Requisitos previos

### Backend

- PHP `8.1` o superior
- Composer
- MySQL o MariaDB

### Frontend

- Node.js `18` o superior
- npm

### Importante

En esta sesion se detecto que el entorno actual tiene PHP `8.0.30`, pero el proyecto Laravel requiere PHP `>= 8.1.0`.  
Para ejecutar migraciones, seeders y servidor Laravel, el equipo debe usar PHP 8.1 o superior.

## 3. Estructura general de ejecucion

El proyecto se levanta en dos procesos separados:

1. Laravel como API en `http://127.0.0.1:8000`
2. React como cliente en `http://127.0.0.1:5173`

El frontend consume la API usando:

- `VITE_API_BASE_URL=http://127.0.0.1:8000/api`

## 4. Paso 1: crear la base de datos

Desde MySQL o phpMyAdmin, crear una base de datos vacia:

```sql
CREATE DATABASE tecnoweb2;
```

Si desean otro nombre, tambien es valido, pero luego debe coincidir en el archivo `.env`.

## 5. Paso 2: configurar Laravel

Ubicarse en la raiz del proyecto:

```bash
cd C:\xampp\htdocs\tecnoweb2
```

Instalar dependencias del backend:

```bash
composer install
```

Copiar variables de entorno:

```bash
copy .env.example .env
```

Generar clave de aplicacion:

```bash
php artisan key:generate
```

## 6. Paso 3: editar `.env` del backend

Configurar estos valores en el archivo `.env` de Laravel:

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

`API_KEY` sera usada por el frontend para crear, editar o eliminar datos.

## 7. Paso 4: ejecutar migraciones y seeders

Una vez configurada la base de datos:

```bash
php artisan migrate --seed
```

Esto creara:

- tablas del sistema
- catalogo de estados de vuelo
- datos demo de aerolinea, aeropuertos, flota, rutas, vuelos, pasajeros y reservas

## 8. Paso 5: levantar la API Laravel

Ejecutar:

```bash
php artisan serve
```

Laravel quedara disponible normalmente en:

```text
http://127.0.0.1:8000
```

## 9. Paso 6: configurar el frontend React

Entrar a la carpeta del cliente:

```bash
cd C:\xampp\htdocs\tecnoweb2\frontend
```

Instalar dependencias:

```bash
npm install
```

Copiar variables de entorno:

```bash
copy .env.example .env
```

Contenido esperado:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
VITE_API_KEY=aero123
```

## 10. Paso 7: levantar React

Ejecutar:

```bash
npm run dev
```

El frontend normalmente quedara en:

```text
http://127.0.0.1:5173
```

## 11. Flujo de conexion entre frontend y backend

El flujo final sera:

1. React envia peticiones HTTP a Laravel.
2. Laravel consulta MySQL.
3. Laravel devuelve JSON.
4. React renderiza dashboard, tablas y formularios.

Para operaciones de escritura, el frontend manda el header:

```http
X-API-KEY: aero123
```

Eso ya esta configurado en:

- `frontend/src/api/http.js`

## 12. Endpoints clave para probar integracion

### Lectura

- `GET /api/dashboard/resumen`
- `GET /api/vuelos`
- `GET /api/reservas`
- `GET /api/pasajeros`
- `GET /api/rutas`
- `GET /api/aviones`

### Escritura

- `POST /api/aviones`
- `POST /api/rutas`
- `POST /api/vuelos`
- `POST /api/pasajeros`
- `POST /api/reservas`
- `PATCH /api/vuelos/{id}/estado`

## 13. CORS

La configuracion de CORS ya permite consumo desde React porque en Laravel se encontro:

- `allowed_origins => ['*']`
- `allowed_methods => ['*']`

Archivo:

- `config/cors.php`

## 14. Orden recomendado para una demo funcional

Una vez levantado todo, el flujo ideal de presentacion es:

1. Abrir el dashboard
2. Revisar vuelos y estados
3. Registrar un avion
4. Registrar una ruta
5. Registrar un vuelo
6. Registrar un pasajero
7. Crear una reserva
8. Cambiar el estado del vuelo
9. Volver al dashboard y mostrar el cambio

## 15. Problemas comunes

### Error por version de PHP

Si Laravel no arranca y aparece un mensaje de version, revisar que PHP sea `8.1+`.

### Error de conexion a base de datos

Verificar:

- nombre de base
- usuario
- puerto
- si MySQL esta iniciado en XAMPP

### Error 401 en POST, PUT, DELETE o PATCH

Revisar que el frontend tenga:

```env
VITE_API_KEY=aero123
```

Y que el backend tenga:

```env
API_KEY=aero123
```

### Frontend sin datos

Verificar:

- que Laravel este corriendo en `127.0.0.1:8000`
- que React apunte a `/api`
- que ya se hayan ejecutado migraciones y seeders

## 16. Archivos clave de esta fase

- `.env.example`
- `frontend/.env.example`
- `frontend/src/api/http.js`
- `config/cors.php`
- `docs/06-conexion-del-sistema.md`

## 17. Siguiente fase

La siguiente entrega sera la preparacion para GitHub:

- estructura final del repositorio
- README profesional
- archivos que si se suben
- archivos que no se suben
- recomendaciones para no subir credenciales
- pasos para publicar correctamente
