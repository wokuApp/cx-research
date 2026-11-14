> **Versión anterior.** Usar el [cuestionario v0.5 en español para Hispanoamérica](cuestionario-ia-cx-v05-es.md), con dos pasos de piloto y pausa al llegar a 50.

# Encuesta breve v0.3: IA en la experiencia del cliente

**Versión vigente del front.** Mantiene 15 preguntas principales y añade una pregunta condicional de cobertura sólo para «Multinacional en Latinoamérica». La versión regional tiene hasta 16 preguntas de contenido. Correo, consentimiento e información del estudio son pasos separados. No hay matrices.

Ámbito permanente: **IA para gestionar la experiencia del cliente**, antes, durante y después de la compra. Incluye comprender necesidades, personalizar, atender y recuperar experiencias negativas, también mediante herramientas que apoyan al equipo. Excluye usos generales de IA sin vínculo con CX. Ese ámbito permanece visible en la barra superior del front.

El inicio acepta cualquier correo; se recomienda el empresarial. La encuesta se guarda antes de enviar una futura verificación. No verificar no elimina la respuesta. El correo sólo se usa para verificación y resultados finales, sin marketing. Este front aún guarda exclusivamente en el navegador y no envía correos.

[Especificación ES/PT para programación](instrumento-encuesta-ia-cx-v03-es-pt.csv) · [Protocolo](../metodologia/protocolo-inicial.md).

## Grupos y alcance

Argentina, Perú, Colombia, Chile, Brasil, México, Resto de América Latina y **Multinacional en Latinoamérica**. Multinacional es la primera opción, y se elige cuando la respuesta abarca varias operaciones nacionales en conjunto. Una multinacional también puede responder por un solo país si ése es su alcance: entonces corresponde al grupo nacional.

No confundir país de la casa matriz, países donde opera la empresa y países sobre los que responde el informante. Q02C recoge sólo el alcance de la respuesta regional. Q03 se refiere al personal de ese mismo alcance. No replicar una respuesta regional en cada país ni mezclar unidades nacionales y regionales para construir una tasa poblacional única.

## Preguntas

### Q01 · ¿Cómo se llama tu empresa?

- Texto ≤120 caracteres
- PREF=Prefiero no indicarlo

Mostrar: Todos elegibles. Regla: Se usa para detectar posibles duplicados, no se publica en resultados. Guardar nombre separado de respuestas analíticas. Si no se informa, conservar la respuesta y marcar la identificación empresarial como incompleta; no inventar una empresa ni exigir correo corporativo.

### Q02 · ¿Sobre qué operación de la empresa responderás?

- LATAM=Multinacional en Latinoamérica
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

Ayuda: «Elige la operación sobre la que responderás, no la casa matriz. Usa Multinacional si abarca varios países».

Mostrar: Todos elegibles. Regla: LATAM es el grupo regional y aparece primero. Activar Q02C sólo para LATAM. Un país representa su operación nacional, no la casa matriz. Cambiar alcance limpia respuestas posteriores para no mezclar denominadores.

### Q02C · ¿Qué países abarca tu respuesta?

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
- DK=No sé precisar los países

Mostrar: Q02=LATAM. Regla: Seleccionar dos o más países, o DK solo. Es el alcance de esta respuesta, no todas las operaciones mundiales ni el país de casa matriz. No distribuir esta respuesta entre tasas nacionales.

### Q03 · ¿Cuántas personas trabajan en la empresa?

- 1=1–9
- 2=10–49
- 3=50–249
- 4=250 o más
- 0=Ninguna
- 99=No sabe

Ayuda contextual: «Considera sólo la operación del país elegido» o «Considera el total de personas de las operaciones que abarca tu respuesta».

Mostrar: Todos elegibles. Regla: Bandas según la operación seleccionada: país o conjunto regional declarado. El encabezado se mantiene breve; la ayuda aclara el alcance. No recoger además ventas o empleo exacto.

### Q04 · ¿A qué sector pertenece la empresa?

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

Mostrar: Todos elegibles. Regla: Clasificación resumida propia; no anunciar equivalencia exacta a ISIC sin recodificación. Para 12, texto opcional máximo 80 caracteres.

### Q05 · ¿Cuál es tu rol o posición en la empresa?

- 1=Propietario/a o dirección general
- 2=Experiencia, atención o éxito del cliente
- 3=Marketing o ventas
- 4=Tecnología, datos o transformación digital
- 5=Operaciones
- 6=Otro rol
- 99=Prefiero no indicarlo

Mostrar: Todos elegibles. Regla: Función autodeclarada. La opción 99 permite no indicarla. No equivale a acreditar representación ni conocimiento empresarial; se retiró la antigua salida por desconocimiento de esta pregunta.

### Q06 · ¿La empresa está formalmente registrada?

- 1=Sí
- 0=No
- 99=No sabe

Mostrar: Todos elegibles. Regla: 1: elegible por formalidad; 0: fuera del universo formal; 99: elegibilidad indeterminada. Conservar registros enviados con su marca, sin tratarlos como no adoptantes.

### Q07 · ¿Cómo usa la empresa la IA en la experiencia del cliente?

- 0=No usamos IA en experiencia del cliente ni lo estamos considerando
- 1=Lo estamos evaluando, sin pruebas activas
- 2=Estamos realizando pruebas o pilotos
- 3=La usamos habitualmente en actividades puntuales
- 5=Su uso está extendido a varias áreas o procesos de experiencia del cliente
- 4=Suspendimos todos los usos que teníamos
- 99=No sabe

