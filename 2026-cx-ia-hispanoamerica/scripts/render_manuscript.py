from pathlib import Path
import re,json,html,unicodedata
from docx import Document
from docx.shared import Inches,Pt,RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'manuscrito'
raw=(OUT/'paper-source.md').read_text()
meta=json.loads((OUT/'metadatos-bibliograficos.json').read_text())
refs={}
def initials(given):
 return ' '.join('-'.join(p[0]+'.' for p in re.split('[‐–-]',word) if p) for word in given.split() if word)
titles={
 'agentmarketing':'Agentic AI and the new architecture of marketing relationships',
 'contentanalysis':'Three approaches to qualitative content analysis',
 'lemon':'Understanding customer experience throughout the customer journey',
 'huang':'Artificial intelligence in service','puntoni':'Consumers and artificial intelligence: An experiential perspective',
 'johnk':'Ready or not, AI comes: An interview study of organizational AI readiness factors',
 'hillebrand':'Managing with artificial intelligence: An integrative framework',
 'grewal':'How generative AI is shaping the future of marketing',
 'cillo':'Generative AI in innovation and marketing processes: A roadmap of research opportunities',
 'blaurock':'Designing collaborative intelligence systems for employee-AI service co-production',
 'ameen':'The rise of human–machine collaboration: Managers’ perceptions of leveraging artificial intelligence for enhanced B2B service recovery',
 'ayinaddis':'Artificial intelligence adoption dynamics and knowledge in SMEs and large firms: A systematic review and bibliometric analysis',
 'bryn':'Generative AI at work','sarstedt':'Machine marketing: Rethinking the customer in the age of generative AI',
 'chatterjee':'Assessing organizational users’ intentions and behavior to AI integrated CRM systems: A meta-UTAUT approach',
 'perez':'Artificial intelligence in Ecuadorian SMEs: Drivers and obstacles to adoption',
 'eysenbach':'Improving the quality of web surveys: The Checklist for Reporting Results of Internet E-Surveys (CHERRIES)',
 'lakens':'Sample size justification','pods':'Common method biases in behavioral research: A critical review of the literature and recommended remedies',
 'strobe':'The Strengthening the Reporting of Observational Studies in Epidemiology (STROBE) statement: Guidelines for reporting observational studies',
 'boateng':'Best practices for developing and validating scales for health, social, and behavioral research: A primer'}
years={'agentmarketing':2026,'contentanalysis':2005,'lemon':2016,'huang':2018,'puntoni':2021,'johnk':2021,'hillebrand':2025,'grewal':2025,'cillo':2025,'blaurock':2025,'ameen':2025,'ayinaddis':2025,'bryn':2025,'sarstedt':2026,'chatterjee':2023,'perez':2025,'eysenbach':2004,'lakens':2022,'pods':2003,'strobe':2007,'boateng':2018}
for key,d in meta.items():
 if key not in titles:continue
 if d.get('error'):raise ValueError((key,d))
 authors=[a for a in d['author'] if 'family'in a]
 names=[a['family']+', '+initials(a.get('given','')) for a in authors]
 auth=names[0] if len(names)==1 else ', '.join(names[:-1])+', & '+names[-1]
 families=[a['family'] for a in authors]
 short=families[0] if len(names)==1 else ' & '.join(families) if len(names)==2 else families[0]+' et al.'
 journal=d['container-title'][0]
 journal=journal.replace('The Quarterly Journal of Economics','The Quarterly Journal of Economics')
 vol=d.get('volume');issue=d.get('issue');pages=d.get('page');article=d.get('article-number')
 text=f'{auth} ({years[key]}). {titles[key]}. *{journal}'
 if vol:text+=f', {vol}'
 text+='*'
 if issue:text+=f'({issue})'
 if key in ['sarstedt','agentmarketing']:text+='. Publicación anticipada en línea.'
 elif article or (pages and re.match(r'^e\d+$',pages)) or key=='perez':text+=f', Artículo {article or pages}.'
 elif pages:text+=', '+pages.replace('-','–')+'.'
 else:text+='.'
 text+=' https://doi.org/'+d['DOI']
 refs[key]={'short':short,'year':years[key],'text':html.unescape(text),'url':'https://doi.org/'+d['DOI']}
