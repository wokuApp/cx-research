---
name: "woku survey-web"
description: "Implemented v0.6 Spanish-only survey in the woku admin onboarding identity."
colors:
  primary: "#432dd7"
  primary-hover: "#372aac"
  progress: "#4f46e5"
  focus: "oklch(58.5% 0.233 277.117)"
  logo: "#5149E7"
  mint-field: "oklch(95% 0.052 163.051)"
  indigo-field: "#e0e7ff"
  indigo-field-deep: "oklch(87% 0.065 274.039)"
  selected: "#eef2ff"
  surface: "#ffffff"
  surface-muted: "#fafafa"
  ink: "#171717"
  text: "#525252"
  text-muted: "#737373"
  border: "#e5e5e5"
  control-border: "#d4d4d4"
  error: "#c10007"
typography:
  headline:
    fontFamily: "'Montserrat Variable', 'Montserrat', sans-serif"
    fontSize: "1.75rem"
    fontWeight: 700
    lineHeight: 1.35
    letterSpacing: "-0.025em"
  headline-mobile:
    fontFamily: "'Montserrat Variable', 'Montserrat', sans-serif"
    fontSize: "1.375rem"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "-0.025em"
  body:
    fontFamily: "'Montserrat Variable', 'Montserrat', sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.75
  label:
    fontFamily: "'Montserrat Variable', 'Montserrat', sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: "1.25rem"
  caption:
    fontFamily: "'Montserrat Variable', 'Montserrat', sans-serif"
    fontSize: "11px"
    fontWeight: 400
    lineHeight: "16px"
rounded:
  control: "0.5rem"
  card: "1rem"
  checkbox: "0.25rem"
  attribution: "6px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  section: "24px"
  content-desktop: "48px"
  content-mobile: "22px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "#404040"
    rounded: "{rounded.control}"
    padding: "8px 16px"
  button-tertiary:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    rounded: "{rounded.control}"
    padding: "8px 16px"
  text-field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "48px"
  choice-row:
    rounded: "{rounded.control}"
    padding: "12px"
  choice-row-selected:
    backgroundColor: "{colors.selected}"
  survey-card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.card}"
    width: "100%"
  powered-by:
    backgroundColor: "rgb(255 255 255 / .88)"
    textColor: "{colors.text}"
    rounded: "{rounded.attribution}"
    padding: "6px 8px"
  viewport-progress:
    backgroundColor: "{colors.indigo-field}"
    height: "6px"
    width: "100%"
---

# Design System: woku survey-web

## Overview

**Creative North Star: "woku onboarding continuity"**

This document describes **only `survey-web/`**, the v0.6 Spanish-only survey for Hispanoamérica: 18 countries, excluding Brazil and Haiti. There is no language selector. The visual authority is the existing woku admin onboarding, especially FirstRunShell and JourneyOnboarding. Keep its mint/indigo field, authentic lowercase logo, Montserrat, white surface and quiet Base UI controls.

The implementation favors one readable task at a time. The persistent CX topic and progress, utility header, stable card and two bottom-corner footer elements each have a distinct place. SurveyAccess gates the questionnaire on availability from browser-intercepted mock endpoints; loading, paused and error states reuse the card. This is a record of the built surface, not a new identity for the research repository or admin.

**Key Characteristics:**

- The exact inherited pixel-light animation surrounds a calm white card.
- A separate edge-to-edge progress strip and persistent CX topic stay at the top of the viewport.
- Content scrolls within a stable card; list steps reserve their own scroll region and navigation stays in the footer.
- Shared admin controls preserve familiar focus, selection and disabled states.

## Colors

Indigo carries actions and progress; mint and pale indigo create the background atmosphere. The frontmatter records the implemented values from `survey-web/src/styles/index.css`, the logo and Tailwind's theme.

- **Primary:** primary indigo fills the forward action and selected controls. Its deeper hover color also marks step numbers. Progress uses its own slightly lighter indigo; focus rings use the inherited focus color.
- **Secondary:** the page gradient runs bottom-right from mint-field through indigo-field to indigo-field-deep. The logo preserves its original fill.
- **Neutral:** white carries the card and inputs; ink carries headings, text carries paragraphs, text-muted carries guidance. Border distinguishes fields; control-border outlines unselected checks and radios.
- **State:** selected tints answer rows. Error red is reserved for validation; the inherited input error border uses Tailwind red-600. Existing amber text marks a routing inconsistency or screened-out explanation.

## Typography

Montserrat Variable is bundled locally through Fontsource; the fallback is Montserrat, then sans-serif. No remote font request is needed.

Use the headline role for the single step heading and headline-mobile below 640px. Both are bold, tightly tracked and text-balanced. Body introduction paragraphs use the body role; secondary prose is generally 14px with 24px leading. Labels and buttons use the label role. Answer labels are 14px, regular, with 1.5 line-height. Progress details are 14px on desktop and 12px on phones; the persistent CX topic is 12px semibold. The preview note uses the caption role. TextField and inline country/sector search inputs remain 16px at every width. Powered by is 10px with 14px leading and a 6px top offset beside the 14px-high logo.

## Layout

