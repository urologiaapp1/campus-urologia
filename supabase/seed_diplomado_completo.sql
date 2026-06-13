-- ============================================================
-- Seed: Diplomado de Cirugía Reconstructiva Uretral
-- Contenido docente completo — 12 módulos, 42 lecciones
-- Fuentes: Martins 2020, 60 Tips Club de la Uretra,
--          Trifecta/Stricture-fecta 2026, conferencias AUA 2026
-- Ejecutar en Supabase → SQL Editor DESPUÉS de todas las migraciones.
-- IDEMPOTENTE: ON CONFLICT en programa; módulos/lecciones se insertan
-- una vez. Para re-ejecutar limpio: DELETE FROM programs WHERE slug =
-- 'diplomado-reconstructiva-uretral'; (en cascada elimina todo lo demás)
-- ============================================================

DO $SEED$
DECLARE
  v_prog uuid;
  v_mod  uuid;
BEGIN

-- ══════════════════════════════════════════════════════════════
-- PROGRAMA
-- ══════════════════════════════════════════════════════════════
INSERT INTO public.programs (slug, title, kind, description, published)
VALUES (
  'diplomado-reconstructiva-uretral',
  'Diplomado de Cirugía Reconstructiva Uretral',
  'diplomado',
  'Programa de formación avanzada en cirugía reconstructiva uretral para urólogos. Cubre anatomía funcional, diagnóstico, técnicas de injerto y colgajo, uretroplastia anterior y posterior, liquen escleroso, trauma uretral, estenosis por radioterapia, incontinencia masculina, uretra femenina, cirugía robótica y métricas de resultado. Basado en el Textbook of Male Genitourethral Reconstruction (Martins 2020), los 60 Tips del Club de la Uretra, el consenso Stricture-fecta (EAU 2026) y conferencias del AUA 2026.',
  false
)
ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title
RETURNING id INTO v_prog;

IF v_prog IS NULL THEN
  SELECT id INTO v_prog FROM public.programs WHERE slug = 'diplomado-reconstructiva-uretral';
END IF;

-- ══════════════════════════════════════════════════════════════
-- MÓDULO 1: Anatomía Funcional y Evaluación Diagnóstica
-- ══════════════════════════════════════════════════════════════
INSERT INTO public.modules (program_id, title, position)
VALUES (v_prog, 'Anatomía Funcional y Evaluación Diagnóstica de la Estenosis Uretral', 0)
RETURNING id INTO v_mod;

INSERT INTO public.lessons (module_id, title, kind, body, duration_min, position) VALUES
(v_mod, 'Anatomía funcional de la uretra masculina', 'texto', $body$
## Objetivos de aprendizaje
Al finalizar esta lección el residente debe ser capaz de describir los segmentos uretrales masculinos con sus características histológicas, identificar las estructuras vasculares y nerviosas relevantes para la cirugía reconstructiva, y comprender cómo la anatomía condiciona la elección de la técnica quirúrgica.

## Desarrollo teórico

### Segmentos uretrales
La uretra masculina mide entre 18 y 22 cm y se divide funcionalmente en dos grandes territorios: la uretra posterior (proximal, desde el cuello vesical hasta el bulbo) y la uretra anterior (distal, desde el bulbo hasta el meato).

**Uretra posterior**
Comprende la uretra prostática (3–4 cm), rodeada por el tejido glandular prostático, y la uretra membranosa (1–2 cm), segmento más corto y más vulnerable al trauma por su fijación al diafragma urogenital y ausencia de cuerpo esponjoso que lo proteja. El esfínter estriado uretral externo rodea la uretra membranosa y es el principal mecanismo de continencia voluntaria; su preservación es crítica en cualquier reparación de uretra posterior.

**Uretra anterior**
Se subdivide en uretra bulbar (5–6 cm) y uretra peneana o péndula (7–10 cm). La uretra bulbar discurre por el centro del bulbo esponjoso, estructura que le otorga un lecho vascular privilegiado fundamental para la toma de injertos. La uretra peneana, más superficial y con menor vascularización relativa del cuerpo esponjoso, es por ello más susceptible a la estenosis por instrumentación y a las complicaciones tras uretroplastia. La fosa navicular (1–2 cm) y el meato constituyen los segmentos más distales.

### Histología y relevancia quirúrgica
El epitelio uretral es transicional (urotelial) en la uretra posterior y se convierte en epitelio seudoestratificado columnar en la uretra anterior, con células columnares mucosecretoras. En el meato y la fosa navicular el epitelio es escamoso estratificado no queratinizado. Esta transición epitelial tiene importancia práctica: el liquen escleroso (LS) afecta preferentemente el epitelio escamoso distal y puede progresar proximalmente, lo que condiciona la extensión de la enfermedad.

Las glándulas de Littré, ubicadas en la lámina propia de la uretra anterior, secretan moco lubricante; su inflamación (litritis) puede ser un mecanismo subyacente en la estenosis idiopática.

### Vascularización: clave de la uretroplastia
El cuerpo esponjoso recibe irrigación de la arteria bulbouretral (rama de la pudenda interna) que entra por la cara dorsal del bulbo. Esta disposición tiene implicaciones directas en la técnica quirúrgica:

- En la **uretroplastia bulbar no transectante** se preservan las arterias bulbouretrales, reduciendo el riesgo de disfunción eréctil y favoreciendo la curación.
- En la **uretroplastia anastomótica** con transección (resección y anastomosis termino-terminal), la sección completa de ambas arterias bulbouretrales aumenta el riesgo de isquemia distal y disfunción eréctil, especialmente en estenosis largas.

La arteria dorsal del pene irriga la fascia de Buck y los cuerpos cavernosos. Su preservación durante la disección peneana previene la disfunción eréctil post-uretroplastia peneana.

### Inervación y continencia
El nervio pudendo (S2-S4) aporta inervación somática al esfínter externo. Los nervios cavernosos, ramas del plexo pélvico (S2-S4 parasimpático), transcurren posterolateralmente a la próstata en íntimo contacto con la uretra membranosa; su lesión en la uretroplastia posterior es causa de disfunción eréctil postoperatoria.

## Perlas clínicas
- La longitud de la estenosis en la uretra bulbar NO predice directamente la necesidad de transección: estenosis de hasta 2 cm pueden resolverse con anastomosis término-terminal sin tensión.
- La estenosis de fosa navicular es técnicamente desafiante por el acceso limitado y la tendencia a recidiva; el abordaje endoscópico transuretral ventral con injerto onlay tiene un 96% de éxito en series multicéntricas recientes.
- Conocer la anatomía venosa (plexo de Santorini) es esencial para controlar el sangrado en la uretroplastia posterior.

## Errores frecuentes
- Confundir "uretra bulbar" con "uretra bulbomembranosa": la uretra membranosa es un segmento posterior distinto, con esfínter externo rodeándolo.
- Disección excesivamente lateral en la uretra bulbar que lesiona los nervios cavernosos.
- No identificar el límite de la fascia de Buck durante la uretroplastia peneana, entrando inadvertidamente en los cuerpos cavernosos.

## Referencias
- Martins FE et al. Textbook of Male Genitourethral Reconstruction. Springer, 2020. Caps. 1-2.
- Velarde L. 60 Tips del Club de la Uretra. Tip 1. 2024.
- Barbagli G et al. Anatomy of the male urethra. Eur Urol. 2017.
$body$, 45, 0),