refs['baker']={'short':'Baker et al.','year':2013,'text':'Baker, R., Brick, J. M., Bates, N. A., Battaglia, M., Couper, M. P., Dever, J. A., Gile, K. J., & Tourangeau, R. (2013). *Report of the AAPOR task force on non-probability sampling*. American Association for Public Opinion Research. https://aapor.org/wp-content/uploads/2022/11/NPS_TF_Report_Final_7_revised_FNL_6_22_13-2.pdf','url':'https://aapor.org/wp-content/uploads/2022/11/NPS_TF_Report_Final_7_revised_FNL_6_22_13-2.pdf'}
refs['jams']={'short':'Springer Nature','year':'s. f.','text':'Springer Nature. (s. f.). *Journal of the Academy of Marketing Science*. Recuperado el 14 de noviembre de 2026, de https://link.springer.com/journal/11747','url':'https://link.springer.com/journal/11747'}
refs['bjm']={'short':'British Academy of Management','year':'s. f.','text':'British Academy of Management. (s. f.). *British Journal of Management (BJM)*. Recuperado el 14 de noviembre de 2026, de https://www.bam.ac.uk/bam-journals/british-journal-of-management-bjm.html','url':'https://www.bam.ac.uk/bam-journals/british-journal-of-management-bjm.html'}
refs['tesis']={'short':'Orrego Brito','year':2018,'text':'Orrego Brito, D. I. (2018). *Análisis del bienestar de los colaboradores de una clínica dental* [Tesis de maestría, Universidad de Concepción].','url':''}
refs.update(json.loads((OUT/'referencias-agentes.json').read_text()))
raw=raw.replace('La referencia de escritura fue la tesis', 'La referencia de escritura [@tesis] fue la tesis')
raw=raw.replace('ofrecen evidencia de cobertura de sus revistas.', 'ofrecen evidencia de cobertura de sus revistas [@jams; @bjm].')
# Preserve the deployed wording and options; render metadata as instrument instructions.
questions=json.loads((ROOT/'software/survey-contract/src/instrument-source.json').read_text())
blocks=[]
for q in questions:
 if q['id']=='Q00':
  blocks.append('## Q00. Consentimiento informado\n\nCasilla visible: «He leído la información del estudio y acepto participar voluntariamente».\n\n*Aplicación:* Se presenta después del paso de correo y antes de las preguntas sustantivas. El envío requiere consent=true. Q00 es el identificador documental del consentimiento, no una pregunta independiente con opciones Sí/No en la interfaz.')
  continue
 opts=q['opciones_es']
 if q['id']=='Q00':rule='Consentimiento previo a las preguntas sustantivas. No aceptar implica terminar sin enviar respuestas sustantivas.'
 elif q['id']=='Q02C':rule='Sólo para alcance multinacional. Seleccionar al menos dos países o DK de forma exclusiva.'
 elif q['id']=='Q16':rule=q['instruccion']+' Definición de agente: '+q['definicion_agente']+' Cierre de ciclo: '+q['definicion_cierre']+' Guía según etapa: '+' '.join(k+'='+v for k,v in q['guias_es'].items())
 elif q['id']=='Q16D':rule='Sólo Q16=1, 2 o 3, en el mismo paso y de forma opcional. No incluir nombres de clientes, datos personales o información confidencial.'
 elif q['id']=='Q09':rule='Sólo con uso reciente. Elegir entre las actividades marcadas en Q08; si hay una sola, se deriva automáticamente.'
 elif q['id'] in ['Q10','Q11','Q12','Q13']:rule='Sólo con uso reciente. Referirse a la aplicación principal seleccionada en Q09.'
 elif q['id'] in ['P01','P02']:rule='Sólo durante el piloto; P01 obligatoria y P02 opcional.'
 else:rule='Según la ruta correspondiente y los criterios de elegibilidad.'
 if q['id']=='Q03':rule+=' El tamaño se refiere al país o conjunto regional seleccionado.'
 if q['id']=='Q15':rule+=' Horizonte indicado en la ayuda de la app: próximos doce meses.'
 if q['id']=='Q14':rule+=' Hasta tres opciones; NONE y DK son exclusivos.'
 if q['id'] in ['Q08','Q11','Q13']:rule+=' NONE, cuando exista, y DK se seleccionan solos.'
 blocks.append(f"## {q['id']}. {q['pregunta_es']}\n\n{opts.replace(' | ','; ')}.\n\n*Aplicación:* {rule}")
