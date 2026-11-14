# Revisión de seguridad

Actualización de despliegue: frontend y backend están publicados para la prueba autorizada. Conectividad real con RDS y envío por SES comprobados. Estado preciso en [PRODUCTION.md](PRODUCTION.md). La restauración de backups y suscripción operativa a alarmas siguen pendientes; no se consideran probadas por completar el despliegue.

## Controles implementados

RDS nueva y privada, VPC sin NAT ni internet gateway; 5432 sólo desde grupos de las funciones. Cifrado de disco y backups; TLS con certificado verificado. Bundle de CA tomado del truststore oficial RDS us-east-1, SHA-256 `b1711d12bae51838581281e23b6cb97b1074016873b4dafc80ed14002462dd77`, comprobado en cada build. Renovarlo deliberadamente cuando AWS cambie la cadena de confianza.

IAM separado por función; API sin SES ni secreto propietario. Worker sin acceso SQL a respuestas; API sin DDL, borrado ni control de pausa. Admin sin ruta pública ni function URL. Las operaciones EC2 de los permisos VPC se niegan al código mediante `lambda:SourceFunctionArn`, conservando su uso por el servicio Lambda.

Secrets Manager mediante endpoint privado. Correo AES-256-GCM con propósito asociado, índice HMAC, token aleatorio de 256 bits y digest persistido. Enlace de origen fijo HTTPS, sin parámetros de redirección. Token cifrado en outbox sólo mientras está pendiente y borrado al enviar/cancelar/agotarse. Nunca se registra el payload, email, token, cabecera, query string ni IP en claro.

WAF de tamaño y tasa en el propio REST stage; límite JSON 32 KiB; gateway 20 solicitudes/s y ráfaga 40; API concurrencia 5, worker 1, administración 1. SQL parametrizado, Zod estricto, límites de reenvío por destinatario y de solicitudes por origen. Pseudónimo IP cambia cada día y las filas vencidas se limpian. El resultado del status no se cachea.

Reenvío revisado tras una incidencia real: sin espera temporal de diez minutos. Revocación de tokens previos, cancelación de outbox anterior y creación del reemplazo son atómicas. `used_at` marca tokens consumidos o invalidados; sólo el último permanece activo. Diez reemplazos aceptados por correo en 24 horas, además del límite por IP. El rechazo o fallo de una solicitud no invalida el enlace actual ni consume el cupo de reemplazos. Un mensaje ya en tránsito puede llegar, pero su token revocado no permite verificar.

Frontend: S3 bloquea acceso público, CloudFront OAC y HTTPS; CSP, `frame-ancestors 'none'`, HSTS, no-sniff, no-referrer y Permissions-Policy. Microsoft Clarity (`zdmf64alc5`) carga por defecto en producción, sin banner propio ni señales de consentimiento fabricadas. El body completo se marca con `data-clarity-mask="True"`; no se envían respuestas o correos como identificadores ni propiedades personalizadas. La URL se limpia antes de cargar el script, después de capturar en memoria el token de verificación. La información del estudio declara esta telemetría. El enmascaramiento no equivale a anonimato. La CSP permite los dominios de Clarity y su endpoint de Bing. Los PDF bajo `manuscrito/*` permiten únicamente incrustación desde el mismo origen (`SAMEORIGIN`, `frame-ancestors 'self'`), con disposición inline; las páginas mantienen DENY. Verificar usa POST después de una acción humana; GET y prefetch no consumen el token. Sólo se permiten llamadas CORS desde `https://research.woku.app`. El mock worker no se publica en builds reales.

## Límites que no deben ocultarse

- Por requisito del producto se revela si un correo participó y verificó. Las tasas reducen enumeración, pero no la eliminan. Evitar esa revelación requeriría modificar el flujo solicitado.
- Verificar un email prueba control del buzón, no identidad corporativa ni una empresa única. Personas con varios correos, respuestas falsas y bots aún requieren revisión de calidad. No se implementó CAPTCHA ni se promete impedir el llenado malicioso del piloto.
- El API del estudio es público para recibir encuestas. El backend productivo de woku sigue separado. CORS no autentica llamadas externas.
- Al aceptar y contar respuestas no verificadas, alguien puede consumir cupos con direcciones ajenas. Es la consecuencia del criterio de recepción elegido; el estudio puede pausarse mediante IAM.
- Compartir SES comparte cuota/reputación y la política de supresión de la cuenta. Se exige TLS al destinatario: un servidor que no lo admita puede rechazar la entrega. No se modifica la política de producción.
- SES no garantiza una entrega exactamente una vez: si confirma y el worker cae antes de persistir, puede repetirse el mismo mensaje. Leases y UUID evitan que eso duplique la respuesta.
- Una sola AZ para DB, Lambdas y endpoints prioriza coste. No proporciona tolerancia completa a caída de AZ. Backups no equivalen a un ensayo de restauración.
- El navegador conserva borradores y enviados conforme al requisito del producto. En equipos compartidos esos datos permanecen accesibles al perfil del navegador. No se consideran cifrados por el almacenamiento local.

## Dependencias, 14 de noviembre de 2026

Se actualizaron Zod a 4.6.7, Vite a 7.3.8 y Vitest a 4.1.12; se fija esbuild 0.28.2. El lockfile raíz es la fuente reproducible.

`npm audit --omit=dev`: **0 vulnerabilidades reportadas**. No equivale a ausencia total de vulnerabilidades ni es una auditoría de penetración.

El audit completo conserva una vulnerabilidad moderada en **minimatch 10.2.6 empaquetado dentro de aws-cdk-lib 2.277.0**, reportada también contra su padre: [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249). El override npm no reemplaza esa copia bundled. No se usa en Lambda ni en el bundle del frontend; los globs de build son del repositorio y no aceptan entrada de participantes. No sintetizar código/globs no confiables. Actualizar CDK cuando publique el parche. No se aplicó el downgrade sugerido por audit porque introducía vulnerabilidades de mayor gravedad.

## Pendiente de la etapa de despliegue

Certificado/DNS, conectividad privada, TLS RDS y entrega SES fueron comprobados en la prueba productiva autorizada; Diego y Paula confirmaron verificación. Continúan pendientes la suscripción operativa a alarmas, la revisión de supresión/bounces y el ensayo de restauración antes del campo formal. El estado y las modificaciones de AWS se documentan en PRODUCTION.md.