(v_mod, 'Evaluación clínica del paciente con sospecha de estenosis uretral', 'texto', $body$
## Objetivos de aprendizaje
Estructurar la evaluación diagnóstica del paciente con sospecha de estenosis uretral, seleccionar las herramientas de diagnóstico apropiadas según la sospecha clínica y formular un plan de estudio racional antes de definir el tratamiento.

## Desarrollo teórico

### Presentación clínica
La estenosis uretral rara vez se presenta de forma aguda. Lo más frecuente es una historia de síntomas obstructivos del tracto urinario inferior (LUTS) de instauración progresiva: chorro urinario débil, goteo postmiccional, sensación de vaciamiento incompleto, prolongación del tiempo miccional y, en estadios avanzados, retención urinaria aguda o crónica con globo vesical. Los síntomas irritativos (urgencia, frecuencia, disuria) son menos específicos pero pueden predominar cuando hay infección urinaria asociada o cuando la estenosis es funcional (p. ej., liquen escleroso activo en el meato).

La anamnesis debe incluir:
- **Antecedentes etiológicos**: cateterismo uretral previo (duración, calibre, número de episodios), instrumentación (cistoscopía, resección transuretral de próstata, litotricia intracorpórea), trauma perineal o pelviano, infecciones de transmisión sexual (gonorrea, clamidia), radiación pelviana, cirugías uretrales previas (hipospadias, uretroplastia, esfínter artificial), liquen escleroso cutáneo.
- **Antecedentes de complicaciones**: infecciones urinarias recurrentes, prostatitis, epididimitis, absceso periuretral, fístula uretrocutánea.
- **Medicamentos**: anticoagulantes, antiplaquetarios (relevantes para la planificación quirúrgica).
- **Comorbilidades**: diabetes mellitus, enfermedad vascular periférica, inmunosupresión (relevantes para la cicatrización).

### Exploración física
El examen físico debe ser sistemático:
- **Genitales externos**: inspeccionar el meato (estenosis meatal, phimosis, signos de LS como leucoplasia, depigmentación, induración), verificar la integridad del pene y el prepucio, palpar el cuerpo uretral en busca de induración o fibrosis en la cara ventral del pene (signo de "collar de perlas").
- **Periné**: identificar cicatrices de uretrostomía previa, fístulas activas, signos de Fournier's previo.
- **Tacto rectal**: valorar tamaño prostático y descartar causa prostática de la obstrucción.

### Herramientas diagnósticas

**Uroflujometría**: La Qmax (flujo máximo) < 10 mL/s en un volumen miccional adecuado (> 150 mL) es sugestiva de obstrucción, aunque no específica de estenosis. Útil para seguimiento tras tratamiento. Una curva en meseta ("plateau") es más sugestiva de obstrucción uretral que la curva en campana obstruida prostática.

**Residuo postmiccional ecográfico**: complementa la uroflujometría. Un RPM > 100 mL indica vaciamiento incompleto significativo.

**Uretrocistografía retrógrada y miccional (UCG/MCU)**: es el estudio de imagen de referencia para la estenosis uretral. Permite determinar localización, longitud, número de estenosis y morfología (regular, irregular, asociada a fístula o divertículo). La cistouretrografía miccional añade información sobre la uretra posterior, el cuello vesical y la presencia de reflujo.

**Ecografía uretral**: permite evaluar la profundidad de la fibroestenosis (espongiofibrosis) y ha ganado popularidad como complemento a la UCG. Una espongiofibrosis > 50% del grosor uretral se asocia a peores resultados en la uretroplastia.

**Uretroscopía flexible**: indicada cuando la UCG no es concluyente, cuando se sospecha patología intraluminal asociada (tumor, cálculo) o como evaluación preoperatoria inmediata. Permite tomar biopsia en caso de sospecha de LS.

**Estudios urodinámicos**: no son de rutina, pero se indican cuando hay sospecha de vejiga de baja compliance (por obstrucción crónica, radiación o lesión neurológica), ya que esta comorbilidad afecta el pronóstico funcional post-uretroplastia.

### Clasificación preoperatoria
Antes de planificar la cirugía, cada estenosis debe clasificarse según:
1. **Localización**: fosa navicular, peneana, bulbar proximal/distal, membranosa, prostática, cuello vesical.
2. **Longitud**: < 1 cm, 1-2 cm, 2-5 cm, > 5 cm.
3. **Morfología**: puntiforme, tubular, irregular (en colgante o "cloaking").
4. **Etiología**: idiopática, iatrogénica, inflamatoria (LS), traumática.
5. **Cirugías previas**: virgen, uretrotomía previa, uretroplastia fallida.

## Perlas clínicas
- Un paciente con catéter suprapúbico derivador no debe calibrarse ni intentarse retirar el catéter antes de la uretroplastia definitiva.
- La bacteriuria asintomática no requiere esterilización urinaria previa a la uretroplastia, pero sí un ciclo corto de antibióticos dirigidos por cultivo para reducir la carga bacteriana y el riesgo de infección de herida.
- La testosterona baja es más prevalente en pacientes con estenosis uretral y se asocia biológicamente a peor vascularización tisular, aunque no hay evidencia que indique su corrección mejore los resultados quirúrgicos.

## Errores frecuentes
- Planificar una uretroplastia basada solo en la UCG sin verificar endoscópicamente el segmento proximal.
- No descartar estenosis de cuello vesical o uretra prostática en un paciente con historia de RTU de próstata.
- Subestimar la longitud de la estenosis en la UCG cuando el paciente no puede vaciar bien.

## Referencias
- Velarde L. 60 Tips. Tip 2: ¿Cómo me enfrento a un varón con sospecha de estrechez uretral?
- Stolz M et al. Preoperative optimization. AUA 2026 Panel Discussion.
- Martins FE. Textbook of Male Genitourethral Reconstruction. Cap. 5.
$body$, 40, 1),

(v_mod, 'Uretrocistografía e imagen en la estenosis uretral', 'texto', $body$
## Objetivos de aprendizaje
Indicar, interpretar y realizar correctamente la uretrocistografía retrógrada y miccional (UCG/MCU), conocer sus limitaciones y conocer las técnicas alternativas de imagen uretral incluyendo la ecografía y la resonancia magnética.

## Desarrollo teórico

### Uretrocistografía retrógrada (UCG)
La UCG es el estudio de imagen fundamental en la evaluación de la estenosis uretral. Permite la caracterización morfológica completa: localización, longitud, diámetro luminal, regularidad del contorno y presencia de complicaciones (fístulas, divertículos, falsas vías).

**Técnica estándar**:
1. Posición oblicua del paciente a 45°, con la pierna inferior flexionada y la superior extendida (posición estándar de Brodny) para obtener una vista oblicua que despliega toda la uretra anterior sin superposición.
2. Inserción de una sonda de Foley 12-14 Fr con balón inflado a 1-2 mL en la fosa navicular (no avanzar más para no traspasar la estenosis distal).
3. Inyección lenta y continua de contraste yodado diluido (300 mg I/mL) bajo fluoroscopía; capturar imágenes durante el llenado y especialmente cuando el paciente refiere resistencia o la uretra se distiende al máximo.
4. Obtener al menos una imagen con la uretra bien distendida proximal y distalmente a la estenosis.

**Limitaciones**: La UCG puede subestimar la longitud de estenosis densas porque el contraste no pasa más allá de la obstrucción completa. En ese caso, la longitud total de la estenosis solo puede conocerse combinando la UCG anterógrada (miccional o suprapúbica) con la retrógrada.

### Cistouretrografía miccional (MCU)
La MCU evalúa la uretra posterior, el cuello vesical y la uretra membranosa, áreas no visibles en la UCG retrógrada. Es indispensable en:
- Trauma pélvico con lesión uretral posterior.
- Sospecha de estenosis anastomótica vesicouretral (post-prostatectomía).
- Sospecha de estenosis de cuello vesical (post-RTU, post-radioterapia).
- Estenosis panuretral donde hay duda sobre extensión posterior.

**Técnica**: Se instila contraste vía catéter suprapúbico o transuretral hasta llenar la vejiga. El paciente vacia de pie o semiinclinado mientras se obtienen imágenes fluoroscópicas en posición oblicua.

### Pericateterografía post-uretroplastia
Técnica descrita en el Tip 4 del Club de la Uretra. Consiste en inyectar contraste alrededor del catéter transoperatorio o postoperatorio para evaluar la reconstrucción in situ, sin retirar el catéter. Permite verificar la ausencia de fugas anastomóticas, la amplitud de la neourethra y detectar complicaciones tempranas antes del retiro del catéter.

### Ecografía uretral
La ecografía de alta frecuencia (7.5-15 MHz) aplicada sobre la cara ventral del pene y el periné permite:
- Medir el grosor del cuerpo esponjoso y cuantificar la espongiofibrosis periuretral.
- Identificar calcificaciones uretrales y abscesos periuretrales.
- Evaluar la extensión real de la fibrosis más allá del lumen visible en la UCG.

La clasificación ecográfica de la espongiofibrosis (grado 0-3 según el porcentaje de afectación circunferencial) se correlaciona con el pronóstico postoperatorio: mayor grado de espongiofibrosis predice mayor riesgo de recurrencia y mayor necesidad de resección en lugar de simple incisión.

### Resonancia magnética uretral
La RM perineal con antena de superficie provee excelente resolución tisular para:
- Estadificación de trauma uretral posterior complejo.
- Evaluación de estenosis de cuello vesical en campo irradiado.
- Planificación preoperatoria de uretroplastia posterior en lesiones por fractura pélvica (longitud de la distracción uretral, presencia de hematoma organizado, trayecto del defecto).

No es de uso rutinario en la estenosis anterior simple pero su indicación en casos complejos es creciente.

### Endoscopía diagnóstica
La uretroscopía flexible es complementaria a la imagen radiológica. Permite:
- Confirmar la localización y morfología de la estenosis.
- Evaluar la mucosa proximal (calidad para la anastomosis).
- Biopsiar lesiones sospechosas de LS o neoplasia.
- Verificar la presencia de patología vesical asociada (tumor, cálculos).

## Indicaciones prácticas de cada estudio
| Situación clínica | Estudio recomendado |
|---|---|
| Primera evaluación de estenosis anterior | UCG + uroflujometría |
| Estenosis posterior / LUJA | UCG + MCU |
| Recurrencia post-uretroplastia | UCG + uretroscopía |
| Trauma pélvico agudo | MCU (si viable) o RM pélvica |
| Planificación uretroplastia posterior | UCG + MCU + RM |
| Sospecha de LS | UCG + uretroscopía + biopsia |

## Errores frecuentes
- Inflar el balón de Foley > 2 mL en la fosa navicular: produce artefacto y puede provocar dolor o daño tisular.
- No obtener la imagen miccional en un paciente con RTU de próstata previa y estenosis recurrente.
- Interpretar una UCG retrógrada como la longitud "total" de la estenosis cuando hay obstrucción completa.

## Referencias
- Velarde L. 60 Tips. Tips 3 y 4 (UCG masculina y pericateterografía).
- Martins FE. Textbook. Cap. 5: Diagnóstico por imagen.
- Barbagli G et al. Ultrasonography of the urethra. Arab J Urol. 2014.
$body$, 40, 2),

