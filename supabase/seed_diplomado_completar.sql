-- ============================================================
-- Seed: Diplomado de Cirugía Reconstructiva Uretral
-- LECCIONES FALTANTES — Módulos 6, 9, 10 y 11
-- Ejecutar DESPUÉS de seed_diplomado_completo.sql
--                 Y  seed_diplomado_modulos5_12.sql
-- Fuente adicional: Libro de la Uretra (síntesis de evidencia y
--   trabajos hito), Martins 2020, AUA 2026, 60 Tips Club de la Uretra
-- ============================================================

DO $SEED3$
DECLARE
  v_prog uuid;
  v_mod  uuid;
BEGIN

SELECT id INTO v_prog FROM public.programs
WHERE slug = 'diplomado-reconstructiva-uretral';
IF v_prog IS NULL THEN
  RAISE EXCEPTION 'Programa no encontrado. Ejecutar los seeds anteriores primero.';
END IF;

-- ══════════════════════════════════════════════════════════════
-- MÓDULO 6 — Lección 3: Estenosis panuretral
-- ══════════════════════════════════════════════════════════════
SELECT id INTO v_mod FROM public.modules
WHERE program_id = v_prog AND position = 5;

INSERT INTO public.lessons (module_id, title, kind, body, duration_min, position) VALUES
(v_mod, 'Estenosis panuretral: estrategia, manejo y dilatación/DVIU como primera línea', 'texto', $body$
## Objetivos de aprendizaje
Definir la estenosis panuretral y sus implicaciones técnicas, conocer las estrategias quirúrgicas disponibles y comprender el rol (y los límites) del manejo endoscópico de primera línea en estenosis favorables antes de escalar a la reconstrucción.

## Desarrollo teórico

### Definición y contexto
La estenosis panuretral involucra la totalidad o la mayor parte de la uretra anterior (bulbar + peneana ± fosa navicular), con longitud habitualmente > 8-10 cm. Es la presentación más desafiante de la estenosis uretral anterior y, por definición, una estenosis "desfavorable": el manejo endoscópico tiene escasa eficacia y las recidivas son la regla.

Las etiologías más frecuentes de estenosis panuretral son:
- **Liquen escleroso (LS)**: causa número uno. La progresión proximal desde el glande puede afectar la totalidad de la uretra anterior en años.
- **Múltiples uretroplastias previas fallidas**: el tejido cicatricial acumulado puede comprometer toda la longitud.
- **Infecciones de transmisión sexual** (gonorrea): clásicamente produce estenosis largas, irregulares y panuretrales, aunque hoy es menos frecuente en países desarrollados.
- **Traumatismo extenso**: quemaduras perineales o peneanas.
- **Hipospadias complejo del adulto**: la sutura de cierre de una reparación de hipospadias extensa puede fibrosarse en toda su longitud.

### Manejo endoscópico: cuándo y hasta dónde

**Dilatación uretral**:
La dilatación es el procedimiento más antiguo (descrito en medicina egipcia, hindú y griega). Su mecanismo es estirar sin cortar, idealmente sin desgarrar el cuerpo esponjoso. En estenosis favorables (bulbar, corta, primer episodio), tiene una tasa de éxito razonable a corto plazo. El Libro de la Uretra (síntesis basada en Steenkamp et al., J Urol 1997) reporta:
- Estenosis < 2 cm: ~40% de recurrencia a 12 meses.
- Estenosis 2-4 cm: ~50-75% de recurrencia a 12-48 meses.
- Estenosis > 4 cm: ~80% de recurrencia.

Para la estenosis panuretral (por definición > 4 cm), la dilatación aislada tiene una tasa de fracaso de ~80%, lo que la convierte en una medida paliativa temporal, nunca curativa.

**DVIU (Uretrotomía interna bajo visión directa)**:
El uretrótomo de cuchillo frío de Sachse (1974) con ~80% de éxito inicial reportado fue el origen del entusiasmo por la DVIU. La realidad a largo plazo, documentada por Pansadoro & Emiliozzi (J Urol 1996) y confirmada dramáticamente por Santucci & Eisenberg (J Urol 2010), es muy diferente: tasa libre de estenosis tras la 1ª, 2ª y 3ª DVIU de solo 8%, 6% y 9%; 0% para la 4ª y 5ª.

Para la estenosis panuretral, la DVIU no tiene indicación como tratamiento definitivo. Como medida temporal (desobstruir para drenaje o para mejorar el estado del paciente antes de la cirugía definitiva), puede ser útil en casos seleccionados.

**Regla de oro del manejo endoscópico**: un solo intento endoscópico (dilatación o DVIU) puede ser razonable en estenosis favorables como primera línea. Más de un intento es contraproducente: cada instrumentación aumenta la fibrosis periuretral, convierte una estenosis simple en compleja y compromete la futura uretroplastia.

Los datos de Horiguchi et al. (J Urol 2018, PMID 28866464) son contundentes: los tratamientos transuretrales repetidos aumentan la complejidad de la estenosis al momento de la uretroplastia, incluso un único stent temporal puede complicarla. Viers et al. (J Urol 2018) documentaron que el retraso de la reconstrucción se asocia a estenosis más largas, más intervenciones y reparaciones más complejas.

El concepto de "urethral rest" (reposo uretral): evitar toda instrumentación antes de la reconstrucción definitiva tiene sustento histológico (World J Urol 2024): mayor metaplasia escamosa asociada a demora e instrumentación previa, comprometiendo la calidad del tejido receptor.

### Estrategias quirúrgicas para la estenosis panuretral

**Técnica de Kulkarni "one-sided" extendida**:
Desarrollada por Kulkarni, Barbagli, Sansalone y Lazzeri (BJU Int 2009), la técnica de onlay lateral unilateral fue diseñada específicamente para minimizar la disección y preservar la vascularización en estenosis largas. Al acceder por un solo lado del cuerpo esponjoso (sin rotación de 180° ni disección bilateral), se reduce la devascularización y el riesgo de disfunción eréctil. Warner et al. (Urology 2015) evaluaron multi-institucionalmente el manejo de estenosis de segmento largo con esta técnica, reportando resultados favorables.

**Uretroplastia en etapas para LS panuretral**:
La estenosis panuretral por LS requiere invariablemente cirugía en etapas:
- Primera etapa (Johanson o Bracka): apertura completa de toda la uretra comprometida, reemplazando el epitelio afectado por mucosa bucal o dejando el lecho para madurar.
- Segunda etapa (tubularización): 6 meses después, cuando el lecho está estable y libre de LS activo.
- En casos extremos puede requerirse una tercera etapa.

**Uretrostomía perineal como alternativa definitiva**:
Cuando la estenosis panuretral por LS es tan extensa que hace imposible una reconstrucción durable, la uretrostomía perineal (técnica de Blandy) es una alternativa con alta satisfacción del paciente (mediana ICIQ-Satisfacción 21/24, J Urol 2024). No es una "derrota" sino una solución válida y bien tolerada cuando se comunica y elige correctamente.

### Clasificación "favorable vs desfavorable": relevancia práctica
El Libro de la Uretra establece que la clasificación en estenosis "favorable" (bulbar, única, < 3 cm, primer episodio, no LS, no hipospadias) vs "desfavorable" (panuretral, LS, hipospadias, múltiples episodios, larga) no es semántica: define si la endoscopía es razonable o si hay que ir directo a reconstrucción. La estenosis panuretral es, por definición, desfavorable. No tiene sentido ofrecer DVIU repetidas a este paciente.

### Estenosis panuretral + HBP concomitante
Un escenario clínico especialmente complejo es el del paciente mayor con estenosis panuretral + hiperplasia benigna de próstata (HBP). Datos de Saavedra (SChU 2025) y del Libro de la Uretra establecen la regla: "primero manda la estrechez". Si el calibre es < 16 Fr, la estenosis domina y debe corregirse antes o simultáneamente con la HBP; no tiene sentido realizar una RTU de próstata si la uretra no permite el pasaje del resectoscopio.

## Perlas clínicas
- El paciente con estenosis panuretral que llega "con tres DVIU en el último año" tiene peor pronóstico quirúrgico que el que llegó sin instrumentar. Documentar el número y tipo de procedimientos previos es parte obligatoria de la historia.
- En LS panuretral, obtener siempre biopsia para confirmar el diagnóstico histológico antes de la cirugía definitiva.
- La uretrostomía perineal tiene mayor aceptación de la que los cirujanos creen: el paciente que entiende bien la opción frecuentemente la prefiere a una cadena de cirugías complejas.

## Errores frecuentes
- Repetir DVIU ante estenosis panuretral esperando que "algo cambie": cada intento empeora el terreno.
- No derivar oportunamente al cirujano reconstructivo: el "urethral rest" es terapéutico.
- Realizar RTU de próstata forzando el pasaje del resectoscopio en una estenosis panuretral: produce desgarros uretrales y estenosis aún más complejas.

## Referencias
- Sachse H. Fortschr Med. 1974;92:12.
- Santucci RA, Eisenberg L. J Urol. 2010;183:1859-62. PMID 20303102.
- Horiguchi A et al. J Urol. 2018;199:508-14. PMID 28866464.
- Viers BR et al. J Urol. 2018;199:515-521.
- Kulkarni S, Barbagli G et al. BJU Int. 2009;104:1150-5.
- Warner JN et al. Urology. 2015;85:1483-7.
- Libro de la Uretra. Capítulos 3, 6, 7, 11. 2024-2025.
- Velarde L. 60 Tips. Tips 44, 45.
$body$, 50, 2);

