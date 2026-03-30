# AeroLink - Backend Laravel

## 1. Enfoque del backend

El backend se organizo como una API RESTful en Laravel 10, pensada para ser consumida por un frontend en React. La logica se mantuvo simple, modular y defendible:

- un modelo por entidad
- un controlador API por modulo
- validaciones directas en los controladores
- relaciones Eloquent claras
- respuestas JSON faciles de consumir

La idea no es simular una arquitectura empresarial enorme, sino un backend academico bien hecho y ordenado.

## 2. Estructura principal

```text
app/
├── Http/
│   ├── Controllers/
│   │   └── Api/
│   │       ├── AerolineaController.php
│   │       ├── AeropuertoController.php
│   │       ├── AvionController.php
│   │       ├── DashboardController.php
│   │       ├── EstadoVueloController.php
│   │       ├── PasajeroController.php
│   │       ├── ReservaController.php
│   │       ├── RutaController.php
│   │       └── VueloController.php
│   └── Middleware/
│       └── EnsureApiKey.php
├── Models/
│   ├── Aerolinea.php
│   ├── Aeropuerto.php
│   ├── Avion.php
│   ├── EstadoVuelo.php
│   ├── Pasajero.php
│   ├── Reserva.php
│   ├── Ruta.php
│   ├── User.php
│   └── Vuelo.php
routes/
└── api.php
```

## 3. Modelos implementados

### `Aerolinea`

- Relacion con `aviones`
- Relacion con `vuelos`

### `Aeropuerto`

- Relacion con `rutasOrigen`
- Relacion con `rutasDestino`

### `Avion`

- Pertenece a `aerolinea`
- Tiene muchos `vuelos`

### `Ruta`

- Pertenece a `aeropuertoOrigen`
- Pertenece a `aeropuertoDestino`
- Tiene muchos `vuelos`

### `EstadoVuelo`

- Tiene muchos `vuelos`

### `Vuelo`

- Pertenece a `aerolinea`
- Pertenece a `avion`
- Pertenece a `ruta`
- Pertenece a `estadoVuelo`
- Tiene muchas `reservas`

### `Pasajero`

- Tiene muchas `reservas`

### `Reserva`

- Pertenece a `vuelo`
- Pertenece a `pasajero`
- Pertenece opcionalmente a `user`

## 4. Endpoints REST principales

### Dashboard

- `GET /api/dashboard/resumen`

Devuelve:

- totales generales
- vuelos por estado
- reservas por clase
- ocupacion por vuelo
- rutas mas usadas
- proximos vuelos

### Aerolineas

- `GET /api/aerolineas`
- `GET /api/aerolineas/{id}`
- `POST /api/aerolineas`
- `PUT /api/aerolineas/{id}`
- `DELETE /api/aerolineas/{id}`

### Aeropuertos

- `GET /api/aeropuertos`
- `GET /api/aeropuertos/{id}`
- `POST /api/aeropuertos`
- `PUT /api/aeropuertos/{id}`
- `DELETE /api/aeropuertos/{id}`

### Aviones

- `GET /api/aviones`
- `GET /api/aviones/{id}`
- `POST /api/aviones`
- `PUT /api/aviones/{id}`
- `DELETE /api/aviones/{id}`

### Rutas

- `GET /api/rutas`
- `GET /api/rutas/{id}`
- `POST /api/rutas`
- `PUT /api/rutas/{id}`
- `DELETE /api/rutas/{id}`

### Estados de vuelo

- `GET /api/estados-vuelo`
- `GET /api/estados-vuelo/{id}`

### Vuelos

- `GET /api/vuelos`
- `GET /api/vuelos/{id}`
- `POST /api/vuelos`
- `PUT /api/vuelos/{id}`
- `DELETE /api/vuelos/{id}`
- `PATCH /api/vuelos/{id}/estado`

### Pasajeros

- `GET /api/pasajeros`
- `GET /api/pasajeros/{id}`
- `POST /api/pasajeros`
- `PUT /api/pasajeros/{id}`
- `DELETE /api/pasajeros/{id}`

