# AeroLink - Dashboard y Experiencia Visual

## 1. Objetivo de esta fase

En esta etapa el sistema dejo de ser solo un conjunto de CRUD y paso a tener una capa visual mas cercana a una plataforma real de operaciones aereas.

Se trabajaron tres frentes al mismo tiempo:

- dashboard con indicadores y graficas
- refinamiento visual general
- animaciones suaves y discretas

## 2. Dashboard implementado

El dashboard principal ahora incluye:

- bloque hero con estado general de la operacion
- tarjetas metricas
- grafica de distribucion por estado de vuelo
- grafica de reservas por clase
- grafica de ocupacion por vuelo
- grafica de rutas con mayor rotacion
- agenda de proximas salidas
- resumen textual de estados para exposicion

Archivo principal:

- `frontend/src/pages/DashboardPage.jsx`

## 3. Librerias utilizadas

### `recharts`

Se integro para mostrar estadisticas del panel sin recargar la interfaz.

Graficas usadas:

- `PieChart`
- `BarChart`
- `AreaChart`
- `ResponsiveContainer`
- `Tooltip`

### `framer-motion`

Se uso de manera discreta para:

- entrada suave de vistas
- aparicion de tarjetas metricas
- transicion de paneles
- sensacion de interfaz viva pero sobria

## 4. Componentes nuevos

Se agregaron componentes auxiliares para mantener el codigo modular:

- `frontend/src/components/common/FadeInBlock.jsx`
- `frontend/src/components/dashboard/ChartPanel.jsx`
- `frontend/src/components/dashboard/DashboardHero.jsx`

Tambien se mejoraron:

- `frontend/src/components/common/MetricCard.jsx`
- `frontend/src/layouts/DashboardLayout.jsx`
- `frontend/src/components/modules/ResourceManager.jsx`

## 5. Direccion visual aplicada

Se reforzo una linea de estilo pensada para verse profesional y realista:

- azul oscuro institucional
- fondo claro con textura muy suave
- tarjetas blancas y limpias
- sombras ligeras
- bordes redondeados modernos
- estados de vuelo con badges de color
- tablas elegantes pero sencillas

Archivo principal de estilos:

- `frontend/src/styles/global.css`

## 6. Animaciones incorporadas

Las animaciones se mantuvieron moderadas para no verse artificiales:

- aparicion vertical ligera en secciones
- transicion entre paginas
- hover suave en botones, tarjetas y paneles
- loader giratorio limpio

No se usaron efectos exagerados, rebotes fuertes ni movimientos innecesarios.

## 7. Justificacion academica

Esta solucion es defendible porque:

- usa librerias conocidas y faciles de explicar
- separa logica, componentes y estilo
- mejora la UX sin meter complejidad innecesaria
- se parece a un panel administrativo real

## 8. Archivos clave de esta fase

- `frontend/src/pages/DashboardPage.jsx`
- `frontend/src/components/common/FadeInBlock.jsx`
- `frontend/src/components/common/MetricCard.jsx`
- `frontend/src/components/dashboard/ChartPanel.jsx`
- `frontend/src/components/dashboard/DashboardHero.jsx`
- `frontend/src/layouts/DashboardLayout.jsx`
- `frontend/src/components/modules/ResourceManager.jsx`
- `frontend/src/styles/global.css`

## 9. Limitacion actual del entorno

No se pudo ejecutar `npm install` ni `npm run build` en esta sesion porque el entorno actual no dispone de `node` ni `npm` por consola.

El codigo quedo preparado, pero la comprobacion de compilacion real debe hacerse en una maquina con Node.js instalado.

## 10. Siguiente fase

La siguiente entrega sera la guia para conectar todo:

- backend Laravel
- base de datos
- frontend React
- variables de entorno
- ejecucion local