(v_mod, 'Uroflujometría, ecografía vesical y endoscopía diagnóstica', 'texto', $body$
## Objetivos de aprendizaje
Interpretar los parámetros urodinámicos básicos en el contexto de la estenosis uretral, conocer los instrumentos ópticos y accesorios de uso rutinario en la cirugía uretral, y planificar el equipamiento necesario para la evaluación y el tratamiento endoscópico.

## Desarrollo teórico

### Uroflujometría en la estenosis uretral
La uroflujometría es una herramienta no invasiva de primer nivel. En la estenosis uretral el patrón típico es una curva de flujo en meseta ("plateau") con Qmax reducida (< 10 mL/s en la mayoría de los casos sintomáticos) y tiempo de vaciamiento prolongado. A diferencia de la hiperplasia benigna de próstata, donde la curva tiene morfología obstruida con pico reducido pero forma curvada, la estenosis uretral genera una meseta sostenida que refleja la resistencia fija al flujo.

El volumen miccional debe ser al menos 150 mL para que la Qmax sea interpretable. Volúmenes menores producen Qmax falsamente baja sin relación con obstrucción real.

**Seguimiento postoperatorio**: La uroflujometría es el instrumento más práctico para el seguimiento funcional tras uretroplastia. Una Qmax > 15 mL/s al tercer mes postoperatorio es un indicador de buena permeabilidad, aunque su sensibilidad para detectar estenosis recurrentes tempranas es limitada (puede haber recurrencia sin caída significativa del flujo en estadios iniciales).

### Ecografía vesical y residuo postmiccional
El residuo postmiccional (RPM) medido ecográficamente informa sobre la eficiencia del vaciamiento vesical. Un RPM > 100 mL es clínicamente significativo y puede indicar:
- Obstrucción uretral severa con descompensación vesical.
- Vejiga de baja actividad (hipocontractilidad del detrusor), especialmente en diabéticos o en post-radioterapia.
- Ambas condiciones coexistentes.

La diferenciación es importante porque un paciente con vejiga hipocontráctil no mejorará significativamente la micción aunque se resuelva la estenosis.

### Instrumental endoscópico en urología reconstructiva

**Lupas quirúrgicas**: el Tip 5 del Club de la Uretra establece que las lupas de aumento (2.5x-3.5x) son el estándar para la mayoría de cirujanos reconstructivos. Proporcionan profundidad de campo y campo visual amplio con libertad de movimiento. Los microscopios quirúrgicos (como en la microcirugía) rara vez se usan en uretroplastia de rutina pero pueden ser útiles en anastomosis de precisión extrema. La inversión en lupas de calidad es altamente recomendada por los expertos del Club de la Uretra como uno de los primeros equipamientos a adquirir al iniciar en cirugía reconstructiva.

**Separadores y retractores**:
- *Separador de Scott*: sistema modular de retractores metálicos articulados que se fijan al marco quirúrgico. Ideal para exponer el campo perineal durante la uretroplastia bulbar y posterior, con retracción multidireccional sin necesidad de asistentes adicionales.
- *Separador de Ravini*: retractor perineal específicamente diseñado para uretroplastia; su geometría facilita el acceso al bulbo.
- *Retractor de Teales Gorget*: instrumento metálico en forma de canal que protege la uretra posterior durante la disección perineal profunda.

**Instrumental prestado de otras especialidades**:
- *Dilatadores de Bakes*: sondas metálicas lisas usadas en cirugía biliar, reutilizadas en uretrología para calibrar el lumen uretral proximal durante uretroplastia posterior.
- *Histerómetro ginecológico*: útil como guía en uretroplastia posterior para identificar el cabo uretral proximal obliterado.
- *Bisturí oftálmico*: hoja de precisión para incisiones finas en meato y fosa navicular.

**Doppler intraoperatorio**: el estetoscopio Doppler de mano (Tip 13) permite identificar el flujo de la arteria dorsal del pene y la arteria bulbouretral durante la disección, facilitando la preservación vascular y reduciendo el riesgo de disfunción eréctil postoperatoria.

**Cistoscopio flexible intraoperatorio**: el uso intraoperatorio del cistoscopio flexible es invaluable en la uretroplastia posterior para identificar el meato uretral proximal (iluminación desde adentro), verificar la anastomosis, y realizar la pericateterografía de control antes del cierre de la herida.

### Parámetros de éxito: Stricture-fecta
El consenso Delphi internacional EAU 2026 (Vetterlein et al.) definió tres criterios para el éxito de la uretroplastia (la "stricture-fecta"):
1. **Ausencia de retratamiento**: no dilatación, no DVIU, no derivación, no uretroplastia de revisión.
2. **Sin impacto significativo en continencia o función sexual**: evaluado con instrumentos validados (IIEF, MSHQ, ICIQ-UI SF).
3. **Satisfacción del paciente**: evaluación subjetiva no cuantificada.

Este consenso reemplaza las definiciones antiguas basadas solo en uroflujometría o en paso del cistoscopio, alineando la evaluación con resultados centrados en el paciente.

## Perlas clínicas
- La Qmax no detecta recurrencias tempranas: usar cistouretrografía o uretroscopía a los 3-6 meses para vigilancia adecuada post-uretroplastia.
- El estetoscopio Doppler de bolsillo cuesta menos de $50 y puede prevenir complicaciones vasculares graves.
- No invertir en equipamiento de cistoscopía rígida si se inicia en reconstructiva: el cistoscopio flexible es más versátil para evaluación y seguimiento.

## Errores frecuentes
- Usar la Qmax como único criterio de éxito postoperatorio.
- No calibrar el lumen uretral proximal intraoperatoriamente, concluyendo erróneamente que una estenosis termina antes de su límite real.

## Referencias
- Velarde L. 60 Tips. Tips 5, 6, 7, 8, 9, 10, 11, 12, 13.
- Vetterlein MW et al. Stricture-fecta Delphi Consensus. Eur Urol Open Sci. 2026;83:120-124.
$body$, 35, 3);

-- ══════════════════════════════════════════════════════════════
-- MÓDULO 2: Etiología, Fisiopatología y Epidemiología
-- ══════════════════════════════════════════════════════════════
INSERT INTO public.modules (program_id, title, position)
VALUES (v_prog, 'Etiología, Fisiopatología y Epidemiología de la Estenosis Uretral', 1)
RETURNING id INTO v_mod;

INSERT INTO public.lessons (module_id, title, kind, body, duration_min, position) VALUES
(v_mod, 'Etiología e historia natural de la estenosis uretral', 'texto', $body$
## Objetivos de aprendizaje
Conocer las principales causas de estenosis uretral en el adulto, comprender su historia natural sin tratamiento y reconocer los factores de riesgo que condicionan el pronóstico quirúrgico.

## Desarrollo teórico

### Epidemiología
La estenosis uretral afecta aproximadamente al 0,6% de los hombres en países desarrollados, con una incidencia de 200-300 casos por 100.000 varones por año. Su prevalencia aumenta con la edad y es mayor en zonas con alta prevalencia de infecciones de transmisión sexual (ITS). En Latinoamérica, la estenosis iatrogénica post-cateterismo y post-instrumentación es la causa más frecuente en centros terciarios, seguida por la idiopática y la traumática.

### Clasificación etiológica

**Iatrogénica (40-50% en series contemporáneas)**
El cateterismo uretral es la causa iatrogénica más frecuente. Los mecanismos incluyen presión isquémica del balón de Foley, traumatismo durante la inserción, infección urinaria catéter-asociada y reacción del cuerpo esponjoso al látex o al silicón. El riesgo aumenta con catéteres de mayor calibre (> 16 Fr), uso prolongado (> 7 días) y colocaciones repetidas. La cistoscopía rígida, la RTU de próstata, la braquiterapia, la litotricia intracorpórea y la inserción de stents uretrales son otras causas iatrogénicas relevantes.

**Idiopática (30-40%)**
Las estenosis sin causa identificable afectan preferentemente la uretra bulbar proximal. Su histología muestra inflamación crónica inespecífica con litritis glandular, lo que sugiere una inflamación recurrente de las glándulas de Littré como mecanismo etiopatogénico. Responden bien a la uretroplastia y tienen las mejores tasas de éxito quirúrgico (97% libre de retratamiento a 10 años en series de referencia).

**Inflamatoria: Liquen Escleroso (LS) (10-15%)**
El LS (anteriormente denominado balanitis xerótica obliterante, BXO) es una enfermedad inflamatoria crónica que afecta el epitelio escamoso. Comienza habitualmente en el glande y prepucio y puede progresar en sentido proximal a lo largo de la uretra, produciendo estenosis de fosa navicular, peneana y, en casos avanzados, bulbar. El LS tiene la peor tasa de éxito quirúrgico de todas las etiologías: 66-77% a 1-10 años versus 95-97% para idiopática. Su fisiopatología es tratada en profundidad en la lección siguiente.

**Traumática (10-15%)**
Las estenosis por trauma incluyen:
- *Lesión uretral por fractura pélvica (PFUI)*: afecta la uretra membranosa o bulbomembranosa. Es la etiología más grave, con alta tasa de disfunción eréctil (30-50%) e incontinencia postoperatoria (5-10%).
- *Trauma perineal sin fractura pélvica* (straddle injury): afecta típicamente la uretra bulbar proximal al aplastarse contra el arco púbico durante el traumatismo.
- *Trauma peneano externo*.

**Post-radioterapia (5-10%)**
La estenosis por radioterapia (braquiterapia prostática, radioterapia externa de próstata) afecta la uretra membranosa y bulbomembranosa. La fibrosis obliterativa, la hipovascularidad por endarteritis obliterante y el ambiente avascular e hipóxico hacen de estas estenosis las más difíciles de tratar quirúrgicamente.

**Infecciosa (< 5% en países desarrollados)**
La gonorrea fue la causa más frecuente históricamente. Hoy en día sigue siendo relevante en países en desarrollo. Produce estenosis largas, irregulares y a menudo panuretrales. La clamidia puede producir uretritis crónica con estenosis de menor longitud.

### Historia natural sin tratamiento
La estenosis uretral no tratada progresa lentamente. El aumento del residuo postmiccional conduce a infecciones urinarias recurrentes, epididimitis, prostatitis y finalmente a divertículo uretral, fístula uretrocutánea o absceso periuretral. La hidronefrosis bilateral y la insuficiencia renal son complicaciones tardías infrecuentes pero graves. La evaluación del tracto urinario superior (ecografía renal) es obligatoria en pacientes con obstrucción severa o de larga data.

### Historia natural post-tratamiento endoscópico
La uretrotomía interna (DVIU) y la dilatación tienen tasas de éxito a largo plazo menores del 50% para estenosis > 1,5 cm. La tasa de recurrencia aumenta con cada procedimiento sucesivo, el tejido cicatricial se hace más denso y fibroso, y la opción de uretroplastia posterior se ve comprometida por la fibrosis periuretral progresiva. El dogma actual es que la DVIU/dilatación puede ofrecerse una sola vez para estenosis cortas (< 1 cm) como alternativa a la uretroplastia, pero que los pacientes con estenosis recurrente deben ser referidos a cirugía reconstructiva sin más tratamientos paliativos.

## Errores frecuentes
- Repetir DVIU indefinidamente sin derivar al cirujano reconstructivo.
- No indagar en el antecedente de cateterismo prolongado o instrumentación en pacientes que niegan procedimientos urológicos.
- Clasificar toda estenosis de un paciente con prostatectomía radical como estenosis anastomótica sin descartar extensión a uretra membranosa.

## Referencias
- Martins FE. Textbook. Caps. 3-4: Etiología y epidemiología.
- Lumen N et al. Etiology of urethral stricture disease in the 21st century. J Urol. 2009.
- Santucci RA et al. TURNS group: epidemiology of urethral strictures. J Urol. 2007.
$body$, 40, 0),

