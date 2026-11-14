> **Versión anterior, reemplazada para aplicación.** Usar la [encuesta breve vigente de 15 preguntas](cuestionario-ia-cx-v02-breve.md). Esta versión se conserva sólo como antecedente.

# Cuestionario de adopción de IA en gestión de experiencia del cliente

Versión 0.1 para programación y prueba. Diseño propio basado en literatura; **no es una escala previamente validada**. 26 preguntas de contenido más consentimiento; los saltos reducen lo que ve cada participante. Duración objetivo de 10–12 minutos para usuarios y menor para no usuarios, pendiente de medir en el piloto. No requiere entrevistas.

## Flujo de participación acordado

**Ingresar cualquier correo → contestar la encuesta → enviar y guardar → recibir correo de verificación.** No se pide verificar antes de responder. No se requiere correo corporativo, contraseña ni registro empresarial previo.

Toda respuesta enviada queda guardada. Si la persona verifica, se marca «correo verificado»; si no, permanece como «correo no verificado», sin eliminarla ni descartarla por ese motivo. Los indicadores podrán incluir ambos grupos y distinguirlos. La posesión del buzón no acredita por sí sola conocimiento o representación empresarial.

El correo se solicita una sola vez al inicio, separado de las respuestas analíticas. Las preguntas empresariales se responden dentro de la encuesta. El [protocolo de aplicación](../metodologia/protocolo-inicial.md) contiene el recorrido, textos y estados. Compartir está disponible al terminar, sin exigir verificación.

La captación desde base propia, LinkedIn, agentes y referidos sigue siendo no probabilística; aceptar todos los dominios y verificar algunos correos no convierte el reclutamiento en aleatorio.

### Campo de correo al inicio

**Tu correo electrónico (idealmente empresarial)**

«Puedes usar cualquier correo. Lo usaremos únicamente para verificar tu respuesta después de enviarla y enviarte los resultados al finalizar el estudio. No lo usaremos para marketing ni publicidad.»

Botón: **Comenzar encuesta**. Aceptar correos personales y empresariales; no verificar antes de contestar.

**Português brasileiro:** Seu e-mail (de preferência, profissional)

«Você pode usar qualquer e-mail. Ele será usado somente para verificar sua resposta após o envio e enviar os resultados ao final do estudo. Não será usado para marketing nem publicidade.»

Botão: **Começar pesquisa**.

## Información que debe mostrarse antes de responder

**Completar antes de abrir el formulario:** institución responsable [INSTITUCIÓN], contacto [EMAIL], finalidad del tratamiento [FINALIDAD], personas con acceso a datos [ACCESO], plazo de conservación [PLAZO] y condiciones de retiro [PROCEDIMIENTO]. La finalidad del correo queda fijada: verificación posterior al envío y entrega de resultados agregados al finalizar; sin marketing ni publicidad. Estos campos no se completan con información inventada.

Texto propuesto: «Queremos conocer cómo las empresas utilizan —o no utilizan— inteligencia artificial en su relación con clientes. Su participación es voluntaria. Responda sobre una sola empresa o unidad empresarial en el país indicado, no sobre todo un grupo multinacional. No hay respuestas correctas o deseables. No solicitamos datos personales de clientes. Los resultados se comunicarán de manera agregada conforme al aviso de información anterior».

No prometer anonimato si el enlace contiene un identificador de empresa. Cuando se use, describir el registro como confidencial/pseudonimizado y separar la base de contactos de las respuestas. El formulario debe permitir «no sabe» y dejar preguntas no esenciales sin responder. No pedir nombre del participante, teléfono o correo dentro de las respuestas analíticas.

## Definición antes del bloque de adopción

