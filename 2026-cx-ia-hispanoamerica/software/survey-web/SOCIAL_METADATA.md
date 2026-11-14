# Compartir el estudio

El front usa los SVG entregados por el usuario en `survey-web/public/social/linkedin.svg` y `survey-web/public/social/whatsapp.svg`, sin recolorarlos. El favicon es una copia binaria del admin de woku.

- Compartir en LinkedIn abre directamente el editor en otra pestaña mediante `feed/?shareActive=true&text=...`, con la invitación y el enlace de la encuesta. No hay modal, editor local ni paso de copiar/pegar. La persona revisa o edita en LinkedIn y decide publicar.
- WhatsApp abre el selector/chat con texto en español y el enlace; la persona decide enviarlo.
- Copiar enlace copia sólo la URL pública configurada, sin correo ni respuestas.

## Invitación para LinkedIn

La investigación avanza cuando compartimos nuestra experiencia.

Apoya este estudio sobre IA en la experiencia del cliente en Hispanoamérica.

Tu aporte cuenta, aunque tu empresa aún no use IA.

Participa y comparte. Sumemos conocimiento para tomar mejores decisiones en la región.

Se añade `https://research.woku.app/` al final. Tono profesional, sin emojis, sin resultados o beneficios inventados y sin presumir que la empresa usa IA. Redactado aplicando la skill `social`, con el ritmo de frases cortas pedido por el usuario.

El flujo es **un clic en Compartir en LinkedIn → editor de LinkedIn con texto y enlace**. El parámetro `text` contiene la invitación completa, codificada con `encodeURIComponent`. La navegación usa un enlace nativo y no depende del portapapeles ni de una operación asíncrona. El nombre, correo y respuestas del participante no se incorporan al mensaje. Copiar enlace sigue copiando únicamente la URL de la encuesta.

Los mismos botones están disponibles al terminar la encuesta, al regresar con un correo ya respondido y tras verificar correctamente el correo. La URL compartida apunta al cuestionario, nunca a la ruta de verificación ni a su token.

La [documentación del Share Plugin de LinkedIn](https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/plugins/share-plugin) documenta la opción basada en URL. Eso no excluye otras rutas del editor. Se comprobó que el [JavaScript servido por Microsoft Learn](https://learn.microsoft.com/static/assets/0.4.03599.8368-c2fd945c/scripts/en-us/index-docs.js) configura LinkedIn como `https://www.linkedin.com/feed/?shareActive=true&text={body}`; se adoptó ese patrón para la precarga. No se integra una API de publicación ni se solicita OAuth. Las pruebas propias validan la URL, el texto enviado y la apertura en un clic; no una sesión autenticada de LinkedIn ni todas las versiones de su app móvil.

## Metadata

`vite.config.ts` inyecta título, descripción, canonical, Open Graph y Twitter Card en el **HTML inicial**, antes de ejecutar React. Imagen: `/og/ia-experiencia-cliente.jpg`, MIME `image/jpeg`, dimensiones 1200×630, con alt en español.

La imagen se genera con HTML/CSS y Playwright, usando Montserrat local, el CSS original de PixelGradientField y el vector original de woku pequeño abajo a la derecha. No se utilizó generación de imágenes con IA.

```bash
npm run generate:og
npm run build
```

Definir **`VITE_SURVEY_PUBLIC_URL` con la URL pública definitiva antes del build y de compartir**. Esta variable se usa tanto para canonical/og:url/og:image como para los botones. Mientras no exista esa URL, la demo usa http://127.0.0.1:5180/ y noindex; LinkedIn y WhatsApp no pueden descargar imágenes alojadas sólo en tu localhost. No se ha publicado un dominio ni probado una publicación real en redes.

Título: «IA y experiencia del cliente en Hispanoamérica | woku».

Descripción: «Participa en el estudio sobre IA en la experiencia del cliente en Hispanoamérica. Tu empresa puede aportar, utilice o no inteligencia artificial».

## Alcance geográfico

Se utiliza Hispanoamérica para los países americanos de habla española, siguiendo la distinción de [FundéuRAE](https://www.fundeu.es/recomendacion/hispanoamerica-iberoamerica-latinoamerica/). El marco de este estudio mantiene los países soberanos del listado anterior y retira Brasil y Haití: 18 países, sin ampliar automáticamente a territorios. Los grupos propios son Argentina, Perú, Colombia, Chile y México, más Resto de Hispanoamérica y Multinacional en Hispanoamérica. El código interno LATAM de la opción multinacional se conserva por compatibilidad, pero su etiqueta y su alcance vigente son hispanoamericanos.
