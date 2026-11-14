# woku research: arquitectura independiente

Decisión del 14 de noviembre de 2026. Se implementa código e infraestructura revisable; no se despliega ni se habilita recepción pública en este cambio.

## Límites

Nueva instancia RDS, VPC, subredes aisladas, grupos de seguridad, secretos, roles IAM y Lambdas. Ninguna referencia, conexión o escritura al backend, VPC o PostgreSQL productivos de woku. Único recurso compartido: identidad SES `woku.app`, con remitente `research@woku.app` y configuration set propios. La reputación y cuota SES siguen siendo de la cuenta compartida.

| Capa | Decisión | Motivo |
| --- | --- | --- |
| Front | S3 privado + CloudFront, `research.woku.app` | Estáticos servidos cerca de participantes, HTTPS y caché |
| API | API Gateway REST regional + Lambda Node.js 24 / TypeScript | Integración directa con AWS WAF, validación Zod y límites de concurrencia |
| Datos | Nueva RDS PostgreSQL 18, Single AZ, gp3 cifrado | Transacciones, restricciones de unicidad, respaldos y aislamiento |
| Red | VPC propia, 2 subredes aisladas, sin NAT/Internet Gateway | RDS y funciones sin acceso público ni ruta a woku |
| Servicios privados | Endpoints de Secrets Manager y SES API, una AZ | Evitar NAT; coste y disponibilidad explícitos |
| Correo | Outbox PostgreSQL + worker programado + SES | El correo puede fallar sin perder la respuesta |
| Administración | Lambda invocable sólo mediante IAM | Migraciones y pausa/fase sin endpoints administrativos públicos |
| Despliegue | AWS CDK TypeScript, stacks `woku-research` y `woku-research-web` | Backend y frontend independientes; DNS/CDN pueden avanzar mientras se tramita la cuota Lambda |

API Gateway REST se elige frente al HTTP API sugerido inicialmente para asociar WAF directamente al endpoint. El API público es exclusivo del estudio. CORS admite únicamente el dominio del front; CORS no es autenticación ni impide llamadas fuera del navegador.

## Modelo de datos

`study_state`: versión, fase, pausa manual, contador total y contador piloto. Se bloquea la fila con `FOR UPDATE` en cada admisión.

`contacts`: correo cifrado con AES-256-GCM, índice HMAC para unicidad por estudio y fecha de verificación. No se usa un hash sin clave de correos predecibles.

`responses`: UUID idempotente, contacto, respuestas JSONB validadas, versión del instrumento, fase, elegibilidad, fecha del cliente y fecha real del servidor. El cliente nunca decide si el correo está verificado.

`verification_tokens`: digest SHA-256 de 32 bytes aleatorios, vencimiento, consumo único. El enlace usa fragmento `#token=...` para evitar URL/logs de servidor. Un GET nunca consume el token: se requiere confirmar mediante POST.

`mail_outbox`: entrega pendiente, token cifrado mientras está pendiente, intento, lease y reintento. El guardado, token y outbox se confirman juntos. SES no ofrece exactamente una entrega; un fallo después de enviar y antes de marcar puede duplicar el mismo mensaje, nunca una respuesta.

`rate_limits`: límites atómicos por origen seudonimizado y por correo, con vencimiento. No se guardan IP en claro ni respuestas/tokens en logs.

`admin_events` y `schema_migrations`: auditoría operativa y migraciones versionadas. Exportación analítica separada de contactos.

## Invariantes y seguridad

