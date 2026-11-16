# Estado operativo publicable

## Apertura del piloto, 16 de noviembre de 2026

La recepción se abrió por autorización del usuario el 16 de noviembre de 2026. Estado comprobado a las 08:53:34 de America/Santiago (11:53:34 UTC): instrumento 0.6, fase piloto, pausa manual desactivada y ambos contadores en cero. Se mantienen las dos preguntas de evaluación y la pausa automática al alcanzar el límite de 50. La capacidad temporal de reinicio sigue deshabilitada.

Antes de abrir se comprobó la cuenta operativa, disponibilidad de PostgreSQL y API, habilitación de SES e identidad de envío y programación del worker cada minuto. La ejecución del worker con outbox vacía devolvió cero enviados y cero fallos. No se enviaron nuevos mensajes ni respuestas de ensayo para comprobar esta apertura. La entrega a buzones fue comprobada durante las pruebas previas; hoy se verificó la configuración y disponibilidad.

Se volvió a publicar el frontend con API real y `RESEARCH_ALLOW_INDEXING=true`; se retiró `noindex,nofollow` y se invalidaron las rutas de entrada en la CDN. Para publicaciones posteriores destinadas al campo, mantener esa variable explícita. El visor del manuscrito y la imagen OpenGraph respondieron correctamente antes de la apertura. No se cambió el instrumento, el manuscrito, la fase principal ni la privacidad del repositorio.

Comprobación posterior: formulario público disponible en 1280, 390 y 320 px, sin errores JavaScript ni desborde horizontal; metadata `index,follow`, enlace al manuscrito, Clarity y enmascaramiento presentes. La API confirmó piloto abierto, límite 50 y preguntas piloto activas. No se enviaron respuestas de prueba.

Corte: 16 de noviembre de 2026. Sitio: https://research.woku.app.

La aplicación utiliza infraestructura propia para el estudio, independiente del backend y PostgreSQL productivos de woku. Remitente `research@woku.app`, respuesta a `team@woku.app`. La arquitectura y los controles están en [ARCHITECTURE.md](ARCHITECTURE.md) y [SECURITY.md](SECURITY.md).

Como antecedente del 14 de noviembre, la prueba técnica concluyó y sus cuatro respuestas fueron eliminadas, junto con contactos, tokens, outbox y límites temporales. Se conservaron esquema, migraciones y auditoría. Ambos contadores quedaron en cero; instrumento 0.6, piloto pausado y capacidad temporal de reinicio deshabilitada. El estudio quedó pausado hasta la apertura del 16 de noviembre documentada arriba.

No se incluyen registros individuales, identificadores de respuestas, direcciones de participantes, logs, inventarios de producción o credenciales. Los respaldos operativos siguen su retención; su existencia no constituye un conjunto de datos del estudio.

La nueva pregunta y el visor PDF se comprobaron en navegador, incluida vista móvil. Clarity carga por defecto en producción, con contenido enmascarado, URL limpiada y sin propiedades personalizadas que contengan correos o respuestas. No se inspeccionó su dashboard.

Verificación previa a este archivo: 26 pruebas de contrato, 27 unitarias/infraestructura API, siete unitarias frontend y 24 escenarios PostgreSQL. Los resultados son comprobaciones del software, no resultados científicos. El manuscrito sigue siendo un protocolo previo a datos y análisis.

Las instrucciones de administración en [README.md](README.md) requieren una cuenta propia y autorización operativa. Clonar o ejecutar pruebas no abre el piloto ni despliega recursos. La restauración de respaldos y la suscripción operativa a alarmas no se consideran verificadas por este repositorio.