-- ══════════════════════════════════════════════════════════════
-- MÓDULO 9 — Lecciones 2 y 3: EUA técnica + Implante simultáneo
-- ══════════════════════════════════════════════════════════════
SELECT id INTO v_mod FROM public.modules
WHERE program_id = v_prog AND position = 8;

INSERT INTO public.lessons (module_id, title, kind, body, duration_min, position) VALUES
(v_mod, 'Técnica quirúrgica del esfínter urinario artificial: implante, revisión y complicaciones', 'texto', $body$
## Objetivos de aprendizaje
Describir paso a paso la técnica de implante del esfínter urinario artificial (EUA) AMS 800 en posición bulbar estándar, conocer las variantes técnicas para posiciones alternativas (cuello vesical, periprostático), identificar las complicaciones del dispositivo y manejar las principales indicaciones de revisión.

## Desarrollo teórico

### El dispositivo AMS 800
El esfínter urinario artificial AMS 800 (Boston Scientific) es el gold standard del tratamiento quirúrgico de la incontinencia urinaria de esfuerzo severa masculina. Introducido en 1972, su diseño básico no ha cambiado sustancialmente: consta de tres componentes conectados por tubing de silicón:
1. **Manguito (cuff)**: rodea la uretra bulbar y la comprime cuando está lleno. Disponible en anchos de 3,5 a 5,5 cm en incrementos de 0,5 cm; el más usado es el de 4,0-4,5 cm.
2. **Balón regulador de presión (pressure regulating balloon, PRB)**: reservorio de suero en el espacio de Retzius que mantiene la presión de cierre. Disponibles en 61-70 cmH₂O (estándar), 71-80 y 51-60.
3. **Bomba de control**: implantada en el escroto, permite al paciente activar/desactivar el dispositivo para la micción.

### Indicaciones
- IUE post-prostatectomía radical moderada a severa (> 3 pads/día o impacto significativo en la calidad de vida).
- IUE post-irradiación pélvica.
- IUE neurogénica (vejiga neurógena).
- Fracaso del cabestrillo masculino previo.
- IUE severa de cualquier causa no mejorada con fisioterapia de suelo pélvico.

### Técnica de implante en posición bulbar

**Preparación preoperatoria**:
- Urocultivo negativo o tratado previamente.
- Profilaxis antibiótica: vancomicina + gentamicina (cobertura gram-positiva y gram-negativa).
- Rasurado del periné, escroto y zona suprapúbica.
- Cistoscopía preoperatoria para descartar VUAS concomitante.

**Posición**: litotomía baja o posición de rana (decúbito dorsal con flexión de caderas).

**Acceso perineal**:
1. Incisión perineal media de 3-4 cm a nivel del bulbo uretral.
2. División del músculo bulbocavernoso en la línea media.
3. Disección circunferencial del cuerpo esponjoso en el bulbo hasta obtener 360° de exposición limpia. Esta es la maniobra crítica: el manguito debe rodear el esponjoso sin tensión y sin lesionar las estructuras vasculares.
4. Medición del perímetro del cuerpo esponjoso con el medidor específico para seleccionar el tamaño del manguito (habitualmente 4,0-4,5 cm).
5. Colocación del manguito alrededor del cuerpo esponjoso. El tubing del manguito debe salir en posición lateral (no ventral ni dorsal).

**Colocación del PRB**:
1. Incisión inguinal baja izquierda (o suprapúbica).
2. Acceso al espacio de Retzius preperitoneal.
3. El PRB (61-70 cmH₂O estándar en no irradiados; algunos prefieren 51-60 en irradiados para reducir el riesgo de erosión) se coloca en el espacio prevesical.

**Implante de la bomba escrotal**:
1. Extensión de la incisión perineal o incisión escrotal separada.
2. La bomba se coloca en el hemiescroto de elección del paciente (habitualmente el derecho). Debe ser fácilmente palpable y maniobrable.

**Conexión del sistema**:
El tubing de manguito y PRB se conectan a la bomba con los conectores específicos. El sistema se llena con suero salino yodado. Se verifica la funcionalidad (ciclos de activación/desactivación).

**Desactivación postoperatoria**:
El dispositivo se deja desactivado (manguito abierto) durante 4-6 semanas para permitir la cicatrización tisular sin presión sobre la uretra. La activación se realiza en el primer control postoperatorio.

### Posiciones alternativas del manguito

**Cuello vesical**: indicado cuando la uretra bulbar es inadecuada (múltiples revisiones previas, fibrosis extensa, UP previa). Requiere acceso retropúbico o suprapúbico. Mayor complejidad técnica y mayor tasa de complicaciones.

**Transcorporal (TC cuff)**: el manguito se coloca alrededor del cuerpo cavernoso en lugar del esponjoso, útil cuando el esponjoso está muy atrófico. Reduce el riesgo de erosión por menor presión sobre mucosa adelgazada.

**Manguito en tándem (tandem cuff)**: dos manguitos en posición proximal y distal para pacientes con incontinencia severa o con fallo del manguito único. Utilizado preferentemente en pacientes irradiados.

### Complicaciones y revisiones

**Erosión (3-10%)**:
El manguito erosiona la uretra: el paciente refiere disuria, sangre en meato, y la cistoscopía muestra el manguito intraluminal. Tratamiento: explante del manguito con o sin sustitución diferida.

**Infección (2-5%)**:
Infección del dispositivo: generalmente por estafilococo coagulasa negativo. Tratamiento: explante completo del sistema. La reimplantación se difiere 3-6 meses.

**Atrofia uretral (20-30% a largo plazo)**:
La presión crónica del manguito produce atrofia del esponjoso y reducción del diámetro uretral, resultando en incontinencia recurrente sin erosión visible. Tratamiento: revisión para manguito de menor tamaño o en posición diferente.

**Fallo mecánico (< 5% a 5 años)**:
Ruptura del tubing, fuga de líquido o bomba disfuncional. Tratamiento: revisión del componente fallado.

**Tasa de revisiones**: el AUS AMS 800 tiene una tasa acumulada de revisiones de ~25% a 5 años. Esto no es un fracaso del dispositivo: las revisiones son manejables y conocidas, y el dispositivo puede reemplazarse o reposicionarse con alta tasa de éxito.

### Consideraciones especiales en el paciente irradiado
En el paciente irradiado (radio-prostatectomía o solo radioterapia):
- Usar PRB de menor presión (51-60 cmH₂O) para reducir erosión.
- Manguito transcorporal si el esponjoso está muy fibrótico.
- Tasa de complicaciones y revisiones mayor que en no irradiados.
- La AUA 2024 guía recomienda EUA sobre cabestrillos en este grupo (Recomendación Moderada, Evidencia C).

### Función y calidad de vida postimplante
La activación/desactivación manual por el paciente requiere destreza manual adecuada. En pacientes con dificultad motora (artritis severa, parkinson, accidente cerebrovascular), el AUS convencional puede ser impractical → candidatos a dispositivos activados eléctricamente (en investigación, con primer implante humano en EEUU en octubre 2025 según AUA 2026).

## Errores frecuentes
- No verificar calibre uretral adecuado antes del implante: un manguito demasiado pequeño erosionará.
- Dejar el sistema activado en el postoperatorio inmediato: isquemia del esponjoso por presión sobre mucosa edematosa.
- No descartar VUAS antes del implante: el EUA no funciona si hay obstrucción proximal.

## Referencias
- AUA 2026: AUS Preference for Male SUI Post-Radiotherapy (Divya Ajay, MSKCC).
- AUA/GURS/SUFU Guideline. Incontinence After Prostate Treatment. 2024.
- Martins FE. Textbook. Caps. 26, 33.
$body$, 55, 1),

