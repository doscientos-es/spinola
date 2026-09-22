# 01 · Modelo funcional de la jornada docente

## Principio central

Hay que separar tres cosas:

1. **Planificación**: qué debía hacer la persona (`schedule_block`).
2. **Presencia**: cuándo estuvo fichada (`attendance_event` y `presence_interval`).
3. **Imputación**: a qué concepto se asigna esa presencia (`time_allocation`).

Nunca se debe calcular “horas trabajadas = salida - entrada” y presentarlo como horas lectivas. Ese intervalo sólo mide presencia continua. Las horas lectivas se obtienen al solapar presencia validada con bloques lectivos; reuniones y actividades similares se asignan a bloques complementarios o a una bolsa.

## Tipos de bloque

| Tipo                  | Ejemplo                                        | Regla demo                                                         |
| --------------------- | ---------------------------------------------- | ------------------------------------------------------------------ |
| `teaching`            | Matemáticas 3º ESO, 09:00–10:00                | Se imputa como lectiva sólo si existe bloque y presencia solapada. |
| `complementary_fixed` | Guardia, recreo, coordinación, 10:00–10:30     | Se imputa como complementaria planificada.                         |
| `complementary_pool`  | Entrevista, evaluación, reunión extraordinaria | Consume saldo de bolsa tras seleccionar actividad y duración.      |
| `break`               | Descanso/hueco                                 | No genera horas; no se rellena por continuidad del fichaje.        |
| `availability`        | Permanencia/disponibilidad                     | Se contabiliza separada de docencia.                               |
| `absence`             | Permiso o ausencia aprobada                    | No es presencia; se gestiona en otro módulo.                       |

## Reglas de cálculo

- Un horario puede contener bloques adyacentes, superpuestos o con huecos; el motor debe rechazarlos o marcarlos según configuración, nunca resolverlos en silencio.
- Un `clock_in` abre un intervalo de presencia. `clock_out` lo cierra. Si falta salida, el estado es `open` y requiere revisión.
- Para cada bloque, `worked_minutes = max(0, min(presence_end, block_end) - max(presence_start, block_start))`.
- El solape se redondea según una política explícita (demo: minuto exacto; producción: validar convenio).
- El solape con `break` no se asigna automáticamente a otro concepto.
- Un bloque lectivo parcialmente cubierto queda `partial` y muestra minutos planificados, cubiertos y pendientes.
- Una actividad de bolsa tiene `pool_transaction`: `debit` al aprobarla y `credit` al cancelarla/corregirla. Nunca se edita el saldo sin movimiento trazable.
- Un fichaje fuera del horario no se descarta: se etiqueta `unplanned_presence` y requiere seleccionar motivo o revisión.
- Una corrección no modifica eventos originales; crea una solicitud con antes/después, motivo, actor y decisión.

## Ejemplo de día

Horario de Lucía (datos ficticios): 08:30–09:30 lectiva, 09:30–10:00 recreo, 10:00–11:00 lectiva, 12:00–13:00 reunión de departamento (bolsa). Si ficha 08:24 y sale 13:10, el sistema no convierte 4 h 46 min en lectivas: asigna 120 min lectivos, 30 min complementarios de recreo, 60 min de bolsa y deja el resto como presencia no asignada/revisión.
