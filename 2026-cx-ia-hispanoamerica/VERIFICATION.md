# Verificación de la incorporación al repositorio

14 de noviembre de 2026. Comprobaciones realizadas desde esta estructura, sin acceder a la base productiva ni enviar encuestas:

- Instalación con el lockfile: `npm ci --ignore-scripts`.
- `npm test`: 26 pruebas de contrato, 27 unitarias/infraestructura API y siete unitarias frontend, todas correctas.
- `npm run build`: TypeScript/backend y frontend compilados correctamente.
- Generación de Markdown, Word y LaTeX con el script portable; 33 referencias. El contenido XML del Word regenerado coincide con el entregado; se conserva el archivo original.
- Compilación de LaTeX en dos pasadas: 37 páginas. Se conserva el PDF original del manuscrito.
- Exportación del instrumento desde el JSON vigente.
- Metadatos `CITATION.cff` validados contra el esquema 1.2.0.
- Enlaces locales Markdown comprobados tras mover archivos, sin destinos faltantes.
- Inspección de rutas locales, identificadores operativos y datos de participantes en el contenido seleccionado; inventarios y evidencia privada excluidos.
- Revisión Gitleaks 8.30.1 del contenido y del conjunto final de archivos preparados antes del commit, sin secretos detectados. Esta comprobación no garantiza ausencia de toda vulnerabilidad.

`checksums.sha256` registra las versiones incorporadas del PDF, Word, instrumento JSON y lockfile. Verificar desde esta carpeta con `sha256sum -c checksums.sha256`.

No se repitieron las pruebas PostgreSQL ni los ensayos de producción para esta reorganización; sus resultados previos y límites están en la documentación del software. La instalación reporta dos entradas moderadas asociadas a la dependencia de desarrollo CDK; el detalle existente está en `software/survey-api/SECURITY.md`. No se aplicaron cambios forzados de dependencias durante el empaquetado.