(v_mod, 'Liquen escleroso: fisiopatología, hipótesis multi-hit y biomarcadores', 'texto', $body$
## Objetivos de aprendizaje
Comprender la fisiopatología del liquen escleroso (LS) como enfermedad sistémica con manifestación local, conocer los mecanismos moleculares de la inflamación y la fibrosis en el LS uretral, e identificar los biomarcadores con potencial translacional para el diagnóstico y la predicción de recurrencia.

## Desarrollo teórico

### Naturaleza sistémica del liquen escleroso
El LS uretral no es una enfermedad puramente local. Datos del grupo TURNS (Trauma and Urologic Reconstructive Network of Surgeons) con más de 1.000 pacientes demuestran que el LS se asocia significativamente a mayor índice de masa corporal (OR 1,09), hipertensión arterial (OR 2,03) y tabaquismo activo (OR 1,98). Estos factores predisponentes sistémicos sugieren que el LS es la manifestación local de una condición inflamatoria sistémica, en lugar de una enfermedad puramente dermatológica.

### Diagnóstico histológico: desafíos y heterogeneidad
La heterogeneidad diagnóstica del LS entre patólogos es notable. Una encuesta de patólogos académicos especializados en genitourinario y dermatopatólogos mostró que el único criterio histológico consensuado (acuerdo > 85%) es la homogeneización del colágeno dérmico. Otros criterios (hiperqueratosis, atrofia epidérmica, infiltrado linfocítico en banda) tienen menor acuerdo interobservador. Esta variabilidad diagnóstica tiene implicaciones directas en los estudios clínicos: diferentes criterios inclusión modifican los resultados comparativos.

Un hallazgo especialmente controvertido es si el LS puede "saltar" directamente a la uretra bulbar sin afectación visible del segmento distal: el 20% de los dermatopatólogos lo considera posible, mientras que el 0% de los patólogos genitourinarios lo avala.

### Microambiente inflamatorio único del LS
Estudios de proteómica e inmunohistoquímica han caracterizado un microambiente inflamatorio distinto en el LS uretral:
- **Infiltración de linfocitos T CD8+**: 50% de los casos de LS vs. 13% en estenosis idiopática.
- **CCL4 elevado**: 76% vs. 42%.
- **TNF-α e IgG4**: presentes exclusivamente en LS, ausentes en estenosis idiopática.
- **Virus de Epstein-Barr (EBV)**: RNA elevado en 37% de LS vs. 10% de controles, sugiriendo un posible gatillo infeccioso viral.

Además, el LS es un "defecto de campo": la inflamación severa se extiende más allá de la estenosis macroscópica hacia tejido uretral macroscópicamente normal en más del 50% de los casos, lo que explica por qué la resección del segmento estenótico no garantiza el éxito a largo plazo.

### Regulación por microARN
Un estudio de 2021 identificó 27 microARNs diferencialmente expresados en LS uretral, con 13 confirmados en cohorte de validación. El miR-155-5p, sobreexpresado 11 veces en LS, promueve la proliferación de fibroblastos y la producción de colágeno. MiR-146a-5p y miR-150-5p regulan la señalización TLR y la activación de células T. El análisis de ontología génica demostró que estos microARNs influyen en respuesta inmune, angiogénesis y fibrosis, posicionándolos como biomarcadores potenciales y dianas terapéuticas.

### Disbiosis del microbioma uretral
Dos cohortes independientes encontraron una firma microbiana diferencial en hombres con LS: mayor diversidad bacteriana global y elevación significativa de *Fusobacteriota*, bacteria asociada a otras condiciones inflamatorias y autoinmunes de mucosas. Esta disbiosis podría ser tanto causa como consecuencia de la inflamación, pero abre la puerta a estrategias de modulación del microbioma como complemento terapéutico.

### La hipótesis multi-hit
El modelo más coherente con la evidencia disponible es la "hipótesis multi-hit":
1. **Hit 1 (predisposición sistémica)**: obesidad, hipertensión, tabaquismo activan un estado proinflamatorio sistémico basal.
2. **Hit 2 (insulto local)**: microtrauma uretral, infección viral (EBV), disbiosis urinaria o cateterismo activan la cascada inflamatoria local.
3. **Fase inflamatoria**: infiltración de CD8+, elevación de TNF-α, sobreexpresión de miR-155-5p.
4. **Cambio fibrótico**: activación de fibroblastos, producción de colágeno tipo I.
5. **Matriz cicatricial**: hialinización del colágeno dérmico (hallazgo histológico definitorio).
6. **Cicatriz terminal**: tejido hipovascular, hipocelular, resistente a la cirugía.

### La paradoja de la recurrencia
Contraintuitivamente, los pacientes que recidivan post-uretroplastia de LS NO muestran niveles más altos de marcadores inflamatorios. Un estudio de 2020 demostró que las estenosis recurrentes tienen niveles más bajos de PCR, IL-1β, IL-6 y TNF-α, pero mayor expresión de VEGF (huella hipóxica). Esto sugiere que la recurrencia no se debe a hiperinflamación, sino a una "capacidad de curación agotada" — tejido quemado e hipóxico que ha perdido la capacidad regenerativa.

Esta paradoja tiene implicaciones quirúrgicas: los pacientes con múltiples cirugías previas y cicatriz terminal densa son los de peor pronóstico, independientemente de la técnica elegida.

### Perspectivas: cuidado dirigido por biopsia
El futuro del manejo del LS apunta hacia el "cuidado dirigido por biopsia": conocer el estado molecular del tejido (inflamación activa vs. cicatriz quemada) permitiría individualizar el tratamiento: antiinflamatorios tópicos, moduladores de microARN, inmunomoduladores o cirugía más agresiva según el perfil molecular.

## Errores frecuentes
- Considerar el LS como una condición exclusivamente dermatológica y no buscar comorbilidades sistémicas.
- Operar sin considerar la extensión del "defecto de campo" proximal a la estenosis visible.
- Interpretar tasas de éxito de uretroplastia de LS comparables a las de estenosis idiopática: el pronóstico es significativamente peor.

## Referencias
- Warf B. Pathophysiology of Lichen Sclerosus Urethral Stricture Disease. AUA 2026.
- TURNS Group. LS and systemic associations. J Urol. 2021.
- MicroRNA study in LS urethral stricture. J Urol. 2021.
- Martins FE. Textbook. Cap. 3: LS etiology.
$body$, 50, 1),