(v_mod, 'Implante simultáneo AUS + prótesis peneana y consideraciones en el paciente complejo', 'texto', $body$
## Objetivos de aprendizaje
Conocer la evidencia que sustenta la cirugía síncrona de EUA + prótesis inflable de pene (IPP), entender las razones económicas que desincentivan este abordaje en EEUU y conocer el manejo del paciente complejo con incontinencia + disfunción eréctil severa.

## Desarrollo teórico

### El problema clínico
Un 25-30% de los pacientes que requieren EUA por IUE post-prostatectomía también tiene disfunción eréctil (DE) severa que justifica el implante de prótesis inflable de pene (IPP). Tradicionalmente estos procedimientos se realizan en etapas separadas por el temor a mayor tasa de infección e interacción entre dispositivos. Sin embargo, la cirugía simultánea (síncrona) elimina una segunda anestesia general, un segundo ingreso hospitalario y un período adicional de recuperación.

### La evidencia clínica: equivalencia

Una revisión sistemática de 2022 (incluida en el análisis presentado en el AUA 2026) con más de 16.000 pacientes comparó la cirugía escalonada vs. la cirugía síncrona de AUS + IPP:
- **Tasa de complicaciones a 30 y 90 días**: sin diferencia estadísticamente significativa.
- **Tasa de reoperación**: sin diferencia.
- **Satisfacción del paciente**: significativamente **mayor** en el grupo síncrono.

La conclusión clínica es clara: la cirugía síncrona es segura, eficaz y preferida por los pacientes. Debería ser la opción estándar para el paciente con DE severa e IUE severa concomitante.

### La paradoja económica: por qué casi nadie lo hace

A pesar de la evidencia que respalda la cirugía síncrona, en un estudio de 38.000 hombres en EEUU, más del 98% de los implantes se realizaron de forma escalonada. El motivo no es clínico sino económico:

El sistema de reembolso Medicare de EEUU aplica una reducción del 50% en la tarifa del segundo procedimiento cuando dos cirugías se realizan bajo la misma anestesia. En términos concretos:
- **Entorno hospitalario**: cirugía escalonada ~$42.000 de reembolso; cirugía síncrona ~$31.000 (-$11.000 que no se recuperan con el ahorro operativo).
- **Centro de cirugía ambulatoria (ASC)**: cirugía escalonada ~$36.000; síncrona ~$27.000, haciendo el procedimiento financieramente inviable para el centro.

Este desincentivo estructural del sistema de reembolso veta la opción clínicamente superior por razones puramente financieras. El ponente del AUA 2026 lo calificó como "la evidencia clínica siendo anulada por un mecanismo regulatorio que no tiene nada que ver con la salud del paciente".

### Candidatos ideales para cirugía síncrona

Cuando la cirugía síncrona es factible (centro que asume el costo o sistema de salud que no aplica la reducción), los candidatos ideales son:
- Paciente con IUE severa + DE severa, donde ambas condiciones tienen indicación quirúrgica.
- Paciente con alto riesgo anestésico (una anestesia es mejor que dos).
- Paciente que comprende y acepta la complejidad del procedimiento y la curva de aprendizaje de ambos dispositivos.

El candidato NO ideal para la síncrona es el paciente que tiene dudas sobre uno de los dos dispositivos: ese paciente debería hacer las cirugías en etapas para tomar decisiones informadas.

### Orden de implante en la cirugía síncrona

La secuencia recomendada para minimizar el riesgo de infección cruzada entre los dos dispositivos es:
1. Primero implantar la IPP (campo genital más periférico).
2. Luego implantar el EUA (campo perineal más profundo).
3. Cambiar guantes y/o utilizar campos diferentes entre los dos tiempos.

Algunos cirujanos prefieren la secuencia inversa (EUA primero, IPP después); la evidencia no muestra diferencia en tasa de infección según el orden.

### El paciente post-irradiación con DE + IUE

El paciente post-irradiación pelviana presenta el escenario más complejo: tejido fibrótico, vascularización comprometida, curación lenta y mayor riesgo de infección y erosión para ambos dispositivos. En este grupo:
- La IPP puede tener mayor dificultad de colocación por fibrosis de los cuerpos cavernosos.
- El EUA tiene mayor tasa de erosión (PRB de menor presión, considerar manguito transcorporal).
- La cirugía síncrona en irradiados es técnicamente muy exigente y debe reservarse para centros con alto volumen y experiencia.

### Manejo del fracaso del dispositivo

**Infección del AUS con IPP in situ**: si se infecta el EUA, el IPP permanece habitualmente estéril (los dispositivos no están en contacto directo). Sin embargo, ambos comparten el campo escrotal, por lo que la infección del EUA puede diseminarse a la IPP. Decisión caso a caso con manejo multidisciplinario.

**Erosión del AUS con IPP in situ**: si el manguito erosiona la uretra, se retira el manguito y se puede dejar la bomba + PRB si no están infectados, reimplantando el manguito diferidamente. La IPP no necesita ser explantada en la mayoría de los casos.

**Fallo mecánico de la IPP**: no afecta al EUA. Se reemplaza el cilindro o el componente fallado de forma independiente.

## Perlas clínicas
- El AUS 800 tiene 50 años de historia clínica: confiar en un dispositivo probado es más sabio que buscar alternativas no validadas.
- En Latinoamérica, donde el reembolso de Medicare no aplica, la barrera económica para la cirugía síncrona es menor: la decisión puede basarse más en la evidencia clínica.
- Informar siempre al paciente que las revisiones del AUS son esperadas (~25% a 5 años): no son fracasos sino parte del mantenimiento del dispositivo.

## Errores frecuentes
- Hacer la cirugía síncrona en un paciente que no está seguro de querer la IPP: termina con un dispositivo no deseado y más complicaciones.
- No informar sobre la penalización de reembolso al paciente cuando es relevante para su sistema de salud.
- Olvidar el cambio de guantes entre los dos tiempos quirúrgicos en la cirugía síncrona.

## Referencias
- AUA 2026: Economic Disincentives Override Clinical Evidence in Surgical Decisions for AUS and IPP Implants.
- Revisión sistemática 2022 de cirugía síncrona vs. escalonada AUS+IPP (>16.000 pacientes).
- AUA/GURS/SUFU Guideline: Incontinence After Prostate Treatment. 2024.
- Martins FE. Textbook. Cap. 33: Penile prosthesis and AUS.
$body$, 45, 2);

