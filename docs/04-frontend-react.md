# AeroLink - Frontend React

## 1. Enfoque del frontend

El cliente web se organizo como una aplicacion React separada del backend Laravel, ubicada en `frontend/`. Esto mantiene una division limpia entre:

- API REST en Laravel
- interfaz administrativa en React

La estructura fue pensada para que el proyecto sea:

- claro para defender
- modular
- rapido de entender
- visualmente serio sin verse exagerado

## 2. Estructura creada

```text
frontend/
├── .env.example
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── api/
    │   ├── http.js
    │   └── resources.js
    ├── components/
    │   ├── common/
    │   └── modules/
    ├── data/
    │   └── navigation.js
    ├── hooks/
    │   └── useCatalogs.js
    ├── layouts/
    │   └── DashboardLayout.jsx
    ├── pages/
    │   ├── AerolineasPage.jsx
    │   ├── AeropuertosPage.jsx
    │   ├── DashboardPage.jsx
    │   ├── FlotaPage.jsx
    │   ├── NotFoundPage.jsx
    │   ├── PasajerosPage.jsx
    │   ├── ReservasPage.jsx
    │   ├── RutasPage.jsx
    │   └── VuelosPage.jsx
    ├── routes/
    │   └── AppRouter.jsx
    ├── styles/
    │   └── global.css
    ├── utils/
    │   └── format.js
    ├── App.jsx
    └── main.jsx
```

## 3. Paginas principales incluidas

- `DashboardPage`
- `VuelosPage`
- `ReservasPage`
- `PasajerosPage`
- `RutasPage`
- `AeropuertosPage`
- `FlotaPage`
- `AerolineasPage`

## 4. Componentes reutilizables

Se dejaron componentes base para no repetir estructura en cada modulo:

- `PageHeader`
- `MetricCard`
- `StatusBadge`
- `LoadingState`
- `EmptyState`
- `DataTable`
- `ResourceManager`

El componente `ResourceManager` es el nucleo del panel CRUD y se usa para:

- filtros
- tabla
- paginacion simple
- formulario lateral
- crear
- editar
- eliminar

## 5. Consumo de API

La comunicacion con Laravel se centralizo en:

- `src/api/http.js`
- `src/api/resources.js`

Eso permite:

- definir `baseURL` desde variables de entorno
- enviar `X-API-KEY`
- reutilizar metodos para listar, crear, editar y eliminar

Variables esperadas:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
VITE_API_KEY=aero123
```

## 6. Modulos ya conectados a la API

Quedaron preparados para consumir los endpoints Laravel:

- vuelos
- reservas
- pasajeros
- rutas
- aeropuertos
- aviones
- aerolineas
- dashboard

## 7. Linea visual aplicada

Aunque la fase de estilos finos viene despues, ya se dejo una base coherente:

- fondo claro y neutro
- sidebar azul oscuro
- tarjetas blancas con sombra ligera
- tablas limpias
- formularios sobrios
- tipografia clara
- botones con transiciones suaves
- responsive para escritorio y movil

## 8. Lo que ya se puede defender en clase

- separacion frontend/backend
- consumo de API con Axios
- arquitectura por carpetas
- componentes reutilizables
- dashboard administrativo
- CRUD por modulos
- filtros y busquedas

## 9. Limitacion actual del entorno

No se pudo ejecutar instalacion ni build del frontend desde esta sesion porque en el entorno actual no estan disponibles `node` ni `npm` por linea de comandos.

Eso no impide dejar listo el codigo, pero la validacion de arranque quedara para el momento en que el equipo tenga Node.js instalado en la maquina.

## 10. Siguiente fase

El siguiente bloque sera:

- dashboard mas completo
- graficas
- indicadores visuales
- refinamiento de estilos
- microinteracciones y animaciones suaves
