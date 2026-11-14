# Cuestionario IA y experiencia del cliente, versión 0.6

Diego Orrego y Paula Riquelme · woku.

16 preguntas principales. Q16D es opcional y condicional dentro del paso Q16, no otro paso. Las respuestas anteriores 0.5 no recibieron ese módulo y conservan su versión. Dos pasos adicionales durante el piloto; Q02C sólo para cobertura multinacional.

Fuente: software/survey-contract/src/instrument-source.json. Fecha de versión: 14 de noviembre de 2026. SHA-256: b2bcb73a026a109ed9021df8c16340780ec3329aef5f15922f3aabd7689b553e.

## Q00. Consentimiento informado

Casilla visible: «He leído la información del estudio y acepto participar voluntariamente».

Aplicación: después del correo y antes de las preguntas sustantivas. Q00 es un identificador documental; no se presenta un paso adicional de opciones Sí/No. El envío requiere consentimiento.

## Q01. ¿Cómo se llama tu empresa?

Texto ≤120 caracteres | PREF=Prefiero no indicarlo

Aplicación: Todos elegibles.

## Q02. ¿Sobre qué operación de la empresa responderás?

LATAM=Multinacional en Hispanoamérica | AR=Argentina | BO=Bolivia | CL=Chile | CO=Colombia | CR=Costa Rica | CU=Cuba | EC=Ecuador | SV=El Salvador | GT=Guatemala | HN=Honduras | MX=México | NI=Nicaragua | PA=Panamá | PY=Paraguay | PE=Perú | DO=República Dominicana | UY=Uruguay | VE=Venezuela | OT=Otro país

Aplicación: Todos elegibles.

## Q02C. ¿Qué países abarca tu respuesta?

AR=Argentina | BO=Bolivia | CL=Chile | CO=Colombia | CR=Costa Rica | CU=Cuba | EC=Ecuador | SV=El Salvador | GT=Guatemala | HN=Honduras | MX=México | NI=Nicaragua | PA=Panamá | PY=Paraguay | PE=Perú | DO=República Dominicana | UY=Uruguay | VE=Venezuela | DK=No sé precisar los países

Aplicación: Q02=LATAM.

## Q03. ¿Cuántas personas trabajan en la empresa?

1=1–9 | 2=10–49 | 3=50–249 | 4=250 o más | 0=Ninguna | 99=No sabe

Aplicación: Todos elegibles.

## Q04. ¿A qué sector pertenece la empresa?

1=Comercio | 2=Industria o manufactura | 3=Servicios financieros o seguros | 4=Tecnología, información o telecomunicaciones | 5=Servicios profesionales o administrativos | 6=Transporte o logística | 7=Turismo, alojamiento o alimentación | 8=Salud | 9=Educación | 10=Construcción o actividades inmobiliarias | 11=Agro, minería, energía o servicios básicos | 12=Otra actividad empresarial | 99=No sabe

Aplicación: Todos elegibles.

## Q05. ¿Cuál es tu rol o posición en la empresa?

1=Propietario/a o dirección general | 2=Experiencia, atención o éxito del cliente | 3=Marketing o ventas | 4=Tecnología, datos o transformación digital | 5=Operaciones | 6=Otro rol | 99=Prefiero no indicarlo

Aplicación: Todos elegibles.

## Q06. ¿La empresa está formalmente registrada?

1=Sí | 0=No | 99=No sabe

Aplicación: Todos elegibles.

## Q07. ¿Cómo usa la empresa la IA en la experiencia del cliente?

0=No usamos IA en experiencia del cliente ni lo estamos considerando | 1=Lo estamos evaluando, sin pruebas activas | 2=Estamos realizando pruebas o pilotos | 3=La usamos habitualmente en actividades puntuales | 5=Su uso está extendido a varias áreas o procesos de experiencia del cliente | 4=Suspendimos todos los usos que teníamos | 99=No sabe

Aplicación: Todos elegibles.

## Q08. ¿En qué tareas de experiencia del cliente usaron IA en los últimos 90 días?

T1=Analizar opiniones, reclamos o conversaciones de clientes | T2=Predecir necesidades, abandono o problemas de clientes | T3=Personalizar recomendaciones y comunicaciones | T4=Atender clientes por chat o voz | T5=Asistir al equipo que atiende a clientes | T6=Resolver reclamos y recuperar experiencias negativas | T7=Investigar necesidades y mejorar el recorrido del cliente | T8=Gestionar pedidos, reservas o devoluciones de clientes | NONE=En ninguna | DK=No sabe

Aplicación: Todos elegibles.

## Q09. ¿En cuál de estas actividades usan más IA?

Opciones T1…T8 seleccionadas en Q08

Aplicación: Q08 contiene al menos una T.

