# Estado operativo publicable

Corte: 14 de noviembre de 2026. Sitio: https://research.woku.app.

La aplicación utiliza infraestructura propia para el estudio, independiente del backend y PostgreSQL productivos de woku. Remitente `research@woku.app`, respuesta a `team@woku.app`. La arquitectura y los controles están en [ARCHITECTURE.md](ARCHITECTURE.md) y [SECURITY.md](SECURITY.md).

La prueba técnica concluyó y sus cuatro respuestas fueron eliminadas, junto con contactos, tokens, outbox y límites temporales. Se conservaron esquema, migraciones y auditoría. Ambos contadores quedaron en cero; instrumento 0.6, piloto pausado y capacidad temporal de reinicio deshabilitada. La difusión está prevista para el 16 de noviembre de 2026; no se programó una apertura automática. El piloto debe abrirse mediante IAM, manteniendo el límite de 50 admisiones y sus dos preguntas de evaluación.

No se incluyen registros individuales, identificadores de respuestas, direcciones de participantes, logs, inventarios de producción o credenciales. Los respaldos operativos siguen su retención; su existencia no constituye un conjunto de datos del estudio.

La nueva pregunta y el visor PDF se comprobaron en navegador, incluida vista móvil. Clarity carga por defecto en producción, con contenido enmascarado, URL limpiada y sin propiedades personalizadas que contengan correos o respuestas. No se inspeccionó su dashboard.

Verificación previa a este archivo: 26 pruebas de contrato, 27 unitarias/infraestructura API, siete unitarias frontend y 24 escenarios PostgreSQL. Los resultados son comprobaciones del software, no resultados científicos. El manuscrito sigue siendo un protocolo previo a datos y análisis.

Las instrucciones de administración en [README.md](README.md) requieren una cuenta propia y autorización operativa. Clonar o ejecutar pruebas no abre el piloto ni despliega recursos. La restauración de respaldos y la suscripción operativa a alarmas no se consideran verificadas por este repositorio.
