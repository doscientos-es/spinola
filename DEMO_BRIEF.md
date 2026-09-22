# Demo brief · Fundación Spínola

## Objetivo de la segunda llamada

Demostrar que el control horario puede adaptarse a la realidad de un centro educativo: el profesor tiene un horario cargado previamente, ficha su presencia y el sistema imputa las horas a bloques lectivos o complementarios, detectando desviaciones para que dirección las valide.

## Hechos confirmados en las notas

- Fundación educativa nacional con 15 centros y aproximadamente 900–1.000 trabajadores.
- Hay personal docente y no docente con reglas distintas.
- El personal docente combina horas lectivas y complementarias, incluidas bolsas para evaluaciones, entrevistas y reuniones.
- Se quiere precargar el horario del profesor y permitir fichar entrada/salida, con cómputo automático y modificaciones notificadas al director.
- Educamos seguirá siendo la herramienta educativa; se mencionó intercambio mediante Excel para evitar doble carga.
- La implantación planteada empieza con sede y dos centros piloto, con despliegue progresivo.

## Supuestos de diseño (deben validarse)

- El fichaje de entrada y salida acredita presencia; no crea por sí solo una hora lectiva.
- Los bloques de horario son la fuente de planificación; los eventos de fichaje son la evidencia real.
- Una interrupción entre bloques no debe rellenarse automáticamente como docencia.
- Una reunión/tutoría/evaluación puede consumir una bolsa complementaria y necesita una actividad identificable.
- Un cambio de horario aprobado debe conservar versión, autor, motivo y fecha de efecto.
- Las reglas de convenio, jornada anual y descansos aún no están cerradas; no codificarlas como hechos.

## Preguntas abiertas para Pablo

1. ¿El horario se carga por curso, por semana tipo o por calendario con excepciones?
2. ¿Qué categorías exactas existen en la bolsa complementaria y cómo se descuentan?
3. ¿Una hora lectiva cancelada se convierte en disponibilidad, bolsa o ausencia?
4. ¿Cómo se registran guardias, recreos, claustros y reuniones fuera del centro?
5. ¿Quién valida una modificación: director, jefe de estudios o sede?
6. ¿La exportación necesaria es por persona, centro, periodo y concepto para la gestoría?

## Recorrido de la demo (menos de 5 interacciones)

1. Entrar como docente ficticio en el centro piloto grande.
2. Pulsar “Iniciar jornada” en el clock-in.
3. Ver el timeline: bloque lectivo, hueco y reunión de bolsa complementaria.
4. Simular una salida/reanudación o una reunión desplazada; el sistema crea una incidencia explicable.
5. Cambiar a dirección y aprobar la incidencia; mostrar el resumen por conceptos.

## Fuera de alcance

Nómina nativa, Educamos real, firma electrónica real, emails, geolocalización obligatoria, biometría, datos personales del CRM, absentismo estadístico y reglas legales no confirmadas.