-- ══════════════════════════════════════════════════════════════
-- MÓDULO 10 — Lecciones 2 y 3: Fístulas femeninas + Cierre cuello
-- ══════════════════════════════════════════════════════════════
SELECT id INTO v_mod FROM public.modules
WHERE program_id = v_prog AND position = 9;

INSERT INTO public.lessons (module_id, title, kind, body, duration_min, position) VALUES
(v_mod, 'Fístulas uretrales femeninas y patología compleja periuretral', 'texto', $body$
## Objetivos de aprendizaje
Clasificar las fístulas uretrales femeninas según su etiología y localización, conocer los principios quirúrgicos de su reparación y comprender el rol del colgajo de Martius y otros tejidos de interposición en el campo comprometido.

## Desarrollo teórico

### Epidemiología y etiología

Las fístulas uretrales femeninas son menos frecuentes que las vesicovaginales pero más difíciles de reparar por la limitada longitud de la uretra femenina (3-5 cm) y la proximidad al esfínter.

**Etiologías principales**:
- **Obstétrica**: la fístula ureterovaginal y uretrovaginal por parto obstruido prolongado (ischiorectal necrosis) es la causa más frecuente mundialmente, especialmente en países en desarrollo. La isquemia por presentación fetal prolongada destruye el tabique uretrovaginal.
- **Iatrogénica**: la más frecuente en países desarrollados. Puede ocurrir tras colporrafia anterior (histerocele), uretropexia, resección de divertículo uretral, o cirugía de incontinencia (malla uretral que erosiona hacia la uretra).
- **Post-radioterapia**: la radioterapia pelviana (cáncer de cuello uterino, vagina, recto) produce fístulas de difícil cierre por el tejido hipóxico y afibrótico del campo irradiado.
- **Neoplásica**: el cáncer de cuello uterino o de vagina puede invadir la uretra produciendo fístula.
- **Infecciosa**: abscesos periuretrales drenados que fistulizan.

### Clasificación
Las fístulas uretrales se clasifican según:
1. **Localización**: meatal/distal (1/3 distal de la uretra), media (1/3 medio), proximal (1/3 proximal, cerca del cuello vesical).
2. **Tamaño**: < 0,5 cm, 0,5-2 cm, > 2 cm.
3. **Calidad del tejido**: tejido sano (sin radiación ni infección activa) vs. tejido comprometido (irradiado, infectado, cicatricial).

### Principios generales de reparación

**Timing**: la reparación debe diferirse hasta que la inflamación aguda haya cedido completamente: mínimo 3 meses desde el trauma/infección inicial, y 6-12 meses tras radioterapia. Operar en tejido inflamado activo garantiza el fracaso.

**Principios quirúrgicos (análogos a las fístulas vesicovaginales)**:
1. Escisión completa del trayecto fistuloso.
2. Cierre de la mucosa uretral con sutura fina de monofilamento absorbible (Monocryl 4-0) sin tensión.
3. Cierre de la mucosa vaginal en plano separado del cierre uretral.
4. Interposición de tejido sano y vascularizado entre ambos planos de cierre (este es el paso más crítico).
5. No superposición de las líneas de sutura uretral y vaginal.

**Uso del catéter postoperatorio**: sonda uretral 14-16 Fr por 2-3 semanas para reposo completo de la sutura uretral.

### Colgajo de Martius (labial fat pad flap)

El colgajo de Martius (descrito por Heinrich Martius en 1928) es el tejido de interposición más utilizado en la reparación de fístulas uretrales y vesicovaginales complejas. Consiste en un colgajo de tejido adiposo vascularizado extraído de los labios mayores.

**Anatomía**: el tejido adiposo de los labios mayores está vascularizado por ramas de la arteria pudenda externa (porción anterior) y de la arteria pudenda interna (porción posterior). Al preservar el pedículo posterior, se obtiene un colgajo bien vascularizado que puede rotarse hacia el campo perineal.

**Técnica**:
1. Incisión longitudinal sobre el labio mayor ipsilateral.
2. Movilización del tejido adiposo, preservando el pedículo vascular posterior.
3. Creación de un túnel subcutáneo entre la incisión labial y el campo uretral.
4. Traslado del colgajo adiposo a través del túnel hasta el campo de la fístula.
5. Sutura del colgajo de Martius cubriendo la línea de cierre uretral (interposición entre sutura uretral y sutura vaginal).
6. Cierre de la herida labial por planos.

**Indicaciones**:
- Fístulas recurrentes tras reparación previa fallida.
- Fístulas en campo irradiado (el tejido adiposo del Martius aporta neovascularización al campo hipóxico).
- Fístulas complejas o grandes donde los tejidos locales son insuficientes.

**El Tip 57 del Club de la Uretra** destaca que el colgajo de Martius es una herramienta fundamental del arsenal reconstructivo femenino: "aprenderlo es ampliar significativamente la capacidad de resolver casos difíciles".

### Fístulas post-malla uretral

El uso de mallas para incontinencia urinaria de esfuerzo femenina (slings de malla mediouretral) puede producir:
- Erosión de la malla hacia la uretra o la vagina.
- Fístula uretrovaginal por erosión completa.
- Cuerpo extraño intraluminal (segmento de malla en la uretra).

La reparación requiere:
1. Retiro completo del segmento de malla erosionado (habitualmente por vía transuretral ± transvaginal).
2. Reparación del defecto uretral y vaginal con interposición de Martius si el defecto es significativo.
3. Si hay estenosis uretral asociada: uretroplastia con injerto de mucosa (descrita en la lección anterior).

### Divertículo uretral femenino

El divertículo uretral femenino es una bolsa sacular que se comunica con la uretra, usualmente en la pared vaginal anterior. Prevalencia estimada 1-6% de la población femenina adulta.

**Síntomas clásicos** (tríada de Ellik): disuria, dispareunia, goteo post-miccional (3 D en inglés: dysuria, dyspareunia, dribbling).

**Diagnóstico**: RM pelviana es el gold standard (sensibilidad > 90%). La cistouretroscopía confirma el ostium y su posición respecto al cuello vesical.

**Tratamiento**: diverticulectomía transvaginal con cierre en tres capas. El colgajo de Martius se añade cuando el tejido local es deficiente.

### Lesiones quísticas periuretrales (Tip 56)

Las lesiones quísticas adyacentes a la uretra femenina incluyen:
- **Quistes de glándulas de Skene (paraglandulares)**: las glándulas de Skene homólogas a la próstata pueden obstruirse y formar quistes. Tratamiento: marsupialización o extirpación.
- **Ureteroceles ectópicos**: pueden simular quistes periuretrales. La UIV y la RM los distinguen.
- **Quiste de Bartholin**: más posterior, en el vestíbulo.

## Errores frecuentes
- Operar una fístula uretrovaginal en el período inflamatorio agudo (< 3 meses del trauma).
- No interponer tejido vascularizado en reparaciones de fístulas recurrentes.
- No buscar activamente el segmento de malla erosionado en fístulas post-sling: dejar malla residual en el campo garantiza la recurrencia.

## Referencias
- Velarde L. 60 Tips. Tips 55, 56, 57, 58.
- Martins FE. Textbook. Cap. 9: Uretra femenina y patología asociada.
- AUA 2026: Uretroplastia femenina y técnicas de reconstrucción.
$body$, 45, 1),

