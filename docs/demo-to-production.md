# Demo → producción

| Pantalla/acción    | Demo                               | Producción                                | Permiso/RLS                        | Prueba                           | Estado    |
| ------------------ | ---------------------------------- | ----------------------------------------- | ---------------------------------- | -------------------------------- | --------- |
| Iniciar jornada    | `LocalAttendanceAdapter.clockIn`   | RPC/acción server-side que inserta evento | Empleado propio                    | doble click/idempotencia         | Pendiente |
| Finalizar jornada  | fixture mutable local              | evento append-only y cierre validado      | Empleado propio                    | salida faltante/reintento        | Pendiente |
| Ver mi jornada     | fixtures de horario y asignaciones | consulta de versión activa + proyección   | Empleado propio                    | solapes/huecos                   | Pendiente |
| Añadir reunión     | débito de bolsa local al aprobar   | ledger inmutable                          | empleado solicita, director decide | crédito/débito                   | Pendiente |
| Revisar incidencia | decisión local                     | `review_decision` auditada                | director de centro/sede            | aislamiento por centro           | Pendiente |
| Importar horario   | CSV/Excel simulado                 | staging Excel + aprobación                | central/admin                      | conflictos y rollback de versión | Pendiente |

La promoción debe conservar los tipos, motor de cálculo, fixtures de regresión y contratos de proveedor. Sustituir sólo adaptadores y wiring de persistencia. Antes de conectar Educamos o gestoría se requiere especificación, autorización, prueba con datos anonimizados y decisión de seguridad.
