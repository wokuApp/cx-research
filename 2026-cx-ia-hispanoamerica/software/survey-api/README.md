# Backend de woku research

Estado al 16 de noviembre de 2026: piloto abierto para difusión, con datos de ensayo previamente eliminados y capacidad temporal de reinicio deshabilitada. Ver [PRODUCTION.md](PRODUCTION.md) antes de ejecutar el procedimiento general o el reinicio de este documento.

Proyecto independiente para el estudio de IA en experiencia del cliente. Decisiones, tabla de servicios, modelo de datos y límites en [ARCHITECTURE.md](ARCHITECTURE.md). No reutiliza ninguna API, VPC ni base productiva de woku.

## Estructura

- `../survey-contract`: instrumento y validación Zod compartida. Editar preguntas en `src/instrument-source.json` de ese paquete.
- `src/http.ts`: transporte HTTP, tamaño, CORS, rutas y errores.
- `src/store.ts`: transacciones, cupo global, reintentos, duplicados, tokens, outbox y límites.
- `src/privacy.ts`: cifrado autenticado, HMAC y digest de tokens.
- `src/migrations/001.sql`: tablas, restricciones, índices y vista de análisis.
- `src/roles.ts`: privilegios SQL diferentes para API y worker.
- `src/api.ts`, `worker.ts`, `admin.ts`: funciones Lambda separadas.
- `infra/research-stack.ts`: infraestructura CDK.
- `test`: TDD unitario, infraestructura y PostgreSQL real.

Node 24 y npm workspaces. Instalar desde la raíz; el único lockfile está allí:

```bash
npm ci
npm test
npm run test:integration
npm run build
npm run infra:synth
```

La suite PostgreSQL crea un contenedor efímero exclusivamente de pruebas, publicado en un puerto aleatorio de loopback, y lo elimina al terminar. Rechaza hosts externos y bases distintas de `research_test`. No usa las credenciales AWS ni los contenedores existentes de woku.

## API

| Método y ruta | Resultado |
| --- | --- |
| `GET /api/survey/status` | Fase, pausa y contador |
| `POST /api/survey/email-status` | `{email}`; disponible, pendiente o verificado |
| `POST /api/survey/responses` | Payload v0.6 estricto; respuesta guardada y correo encolado. Se preservan recibos idempotentes de 0.5 |
| `POST /api/survey/resend-verification` | `{email}`; invalida enlaces anteriores y encola uno nuevo, sin espera de 10 minutos |
| `POST /api/survey/verify` | `{token}`; consumo único y fecha de verificación |

La base de la API publicada incluye el stage `/v1`. `VITE_API_BASE_URL` debe recibir el output `ApiBaseUrl` completo, sin agregar `/api/survey`.

`409 paused`, `duplicate`, `idempotency_conflict`, `pilot_changed`; `400 invalid_payload`/`invalid_token`; `429 rate_limited`; `503 unavailable`. No se devuelven excepciones PostgreSQL, secretos ni respuestas ajenas. La entrega encolada no se presenta como entrega confirmada en la bandeja de entrada.

El mismo UUID y contenido se reconocen incluso con la encuesta pausada. La fecha del cliente se guarda como dato declarado; la recepción y el vencimiento usan el reloj de PostgreSQL. Se admiten correos personales. `trim` más minúsculas define unicidad; no se fusionan alias de Gmail ni se eliminan `+tags`.

## Probar localmente sin SES

Desde la raíz:

```bash
docker compose -f survey-api/compose.yaml up -d
OPEN_LOCAL_PILOT=true npm run dev -w survey-api
```

En otra terminal:

```bash
VITE_USE_MOCK_API=false VITE_API_BASE_URL=http://127.0.0.1:5130 npm run dev -w survey-web -- --port 5182 --strictPort
```

Abrir `http://127.0.0.1:5182`. Es PostgreSQL local real, con datos exclusivamente de prueba y sin worker SES. La clave y contraseña de desarrollo son públicas y sólo se aceptan en loopback; nunca usar datos personales reales ahí. `OPEN_LOCAL_PILOT=true` no borra el contador ni salta un piloto ya completo. `docker compose ... down` detiene el servicio y conserva el volumen.

