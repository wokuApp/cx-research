# Verificación del front

Actualización de backend: el contrato y sus 21 pruebas están ahora en `../survey-contract`; el frontend conserva 6 pruebas del modelo MSW. El modo real y la ruta de verificación añaden cuatro escenarios de navegador. Resultados y límites actuales en [../survey-api/VERIFICATION.md](../survey-api/VERIFICATION.md). Las secciones anteriores se conservan como historial.

Sesión del 13 de noviembre de 2026 (hora local). App local http://127.0.0.1:5180/.

- `npm test`: 13 pruebas de contratos Zod y lógica de recorrido pasaron.
- `npm run build`: TypeScript y build Vite completados. Vite informa un chunk JS de aproximadamente 656 kB sin comprimir; este prototipo aún no está optimizado para publicación.
- `npm run test:e2e`: 5 escenarios Chromium pasaron: recorrido completo sin IA; recorrido móvil con IA, límite de selección y cambio de rama; índice de revisión y portugués; viewport 320px con recarga de borrador; error de almacenamiento sin confirmación falsa.
- Tras ajustar el tamaño visual de los controles y normalizar respuestas al salir de revisión, se repitieron y pasaron los dos escenarios afectados (móvil e índice). Se repitieron también las 13 pruebas de contrato y el build.
- Los tests compararon dimensiones y posición de la tarjeta entre pasos, ancho de la barra igual al viewport y coordenada vertical 0. No hubo desbordamiento horizontal en los tamaños medidos.
- Detector Impeccable: `[]`, sin hallazgos en App, Question, ReviewIndex y CSS propio.
- Revisión independiente Impeccable: **ship** para el front local, sin hallazgos materiales en las capturas y código revisados.
- Componente y CSS PixelGradientField: comparación binaria idéntica al admin de referencia.

## Alcance

Capturas: escritorio 1440×950, móvil 390×844, más prueba funcional a 320×640. Navegador Chromium; no es una certificación de accesibilidad. Teclado virtual móvil real y lectores de pantalla no se verificaron. No hay pruebas de API o envío de correos porque esa integración no existe en esta fase.

Los datos de los escenarios de prueba son sintéticos. Los nombres y correos de prueba no son respuestas reales del estudio.

## Revisión v0.3

- 18 pruebas unitarias pasan, incluyendo alcance multinacional, cobertura mínima/indeterminada, uso extendido, tecnologías y migración de borrador anterior.
- Siete escenarios de navegador: seis pasaron en ejecución conjunta y el séptimo de país regional/listas/modal pasó al esperar el fin de la transición antes de medir. El primer fallo de esa aserción era de geometría transitoria durante la animación, no se relajó la tolerancia.
- Listas visibles y sin doble scroll comprobadas en 390×844 y 320×640. Cierre por X en la misma fila, backdrop y Escape comprobados. Enlace Powered by revisado con destino y target correctos.
- El detector emitió dos advertencias heurísticas gray-on-color en una línea condicional de SearchableChoiceList: se conservan para revisión independiente; los seleccionados usan indigo-800 sobre indigo-50, el texto neutro corresponde a opciones sobre blanco.

## Cierre v0.5, 14 de noviembre de 2026

- 27 pruebas unitarias pasan: contratos, alcance hispanoamericano, migración de borradores, dos pasos piloto, límite 50, duplicados y reintentos.
- 13 escenarios Chromium pasan: recorridos principal/móvil, listas, modal, pausas, respuesta 50 y bloqueo siguiente, correo verificado/pendiente, guardado ante pausa tardía, logos, metadata HTML sin JS, JPG y favicon. Tras corregir el máximo inicial de pasos se repitieron los tres escenarios afectados, todos verdes.
- Build de producción completo. La metadata incluye charset temprano, OG/Twitter, URL configurable y JPEG 1200×630.
- Revisión independiente Impeccable: ship para el prototipo local, sin defectos materiales; no es una auditoría de un backend productivo.
- SVG sociales y favicon coinciden por SHA-256 con los archivos indicados por el usuario/admin.
- `public/og/ia-experiencia-cliente.jpg` se generó programáticamente con HTML/CSS/Playwright, sin IA generativa, y se inspeccionó visualmente.
- La URL pública sigue pendiente de configuración/publicación. No se enviaron correos ni publicaciones en redes reales.
