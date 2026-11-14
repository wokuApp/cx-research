# Contrato de endpoints simulados

Edición del instrumento: 0.5, sólo español, ámbito Hispanoamérica. Implementación actual con **Mock Service Worker** en el navegador. Se hacen peticiones fetch reales en el front, interceptadas por el worker; no existe un backend desplegado ni envío real de correos.

## Disponibilidad

`GET /api/survey/status`

```json
{"phase":"pilot","paused":false,"completed":49,"pilotLimit":50,"pilotQuestions":true,"reason":null}
```

- Se consulta antes de mostrar el cuestionario, al recuperar foco y cada 15 segundos.
- `phase`: `pilot` o `main`. `pilotQuestions` controla los dos pasos P01/P02.
- En piloto, con 50 respuestas admitidas, devuelve `paused:true` y `reason:"pilot_limit"`.
- Una pausa manual devuelve `reason:"manual"`.
- Si falla la consulta inicial, se muestra indisponibilidad con reintento. No se asume que esté abierta.
- La persona cuya respuesta ocupa el puesto 50 recibe confirmación de guardado; a quienes abran después se les muestra la pausa.

## Correo ya respondido

`POST /api/survey/email-status`

Entrada: `{"email":"persona@ejemplo.com"}`. Salida:

```json
{"state":"answered_pending","simulated":true}
```

Estados: `available`, `answered_verified`, `answered_pending`.

El front permite iniciar a `available`; muestra confirmación de respuesta existente para los otros dos. El caso pendiente incluye el texto de correo enviado y una aclaración visible de que aquí se simula. `POST /api/survey/resend-verification` simula un reenvío solicitado por la persona, sin tocar respuestas ni contador.

Las comparaciones de correo usan trim y minúsculas en el mock. El backend definitivo deberá fijar su política de normalización y verificación. El tipo de dominio no restringe participación.

## Guardado y cupo

`POST /api/survey/responses`

Payload validado por Zod: versión 0.5, correo, consentimiento, locale `es`, indicador `pilot`, ID de envío, fecha, `emailVerified:false` y respuestas. P01 es requerida durante el piloto; P02 es comentario opcional, pero tiene su propio paso.

```json
{"accepted":true,"submissionId":"uuid","emailVerified":false,"verificationEmail":"simulated","status":{"phase":"pilot","paused":true,"completed":50,"pilotLimit":50,"pilotQuestions":true,"reason":"pilot_limit"}}
```

La respuesta se conserva primero en el navegador, tanto en la referencia al último envío como en un registro outbox con ID propio. Luego se intenta registrar mediante el endpoint. Fallar la petición, estar pausada o no verificar el correo no borra el registro local. Reintentar un mismo ID y payload no incrementa dos veces el contador. El mock cuenta respuestas completas admitidas, sin esperar verificación; las salidas por inelegibilidad se conservan pero no consumen el cupo piloto.

Se vuelve a comprobar el cupo al enviar, aunque la persona haya abierto la encuesta cuando estaba disponible. Errores previstos:

- `409 paused`: recepción pausada; se muestra pausa y se conserva el envío local.
- `409 duplicate`: ese correo ya tiene respuesta; se consulta su estado.
- `409 pilot_changed`: cambió la fase; se actualiza el recorrido antes de volver a enviar.
- `400 invalid_payload`: contrato o respuestas inválidas.
- `503`: fallo del servicio simulado/almacenamiento; no se presenta éxito falso.

El contador y los registros del mock se comparten entre pestañas del mismo navegador mediante localStorage. **No son un contador global de todos los participantes ni una base productiva.** En el backend real, verificar cupo, insertar, actualizar contador y pausar deben formar una operación atómica con unicidad/idempotencia. La verificación real debe controlarse en el servidor. La lógica no valida la existencia legal de las empresas.

## Probar estados

Usar **Simular el backend** en la cabecera:

- Piloto abierto.
- Piloto con 49 respuestas, para comprobar el cierre al enviar una más.
- Encuesta pausada.
- Encuesta principal abierta, sin P01/P02.
- Endpoint indisponible.
- Correo consultado en registros, ya respondido/verificado o ya respondido/pendiente.

Los controles alteran estados sintéticos y el contador de demostración, sin eliminar los envíos archivados. Para probar una respuesta nueva usar un correo de prueba que no esté registrado, o un contexto limpio del navegador. No emplear estos controles para obtener estadísticas reales.

## Conectar el backend independiente

`VITE_USE_MOCK_API=true` es el valor por defecto de esta demo. `VITE_API_BASE_URL` permite apuntar las peticiones al servidor definitivo cuando exista; deshabilitar el mock y retirar controles de simulación antes de recoger datos públicos. La app actual se presenta como vista previa y no envía emails. Conectar el servidor no sustituye las pruebas de integración, de cupo concurrente y de envío.

## Implementación posterior

El backend ahora existe en `../survey-api`, con contrato compartido en `../survey-contract`. Este archivo describe la demo MSW. El modo real usa `simulated:false`, verificación por POST y outbox PostgreSQL; consultar `../survey-api/README.md`. No se ha desplegado. Los builds con URL pública exigen mock desactivado y API HTTPS.
