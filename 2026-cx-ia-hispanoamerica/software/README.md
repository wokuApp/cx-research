# Software de la encuesta

[Estudio y manuscrito](../README.md). Monorepo Node 24 y npm con un único lockfile.

| Paquete | Responsabilidad |
| --- | --- |
| `survey-web` | React, Base UI, Tailwind, formulario y visor PDF |
| `survey-contract` | Instrumento 0.6, códigos y validación Zod |
| `survey-api` | Lambda, PostgreSQL, SES, migraciones, pruebas y CDK |

```bash
npm ci
npm test
npm run build
npm run dev -w survey-web -- --port 5180 --strictPort
```

La vista local usa MSW y no envía datos a AWS. Para pruebas PostgreSQL aisladas en Docker: `npm run test:integration`. Los escenarios de navegador requieren `npx playwright install chromium`; ejecutar `npm run test:e2e -w survey-web` o `npm run test:e2e:live -w survey-web` según su configuración.

[Arquitectura](survey-api/ARCHITECTURE.md), [seguridad y límites](survey-api/SECURITY.md), [operación](survey-api/README.md) y [estado fechado](survey-api/PRODUCTION.md). Ningún script de pruebas estándar despliega ni envía correos. `smoke-production.mjs` es un ensayo operativo separado y requiere autorización y su variable de habilitación.

Clarity carga sólo en producción real; el cuerpo se enmascara y la URL se limpia antes de instalarlo. Los archivos `.env` reales y el contexto AWS local no se versionan. No se incluyen datos de participantes. Los fixtures son sintéticos y deben ejecutarse en entornos de prueba.

El código de la infraestructura permite recrear recursos del estudio en una cuenta autorizada; no incluye credenciales ni inventarios de sistemas productivos. Antes de desplegar, configurar la cuenta esperada, revisar los nombres de stacks y dominio y leer las guardas operativas.