Mostrar: Todos elegibles. Regla: Estado global actual en experiencia del cliente. 3=habitual puntual; 5=extendido en varias áreas/procesos; 2=sólo pruebas. No es una escala numérica validada de madurez.

### Q08 · ¿En qué tareas de experiencia del cliente usaron IA en los últimos 90 días?

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

Mostrar: Todos elegibles. Regla: NONE y DK exclusivos. Responder aunque Q07 indique suspensión: pudo haber uso reciente. Con alguna T, mostrar Q09–Q13; con NONE o DK, ir a Q14. Si Q07=3 y Q08=NONE, permitir revisar sin forzar cambio.

### Q09 · ¿En cuál de estas actividades usan más IA?

- Opciones T1…T8 seleccionadas en Q08

Mostrar: Q08 contiene al menos una T. Regla: Con una sola actividad, asignar automáticamente sin mostrar. Q10–Q13 se refieren sólo a esta actividad principal; no a todas las aplicaciones.

### Q10 · ¿Cómo accede esta aplicación a la información de la empresa?

- 0=No utiliza información interna
- 1=Se introduce o carga manualmente
- 2=Accede automáticamente a un sistema o fuente interna
- 3=Accede automáticamente a varios sistemas o fuentes internas
- 99=No sabe

Mostrar: Q08 contiene al menos una T. Regla: Si combina manual y automático, escoger el mayor nivel de conexión automática. No asumir que más conexión es mejor calidad.

### Q11 · ¿Qué soluciones usan en esta actividad de experiencia del cliente?

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

En pantalla las alternativas se agrupan bajo **Tecnologías**, **Desarrollo y provisión**, **Participación humana** y **Otras opciones**. Selección múltiple; «No sabe» es exclusiva. Los grupos son dimensiones distintas y pueden coexistir; no son niveles de una misma escala. No interpretar no seleccionado como ausencia comprobada.

Mostrar: Q08 contiene al menos una T. Regla: Respuesta múltiple agrupada por tecnología, origen y participación humana. Los grupos no son escalas equivalentes ni excluyentes: pueden coexistir. DK es exclusivo. No inferir ausencia a partir de no selección; no deducir proveedor a partir del tipo de tecnología.

### Q12 · ¿Cómo ha cambiado la experiencia del cliente con esta aplicación?

- -1=Empeoró
- 0=Se mantuvo
- 1=Mejoró
- 99=No sabe o aún no puede evaluarlo

Mostrar: Q08 contiene al menos una T. Regla: Percepción global de un informante sobre una aplicación. No mide por separado tiempos, satisfacción o costos, ni prueba impacto causal. No tratar como una escala validada de CX.

### Q13 · ¿En qué se basa esa evaluación?

- 1=Impresión personal o comentarios informales
- 2=Indicadores internos de operación
- 3=Encuestas o mediciones de clientes
- 4=Evaluación económica documentada
- NONE=No existe información para evaluar
- DK=No sabe

Mostrar: Q08 contiene al menos una T. Regla: NONE y DK exclusivos. Base declarada de la percepción de Q12; no verifica indicadores ni pide documentos.

### Q14 · ¿Qué dificulta usar IA en la experiencia del cliente?

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

Mostrar: Todos elegibles. Regla: NONE y DK exclusivos; orden aleatorio de 1–10 si la plataforma lo permite; no interpretar no seleccionado como ausencia total de barrera.

### Q15 · ¿Qué planean hacer con la IA en experiencia del cliente?

- 1=Iniciar o retomar pruebas
- 2=Ampliar su uso
- 3=Mantener el uso actual
- 4=Reducirlo o suspenderlo
- 5=No está previsto utilizarla
- 6=Todavía no hay una decisión
- 99=No sabe

Mostrar: Todos elegibles. Regla: Intención separada de adopción. No exigir que planes coincidan con estado actual; revisar inconsistencias descriptivamente.

### P01 · ¿Hubo alguna pregunta u opción que no entendiste o que te faltó? Cuéntanos cuál.

- Texto ≤300 caracteres

Mostrar: Sólo versión piloto. Regla: Sólo piloto, opcional. Medir tiempo y abandono automáticamente; no añadir una segunda pregunta de claridad.

## Cambio de versión y análisis

- La nueva alternativa 5 de Q07 distingue uso extendido de uso habitual puntual, sin afirmar que sea mejor ni exhaustivo.
- Q11 cambió de una respuesta única de supervisión a una lista de tecnologías y modalidades. Las respuestas antiguas de Q11 no se recodifican como tecnologías: deben preguntarse de nuevo. En el front se preservan los borradores anteriores y sólo se limpia ese campo, junto con un código de rol retirado si existía.
- Q02C exige dos o más países, o la alternativa de no poder precisarlos. Conservar esa incertidumbre; no inventar cobertura nacional.
- Cambiar Q02 o Q02C requiere responder otra vez los campos dependientes del alcance. No mezclar tamaño nacional con aplicaciones regionales.
- Q08 conserva el período de 90 días. Q09 se deriva si existe una única actividad. Q10–Q13 se omiten para quienes no reportan uso reciente.
- Se conservan n, calidad, elegibilidad y correo verificado como dimensiones distintas. La captación sigue siendo no probabilística.
- El piloto sigue siendo de 50 respuestas. La duración objetivo de 5–7 minutos se debe comprobar con la nueva versión; la ruta regional incluye un paso adicional.