**Español:** «En esta encuesta, IA se refiere a funciones que clasifican o predicen a partir de datos, generan contenido o interpretan lenguaje para apoyar o ejecutar tareas. Incluya funciones de IA dentro de un software y servicios de proveedores. Tener una página web, un CRM, mensajes programados o un chatbot con respuestas fijas no basta, por sí solo, para afirmar que utiliza IA. Si no conoce la tecnología, seleccione “no sabe”. La relación con clientes incluye lo que ocurre antes, durante y después de la compra».

**Português brasileiro:** «Nesta pesquisa, IA se refere a funções que classificam ou fazem previsões a partir de dados, geram conteúdo ou interpretam linguagem para apoiar ou executar tarefas. Inclua funções de IA incorporadas em softwares e serviços de fornecedores. Ter um site, um CRM, mensagens programadas ou um chatbot com respostas fixas não basta, por si só, para afirmar que utiliza IA. Se não conhecer a tecnologia, selecione “não sabe”. O relacionamento com clientes inclui o que ocorre antes, durante e depois da compra».

La [especificación bilingüe](instrumento-encuesta-ia-cx-es-pt.csv) contiene preguntas, alternativas y filas en español y portugués brasileño, con códigos compartidos. Es una base para programar, no una importación universal a cualquier plataforma. Revisar lingüísticamente ambas versiones antes del campo. Para empresas de Haití se requiere además una versión adecuada al idioma de respuesta; no se dará por cubierta su población sólo con español/portugués.

## Preguntas

### Q00 · Consentimiento

**¿Acepta participar voluntariamente en este estudio, según la información presentada?**

Tipo: única. Mostrar: Todos.

Respuestas:

- 1=Sí
- 0=No

Nota de programación: 0: terminar sin guardar respuestas sustantivas. Mostrar aviso de información completo antes de esta pregunta.

### Q01 · Perfil

**¿En qué país opera la empresa o unidad empresarial sobre la que responderá?**

Tipo: única. Mostrar: Todos elegibles.

Respuestas:

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

Nota de programación: OT: terminar como fuera de cobertura. Mantener país real; derivar grupo, nunca preguntar solamente Resto.

### Q02 · Perfil

**¿Cuál es su principal función en esa empresa?**

Tipo: única. Mostrar: Todos elegibles.

Respuestas:

- 1=Propietario/a o dirección general
- 2=Experiencia, atención o éxito del cliente
- 3=Marketing o ventas
- 4=Tecnología, datos o transformación digital
- 5=Operaciones
- 6=Otra

### Q03 · Perfil

**¿Conoce los procesos de relación con clientes y las herramientas que usa la empresa, o puede consultar esa información para responder?**

Tipo: única. Mostrar: Todos elegibles.

Respuestas:

- 1=Sí, directamente
- 2=Sí, puedo consultar información interna
- 0=No

Nota de programación: 0: terminar e indicar que responda alguien con ese conocimiento; no enviar invitaciones automáticamente.

### Q04 · Perfil

**¿La empresa está formalmente registrada en el país indicado?**

Tipo: única. Mostrar: Todos elegibles.

Respuestas:

- 1=Sí
- 0=No
- 99=No sabe

Nota de programación: Universo propuesto: empresas formales. 0: fuera de universo; 99: elegibilidad indeterminada y cierre. Registrar aparte, sin convertir en no adoptante.

### Q05 · Perfil

**¿Cuál es la actividad principal de la empresa?**

Tipo: única. Mostrar: Todos elegibles.

Respuestas:

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

Nota de programación: Clasificación resumida propia; no anunciar equivalencia exacta a ISIC sin recodificación. Para 12, texto opcional máximo 80 caracteres.

### Q06 · Perfil

**¿Cuántas personas trabajan actualmente en esta empresa en el país indicado? Incluya propietarios que trabajan; excluya personal de proveedores externos. Si no conoce el número exacto, seleccione un rango.**

Tipo: número con alternativa de rango. Mostrar: Todos elegibles.

Respuestas:

- Número entero ≥1; alternativa: 1=1–9
- 2=10–49
- 3=50–249
- 4=250 o más
- 99=No sabe

