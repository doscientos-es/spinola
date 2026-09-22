# 02 · Flujos y UX

## Clock-in del docente

La primera pantalla debe parecer un producto diario, no un panel administrativo:

- hora actual grande y fecha;
- centro y nombre ficticios claramente visibles;
- estado actual (`No has iniciado`, `En jornada`, `Jornada cerrada`, `Revisión pendiente`);
- botón primario único: `Iniciar jornada` o `Finalizar jornada`;
- próximo bloque y resumen de hoy;
- enlace secundario `Ver mi jornada`.

Al iniciar: confirmar hora, mostrar un recibo breve y actualizar el próximo bloque. Si está fuera de ventana, explicar el motivo y ofrecer `Continuar y solicitar revisión`, nunca bloquear sin contexto.

## Mi jornada

Timeline vertical por hora, con colores por tipo de bloque. Cada tarjeta debe mostrar planificado, presencia detectada, minutos imputados y estado. Un hueco debe verse como hueco. La acción `Añadir actividad` permite escoger reunión/tutoría/evaluación, rango horario y categoría de bolsa.

## Revisión de dirección

La bandeja sólo muestra excepciones accionables: falta de salida, presencia no planificada, bloque parcialmente cubierto, actividad de bolsa pendiente y corrección solicitada. Acciones: aprobar, rechazar con motivo, pedir aclaración. El director queda limitado a su centro; sede ve consolidado.

## Estados obligatorios

Cada ruta debe tener `loading`, `empty`, `error` recuperable, `success` y `review` cuando aplique. Fixtures deben incluir al menos: día normal, hueco, reunión de bolsa, falta de salida y centro sin horario cargado.