Source: `survey-web/src/App.tsx` and `survey-web/src/styles/index.css`. Pixel measurements assume the browser's normal 16px root.

| Element | At least 640px wide | Below 640px |
| --- | --- | --- |
| Page | Minimum 100dvh; minimum width 320px; 66px top offset | Same |
| Progress | Fixed at top: 0, left: 0, right: 0; 6px track, 24px CX topic and 36px details | Same |
| Progress details | 24px horizontal inset | 16px inset |
| Utility header | 108px high in preview; 64rem maximum width; 32px horizontal inset; controls right-aligned | 92px high in preview; 16px inset |
| Branding | No header logo; small Powered by woku link fixed bottom-right | Same, respecting bottom/right safe-area insets |
| Card | 100% width up to 48rem; height `clamp(24rem, calc(100dvh - 13.5rem), 42rem)` | Height `max(22rem, calc(100dvh - 12.5rem))`; 16px outer gutters |
| Scroll region | Padding 40px 48px 8px | Padding 28px 22px 4px |
| Footer | Padding 8px 48px 28px | Padding 8px 22px 20px |
| Preview note | Fixed 16px from left and 12px from bottom; maximum width calc(100vw - 174px) | Same |

Below 360px, progress text is 11px with 12px side insets; card content and footer side insets become 18px. Footer buttons use 12px text and 10px horizontal padding. At 768px, the decorative field's dot pitch changes from 3px to 4px; this is separate from the layout breakpoint.

**The Stable Card Rule.** Preserve the outer card dimensions between steps for a given viewport. Its flexing content region has `min-height: 0`, contained overscroll and a stable scrollbar gutter. Ordinary steps scroll this region vertically. Country, sector and regional-coverage steps hide outer overflow and use a flex column; title, help and search stay fixed while only the remaining-height list scrolls. The footer does not shrink. Very short viewports may scroll the page because the card retains its minimum height. Step changes reset internal scroll and focus the heading after initial load.

**The Viewport Progress Rule.** Keep the bar outside the card, full width, with no outer padding, margin, border or rounding. The details row may have horizontal padding; the track may not.

## Elevation & Depth

The card floats above the animated field with one diffuse shadow: `0 20px 60px -20px rgba(35,28,94,.25)`. Inputs and choice rows remain flat. Inline country/sector lists are flat. Dialogs use the inherited large shadow and a 40%-opaque ink backdrop. Popups/dialogs sit at z-index 50, above progress at 30, the attribution link at 20 and foreground content at 10. Exact shadow values live in the sidecar.

## Shapes

The main card has the card radius; controls, option rows and dialog panels use the control radius. Checkbox boxes are 20px squares with the checkbox radius; radios are 20px circles with a 10px selected center. Field and popup strokes are 1px. Lucide icons are typically 16px; the success email icon is 20px. The full-width progress track is deliberately square-edged.

## Components

**Provenance.** The source is `woku-admin/src/`. Button, TextField, Checkbox, Radio, Select, SearchableSelect, Dialog and Progress were copied from its shared UI library, plus the `cn` utility. Local Progress forwards `max` to Base UI; Checkbox and Radio explicitly link their label text with `aria-labelledby`. PixelGradientField's TSX/CSS and WokuLogo are byte-identical copies, confirmed by SHA-256 comparison during documentation. The shell adapts FirstRunShell; it does not replace the inherited animation. v0.3 adds SearchableChoiceList using Base UI Autocomplete inline and adjusts Dialog.Popup to the actual panel bounds. Admin is outside this document's edit scope.