(v_mod, 'Optimización preoperatoria del paciente de alto riesgo', 'texto', $body$
## Objetivos de aprendizaje
Identificar las comorbilidades que aumentan el riesgo quirúrgico en uretroplastia, establecer criterios de optimización preoperatoria y conocer el manejo perioperatorio de condiciones especiales: anticoagulación, diabetes, obesidad, radioterapia previa y quimioterapia activa.

## Desarrollo teórico

### Principios generales
La uretroplastia electiva permite una ventana de optimización preoperatoria que debe aprovecharse al máximo. El objetivo no es alcanzar el estado "perfecto" del paciente (que puede nunca ocurrir), sino reducir los factores de riesgo modificables sin retrasar indefinidamente una intervención necesaria. El riesgo de no operar (progresión de la obstrucción, infecciones repetidas, deterioro renal) debe ponderarse contra el riesgo de complicaciones quirúrgicas.

### Manejo de anticoagulación y antiplaquetarios
El manejo perioperatorio de anticoagulantes debe individualizarse según el riesgo trombótico del paciente y el riesgo hemorrágico de la cirugía. Los anticoagulantes orales directos (DOACs: apixabán, rivaroxabán) pueden suspenderse 24-48 horas antes de la cirugía en la mayoría de los casos, dado su mecanismo reversible de acción. La warfarina requiere suspensión 5 días antes con verificación del INR preoperatorio; la terapia puente con HBPM se reserva para pacientes con alto riesgo trombótico (válvulas mecánicas, tromboembolismo reciente).

En pacientes con TVP en los últimos 30 días, la cirugía electiva debe diferirse 3 meses hasta completar la anticoagulación óptima; si la cirugía es urgente, considerar filtro de vena cava inferior temporario.

### Diabetes mellitus
La diabetes es un factor independiente de peor cicatrización, mayor infección de herida y mayor tasa de fístula uretrocutánea post-uretroplastia. Los objetivos preoperatorios son:
- HbA1c < 8-8,5% para cirugía electiva (< 7,5% para procedimientos de alta complejidad como implante de prótesis).
- Glucemia capilar en ayunas < 140 mg/dL el día de la cirugía.
- Coordinación con endocrinología para ajuste de insulina o hipoglucemiantes.

Los agonistas del receptor de GLP-1 (semaglutida, dulaglutida, liraglutida) producen enlentecimiento del vaciamiento gástrico, aumentando el riesgo de aspiración pulmonar. Las preparaciones semanales (semaglutida sc) deben suspenderse 7 días antes de la cirugía; las diarias, 24 horas antes. Este punto es especialmente relevante dado el uso creciente de estos fármacos en pacientes con obesidad.

### Obesidad
El IMC elevado aumenta la dificultad técnica (acceso perineal, longitud de los instrumentos), el riesgo de infección de herida y la necrosis grasa subcutánea. Un IMC > 35 kg/m² es una contraindicación relativa para uretroplastia perineal electiva; la derivación con catéter suprapúbico temporal mientras el paciente pierde peso puede ser una estrategia adecuada. La reparación de pene enterrado (buried penis) en pacientes obesos requiere optimización nutricional y control de la DMAI concurrente.

### Radioterapia previa
El tejido irradiado presenta endarteritis obliterante crónica, fibrosis, hipovascularidad e hipoxia que comprometen severamente la cicatrización. Los principios de manejo en campo irradiado incluyen:
- Evitar tensión en las anastomosis.
- Preferir técnicas de injerto (onlay) sobre anastomosis término-terminal.
- Considerar el oxígeno hiperbárico (OHB) preoperatorio: 20-40 sesiones preoperatorias estimulan la neovascularización del tejido hipóxico y pueden mejorar los resultados (evidencia indirecta extrapolada de otras cirugías en campo irradiado).
- Reconstrucción con colgajos bien vascularizados cuando el lecho local es insuficiente (colgajo de Martius, gracilis, etc.).

### Paciente oncológico en quimioterapia activa
La cirugía en pacientes con quimioterapia activa requiere coordinación estrecha con oncología. Los riesgos específicos incluyen:
- **Mielosupresión**: neutropenia que aumenta el riesgo de infección; verificar recuento de neutrófilos > 1.000/µL y plaquetas > 50.000/µL antes de cirugía electiva.
- **Agentes anti-VEGF** (bevacizumab): requieren suspensión ≥ 4-6 semanas antes de la cirugía por deterioro de la cicatrización vascular.
- **Inhibidores de checkpoint** (inmunoterapia): el riesgo perioperatorio específico no está bien definido; suspensión habitualmente 1-2 ciclos antes de la cirugía electiva.
- **Estado nutricional**: albúmina < 3 g/dL o prealbúmina < 10 mg/dL indican desnutrición severa; diferir la cirugía electiva y optimizar soporte nutricional.

### Bacteriuria y manejo de infección urinaria
La bacteriuria asintomática en pacientes con catéter crónico (suprapúbico o uretral) NO requiere esterilización urinaria previa a la uretroplastia; sí requiere un ciclo corto de antibióticos dirigidos por cultivo (habitualmente 3-5 días preoperatorios) para reducir la carga bacteriana. La exigencia de cultivo urinario estéril en pacientes crónicamente colonizados es innecesaria y puede retrasar indefinidamente la cirugía sin beneficio demostrado.

### Testosterona y función eréctil preoperatoria
La testosterona baja es más prevalente en la población con estenosis uretral que en la población general, probablemente como marcador de peor calidad tisular y menor vascularización. A pesar de la plausibilidad biológica, no existe evidencia clínica de que la corrección del hipogonadismo mejore los resultados de la uretroplastia. Su tratamiento debe ser sintomático (hipogonadismo clínico), no preventivo-quirúrgico.

## Errores frecuentes
- Suspender un DOAC el mismo día de la cirugía creyendo que es seguro por su "corta vida media".
- No preguntar por uso de GLP-1 agonistas, especialmente en pacientes obesos que "no tienen diabetes diagnosticada".
- Diferir indefinidamente la uretroplastia esperando una HbA1c perfecta en un diabético que nunca la alcanzará.

## Referencias
- Panel AUA 2026: Preoperative Optimization in Urological Surgery. Drs. Stolz, Peterson, Allen, Parraha.
- Allen H. Obesity and GLP-1 perioperative considerations. AUA 2026.
- Martins FE. Textbook. Cap. 6: Principios de reconstrucción.
$body$, 45, 2);

-- ══════════════════════════════════════════════════════════════
-- MÓDULO 3: Principios de Reconstrucción y Posicionamiento
-- ══════════════════════════════════════════════════════════════
INSERT INTO public.modules (program_id, title, position)
VALUES (v_prog, 'Principios de Reconstrucción Uretral y Posicionamiento Quirúrgico', 2)
RETURNING id INTO v_mod;

INSERT INTO public.lessons (module_id, title, kind, body, duration_min, position) VALUES
(v_mod, 'Principios generales de uretroplastia y selección de técnica', 'texto', $body$
## Objetivos de aprendizaje
Aplicar los principios de reconstrucción uretral a la selección de la técnica quirúrgica óptima para cada caso, comprender la jerarquía de opciones terapéuticas y conocer los predictores de recurrencia que orientan la toma de decisiones.

## Desarrollo teórico

### El paradigma moderno de la uretroplastia
La uretroplastia ha dejado de ser una "cirugía de salvamento" para pacientes con múltiples endoscopias fallidas. La evidencia contemporánea posiciona la uretroplastia como la primera línea de tratamiento para estenosis que no son candidatas a una única DVIU/dilatación exitosa. Los principios fundamentales son:

1. **Erradicación completa de la estenosis**: el objetivo no es ampliar el lumen sino eliminar el tejido fibroso cicatricial y restaurar una uretra de calibre normal con mucosa sana en ambos extremos de la anastomosis.
2. **Sin tensión**: cualquier anastomosis bajo tensión está condenada a la estenosis. La movilización uretral adecuada y las maniobras de ganancia de longitud son esenciales para anastomosis libres de tensión.
3. **Vascularización del lecho receptor**: el injerto o el tejido reconstruido debe apoyarse en un lecho receptor bien vascularizado. Esto condiciona la posición del injerto y la calidad del tejido periuretral.
4. **Mucosa sana en los extremos**: el cirujano debe cortar proximal y distal a la estenosis hasta encontrar mucosa uretral sana y bien vascularizada, verificada por aspecto macroscópico y por el sangrado del margen.

### Jerarquía de técnicas

**Resección y anastomosis término-terminal (RAE/EPA)**
Indicada en estenosis cortas (< 2 cm en uretra bulbar) sin tejido fibroso extenso. Requiere movilización completa de la uretra del cuerpo esponjoso, corte a 45° de ambos cabos para ampliar el diámetro de la anastomosis y sutura continua o interrumpida con material absorbible monofilamento (PDS 4-0 ó 3-0). La técnica clásica transeccional secciona las arterias bulbouretrales; la técnica no transectante preserva la vascularización dorsal y es preferible en la uretra bulbar para reducir el impacto en la función eréctil.

**Uretroplastia de sustitución (sustitución uretral)**
Para estenosis largas (> 2-3 cm) o cuando la RAE generaría tensión inaceptable. Utiliza tejido adicional para ampliar o reemplazar el segmento uretral estenótico. Las opciones son:
- *Injerto onlay ventral o dorsal*: el injerto de mucosa bucal (o piel) se aplica sobre la placa uretral incidida longitudinalmente (técnica de Barbagli dorsal, Kulkarni lateral, Asopa dorsal transuretral).
- *Técnica de sustitución circunferencial tubular*: se usa cuando no hay placa uretral viable. Mayor riesgo de fístula y estenosis secundaria; debe evitarse.

**Uretroplastia en etapas**
Para estenosis complejas donde la reconstrucción en un tiempo es inviable: estenosis panuretral por LS, uretroplastias previas fallidas, piel peneana gravemente comprometida. La primera etapa crea una placa uretral abierta (Johanson) o injerta mucosa sobre los cuerpos cavernosos (Bracka). La segunda etapa, 6 meses después, tuburaliza el neoepitelio.

### Predictores de recurrencia
Los principales factores que predicen mayor riesgo de recurrencia post-uretroplastia son:
- **Etiología**: LS > traumática por fractura pélvica > iatrogénica > idiopática.
- **Longitud**: estenosis > 5 cm tienen mayor riesgo.
- **Espongiofibrosis**: grado ecográfico alto.
- **Cirugías previas**: cada uretroplastia previa aumenta la dificultad y el riesgo de la siguiente.
- **Localización**: uretra peneana > bulbar.
- **Campo irradiado**: el tejido irradiado no cicatriza normalmente.

### Selección de la técnica: algoritmo práctico

| Característica | Técnica sugerida |
|---|---|
| Estenosis bulbar < 2 cm, idiopática | RAE con o sin transección |
| Estenosis bulbar 2-5 cm | Uretroplastia dorsal con injerto BMG (Barbagli) |
| Estenosis peneana ≤ 3 cm | Onlay ventral o dorsal con BMG |
| Estenosis peneana > 3 cm, LS | Johanson etapa 1 + BMG etapa 2 |
| Estenosis panuretral | Etapas múltiples / uretrostomía perineal |
| Estenosis posterior corta | Anastomosis perineal (técnica de Webster) |
| Estenosis anastomótica VU | Endoscopía, luego onlay perineal o robótico |

## Suturas y materiales
El material de sutura para la anastomosis uretral debe ser monofilamento absorbible (polidioxanona PDS 3-0 ó 4-0 o poliglecaprone 25 monocryl 4-0). El PDS es más rígido, más fácil de manipular en profundidad y dura más tiempo antes de absorción (> 6 semanas). El monocryl es más suave y produce menos reacción tisular. Los multifilamentos absorbibles (Vicryl, Dexon) deben evitarse en la mucosa uretral por su mayor tendencia a generar litismo y calcificaciones periuretrales. Para el cierre de fascia (dartos, Buck) se usa Vicryl 2-0 ó 3-0.

## Errores frecuentes
- Suturar bajo tensión: si hay duda, movilizar más o cambiar de técnica.
- Usar sutura gruesa (3-0 o más gruesa) para la anastomosis mucosa: genera más reacción tisular y mayor riesgo de granulomas.
- No verificar con cistoscopio intraoperatorio que ambos extremos de la anastomosis tienen mucosa sana.

## Referencias
- Velarde L. 60 Tips. Tip 14: Suturas para uretroplastia.
- Martins FE. Textbook. Caps. 6-7: Principios de reconstrucción.
- Barbagli G et al. Dorsal onlay technique. Eur Urol. 2004.
$body$, 50, 0),

