# AeroLink

## 1. Nombre del sistema

**AeroLink**  
Sistema web de simulacion y logistica aerea para la gestion de vuelos, reservas, rutas y monitoreo de flota.

## 2. Descripcion general

AeroLink es una plataforma web academica orientada a la administracion operativa de una aerolinea. El sistema permite registrar aeronaves, rutas, vuelos, pasajeros y reservas, ademas de visualizar indicadores clave en un dashboard central. Su enfoque combina una interfaz moderna en React con una API RESTful construida en Laravel y una base de datos relacional en MySQL o MariaDB.

La idea es que el proyecto se vea serio, funcional y defendible en clase: suficientemente profesional para destacar, pero con una complejidad razonable para un equipo universitario.

## 3. Objetivo general

Desarrollar un sistema web de simulacion y logistica aerea que permita administrar la operacion basica de una aerolinea mediante la gestion de vuelos, pasajeros, rutas, reservas y flota, ofreciendo informacion actualizada a traves de dashboards interactivos conectados a una API RESTful.

## 4. Objetivos especificos

- Registrar y administrar aviones o unidades de flota.
- Definir rutas entre aeropuertos y asociarlas a vuelos.
- Gestionar vuelos con estado operativo y capacidad.
- Registrar pasajeros y asociarlos a reservas.
- Permitir filtros y busquedas sobre vuelos, reservas y pasajeros.
- Mostrar estadisticas e indicadores operativos en un dashboard visual.
- Mantener una arquitectura clara, modular y facil de explicar.

## 5. Alcance del proyecto

El sistema cubrira operaciones academicas de una aerolinea:

- Gestion de aviones
- Gestion de aeropuertos
- Gestion de rutas
- Gestion de vuelos
- Gestion de pasajeros
- Gestion de reservas
- Estados de vuelo
- Dashboard con estadisticas operativas

Queda fuera del alcance:

- Pago en linea real
- Integracion con servicios externos de aerolineas
- Geolocalizacion en tiempo real
- Autenticacion empresarial compleja

## 6. Modulos del sistema

### Modulo de Dashboard

- Resumen general de vuelos, reservas, pasajeros y flota.
- Graficas de ocupacion, estados de vuelo y rutas mas utilizadas.
- Indicadores de cambios recientes.

### Modulo de Flota

- Registro de aviones.
- Datos como matricula, modelo, capacidad, estado operativo y fabricante.

### Modulo de Aeropuertos

- Registro de aeropuertos de origen y destino.
- Campos como nombre, ciudad, pais y codigo IATA.

### Modulo de Rutas

- Definicion de trayectos entre dos aeropuertos.
- Distancia estimada, duracion aproximada y estado de la ruta.

### Modulo de Vuelos

- Creacion de vuelos programados.
- Asociacion con avion, ruta y estado.
- Control de fecha, hora, capacidad y disponibilidad.

### Modulo de Pasajeros

- Registro de pasajeros con documento, nombres, contacto y nacionalidad.

### Modulo de Reservas

- Creacion de reservas ligadas a un pasajero y un vuelo.
- Numero de asiento, codigo de reserva y estado de la reserva.

### Modulo de Estados

- Seguimiento de estados como programado, embarcando, en vuelo, demorado, aterrizado y cancelado.

## 7. Flujo funcional principal

1. Registrar un avion.
2. Registrar aeropuertos.
3. Registrar una ruta entre aeropuertos.
4. Registrar un vuelo usando ruta y avion.
5. Registrar un pasajero.
6. Crear una reserva para el pasajero en un vuelo.
7. Consultar vuelos con filtros.
8. Cambiar el estado del vuelo.
9. Reflejar el cambio en el dashboard.

## 8. Arquitectura general recomendada

Se recomienda una arquitectura separada en dos capas principales:

### Backend

- Laravel 10
- API RESTful en `routes/api.php`
- Modelos Eloquent por entidad
- Controladores API por modulo
- Validaciones con Form Requests o validacion simple en controlador
- Seeders para datos de ejemplo

### Frontend

- React con Vite
- Consumo de API con Axios
- Componentes reutilizables
- Layout administrativo con navbar y sidebar ligera
- Dashboard con tarjetas, tablas y graficas

### Base de datos

- MySQL o MariaDB
- Relaciones claras y faciles de defender
- Migraciones versionadas en Laravel

## 9. Estructura general recomendada

```text
tecnoweb2/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   └── Api/
│   ├── Models/
│   └── Http/Requests/
├── database/
│   ├── migrations/
│   └── seeders/
├── routes/
│   └── api.php
├── resources/
│   └── js/
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── styles/
│   └── public/
└── docs/
```

## 10. Propuesta de paginas del frontend

- Login simple o acceso administrativo opcional
- Dashboard principal
- Gestion de vuelos
- Gestion de pasajeros
- Gestion de reservas
- Gestion de rutas
- Gestion de flota
- Vista de estados y filtros

## 11. Diseno visual recomendado

La interfaz debe transmitir confianza, limpieza y control operativo. No conviene usar un estilo demasiado futurista ni efectos exagerados.

### Direccion visual

- Fondo claro o gris muy suave
- Azul oscuro como color principal
- Blanco para superficies y tarjetas
- Gris medio para texto secundario
- Color de acento elegante: cian suave o verde azulado

### Sensacion del sistema

- Panel sobrio
- Corporativo
- Rapido
- Ordenado
- Moderno sin exceso

### Elementos clave

- Navbar limpia con marca del sistema
- Sidebar compacta con iconos discretos
- Tarjetas con borde suave y sombra ligera
- Tablas modernas con estados en badges
- Botones con hover suave y transicion corta
- Loader minimalista
- Graficas legibles con poco ruido visual

## 12. Stack tecnologico recomendado

- **Backend:** Laravel 10
- **Base de datos:** MySQL o MariaDB
- **Frontend:** React + Vite
- **HTTP Client:** Axios
- **Graficas:** Recharts
- **Iconos:** Lucide React
- **Alertas:** SweetAlert2
- **Notificaciones:** React Toastify
- **Animaciones:** Framer Motion
- **Estilos:** CSS modular propio o una base ligera con utilidades bien controladas

## 13. Criterios de calidad

- Codigo con nombres claros
- Archivos organizados por responsabilidad
- Logica de negocio simple y bien separada
- Interfaz consistente y responsive
- Validaciones basicas pero correctas
- Sin patrones demasiado avanzados o dificiles de explicar

## 14. Enfoque academico recomendado

Para que el proyecto se vea realista y no artificial:

- Evitar dashboards saturados
- Evitar animaciones innecesarias
- Usar datos coherentes con el dominio aereo
- Mantener formularios directos y comprensibles
- Priorizar una experiencia fluida sobre efectos visuales complejos

## 15. Proxima entrega

La siguiente fase sera el diseno de base de datos:

- entidades principales
- relaciones
- diagrama logico explicado
- migraciones Laravel
- seeders base