raw=raw.replace('{{INSTRUMENT}}','\n\n'.join(blocks))
used=set(re.findall(r'@([a-z]+)',raw));assert used<=refs.keys(),used-refs.keys()
order=sorted(used,key=lambda k:unicodedata.normalize('NFKD',refs[k]['text']).casefold())
(OUT/'referencias-apa.json').write_text(json.dumps({k:refs[k] for k in order},ensure_ascii=False,indent=2))
def citation(m):
 keys=re.findall(r'@([a-z]+)',m.group(0));keys.sort(key=lambda k:refs[k]['text'].casefold())
 return '('+'; '.join(f"{refs[k]['short']}, {refs[k]['year']}" for k in keys)+')'
md=re.sub(r'\[@[^\]]+\]',citation,raw)
md=md.replace('{{REFERENCES}}','\n\n'.join(refs[k]['text'] for k in order))
(OUT/'inicio-paper-ia-cx-hispanoamerica.md').write_text(md)
# LaTeX, APA author-year citations and alphabetical hanging bibliography.
def esc(s):
 for a,b in [('\\',r'\textbackslash{}'),('&',r'\&'),('%',r'\%'),('$',r'\$'),('#',r'\#'),('_',r'\_'),('{',r'\{'),('}',r'\}')]:
  if a=='\\':continue
  s=s.replace(a,b)
 return s.replace('≤',r'$\leq$').replace('→',r'$\rightarrow$').replace('–','--').replace('—',':')
def inline(s):
 placeholders={}
 def capture(m):
  key=f'ZZCITE{len(placeholders)}ZZ';keys=re.findall(r'@([a-z]+)',m.group(0));keys.sort(key=lambda k:refs[k]['text'].casefold());placeholders[key]=r'\citep{'+','.join(keys)+'}';return key
 s=re.sub(r'\[@[^\]]+\]',capture,s);s=esc(s)
 s=re.sub(r'\*\*(.+?)\*\*',lambda m:r'\textbf{'+m.group(1)+'}',s)
 s=re.sub(r'\*([^*]+)\*',lambda m:r'\emph{'+m.group(1)+'}',s)
 s=re.sub(r'`([^`]+)`',lambda m:r'\texttt{'+m.group(1)+'}',s)
 for k,v in placeholders.items():s=s.replace(k,v)
 return s
