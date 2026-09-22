# Fixtures de la demo

Usar sólo nombres ficticios y códigos internos como `DOC-001`.

Escenarios obligatorios:

1. `normal-teaching-day`: dos bloques lectivos y una complementaria fija cubiertos.
2. `teaching-with-gap`: hueco entre clases que no se imputa.
3. `pool-meeting`: reunión de departamento que consume 60 minutos de bolsa al aprobarse.
4. `unplanned-presence`: presencia fuera del horario que requiere motivo.
5. `missing-clock-out`: jornada abierta que aparece en revisión.
6. `empty-schedule`: centro sin versión activa, con CTA para cargar horario.

Las fixtures deben ser versionadas, deterministas y reutilizables por tests y Storybook. No contienen DNI, correo, teléfono, nóminas ni transcripciones.