## Q10. ¿Cómo accede esta aplicación a la información de la empresa?

0=No utiliza información interna | 1=Se introduce o carga manualmente | 2=Accede automáticamente a un sistema o fuente interna | 3=Accede automáticamente a varios sistemas o fuentes internas | 99=No sabe

Aplicación: Q08 contiene al menos una T.

## Q11. ¿Qué soluciones usan en esta actividad de experiencia del cliente?

CHAT=Chatbots con IA para atención por texto | FLOW=Flujos y automatizaciones potenciados con IA | AGENT=Agentes de IA que ejecutan tareas o acciones | VOICE=Agentes de voz con IA | COPILOT=Copilotos o asistentes para el equipo de atención | PREDICT=Analítica predictiva o recomendaciones para clientes | INTERNAL=Desarrollos internos de la empresa | PROVIDER=Soluciones de proveedores externos | HITL=Revisión o autorización humana (human in the loop) | AUTO=Ejecución sin revisión humana previa | OTHER=Otra solución o modalidad | DK=No sabe

Aplicación: Q08 contiene al menos una T.

## Q12. ¿Cómo ha cambiado la experiencia del cliente con esta aplicación?

-1=Empeoró | 0=Se mantuvo | 1=Mejoró | 99=No sabe o aún no puede evaluarlo

Aplicación: Q08 contiene al menos una T.

## Q13. ¿En qué se basa esa evaluación?

1=Impresión personal o comentarios informales | 2=Indicadores internos de operación | 3=Encuestas o mediciones de clientes | 4=Evaluación económica documentada | NONE=No existe información para evaluar | DK=No sabe

Aplicación: Q08 contiene al menos una T.

## Q14. ¿Qué dificulta usar IA en la experiencia del cliente?

1=Costo o presupuesto | 2=Falta de tiempo | 3=Falta de conocimientos | 4=Datos insuficientes o poco organizados | 5=Dificultad de integración tecnológica | 6=Preocupación por privacidad o seguridad | 7=Dudas sobre calidad o confiabilidad | 8=Beneficios o necesidades poco claros | 9=Resistencia de empleados o clientes | 10=Falta de proveedores o apoyo adecuado | 11=Otro | NONE=Ninguno | DK=No sabe

Aplicación: Todos elegibles.

## Q15. ¿Qué planean hacer con la IA en experiencia del cliente?

1=Iniciar o retomar pruebas | 2=Ampliar su uso | 3=Mantener el uso actual | 4=Reducirlo o suspenderlo | 5=No está previsto utilizarla | 6=Todavía no hay una decisión | 99=No sabe

Aplicación: Todos elegibles.

## Q16. ¿En qué etapa está la empresa con agentes de IA?

1=Ya implementó | 2=Está implementando o probando | 3=Considera o planea implementar | NONE=Sin implementación ni planes | DK=No sabe

Aplicación: Todas las operaciones elegibles, aunque no usen IA actualmente.

Un agente de IA decide qué pasos seguir y usa herramientas para actuar sobre una necesidad del cliente y comprobar el resultado.

Cerrar el ciclo es resolver el caso, comprobarlo y comunicar el resultado, dentro de límites definidos. No basta con responder o cerrar un ticket.

Elige el caso más avanzado, incluso si se suspendió.

Guía según etapa 1: Describe el área o proceso, qué hace el agente y cómo comprueban el cierre. Indica qué resuelve sin aprobación previa del equipo y cuándo interviene una persona. Cuenta los cambios observados, si los hubo, y las dificultades; también si se suspendió.

Guía según etapa 2: Describe el área o proceso y qué están implementando. Indica qué ya funciona, qué acciones resolverá sin aprobación previa del equipo y cuándo se derivará a una persona. Separa avances observados de resultados esperados y comenta las dificultades.

Guía según etapa 3: Describe dónde te gustaría usarlo, qué tareas resolvería y hasta dónde actuaría sin aprobación previa del equipo. Distingue una idea de un plan decidido y comenta los resultados esperados y las dificultades que anticipas.

## Q16D. Describe el caso de agentes de IA

Texto opcional de hasta 1500 caracteres

Aplicación: Q16=1, 2 o 3; mismo paso Q16.

## P01. ¿Qué tan claras te resultaron las preguntas?

5=Muy claras | 4=Claras | 3=Ni claras ni confusas | 2=Poco claras | 1=Nada claras

Aplicación: Piloto habilitado por endpoint de estado; primeras 50 respuestas admitidas.

## P02. ¿Qué pregunta cambiarías o qué opción te faltó?

Texto opcional ≤500 caracteres

Aplicación: Piloto habilitado por endpoint de estado; primeras 50 respuestas admitidas.
