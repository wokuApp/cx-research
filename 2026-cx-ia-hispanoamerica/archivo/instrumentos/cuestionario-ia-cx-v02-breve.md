> **Versión anterior.** La revisión vigente es el [cuestionario v0.3](cuestionario-ia-cx-v03.md), acotado a CX y con grupo multinacional.

# Encuesta breve: adopción de IA en experiencia del cliente

**Versión 0.2 — instrumento vigente para el piloto.** 15 preguntas de contenido, más consentimiento y el campo de correo. Es el 58% del número anterior de preguntas de contenido (15/26). **Sin matrices.** Quienes no reportan uso de IA en los últimos 90 días responden 10 preguntas; usuarios, hasta 15, o 14 si se deriva automáticamente su única aplicación. Se añade sólo un comentario opcional al final del piloto.

**Duración objetivo:** 5–7 minutos, pendiente de comprobar con las primeras 50 respuestas. Es una estimación de diseño, no una duración observada. El instrumento sigue siendo una adaptación propia para descripción y comparación, no una escala psicométrica validada.

[Especificación en español y portugués para programar](instrumento-encuesta-ia-cx-v02-es-pt.csv) · [Protocolo operativo](../metodologia/protocolo-inicial.md).

## Inicio y flujo acordado

**Tu correo electrónico (idealmente empresarial)**

Puedes usar cualquier correo. Lo usaremos únicamente para verificar tu respuesta después de enviarla y enviarte los resultados al finalizar el estudio. No lo usaremos para marketing ni publicidad.

**Português:** Seu e-mail (de preferência, profissional). Você pode usar qualquer e-mail. Ele será usado somente para verificar sua resposta após o envio e enviar os resultados ao final do estudo. Não será usado para marketing nem publicidade.

Correo → contestar → **enviar y guardar** → recibir mensaje de verificación. Todas las respuestas enviadas se conservan; se distinguen correos verificados/no verificados, sin excluir por esa diferencia. No se pide contraseña, correo corporativo obligatorio ni verificación previa. El nombre de empresa se pregunta dentro de la encuesta, no como registro previo.

Antes del consentimiento se completa y muestra institución responsable, contacto, finalidad, acceso y conservación de datos, y procedimiento de retiro. No afirmar anonimato: correo y nombre de empresa se mantienen separados de la base analítica y no se publican en resultados.

Introducción: «Responde sobre una sola empresa en el país indicado. Esta encuesta está dirigida a personas que conocen cómo se relaciona la empresa con sus clientes. Nos interesan tanto quienes usan IA como quienes no la usan. Si no sabes algo, puedes indicarlo».

## Definición antes de Q07

«Incluye funciones de IA que analizan o predicen con datos, generan contenido o interpretan lenguaje para apoyar tareas. Pueden estar dentro de un software o servicio contratado. Tener un CRM, mensajes programados o un chatbot de respuestas fijas no basta por sí solo. La relación con clientes incluye antes, durante y después de la compra».

Português: «Inclua funções de IA que analisam ou fazem previsões com dados, geram conteúdo ou interpretam linguagem para apoiar tarefas. Elas podem fazer parte de um software ou serviço contratado. Ter um CRM, mensagens programadas ou um chatbot de respostas fixas não basta, por si só. O relacionamento com clientes inclui antes, durante e depois da compra».

## Preguntas y respuestas

### Q00 · Consentimiento

**¿Acepta participar voluntariamente en este estudio, según la información presentada?**

- 1=Sí
- 0=No

Tipo: única. Mostrar: Todos.

Regla: Mostrar información y consentimiento antes de recoger respuestas. Aceptar cualquier tipo de correo al inicio; no verificar antes de responder. Al enviar: guardar encuesta y después enviar verificación. Mantener tanto verificadas como no verificadas. 0: terminar sin guardar respuestas sustantivas sin consentimiento. Campo previo ES: Tu correo electrónico (idealmente empresarial). Ayuda ES: Puedes usar cualquier correo. Lo usaremos únicamente para verificar tu respuesta después de enviarla y enviarte los resultados al finalizar el estudio. No lo usaremos para marketing ni publicidad. Campo previo PT-BR: Seu e-mail (de preferência, profissional). Ajuda PT-BR: Você pode usar qualquer e-mail. Ele será usado somente para verificar sua resposta após o envio e enviar os resultados ao final do estudo. Não será usado para marketing nem publicidade.

### Q01 · Perfil

**¿Cómo se llama la empresa o negocio sobre el que responderá?**