(v_mod, 'Posicionamiento quirúrgico e instrumental especializado', 'texto', $body$
## Objetivos de aprendizaje
Describir las posiciones quirúrgicas utilizadas en uretroplastia anterior y posterior, preparar correctamente el campo operatorio para cada abordaje y conocer el instrumental especializado de uso habitual en cirugía uretral reconstructiva.

## Desarrollo teórico

### Posición para uretroplastia perineal (posterior y bulbar)
La uretroplastia perineal requiere posición de litotomía alta (genupectoral modificada) para exponer el periné y acceder al bulbo uretral y la uretra membranosa. Los detalles técnicos son críticos:

- **Litotomía alta con "bump" sacro**: se coloca un almohadillado (gel pad o bolsa de arena) bajo el sacro del paciente para elevar el periné y mejorar la exposición profunda. Sin este detalle, el campo quirúrgico queda hundido y la disección de la uretra posterior es extremadamente difícil.
- **Soporte de piernas**: los portapiernas tipo Allen o Yellofin permiten una posición de abducción y flexión sin compresión excesiva de los compartimentos musculares. El síndrome compartimental de miembros inferiores es una complicación grave de la litotomía prolongada; verificar que no haya compresión del nervio peroneo y que el tiempo en posición no exceda 3-4 horas sin reposicionamiento.
- **El paciente no debe moverse**: la uretroplastia posterior puede durar 3-5 horas; una fijación cuidadosa a la mesa, con hombros asegurados por correas de Trendelenburg, previene el deslizamiento que puede lesionar el plexo braquial.
- **Incisión perineal media**: la incisión en línea media perineal desde la base del escroto hasta la unión anorrectal es el acceso estándar para la uretra bulbar y posterior. Algunas técnicas utilizan incisión en lambda (Λ) para ganar exposición lateral.

### Posición para uretroplastia penobulbar
Cuando la estenosis se extiende desde la uretra peneana al bulbo, se utiliza la posición de litotomía baja o posición de rana (decúbito dorsal con flexión de caderas y rodillas, piernas abducidas) con un roll bajo el periné. Permite el acceso simultáneo al pene y al periné. Alternativamente puede usarse posición de litotomía baja estándar.

### Preparación del campo operatorio
- Rasurado del vello púbico, escrotal y perineal (o tricotomía preoperatoria la noche anterior).
- Colocación de sonda vesical (o acceso suprapúbico si hay sonda preexistente) ANTES del inicio de la disección para guiar la identificación uretral.
- En uretroplastia posterior: el extremo distal puede identificarse inicialmente con el cistoscopio flexible iluminando desde adentro, lo cual facilita el primer tiempo de la disección.
- Preparación del sitio donador de mucosa bucal: el campo oral se prepara separadamente, con apertura del especulo oral y aplicación de antiséptico oral (clorhexidina diluida).

### Separador de Scott y retractores modulares
El separador de Scott (Lone Star retractor) es un sistema circular de retractores de elasticidad variable que se anclan al campo quirúrgico y retraen radialmente los bordes de la herida perineal. Sus ventajas:
- Libera al asistente de sostener los retractores manualmente.
- Permite una retracción multidireccional y suave.
- Los elastics ("elásticos") son de diferentes longitudes y tensiones, ajustables según la profundidad del campo.

La correcta colocación del Scott es un arte que requiere práctica: los elásticos deben insertarse con aguja en la dermis (no en músculo) a espacios regulares alrededor del campo, traccionando sin necrosar el tejido. Un campo bien retraído con el Scott convierte una uretroplastia posterior técnicamente difícil en un procedimiento ordenado y expuesto.

### Separador de Ravini y retractor de Teales Gorget
El separador de Ravini es un retractor perineal con geometría diseñada para acceder al bulbo uretral sin traumatizar el músculo bulbocavernoso. El retractor de Teales Gorget es una lámina metálica curva que protege la uretra posterior durante la disección profunda en busca del cabo proximal obliterado en la uretroplastia posterior traumática.

### Instrumental de otras especialidades
El Tip 10 del Club de la Uretra destaca que los dilatadores de Bakes (usados originalmente en cirugía biliar para dilatar el colédoco) son útiles en urología reconstructiva para calibrar el lumen uretral proximal durante uretroplastia posterior, especialmente cuando el cabo está obliterado. El histerómetro ginecológico es una sonda metálica graduada que facilita la identificación del cuello vesical desde arriba durante la disección perineal. El bisturí oftálmico con hoja #69 permite incisiones de precisión milimétrica en el meato y la fosa navicular.

### Consideraciones de campo en la cirugía oral (donador BMG)
La cosecha del injerto de mucosa bucal puede realizarse en la misma posición que la uretroplastia (con cabeza girada) o con una segunda mesa de trabajo independiente. Se recomienda:
- Separador de Jennings o de Lane para apertura oral.
- Luz frontal LED o lupas con luz integrada para visualización del donador.
- Marcaje previo con azul de metileno del tamaño del injerto.
- Infiltración con vasoconstrictor (adrenalina 1:200.000) para hemostasia.
- Hidrodisección con suero fisiológico bajo la mucosa para facilitar el levantamiento.

## Errores frecuentes
- Litotomía alta sin bump sacro: campo perineal inaccesible.
- Scott mal colocado con elásticos en músculo: necrosis muscular y campo tortuoso.
- No proteger el nervio peroneo durante la litotomía prolongada.
- Usar separadores demasiado violentos que traumatizan el esfínter y producen incontinencia postoperatoria.

## Referencias
- Velarde L. 60 Tips. Tips 6, 7, 8, 9, 15, 16, 19, 20.
- Martins FE. Textbook. Caps. 6-7: Instrumental y posicionamiento.
$body$, 40, 1);

-- ══════════════════════════════════════════════════════════════
-- MÓDULO 4: Biología y Técnica del Injerto de Mucosa Bucal
-- ══════════════════════════════════════════════════════════════
INSERT INTO public.modules (program_id, title, position)
VALUES (v_prog, 'Biología y Técnica del Injerto de Mucosa Bucal', 3)
RETURNING id INTO v_mod;