(v_mod, 'Cierre de cuello vesical, derivación urinaria y cáncer de uretra en la mujer', 'texto', $body$
## Objetivos de aprendizaje
Conocer las indicaciones del cierre de cuello vesical en la mujer, los principios técnicos del procedimiento transvesical, las opciones de derivación urinaria continente y no continente en pacientes con vejiga neurógena o cuello no funcional, y reconocer el cáncer de uretra femenino como diagnóstico diferencial en la práctica del urólogo reconstructivo.

## Desarrollo teórico

### Cierre de cuello vesical femenino (Tip 59)

**Indicaciones**:
El cierre del cuello vesical femenino está indicado en pacientes con incontinencia urinaria total irreversible que no puede corregirse con otros dispositivos o técnicas:
- Vejiga neurógena con cuello vesical incompetente (lesión medular cervical o torácica alta).
- Incontinencia post-radioterapia pelviana con uretra destruida.
- Fracaso de múltiples cirugías de incontinencia con pérdida de la continencia estructural.
- Fístula uretrocutánea o uretrovaginal no reparable con uretra viable mínima.

En estos pacientes la derivación urinaria cateterizable (Mitrofanoff) se realiza simultáneamente para permitir el vaciamiento vesical continente.

**Técnica transvesical**:
1. Acceso retropúbico o transvaginal para exposición del cuello vesical.
2. Apertura de la vejiga (cistotomía).
3. Disección circunferencial del cuello vesical en el plano submucoso.
4. Cierre del cuello vesical en múltiples capas: mucosa, capa muscular y tejido periuretral.
5. Interposición de tejido vascularizado (epiplón mayor o colgajo de Martius) entre el cuello cerrado y la vagina para prevenir fístula.
6. Creación simultánea del canal cateterizable de Mitrofanoff (apéndice o ileon detubularizado) para el vaciamiento.

El Tip 59 del Club de la Uretra destaca que el cierre de cuello vesical femenino tiene alta tasa de éxito en manos expertas, pero requiere planificación cuidadosa de la derivación simultánea y seguimiento de por vida por el riesgo de cálculos, infecciones e hidronefros.

### Cabestrillo autólogo suburetral femenino (Tip 58)

Para pacientes con incontinencia urinaria de esfuerzo femenina con uretra de riesgo (uretra de baja presión, fracaso de sling sintético previo, campo irradiado), la fascia autóloga (lata o del recto abdominal) es el material de elección:

- **Fascia lata**: extraída de la cara lateral del muslo. Resistente, fácil de cosechar. Mínima morbilidad del sitio donador.
- **Fascia del recto abdominal**: extraída de la vaina anterior del recto, a través de la misma incisión suprapúbica del procedimiento.

El cabestrillo autólogo tiene una tasa de continencia del 70-85% a 5 años, con menor tasa de erosión que los slings sintéticos, y es la opción estándar cuando se requiere un sling en campo comprometido.

### Opciones de derivación urinaria en la mujer

Cuando el cuello vesical se cierra o la vejiga no puede usarse para almacenamiento:

**Canal cateterizable de Mitrofanoff**:
Usa el apéndice vermicular (o intestino en caso de apendicectomía previa) como canal cateterizable entre la vejiga y la piel, habitualmente en la fosa ilíaca derecha. El mecanismo valvular previene la incontinencia por el canal. La paciente realiza CIC a través del canal cada 3-4 horas. El Mitrofanoff requiere vejiga de capacidad y compliance adecuadas; si no, debe combinarse con ampliación vesical.

**Ampliación vesical (cistoplastia de ampliación)**:
Cuando la vejiga tiene baja compliance o capacidad insuficiente, un segmento de intestino detubularizado (habitualmente íleon) se anastomosa a la vejiga abierta en forma de cúpula para aumentar la capacidad y reducir las presiones intravesicales. Combina perfectamente con el canal de Mitrofanoff.

**Conduit ileal (derivación no continente, Bricker)**:
En pacientes donde la vejiga no es salvable, el conduit ileal desvía la orina directamente a la piel. La paciente usa una bolsa colectora sobre el estoma. Técnicamente más simple que las derivaciones continentes pero con impacto en la imagen corporal.

### Cáncer de uretra femenino (Tip 60)

El cáncer primario de uretra femenina es una neoplasia rara (1-2 casos por millón de mujeres/año). A pesar de su baja incidencia, el cirujano reconstructivo debe conocerlo porque:
1. Puede presentarse como una "estenosis resistente" o una masa uretral aparentemente benigna.
2. El diagnóstico diferencial es obligatorio antes de cualquier uretroplastia.
3. El diagnóstico tardío se asocia a mal pronóstico (enfermedad localmente avanzada al momento del diagnóstico en muchos casos).

**Histología**: carcinoma escamoso (> 50%), adenocarcinoma (25-30%), carcinoma de células transicionales (20%).

**Presentación clínica**: hematuria, masa uretral palpable, obstrucción urinaria progresiva, sangrado vaginal. Los tumores del tercio distal de la uretra son más accesibles y tienen mejor pronóstico; los del tercio proximal son más avanzados al diagnóstico.

**Diagnóstico**: biopsia uretral bajo visión endoscópica. Estadificación con RM pelviana y PET-CT.

**Tratamiento**: los cánceres distales (< 1/3 distal) pueden tratarse con uretrectomía parcial conservando la continencia. Los tumores proximales o avanzados requieren cirugía radical con cistourethrectomía. La radioterapia combinada con quimioterapia puede ser alternativa en tumores localmente avanzados no resecables.

**Mensaje para el cirujano reconstructivo**: ante cualquier masa uretral, cambio de características de una estenosis conocida, hemorragia intraoperatoria inesperante o tejido de apariencia anormal, solicitar biopsia. No operar "estenosis resistentes" sin histología que confirme la benignidad del proceso.

### Lesión del meato uretral femenino (Tip 55)

Las lesiones del meato uretral femenino incluyen:
- **Estenosis meatal**: la más frecuente. Se manifiesta como chorro urinario desviado o débil. Tratamiento: meatotomía con bisturí fino (oftálmico) + aplicación de esteroide tópico postoperatoria para prevenir reestenosis.
- **Carúncula uretral**: tejido prolapsado hiperémico en el labio posterior del meato. Habitualmente en postmenopáusicas por hipoestrogenismo. Puede simular neoplasia. Tratamiento: estrógenos tópicos, y si no responde, escisión con punto de sutura en "8".
- **Prolapso uretral**: toda la mucosa uretral prolasa circunferencialmente. Más frecuente en niñas y postmenopáusicas. Tratamiento: reducción ± escisión del tejido prolapsado ± sutura de fijación mucosa.

## Errores frecuentes
- No biopsiar una "estenosis resistente" en la mujer: el cáncer de uretra puede presentarse así.
- Cerrar el cuello vesical sin planificar simultáneamente la derivación continente: la vejiga sin salida desarrollará reflejo vesicoureteral e hidronefrosis.
- No informar al paciente sobre el impacto en imagen corporal de las derivaciones no continentes.

## Referencias
- Velarde L. 60 Tips. Tips 55, 58, 59, 60.
- Martins FE. Textbook. Caps. 8-9, 29-32.
- AUA 2026: Panel Discussion — diversion strategies for devastated outlets.
$body$, 45, 2);