- Texto ≤120 caracteres
- PREF=Prefiero no indicarlo

Tipo: texto breve. Mostrar: Todos elegibles.

Regla: Se usa para detectar posibles duplicados, no se publica en resultados. Guardar nombre separado de respuestas analíticas. Si no se informa, conservar la respuesta y marcar la identificación empresarial como incompleta; no inventar una empresa ni exigir correo corporativo.

### Q02 · Perfil

**¿En qué país opera la empresa o unidad empresarial sobre la que responderá?**

- AR=Argentina
- BO=Bolivia
- BR=Brasil
- CL=Chile
- CO=Colombia
- CR=Costa Rica
- CU=Cuba
- EC=Ecuador
- SV=El Salvador
- GT=Guatemala
- HT=Haití
- HN=Honduras
- MX=México
- NI=Nicaragua
- PA=Panamá
- PY=Paraguay
- PE=Perú
- DO=República Dominicana
- UY=Uruguay
- VE=Venezuela
- OT=Otro país

Tipo: única. Mostrar: Todos elegibles.

Regla: OT: terminar como fuera de cobertura. Mantener país real; derivar grupo, nunca preguntar solamente Resto.

### Q03 · Perfil

**¿Cuántas personas trabajan en la empresa en ese país? Incluya propietarios que trabajan y excluya personal de proveedores externos.**

- 1=1–9
- 2=10–49
- 3=50–249
- 4=250 o más
- 0=Ninguna
- 99=No sabe

Tipo: única. Mostrar: Todos elegibles.

Regla: Sólo bandas; no pedir también empleo exacto. 0: fuera del universo empresarial definido; 99: conservar sin clasificar en cuota de tamaño.

### Q04 · Perfil

**¿Cuál es la actividad principal de la empresa?**

- 1=Comercio
- 2=Industria o manufactura
- 3=Servicios financieros o seguros
- 4=Tecnología, información o telecomunicaciones
- 5=Servicios profesionales o administrativos
- 6=Transporte o logística
- 7=Turismo, alojamiento o alimentación
- 8=Salud
- 9=Educación
- 10=Construcción o actividades inmobiliarias
- 11=Agro, minería, energía o servicios básicos
- 12=Otra actividad empresarial
- 99=No sabe

Tipo: única. Mostrar: Todos elegibles.

Regla: Clasificación resumida propia; no anunciar equivalencia exacta a ISIC sin recodificación. Para 12, texto opcional máximo 80 caracteres.

### Q05 · Perfil

**¿Desde qué función conoce la relación de esta empresa con sus clientes?**

- 1=Propietario/a o dirección general
- 2=Experiencia, atención o éxito del cliente
- 3=Marketing o ventas
- 4=Tecnología, datos o transformación digital
- 5=Operaciones
- 6=Otra
- 0=No conozco suficientemente estos procesos

Tipo: única. Mostrar: Todos elegibles.

Regla: 0: informar que se requiere alguien que conozca los procesos. Conservar registro enviado con marca de informante no adecuado; no contarlo como no adoptante. Las demás opciones son autodeclaración, no verificación del cargo.

### Q06 · Perfil

**¿La empresa está formalmente registrada en el país indicado?**

- 1=Sí
- 0=No
- 99=No sabe

Tipo: única. Mostrar: Todos elegibles.

Regla: 1: elegible por formalidad; 0: fuera del universo formal; 99: elegibilidad indeterminada. Conservar registros enviados con su marca, sin tratarlos como no adoptantes.

### Q07 · Adopción

**Actualmente, ¿cuál describe mejor el uso de IA de la empresa en su relación con clientes?**

- 0=No utiliza IA ni lo está considerando
- 1=Lo considera, pero no tiene pruebas activas
- 2=Sólo realiza pruebas o pilotos
- 3=Tiene al menos una aplicación en uso habitual
- 4=Suspendió todos los usos que tenía
- 99=No sabe

Tipo: única. Mostrar: Todos elegibles.

Regla: Estado global actual, no por actividad. Si combina aplicaciones habituales y pilotos, seleccionar 3. No interpretar códigos como escala lineal de madurez. Mostrar definición breve de IA.

### Q08 · Adopción

**¿Para qué utilizó IA la empresa en los últimos 90 días? Incluya pruebas y servicios de proveedores.**