- El envío 50 elegible se acepta y pausa el piloto en la misma transacción; el 51 no entra. Las salidas por inelegibilidad no consumen cupo. Verificar después no cambia el contador.
- UUID más digest canónico permite reintentar sin duplicar. Reutilizar UUID con contenido diferente falla. Un correo normalizado sólo tiene una respuesta por estudio.
- La fase y versión proceden del servidor. El cliente no puede quitar preguntas piloto ni añadir campos ocultos/verificación/administración.
- Validación estricta compartida entre front y API; SQL parametrizado; límite de tamaño de entrada; errores sin detalles de BD; TLS con validación del certificado de RDS.
- API y worker usan usuarios PostgreSQL sin DDL ni privilegios administrativos. Sólo la función de administración puede leer la credencial propietaria.
- Secretos fuera de código, bundles y variables de credenciales. Secretos consultados por IAM y endpoint privado; las variables contienen ARN y configuración pública.
- WAF y API Gateway limitan tráfico; límites transaccionales de reenvío reducen abuso de SES. No constituyen prueba de que el participante sea humano o representante de una empresa.
- Por solicitud explícita, email-status distingue participación verificada/pendiente. Esto revela el estado de participación a quien conozca una dirección. Se limita por IP/correo y no devuelve respuestas. No se promete impedir por completo enumeración sin cambiar ese flujo.
- Inicio pausado. La apertura, reapertura y paso a fase principal requieren una acción IAM explícita y quedan auditados; nunca se reabre automáticamente después del piloto.
- Backups automáticos 7 días, protección contra borrado y snapshot al retirar RDS. Claves/secretos retenidos para poder recuperar datos. Una AZ es una elección de coste, no alta disponibilidad.
- La cuenta inspeccionada no tiene rol global de logs para API Gateway. El stack no cambia esa configuración compartida: la Lambda registra request ID y estado sin datos personales, y se usan métricas de Gateway/WAF. No se habilita trazado de cuerpos ni muestreo de peticiones WAF.

## TDD y verificación prevista

Pruebas primero para validación y transporte, criptografía, transacciones concurrentes sobre PostgreSQL real, idempotencia, duplicados, piloto 49/50/51, reenvíos, verificación vencida/reutilizada, recuperación del worker y privilegios SQL. Aserciones CDK comprueban red privada, cifrado, límites, permisos y ausencia de recursos de producción. Después se verifican el contrato compartido y el front.

## Despliegue y coste

Configuración por defecto conservadora: RDS `db.t4g.micro`, 20 GiB, pool de 1 conexión por entorno Lambda y concurrencia reservada pequeña. No se incorpora RDS Proxy inicialmente; si la carga/mediciones exigen más conexiones se revisa la clase y el proxy. No aumentar concurrencia sin medir conexiones y memoria.

Los endpoints privados, RDS, Secrets Manager, WAF, logs y dominio forman el coste fijo. La estimación previa de USD 30–60/mes era orientativa; obtener presupuesto con la plantilla final antes de desplegar. No se asume gratuidad de CloudFront ni de la cuenta existente.

La inspección encontró una cuota Lambda regional de sólo 10 ejecuciones. Se requiere ampliarla antes de desplegar las 7 reservas previstas, dejando las 100 ejecuciones sin reservar exigidas por AWS. No se cambió la cuota ni se desplegó una versión sin esos límites. El preflight verifica este requisito. [AWS: concurrencia reservada](https://docs.aws.amazon.com/lambda/latest/dg/configuration-concurrency.html).

Se requieren dos operaciones externas posteriores: crear la infraestructura en AWS y configurar el CNAME `research.woku.app` en Cloudflare. Las pruebas locales no prueban entrega SES real, certificados/DNS ni restauración de un backup RDS.

Actualización: el usuario autorizó una prueba en producción. Frontend, DNS, Lambda y RDS están desplegados tras aprobarse la cuota. Guardado y envío SES comprobados con una respuesta técnica. Estado y continuación exactos en `PRODUCTION.md`. El reinicio de datos de prueba está habilitado por administración IAM para ese ensayo; todavía no se ejecutó.

## Fuentes técnicas comprobadas

- AWS, [Lambda y RDS: conexiones y certificados](https://docs.aws.amazon.com/lambda/latest/dg/services-rds.html).
- AWS, [SES API mediante endpoints VPC](https://aws.amazon.com/about-aws/whats-new/2025/12/amazon-ses-vpc-api-endpoints/). El endpoint observado en us-east-1 usa `email.us-east-1.api.aws`; el worker debe utilizar ese hostname privado.
- AWS, [WAF con API Gateway REST](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-control-access-aws-waf.html).
- AWS, [transactional outbox](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html).
- OWASP, [tokens, expiración, enlaces y límites de reenvío](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html).
