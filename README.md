# Sistema de Taller Mecanico

Sistema local para administracion de un taller mecanico, disenado para operar en red interna desde Android, computadoras de escritorio y un servidor local instalado en una PC comun del taller.

El proyecto arrancara como monorepo para compartir tipos, validaciones y componentes entre la app web, la API, la app Android y la app de escritorio.

## Objetivo

Construir una plataforma local, mantenible y actualizable para gestionar:

- Clientes
- Vehiculos
- Empleados
- Proveedores
- Ordenes de trabajo
- Cotizaciones
- Presupuestos
- Facturas
- Reportes
- Usuarios, roles y permisos

La primera version servira como prototipo funcional y el alcance crecera conforme llegue retroalimentacion real del taller.

## Arquitectura General

```text
Dispositivos Android         App Capacitor
Computadoras de escritorio   App Tauri o navegador
Tablets / laptops            Navegador local
        |
        | Red local del taller
        v
Servidor local del taller
        |
        +-- Frontend web
        +-- API NestJS
        +-- PostgreSQL
```

El servidor local se ejecutara en una PC del taller. Los clientes se conectaran por IP local, por ejemplo:

```text
http://192.168.1.50
```

## Stack Del Proyecto

### Monorepo

**pnpm workspaces**

Gestiona varias aplicaciones y paquetes dentro del mismo repositorio. Esto permite compartir codigo entre frontend, backend, base de datos, escritorio y movil sin duplicar logica.

### Frontend

**Next.js + React + TypeScript**

Interfaz principal del sistema. Se usara como aplicacion web responsive compatible con escritorio, tablets y Android. La logica de negocio fuerte vivira en la API para mantener la app cliente ligera y facil de empaquetar.

Consideracion importante: para que el mismo frontend pueda usarse con Capacitor y Tauri, evitaremos depender de funcionalidades que requieran un servidor Next.js dedicado para la experiencia cliente. El frontend consumira la API de NestJS.

### UI

**Tailwind CSS + shadcn/ui**

Tailwind sera la base de estilos. shadcn/ui aportara componentes accesibles y personalizables para construir pantallas administrativas densas, claras y consistentes.

### Backend

**NestJS + TypeScript**

API central del sistema. Contendra reglas de negocio, autenticacion, autorizacion, validaciones, modulos de dominio y acceso a datos mediante Prisma.

### Base De Datos

**PostgreSQL**

Base de datos relacional para soportar operaciones multiusuario, reportes, historial, integridad transaccional y crecimiento del sistema.

En desarrollo y despliegue local se levantara mediante Docker Compose.

### ORM Y Migraciones

**Prisma + Prisma Migrate**

Prisma definira el modelo de datos, generara el cliente de base de datos y administrara migraciones versionadas. Las migraciones seran parte central del proceso de actualizacion.

### Autenticacion Y Permisos

**JWT + roles/permisos**

El sistema tendra usuarios autenticados con JWT. Desde el inicio se contemplan roles como:

- Administrador
- Tecnico

Mas adelante podran agregarse roles como recepcion, almacen, caja o supervisor.

### Android

**Capacitor**

Empaquetara el frontend como app Android instalable. La app se conectara al servidor local del taller mediante la red interna.

### Escritorio

**Tauri**

Empaquetara el frontend como app de escritorio para Windows. Se prefiere Tauri sobre Electron por ser mas ligero y usar el WebView del sistema.

Electron queda como alternativa si en el futuro aparece una necesidad especifica que Tauri no cubra.

### Actualizaciones De Escritorio

**Tauri Updater Plugin**

Permitira un flujo de actualizacion tipo:

```text
Actualizacion disponible -> Descargar -> Instalar -> Reiniciar app
```

Para esto el proyecto necesitara:

- Versionado SemVer
- Builds firmados
- Un canal de releases
- Un endpoint o manifiesto de actualizacion
- Control de compatibilidad con la API y la base de datos

### Despliegue Local

**Docker Compose**

Usado para levantar servicios del sistema sin instalar cada dependencia manualmente en la PC del taller.

Servicios previstos:

