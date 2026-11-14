# Encuesta vigente v0.5: IA en la experiencia del cliente en Hispanoamérica

Sólo español. Instrumento principal de 15 preguntas, una pregunta adicional de cobertura para respuestas multinacionales y **dos pasos de evaluación del piloto para las primeras 50 respuestas admitidas**. Correo, consentimiento e información del estudio se presentan aparte. No incluye entrevistas ni matrices. La duración se medirá en el piloto.

## Alcance y recepción

El ámbito es IA para gestionar la experiencia del cliente: comprensión de necesidades, personalización, atención y resolución de problemas, antes, durante y después de la compra. No se pregunta por IA general en funciones sin relación con CX.

Se utiliza **Hispanoamérica**, siguiendo la distinción de [FundéuRAE](https://www.fundeu.es/recomendacion/hispanoamerica-iberoamerica-latinoamerica/). El marco comprende 18 países soberanos del listado anterior, retirando Brasil y Haití; no se amplía automáticamente a territorios. Grupos: Argentina, Perú, Colombia, Chile, México, Resto de Hispanoamérica y Multinacional en Hispanoamérica. Multinacional aparece primero y representa varias operaciones conjuntas; Q02C registra el alcance. No se replica esa respuesta en los resultados nacionales.

La app consulta disponibilidad antes de abrir. El piloto se pausa al admitir la respuesta 50, aunque los correos no estén verificados, y requiere revisión antes de reabrir la etapa principal. También se comprueba al enviar, para impedir que entradas abiertas antes de la pausa superen el cupo. Por ahora, endpoints y contador son un mock local, no una recepción global real.

Acepta cualquier correo, idealmente empresarial. Al enviar guarda la respuesta antes de la verificación posterior. El correo sólo se usa para verificar y enviar resultados finales; no marketing. Distingue respuestas con correo verificado y no verificado. Si el correo ya respondió, muestra su estado sin duplicar el envío. LinkedIn/WhatsApp y copiar enlace permiten invitar a otras empresas sin incluir correos o respuestas en la URL.

[Especificación para programar](instrumento-encuesta-ia-cx-v05-es.csv) · [Protocolo](../metodologia/protocolo-inicial.md).

## Preguntas

### Q00: ¿Acepta participar voluntariamente en este estudio, según la información presentada?

- 1=Sí
- 0=No

Tipo: única. Mostrar: Todos.

### Q01: ¿Cómo se llama tu empresa?

- Texto ≤120 caracteres
- PREF=Prefiero no indicarlo

Tipo: texto breve. Mostrar: Todos elegibles.

### Q02: ¿Sobre qué operación de la empresa responderás?

- LATAM=Multinacional en Hispanoamérica
- AR=Argentina
- BO=Bolivia
- CL=Chile
- CO=Colombia
- CR=Costa Rica
- CU=Cuba
- EC=Ecuador
- SV=El Salvador
- GT=Guatemala
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

Ayuda: elegir la operación sobre la que se responde, no la casa matriz. Multinacional implica alcance en varios países hispanoamericanos.

### Q02C: ¿Qué países abarca tu respuesta?

- AR=Argentina
- BO=Bolivia
- CL=Chile
- CO=Colombia
- CR=Costa Rica
- CU=Cuba
- EC=Ecuador
- SV=El Salvador
- GT=Guatemala
- HN=Honduras
- MX=México
- NI=Nicaragua
- PA=Panamá
- PY=Paraguay
- PE=Perú
- DO=República Dominicana
- UY=Uruguay
- VE=Venezuela
- DK=No sé precisar los países

Tipo: múltiple. Mostrar: Q02=LATAM.

### Q03: ¿Cuántas personas trabajan en la empresa?

- 1=1–9
- 2=10–49
- 3=50–249
- 4=250 o más
- 0=Ninguna
- 99=No sabe

Tipo: única. Mostrar: Todos elegibles.

Ayuda contextual: personal del país seleccionado o del conjunto de operaciones de la respuesta regional.

### Q04: ¿A qué sector pertenece la empresa?

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

### Q05: ¿Cuál es tu rol o posición en la empresa?

- 1=Propietario/a o dirección general
- 2=Experiencia, atención o éxito del cliente
- 3=Marketing o ventas
- 4=Tecnología, datos o transformación digital
- 5=Operaciones
- 6=Otro rol
- 99=Prefiero no indicarlo

Tipo: única. Mostrar: Todos elegibles.

### Q06: ¿La empresa está formalmente registrada?

- 1=Sí
- 0=No
- 99=No sabe

Tipo: única. Mostrar: Todos elegibles.

### Q07: ¿Cómo usa la empresa la IA en la experiencia del cliente?

- 0=No usamos IA en experiencia del cliente ni lo estamos considerando
- 1=Lo estamos evaluando, sin pruebas activas
- 2=Estamos realizando pruebas o pilotos
- 3=La usamos habitualmente en actividades puntuales
- 5=Su uso está extendido a varias áreas o procesos de experiencia del cliente
- 4=Suspendimos todos los usos que teníamos
- 99=No sabe

Tipo: única. Mostrar: Todos elegibles.

### Q08: ¿En qué tareas de experiencia del cliente usaron IA en los últimos 90 días?

- T1=Analizar opiniones, reclamos o conversaciones de clientes
- T2=Predecir necesidades, abandono o problemas de clientes
- T3=Personalizar recomendaciones y comunicaciones
- T4=Atender clientes por chat o voz
- T5=Asistir al equipo que atiende a clientes
- T6=Resolver reclamos y recuperar experiencias negativas
- T7=Investigar necesidades y mejorar el recorrido del cliente
- T8=Gestionar pedidos, reservas o devoluciones de clientes
- NONE=En ninguna
- DK=No sabe

Tipo: múltiple. Mostrar: Todos elegibles.

### Q09: ¿En cuál de estas actividades usan más IA?

- Opciones T1…T8 seleccionadas en Q08

Tipo: única dinámica. Mostrar: Q08 contiene al menos una T.

### Q10: ¿Cómo accede esta aplicación a la información de la empresa?

- 0=No utiliza información interna
- 1=Se introduce o carga manualmente
- 2=Accede automáticamente a un sistema o fuente interna
- 3=Accede automáticamente a varios sistemas o fuentes internas
- 99=No sabe

Tipo: única. Mostrar: Q08 contiene al menos una T.

### Q11: ¿Qué soluciones usan en esta actividad de experiencia del cliente?

- CHAT=Chatbots con IA para atención por texto
- FLOW=Flujos y automatizaciones potenciados con IA
- AGENT=Agentes de IA que ejecutan tareas o acciones
- VOICE=Agentes de voz con IA
- COPILOT=Copilotos o asistentes para el equipo de atención
- PREDICT=Analítica predictiva o recomendaciones para clientes
- INTERNAL=Desarrollos internos de la empresa
- PROVIDER=Soluciones de proveedores externos
- HITL=Revisión o autorización humana (human in the loop)
- AUTO=Ejecución sin revisión humana previa
- OTHER=Otra solución o modalidad
- DK=No sabe

Tipo: múltiple. Mostrar: Q08 contiene al menos una T.

Agrupar alternativas por tecnología, desarrollo/provisión y participación humana. Son dimensiones combinables, no una escala única. No inferir ausencia a partir de no selección.

### Q12: ¿Cómo ha cambiado la experiencia del cliente con esta aplicación?

- -1=Empeoró
- 0=Se mantuvo
- 1=Mejoró
- 99=No sabe o aún no puede evaluarlo

Tipo: única. Mostrar: Q08 contiene al menos una T.

### Q13: ¿En qué se basa esa evaluación?

- 1=Impresión personal o comentarios informales
- 2=Indicadores internos de operación
- 3=Encuestas o mediciones de clientes
- 4=Evaluación económica documentada
- NONE=No existe información para evaluar
- DK=No sabe

Tipo: múltiple. Mostrar: Q08 contiene al menos una T.

### Q14: ¿Qué dificulta usar IA en la experiencia del cliente?

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

### Q15: ¿Qué planean hacer con la IA en experiencia del cliente?

- 1=Iniciar o retomar pruebas
- 2=Ampliar su uso
- 3=Mantener el uso actual
- 4=Reducirlo o suspenderlo
- 5=No está previsto utilizarla
- 6=Todavía no hay una decisión
- 99=No sabe

Tipo: única. Mostrar: Todos elegibles.

### P01: ¿Qué tan claras te resultaron las preguntas?

- 5=Muy claras
- 4=Claras
- 3=Ni claras ni confusas
- 2=Poco claras
- 1=Nada claras

Tipo: única. Mostrar: Piloto habilitado por endpoint de estado; primeras 50 respuestas admitidas.

Sólo piloto: paso independiente antes de revisión/envío. P01 es requerida; P02 puede dejarse vacía.

### P02: ¿Qué pregunta cambiarías o qué opción te faltó?

- Texto opcional ≤500 caracteres

Tipo: texto opcional. Mostrar: Piloto habilitado por endpoint de estado; primeras 50 respuestas admitidas.

Sólo piloto: paso independiente antes de revisión/envío. P01 es requerida; P02 puede dejarse vacía.

## Reglas

- Q02C se muestra sólo para multinacional; requiere dos países o incertidumbre explícita.
- Q08 determina uso reciente y los saltos Q09–Q13. Q09 se deriva automáticamente con una sola actividad.
- Q11 es una lista de tecnologías/modalidades; no mezclar con la pregunta de supervisión única de v0.2.
- P01 y P02 se habilitan mediante el estado recibido del endpoint. El backend definitivo deberá asignar el cupo de forma atómica; el cliente no es autoridad para contar 50 participantes globales.
- Para la nueva edición sólo se aceptan códigos nacionales del marco hispanoamericano. Los borradores anteriores se conservan como originales; si incluían Brasil/Haití se solicita redefinir alcance y respuestas dependientes.
- Al finalizar el piloto se detiene la recepción. Si no hay cambios sustantivos y se mantienen criterios de captación, las respuestas pueden incorporarse al estudio principal; de lo contrario se conservan como piloto aparte.
- La captación por base propia, LinkedIn, agentes y referidos sigue siendo no probabilística. No anunciar margen de error de muestreo aleatorio ni representatividad nacional automática.