La vista previa habitual en 5180 sigue usando MSW. Demo y modo real usan claves de almacenamiento distintas. El enlace `/verify#token=...` se procesa fuera del control de apertura, funciona durante la pausa, elimina el fragmento visible y requiere pulsar el botón de confirmación. No consume tokens por GET.

## Despliegue posterior

El despliegue del estudio ya existe; estas instrucciones documentan cómo preparar otro entorno autorizado. Antes de ejecutar estos pasos revisar cuenta, coste, remitente y certificado. La plantilla requiere un certificado ACM **emitido en us-east-1** que cubra `research.woku.app`. Puede ser uno exclusivo o el wildcard existente; el stack no modifica el certificado aportado.

**Requisito de cuota:** la plantilla reserva siete ejecuciones Lambda y AWS exige margen sin reserva. El preflight comprueba la capacidad disponible y aborta si es insuficiente; no reduce los límites para saltar la comprobación. La cuota es compartida por cuenta y región.

El bootstrap `CDKToolkit` ya existía en la cuenta inspeccionada; no se creó ni modificó. SES estaba habilitado para producción y `woku.app` verificado. RDS 18.6 `db.t4g.micro` con gp3 de 20 GiB estaba disponible. Comprobarlo nuevamente al desplegar.

1. Definir `export RESEARCH_EXPECTED_ACCOUNT=<cuenta>` y ejecutar `node survey-api/scripts/preflight.mjs`. Todas sus operaciones son de lectura. `npm run deploy` lo ejecuta nuevamente como `predeploy`; no permite saltarlo por accidente.
2. Confirmar si la cuenta/región tiene bootstrap CDK. `cdk bootstrap`, si es necesario, crea recursos IAM/S3; es una operación de despliegue separada, no parte del preflight.
3. Revisar `npm run infra:synth` y `npm run diff -w survey-api`. El stack no configura el rol global de logs de API Gateway ni modifica SES de producción.
4. Desplegar backend desde `survey-api`: `npm run deploy -- --parameters EnableTrialReset=true --outputs-file .test-evidence/backend-outputs.json`. Desplegar front por separado con `npm run deploy:web -- --parameters FrontendCertificateArn=<arn> ApiOrigin=<origen-https-api-sin-stage>`. El certificado debe ser us-east-1. La BD empieza cerrada; no abrir aún. La primera publicación puede ser sólo la pantalla de preparación mientras se resuelven cuota/DNS.
5. Invocar la Lambda indicada por `AdminFunctionName` con `{"action":"migrate"}`. Comprobar `FunctionError` y el JSON de salida, no sólo el código de salida de AWS CLI.
6. Confirmar configuración SES propia y conectar el output `AlertsTopicArn` a un canal operativo. El stack crea alarmas, pero no suscribe automáticamente a ninguna persona.
7. Configurar en Cloudflare un CNAME `research.woku.app` al output `CloudFrontDomain`, preferentemente DNS only porque CloudFront ya es CDN y termina TLS. No tocar registros del backend woku.
8. Ejecutar `node survey-api/scripts/publish-front.mjs` para construir con la API real, metadata pública, subir a **su bucket** e invalidar sólo rutas de entrada. No borra assets históricos ni cambia DNS.
9. Probar TLS, CORS, formulario, entrega SES y verificación con destinatarios de prueba expresamente acordados. Comprobar métricas y respaldos; los ensayos locales no sustituyen esas pruebas.
10. Abrir con la Lambda privada de administración: `{"action":"set-state","phase":"pilot","paused":false,"reason":"Cuestionario y entrega revisados antes del piloto"}`.

Para pausar: misma acción con `paused:true`. Para pasar al estudio principal después de revisar los 50: `phase:"main", paused:false` y una razón explícita. No hay endpoint HTTP administrativo, no hay reinicio de contador, no se permite volver de main a pilot. La versión activa es 0.6. Para actualizar desde 0.5, pausar primero e invocar Admin con `{"action":"set-instrument-version","version":"0.6","reason":"Motivo documentado del cambio"}`. La operación bloquea la fila de estado, exige pausa y registra auditoría, sin reiniciar respuestas o contadores. Los recibos 0.5 existentes siguen siendo recuperables; un envío nuevo 0.5 devuelve `instrument_changed`. Se conserva la versión de cada respuesta y no se imputa Q16 a datos anteriores.