Nota de programación: Guardar empleo_exacto y tamano. Una sola vía de respuesta; derivar rango del exacto. 0: fuera de universo; 99: permitir continuar pero no clasificar en una cuota de tamaño.

### Q07 · Perfil

**¿A quién vende principalmente la empresa?**

Tipo: única. Mostrar: Todos elegibles.

Respuestas:

- 1=Personas/consumidores
- 2=Empresas u organizaciones
- 3=Ambos en proporciones similares
- 99=No sabe

### Q08 · Perfil

**¿Cuál es la forma de propiedad de la empresa?**

Tipo: única. Mostrar: Todos elegibles.

Respuestas:

- 1=Privada
- 2=Cooperativa
- 3=Mixta pública y privada
- 4=Estatal
- 5=Otra
- 99=No sabe

Nota de programación: Responder sobre empresas que comercializan bienes o servicios, no dependencias administrativas.

### Q09 · Perfil

**¿Cuántos años lleva operando la empresa en este país?**

Tipo: única. Mostrar: Todos elegibles.

Respuestas:

- 1=Menos de 3
- 2=3–9
- 3=10 o más
- 99=No sabe

### Q10 · Adopción

**Actualmente, ¿en qué situación está la empresa respecto al uso de IA en cada actividad?**

Tipo: matriz única por fila. Mostrar: Todos elegibles.

Filas:

- T1=Analizar comentarios, reclamos, reseñas o conversaciones de clientes
- T2=Predecir abandono o necesidades y priorizar acciones de atención
- T3=Personalizar recomendaciones o comunicaciones a clientes
- T4=Responder directamente a clientes mediante chat o voz
- T5=Ayudar al personal con búsqueda, borradores, resúmenes o revisión de atención
- T6=Resolver o dar seguimiento a reclamos y fallas de servicio
- T7=Investigar necesidades de clientes o mejorar productos, servicios y puntos de contacto
- T8=Ejecutar acciones para clientes, como gestionar pedidos, reservas o devoluciones

Respuestas:

- 0=No utiliza ni lo está considerando
- 1=Lo considera, sin pruebas activas
- 2=Está realizando pruebas o pilotos
- 3=La utiliza de manera habitual
- 4=Dejó de utilizarla o la suspendió
- 99=No sabe

Nota de programación: Mostrar definición de IA antes del bloque. Variables Q10_T1…T8. Estado actual separado del uso en últimos 90 días; no imponer orden numérico como escala de madurez.

### Q11 · Adopción

**¿En cuáles de esas actividades se utilizó efectivamente IA durante los últimos 90 días, incluso en pruebas o mediante un proveedor?**

Tipo: múltiple. Mostrar: Todos elegibles.

Respuestas:

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

Nota de programación: NONE y DK exclusivos. Permitir responder aunque Q10 muestre suspensión: pudo haber uso reciente. Si Q10 habitual y Q11 NONE, mostrar aviso neutral para revisar, sin forzar cambio.

### Q12 · Aplicación principal

**De las actividades seleccionadas, ¿en cuál se utilizó IA con mayor frecuencia durante esos 90 días? Si hay empate, elija la que involucró más interacciones con clientes.**

Tipo: única dinámica. Mostrar: Q11 contiene al menos una T.

Respuestas:

- Opciones T1…T8 seleccionadas en Q11

Nota de programación: Si hay una sola T, asignar automáticamente sin mostrar pregunta. Las siguientes preguntas se refieren sólo a esta aplicación, no a toda la empresa.

### Q13 · Aplicación principal

**¿Qué herramienta o función de IA utiliza para esa actividad? Puede indicar el nombre o describir brevemente qué hace.**

Tipo: texto breve opcional. Mostrar: Q11 contiene al menos una T.

Respuestas:

- Texto ≤150 caracteres
- DK=No sabe