- T1=Analizar comentarios, reclamos, reseñas o conversaciones de clientes
- T2=Predecir abandono o necesidades y priorizar acciones de atención
- T3=Personalizar recomendaciones o comunicaciones a clientes
- T4=Responder directamente a clientes mediante chat o voz
- T5=Ayudar al personal con búsqueda, borradores, resúmenes o revisión de atención
- T6=Resolver o dar seguimiento a reclamos y fallas de servicio
- T7=Investigar necesidades de clientes o mejorar productos, servicios y puntos de contacto
- T8=Ejecutar acciones para clientes, como gestionar pedidos, reservas o devoluciones
- NONE=En ninguna
- DK=No sabe

Tipo: múltiple. Mostrar: Todos elegibles.

Regla: NONE y DK exclusivos. Responder aunque Q07 indique suspensión: pudo haber uso reciente. Con alguna T, mostrar Q09–Q13; con NONE o DK, ir a Q14. Si Q07=3 y Q08=NONE, permitir revisar sin forzar cambio.

### Q09 · Aplicación principal

**De las actividades seleccionadas, ¿en cuál se utilizó IA con mayor frecuencia durante esos 90 días? Si hay empate, elija la que involucró más interacciones con clientes.**

- Opciones T1…T8 seleccionadas en Q08

Tipo: única dinámica. Mostrar: Q08 contiene al menos una T.

Regla: Con una sola actividad, asignar automáticamente sin mostrar. Q10–Q13 se refieren sólo a esta actividad principal; no a todas las aplicaciones.

### Q10 · Aplicación principal

**¿Cómo accede esa aplicación de IA a la información de la empresa?**

- 0=No utiliza información interna
- 1=Se introduce o carga manualmente
- 2=Accede automáticamente a un sistema o fuente interna
- 3=Accede automáticamente a varios sistemas o fuentes internas
- 99=No sabe

Tipo: única. Mostrar: Q08 contiene al menos una T.

Regla: Si combina manual y automático, escoger el mayor nivel de conexión automática. No asumir que más conexión es mejor calidad.

### Q11 · Aplicación principal

**Antes de que una respuesta o acción de esa IA afecte al cliente, ¿cómo interviene una persona?**

- 1=Revisa cada respuesta o acción
- 2=Revisa los casos definidos como sensibles o complejos
- 3=Revisa una muestra de casos
- 4=No hay revisión humana previa
- 5=No produce respuestas o acciones que lleguen directamente al cliente
- 99=No sabe

Tipo: única. Mostrar: Q08 contiene al menos una T.

Regla: No confundir revisión posterior con previa. Estas categorías no son una escala de madurez.

### Q12 · Resultados percibidos

**Según su apreciación, ¿cómo ha cambiado la experiencia ofrecida a los clientes con esta aplicación de IA, respecto de antes de utilizarla?**

- -1=Empeoró
- 0=Se mantuvo
- 1=Mejoró
- 99=No sabe o aún no puede evaluarlo

Tipo: única. Mostrar: Q08 contiene al menos una T.

Regla: Percepción global de un informante sobre una aplicación. No mide por separado tiempos, satisfacción o costos, ni prueba impacto causal. No tratar como una escala validada de CX.

### Q13 · Resultados percibidos

**¿En qué información se basa su evaluación anterior?**

- 1=Impresión personal o comentarios informales
- 2=Indicadores internos de operación
- 3=Encuestas o mediciones de clientes
- 4=Evaluación económica documentada
- NONE=No existe información para evaluar
- DK=No sabe

Tipo: múltiple. Mostrar: Q08 contiene al menos una T.

Regla: NONE y DK exclusivos. Base declarada de la percepción de Q12; no verifica indicadores ni pide documentos.

### Q14 · Barreras

**¿Cuáles son hoy los principales obstáculos para iniciar o ampliar el uso de IA en la relación con clientes? Elija hasta tres.**

- 1=Costo o presupuesto
- 2=Falta de tiempo
- 3=Falta de conocimientos
- 4=Datos insuficientes o poco organizados
- 5=Dificultad de integración tecnológica
- 6=Preocupación por privacidad o seguridad
- 7=Dudas sobre calidad o confiabilidad
- 8=Beneficios o necesidades poco claros
- 9=Resistencia de empleados o clientes
- 10=Falta de proveedores o apoyo adecuado
- 11=Otro
- NONE=Ninguno
- DK=No sabe

Tipo: múltiple máximo 3. Mostrar: Todos elegibles.

Regla: NONE y DK exclusivos; orden aleatorio de 1–10 si la plataforma lo permite; no interpretar no seleccionado como ausencia total de barrera.