Estado operacional mediante `{"action":"status"}`: devuelve contadores y estados de correo, nunca respuestas o emails. El worker procesa hasta cinco correos por minuto, reintenta con espera y abandona después de cinco intentos. Los fallos finales se revisan por el operador. Cada reenvío aceptado invalida todos los tokens anteriores del contacto, cancela mensajes pendientes anteriores y genera un token nuevo de 24 horas dentro de una sola transacción. No hay espera de 10 minutos ni bloqueo por un correo previamente pendiente. La verificación y el reenvío no borran la respuesta ni alteran el contador.

Se mantienen los límites por origen y un máximo de 10 reemplazos aceptados por dirección en 24 horas. Las solicitudes rechazadas por la antigua espera no consumen ese cupo nuevo. Si falla el encolado, se revierten la invalidación y el consumo de cupo. El worker vuelve a comprobar que el mensaje siga vigente antes de enviarlo. Un correo ya entregado a SES no puede retirarse, pero su enlace queda invalidado al aceptar el reenvío. En la UI se explica que hay que usar el nuevo enlace y revisar spam o correo no deseado.

## Reinicio después de la prueba inicial en producción

Ejecutado el 14 de noviembre de 2026 tras confirmación del usuario: cuatro respuestas de prueba eliminadas, contadores cero y piloto pausado. Se conserva este procedimiento como registro operativo, no para repetirlo durante el campo. La deshabilitación de la capacidad temporal se documenta en PRODUCTION.md. No se toca la RDS de woku.

1. Pausar la recepción mediante `set-state` y esperar que termine cualquier envío de correo en curso.
2. Revisar la cantidad exacta de respuestas de prueba. El contador elegible puede diferir de la cantidad total de filas.
3. Con `EnableTrialReset=true` en el stack backend, invocar sólo la Lambda privada Admin con `{"action":"reset-production-trial","confirmStudy":"ia-cx-2026","expectedResponses":N,"reason":"Prueba inicial completada; iniciar piloto limpio"}`.
4. La operación elimina únicamente contactos/respuestas/tokens/outbox/límites del estudio, reinicia ambos contadores y deja el piloto **pausado**. Conserva migraciones y auditoría. Rechaza recepción abierta, fase principal, conteo distinto o un worker con lease vigente.
5. Comprobar conteo cero, limpiar los borradores locales de prueba de los navegadores usados y desplegar backend con `EnableTrialReset=false`. Luego abrir el piloto formal por acción IAM explícita.

No se reinicia automáticamente por desplegar, abrir la encuesta o terminar una respuesta. Los backups pueden conservar datos de prueba durante su retención.

## Recuperación

RDS tiene backups automáticos de siete días, borrado protegido y snapshot al retirar el stack. Conservar también secretos y material de cifrado: una copia de la base sin esas claves no permite recuperar correos. Restaurar un snapshot en una **nueva instancia del estudio**, recrear permisos, actualizar configuración y realizar una prueba de lectura/verificación antes de reabrir. Este procedimiento debe ensayarse en AWS antes del trabajo de campo; todavía no se midió un tiempo de recuperación.

No rotar el secreto de privacidad sustituyéndolo sin una migración que recifre datos y mantenga índices HMAC/versiones de clave. Las credenciales SQL se actualizan mediante secretos y una invocación `migrate` para sincronizar roles; después reciclar los entornos Lambda. No se afirma rotación automática de esas credenciales.

Los datos de encuesta no tienen borrado automático, conforme a conservar también respuestas no verificadas. Definir retención institucional y eliminación de backups/secretos al cerrar el estudio. La vista `analysis_responses` omite el email, pero `Q01` puede identificar una empresa; revisar anonimización antes de exportar o publicar.
