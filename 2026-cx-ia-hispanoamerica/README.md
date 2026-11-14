# IA en la gestión de la experiencia del cliente en Hispanoamérica

**Diego Orrego y Paula Riquelme · woku**

Manuscrito preliminar v2, instrumento 0.6. Corte documental: 14 de noviembre de 2026. Estudio observacional, no experimental y transversal, con captación no probabilística. Todavía no contiene resultados ni análisis de participantes.

## Empezar aquí

1. [Manuscrito en PDF](manuscrito/inicio-paper-ia-cx-hispanoamerica.pdf): fundamentos, revisión de literatura, objetivos, método y anexo del instrumento.
2. [Versión editable Word](manuscrito/inicio-paper-ia-cx-hispanoamerica.docx) y [Markdown](manuscrito/inicio-paper-ia-cx-hispanoamerica.md).
3. [Cuestionario vigente](instrumento/cuestionario-ia-cx-v06-es.md) y [diccionario CSV](instrumento/instrumento-encuesta-ia-cx-v06-es.csv).
4. [Referencias APA](manuscrito/referencias-apa.json), [matriz bibliográfica inicial](bibliografia/matriz-bibliografica.csv) y [antecedente de revisión](bibliografia/revision-inicial.md).
5. [Aplicación y backend](software/README.md), [arquitectura](software/survey-api/ARCHITECTURE.md) y [seguridad](software/survey-api/SECURITY.md).

Sitio del estudio: https://research.woku.app. [Visor del manuscrito](https://research.woku.app/?documento=manuscrito).

## Alcance y estado

Encuesta en español para empresas de Hispanoamérica. Reportes previstos para Argentina, Perú, Colombia, Chile, México, demás países y operaciones multinacionales regionales; cuatro bandas de personal. El manuscrito detalla población, cuotas operativas, sesgos y límites de inferencia. No se presenta la muestra como representativa.

El instrumento incluye un paso sobre agentes de IA con etapa de implementación y texto libre condicionado; separa intención de implementación y no certifica autonomía técnica. El piloto agrega dos preguntas y pausa la recepción al alcanzar su límite de 50.

Las cuatro respuestas de ensayo técnico fueron eliminadas. Al corte documental, los contadores están en cero, el piloto está pausado y la función temporal de reinicio está deshabilitada. Difusión prevista: 16 de noviembre de 2026; apertura automática no programada. [Resumen operativo](software/survey-api/PRODUCTION.md).

## Estructura

| Carpeta | Contenido |
| --- | --- |
| `manuscrito/` | PDF, Word, Markdown, fuente LaTeX, fuente editorial y referencias |
| `instrumento/` | Cuestionario 0.6, diccionario y cobertura territorial |
| `bibliografia/` | Matriz y revisión inicial fechadas; síntesis vigente en el manuscrito |
| `archivo/` | Versiones históricas del instrumento/manuscrito y antecedentes |
| `software/` | Monorepo npm de frontend, contrato y backend |
| `scripts/` | Generación documental y exportación del cuestionario |

La fuente ejecutable de preguntas es `software/survey-contract/src/instrument-source.json`. El manuscrito se edita en `manuscrito/paper-source.md`. Las versiones históricas no sustituyen a estas fuentes.

## Reproducir documentos

Desde esta carpeta, con Python 3, uv y pdfLaTeX (paquetes Spanish babel, natbib, geometry, mathptmx, microtype, booktabs y enumitem):

```bash
uv run --isolated --no-project --with-requirements scripts/requirements.txt python scripts/render_manuscript.py
python3 scripts/export_instrument.py
cd manuscrito
pdflatex -interaction=nonstopmode -halt-on-error -jobname=inicio-paper-ia-cx-hispanoamerica paper.tex
pdflatex -interaction=nonstopmode -halt-on-error -jobname=inicio-paper-ia-cx-hispanoamerica paper.tex
```

También puede usarse un entorno virtual propio e instalar `scripts/requirements.txt`. No se requieren servicios AWS para generar documentos. El PDF servido por la app es una copia versionada: después de una revisión, sincronizarlo deliberadamente con `software/survey-web/public/manuscrito/ia-cx-hispanoamerica-v2.pdf` y actualizar el nombre si cambia la versión. Compilar no publica en producción.

## Ejecutar software

Node 24 y npm. Desde `software/`:

```bash
npm ci
npm test
npm run build
npm run dev -w survey-web -- --port 5180 --strictPort
```

La vista local usa mocks. `npm run test:integration` necesita Docker y utiliza PostgreSQL efímero de prueba. Los despliegues y ensayos contra producción son acciones independientes con guardas explícitas.

## Citar y reutilizar

Consultar [CITATION.cff](CITATION.cff) y [criterios de publicación](../PUBLICATION.md). No hay DOI ni licencia abierta asignados. El manuscrito es preliminar y debe citarse indicando su versión.