- PostgreSQL
- API NestJS
- Frontend web
- Herramientas administrativas opcionales, como pgAdmin

### Releases Y Automatizacion

**GitHub Actions + GitHub Releases**

GitHub Actions se usara para validar builds, ejecutar pruebas y generar artefactos. GitHub Releases podra servir como canal inicial para distribuir:

- Instaladores Tauri
- APKs de Android
- Imagenes Docker versionadas
- Notas de version

### Backups

**pg_dump**

Antes de actualizaciones importantes se deberan generar respaldos de PostgreSQL. Esto sera obligatorio antes de ejecutar migraciones destructivas o cambios mayores.

## Estructura Inicial

```text
SistemaTallerMecanico/
  apps/
    web/        Frontend Next.js
    api/        Backend NestJS
    mobile/     Envoltura Android con Capacitor
    desktop/    Envoltura de escritorio con Tauri
  packages/
    database/   Prisma schema, migraciones y cliente
    shared/     Tipos, DTOs y validaciones compartidas
    ui/         Componentes compartidos
  docker/       Configuracion auxiliar de despliegue
  scripts/      Automatizaciones del proyecto
```

## Flujo De Desarrollo Esperado

1. Desarrollar la API, frontend y base de datos en la maquina de desarrollo.
2. Probar PostgreSQL y servicios locales con Docker Compose.
3. Empaquetar escritorio con Tauri.
4. Empaquetar Android con Capacitor.
5. Publicar versiones en GitHub Releases.
6. Actualizar el servidor local del taller con Docker Compose.
7. Actualizar clientes de escritorio y Android desde el canal de releases.

## Como Ejecutarlo En Desarrollo

Requisitos: Node.js 24 o superior, pnpm 11 y Docker Desktop.

1. Crear `.env` a partir de `.env.example` y reemplazar todos los valores `replace-with-...`.
   La contrasena de `POSTGRES_PASSWORD` debe coincidir con la que aparece dentro de `DATABASE_URL`.
2. Levantar PostgreSQL:

   ```bash
   pnpm docker:up
   ```

3. Instalar dependencias, aplicar migraciones y crear el usuario administrador:

   ```bash
   pnpm setup
   ```

4. Arrancar la API y la web:

   ```bash
   pnpm dev
   ```

- Web: http://localhost:3000 (iniciar sesion con `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`)
- API: http://localhost:4000 (comprobacion de salud en `/health`)

Desde otro dispositivo de la red se entra con la IP del servidor, por ejemplo `http://192.168.1.50:3000`.
Esa direccion debe agregarse a `CORS_ORIGINS` en `.env`.

## Comandos

```bash
pnpm dev           # API + web en modo desarrollo
pnpm build         # Compila todos los paquetes
pnpm lint          # Revision de tipos
pnpm docker:up     # Levanta PostgreSQL
pnpm docker:down   # Detiene los contenedores
pnpm db:migrate    # Crea una migracion nueva tras cambiar schema.prisma
pnpm db:deploy     # Aplica migraciones pendientes (servidor del taller)
pnpm db:seed       # Crea el usuario administrador si no existe
pnpm db:studio     # Explorador visual de la base de datos
```

## Variables De Entorno

Usar `.env.example` como referencia para crear `.env` local.

Nunca se deben subir secretos reales al repositorio.

## Estado Actual

Prototipo inicial funcional:

- Base de datos: usuarios con roles, clientes y vehiculos (Prisma 6 + PostgreSQL), con migracion inicial.
- API: inicio de sesion con JWT, roles `ADMIN` y `TECNICO`, y altas, consultas, cambios y bajas de clientes y vehiculos.
  Solo un administrador puede eliminar registros y gestionar usuarios.
- Web: inicio de sesion, panel con totales, clientes (busqueda, alta, detalle y edicion), vehiculos y usuarios.
  Se compila como sitio estatico (`output: "export"`) para reutilizarse despues en Capacitor y Tauri.

Pendiente: ordenes de trabajo, cotizaciones, presupuestos, facturas, reportes, empleados, proveedores,
Dockerfiles de API y web, y las envolturas Android y escritorio.

