# Fundación Spínola · Demo de control horario docente

Esta carpeta contiene la especificación funcional y técnica de la demo para Fundación Spínola. La demo debe validar una pregunta concreta: **¿entiende el sistema la jornada docente como una asignación de tiempo a un horario preestablecido, con bloques lectivos y complementarios, y no como un simple intervalo de entrada/salida?**

Todavía no contiene una integración real con Educamos, nóminas, correo ni firma electrónica. Los datos de la demo son sintéticos y deterministas.

## Documentos

- [DEMO_BRIEF.md](DEMO_BRIEF.md): hechos, supuestos, preguntas y recorrido comercial.
- [docs/01-modelo-funcional.md](docs/01-modelo-funcional.md): modelo de jornada docente y reglas de cálculo.
- [docs/02-flujos-y-ux.md](docs/02-flujos-y-ux.md): pantallas y estados del clock-in.
- [docs/03-arquitectura.md](docs/03-arquitectura.md): stack, capas, contratos y adaptadores.
- [docs/04-datos-y-permisos.md](docs/04-datos-y-permisos.md): entidades, roles, RLS y privacidad.
- [docs/05-plan-paso-a-paso.md](docs/05-plan-paso-a-paso.md): orden de desarrollo y criterios de aceptación.
- [docs/demo-to-production.md](docs/demo-to-production.md): cómo pasar de fixtures a piloto sin reescribir el dominio.
- [docs/implementation-status.md](docs/implementation-status.md): estado vivo de la entrega.
- [fixtures/README.md](fixtures/README.md): escenarios sintéticos que debe reproducir la demo.

## Decisiones iniciales

| Área                 | Decisión                                                                                                            |
| -------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Demo                 | SPA React + TypeScript + TanStack Router/Query + Tailwind v4 + `@doscientos/ui`; modo local sin red.                |
| Persistencia demo    | Fixtures y adaptador local; no Supabase obligatorio para enseñar el flujo.                                          |
| Producción           | Supabase/PostgreSQL + RLS, mediante migraciones pequeñas y adaptadores separados.                                   |
| Integración Educamos | Contrato de importación Excel simulado; no afirmar que existe API.                                                  |
| Marca                | Identidad neutra temporal hasta recibir activos autorizados de la Fundación.                                        |
| Alcance              | Fichaje docente, mi jornada y revisión por dirección. Portal, ausencias, firma y comunicaciones quedan posteriores. |

## Arranque cuando se implemente

La implementación debe partir del starter operativo Vite/Router, no de un cliente existente. El modo demo debe estar explícito (por ejemplo, un script `dev:demo` o una variable pública con prefijo del framework), y nunca activar mocks silenciosamente en producción.

Checks mínimos: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` y `pnpm quality` si el starter lo expone.
