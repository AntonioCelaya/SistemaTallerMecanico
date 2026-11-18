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

Desde un celular u otra computadora conectada a la misma red se entra con la IP del servidor,
por ejemplo `http://192.168.1.50:3000`. La IP se consulta con `ipconfig` (linea "Direccion IPv4" del Wi-Fi o Ethernet).
La API acepta automaticamente direcciones de red privada (192.168.x.x, 10.x.x.x, 172.16-31.x.x);
cualquier otro origen debe agregarse a `CORS_ORIGINS` en `.env`. Windows debe permitir a Node.js en el firewall.

### Acceso remoto con Tailscale

Para entrar desde fuera del taller sin exponer el sistema en internet se usa [Tailscale](https://tailscale.com),
una red privada entre los dispositivos autorizados:

1. Instalar Tailscale en el servidor e iniciar sesion.
2. Instalar la app Tailscale en cada celular o computadora e iniciar sesion con la misma cuenta
   (o invitar a otros usuarios desde el panel de Tailscale).
3. Entrar a `http://<nombre-del-servidor>.<tailnet>.ts.net:3000` o a `http://100.x.x.x:3000`
   (se consultan con `tailscale status`).

La API ya acepta las direcciones de Tailscale (100.64.0.0/10 y `*.ts.net`). La red Tailscale aparece en Windows como
red **Privada**, asi que Node.js debe estar permitido en el firewall tambien para redes privadas.

### Modo produccion

Para uso real (y obligatorio si el sistema se publica en internet) se usa el modo produccion,
que sirve la web ya compilada con cabeceras de seguridad y no expone herramientas de desarrollo:

```bash
pnpm start
```

En Windows tambien se puede iniciar con doble clic en `scripts\iniciar-sistema.cmd`: abre Docker Desktop si hace falta,
levanta la base de datos y arranca el sistema. Funciona aunque la terminal no reconozca `pnpm`.

### Enlace publico (Tailscale Funnel)

Permite entrar desde cualquier navegador sin instalar nada, en `https://<servidor>.<tailnet>.ts.net`.
Con el sistema corriendo en modo produccion:

```bash
tailscale funnel --bg --set-path /api http://127.0.0.1:4000
tailscale funnel --bg http://127.0.0.1:3000
```

Para dejar de publicarlo: `tailscale funnel reset`.

## Seguridad

- Contrasenas cifradas con bcrypt; minimo 10 caracteres con letras y numeros.
- Maximo 10 intentos de login por minuto por IP y bloqueo de la cuenta 15 minutos tras 5 intentos fallidos.
- La respuesta de login tarda lo mismo exista o no el correo, para no revelar que cuentas existen.
- Desactivar un usuario o cambiar su contrasena cierra al instante todas sus sesiones.
- Cabeceras de seguridad en API (helmet) y web (CSP, X-Frame-Options, nosniff, etc.).
- PostgreSQL y pgAdmin solo escuchan en la PC servidor (127.0.0.1), nunca en la red.
- `.env` contiene los secretos y no se sube al repositorio.

Recomendaciones: usar contrasenas unicas, desactivar a quien ya no trabaje en el taller,
mantener Windows actualizado y hacer respaldos periodicos de la base de datos.

## Comandos

```bash
pnpm start         # API + web en modo produccion
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