### Q15 · Planes

**¿Cuál describe mejor el plan principal de la empresa para los próximos 12 meses respecto a la IA en la relación con clientes?**

- 1=Iniciar o retomar pruebas
- 2=Ampliar su uso
- 3=Mantener el uso actual
- 4=Reducirlo o suspenderlo
- 5=No está previsto utilizarla
- 6=Todavía no hay una decisión
- 99=No sabe

Tipo: única. Mostrar: Todos elegibles.

Regla: Intención separada de adopción. No exigir que planes coincidan con estado actual; revisar inconsistencias descriptivamente.

### P01 · Sólo piloto

**¿Hubo alguna pregunta u opción que no entendiste o que te faltó? Cuéntanos cuál.**

- Texto ≤300 caracteres

Tipo: texto opcional. Mostrar: Sólo versión piloto.

Regla: Sólo piloto, opcional. Medir tiempo y abandono automáticamente; no añadir una segunda pregunta de claridad.

## Reglas de análisis y alcance de la reducción

- Mantener país real de Q02. Los seis países foco son Argentina, Perú, Colombia, Chile, Brasil y México; los otros 14 se agrupan como Resto. Tamaño se obtiene sólo de las bandas de Q03.
- Q01 facilita detectar posibles duplicados, pero nombres iguales no prueban que sea la misma empresa. Conservar marcas de identidad incierta y originales; no prometer deduplicación perfecta. El nombre no se publica en resultados.
- Q05=0 indica informante no adecuado; Q06=0, fuera del universo formal; Q06=99, elegibilidad indeterminada. Conservar respuestas enviadas, distinguiendo aceptación/guardado de inclusión analítica. Verificar correo no cambia estas condiciones.
- Q07 mide estado global actual: uso habitual, pilotos, consideración, suspensión o no uso. Una empresa con uso habitual y pilotos se registra en uso habitual; esta versión no reconstruye el estado de cada aplicación.
- Uso reciente: Q08 con alguna T es positivo; NONE es negativo; DK o ausente es indeterminado. Las distintas actividades son respuesta múltiple: sus porcentajes no suman necesariamente 100%.
- Q07=3 es **uso habitual autodeclarado**. No presentarlo como adopción operativa verificada. Una discordancia con Q08 debe conservarse y reportarse; no convertirla automáticamente en cero ni eliminarla.
- Q09–Q13 describen una aplicación principal. No generalizar esas respuestas a todo el portafolio de IA de la empresa.
- Q12 es percepción global, y Q13 su base declarada. No mide satisfacción directamente en clientes, no separa costos/rapidez/calidad y no demuestra efectos causales.
- Q14 recoge hasta tres barreras prioritarias; no seleccionar una no demuestra ausencia de esa barrera. Q15 recoge planes, no adopción futura observada.
- Se retiran del instrumento los módulos extensos de recursos/capacidades, gobierno, tipo de IA, vías de adquisición, frecuencia, intensidad de uso, propiedad, antigüedad y B2B/B2C. Tampoco se recoge empleo exacto. Los modelos sólo podrán ajustar por variables recogidas —país, tamaño, sector y rol— y metadatos de captación disponibles. No volver a introducir lo eliminado como campos obligatorios del registro.
- Captación voluntaria y no probabilística. Informar participantes, cobertura y desconocidos; no atribuir márgenes de muestreo aleatorio. Incluir correos verificados y no verificados, con desglose.

## Piloto y versiones

El piloto mantiene **n=50**. Revisar tiempo, abandono, saltos y el comentario opcional P01. No requiere entrevistas. Si la versión sustantiva queda igual, las respuestas elegibles y únicas podrán integrar el n objetivo de 2.800; si cambia, se conservan aparte. No mezclar automáticamente Q01…Q15 de esta versión con Q01…Q26 de la versión 0.1: cambian identificadores y contenido. Guardar `version_instrumento=0.2`.

## Fundamento conceptual

Esta reducción conserva el recorrido del cliente de [Lemon y Verhoef](https://doi.org/10.1509/jm.15.0420) y las distinciones de configuración e intervención humana de [Grewal et al.](https://doi.org/10.1007/s11747-024-01064-3). Se apoya en la literatura de preparación organizacional para redactar barreras, pero **ya no incluye una medición amplia de capacidades** de [Jöhnk et al.](https://doi.org/10.1007/s12599-020-00676-7). La fundamentación no transfiere validación psicométrica a estos ítems propios.
