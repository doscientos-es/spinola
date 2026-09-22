# 05 · Plan paso a paso

## Fase 0 · Validación (antes de código)

1. Confirmar con Pablo las preguntas abiertas del brief.
2. Elegir centro grande y pequeño ficticios para la llamada.
3. Obtener un ejemplo anonimizado de horario/Excel; no usar datos reales en la demo.
4. Acordar qué conceptos entran en lectivas, complementarias y bolsa.

## Fase 1 · Vertical de demo

1. Crear proyecto desde el starter operativo y activar modo local explícito.
2. Definir tipos de dominio y fixtures deterministas.
3. Implementar motor de solape y ledger de bolsa con tests unitarios.
4. Implementar rutas `/fichar`, `/mi-jornada` y `/revision` con TanStack Router.
5. Crear clock-in responsive, timeline y revisión; usar primitivas de `@doscientos/ui`.
6. Añadir estados normal, hueco, reunión, falta de salida, error y horario vacío.
7. Ejecutar lint, typecheck, tests y build; ensayar la llamada sin red.

## Fase 2 · Piloto técnico

1. Validar el Excel real anonimizado y conflictos de horarios.
2. Añadir Supabase, migraciones y RLS por centro/rol.
3. Implementar importación staging → aprobación → versión activa.
4. Probar calendario académico, cambios y sustituciones.
5. Añadir exportación por centro/persona/concepto para gestoría.
6. Instrumentar auditoría y soporte; nunca sobrescribir eventos.

## Criterios de aceptación del vertical

- Un día docente con huecos no infla las horas lectivas.
- Una reunión consume la bolsa sólo tras aprobación.
- Un fichaje fuera de horario queda visible como excepción.
- Dirección sólo ve su centro; sede ve consolidado.
- Repetir las mismas fixtures produce el mismo resultado.
- No hay integración ni envío externo activo en modo demo.