preamble=r'''\documentclass[12pt,letterpaper]{article}
\usepackage[utf8]{inputenc}
\usepackage[T1]{fontenc}
\usepackage[spanish,es-tabla]{babel}
\usepackage[margin=1in]{geometry}
\usepackage{mathptmx}
\usepackage{setspace}
\usepackage{booktabs,longtable,array}
\usepackage[authoryear,round]{natbib}
\usepackage[hidelinks]{hyperref}
\usepackage{microtype}
\urlstyle{same}
\usepackage{enumitem}
\setcitestyle{aysep={,},yysep={;}}
\setlength{\bibhang}{1.27cm}
\setlength{\bibsep}{8pt}
\setlength{\parindent}{1.27cm}
\setlength{\parskip}{3pt}
\setlength{\emergencystretch}{3em}
\onehalfspacing
\hypersetup{pdftitle={Adopción de IA en experiencia del cliente en Hispanoamérica},pdfauthor={Diego Orrego y Paula Riquelme, woku},pdfsubject={Manuscrito previo a datos y análisis, protocolo observacional}}
\begin{document}
'''
lines=raw.splitlines();tex=[preamble];i=0;sectionnum=0;inabstract=False
while i<len(lines):
 line=lines[i].strip()
 if not line:i+=1;continue
 if line=='{{REFERENCES}}':
  tex.append(r'\begingroup\setstretch{1.15}\begin{thebibliography}{99}')
  for key in order:
   ref=refs[key];label=esc(ref['short'])+'('+str(ref['year'])+')'
   text=ref['text'];url=ref['url']
   if url:text=text.removesuffix(url).strip()
   tex.append(r'\bibitem['+label+']{'+key+'} '+inline(text)+(r' \url{'+url+'}' if url else ''))
  tex.append(r'\end{thebibliography}\endgroup');i+=1;continue
 if line.startswith('|'):
  rows=[]
  while i<len(lines) and lines[i].strip().startswith('|'):
   row=[x.strip() for x in lines[i].strip().strip('|').split('|')]
   if not all(re.fullmatch(r'[-: ]+',c) for c in row):rows.append(row)
   i+=1
  n=len(rows[0]);width=(.91 if n==3 else .88)/n
  tex.append(r'\begingroup\small\setstretch{1.12}\setlength{\tabcolsep}{4pt}\begin{longtable}{'+''.join(r'>{\raggedright\arraybackslash}p{'+f'{width:.3f}'+r'\linewidth}' for _ in range(n))+'}\n'+r'\toprule')
  tex.append(' & '.join(r'\textbf{'+inline(c)+'}' for c in rows[0])+r' \\ \midrule\endhead')
  for row in rows[1:]:tex.append(' & '.join(inline(c) for c in row)+r' \\ \addlinespace[5pt]')
  tex.append(r'\bottomrule\end{longtable}\endgroup');continue
 if line.startswith('# '):
  name=line[2:]
  if i==0:tex.append(r'\begin{center}{\Large\bfseries '+inline(name)+r'\par}\end{center}')
  elif name=='Referencias':tex.append(r'\clearpage') # thebibliography supplies the APA heading
  else:
   if name.startswith(('1. ','Anexo ')):tex.append(r'\clearpage')
   tex.append(r'\section*{'+inline(name)+'}')
 elif line.startswith('## '):
  name=line[3:]
  if i<5:tex.append(r'\begin{center}\large '+inline(name)+r'\end{center}')
  else:tex.append(r'\subsection*{'+inline(name)+'}')
 elif line=='### Resumen':tex.append(r'\begin{abstract}\normalsize');inabstract=True
 elif line.startswith('**Palabras clave:'):
  if inabstract:tex.append(r'\end{abstract}');inabstract=False
  tex.append(r'\noindent '+inline(line))
 elif line.startswith('### '):tex.append(r'\subsection*{'+inline(line[4:])+'}')
 elif re.match(r'^\d+\. ',line):tex.append(r'\noindent '+inline(line)+r'\par')
 elif line.startswith(('**Autores:**','**Afiliación:**')):tex.append(r'\begin{center}'+inline(line)+r'\end{center}')
 elif line.startswith('**Tabla '):tex.append(r'\noindent '+inline(line)+r'\par\nopagebreak')
 else:tex.append(inline(line)+'\n')
 i+=1
