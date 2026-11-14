# Survey front — binding direction
Mode: Operate. Code-led extension of the explicit admin reference, not a new visual world.
Reference: woku-admin/src/components/ui/FirstRunShell, JourneyOnboarding and existing desktop/mobile first-run screenshots.
FIRST VIEWPORT: mint/indigo field, authentic woku logo, one white 48rem card with fixed responsive height; a brief email step and one indigo CTA. A separate viewport-fixed full-bleed progress track at y=0, with step count and remaining steps immediately below. No progress inside or below the card.
Behavior: one question or information step at a time; constant card outer bounds; inner scrolling; previous answers preserved; dynamic eligible steps and count; all email domains accepted; local save precedes simulated confirmation state; no fake email delivery. Review index available as a quiet header control, outside respondent content.
Motion: short restrained transitions respecting reduced motion; never animate outer card dimensions.
Verification: build, schema/branching/persistence tests, Chromium desktop/mobile and full user/non-user paths. No modifications to admin.

## Revisión solicitada
Branding trasladado al borde inferior derecho: Powered by + logo woku pequeño, enlace externo. Encabezado fijo mantiene explícito IA en experiencia del cliente. Listas inline de país/sector visibles y scrolleables. Multinacional en Latinoamérica primero, con cobertura nacional condicional; tamaño sigue el alcance. Transición de contenido 200ms, 7px/opacity, sin alterar caja; reduced motion sin desplazamiento. Modal con TitleRow y popup de tamaño real, backdrop clicable y Escape.
Country/sector controls are inline Base UI lists: title and search stay fixed, only the list scrolls within remaining card space. Regional coverage adds one conditional question. CX scope is persistent in the top strip and explicit throughout question copy. Review modal closes on X, Escape and backdrop. Footer logo/text alignment follows user screenshot feedback.