Nota de programación: No pedir datos de clientes. No clasificar como IA únicamente por la marca; verificar función cuando sea posible, sin entrevistas.

### Q14 · Aplicación principal

**¿Qué hace la IA en esa actividad? Seleccione lo que corresponda.**

Tipo: múltiple. Mostrar: Q11 contiene al menos una T.

Respuestas:

- 1=Clasifica información, predice o recomienda
- 2=Genera texto, audio, imágenes u otro contenido
- 3=Ejecuta acciones en sistemas, como registrar o modificar pedidos
- 4=Otra función
- DK=No sabe

Nota de programación: DK exclusivo. Ejecutar acciones no demuestra por sí solo autonomía de agente; no llamar agénticos a todos los casos 3.

### Q15 · Aplicación principal

**¿Cómo accede la empresa a esa función de IA?**

Tipo: múltiple. Mostrar: Q11 contiene al menos una T.

Respuestas:

- 1=Función incluida en un software o plataforma contratada
- 2=Solución adaptada o desarrollada por proveedor
- 3=Desarrollo interno
- 4=Herramientas utilizadas por empleados por iniciativa propia
- 5=Otra vía
- DK=No sabe

Nota de programación: DK exclusivo. Registrar iniciativa propia separada de formalización, sin asumir que todo uso informal está prohibido.

### Q16 · Aplicación principal

**Durante los últimos 90 días, ¿con qué frecuencia se utilizó IA en esa actividad?**

Tipo: única. Mostrar: Q11 contiene al menos una T.

Respuestas:

- 1=Menos de una vez al mes
- 2=Al menos una vez al mes, pero menos de una vez por semana
- 3=Al menos una vez por semana, pero no todos los días laborales
- 4=Todos o casi todos los días laborales
- 99=No sabe

### Q17 · Aplicación principal

**¿Cómo accede esa aplicación de IA a la información de la empresa?**

Tipo: única. Mostrar: Q11 contiene al menos una T.

Respuestas:

- 0=No utiliza información interna
- 1=Se introduce o carga manualmente
- 2=Accede automáticamente a un sistema o fuente interna
- 3=Accede automáticamente a varios sistemas o fuentes internas
- 99=No sabe

Nota de programación: Si combina manual y automático, escoger el mayor nivel de conexión automática. No asumir que más conexión es mejor calidad.

### Q18 · Aplicación principal

**Antes de que una respuesta o acción de esa IA afecte al cliente, ¿cómo interviene una persona?**

Tipo: única. Mostrar: Q11 contiene al menos una T.

Respuestas:

- 1=Revisa cada respuesta o acción
- 2=Revisa los casos definidos como sensibles o complejos
- 3=Revisa una muestra de casos
- 4=No hay revisión humana previa
- 5=No produce respuestas o acciones que lleguen directamente al cliente
- 99=No sabe

Nota de programación: No confundir revisión posterior con previa. Estas categorías no son una escala de madurez.

### Q19 · Aplicación principal

**En esa aplicación de IA, ¿existen actualmente las siguientes prácticas?**

Tipo: matriz única por fila. Mostrar: Q11 contiene al menos una T.

Filas:

- G1=Persona identificable responsable del uso
- G2=Pautas sobre qué información se puede ingresar
- G3=Procedimiento para corregir errores o recurrir a una persona
- G4=Revisión periódica de calidad o errores

Respuestas:

- 0=No
- 1=Sí
- 99=No sabe
- 98=No aplica

Nota de programación: Prácticas funcionales; no exigir área formal o documentación extensa para contar Sí.

### Q20 · Aplicación principal

**Aproximadamente, ¿en qué proporción de los casos de esa actividad intervino IA durante los últimos 90 días?**

Tipo: única. Mostrar: Q11 contiene al menos una T.

Respuestas:

- 1=Menos de 10%
- 2=10%–24%
- 3=25%–49%
- 4=50%–74%
- 5=75%–100%
- 99=No sabe/no puede estimarlo

