# 04 · Datos, roles y permisos

## Entidades

- `organization`, `center`, `employee` (identificador interno; DNI sólo en integración segura posterior).
- `schedule_version`, `schedule_block`.
- `attendance_event` (`clock_in`/`clock_out`, hora del dispositivo y del servidor, origen, estado).
- `presence_interval` (proyección derivada, no sustituye eventos).
- `time_allocation` (bloque, minutos planificados, cubiertos, estado).
- `pool_ledger_entry` (crédito/débito inmutable y saldo derivado).
- `correction_request`, `review_decision`, `audit_event`.

## Roles

`employee`: sus fichajes, horario y solicitudes. `center_director`: empleados y revisiones de su centro. `central_people`: visión de todos los centros e informes. `admin`: configuración y soporte. Patronato sólo recibirá informes agregados en una fase posterior; no necesita acceso operativo.

## RLS y privacidad

Toda tabla expuesta debe tener RLS. Los permisos deben comprobar identidad, organización y centro en servidor, no depender de botones ocultos. No almacenar notas del CRM, emails de la reunión ni nombres reales en fixtures. Los eventos originales son append-only; correcciones y decisiones se auditan.

## Auditoría mínima

Registrar actor, timestamp de servidor, acción, entidad, valores relevantes antes/después, motivo, versión de política y centro. Separar zona horaria de presentación de la hora UTC almacenada.
