# Front de revisión — avance

- [x] Inspeccionar onboarding, tokens y capturas de admin.
- [x] Crear app local independiente con React/TypeScript/Vite/Tailwind/Base UI/Zustand/Zod.
- [x] Copiar componentes compartidos, logo y animación PixelGradientField; mantener admin intacto.
- [x] Incorporar instrumento v0.2 ES/PT y pasos de información.
- [x] Barra full-width fija en y=0, fuera de la tarjeta.
- [x] Tarjeta estable por viewport y contenido con scroll interno, incluidos móviles de 320px.
- [x] Validar pasos y payload con Zod; limpiar dependencias al modificar el recorrido.
- [x] Guardar sólo localmente, conservar no verificados y permitir exportar JSON.
- [x] Índice de revisión de preguntas y retorno al recorrido real.
- [x] 13 pruebas de contrato; build de producción; 5 escenarios de navegador (móvil e índice repetidos tras correcciones).
- [x] Inspección de capturas desktop/mobile; detector Impeccable sin hallazgos.
- [x] Revisión independiente de cierre (ship) y documentación del sistema en DESIGN.md y .impeccable/design.json.

Esta fase no conecta backend, correo, verificación real, analítica ni agentes de prospección.

## Extensión v0.5 completada

- [x] Disponibilidad y correo mediante endpoints MSW simulados y contratos Zod.
- [x] Dos pasos piloto, aceptación de respuesta 50 y pausa posterior, también comprobada al enviar.
- [x] Outbox local antes de la llamada, detección de duplicados, reintentos y estados de verificación.
- [x] LinkedIn, WhatsApp y copiar enlace con logos suministrados.
- [x] Sólo español, Hispanoamérica, sin Brasil/Haití en opciones activas.
- [x] Metadata en HTML, favicon original e imagen OG JPG generada con código.
- [x] 27 pruebas unitarias, 13 escenarios de navegador, build y revisión independiente ship.