Nota de programación: Denominador: casos de la actividad principal, no todos los clientes de la empresa. No imputar puntos medios como medición exacta.

### Q21 · Resultados percibidos

**Según su apreciación, frente a la situación anterior a introducir IA en esa actividad, ¿qué ha ocurrido con estos aspectos?**

Tipo: matriz única por fila. Mostrar: Q11 contiene al menos una T.

Filas:

- O1=Rapidez de resolución
- O2=Exactitud o calidad de las respuestas
- O3=Facilidad para que el cliente resuelva su necesidad
- O4=Satisfacción de los clientes
- O5=Eficiencia en el costo de atención

Respuestas:

- -1=Empeoró
- 0=Se mantuvo
- 1=Mejoró
- 99=No sabe/no tiene comparación
- 98=No aplica

Nota de programación: Autorreporte retrospectivo; no atribución causal. En O5 mejoró significa mayor eficiencia, no mayor costo.

### Q22 · Resultados percibidos

**¿En qué información se basa su evaluación anterior?**

Tipo: múltiple. Mostrar: Q11 contiene al menos una T.

Respuestas:

- 1=Impresión personal o comentarios informales
- 2=Indicadores internos de operación
- 3=Encuestas o mediciones de clientes
- 4=Evaluación económica documentada
- NONE=No existe información para evaluar
- DK=No sabe

Nota de programación: NONE y DK exclusivos. Declarar disponer de indicadores no equivale a verificarlos; no se solicitan registros en este estudio.

### Q23 · Capacidades

**Actualmente, ¿la empresa cuenta con lo siguiente para usar IA en su relación con clientes?**

Tipo: matriz única por fila. Mostrar: Todos elegibles.

Filas:

- R1=Información de clientes organizada y utilizable
- R2=Personas con conocimientos para utilizar estas herramientas
- R3=Objetivos definidos por la dirección o propietarios
- R4=Recursos económicos disponibles para estas aplicaciones
- R5=Apoyo técnico interno o externo al que recurrir

Respuestas:

- 0=No
- 1=Parcialmente
- 2=Sí
- 99=No sabe

Nota de programación: Preguntar a usuarios y no usuarios. Indicadores propios inspirados en literatura; no escala validada ni índice único.

### Q24 · Barreras

**¿Cuáles son hoy los principales obstáculos para iniciar o ampliar el uso de IA en la relación con clientes? Elija hasta tres.**

Tipo: múltiple máximo 3. Mostrar: Todos elegibles.

Respuestas:

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

Nota de programación: NONE y DK exclusivos; orden aleatorio de 1–10 si la plataforma lo permite; no interpretar no seleccionado como ausencia total de barrera.

### Q25 · Planes

**¿Cuál describe mejor el plan principal de la empresa para los próximos 12 meses respecto a la IA en la relación con clientes?**

Tipo: única. Mostrar: Todos elegibles.

Respuestas:

- 1=Iniciar o retomar pruebas
- 2=Ampliar su uso
- 3=Mantener el uso actual
- 4=Reducirlo o suspenderlo
- 5=No está previsto utilizarla
- 6=Todavía no hay una decisión
- 99=No sabe

Nota de programación: Intención separada de adopción. No exigir que planes coincidan con estado actual; revisar inconsistencias descriptivamente.

### Q26 · Cierre

**¿Desea agregar algo sobre el uso o no uso de IA en la relación con clientes? No incluya nombres ni datos personales de clientes.**

Tipo: texto opcional. Mostrar: Todos elegibles.

Respuestas:

- Texto ≤300 caracteres

Nota de programación: Opcional. Un campo abierto no convierte el diseño en un estudio de entrevistas ni en método mixto.

### P01 · Sólo piloto

**¿Cuánto le costó comprender las preguntas?**

