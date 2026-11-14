# Verificación de implementación

Fecha: 14 de noviembre de 2026. Pruebas locales, sin desplegar AWS ni enviar correos.

## TDD ejecutado

1. Se escribieron pruebas de transporte y criptografía con implementaciones vacías. Fallaron por `Not implemented`. Se implementaron validación, errores, CORS, límites, cifrado y hashes; **13 pruebas pasaron**.
2. Se escribieron los escenarios PostgreSQL y se ejecutaron antes de migración/repositorio. El setup falló por migración no implementada. Se creó el modelo y las transacciones; **12 escenarios pasaron** sobre PostgreSQL 18 real en Docker.
3. Worker y roles SQL se probaron primero contra stubs: dos fallos del worker y fallo del setup de roles. Se implementaron, luego pasaron **16 unitarias** y **15 escenarios PostgreSQL**.
4. Controles administrativos y aserciones CDK fallaron con un stack vacío. La implementación corrigió también un ciclo IAM detectado por las aserciones. Resultado: **23 unitarias/infraestructura** verdes.
5. Cuatro escenarios de navegador fallaron antes de conectar el modo real y crear la pantalla de verificación. Tras implementar, **los cuatro pasaron**. Las peticiones de estos escenarios se interceptan en Playwright; no prueban AWS ni entrega SES.
6. Se añadió una comprobación de integración del adaptador HTTP con PostgreSQL: guardar, tratar texto parecido a SQL como datos y verificar. Resultado final: **16 escenarios PostgreSQL** verdes.

La salida detallada de cada ciclo se guardó localmente en `.test-evidence/`, ignorado por Git. Esos archivos conservan también los fallos previos, no sólo la ejecución final. Las 21 pruebas del contrato se trasladaron del frontend al paquete compartido y se quitó la copia duplicada después del refactor. El contrato y las aserciones en `test/` son reproducibles; no se afirma cobertura de todas las líneas.

## Resultado final comprobado

| Verificación | Resultado |
| --- | --- |
| Contrato compartido | 21 pruebas correctas |
| Backend y plantilla CDK | 23 pruebas correctas |
| Modelo MSW del frontend | 6 pruebas correctas |
| PostgreSQL real, transacciones, roles y adaptador HTTP | 16 pruebas correctas |
| Navegador con MSW, escritorio y móvil | 13 escenarios correctos |
| Navegador en modo real, respuestas de API interceptadas | 4 escenarios correctos |
| TypeScript y bundles Lambda | Correctos |
| Frontend producción sin mock | Compilación correcta; metadata pública generada |
| CloudFormation mediante CDK synth | Correcto, sin despliegue |
| cfn-lint sobre plantilla sintetizada | Sin errores; cinco advertencias W3005 por dependencias redundantes generadas por CDK |
| Importación de los tres bundles Lambda | Correcta en Node 24 |
| Auditoría de dependencias de ejecución | 0 vulnerabilidades reportadas |
| Auditoría completa de herramientas | Una vulnerabilidad moderada de minimatch bundled, también reportada contra CDK; ver SECURITY.md |

Con contador 49, doce transacciones simultáneas aceptaron **exactamente una** respuesta. El contador terminó en 50 y la recepción pausada. Reintentos concurrentes del mismo UUID no duplicaron filas ni correo. El fallo provocado al insertar outbox revirtió la respuesta y el contador. Roles API/worker no pudieron crear tablas/roles, borrar respuestas ni consultar administración; worker tampoco pudo leer respuestas o marcar contactos verificados.

La compilación del front mantiene una advertencia de tamaño de bundle (aproximadamente 641 kB JavaScript, 204 kB gzip en modo real). No se han medido tiempos de carga públicos ni latencia Lambda/RDS, y no se afirma rendimiento de producción a partir del build.

La pantalla de verificación se recorrió en navegador a 1280, 390 y 320 px: sin desborde horizontal, tarjeta estable y confirmación correcta. Capturas de inspección en `.impeccable/review/verify-*.png` del proyecto. Conserva el fondo y componentes del cuestionario.

## Inspección de AWS, sólo lectura

SES habilitado en producción con `woku.app` verificado. Endpoints privados de Secrets Manager y SES API disponibles; el hostname privado SES es `email.us-east-1.api.aws`. PostgreSQL 18.6 / db.t4g.micro / gp3 20 GiB disponible. Bootstrap CDK existente. Sin stack `woku-research` preexistente en la cuenta inspeccionada.

**Preflight bloqueado como corresponde:** cuota Lambda de 10 concurrentes, insuficiente para la reserva prevista y el remanente mínimo de AWS. Es un requisito para desplegar, no un fallo de las pruebas locales. No se solicitó aumento de cuota.

## No verificado todavía

Despliegue real, certificado y DNS de research.woku.app, conexión efectiva desde Lambda a RDS/SES privado, entrega y recepción de un email real, suscripción a alarmas, carga pública y restauración RDS. Requieren la etapa de despliegue. La arquitectura Single AZ no ofrece alta disponibilidad multi-AZ.