- **Buttons:** primary for forward/save/download; tertiary for back/change/review/share; secondary for dialog cancel. Default padding is in the tokens, with a transparent 1px border reserved across variants. Footer actions have a minimum 44px height. Hover/active darken primary or tint tertiary; keyboard focus has a 2px indigo ring and 2px offset. The copied library also exposes danger, loading, icon-only and compact variants.
- **Fields and selection:** TextField is a 48px bordered shell, shifting to indigo on focus and red on error. Country and industry use SearchableChoiceList with inline Base UI Autocomplete and local filtering. The always-visible bordered list fills remaining space; its 44px-minimum options show a check and pale-indigo fill when selected. Search stays above the sole list scrollbar. Answer rows have a 48px minimum height, 12px gap, neutral hover and pale-indigo selection; phone horizontal padding is 8px. Focus-within outlines the entire answer row by 2px.
- **Progress and navigation:** Base UI Progress uses the current eligible step index plus one and the eligible step count, including information/review steps. The denominator changes with routing, including conditional multinational coverage Q02C and the two pilot steps P01/P02; before the usage branch is known, remaining steps carry an “up to” qualifier. Saved state fills the bar. The CX topic stays centered above section, current step and remaining count; updates are announced politely. Multinacional is the first country-scope option, followed by a country-coverage step when selected; headcount guidance follows that scope. Technology choices are grouped under four short headings for scanning.
- **Availability and pilot:** SurveyAccess checks status before showing the questionnaire, on focus and every 15 seconds. Loading, paused and unavailable-with-retry states retain the existing card identity. The first 50 admitted pilot responses include required P01 and optional-comment P02 as separate steps; response 50 receives success and later admissions pause. Main-study mode omits both.
- **Dialogs and review:** Simular el backend opens a header modal for synthetic phase, pause, counter, failure and email-status cases. These are demonstration controls, not real study statistics. The quiet header index opens a Base UI dialog, showing every reviewable step; its label hides below 640px. Index width caps at 36rem and its body at 65dvh. Reset caps at 28rem. The centered Dialog.Popup covers only the panel: width/max-height leave 16px viewport gutters on phones and 32px from 640px. TitleRow keeps the close control at top-right. The close button, Escape and backdrop click dismiss it; bodies scroll while header/footer remain available. Review mode is visibly labeled and can return to the validated respondent flow.
- **Motion:** inherited field glows drift with alternating ease-in-out cycles of 19s, 24s, 27s and 22s, with negative delays of −5s, −13s, −9s and −17s. A radial dot mask and 12px blur create the texture. Glows pause when the document is hidden. Control transitions are 150ms; progress width is 300ms. Step content enters over 200ms from opacity 0.8 and y=7px to opacity 1 and y=0 using cubic-bezier(0.22, 1, 0.36, 1). Reduced motion uses `initial={false}` and zero duration, and disables CSS animation/transitions. Never animate card dimensions.
- **Footer branding:** Powered by woku links to https://woku.app in a new tab with noopener/noreferrer. It sits bottom-right with safe-area-aware offsets of at least 12px right and 8px bottom, a 32px minimum height and translucent white background. The text has a 6px top offset to align with the original small logo; hover turns the surface white and focus adds a 2px indigo outline.
- **Preview boundary:** the short preview/storage warning remains fixed bottom-left, separate from attribution. Fetch requests are intercepted by Mock Service Worker; there is no deployed backend or real email delivery. Responses are archived locally before attempting mock admission, and failures/pauses preserve them. Success reflects accepted mock admission, with email unverified. Existing-email and resend states must keep their visible simulation explanation. See `survey-web/MOCK_API.md`.
- **Sharing and metadata:** success offers LinkedIn, WhatsApp and copy-link actions. Preserve the supplied SVGs without recoloring; share actions open an editor/chat for the person to confirm, while copy-link contains only the configured public URL. No PNG asset is used. The programmatic Open Graph JPEG at `survey-web/public/og/ia-experiencia-cliente.jpg` is 1200×630, uses the existing field/Montserrat identity and a tiny woku logo bottom-right. The original admin favicon is copied. Metadata is injected into initial HTML; a public URL is required for external previews. See `survey-web/SOCIAL_METADATA.md`.

## Do's and Don'ts

### Do

- Do reuse the copied Base UI controls and authentic lowercase woku logo.
- Do preserve the exact PixelGradientField source, mask, timing and reduced-motion behavior.
- Do keep content and validation within the stable card, with navigation in its footer and only one scrollbar on list steps.
- Do preserve explicit labels, heading focus, visible selection/focus and the local-preview disclosure.
- Do keep visible copy in Spanish, use Hispanoamérica consistently and avoid em dashes.

### Don't

- Don't move progress into or below the card, or inset its track.
- Don't resize or animate the card between questions.
- Don't introduce a new visual identity or edit the admin reference as part of this survey.
- Don't imply a real submission, email or verification in this local preview.


## Conexión al backend y verificación, 14 de noviembre de 2026

Se conserva el mundo visual v0.5. La ruta `/verify` reutiliza PixelGradientField, la franja superior de ámbito, la tarjeta de dimensiones estables y Powered by woku. Tiene confirmación explícita, estados de envío/éxito/enlace inválido y recuperación por correo. No depende de que el piloto esté abierto. En modo real se ocultan revisión/simulación y se distingue guardado en servidor de correo encolado. La demo conserva su copy y almacenamiento; no se migran sus borradores al estudio real. Fuente del instrumento compartida en `survey-contract/src/instrument-source.json`.

## Difusión y recuperación de verificación

Se reutiliza ShareActions al terminar, al volver con un correo ya respondido y tras la verificación correcta. Por instrucción del usuario, Compartir en LinkedIn abre directamente el editor en otra pestaña, en un clic, con el mensaje y la URL mediante `shareActive=true&text=...`. Se eliminaron el modal, el editor local y copiar mensaje. Se conserva Copiar enlace para la URL y el acceso directo a WhatsApp. El enlace compartido siempre es la raíz pública de la encuesta. El reenvío tiene estado de solicitud y mensaje que indica la invalidación de enlaces anteriores y la revisión de spam o correo no deseado.

## Agents and manuscript additions, v0.6

The manuscript link sits fixed at y=72px, six pixels below the 66px progress area, right-aligned and above the card. It opens the fixed internal PDF viewer in a new tab. Q16 uses the inherited Base UI Select for five stage options, then an optional 1,500-character textarea for three of them. Definitions and stage prompts come from the shared instrument JSON. The outer card remains stable and only its content scrolls. Changing stage clears the previous narrative to prevent hidden or misclassified text. The viewer has a wrapping action header, full-height iframe and separate download link.