Tipo: única. Mostrar: Sólo versión piloto.

Respuestas:

- 1=Ninguna
- 2=Poca
- 3=Moderada
- 4=Mucha
- 5=No pude responder varias

### P02 · Sólo piloto

**¿Qué pregunta o palabra le resultó confusa?**

Tipo: texto opcional. Mostrar: Sólo versión piloto.

Respuestas:

- Texto ≤300 caracteres

## Saltos y variables de análisis

- Q00 no acepta → salida. Q01 otro país → fuera de cobertura. Q03 no conoce → salida por informante no adecuado. Q04 no registrada → fuera del universo formal; no sabe → elegibilidad indeterminada. Estos casos no entran como «no adoptantes».
- Q11 contiene alguna actividad T1…T8 → Q12–Q22. Q11 NONE o DK → Q23–Q26. Para una sola actividad, Q12 se deriva automáticamente. Los saltos no se codifican como cero.
- Uso de IA en CX en últimos 90 días: positivo si Q11 contiene alguna T. Negativo sólo si Q11=NONE; DK o ausencia de respuesta quedan indeterminados.
- Adopción operativa actual: positiva si existe una actividad con Q10=3 y esa misma actividad aparece en Q11. Negativa si las respuestas observadas descartan todas las posibilidades; si queda una actividad indeterminada que podría cumplir ambas condiciones, clasificar como indeterminada. No forzar discrepancias a cero.
- Uso en piloto: informar Q10=2 por actividad, separado de operación habitual. Suspensión: Q10=4, compatible con uso reciente. Una empresa puede tener operación y pilotos simultáneamente; sus porcentajes no tienen por qué sumar 100%.
- Cobertura geográfica: seis códigos propios AR, PE, CO, CL, BR, MX; los otros 14 se agregan como Resto. Conservar siempre el código nacional original.
- Tamaño: 1–9, 10–49, 50–249 y 250+ personas ocupadas. No sabe queda sin clasificación y no completa una cuota. Personas ocupadas según Q06, sin sustituir por ventas o clasificación legal.
- Q12–Q22 describen **una aplicación principal por empresa**. No generalizar sus respuestas a todas las aplicaciones; publicar siempre ese denominador.
- Para estimaciones de adopción, publicar número de elegibles, respuestas conocidas e indeterminadas. Con muestra probabilística, además de estimación entre respuestas conocidas y supuestos de no respuesta, mostrar sensibilidad: límite inferior contando indeterminadas como no uso y superior como uso, con pesos compatibles. No son intervalos de confianza.
- No sumar automáticamente capacidades, uso, supervisión y beneficios en un índice de madurez. No presentar los códigos categóricos como distancias cuantitativas.
- Q21 informa beneficios **percibidos**; Q22 informa la base declarada de esa percepción. Ninguna pregunta verifica efectos causales ni reemplaza datos de clientes.

## Sustento y límites de adaptación

Las preguntas se redactaron para este estudio; no se copiaron escalas completas. El perfil y el enfoque de informante empresarial toman como antecedente la [metodología de Enterprise Surveys](https://www.enterprisesurveys.org/en/methodology), sin replicar su universo ni modo presencial. Q17–Q19 se informan por las distinciones de personalización e intervención humana de [Grewal et al.](https://doi.org/10.1007/s11747-024-01064-3). Q23 y Q24 se informan por la preparación organizacional de [Jöhnk et al.](https://doi.org/10.1007/s12599-020-00676-7). La cobertura de actividades retoma la perspectiva de recorrido de [Lemon y Verhoef](https://doi.org/10.1509/jm.15.0420).

Esta trazabilidad aporta fundamento conceptual; **no transfiere validación psicométrica a preguntas nuevas o traducidas**. La versión 0.1 debe superar revisión de contenido y prueba del formulario. El estudio se plantea como descripción y comparación de indicadores, no como validación de una nueva escala latente ni demostración causal.
