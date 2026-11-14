# Encuesta IA y experiencia del cliente · front de revisión

Prototipo local de la encuesta breve v0.6 en Hispanoamérica, con la identidad y componentes del onboarding de woku admin. Usa endpoints simulados con MSW; no requiere backend ni credenciales.

## Ejecutar

Desde la raíz del repositorio (npm workspaces):

```bash
npm ci
npm run dev -w survey-web -- --port 5180 --strictPort
```

Abrir http://127.0.0.1:5180/. Para generar una versión estática: `npm run build`; se produce `dist/`.

## Qué revisar

- Barra fija en el borde superior, ancho completo y sin padding exterior; tema permanente IA en experiencia del cliente, sección, paso y restantes.
- Tarjeta con ancho máximo 48rem y altura estable para el viewport. Preguntas largas se desplazan dentro de la tarjeta; navegación permanece visible.
- Una pregunta por paso, junto con dos pasos informativos (estudio e IA en CX), correo inicial y revisión final. 16 preguntas base y una cobertura condicional para multinacionales.
- Recorrido adaptativo: las preguntas Q09–Q13 se omiten cuando no hay uso reciente; la única aplicación principal se deriva automáticamente.
- «Revisar preguntas» abre un índice para inspeccionar cualquier paso sin rellenar. «Probar recorrido» retorna al flujo con validaciones. Modal con X arriba a la derecha, Escape y cierre al pulsar el fondo.
- Sólo español, sin matrices y sin verificación previa del correo. Se acepta correo personal.
- Multinacional en Hispanoamérica aparece primero; registra los países cubiertos y mantiene el mismo alcance al preguntar tamaño. Los países individuales corresponden a la operación, no a la casa matriz.
- País y sector usan listas visibles con búsqueda. Sólo la lista se desplaza dentro de su espacio disponible.
- Uso habitual puntual y uso extendido de IA en CX son alternativas diferentes. Las tecnologías/modalidades se agrupan en tecnología, origen del desarrollo y participación humana.
- Powered by woku fijo abajo a la derecha, pequeño, con enlace a https://woku.app en otra pestaña.
- Transición de contenido de 200ms y 7px; sin movimiento si se pide reduced motion.
- Respuestas y borrador se guardan sólo en el almacenamiento local del navegador. Se validan con Zod y puede descargarse el payload JSON. El prototipo consulta una API interceptada y simulada con MSW. No envía correos reales ni verifica identidades.
- La pantalla final dice explícitamente que es una prueba local. Si el almacenamiento falla, muestra un error y conserva las respuestas en memoria; no afirma que se guardaron.

## Contenido y código

- `../survey-contract/src/instrument-source.json`: copia del instrumento v0.6 en español. Aquí se revisan preguntas y alternativas manteniendo sus códigos.
- `src/data/ui.ts`: títulos informativos, ayudas, errores y navegación en español.
- `src/lib/survey.ts`: reexporta el contrato compartido de `../survey-contract`. Allí se mantienen Zod, exclusividad, límites y saltos.
- `src/store/surveyStore.ts`: Zustand, borradores, consulta de estado/correo y guardado local antes del envío simulado.
- `src/api/`: cliente fetch y contratos Zod.
- `src/mocks/`: MSW, contador de piloto y escenarios.
- `scripts/generate-og.mjs`: generador reproducible de imagen JPG.
- [Contrato de mock API](MOCK_API.md) y [metadata y enlaces sociales](SOCIAL_METADATA.md).
- `src/App.tsx`: recorrido y estructura de pantalla.
- `src/styles/index.css`: layout responsive y tokens visuales.

## Componentes reutilizados de admin

Fuente: `woku-admin/src/components/ui/`.

Se copiaron Button, TextField, Checkbox, Radio, Select, SearchableSelect, Dialog y Progress, más `cn` de `src/lib/utils.ts`. Se reutilizaron **PixelGradientField y su CSS sin redibujar la animación**, y WokuLogo. El layout adapta FirstRunShell: mueve el progreso al viewport y conserva dimensiones estables de la tarjeta.

Adaptaciones locales: Progress pasa `max` a Base UI; Checkbox y Radio enlazan explícitamente sus etiquetas. El modal coloca Popup sólo sobre el panel real para habilitar cierre por backdrop y usa TitleRow. SearchableChoiceList extiende el patrón de admin con Autocomplete inline para un listado siempre visible. El proyecto admin permanece sin cambios.

Tecnologías: React 19.2.3, TypeScript 5.9, Vite 7.3, Tailwind 4.1, Base UI 1.1, Zustand 5, Zod 4.3, Framer Motion y Lucide. Montserrat se sirve localmente mediante Fontsource. npm y package-lock.json para reproducibilidad.

## Comprobaciones

```bash
npm test
npm run build
npm run test:e2e
```

Pruebas de contratos y navegador: emails personales, campos/valores inválidos, opciones exclusivas, límite de barreras, saltos, limpieza de respuestas obsoletas, conservación, almacenamiento bloqueado, ancho de barra, estabilidad de tarjeta, móvil e inspección de preguntas.

## Límite de esta versión

Validar en el front mejora la experiencia; un backend futuro deberá volver a validar el contrato, guardar de forma durable y enviar la verificación **después** del guardado. `emailVerified` se mantiene `false`; no existe un botón que falsifique una verificación real. Cualquier integración de envíos, contactos o identidad queda fuera de este prototipo. El consentimiento y los datos institucionales deben revisarse antes de abrir una encuesta pública.

## Migración de borradores

Los borradores v0.2 se conservan en su clave original. Se migran a v0.6 manteniendo respuestas compatibles; Q11 anterior se limpia porque dejó de medir sólo supervisión y ahora pregunta tecnologías/modalidades. Cambiar el alcance geográfico limpia campos posteriores que ya no serían comparables.

## Piloto y distribución

El piloto añade dos pasos a las primeras 50 respuestas admitidas y después pausa la recepción. La pantalla de disponibilidad consulta el endpoint antes de abrir y vuelve a comprobar al enviar. El panel «Simular el backend» permite probar pausas, límite, errores y correos ya respondidos.

La finalización ofrece LinkedIn, WhatsApp y copiar enlace con los logos suministrados. La URL pública se configura con `VITE_SURVEY_PUBLIC_URL`; el preview local todavía no produce una tarjeta descargable por las redes externas. Favicon original de woku e imagen OG JPG 1200×630 incluidos.

Brasil y Haití se retiraron de nuevas respuestas. Sólo se ofrece español. Al recuperar borradores antiguos se conserva el original y se pide revisar el alcance si incluía estos países; no se reasignan a otro grupo silenciosamente.

## Agentes, manuscrito y telemetría

Q16 reúne la etapa del caso y Q16D opcional en un solo paso; las tres etapas muestran guías distintas y ninguna/no sabe ocultan el texto. Los borradores 0.5 se conservan y migran sin inventar Q16. El enlace superior abre `/?documento=manuscrito`, con PDF inline y descarga aparte. Clarity `zdmf64alc5` sólo se instala en builds productivos con API real, una vez y después de limpiar la URL; no se carga en el modo mock. El body está enmascarado y no se invocan identify ni señales de consentimiento fabricadas.