tex.append(r'\end{document}')
(OUT/'paper.tex').write_text('\n'.join(tex))
# Editable Word rendition, same content, APA hanging references.
doc=Document();sec=doc.sections[0];sec.page_width=Inches(8.5);sec.page_height=Inches(11)
sec.top_margin=sec.bottom_margin=sec.left_margin=sec.right_margin=Inches(1)
style=doc.styles['Normal'];style.font.name='Times New Roman';style.font.size=Pt(12);style.paragraph_format.line_spacing=1.5;style.paragraph_format.first_line_indent=Inches(.5);style.paragraph_format.space_after=Pt(4)
for name in ['Title','Subtitle','Heading 1','Heading 2','Heading 3']:
 st=doc.styles[name];st.font.name='Times New Roman';st.font.color.rgb=RGBColor(0,0,0);st.font.size=Pt(14 if name in ['Title','Heading 1'] else 12);st.paragraph_format.first_line_indent=Inches(0)
footer=sec.footer.paragraphs[0];footer.alignment=WD_ALIGN_PARAGRAPH.RIGHT
fld=OxmlElement('w:fldSimple');fld.set(qn('w:instr'),'PAGE');footer._p.append(fld)
def runs(p,text):
 for chunk in re.split(r'(\*\*.*?\*\*|\*[^*]+\*)',text):
  if not chunk:continue
  r=p.add_run(chunk.strip('*'));r.bold=chunk.startswith('**');r.italic=chunk.startswith('*') and not chunk.startswith('**')
lines=md.splitlines();i=0;inrefs=False
while i<len(lines):
 line=lines[i].strip()
 if not line:i+=1;continue
 if line.startswith('|'):
  rows=[]
  while i<len(lines) and lines[i].strip().startswith('|'):
   row=[c.strip() for c in lines[i].strip().strip('|').split('|')]
   if not all(re.fullmatch(r'[-: ]+',c) for c in row):rows.append(row)
   i+=1
  table=doc.add_table(rows=1,cols=len(rows[0]));table.style='Light Shading'
  for j,c in enumerate(rows[0]):table.rows[0].cells[j].text=c
  repeat=OxmlElement('w:tblHeader');table.rows[0]._tr.get_or_add_trPr().append(repeat)
  for row in rows[1:]:
   cells=table.add_row().cells
   for j,c in enumerate(row):cells[j].text=c
  for row in table.rows:
   for cell in row.cells:
    for p in cell.paragraphs:
     p.paragraph_format.first_line_indent=Inches(0);p.paragraph_format.line_spacing=1.1
     for r in p.runs:r.font.size=Pt(10)
  continue
 if line.startswith('# '):
  title=line[2:];inrefs=title=='Referencias'
  if inrefs or title.startswith(('1. ','Anexo ')):doc.add_page_break()
  doc.add_heading(title,0 if i==0 else 1)
 elif line.startswith('## '):doc.add_heading(line[3:],2)
 elif line.startswith('### '):doc.add_heading(line[4:],2)
 else:
  p=doc.add_paragraph();runs(p,line);p.alignment=WD_ALIGN_PARAGRAPH.JUSTIFY
  if inrefs:p.paragraph_format.left_indent=Inches(.5);p.paragraph_format.first_line_indent=Inches(-.5)
  if line.startswith(('**Autores:**','**Afiliación:**')):p.alignment=WD_ALIGN_PARAGRAPH.CENTER;p.paragraph_format.first_line_indent=Inches(0)
  if line.startswith('**Tabla'):p.paragraph_format.first_line_indent=Inches(0);p.paragraph_format.keep_with_next=True
 i+=1
doc.core_properties.title='Adopción de IA en la gestión de la experiencia del cliente en Hispanoamérica'
doc.core_properties.author='Diego Orrego; Paula Riquelme, woku'
doc.core_properties.subject='Revisión de literatura y protocolo observacional previo al análisis'
doc.save(OUT/'inicio-paper-ia-cx-hispanoamerica.docx')
print(json.dumps({'references':len(order),'words':len(md.split()),'tex':str(OUT/'paper.tex'),'artifacts':str(OUT)},ensure_ascii=False))