INSERT INTO public.lessons (module_id, title, kind, body, duration_min, position) VALUES
(v_mod, 'Biología regenerativa del injerto de mucosa bucal: por qué funciona', 'texto', $body$
## Objetivos de aprendizaje
Comprender las bases biológicas del injerto de mucosa bucal (BMG) como material ideal para la uretroplastia, conocer las fases de integración del injerto y los mecanismos moleculares que explican su comportamiento regenerativo superior al de otros tejidos.

## Desarrollo teórico

### Historia y adopción clínica
La primera uretroplastia con mucosa bucal fue descrita por K.M. Sapezhko en 1894. La adopción moderna comenzó en 1995, cuando Duckett, Coplen, Ewalt y Baskin describieron la técnica en detalle (J Urol 1995; Br J Urol 1995). Desde entonces, el BMG se ha convertido en el material de referencia para la uretroplastia de sustitución, aplicándose desde la pelvis renal hasta el meato uretral.

### Ventajas estructurales del BMG
Cuatro características anatómicas del BMG explican su comportamiento superior:

1. **Epitelio grueso**: el epitelio escamoso estratificado de la mejilla es mecánicamente resistente, fácil de manejar y suturar, y tolera el ambiente urinario húmedo mejor que la piel queratinizada.
2. **Lámina propia delgada**: la menor distancia entre la superficie epitelial y el lecho receptor reduce la distancia de difusión durante la fase de imbibición, favoreciendo la supervivencia inicial del injerto.
3. **Plexo subepitelial denso**: la mucosa bucal tiene una densidad capilar subepitelial 2-4 veces mayor que la piel, lo que acelera la neovascularización (inosculation) durante los primeros días.
4. **Riqueza en elastina epitelial**: confiere resiliencia mecánica al injerto, reduciendo la tendencia a la contracción cicatricial secundaria.

### Fases de integración del injerto
La supervivencia del injerto sigue una secuencia temporal precisa descrita por Duckett y Baskin:

**Fase 1 — Imbibición (0-48 horas)**: el injerto sobrevive absorbiendo pasivamente nutrientes del plasma exudado del lecho receptor, de forma similar al riego de una esponja. La lámina propia delgada del BMG es crucial en esta fase: menor distancia = mayor eficiencia de difusión. El lecho receptor debe ser bien vascularizado y libre de hematoma, infección o tejido necrótico.

**Fase 2 — Inosculation (48-96 horas)**: se establece la conexión directa vaso a vaso entre el lecho receptor y el plexo del injerto. La alta densidad capilar del BMG favorece que esta reconexión sea rápida y completa. A partir de este momento el injerto tiene su propio flujo sanguíneo.

**Fase 3 — Revascularización definitiva y remodelación (días 5-14)**: se establecen capilares permanentes y el injerto comienza su integración tisular completa.

### Biología molecular: por qué la mucosa bucal "regenera" en lugar de "reparar"
La diferencia fundamental entre la curación de la piel (reparación con cicatriz) y la curación de la mucosa bucal (regeneración sin cicatriz significativa) fue dilucidada por estudios de transcriptómica unicelular y transcriptómica espacial (single-cell y spatial transcriptomics):

**Colágeno**: la piel produce predominantemente colágeno tipo I (rígido, altamente entrecruzado) con elevada actividad de lisil oxidasa y decorina (drivers de fibrosis). La mucosa bucal produce predominantemente colágeno tipo III (pliable) con alta actividad MMP (metaloproteasa), ácido hialurónico abundante y baja lisil oxidasa, creando un microambiente pre-regenerativo que limita la fibrosis.

**Macrófagos**: el macrófago M1 (antiinflamatorio, pro-resolución) domina en la mucosa bucal (índice de polarización mediano +0,52). El macrófago M2 (proinflamatorio, pro-fibrótico) domina en la uretra (índice -0,55). Esto explica por qué la uretra tiene una tendencia basal a la fibrosis, incluso antes de cualquier lesión.

**Linfocitos T**: en la mucosa bucal, los linfocitos T están activados y funcionalmente vigilantes. En la uretra, los T están "exhaustos" (fenotipo de agotamiento), lo que reduce la respuesta adaptativa frente a lesiones o infecciones.

**Señalización estromal-epitelial**: la uretra tiene una señalización estromal-epitelial 4 veces más intensa que la mucosa bucal (probabilidades de señalización de colágeno de 0,80-0,93 hacia el epitelio), lo que crea una conversación pro-colágeno basal que predispone a la fibrosis. La mucosa bucal tiene una señalización estromal "silenciosa", contenida dentro del estroma.

**Células madre (p75+)**: en la mucosa bucal, las células progenitoras p75NGFR+ migran primero al borde de la herida y proliferan después del cierre, optimizando la eficiencia de la reparación. Este modelo "migrar primero, proliferar después" conserva la capacidad proliferativa para la regeneración final.

### Vía molecular de regeneración
Las principales vías que habilitan la regeneración de la mucosa bucal son:
- **PI3K/Akt**: supervivencia y migración de queratinocitos (anti-apoptótico).
- **JAK/STAT vía leptina salival**: la leptina es constitutivamente expresada en saliva; activa STAT3, lo que promueve re-epitelización, neovascularización y frena la fibrosis.
- **Ras/MAPK**: proliferación de queratinocitos y fibroblastos.
- **TGF-β/SMAD**: regulada negativamente por subpoblaciones fibro-específicas, lo que suprime la formación de cicatriz.
- **Wnt/β-catenina**: mantiene las células madre en el estrato basal.

### Implicaciones clínicas
El cirujano reconstructivo debe entender que el éxito del BMG no es solo estructural sino biológico: el injerto lleva consigo un programa molecular anti-fibrótico que el receptor uretral por sí solo no posee. Esto justifica:
1. No usar BMG en lecho receptor no vascularizado (hematoma, tejido necrótico, infección activa).
2. Preferir el onlay (injerto sobre placa uretral incidida) al tubo circular (reemplazos circunferenciales), donde el lecho receptor es insuficiente.
3. Investigar alternativas al BMG solo cuando el sitio donador está agotado o contraindicado.

## Errores frecuentes
- Colocar BMG sobre lecho con coágulo o tejido desvitalizado: fracaso seguro por no alcanzar la fase de inosculation.
- Utilizar BMG tubular (injerto circunferencial completo) sin placa uretral dorsal de soporte.
- Subestimar el sitio donador oral: el Tip 18 del Club de la Uretra establece que la mucosa de mejilla es preferible a la de labio inferior y lengua por ser más gruesa, más abundante y menos propensa a retracción cicatricial.

## Referencias
- AUA 2026: Buccal Mucosa Grafts in Urologic Reconstruction and Regenerative Biology.
- Duckett JW et al. Buccal mucosal urethral replacement. J Urol. 1995.
- Velarde L. 60 Tips. Tips 17, 18.
- Sapezhko KM. Urethroplasty with buccal mucosa. 1894.
$body$, 55, 0),

(v_mod, 'Técnica de cosecha, preparación e implantación del injerto de mucosa oral', 'texto', $body$
## Objetivos de aprendizaje
Realizar correctamente la cosecha del injerto de mucosa bucal, preparar el injerto en la mesa de trabajo y conocer las técnicas de posicionamiento e implantación dorsal y ventral en la uretroplastia anterior.

## Desarrollo teórico

### Sitios donadores: elección y comparación
Los sitios donadores de mucosa oral son: mejilla (mucosa bucal propiamente tal), labio inferior, lengua ventral y encía (menos usada por riesgo de lesión periodontal). La mucosa de mejilla es el sitio preferido por:
- Mayor superficie disponible (hasta 5 × 2 cm por mejilla, bilateralmente = hasta 20 cm de injerto posible).
- Epitelio más grueso y resistente.
- Menor morbilidad en el sitio donador que la lengua.
- Más fácil acceso y cierre.

El labio inferior puede cosecharse cuando se necesitan injertos cortos (< 3 cm), pero la cicatriz visible y la posible alteración sensitiva limitan su uso. La lengua ventral es una alternativa válida para injertos largos pero con mayor morbilidad: hematoma sublingual, alteración transitoria del gusto y del movimiento lingual.

Un estudio prospectivo aleatorizado del AUA 2026 (datos presentados en portugués) confirmó que la fuente de injerto (mejilla vs. labio) NO altera el resultado de la uretroplastia: la eficacia es equivalente. La selección debe basarse en disponibilidad de tejido y morbilidad del donador, no en expectativas de resultado.

### Técnica de cosecha de mucosa bucal

**Preparación del paciente**:
1. Colutorio antiséptico oral (clorhexidina 0,12% sin alcohol) la noche antes y la mañana de la cirugía.
2. Apertura de la cavidad oral con separador de Jennings (o Lane en niños).
3. Identificación del conducto de Stensen (conducto parotídeo, sale a nivel del 2do molar superior): no incluirlo en el injerto.
4. Infiltración submucosa con lidocaína + adrenalina 1:200.000 (hidrodisección): separa la mucosa de la fascia buccinadora y reduce el sangrado.

Un estudio del AUA 2026 demostró que el momento de la infiltración (antes o después de la cosecha) y el agente anestésico (bupivacaína vs. lidocaína con adrenalina) no alteran significativamente el dolor postoperatorio: la decisión puede basarse en la preferencia del cirujano y la logística quirúrgica.

**Marcaje y cosecha**:
1. Marcar con azul de metileno el rectángulo de mucosa a cosechar: generalmente 4-6 cm de largo × 1,5-2 cm de ancho.
2. Incisión perimetral con bisturí #15 o tijera de Metzenbaum.
3. Disección con tijera en el plano submucoso (entre mucosa y músculo buccinador), manteniendo la lámina propia fina.
4. Hemostasia cuidadosa del lecho con electrocoagulación bipolar (no monopolar, que puede lesionar el conducto de Stensen).
5. Cierre del defecto: la pregunta "¿cerrar o no cerrar?" (Tip 21) tiene respuesta basada en evidencia: el cierre primario reduce el sangrado postoperatorio y la morbilidad del donador. Se utiliza Vicryl 3-0 con sutura continua.

### Preparación del injerto en la mesa de trabajo (Tip 19)
Una vez cosechado, el injerto se pasa al equipo de la mesa de trabajo:
1. Desgrasado: remover con tijera fina todo el tejido adiposo de la cara profunda del injerto hasta visualizar la lámina propia transparente. Un injerto "gordo" no toma por dificultad en la fase de imbibición.
2. Fenestraje (Tip 25): realizar pequeñas incisiones (fenestras) de 3-5 mm a través del injerto con bisturí o tijera. Las fenestras permiten el drenaje del suero acumulado entre el injerto y el lecho receptor, favoreciendo el contacto íntimo y la imbibición. También "expanden" el injerto hasta un 20% de su tamaño original.
3. Calibración: medir el ancho y la longitud del injerto procesado. Generalmente se necesita un injerto de 1,5-2 cm de ancho para obtener una uretra de 22-24 Fr de calibre tras el onlay.
4. Mantener en suero fisiológico templado hasta el momento de la implantación.

### Técnica de capitonaje (Tip 24)
El capitonaje es la fijación del injerto al lecho receptor mediante suturas transfixiantes que lo "quiltean" (del inglés "quilt"). Es especialmente importante en los injertos dorsales (técnica de Barbagli) donde el injerto se aplica sobre los cuerpos cavernosos:
1. El injerto se fija lateralmente a ambos bordes de la incisión uretral con puntos separados de PDS 4-0.
2. Las suturas de capitonaje atraviesan el injerto de lado a lado y se anudan sobre los cuerpos cavernosos, asegurando el contacto íntimo entre el injerto y el lecho.
3. El número de suturas de capitonaje debe ser suficiente para eliminar cualquier espacio muerto: en injertos de 5 cm se colocan habitualmente 4-6 puntos de capitonaje.

### Posición del injerto: dorsal vs. ventral (Tip 23)
- **Injerto dorsal (técnica de Barbagli)**: el injerto se aplica sobre los cuerpos cavernosos en la cara dorsal de la uretra. Requiere rotación de la uretra 180° hacia ventral para exponer el dorso. El lecho receptor son los cuerpos cavernosos, bien vascularizados. Ventaja: lecho vascular excelente. Desventaja: rotación uretral técnicamente exigente en uretra bulbar profunda.
- **Injerto ventral (técnica clásica de Orandi)**: el injerto se aplica sobre la cara ventral incidida de la uretra. Técnicamente más sencillo. Lecho receptor: tejido periuretral y músculo bulbocavernoso. Menos favorable en uretra bulbar proximal donde el tejido periuretral puede ser menos vascularizado.
- **Injerto lateral (técnica de Kulkarni)**: compromiso entre dorsal y ventral, con acceso lateral para la uretra bulbar sin necesidad de rotación completa.

El estudio del AUA 2026 sobre uretra femenina (que aplica principios análogos) confirma que posición dorsal y ventral tienen eficacia equivalente; la elección debe basarse en la anatomía local y la preferencia del cirujano.

### Protocolo para enxerto caído (Tip 3 / Estudio AUA 2026 Porto)
Un estudio validó el siguiente protocolo de descontaminación para injertos caídos accidentalmente al piso del quirófano: si el tiempo de exposición es < 3 minutos, el injerto puede recuperarse y lavarse con clorhexidina acuosa al 2%, sin necesidad de cosechar uno nuevo. Este protocolo no se asoció a mayor tasa de infección postoperatoria en la cohorte estudiada. La clorhexidina al 2% elimina la contaminación bacteriana del piso sin dañar el epitelio del injerto.

## Errores frecuentes
- No desengrassar el injerto: la grasa interpuesta impide la imbibición.
- No fenestar el injerto: acumulación de suero bajo el injerto = seroma = fracaso.
- Capitonaje insuficiente en injerto dorsal: el injerto se despega durante las primeras horas.
- Suturar el injerto bajo tensión: la contracción cicatricial secundaria estira un injerto ya tenso y produce estenosis recurrente.

## Referencias
- Velarde L. 60 Tips. Tips 18, 19, 20, 21, 23, 24, 25.
- AUA 2026: equivalencia de agentes anestésicos en cosecha de BMG.
- AUA 2026: protocolo validado para injerto caído.
- Barbagli G et al. Dorsal onlay technique. Eur Urol. 2004.
- Kulkarni SB et al. Single-stage dorsal BMG. J Urol. 2009.
$body$, 55, 1),

