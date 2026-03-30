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

Si aun no existe repositorio local:

```bash
git init
git add .
git commit -m "Proyecto final AeroLink"
git branch -M main
git remote add origin https://github.com/USUARIO/REPOSITORIO.git
git push -u origin main
```

Si el repositorio local ya existe, como en esta entrega:

```bash
git add .
git commit -m "Actualizacion del proyecto AeroLink"
git remote add origin https://github.com/USUARIO/REPOSITORIO.git
git push -u origin main
```

Si ya existe tambien el remoto:

```bash
git add .
git commit -m "Actualizacion del proyecto AeroLink"
git push
```

## 9. Estado Git actual de AeroLink

En esta entrega el proyecto ya quedo:

- inicializado con Git
- en rama `main`
- con commit base local realizado
- con `.gitignore` revisado
- sin remoto configurado todavia

El commit local creado fue:

```bash
feat: initialize AeroLink project
```

## 10. Configurar autor antes de subir

Si el estudiante quiere que el historial muestre su nombre real:

```bash
git config user.name "Tu Nombre"
git config user.email "tu_correo@example.com"
git commit --amend --reset-author --no-edit
```

Eso reescribe solo el commit local mas reciente para que figure con la autoria correcta antes del `push`.

## 11. Paso a paso para crear el remoto en GitHub

1. Entrar a [GitHub](https://github.com)
2. Hacer clic en `New repository`
3. Escribir un nombre, por ejemplo: `aerolink-proyecto-final`
4. Elegir visibilidad `Public` o `Private`
5. No marcar `Add a README`, `Add .gitignore` ni `Choose a license`
6. Crear el repositorio
7. Copiar la URL HTTPS del remoto
8. En la terminal del proyecto ejecutar:

```bash
git remote add origin https://github.com/USUARIO/REPOSITORIO.git
git push -u origin main
```

Para confirmar la vinculacion:

```bash
git remote -v
```

## 12. Recomendaciones antes del primer push

- revisar `.gitignore`
- confirmar que `.env` no este agregado
- confirmar que `frontend/.env` no este agregado
- confirmar que `vendor/` y `node_modules/` no esten agregados
- dejar el `README.md` actualizado
- verificar que `docs/` este incluido

## 13. Como permitir que otro docente o companero monte el sistema

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

## 14. Recomendaciones para no subir credenciales ni archivos sensibles

- usar siempre variables de entorno
- no escribir contrasenas reales en archivos versionados
- no dejar tokens en capturas o commits
- usar claves de demostracion para entorno academico
- revisar `git status` antes de cada commit

## 15. Archivos clave de esta fase

- `README.md`
- `.gitignore`
- `.env.example`
- `frontend/.env.example`
- `database/migrations/`
- `database/seeders/`
- `docs/07-github-y-base-de-datos-compartida.md`

## 16. Cierre

Con esta estructura, el proyecto queda listo para subirse a GitHub de forma ordenada, presentable y segura, manteniendo la base de datos compartible por migraciones y seeders en lugar de depender de archivos locales privados.
