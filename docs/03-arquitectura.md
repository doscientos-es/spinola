# 03 · Arquitectura propuesta

## Stack

Para la demo: Vite + React + TypeScript + TanStack Router + TanStack Query + Tailwind v4 + `@doscientos/ui`, con adaptador local determinista. Para producción: Supabase/PostgreSQL/Auth/RLS manteniendo los contratos de dominio.

No usar Next por defecto ni copiar un proyecto de cliente. No añadir PWA, billing ni VERI*FACTU.

## Capas

```text
src/features/attendance/domain       reglas de solape, estados y tipos
src/features/attendance/application  casos de uso: clockIn, clockOut, allocate, requestCorrection
src/features/attendance/infrastructure  LocalAttendanceAdapter / SupabaseAttendanceAdapter
src/features/attendance/ui           ClockInCard, DayTimeline, ReviewQueue
src/features/schedules/domain        bloques, versiones, calendario y bolsas
src/routes                            fichar, mi-jornada, revision
src/shared/ui                         shell, estados de datos y navegación
fixtures                              escenarios sintéticos
supabase/migrations                    sólo al abrir persistencia real
```

La UI recibe datos y callbacks; no consulta Supabase directamente. Los adaptadores implementan interfaces comunes y la demo no debe hacer llamadas externas.

## Contratos mínimos

`ScheduleProvider.getDay(employeeId, date)`, `AttendanceProvider.clockIn()`, `clockOut()`, `getPresence()`, `submitCorrection()`, `PoolProvider.getBalance()`, `debitActivity()`, `creditActivity()`, `ReviewProvider.listPending()` y `decide()`. Todos devuelven errores tipados y estados de revisión.

## Integración de horarios

Crear primero un importador Excel puro y testeable: columnas mínimas `employee_code`, `center_code`, `effective_from`, `effective_to`, `date_or_weekday`, `start_time`, `end_time`, `block_type`, `subject_or_activity`, `pool_category`. El importador produce un `ScheduleVersion` en staging; una persona autorizada valida conflictos antes de activarla. Educamos debe quedar como proveedor futuro, no como integración afirmada.