(v_mod, 'Injertos de piel, colgajos y materiales alternativos', 'texto', $body$
## Objetivos de aprendizaje
Conocer las características de los injertos de piel prepucial y escrotal, las indicaciones y técnica de los colgajos pediculados en uretroplastia anterior y los materiales sintéticos en investigación clínica.

## Desarrollo teórico

### Injerto de piel (Tip 22)
Antes del BMG, la piel del prepucio y escrotal fue el material estándar para uretroplastia de sustitución. Hoy su uso ha disminuido dramáticamente pero persiste en indicaciones específicas:
- **Piel prepucial**: epitelio escamoso no queratinizado, húmedo, delgado. Su uso es preferente cuando hay prepucio disponible (pacientes no circuncidados). Desventajas: tendencia a la contracción, reacción inflamatoria mayor que el BMG, posibilidad de portación de VPH intraluminal. No usar en pacientes con LS (el LS afecta la piel genital).
- **Piel de escroto**: vascularizada, disponible en grandes superficies. Alto riesgo de inclusión de folículos pilosos → pelos intraluminales → litiasis uretral. NUNCA usar para tubularización uretral. Reservada para cobertura cutánea, no para mucosa uretral.

### Colgajos pediculados (Tip 26 y 27)

**Concepto**: a diferencia del injerto libre (sin pedículo vascular), el colgajo conserva su irrigación propia a través de un pedículo. Esto lo hace más resistente en lechos receptores pobremente vascularizados (pacientes irradiados, post-infección).

**Colgajo de dartos**: el tejido subcutáneo escrotal y peneano (dartos) es una red vascular fascia-muscular. Un colgajo de dartos puede ser utilizado para:
1. Vascularizar un injerto de piel o mucosa (colgajo de dartos como lecho vascularizado).
2. Como capa de cobertura interpuesta entre la uretra y la piel en reparaciones de fístulas.
3. Como fuente de tejido para la uretroplastia peneana (colgajo de piel peneana tubularizada, técnica de McAninch).

**Colgajo de Orandi**: colgajo longitudinal de piel peneana pediculado en el rafe peneano ventral. Utilizado para estenosis peneanas largas. La técnica requiere piel peneana sana (no afectada por LS) y suficiente longitud.

**Colgajo de Quartey**: colgajo circular de piel peneana ("island flap") con pedículo de dartos. Mayor versatilidad que Orandi pero técnicamente más complejo.

**Colgajo de Martius**: colgajo pediculado de tejido adiposo y fascia de los labios mayores, utilizado en reconstrucción de fístulas uretrales femeninas complejas o como refuerzo en campo irradiado. Aportado por la arteria pudenda interna, tiene excelente vascularización y tolerancia a ambientes infectados o irradiados.

### Materiales alternativos en investigación

**PTFE (politetrafluoroetileno / Gore-Tex)**: un estudio presentado en el AUA 2026 evaluó PTFE como injerto de rescate en uretroplastia cuando la mucosa oral está agotada o contraindicada. Los resultados a 6 meses mostraron mejoría de Qmax y puntuación sintomática, pero el seguimiento es insuficiente para conclusiones definitivas: los autores reconocen que los resultados a corto plazo no validan la técnica como estándar; se requiere seguimiento de al menos 2-3 años antes de recomendar su adopción. El PTFE es un material no biodegradable que puede calcificarse y producir cuerpo extraño intraluminal a largo plazo.

**Biomateriales basados en matriz extracelular (MEC)**: matrices acelulares de submucosa de intestino delgado (SIS), vejiga (BAM) y peritoneo han sido investigados como andamiajes para la regeneración uretral. Los resultados en modelos animales son prometedores, pero la traducción clínica ha sido inconsistente. La tendencia actual es combinar matrices acelulares con células madre o keratinocitos autólogos sembrados para mejorar la integración.

**Injertos líquidos ("liquid grafts")**: concepto emergente presentado en el AUA 2026 que reimagina el BMG desde un "papeles pintados" (injerto sólido) hacia una "pintura en spray" (células dispersas). La mucosa bucal contiene células madre basales p75NGFR+ de alta capacidad proliferativa. Al dispersar estas células en una solución suspensora y "sembrarlas" en el defecto uretral (en lugar de aplicar un injerto sólido), se recrean las condiciones para la regeneración sin necesidad de cosecha de gran superficie. Un modelo de conejo validó que la siembra de microinjertos de mucosa bucal generó epitelio de tipo bucal en la uretra del animal; los controles desarrollaron fibrosis. Un ensayo clínico fase 1 con 10 pacientes está en curso con resultados preliminares prometedores.

### Selección práctica del material de injerto
| Situación | Material preferido |
|---|---|
| Primera uretroplastia, mucosa oral disponible | BMG de mejilla |
| Sitio donador oral agotado (múltiples BMG) | BMG de labio/lengua, o piel prepucial (si no LS) |
| Paciente irradiado, lecho pobre | Colgajo vascularizado de dartos o Martius |
| LS con piel genital afectada | Exclusivamente BMG (no piel genital) |
| Fístula uretrocutánea | Colgajo de dartos interpuesto |

## Errores frecuentes
- Usar piel escrotal para la mucosa uretral: pelos intraluminales y litiasis.
- Usar piel genital en un paciente con LS: el LS activo destruirá el injerto.
- Confundir colgajo (con pedículo vascular) con injerto libre (sin pedículo): no intercambiables en indicación.

## Referencias
- Velarde L. 60 Tips. Tips 22, 26, 27.
- AUA 2026: PTFE como enxerto de resgate. Estudio multicéntrico.
- AUA 2026: Urethroplasty Evolution and Future — liquid grafts.
- Martins FE. Textbook. Cap. 7: Transferencia de tejido.
$body$, 45, 2);

END;
$SEED$;

-- (El archivo continúa — módulos 5-12 en bloque separado)
-- Ver seed_diplomado_modulos5_12.sql
