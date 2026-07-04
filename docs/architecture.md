# Arquitectura Inicial

## Principios

- El servidor local es la fuente central de datos.
- La API concentra reglas de negocio y permisos.
- El frontend debe poder ejecutarse en navegador, Android via Capacitor y escritorio via Tauri.
- Las migraciones de base de datos deben ser versionadas y revisables.
- Toda actualizacion importante debe contemplar respaldo previo.

## Componentes

```text
apps/web      Interfaz Next.js
apps/api      API NestJS
apps/mobile   App Android con Capacitor
apps/desktop  App Windows con Tauri
database      PostgreSQL + Prisma
```

## Actualizaciones

El sistema debe separar dos tipos de actualizacion:

- Servidor local: contenedores Docker, migraciones Prisma y respaldos.
- Clientes: instaladores Tauri y APKs Capacitor.

El flujo exacto de actualizaciones se definira antes de la primera release instalable.