-- ══════════════════════════════════════════════════════════════
-- MÓDULO 11 — Lección 3: Hipospadias del adulto e ingeniería de tejidos
-- ══════════════════════════════════════════════════════════════
SELECT id INTO v_mod FROM public.modules
WHERE program_id = v_prog AND position = 10;

INSERT INTO public.lessons (module_id, title, kind, body, duration_min, position) VALUES
(v_mod, 'Hipospadias del adulto, ingeniería de tejidos y guías clínicas internacionales', 'texto', $body$
## Objetivos de aprendizaje
Reconocer la reparación fallida de hipospadias como una causa frecuente de estenosis peneana compleja en el adulto, conocer los principios del manejo quirúrgico de la estenosis post-hipospadias, comprender el estado actual de la ingeniería de tejidos uretral y conocer las recomendaciones de las principales guías clínicas internacionales.

## Desarrollo teórico

### Hipospadias del adulto: la herencia de la reconstrucción pediátrica

El hipospadias es una malformación congénita del meato uretral (incidencia 1/200-300 varones nacidos). Las técnicas de reparación pediátrica han evolucionado enormemente desde los años 80-90, pero una proporción significativa de pacientes operados en la infancia llega a la vida adulta con complicaciones:
- **Estenosis de la neourethra**: la causa más frecuente. Puede ser focal (meato, anastomosis) o extensa (toda la neourethra).
- **Fístula uretrocutánea**: la complicación más frecuente de la reparación primaria (~5-15%).
- **Cuerda (chordee) residual o recurrente**: curvatura peneana que puede interferir con la función sexual.
- **Divertículo uretral**: dilatación sacular de la neourethra por obstrucción distal.

La reparación fallida de hipospadias es la **causa más frecuente de indicación de uretroplastia en dos etapas en series expertas internacionales** (hasta 50% de las indicaciones de Johanson en la serie de Joshi et al., 2026).

### Por qué el hipospadias complejo del adulto es difícil

1. **Tejido peneano comprometido**: múltiples cirugías previas han agotado la piel peneana sana, cicatrizándola y fibrosándola. No hay material local para la reconstrucción.
2. **Vascularización comprometida**: la cirugía repetida interrumpe el suministro vascular del dartos y de la piel.
3. **Anatomía distorsionada**: el meato está en posición anómala, el prepucio fue usado o está ausente, y la uretra tiene geometría irregular.
4. **Estenosis múltiples y discontinuas**: pueden coexistir varias estenosis en la neourethra de longitudes variables.

### Principios del manejo en el adulto

El algoritmo de tratamiento del hipospadias complejo del adulto sigue la misma lógica que la estenosis peneana compleja:

**Estenosis focal única post-hipospadias**:
- Si la piel peneana es de buena calidad: onlay ventral con BMG en un solo tiempo.
- Si hay meato estenótico: meatoplastia ± BMG transuretral (técnica endoscópica si disponible).

**Estenosis extensa o neourethra fibrótica**:
- Uretroplastia en dos etapas obligatoria.
- Primera etapa (Johanson): apertura completa de la neourethra. Permite evaluar la extensión real del problema y da al paciente voiding funcional temporal.
- Segunda etapa (6 meses después): BMG + tubularización con piel no pilosa bien vascularizada.

**Fístula uretrocutánea en adulto post-hipospadias**:
- Cierre quirúrgico con interposición de tejido (dartos si disponible, tejido subcutáneo si no).
- Si la fístula es múltiple o el tejido local es insuficiente: puede requerirse etapa previa de consolidación.

### Hitos técnicos pediátricos relevantes para el adulto

El conocimiento de las técnicas pediátrica es útil para entender la anatomía del adulto con hipospadias reparado:
- **TIP/Snodgrass (1994)**: incisión medial de la placa uretral + tubularización. Es la técnica más usada mundialmente para hipospadias distal. Las estenosis del meato post-TIP son la complicación más frecuente.
- **Colgajo en isla prepucial de Duckett (1981)**: para hipospadias proximal severo. Los adultos que tuvieron este procedimiento tienen cicatriz circunferencial peneana que puede estenótica años después.
- **Bracka en dos tiempos (1995)**: los adultos que tuvieron reparación en dos tiempos en la infancia suelen tener mejor calidad de neourethra que los que tuvieron técnicas en un solo tiempo para hipospadias severo.

### Ingeniería de tejidos en cirugía uretral

La limitante fundamental de la reconstrucción uretral es la disponibilidad de tejido donador y su morbilidad. La ingeniería de tejidos busca eliminar esta limitante:

**Uretras autólogas tisulares (Atala et al.)**:
El trabajo pionero de Raya-Rivera y Atala (*Lancet* 2011) describió el implante de uretras autólogas construidas sobre una matriz de material biocompatible (ácido poliglicólico) sembradas con células uroteliales y musculares lisas del propio paciente. En 5 niños con defecto uretral severo, las uretras tisulares permanecieron patentes hasta 6 años. Este trabajo es hito porque demostró que la ingeniería de tejidos puede producir una estructura tubular funcional en humanos.

**Limitaciones actuales**:
- La construcción de la uretra tisular requiere 4-6 semanas en laboratorio especializado.
- El costo es prohibitivo para uso rutinario.
- Las series clínicas son pequeñas y el seguimiento limitado.
- La FDA no ha aprobado ningún producto de uretra tisulada para uso general.

**Matrices acelulares y biobancos**:
Las matrices de submucosa de intestino delgado (SIS), vejiga (BAM) o peritoneo decelularizado preservan la estructura y las propiedades mecánicas del tejido original sin las células inmunogénicas. Pueden utilizarse como andamiaje para la siembra de células autólogas. Resultados preclínicos prometedores; aún en fase experimental clínica.

**Injertos líquidos**: (cubiertos en detalle en la lección 2 de este módulo).

### Síntesis de guías clínicas internacionales

El conocimiento de las guías permite al urólogo comunicarse con la evidencia y defender sus decisiones:

**AUA — Urethral Stricture Disease (Amendment 2023)**:
- Evaluación + diagnóstico: rol del urólogo general en la detección; UCG como estándar imagenológico.
- DVIU: indicación en estenosis favorable (bulbar, < 2 cm, primer episodio).
- Uretroplastia: tratamiento estándar de la estenosis recurrente o desfavorable.
- BMG vs. mucosa lingual: sin diferencia de éxito; distinta morbilidad del donador.

**EAU — Urethral Strictures (2024-2025)**:
- Predictores de recidiva post-DVIU: estenosis > 1,5 cm, estenosis peneana, estenosis no idiopática.
- Seguimiento: la EAU establece un protocolo de vigilancia post-uretroplastia con uroflujometría y PROMs.
- Nuevas tendencias: la guía EAU 2025 menciona la stricture-fecta como marco de referencia para reportar resultados.

**SIU/ICUD (Buckley et al., Urology 2014)**:
Consenso sobre dilatación, uretrotomía interna y stents: la endoscopía es razonable como primera línea en estenosis favorables; los stents están esencialmente abandonados en uretra anterior.

**JUA — Japanese Clinical Practice Guidelines (Horiguchi et al., Int J Urol 2024)**:
La guía japonesa es la más reciente y la más explícita: recomienda directamente la uretroplastia como tratamiento estándar por su alto éxito frente a la alta recidiva de los procedimientos transuretrales. Es la guía que mejor incorpora los conceptos de "complejidad creciente" y "urethral rest".

## Perlas clínicas
- El adulto con hipospadias reparado en la infancia y estenosis recurrente necesita información sobre la causa de su problema: la estenosis no es un fracaso de la reparación primaria sino una consecuencia previsible de la cicatrización en un tejido anómalo que fue operado con la tecnología disponible en los años 80-90.
- Las guías convergen: la uretroplastia es el gold standard curativo. La endoscopía repetida solo compromete el futuro quirúrgico.
- La ingeniería de tejidos es el futuro: cuando sea accesible, eliminará la morbilidad del sitio donador y ampliará las posibilidades reconstructivas.

## Errores frecuentes
- No reconocer la cicatriz de hipospadias como causa de la estenosis: revisar la historia pediátrica.
- No documentar el número y tipo de reparaciones pediátricas: esta información es crítica para planificar la cirugía del adulto.
- Recomendar injertos de ingeniería de tejidos fuera de un ensayo clínico supervisado: los resultados a largo plazo aún no están disponibles.

## Referencias
- Raya-Rivera A, Esquiliano D, Yoo JJ et al. Tissue-engineered autologous urethras for patients who need reconstruction. *Lancet.* 2011;377:1175-82.
- Snodgrass W. *J Urol.* 1994;151:464 — TIP urethroplasty.
- Bracka A. *Br J Urol.* 1995;76:31 — Two-stage repair.
- AUA. Urethral Stricture Disease Guideline. Amendment 2023.
- Horiguchi A et al. JUA Clinical Practice Guidelines for Urethral Strictures. *Int J Urol.* 2024.
- Libro de la Uretra. Capítulos 17, 18, 19. 2024-2025.
- AUA 2026: Two-Stage Johanson Urethroplasty (Joshi) — 31/62 casos post-hipospadias.
$body$, 50, 2);

END;
$SEED3$;
