"""Export the deployed instrument metadata without maintaining a second question set."""
from pathlib import Path
import csv
import hashlib
import json

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "software/survey-contract/src/instrument-source.json"
OUT = ROOT / "instrumento"
questions = json.loads(SOURCE.read_text())
fields = list(dict.fromkeys(key for question in questions for key in question))
with (OUT / "instrumento-encuesta-ia-cx-v06-es.csv").open("w", encoding="utf-8-sig", newline="") as stream:
    writer = csv.DictWriter(stream, fieldnames=fields, lineterminator="\n")
    writer.writeheader()
    for question in questions:
        writer.writerow({key: json.dumps(value, ensure_ascii=False) if isinstance(value, dict) else value for key, value in question.items()})

blocks = ["# Cuestionario IA y experiencia del cliente, versión 0.6",
          "Diego Orrego y Paula Riquelme · woku.",
          "16 preguntas principales. Q16D es opcional y condicional dentro del paso Q16, no otro paso. Las respuestas anteriores 0.5 no recibieron ese módulo y conservan su versión. Dos pasos adicionales durante el piloto; Q02C sólo para cobertura multinacional.",
          "Fuente: software/survey-contract/src/instrument-source.json. Fecha de versión: 14 de noviembre de 2026. SHA-256: " + hashlib.sha256(SOURCE.read_bytes()).hexdigest() + "."]
for question in questions:
    if question["id"] == "Q00":
        blocks.extend(["## Q00. Consentimiento informado",
                       "Casilla visible: «He leído la información del estudio y acepto participar voluntariamente».",
                       "Aplicación: después del correo y antes de las preguntas sustantivas. Q00 es un identificador documental; no se presenta un paso adicional de opciones Sí/No. El envío requiere consentimiento."])
        continue
    blocks.extend([f"## {question['id']}. {question['pregunta_es']}", question["opciones_es"], "Aplicación: " + question["mostrar_si"] + "."])
    if question.get("filas_es"):
        blocks.append("Filas: " + question["filas_es"])
    for key in ("definicion_agente", "definicion_cierre", "instruccion"):
        if question.get(key):
            blocks.append(question[key])
    for stage, prompt in question.get("guias_es", {}).items():
        blocks.append(f"Guía según etapa {stage}: {prompt}")
(OUT / "cuestionario-ia-cx-v06-es.md").write_text("\n\n".join(blocks) + "\n")
