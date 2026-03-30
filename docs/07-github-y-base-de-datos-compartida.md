# AeroLink - GitHub y Base de Datos Compartida

## 1. Objetivo de esta fase

Esta guia resume como dejar el proyecto listo para GitHub y como compartir correctamente la base de datos sin subir archivos sensibles.

## 2. Estructura recomendada para el repositorio

```text
tecnoweb2/
├── app/
├── config/
├── database/
│   ├── migrations/
│   └── seeders/
├── docs/
├── frontend/
│   ├── src/
│   ├── package.json
│   ├── vite.config.js
│   └── .env.example
├── routes/
├── .env.example
├── .gitignore
├── composer.json
├── composer.lock
└── README.md
```

## 3. Archivos que si deben subirse

### Backend

- `app/`
- `bootstrap/`
- `config/`
- `database/migrations/`
- `database/seeders/`
- `routes/`
- `tests/`
- `composer.json`
- `composer.lock`
- `.env.example`

### Frontend

- `frontend/src/`
- `frontend/index.html`
- `frontend/package.json`
- `frontend/vite.config.js`
- `frontend/.env.example`

### Documentacion

- `README.md`
- `docs/`
- `.gitignore`

## 4. Archivos que no deben subirse

- `.env`
- `frontend/.env`
- `vendor/`
- `node_modules/`
- `frontend/node_modules/`
- `frontend/dist/`
- claves privadas
- credenciales reales
- archivos generados localmente

## 5. Manejo correcto de la base de datos con GitHub

### Lo correcto

Compartir la estructura mediante:

- migraciones
- seeders

Eso permite que cualquier persona reconstruya la base de datos con comandos Laravel.

### Lo que no se recomienda

- subir exportaciones locales como unica fuente de verdad
- subir archivos `.sql` personales con datos sensibles
- compartir una base local ya armada sin migraciones

## 6. Como compartir la estructura de la base de datos

El flujo academico recomendado es:

1. Subir migraciones a GitHub
2. Subir seeders de demostracion
3. Compartir `.env.example`
4. Explicar en README como ejecutar `php artisan migrate --seed`

Con eso, otro docente o companero puede montar la misma base de datos desde cero.

## 7. Seeders y datos demo

En este proyecto ya se dejaron datos de ejemplo para:

- estados de vuelo
- aerolinea
- aeropuertos
- aviones
- rutas
- vuelos
- pasajeros
- reservas

Eso ayuda mucho para GitHub porque el sistema puede mostrarse funcional apenas se ejecute:

```bash
php artisan migrate --seed
```

## 8. Pasos recomendados para subir el proyecto a GitHub

Cuando el equipo tenga Git disponible en su maquina:

```bash
git init
git add .
git commit -m "Proyecto final AeroLink"
git branch -M main
git remote add origin https://github.com/USUARIO/REPOSITORIO.git
git push -u origin main
```

Si el repositorio ya existe:

```bash
git add .
git commit -m "Actualizacion del proyecto AeroLink"
git push
```

## 9. Recomendaciones antes del primer push

- revisar `.gitignore`
- confirmar que `.env` no este agregado
- confirmar que `frontend/.env` no este agregado
- confirmar que `vendor/` y `node_modules/` no esten agregados
- dejar el `README.md` actualizado
- verificar que `docs/` este incluido

## 10. Como permitir que otro docente o companero monte el sistema

El repositorio debe incluir:

- codigo fuente
- migraciones
- seeders
- `.env.example`
- `frontend/.env.example`
- README con pasos de instalacion

El otro usuario solo tendra que:

1. Clonar el repositorio
2. Crear una base de datos vacia
3. Configurar `.env`
4. Ejecutar `composer install`
5. Ejecutar `php artisan key:generate`
6. Ejecutar `php artisan migrate --seed`
7. Ejecutar `npm install` en `frontend`
8. Ejecutar `npm run dev`

## 11. Recomendaciones para no subir credenciales ni archivos sensibles

- usar siempre variables de entorno
- no escribir contrasenas reales en archivos versionados
- no dejar tokens en capturas o commits
- usar claves de demostracion para entorno academico
- revisar `git status` antes de cada commit

## 12. Archivos clave de esta fase

- `README.md`
- `.gitignore`
- `.env.example`
- `frontend/.env.example`
- `database/migrations/`
- `database/seeders/`
- `docs/07-github-y-base-de-datos-compartida.md`

## 13. Cierre

Con esta estructura, el proyecto queda listo para subirse a GitHub de forma ordenada, presentable y segura, manteniendo la base de datos compartible por migraciones y seeders en lugar de depender de archivos locales privados.