### Reservas

- `GET /api/reservas`
- `GET /api/reservas/{id}`
- `POST /api/reservas`
- `PUT /api/reservas/{id}`
- `DELETE /api/reservas/{id}`

## 5. Proteccion de escritura

Las operaciones de escritura quedaron protegidas con el middleware `api.key`.

Header requerido:

```http
X-API-KEY: aero123
```

En produccion o presentacion final ese valor debe salir desde `.env`:

- `API_KEY=aero123`

Los `GET` quedaron publicos para facilitar pruebas del frontend y consumo desde dashboard.

## 6. Validaciones importantes

Se incorporaron validaciones pensadas para que el sistema se sienta coherente:

### En rutas

- El aeropuerto de origen no puede ser igual al de destino.
- No se puede repetir una ruta con el mismo origen y destino.

### En vuelos

- El avion debe pertenecer a la aerolinea elegida.
- El avion debe estar en estado `activo`.
- La ruta debe estar activa.
- La capacidad del vuelo no puede superar la capacidad del avion.
- La fecha de llegada debe ser posterior a la salida.

### En pasajeros

- El numero de documento es unico.
- El email es opcional pero valido si se envia.

### En reservas

- No se permite duplicar una reserva activa del mismo pasajero en el mismo vuelo.
- No se permite repetir un asiento ocupado en el mismo vuelo.
- No se permite exceder la capacidad disponible del vuelo.
- No se pueden crear reservas activas para vuelos cancelados o ya finalizados.

## 7. Filtros disponibles

La API ya soporta filtros utiles para las tablas del frontend:

### Aerolineas

- `search`
- `activa`
- `per_page`

### Aeropuertos

- `search`
- `activo`
- `per_page`

### Aviones

- `search`
- `aerolinea_id`
- `estado`
- `per_page`

### Rutas

- `search`
- `aeropuerto_origen_id`
- `aeropuerto_destino_id`
- `activa`
- `per_page`

### Vuelos

- `search`
- `aerolinea_id`
- `avion_id`
- `ruta_id`
- `estado_vuelo_id`
- `fecha_salida`
- `per_page`

### Pasajeros

- `search`
- `tipo_documento`
- `per_page`

### Reservas

- `search`
- `vuelo_id`
- `pasajero_id`
- `estado`
- `clase`
- `per_page`

## 8. Archivos clave de esta fase

- `app/Models/Aerolinea.php`
- `app/Models/Aeropuerto.php`
- `app/Models/Avion.php`
- `app/Models/EstadoVuelo.php`
- `app/Models/Pasajero.php`
- `app/Models/Reserva.php`
- `app/Models/Ruta.php`
- `app/Models/Vuelo.php`
- `app/Http/Controllers/Api/AerolineaController.php`
- `app/Http/Controllers/Api/AeropuertoController.php`
- `app/Http/Controllers/Api/AvionController.php`
- `app/Http/Controllers/Api/DashboardController.php`
- `app/Http/Controllers/Api/EstadoVueloController.php`
- `app/Http/Controllers/Api/PasajeroController.php`
- `app/Http/Controllers/Api/ReservaController.php`
- `app/Http/Controllers/Api/RutaController.php`
- `app/Http/Controllers/Api/VueloController.php`
- `routes/api.php`

## 9. Ejemplos de flujo con la API

Flujo minimo pedido por el proyecto:

1. Registrar avion con `POST /api/aviones`
2. Registrar ruta con `POST /api/rutas`
3. Registrar vuelo con `POST /api/vuelos`
4. Registrar pasajero con `POST /api/pasajeros`
5. Crear reserva con `POST /api/reservas`
6. Listar vuelos con `GET /api/vuelos`
7. Cambiar estado con `PATCH /api/vuelos/{id}/estado`
8. Consultar dashboard con `GET /api/dashboard/resumen`

## 10. Siguiente fase

La siguiente entrega sera el frontend React:

- estructura de carpetas
- layout general
- paginas principales
- consumo de API
- tablas y formularios
- base visual del sistema
