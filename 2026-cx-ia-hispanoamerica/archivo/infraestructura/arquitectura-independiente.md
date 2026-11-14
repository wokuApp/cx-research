# Arquitectura independiente para research.woku.app

14 de noviembre de 2026. Propuesta revisada tras la instrucción explícita de aislar la iniciativa. No se han creado recursos.

## Límite confirmado

No usar la API ni ECS de woku y no usar su instancia PostgreSQL de producción, tampoco con otro esquema o base lógica. El estudio debe tener recursos, credenciales, despliegue y ciclo de vida propios. Sigue autorizada conceptualmente la reutilización de SES para verificaciones/resultados; no se han enviado correos.

## Opción A: todo dentro de AWS, recomendación si se mantiene esa preferencia

- Front: bucket S3 privado y distribución CloudFront del estudio, en research.woku.app.
- API: HTTP API de API Gateway y Lambda TypeScript/Zod propias del estudio.
- Datos: **instancia RDS PostgreSQL nueva**, privada, en VPC dedicada sin conectividad hacia la VPC de producción. Credenciales y security groups propios. Esta separación no es un esquema en la base existente.
- Correo: respuesta y trabajo pendiente en una misma transacción; un procesador independiente del estudio despacha por SES después del commit. EventBridge/Lambda puede procesar la outbox sin incorporar el backend de woku.
- Conectividad: presupuestar los endpoints privados necesarios, por ejemplo SES API y Secrets Manager. No abrir PostgreSQL a Internet para ahorrar red. Evaluar pooling y límite de concurrencia antes de añadir automáticamente RDS Proxy.
- IAM y despliegue: roles limitados a los recursos research; sin permisos de lectura/escritura sobre datos de producción. Una cuenta AWS separada es una opción adicional de aislamiento administrativo; no es requisito impuesto para este prototipo.

**Precio comprobado:** la API oficial AWS Pricing devolvió USD 0,016 por hora para db.t4g.micro PostgreSQL Single-AZ en us-east-1. Con 730 horas son USD 11,68 mensuales sólo de cómputo. No incluye almacenamiento, backups extra, red, secretos, logs, API o correo. Fuente primaria consultada mediante `aws pricing get-products` con filtros de instancia, motor, región y Single-AZ; no se consultaron ni alteraron datos de producción.

Como orden de magnitud de planificación, una instalación pequeña con RDS propio y endpoints podría requerir **USD 30–60/mes**, asumiendo baja carga, una configuración de disponibilidad acotada y sin RDS Proxy dedicado. Es una estimación de diseño, no una cotización cerrada. La cantidad de endpoints/AZ, clase de DB y plan CDN deben presupuestarse antes de aprovisionar. [Precios RDS](https://aws.amazon.com/rds/postgresql/pricing/), [PrivateLink](https://aws.amazon.com/privatelink/pricing/).

## Opción B: reducir operación y costo inicial con PostgreSQL administrado externo

Mantener S3/CloudFront y Lambda propios, pero usar un **proyecto exclusivo de Neon**, desplegado en una región AWS cercana a la Lambda. Neon administra el servicio: no es una instancia RDS en la cuenta AWS del usuario. La Lambda puede conectarse mediante el driver serverless sin entrar a la VPC de producción.

Neon publica un plan Free con 100 CU-horas mensuales y 1 GB por proyecto; Launch es por consumo. El valor «typical spend USD 15» del proveedor es un ejemplo de uso, no precio fijo ni garantía para esta encuesta. [Precios Neon](https://neon.com/pricing/), [regiones](https://neon.com/docs/introduction/regions), [driver serverless](https://neon.com/docs/serverless/serverless-driver).

La base Free se suspende tras inactividad y se reactiva al consultar; los planes de pago permiten desactivar esa suspensión. Esto es un compromiso de costo/latencia que debe medirse. Los polls de estado y un procesador periódico pueden mantenerla activa, así que no se debe prometer que la operación completa será gratis. [Scale to Zero](https://neon.com/docs/introduction/scale-to-zero).

Esta opción añade un proveedor y condiciones de backup/retención a revisar, pero mantiene API y datos del estudio separados de woku. Antes de usarla públicamente, probar transacción de cupo, idempotencia, restauración y latencia.

## Consideraciones comunes

- La respuesta 50 se guarda y provoca la pausa mediante una transacción global de PostgreSQL. Las siguientes se rechazan sin borrar el borrador local; el correo no determina el cupo.
- La outbox evita perder respuestas por fallo de SES y permite reintentos.
- No levantar un cluster Aurora con auto-pausa sólo por la palabra serverless: AWS documenta una reactivación aproximada de 15 segundos para ese modo, relevante porque la disponibilidad se consulta antes de abrir el formulario. [Aurora auto-pause](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/aurora-serverless-v2-auto-pause.html).
- SES compartido conserva dependencias de correo como cuotas de la cuenta. Un configuration set propio separa métricas, no constituye aislamiento total del servicio o de reputación. Si se exige también esa separación, revisar identidad/subdominio y cuenta de envío exclusivos.
- El sitio estático no necesita entrar a la red privada de woku. Dominio y branding compartidos no requieren compartir su API o DB.
