-- ============================================================
-- Seed: Diplomado de Cirugía Reconstructiva Uretral
-- MÓDULOS 5–12 (continuación de seed_diplomado_completo.sql)
-- Ejecutar DESPUÉS de seed_diplomado_completo.sql
-- ============================================================

DO $SEED2$
DECLARE
  v_prog uuid;
  v_mod  uuid;
BEGIN

SELECT id INTO v_prog FROM public.programs WHERE slug = 'diplomado-reconstructiva-uretral';
IF v_prog IS NULL THEN
  RAISE EXCEPTION 'Programa no encontrado. Ejecutar seed_diplomado_completo.sql primero.';
END IF;

-- ══════════════════════════════════════════════════════════════
-- MÓDULO 5: Uretroplastia de Uretra Anterior
-- ══════════════════════════════════════════════════════════════
INSERT INTO public.modules (program_id, title, position)
VALUES (v_prog, 'Uretroplastia de Uretra Anterior: Técnicas y Resultados', 4)
RETURNING id INTO v_mod;

INSERT INTO public.lessons (module_id, title, kind, body, duration_min, position) VALUES
(v_mod, 'Uretroplastia anastomótica bulbar: transectante y no transectante', 'texto', $body$
## Objetivos de aprendizaje
Describir la técnica de resección y anastomosis término-terminal (EPA) para estenosis bulbares cortas, conocer las diferencias entre la técnica transectante clásica y la no transectante con preservación vascular, e identificar las indicaciones y contraindicaciones de cada abordaje.

## Desarrollo teórico

### Indicaciones
La uretroplastia anastomótica bulbar está indicada en estenosis cortas de la uretra bulbar (generalmente < 2 cm, excepcionalmente hasta 3 cm) de cualquier etiología excepto LS activo. Es la técnica con mayor tasa de éxito a largo plazo (> 95% libre de retratamiento a 10 años) cuando está bien indicada y técnicamente correcta.

### Técnica transectante clásica (Excision and Primary Anastomosis, EPA)
1. **Posición y acceso**: litotomía alta con bump sacro. Incisión perineal media. Disección del bulbo esponjoso del escroto y el periné.
2. **Apertura del músculo bulbocavernoso**: el Tip 31 del Club de la Uretra advierte sobre la decisión de seccionar o preservar el músculo bulbocavernoso durante la uretroplastia bulbar. La sección permite mejor exposición pero puede afectar la eyaculación y el drenaje linfático. En general se recomienda la disección del músculo más que su sección.
3. **Identificación de la estenosis**: la palpación de la induración fibrosa guía la localización exacta. El cistoscopio flexible intraoperatorio ilumina desde la vejiga para marcar el extremo proximal.
4. **Transección y resección**: se cortan ambos cabos uretrales en tejido sano (mucosa rosada, bordes sangrantes). El segmento estenótico se reseca completamente.
5. **Maniobras de ganancia de longitud**: para evitar tensión en la anastomosis:
   - Movilización circunferencial del cabo distal (liberación de la fijación al cuerpo cavernoso ventral).
   - Separación del cuerpo esponjoso de los cuerpos cavernosos en el cabo distal (splitting): permite ganar hasta 2-3 cm.
   - En casos posteriores extremos: pubectomía inferior (resección del ángulo inferior de la sínfisis púbica).
6. **Anastomosis**: sutura continua o interrumpida en dos hemicírculos con PDS 4-0 ó monocryl 4-0. Habitualmente se colocan primero los puntos de la cara posterior (más difícil) antes de anudar, con el cabo posterior pasado como "asa" para facilitar la visualización. La anastomosis debe ser waterproof pero sin tensión.
7. **Catéter postoperatorio**: sonda de Foley 16-18 Fr por 2-3 semanas.

### Uretroplastia bulbar no transectante (con preservación vascular)
La técnica no transectante, popularizada por el grupo de Barbagli y de Kulkarni, preserva la continuidad del cuerpo esponjoso sin seccionar las arterias bulbouretrales:
1. La uretra se expone dorsalmente sin transectar el bulbo.
2. El segmento estenótico se incide longitudinalmente en la cara dorsal.
3. Se aplica un injerto de BMG en el defecto ("dorsal onlay"), o se realiza la RAE preservando el plexo ventral del cuerpo esponjoso.
4. El cuerpo esponjoso permanece continuo, con la vascularización bulbouretral intacta.

**Ventajas**: menor impacto en la función eréctil, mejor preservación de la vascularización del segmento distal.

**Desventajas**: técnicamente más difícil, no aplicable en estenosis con fibrosis circunferencial densa o en estenosis muy cortas donde la resección es preferible.

Un estudio de seguimiento a largo plazo del grupo de Barbagli demostró que la técnica no transectante tiene resultados funcionales equivalentes a la transectante en términos de permeabilidad uretral, con menor tasa de disfunción eréctil de novo (8% vs. 15-20% en algunas series transectantes).

### Resultados contemporáneos
Las mejores series de EPA bulbar transectante reportan:
- Éxito libre de retratamiento a 1 año: 97% (estenosis idiopática)
- Éxito a 10 años: 92-95%
- Disfunción eréctil de novo: 0-15% según la técnica y la definición
- Fístula uretrocutánea: < 1%
- Infección de herida: 3-5%

### Estrictamente contraindicado en
- LS activo (el tejido comprometido recidivará aunque se resecte la estenosis macroscópica).
- Estenosis > 3 cm (tensión inaceptable).
- Campo irradiado (anastomosis sobre tejido hipóxico de alta probabilidad de fallo).

## Perlas clínicas
- Si al intentar la anastomosis hay la menor tensión, NO forzar: el riesgo de retensionación y recurrencia es mayor que el de una uretroplastia de sustitución planificada.
- La ecografía Doppler intraoperatoria del pene identifica las arterias bulbouretrales antes de la disección, orientando la preservación vascular.
- El Tip 39 del Club de la Uretra describe el uso de eco-Doppler peneal en la uretroplastia posterior traumática para mapear la vascularización.

## Errores frecuentes
- Resecar con márgen insuficiente: dejar tejido fibrótico en cualquier extremo garantiza la recurrencia.
- No movilizar adecuadamente antes de intentar la anastomosis.
- Usar sutura gruesa (2-0) que genera granulomas intrauretrales.

## Referencias
- Martins FE. Textbook. Caps. 14-16.
- Barbagli G et al. Non-transecting bulbar urethroplasty. Eur Urol. 2008.
- Velarde L. 60 Tips. Tips 31, 39.
$body$, 55, 0),

(v_mod, 'Uretroplastia de sustitución bulbar y peneana con injerto', 'texto', $body$
## Objetivos de aprendizaje
Describir las técnicas de uretroplastia de sustitución con injerto onlay (ventral, dorsal y lateral) para estenosis largas de uretra bulbar y peneana, comprender las indicaciones específicas de cada posición y conocer los resultados esperables.

## Desarrollo teórico

### Indicaciones
La uretroplastia de sustitución con injerto de BMG está indicada cuando la resección y anastomosis generaría tensión (estenosis > 2-3 cm en bulbar, cualquier estenosis peneana). Es la técnica dominante en la práctica reconstructiva contemporánea.

### Técnica dorsal onlay (Barbagli)
Descrita por Barbagli en 1996 para estenosis bulbares. La uretra se rota 180° hacia ventral para exponer su cara dorsal y aplicar el BMG sobre los cuerpos cavernosos:

1. **Acceso perineal** igual que en la EPA. Separación del músculo bulbocavernoso. Movilización del cuerpo esponjoso del rafe medio.
2. **Rotación de la uretra**: se libera la adherencia del cuerpo esponjoso a los cuerpos cavernosos en el segmento estenótico y se rota la uretra 180° hacia el asistente.
3. **Uretrotomía dorsal**: incisión longitudinal en la cara dorsal de la uretra (cara que ahora mira hacia arriba), extendida 0,5 cm más allá de cada extremo de la estenosis hacia mucosa sana.
4. **Lecho receptor**: la cara dorsal del cuerpo esponjoso incidida queda sobre los cuerpos cavernosos. Este lecho es el mejor vascularizado de toda la uretra.
5. **Aplicación del BMG**: el injerto se sutura con puntos de capitonaje a los cuerpos cavernosos (mediante puntos que atraviesan el injerto y se anudan sobre el tejido cavernoso). Luego los bordes del injerto se suturan a los bordes de la uretrotomía.
6. **Cierre**: el cuerpo esponjoso se recoloca sobre el injerto (actúa como segunda capa de cobertura vascular), el músculo bulbocavernoso se repara y se cierra la piel.

**Resultado**: la uretra queda aumentada en la cara dorsal por el injerto; el lumen resultante debe calibrar ≥ 22-24 Fr.

### Técnica lateral (Kulkarni)
Para evitar la rotación de la uretra, Kulkarni describió el acceso lateral: la disección se realiza por un lado del cuerpo esponjoso, se realiza la uretrotomía lateral y el injerto se coloca en la cara lateral del defecto. Técnicamente menos exigente que el dorsal, con resultados comparables.

### Técnica ventral onlay (Orandi)
La incisión longitudinal se realiza en la cara ventral de la uretra (la más accesible). El BMG se aplica directamente sobre el lecho ventral del cuerpo esponjoso. Técnica más simple pero el lecho receptor es menos vascularizado que el dorsal. Indicada en estenosis peneanas donde la rotación de la uretra es difícil.

### Uretroplastia peneana
La estenosis de uretra peneana es técnicamente más desafiante que la bulbar:
- El cuerpo esponjoso es más delgado y su vascularización más pobre.
- La piel peneana y la fascia de Buck deben ser preservadas como cobertura del injerto.
- El riesgo de fístula uretrocutánea es mayor que en la bulbar.

Abordaje estándar:
1. Degloving circunferencial del pene (o incisión longitudinal ventral si la estenosis es corta).
2. Uretrotomía ventral extendida a lo largo de toda la estenosis.
3. Aplicación de BMG ventral, con capitonaje al tejido esponjoso subyacente.
4. Cierre de la fascia de Buck y la piel peneana sobre el injerto.

### Fosa navicular y meato
La estenosis de fosa navicular y meato es una entidad diferente: el acceso quirúrgico clásico requería apertura dorsal del glande (técnica de Meatoplastia dorsal o incisión en V-Y). El abordaje moderno es transuretral ventral (Barbagli 2011): mediante un cistoscopio flexible se introduce el BMG transuretalmente y se fija mediante una técnica de "doble brazo de sutura". Un estudio multicéntrico (12 cirujanos, 57 pacientes, > 1 año de seguimiento) reportó un 96% de éxito sin fístulas ni dehiscencia de glande, posicionando esta técnica como el nuevo estándar de cuidado para la fosa navicular.

### Resultados
- Uretroplastia bulbar con BMG dorsal (Barbagli): 85-90% libre de retratamiento a 5 años.
- Uretroplastia peneana con BMG: 80-85% a 5 años.
- Fosa navicular transuretral: 96% a 1 año (serie multicéntrica AUA 2026).

## Errores frecuentes
- Aplicar el injerto sobre el lecho ventral peneano sin capitonaje adecuado: el injerto flota y no toma.
- No extender la uretrotomía 0,5-1 cm más allá de la estenosis en ambos extremos.
- Cierre cutáneo excesivamente ajustado sobre el injerto peneano: isquemia del colgajo de cobertura.

## Referencias
- Barbagli G et al. Dorsal BMG onlay urethroplasty. Eur Urol. 1996, 2004.
- Kulkarni S et al. Single-stage lateral BMG. J Urol. 2009.
- AUA 2026: Urethroplasty Evolution — transurethral fossa navicularis, 96% success.
- Martins FE. Textbook. Caps. 10-11, 15-16.
$body$, 55, 1),

(v_mod, 'Uretroplastia en etapas para estenosis peneana compleja (Johanson)', 'texto', $body$
## Objetivos de aprendizaje
Conocer las indicaciones de la uretroplastia en dos etapas tipo Johanson para estenosis peneanas complejas, describir la técnica de cada etapa, analizar el debate entre colocar el BMG en la primera o segunda etapa, y conocer los resultados en series contemporáneas.

## Desarrollo teórico

### Indicaciones de uretroplastia en dos etapas
Las estenosis peneanas que requieren tratamiento en etapas son aquellas en las que:
1. Una reconstrucción en un tiempo tiene alto riesgo de fallo (tasa de complicaciones inaceptable).
2. La piel peneana está comprometida por LS, cicatrices de reparaciones previas de hipospadias o infección.
3. La estenosis es larga (> 10 cm) y no hay suficiente tejido para una reconstrucción en un tiempo.
4. El paciente ha tenido múltiples cirugías previas fallidas con piel peneana agotada.

Las etiologías más frecuentes que llevan a una uretroplastia en dos etapas son: hipospadias complejo del adulto (la causa más frecuente en las series expertas, hasta 50% de los casos), LS, estenosis idiopáticas largas y estenosis post-cateterismo extensas.

### Debate: BMG en primera o segunda etapa

**Postura "BMG en primera etapa" (Bracka, técnica estándar)**:
El injerto se coloca en la primera etapa sobre los cuerpos cavernosos, creando una placa uretral de mucosa bucal madura. Seis meses después se tuburaliza. Esta es la técnica descrita originalmente por Bracka (1995) y es la preferida por la mayoría de los cirujanos reconstructivos europeos y latinoamericanos.

Ventajas: la mucosa bucal madura sirve como excelente placa uretral para la tubularización; permite detectar y tratar la contracción del injerto antes de la segunda etapa.

Desventajas: en 12-39% de los casos el injerto se contrae antes de la segunda etapa, requiriendo un injerto adicional y convirtiendo el procedimiento de dos a tres etapas. En casos con contracción severa puede desarrollarse cuerda (chordee).

**Postura "BMG en segunda etapa" (Joshi, Johanson-first)**:
La primera etapa consiste en el Johanson clásico: apertura de la uretra estenótica, marsupialización del segmento afectado (creando una uretrostomía ventral de toda la longitud de la estenosis), y espera de 6 meses. En la segunda etapa se cosecha el BMG (1,7 cm de ancho) y se coloca en el defecto uretral abierto, tubularizándose con piel peneana no pilosa bien vascularizada.

Ventajas (según Joshi et al.): el lecho receptor del BMG en la segunda etapa tiene suministro vascular por el dartos peneano circundante, que es mejor que la interfaz directa BMG-cuerpo cavernoso de la técnica Bracka. Se evita la contracción precoz del injerto sobre los cuerpos cavernosos. La eliminación de la obstrucción en la primera etapa mejora la calidad de vida del paciente mientras espera la segunda.

Resultados (serie de Joshi et al., 62 pacientes): 89% de éxito a mediana de 40 meses (rango 21-82), Qmax media 25 ± 10 mL/s. Fracasos (n=7): 2 dehiscencias de glande, 2 fístulas, 2 dehiscencias completas, 1 requirió dilatación.

**Resumen del debate**: la evidencia disponible no muestra superioridad definitiva de un abordaje sobre el otro. La elección depende de la experiencia del cirujano y la etiología específica:
- LS: la mayoría de expertos prefiere BMG en primera etapa.
- Hipospadias complejo: el grupo de Joshi prefiere Johanson-primero con BMG en segunda etapa.
- En ambos casos, el cirujano que conoce bien su técnica obtendrá mejores resultados que aplicando la "mejor técnica descrita" sin experiencia.

### Técnica de la uretroplastia en dos etapas

**Primera etapa (Johanson)**:
1. Degloving del pene.
2. Apertura longitudinal completa de la uretra desde el meato hasta el bulbo, siguiendo el rafe ventral.
3. Marsupialización de los bordes uretrales a la piel peneana con sutura de Vicryl 3-0.
4. El paciente vacia por el periné/escroto en orinar sentado. Muchos pacientes (5-75% según las series) eligen no continuar con la segunda etapa por estar satisfechos con esta solución.

**Segunda etapa (tubularización + BMG si Johanson-first)**:
1. A los 6 meses, verificar que no hay contracción ni LS activo.
2. Si se optó por Bracka: incisión longitudinal en ambos bordes de la placa de mucosa bucal madura y tubularización con sutura continua monofilamento.
3. Si se optó por Johanson-first: cosecha de BMG, aplicación en la placa uretral abierta (capitonaje), esperar 6 meses adicionales para maduración, luego tubularización.
4. Cobertura con múltiples capas: dartos, fascia de Buck, piel peneana.

### LS en dos etapas
El LS activo es una contraindicación para la segunda etapa (tubularización): el LS puede recidivar en el BMG implantado (hasta 25% de casos según el grupo de Wessel et al., con LS histológico en biopsia previa a la segunda etapa). Por ello, algunos grupos realizan biopsia de la placa de BMG antes de la segunda etapa para confirmar ausencia de LS recurrente.

## Errores frecuentes
- Realizar la segunda etapa con LS activo: recurrencia segura.
- No esperar suficiente tiempo entre etapas (< 4-6 meses): el BMG no ha madurado.
- Tubularizar con piel pilosa peneana: pelos intrauretrales y cálculos.

## Referencias
- AUA 2026: Two-Stage Johanson Urethroplasty (Joshi). 62 pacientes, 89% éxito.
- AUA 2026: Two-Stage Urethroplasty for Lichen Sclerosus (Bracka vs. Joshi).
- Bracka A. Two-stage repair with buccal mucosa. Br J Plast Surg. 1995.
- Velarde L. 60 Tips. Tips 28, 29, 30.
$body$, 50, 2),

(v_mod, 'Uretrostomía perineal: indicaciones, técnica Blandy y resultados', 'texto', $body$
## Objetivos de aprendizaje
Conocer las indicaciones y contraindicaciones de la uretrostomía perineal (UP) como tratamiento definitivo o de largo plazo para la estenosis uretral compleja, describir la técnica de Blandy y los cuidados postoperatorios, e interpretar los resultados funcionales y de satisfacción de las series contemporáneas.

## Desarrollo teórico

### Concepto y posicionamiento
La uretrostomía perineal (UP) es la creación de un estoma urinario permanente en el periné, a nivel del bulbo uretral, que permite la micción sentado desde un orificio perineal en lugar del meato peneano. No es una "derrota terapéutica", sino una opción con altísima satisfacción del paciente cuando está bien indicada y correctamente asesorada.

### Indicaciones
- **Estenosis panuretral por LS**: cuando toda la uretra anterior está afectada por fibrosis activa y las múltiples reparaciones han fracasado o no son viables.
- **Múltiples uretroplastias previas fallidas**: paciente con uretra "quemada" por múltiples cirugías, sin tejido de buena calidad para reconstrucción adicional.
- **Paciente frágil**: la UP es una cirugía única, corta (1-2 horas), con alta tasa de éxito relativo, adecuada para pacientes con comorbilidades que contraindican procedimientos prolongados.
- **Negativa a cirugía compleja o paciente que no quiere más reparaciones**.
- **Post-penectomía o post-uretrostomía perineal previa reestenótica**: la UP puede reconstituirse cuando la primera presenta estenosis (Tip 47).
- **Paciente lesionado medular** (Tip 48): en pacientes con vejiga neurógena y estenosis uretral asociada, la UP simplifica el sondaje y la gestión vesical.

### Contraindicaciones
**Absolutas**:
- Enfermedad proximal a la unión bulbomembranosa (estenosis prostática, cuello vesical): la UP no resuelve la obstrucción proximal.
- Incontinencia urinaria severa: la UP crea un estoma sin mecanismo valvular; la incontinencia preexistente puede empeorar.

**Relativas**:
- Función del esfínter externo comprometida (historia de cirugía de próstata): mayor riesgo de incontinencia postoperatoria. La colocación de EUA tras UP es posible pero más compleja (posición periprotésica o en cuello vesical en lugar del bulbo habitual).
- Antecedente de Fournier's perineal: piel perineal comprometida, cicatrizada, de mala calidad para el estoma.

### Técnica de Blandy

1. **Posición**: litotomía alta con bump sacro.
2. **Incisión**: incisión en U invertida con vértice en el rafe escrotal, brazos mediales a las tuberosidades isquiáticas. Una pequeña incisión media adicional hacia craneal mejora la exposición.
3. **Desarrollo del colgajo**: movilizar el colgajo cutáneo de grasa perineal con buena vascularización; este colgajo será el "labio anterior" del estoma.
4. **División del músculo bulbocavernoso**: en línea media para acceder al cuerpo esponjoso.
5. **Uretrotomía**: incisión longitudinal del bulbo uretral de aproximadamente 4 cm en la cara ventral del cuerpo esponjoso. Extender proximal y distalmente hasta alcanzar mucosa sana y calibre adecuado (≥ 24 Fr). Colocar puntos de tracción para control.
6. **Confirmación endoscópica**: cistoscopía flexible transuretral para verificar ausencia de enfermedad proximal y patología vesical asociada (cálculos, tumor).
7. **Anastomosis mucocutánea**: el vértice del colgajo en U se sutura al borde proximal de la uretrotomía con puntos separados de Vicryl 2-0 ó 3-0. Los bordes laterales del cuerpo esponjoso se suturan a los bordes de la adventicia y luego a la piel perineal.
8. **Catéter**: Foley 16 Fr por 4-7 días.
9. **Alta hospitalaria**: habitualmente al día siguiente.

**Técnica no transectante**: variante en que se preserva la placa dorsal del cuerpo esponjoso para mantener la vascularización longitudinal, análoga a la uretroplastia bulbar no transectante.

### Resultados contemporáneos (J Urol 2024)
Un estudio con 76 pacientes y mediana de seguimiento de 55 meses reportó:
- Supervivencia libre de retratamiento: **84%**
- Tasa de estenosis del estoma: **16%**
- Síntomas urinarios (USS-PROM LUTS): mediana 4 (rango 0-24) — excelentes
- Incontinencia (ICIQ-UI SF): mediana 0 (rango 0-21) — la mayoría continentes
- Función sexual: distribución bimodal; mediana IIEF-EF 3,5
- **Satisfacción global**: muy alta — mediana ICIQ-Satisfacción 21 (rango 0-24)

La revisión de la literatura muestra rangos amplios de éxito (51-95%) según definición empleada y la heterogeneidad del grupo de pacientes.

### Asesoramiento pre-quirúrgico
El paciente debe ser informado explícitamente de que:
1. **Orinará sentado** de por vida (o en posición que dirija el chorro hacia el inodoro).
2. La tasa de estenosis del estoma es ~16% y puede requerir revisión.
3. La función eréctil puede verse afectada por la disección bulbar.
4. La continencia generalmente se preserva si el esfínter externo es competente, pero puede haber incontinencia de esfuerzo leve.
5. Si en el futuro requiere EUA, el manejo es más complejo que en configuración anatómica estándar.

## Errores frecuentes
- No extender la uretrotomía suficientemente (< 4 cm): estoma estenótico en la primera revisión.
- No verificar endoscópicamente la ausencia de enfermedad prostática proximal antes de comprometerse con la UP.
- No aconsejar correctamente sobre la micción sentado: pacientes que no se adaptan pueden quedar insatisfechos a pesar de un estoma funcionalmente excelente.

## Referencias
- AUA 2026: Perineal Urethrostomy (PU) — Indications, Blandy Technique and Outcomes.
- J Urol 2024: Cohort study UP, N=76, seguimiento 55 meses.
- Velarde L. 60 Tips. Tips 44, 45, 46, 47.
$body$, 50, 3);

-- ══════════════════════════════════════════════════════════════
-- MÓDULO 6: Liquen Escleroso — Cirugía por Etapas y Manejo Conservador
-- ══════════════════════════════════════════════════════════════
INSERT INTO public.modules (program_id, title, position)
VALUES (v_prog, 'Liquen Escleroso: Estrategia Quirúrgica y Manejo Conservador', 5)
RETURNING id INTO v_mod;

INSERT INTO public.lessons (module_id, title, kind, body, duration_min, position) VALUES
(v_mod, 'Manejo endoscópico del liquen escleroso con cateterismo limpio intermitente', 'texto', $body$
## Objetivos de aprendizaje
Conocer la evidencia que sustenta el manejo conservador de la estenosis uretral por LS mediante terapia endoscópica combinada con cateterismo limpio intermitente (CIC) y medicación intrauretral, identificar los predictores de éxito y fracaso de este enfoque, y saber cuándo escalar hacia la cirugía.

## Desarrollo teórico

### Racional del manejo conservador
La uretroplastia en el LS tiene tasas de éxito inferiores (66-77%) comparadas con otras etiologías (95-97%), y los pacientes con LS frecuentemente recidivan incluso tras reconstrucciones técnicamente perfectas. Esto ha llevado a algunos expertos a proponer el manejo conservador endoscópico+CIC como alternativa válida, especialmente para pacientes mayores, con comorbilidades o reacios a la cirugía mayor.

El manejo conservador NO es simplemente repetir dilataciones: es una estrategia combinada de:
1. Intervención endoscópica inicial (dilatación o uretrotomía interna).
2. CIC regular para mantener la permeabilidad (efecto mecánico de prevención de colapso cicatricial).
3. Medicación intrauretral (clobetasol 0,05%, tadalafil) para reducir la inflamación activa.

### Evidencia clínica

**Peterson et al. (serie original)**:
28 pacientes con LS confirmado histológicamente. Tratamiento inicial con dilatación seguida de clobetasol intrauretral 0,05% dos veces al día por 2-3 meses. Seguimiento medio 24,8 meses. **Resultado: 89% evitó cirugía adicional**.

**Saltman et al. 2025 (seguimiento a largo plazo)**:
111 pacientes con LS y estenosis uretral tratados con dilatación/DVIU + CIC ± esteroides. Seguimiento mediano **68,5 meses**. Éxito (sin catéter permanente ni nueva cirugía): **73,9%**. El éxito fue alto al año (92%) pero decayó con el tiempo; la mediana hasta el fracaso fue de 61 meses. Conclusión: la vigilancia a largo plazo es imprescindible en el manejo conservador del LS.

**Factores de riesgo de fracaso**:
- Compromiso de la uretra posterior.
- Estenosis obliterativas o casi obliterativas en el inicio.
- La longitud de la estenosis NO predijo el fracaso.

### ¿Esteroides o CIC? ¿Cuál es el mecanismo real?
Un análisis de Saltman comparó pacientes con CIC + esteroides vs. CIC solo: tasa de fracaso 23,4% vs. 21,4%. Sin diferencia estadística. Esto sugiere que el efecto mecánico del CIC per se —mantener abierta la uretra, prevenir el colapso cicatricial— puede ser el factor terapéutico principal más que la acción antiinflamatoria del esteroide.

Sin embargo, los esteroides tópicos tienen demostrada eficacia en el LS cutáneo, y el mecanismo biológico del LS (inflamación activa → fibrosis) hace razonable su uso. La decisión pragmática es incluirlos en el régimen inicial y reevaluar su impacto en el seguimiento individual.

### Medicación intrauretral: opciones
- **Clobetasol 0,05%**: esteroide potente de primera línea. Se aplica con dilatador uretral o catéter tipo Foley. Duración habitual del ciclo: 2-3 meses.
- **Tadalafil intrauretral**: inhibidor de PDE5 con potencial efecto antifibrótico (aumenta GMPc, reduce la señalización de TGF-β). El ponente del AUA 2026 lo recomienda como primera línea.
- **Tacrolimus 0,03%**: inmunomodulador no esteroideo. Un estudio aleatorizado (Choudhury et al. 2023, 67 pacientes) comparó clobetasol vs. tacrolimus: ambos mejoraron igual los síntomas (IPSS), pero clobetasol tuvo menor tasa de cirugía adicional (3% vs. 25%). El tacrolimus es opción de segunda línea para pacientes con contraindicación o intolerancia al clobetasol.

### Futuras direcciones
- **Balón recubierto de fármaco (drug-coated balloon, Optilume)**: evaluado en estenosis uretral no LS (ensayo ROBUST). Los pacientes con LS fueron excluidos de ROBUST, por lo que el DCB en LS es prácticamente desconocido; en investigación.
- **Plasma rico en plaquetas (PRP)**: estudiado en LS cutáneo con resultados prometedores. No hay datos robustos en LS uretral; en investigación.

### Indicaciones de escalar a cirugía
- Fracaso del manejo conservador (retención, LUTS refractarios a pesar de CIC y medicación).
- Estenosis obliterativa desde el inicio.
- Compromiso posterior (uretra membranosa o prostática).
- Preferencia del paciente por solución definitiva.

## Errores frecuentes
- Ofrecer manejo conservador en estenosis obliterativas: el fracaso es casi seguro.
- No instaurar el CIC después de la dilatación inicial: la dilatación sola sin CIC tiene alta tasa de recidiva a corto plazo.
- No comunicar al paciente que el éxito disminuye con el tiempo y que necesitará seguimiento indefinido.

## Referencias
- AUA 2026: Urethral Strictures and Lichen Sclerosus Management.
- Saltman et al. Long-term outcomes of endoscopic management with CIC for LS. J Urol. 2025.
- Peterson et al. Intraurethral clobetasol for LS. J Urol. 2020.
- Choudhury et al. Clobetasol vs tacrolimus for LS. J Urol. 2023.
$body$, 45, 0),

(v_mod, 'Uretroplastia en etapas para liquen escleroso: Bracka vs. Johanson-first', 'texto', $body$
## Objetivos de aprendizaje
Comprender la lógica de la uretroplastia en dos etapas para el LS, conocer las características técnicas de la técnica Bracka ("BMG en primera etapa") y del Johanson modificado ("BMG en segunda etapa"), analizar los datos de éxito y complicaciones de ambas estrategias e identificar cuándo cada una es la elección correcta.

## Desarrollo teórico

### Por qué el LS requiere cirugía en etapas
El LS es una enfermedad de campo que afecta la totalidad del epitelio escamoso uretral con patología submucosa activa. Una uretroplastia en un tiempo (injerto único + tubularización inmediata) tiene alta tasa de fallo por:
1. La enfermedad activa puede destruir el injerto o la anastomosis antes de que cure.
2. El "defecto de campo" extiende la enfermedad a mucosa macroscópicamente sana, comprometiendo los márgenes de la reconstrucción.
3. La piel peneana, cuando está afectada por LS, no puede usarse como material de reconstrucción.

La cirugía en dos etapas divide el riesgo: la primera etapa resuelve la obstrucción y prepara el lecho; la segunda etapa — cuando el lecho está maduro y estable — completa la reconstrucción tubular.

### Técnica Bracka ("BMG en primera etapa")
Primera etapa:
1. Resección de toda la uretra estenótica (incluyendo el tejido comprometido por LS).
2. Cosecha de BMG de mejilla bilateral (hasta 10 cm de injerto disponible si se usan ambas mejillas).
3. Aplicación del BMG directamente sobre los cuerpos cavernosos en el lecho del defecto. Capitonaje con puntos transfixiantes a los cuerpos cavernosos cada 1 cm.
4. Los bordes del BMG se suturan a la piel penoescrotal.
5. Resultado: el paciente tiene una "plataforma" de mucosa bucal abierta en el dorso del pene donde antes había uretra. Orina por el periné/escroto.

Segunda etapa (6 meses después):
1. Verificar ausencia de contracción, LS activo (biopsia si hay duda) y adecuada integración del injerto.
2. Incisiones laterales en los bordes del injerto maduro.
3. Tubularización del neoepitelio con sutura continua monofilamento.
4. Cobertura con dartos y piel peneana.

Resultados publicados: éxito global 79-96% según la serie. Tasa de contracción del injerto (requiere injerto adicional antes de la segunda etapa): 12-39%.

### Técnica Johanson-first ("BMG en segunda etapa")
Primera etapa:
1. Apertura longitudinal de toda la uretra estenótica sin resecar tejido (Johanson clásico).
2. Marsupialización de los bordes uretrales a la piel.
3. El paciente orina por el defecto perineal/peneano. Esperar 6 meses.

Segunda etapa:
1. Cosecha de BMG (1,7 cm de ancho).
2. Aplicación del BMG en la placa uretral abierta, sobre el lecho vascularizado por el dartos peneano circundante.
3. Tubularización inmediata con piel peneana sana.

### Evidencia que apoya cada técnica

**A favor de Bracka (BMG en 1ª etapa)**:
- La resección completa del tejido afectado por LS reduce el sustrato de enfermedad activa.
- El BMG maduro (6 meses) tiene mejor comportamiento en la tubularización que el recién aplicado.
- Respaldado por todos los expertos del AUA 2026 como técnica "estándar de facto" para LS.
- ChatGPT y Microsoft Copilot (consultados en el AUA 2026) describen la técnica Bracka como "práctica estándar" para LS.

**A favor de Johanson-first (BMG en 2ª etapa)**:
- Evita la aplicación de BMG directamente sobre los cuerpos cavernosos, donde el riesgo de isquemia parcial es mayor.
- El dartos peneano es mejor lecho receptor que el cuerpo cavernoso expuesto.
- Menor tasa de contracción del injerto en series del grupo de Joshi (porcentaje no publicado aún).
- Resultados Joshi 2026: 89% éxito en 62 pacientes, mediana 40 meses.

### Cómo elegir
- LS con piel peneana sana: Johanson-first puede ser considerado.
- LS con piel peneana afectada por LS: Bracka obligatorio (no hay piel sana para Johanson-first).
- Cualquier duda sobre actividad de LS: biopsia de la placa antes de la segunda etapa.
- Recidiva de LS en el injerto: tratamiento médico (clobetasol tópico) y si fracasa, nueva etapa.

## Errores frecuentes
- Usar piel peneana afectada por LS como material de tubularización: recurrencia en la cicatriz.
- No esperar el tiempo mínimo entre etapas (< 6 meses): el BMG no ha madurado.
- Omitir la biopsia previa a la segunda etapa en pacientes con LS activo conocido.

## Referencias
- AUA 2026: Two-Stage Urethroplasty for Lichen Sclerosus. Debate Bracka vs. Johanson.
- Bracka A. A versatile two-stage urethroplasty. Br J Plast Surg. 1995.
- Joshi P et al. Two-stage urethroplasty for complex penile strictures. J Urol. 2017.
- Velarde L. 60 Tips. Tips 28, 29, 30, 33.
$body$, 50, 1);

-- ══════════════════════════════════════════════════════════════
-- MÓDULO 7: Trauma Uretral y Uretra Posterior
-- ══════════════════════════════════════════════════════════════
INSERT INTO public.modules (program_id, title, position)
VALUES (v_prog, 'Trauma Uretral y Reconstrucción de Uretra Posterior', 6)
RETURNING id INTO v_mod;

INSERT INTO public.lessons (module_id, title, kind, body, duration_min, position) VALUES
(v_mod, 'Lesión uretral por fractura pélvica: fase aguda y planificación', 'texto', $body$
## Objetivos de aprendizaje
Clasificar las lesiones uretrales asociadas a fractura pélvica (PFUI), manejar correctamente la fase aguda incluyendo la decisión de realineamiento vs. derivación suprapúbica, y planificar la uretroplastia posterior diferida con los estudios de imagen apropiados.

## Desarrollo teórico

### Epidemiología y mecanismo
La lesión uretral por fractura pélvica (Pelvic Fracture Urethral Injury, PFUI) ocurre en el 4-14% de las fracturas pélvicas. El mecanismo es el desplazamiento de las ramas pubianas que, al fracturarse, desgarran la uretra membranosa en su punto de unión con el diafragma urogenital. Las fracturas del tipo "libro abierto" (open-book) tienen mayor tasa de lesión uretral. Hasta el 80% de las PFUI se asocia a rupturas del plexo pelviano con disfunción eréctil (30-80%) e incontinencia (5-10%).

### Clasificación
La clasificación de Goldman et al. (modificada) es la más utilizada:
- **Grado 1**: contusión uretral. Sangre en meato, sin extravasación en UCG.
- **Grado 2**: elongación uretral sin ruptura.
- **Grado 3**: ruptura parcial (< 50% de la circunferencia).
- **Grado 4**: ruptura completa con desplazamiento (distracción) de los cabos.
- **Grado 5**: ruptura completa con extensión a cuello vesical o vagina.

### Manejo agudo: ¿realineamiento o suprapúbico?
Esta es la decisión más importante en la fase aguda. Existen dos escuelas:

**Derivación suprapúbica inmediata + uretroplastia diferida** (3-6 meses):
- Opción más conservadora y la que da mejores resultados funcionales globales.
- El catéter suprapúbico se coloca en urgencias bajo ecografía (o cistostomía abierta si no es posible).
- La uretroplastia posterior se realiza 3-6 meses después cuando el hematoma pélvico ha organizado y los planos de disección son más definidos.
- Tasa de éxito de uretroplastia posterior diferida: 85-95%.

**Realineamiento uretral endoscópico primario**:
- Consiste en restablecer la continuidad uretral mediante catéter uretral, habitualmente guiado por cistoscopía combinada anterógrada y retrógrada.
- Ventajas teóricas: puede reducir la longitud de la distracción final, facilitando la futura uretroplastia.
- Desventajas: el realineamiento en el contexto de un trauma pélvico activo aumenta el riesgo de infección pélvica, hemorragia adicional y daño neurovascular. Las tasas de éxito del realineamiento solo (sin posterior uretroplastia) son del 30-40%.
- La posición consensuada actual (AUA Guidelines) es que el **realineamiento no sustituye a la uretroplastia posterior**: la mayoría de pacientes realineados necesitarán uretroplastia definitiva.

### Planificación de la uretroplastia posterior
**Estudios preoperatorios**:
1. **UCG retrógrada y MCU anterógrada**: determinar la longitud de la distracción uretral. Una distracción < 2 cm indica anastomosis simple; > 2 cm requiere maniobras adicionales.
2. **Resonancia magnética pélvica**: el mejor estudio para medir la distracción exacta, identificar el trayecto del cabo proximal, descartar extensión al cuello vesical y evaluar el grado de hematoma organizado residual.
3. **Ecografía Doppler peneal** (Tip 39): mapea la vascularización del pene antes de la cirugía, identificando si las arterias cavernosas y dorsales están intactas. Un Doppler normal se asocia a mejor pronóstico de función eréctil postoperatoria.
4. **Urodinámica**: si hay historia de incontinencia preoperatoria, es imprescindible evaluar la función del esfínter antes de la uretroplastia posterior.

### Lesiones uretrales en el paciente lesionado medular (Tip 48)
Los pacientes con lesión medular son especialmente vulnerables a las estenosis uretrales por:
- Cateterismo uretral crónico o CIC frecuente.
- Sensación disminuida o ausente: pueden no reportar síntomas hasta una obstrucción avanzada.
- Anatomía pélvica alterada.

El manejo de la estenosis en este grupo sigue los mismos principios que en la población general, pero con consideraciones adicionales: la UP puede facilitar el CIC postoperatorio en pacientes con dificultad para cateterizarse por la vía transuretral.

## Errores frecuentes
- Intentar el realineamiento en un paciente hemodinámicamente inestable: la prioridad es el control de la hemorragia pélvica.
- No colocar catéter suprapúbico en urgencias: el paciente llega a la uretroplastia posterior con vejiga cronicamente distendida y deterioro de la función vesical.
- Operar la uretroplastia posterior antes de los 3 meses: el hematoma no ha madurado, los planos son imprecisables y el riesgo de complicaciones es mayor.

## Referencias
- Goldman SM et al. Classification of PFUI. J Urol. 1997.
- Velarde L. 60 Tips. Tips 34, 35, 36, 48.
- AUA Guideline: Urotrauma. 2020.
- Martins FE. Textbook. Caps. 21-22.
$body$, 50, 0),

(v_mod, 'Uretroplastia posterior: técnica de Webster, pubectomía y búsqueda del cabo proximal', 'texto', $body$
## Objetivos de aprendizaje
Describir paso a paso la técnica de uretroplastia posterior perineal para la PFUI (técnica de Webster), conocer las maniobras de ganancia de longitud incluyendo la pubectomía inferior, e identificar el cabo proximal obliterado mediante luz y técnicas complementarias.

## Desarrollo teórico

### Principios de la uretroplastia posterior
La uretroplastia posterior por PFUI es la cirugía reconstructiva más compleja de la urología. Los principios que la gobiernan son:
1. **Resección completa del tejido cicatricial** interpuesto entre los cabos uretrales.
2. **Movilización suficiente de los cabos** para lograr una anastomosis sin tensión.
3. **Anastomosis directa término-terminal** (EPA): el gold standard con las mejores tasas de permeabilidad.
4. **Sin injertos de rutina**: la anastomosis sin injertos tiene mejores resultados. Los injertos (BMG) se reservan para cuando la anastomosis directa es imposible por longitud excesiva.

### Técnica de Webster (pasos quirúrgicos)

**Acceso perineal**:
- Incisión perineal media, separador de Scott, exposición del bulbo.
- División del músculo bulbocavernoso en línea media.
- Movilización del cuerpo esponjoso-uretra hasta la uretra membranosa distal.

**Identificación de la estenosis**:
- Se palpa la induración cicatricial.
- El cistoscopio flexible anterógrado (vía suprapúbica) ilumina el cabo proximal desde dentro, permitiendo su identificación exacta en el campo perineal.
- El retractor de Teales Gorget protege la uretra posterior durante la disección (Tip 38).

**Búsqueda del cabo proximal obliterado** (Tip 37):
- En distacciones largas, el cabo proximal puede estar muy craneal y profundo, rodeado de tejido fibrótico denso.
- Técnicas de identificación:
  1. Cistoscopio anterógrado con fuente de luz brillante para transiluminación.
  2. Paso de dilatadores de Bakes o histerómetro vía suprapúbica hacia distal para tentar el cabo proximal.
  3. Imagen intraoperatoria con fluoroscopía para localizar guías metálicas.
  4. Incisión de la cortical inferior de la sínfisis del pubis para exposición directa.

**Resección del tejido cicatricial**:
- Todo el tejido fibrótico interpuesto entre los cabos debe resecarse hasta llegar a tejido sano con mucosa urotelial íntegra en ambos lados.
- Los bordes de la mucosa sana sangran activamente (señal de vitalidad).

**Maniobras de ganancia de longitud** (para lograr anastomosis sin tensión):
1. **Movilización circunferencial del cabo distal**: separación del cuerpo esponjoso de los cuerpos cavernosos en 180°.
2. **Splitting de los cuerpos cavernosos**: separación del cuerpo esponjoso entre los cuerpos cavernosos (disociación parcial del rafe inferior). Gana 1-2 cm.
3. **Pubectomía inferior** (Tip 9): resección del pico inferior de la sínfisis del pubis con osteótomo y gubia. Permite acortar el trayecto hasta el cabo proximal. Indicada cuando la distracción es > 3-4 cm. Se realiza mediante instrumental específico (gubias de Kerrison, osteótomo).
4. **Reruteo transpúbico** (procedimiento de Turner-Warwick): para distacciones extremas (> 5 cm), la uretra se redirige a través de un túnel transpúbico. Alta complejidad técnica, reservada para centros de referencia.

**Anastomosis**:
- PDS 4-0 monofilamento, sutura interrumpida o continua en dos planos (mucosa y adventicia).
- Primero se colocan los puntos posteriores con la anastomosis "abierta", luego se anudan al cerrar.
- Cistoscopía de verificación al finalizar.

### Ecografía Doppler peneal preoperatoria (Tip 39)
El mapeo Doppler preoperatorio de las arterias del pene (dorsal, cavernosa, bulbouretral) permite predecir el riesgo de disfunción eréctil postoperatoria. Un Doppler con pico sistólico < 25 cm/s sugiere compromiso vascular previo a la cirugía. Esta información debe incluirse en el consentimiento informado y puede modificar la estrategia quirúrgica (p. ej., priorizar técnicas no transectantes o planificar colocación de prótesis peneana en el mismo tiempo si el paciente ya tiene DE preoperatoria severa).

### Resultados de la uretroplastia posterior
Las mejores series de centros de referencia reportan:
- Permeabilidad uretral a 5 años: 85-95%.
- Disfunción eréctil de novo: 5-20% (depende de lesión neurológica preexistente).
- Incontinencia postoperatoria: 5-10% (depende del estado del esfínter preoperatorio).

## Errores frecuentes
- No respetar el principio de "sin tensión": la anastomosis bajo tensión falla en el 100% de los casos a largo plazo.
- Omitir la pubectomía por desconocimiento de la técnica cuando la distracción lo requiere.
- No mapear el estado del esfínter preoperatoriamente: si el esfínter está lesionado, el paciente necesitará EUA después de la uretroplastia.

## Referencias
- Webster GD. Posterior urethroplasty. J Urol. 1983.
- Velarde L. 60 Tips. Tips 9, 37, 38, 39, 40.
- Martins FE. Textbook. Caps. 21-22.
$body$, 55, 1);

-- ══════════════════════════════════════════════════════════════
-- MÓDULO 8: Estenosis Posterior por Radioterapia y Cuello Vesical
-- ══════════════════════════════════════════════════════════════
INSERT INTO public.modules (program_id, title, position)
VALUES (v_prog, 'Estenosis Anastomótica Vesicouretral y Cuello Vesical', 7)
RETURNING id INTO v_mod;

INSERT INTO public.lessons (module_id, title, kind, body, duration_min, position) VALUES
(v_mod, 'Estenosis anastomótica vesicouretral post-prostatectomía: diagnóstico y manejo endoscópico', 'texto', $body$
## Objetivos de aprendizaje
Distinguir la estenosis anastomótica vesicouretral (VUAS) de otras estenosis posteriores, conocer la estrategia endoscópica de primera línea incluyendo la técnica de incisión y el papel de los nuevos dispositivos (Optilume), y saber cuándo derivar a reconstrucción abierta o robótica.

## Desarrollo teórico

### Diagnóstico diferencial: VUAS vs. BNS
La estenosis anastomótica vesicouretral (VUAS, Vesicourethral Anastomotic Stenosis) ocurre en el 0,5-9% de los pacientes tras prostatectomía radical, con mayor incidencia en técnicas a cielo abierto que en robótica. Debe diferenciarse de la estenosis de cuello vesical (BNS, Bladder Neck Stenosis) que ocurre tras cirugía endoscópica de próstata (RTU-P, enucleación láser) o radioterapia. Aunque el manejo comparte principios, la patología subyacente difiere:
- **VUAS**: cicatriz de la anastomosis entre vejiga y uretra membranosa. Los planos anatómicos son los de la prostatectomía.
- **BNS**: estenosis del cuello vesical. Puede estar asociada a AUS (complicando su manejo futuro) o a radioterapia (con fibrosis calcificada densa).

La UCG + MCU permite clasificar la localización exacta. La clasificación correcta (BNS vs. VUAS vs. BNS asociada a AUS) predice el resultado quirúrgico mejor que la técnica utilizada.

### Incidencia de VUAS y factores de riesgo
Incidencia de VUAS: 0,5-9% post-prostatectomía radical. La radioterapia adyuvante o de rescate aumenta significativamente la tasa: la continencia urinaria a los 36 meses es 87% sin RT vs. 59% con RT adyuvante (p<0,001). El campo irradiado también aumenta la densidad cicatricial y reduce la respuesta al tratamiento endoscópico.

### Manejo endoscópico: primera línea

**Dilatación uretral**: tasa de éxito ~52%. Técnicamente simple pero con alta tasa de recurrencia. Primera opción en estenosis breves y no obliterativas.

**Incisión endoscópica (DVIU/TUIBN)**:
- Tasa de éxito individual ~78%.
- Éxito global con procedimientos secuenciales: ~72%, acumulativo hasta 91%.
- Técnica del AUA 2026: incisiones profundas laterales con cuchillo de Collins eléctrico a las posiciones de las 3 y las 9 del reloj, avanzando hasta la grasa perivesical sana. Guidewire previo para seguridad. Corriente de corte puro (no mixta ni coagulación). NO usar coagulación intraluminal.
- Radioterapia previa reduce el éxito a ~42-58%, siendo indicación de consideración temprana de reconstrucción.

**Resección endoscópica**: para tejido cicatricial más abundante, la resección con asa de RTU puede ser necesaria antes de la dilatación final.

### Cuidado: riesgo de incontinencia
La incisión de la VUAS conlleva riesgo de incontinencia de esfuerzo de novo, especialmente en pacientes irradiados donde el esfínter residual ya está comprometido. El asesoramiento preoperatorio debe incluir la posibilidad de requerir EUA después. Se recomienda una estrategia escalonada: resolver primero la estenosis, luego tratar la incontinencia.

### Optilume DCB (drug-coated balloon)
El balón de dilatación recubierto de paclitaxel (Optilume) combina la dilatación mecánica con la liberación local del fármaco antiproliferativo. Datos preliminares retrospecivos y estudios de mundo real muestran mejoría de la supervivencia libre de recurrencia y de los parámetros de calidad de vida comparados con la dilatación simple. Sin embargo, el uso en VUAS y BNS es actualmente off-label (los estudios ROBUST evaluaron estenosis uretral anterior). Los datos en VUAS son de cohortes pequeñas. El AUA 2026 lo califica como "promisorio pero sin validación definitiva" en esta indicación.

### Indicaciones de reconstrucción quirúrgica
- Fracaso de ≥ 2 procedimientos endoscópicos en no irradiados.
- Fracaso de ≥ 1 procedimiento en irradiados.
- Estenosis obliterativa completa desde el inicio.
- Paciente que prefiere una solución más definitiva.

Las opciones reconstructivas incluyen: uretroplastia perineal con onlay de BMG (abordaje abierto), reconstrucción robótica retransuretral (RBUS), Y-V plastia de cuello vesical y derivación urinaria en casos extremos (ver Módulo 9).

## Errores frecuentes
- No informar al paciente del riesgo de incontinencia antes de la incisión endoscópica.
- Repetir indefinidamente las incisiones en un irradiado sin derivar a reconstrucción.
- Confundir una VUAS con una estenosis de uretra membranosa: tienen manejo diferente.

## Referencias
- AUA 2026 Panel: Management of Bladder Neck Stenosis and Vesicourethral Anastomotic Stenosis.
- Suardi N et al. Impact of adjuvant RT on continence. Eur Urol. 2014.
- Velarde L. 60 Tips. Tips 41, 42, 43.
$body$, 50, 0),

(v_mod, 'Estenosis de cuello vesical: reconstrucción y derivación urinaria', 'texto', $body$
## Objetivos de aprendizaje
Establecer el algoritmo de manejo de la estenosis de cuello vesical (BNS) post-RTU y post-radioterapia, conocer las opciones reconstructivas abiertas y robóticas, y conocer el algoritmo de derivación urinaria para los casos no reconstruibles.

## Desarrollo teórico

### Etiología y clasificación
La BNS puede ocurrir tras RTU de próstata (incidencia ~1%), enucleación láser prostática, radioterapia externa de próstata o braquiterapia, o tras colocación de EUA. La distinción entre BNS "verdadera" y BNS asociada a EUA es crítica: la clasificación correcta predice el resultado más que la técnica quirúrgica.

**Patología en campo irradiado**: el cuello vesical irradiado presenta fibrosis densa, calcificaciones periuretrales, necrosis focal y falta de planos de disección claros. El tratamiento es significativamente más difícil y los resultados peores.

### Algoritmo de manejo escalonado

**Paso 1 — Diagnóstico**:
- UCG + MCU: localización y extensión.
- Cistoscopía flexible: evaluación del cuello, biopsias si neoplasia, evaluación de vejiga (compliance, capacidad).
- Urodinámica: si hay incontinencia o sospecha de vejiga de baja compliance.

**Paso 2 — Primera línea endoscópica**:
- Incisión transuretral del cuello vesical (TUIBN) con cuchillo frío o Collins eléctrico. Incisiones a las 5 y las 7 del reloj (para preservar la zona de control del esfínter).
- Éxito en no irradiados: 70-80%. En irradiados: 40-60%.
- Dilatación con balón: puede combinarse con TUIBN; Optilume off-label en investigación.
- Moduladores: mitomicina C intralesional post-TUIBN muestra mejora marginal en algunas series; esteroides intravesicales: datos limitados.

**Paso 3 — Reconstrucción quirúrgica** (para fracasos):

*Y-V plastia de cuello vesical (modificada)*:
Indicada en BNS no irradiada recurrente. Técnica abierta transvesical:
1. Acceso retropúbico, apertura de la vejiga.
2. Resección completa del tejido cicatricial del cuello.
3. Plastia en Y-V con colgajos de pared vesical en T bilateral para ampliar el neotrígono y prevenir fugas.
4. Anastomosis del cuello remodelado a la uretra membranosa.
5. Doble derivación (Foley + SPT) + tutorización ureteral selectiva próxima a la anastomosis.

Un estudio de 65 pacientes reportó: baja tasa de complicaciones a 30 días, 94% de supervivencia de tratamiento a 5 años, alta satisfacción. El predictor más importante de éxito: clasificación correcta (BNS vs. BNS asociada a AUS).

*Reconstrucción robótica retransuretral/transvesical*:
La plataforma robótica (da Vinci SP especialmente) permite la reconstrucción de la VUAS/BNS sin conversión abierta:
- **Abordaje retransuretral (re-do anastomosis)**: disección cuidadosa "hacia la luz" del cistoscopio anterógrado, anastomosis término-terminal con sutura barbada (barbed suture).
- **Abordaje transvesical**: coloca el robot directamente dentro de la vejiga para acceder al cuello desde adentro, evitando la disección anterior. Reporta 91% de patencia y 0% de incontinencia de novo en series seleccionadas.

*Onlay dorsal perineal con BMG*:
Para VUAS y BNS accesibles por vía perineal. Tasas de patencia 84-91% con bajo riesgo de incontinencia de novo (preservación del esfínter). Técnicamente exigente: requiere acceso al cuello a través de la pelvis perineal profunda.

**Paso 4 — Derivación urinaria** (último recurso):
Para el "outlet devastado" (cuello vesical irreconstruible con vejiga no funcional o continencia irrecuperable):

*Algoritmo de decisión*:
- ¿Vejiga salvable? Si no → cistectomía con derivación.
- Vejiga salvable con incontinencia refractaria → cierre de cuello + cabestringue o AUS en posición periprotésica.
- Vejiga de baja compliance/capacidad reducida → aumentación vesical ± canal cateterizable de Mitrofanoff.
- Función vesical normal solo con obstrucción → canal cateterizable.

*Derivación con conduit ileal (Bricker)*: para vejiga no salvable. Indicada cuando la capacidad/compliance es irrecuperable. Riesgos a largo plazo: estenosis ureteroentérica, cálculos, hernia parastomal, desequilibrio metabólico.

Perlas técnicas del AUA 2026 para derivación robótica:
- ICG (indocianina verde) para verificar perfusión del conduit.
- Acortamiento de uréteres para reducir estenosis ureteroentéricas.
- Anastomosis ureteroentéricas con puntos separados finos.
- Estoma con técnica de Brooke para evitar estenosis.
- Test frecuente del catéter en canales cateterizables por falta de retroalimentación táctil.

## Errores frecuentes
- Clasificar erróneamente BNS asociada a EUA como BNS simple: el manejo difiere.
- Operar reconstrucción en campo irradiado sin considerar oxígeno hiperbárico preoperatorio.
- No evaluar la vejiga antes de la derivación: una vejiga con compliance normal que podría haber sido salvada pierde la oportunidad de reconstrucción.

## Referencias
- AUA 2026 Panel: BNS and VUAS — Techniques, Reconstruction and Diversion.
- Y-V plasty series: 65 pacientes, 94% supervivencia a 5 años.
- Velarde L. 60 Tips. Tips 49.
- Martins FE. Textbook. Caps. 23-25.
$body$, 55, 1);

-- ══════════════════════════════════════════════════════════════
-- MÓDULO 9: Incontinencia Urinaria Masculina Post-Prostatectomía
-- ══════════════════════════════════════════════════════════════
INSERT INTO public.modules (program_id, title, position)
VALUES (v_prog, 'Incontinencia Urinaria Masculina Post-Prostatectomía: Cabestrillos y EUA', 8)
RETURNING id INTO v_mod;

INSERT INTO public.lessons (module_id, title, kind, body, duration_min, position) VALUES
(v_mod, 'Cabestrillos masculinos y EUA: selección del paciente y evidencia 2024-2026', 'texto', $body$
## Objetivos de aprendizaje
Conocer el mecanismo de acción y las indicaciones de los cabestrillos masculinos (AdVance XP, ATOMS) y del esfínter urinario artificial (EUA) para la incontinencia urinaria masculina post-prostatectomía (IUPP), aplicar las guías AUA/EAU en la selección de la cirugía y conocer el impacto de la radioterapia previa en los resultados.

## Desarrollo teórico

### Fisiopatología de la IUPP
La incontinencia post-prostatectomía radical es predominantemente de esfuerzo (IUE), causada por insuficiencia del esfínter uretral externo tras la remoción de la próstata y la anastomosis vesicouretral. Factores adicionales:
- Lesión directa del esfínter.
- Desvasculariación del tejido periuretral.
- Denervación parcial del esfínter.
- En pacientes irradiados: microvascularización comprometida, fibrosis, incapacidad de curación, deficiencia esfinteriana más severa.

La evaluación preoperatoria (antes de implantar cualquier dispositivo) debe incluir:
- Definición del tipo (IUE, urgencia o mixta) y severidad (número de pads/día, pad test).
- Estabilización: mínimo 12 meses de conservadurismo antes de cirugía.
- Cistoscopía: evaluar mucosa uretral, descartar estenosis anastomótica concomitante.
- Urodinámica (si IUE severa o mixta): descartar vejiga hiperactivadora y evaluar el perfil de presión uretral.

### Cabestrillos masculinos

**AdVance XP (Boston Scientific)**:
Cabestrillo retropúbico transobturador de malla. Mecanismo: reposiciona la uretra hacia craneal-anterior, comprimiendo pasivamente el esfínter externo residual.

*Indicaciones*: IUE leve-moderada (1-3 pads/día), esfínter con movilidad uretral preservada (sin hipovascularización severa), No irradiado o irradiado con selección muy cuidadosa.

*Tasa de éxito no irradiados*: ~67% a 24 meses.

*Tasa de fracaso en irradiados*: 60-71% (Torrey et al.: 71,4% fracaso en irradiados vs. 10% en no irradiados). En el mismo estudio, 42,9% de irradiados empeoró sus síntomas tras el cabestrillo.

*Meta-análisis*: OR de éxito 0,68 (p<0,001), OR de cura 0,67 (p<0,001) en irradiados vs no irradiados. Complicaciones (infección, extrusión) 3 veces más frecuentes en irradiados.

**ATOMS (Agency for Medical Innovations)**:
Sistema transobturador masculino ajustable (Adjustable Transobturator Male System). Diseño no circunferencial (diferente a EUA). Puede ajustarse postoperatoriamente mediante puerto subcutáneo. Menor riesgo de erosión que EUA por compresión no circunferencial.

*Ventajas en irradiados*: el diseño no circunferencial reduce el riesgo de erosión; el ajuste postoperatorio evita reoperaciones por presión insuficiente; puede ser segunda opción si el cabestrillo fijo falla.

*Limitaciones*: menor evidencia de largo plazo que EUA; la tasa de éxito sigue siendo inferior en irradiados respecto a no irradiados; algunos estudios indican que el timing (≥ 24 meses post-radioterapia) mejora los resultados.

### Esfínter urinario artificial (EUA)

**Mecanismo**: compresión circunferencial permanente del bulbo uretral mediante un manguito de presión regulada (cuff). La activación/desactivación voluntaria mediante la bomba escrotal permite la micción.

**Indicaciones según guías**:
- AUA/GURS/SUFU (2024): "Se debe ofrecer EUA por encima de cabestrillos masculinos o balones ajustables en pacientes con IUE post-radioterapia que buscan manejo quirúrgico" (Recomendación moderada, Evidencia C).
- EAU 2024: "La eficacia del cabestrillo fijo es limitada en hombres con incontinencia severa o antecedente de radioterapia."

**Ventajas del EUA**:
- Gold standard para IUE severa (> 3 pads/día).
- Eficaz en campo irradiado donde otros dispositivos fallan.
- Datos a largo plazo (50+ años de uso clínico desde 1972).
- Revisiones son manejables y conocidas.

**Tasas de continencia**: 73-85% a largo plazo. Las revisiones son esperadas (~25% a 5 años por erosión, mecánica o atrofia uretral), pero cada revisión puede resolverse; los "desvíos" a través de cabestrillos fallidos llevan igualmente al EUA pero con mayor morbilidad acumulada.

**Candidato ideal para cabestrillo**:
- IUE muy leve (1-2 pads/día).
- Sin cambios significativos en la mucosa por radioterapia.
- Coaptación uretral demostrable (esfínter residual funcional).
- Buen control voluntario del esfínter.
- En pacientes irradiados: el AUA 2026 concluye que la selección es clave y el asesoramiento debe incluir la alta tasa de fracaso y la disponibilidad del EUA como rescate.

### Doble implante AUS + IPP (prótesis de pene)
Un 25-30% de los pacientes con IUE post-prostatectomía también tiene disfunción eréctil severa. La implantación simultánea (sincrona) de AUS + prótesis inflable de pene (IPP) ha demostrado en una revisión sistemática de >16.000 pacientes equivalencia en complicaciones y reoperaciones respecto a la cirugía escalonada, con mayor satisfacción del paciente en el grupo síncrono. Sin embargo, el sistema de reembolso de Medicare en EEUU penaliza el segundo procedimiento (50% de reducción), lo que desincentiva la cirugía síncrona económicamente.

## Errores frecuentes
- Implantar cabestrillo en un irradiado sin asesoramiento adecuado sobre la tasa de fracaso.
- No esperar 12 meses de rehabilitación de suelo pélvico antes de ofrecer cirugía.
- No realizar cistoscopía preoperatoria: puede haber VUAS concomitante que requiere corrección antes del EUA.

## Referencias
- AUA/GURS/SUFU Guideline: Incontinence After Prostate Treatment. 2024. Statement 24.
- AUA 2026: Surgical Management of Post-Prostatectomy Incontinence with Male Slings vs AUS.
- AUA 2026: AUS Preference for Male SUI Post-Radiotherapy at MSKCC (Divya Ajay).
- AUA 2026: Economic Disincentives Override Clinical Evidence in Surgical Decisions for AUS and IPP.
- Suardi N et al. Eur Urol. 2014.
$body$, 60, 0);

-- ══════════════════════════════════════════════════════════════
-- MÓDULO 10: Uretra Femenina
-- ══════════════════════════════════════════════════════════════
INSERT INTO public.modules (program_id, title, position)
VALUES (v_prog, 'Estenosis Uretral Femenina y Patología Asociada', 9)
RETURNING id INTO v_mod;

INSERT INTO public.lessons (module_id, title, kind, body, duration_min, position) VALUES
(v_mod, 'Diagnóstico y uretroplastia en la estenosis uretral femenina', 'texto', $body$
## Objetivos de aprendizaje
Conocer la epidemiología, etiología y clasificación de la estenosis uretral femenina, comparar la uretroplastia con injerto de mucosa vs. la uretrotomía interna, y describir las técnicas de uretroplastia dorsal y ventral en la mujer con sus resultados.

## Desarrollo teórico

### Epidemiología y etiología
La estenosis uretral femenina es menos frecuente que la masculina pero significativamente subdiagnosticada. La uretra femenina mide 3-5 cm y es totalmente anterior; no existe distinción posterior/anterior análoga a la del varón. Las causas principales incluyen:
- **Iatrogénica**: cateterismo uretral repetido, sondaje traumático, cirugía pélvica previa (histerectomía, colpoplastia anterior), instrumentación diagnóstica.
- **Post-radioterapia**: radioterapia pelviana para cáncer de útero, cérvix, vejiga o recto.
- **Post-infecciosa**: uretritis crónica por gonorrea o clamidia (infrecuente en países desarrollados).
- **Traumática**: trauma perineal, fractura pélvica con lesión uretral femenina (menos frecuente que en el varón).
- **Liquen escleroso**: el LS puede afectar también la uretra femenina, especialmente el meato.
- **Idiopática**: en muchos casos la causa no es identificable.

### Diagnóstico
El diagnóstico de estenosis uretral femenina es a menudo tardío porque los síntomas (LUTS obstructivos: chorro débil, micción prolongada, residuo postmiccional) se atribuyen erróneamente a vejiga hiperactiva o infección urinaria recurrente.

**Herramientas diagnósticas**:
- **Calibración uretral**: la uretra femenina normal acepta un catéter de ≥ 24 Fr; < 14 Fr indica estenosis significativa.
- **Uroflujometría**: curva en meseta con Qmax < 12 mL/s.
- **Uretrocistografía femenina** (Tip 52): técnica específica con posicionamiento lateral, inyección de contraste retrógrado desde la meato con sonda calibrada. Permite visualizar el meato, la uretra y el cuello vesical.
- **Uretroscopía**: confirma la localización y permite biopsiar si hay sospecha de LS o neoplasia.

### Superioridad de la uretroplastia sobre la uretrotomía interna
Un estudio prospectivo aleatorizado (presentado en el AUA 2026 en portugués) comparó directamente la uretroplastia con injerto de mucosa versus la uretrotomía interna para estenosis uretral femenina:
- La **uretroplastia con injerto de mucosa fue superior** en todas las métricas de éxito a largo plazo.
- La uretrotomía interna tuvo resultados inferiores y no debe considerarse primera línea definitiva.
- El posicionamiento del injerto (dorsal vs. ventral) presentó **eficacia equivalente**.
- La fuente del injerto (mucosa de labio menor vs. mucosa labial vs. mucosa bucal) presentó **eficacia equivalente**.

### Técnica de uretroplastia femenina

**Abordaje dorsal** (Tip 53):
1. Posición ginecológica. Incisión en la cara anterior de la vagina (cara dorsal de la uretra desde el punto de vista de la uretra misma).
2. Disección en el plano uretrovaginal.
3. Uretrotomía longitudinal en la cara dorsal de la uretra a lo largo de la estenosis.
4. Cosecha del injerto de mucosa (labio menor, labio mayor o mucosa bucal de mejilla).
5. Capitonaje del injerto sobre la cara dorsal de la uretra (Tip 54): puntos transfixiantes que anclan el injerto a la vagina anterior.
6. Los bordes del injerto se suturan a los bordes de la uretrotomía.
7. Cierre vaginal con puntos separados de Vicryl 2-0.
8. Catéter uretral 14-16 Fr por 2-3 semanas.

**Abordaje ventral**:
1. Incisión en la cara ventral (meato-uretral) de la uretra.
2. Uretrotomía ventral longitudinal.
3. Aplicación del injerto sobre la cara ventral, capitonaje al tejido subcutáneo.
4. Cierre cutáneo suprayacente.

El abordaje dorsal es preferido por muchos cirujanos por la mejor exposición del campo vaginal y la posibilidad de usar la vagina como lecho receptor vascularizado. El ventral es más intuitivo anatómicamente para quienes provienen de la cirugía masculina. Los resultados son equivalentes.

### Lesiones del meato y patología periuretral femenina
- **Meato estenótico**: meatotomía con bisturí oftálmico + Tip 55.
- **Quistes periuretrales** (Tip 56): los quistes de glándulas de Skene se tratan mediante marsupialización o resección. Los ureteroceles ectópicos pueden simular quistes periuretrales.
- **Colgajo de Martius** (Tip 57): usado como refuerzo en reparaciones de fístulas uretrales femeninas complejas o post-radioterapia. El tejido adiposo vascularizado de los labios mayores sirve como puente entre la uretra y la vagina, interponiendo tejido sano en campos comprometidos.
- **Cabestrillo autólogo suburetral** (Tip 58): para la incontinencia urinaria de esfuerzo con uretra de riesgo (uretra de baja presión, fallo previo de cabestrillo), se usa una tira de fascia lata o fascia del recto abdominal.
- **Cierre de cuello vesical femenino** (Tip 59): indicado en pacientes con vejiga neurógena y continencia irrecuperable. Técnica transvesical con disección del trígono y cierre del cuello en múltiples capas.
- **Cáncer de uretra** (Tip 60): raro, con incidencia de 1-2/millón de mujeres/año. La presentación más frecuente es hematuria o masa uretral. El cirujano reconstructivo debe incluirlo en el diagnóstico diferencial de masas uretrales y derivar a oncología urológica cuando corresponde.

## Errores frecuentes
- No incluir la estenosis uretral en el diagnóstico diferencial de una mujer con LUTS "refractaria" a tratamientos de vejiga hiperactiva.
- No realizar calibración uretral en la primera evaluación de una mujer con flujo débil.
- Ofrecer uretrotomía interna repetida como tratamiento definitivo: la uretroplastia es superior.

## Referencias
- AUA 2026: Uretroplastia con enxerto de mucosa é superior à uretrotomia interna na estenose uretral feminina (estudio prospectivo aleatorizado, AUA 2026).
- Velarde L. 60 Tips. Tips 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60.
- Martins FE. Textbook. Caps. 8-9.
$body$, 50, 0);

-- ══════════════════════════════════════════════════════════════
-- MÓDULO 11: Cirugía Robótica y Futuro de la Uretroplastia
-- ══════════════════════════════════════════════════════════════
INSERT INTO public.modules (program_id, title, position)
VALUES (v_prog, 'Cirugía Robótica y Futuro de la Uretroplastia', 10)
RETURNING id INTO v_mod;

INSERT INTO public.lessons (module_id, title, kind, body, duration_min, position) VALUES
(v_mod, 'Plataformas robóticas en urología reconstructiva: aplicaciones y resultados', 'texto', $body$
## Objetivos de aprendizaje
Conocer las plataformas robóticas aplicadas a la urología reconstructiva, sus ventajas sobre la cirugía abierta en procedimientos seleccionados, y las innovaciones técnicas que han convertido procedimientos antes imposibles en cirugía ambulatoria rutinaria.

## Desarrollo teórico

### Racional del abordaje robótico en reconstructiva
La cirugía robótica aborda las limitaciones principales de la cirugía abierta en el campo pélvico profundo:
- **Visualización 3D de alta definición**: magnificación × 10 con profundidad de campo, superior a cualquier lupa quirúrgica.
- **Instrumentos "wristed" (articulados)**: 7 grados de libertad que superan las restricciones anatómicas de la cirugía laparoscópica y minimizan las restricciones de la abierta profunda.
- **Filtro de temblor**: elimina el temblor fisiológico, crucial para anastomosis de precisión en zonas profundas.
- **Ergonomía del cirujano**: posición sentada, sin fatiga postural en casos de larga duración.

### Da Vinci SP (Single Port) en reconstructiva
El robot de un solo puerto (SP) ha sido el dispositivo transformador en la urología reconstructiva. A diferencia del sistema multiport estándar, el SP introduce todos los instrumentos a través de una única incisión de 2,5 cm, lo que permite:

- **Uretroplastia bulbar retroperitoneal**: para estenosis de la uretra proximal, el SP accede retroperitonealmente a través de una única incisión. La estenosis se localiza endoscópicamente, el graft se sutura al borde uretral, se acolcha al músculo psoas, y se completa el onlay dorsal. Un procedimiento antes difícil se convierte en cirugía ambulatoria estándar.

- **Reconstrucción de BUAS (anastomosis urethrovesical stenosis)**: el SP coloca el robot directamente dentro de la vejiga (abordaje transvesical), incide la cicatriz y aplica el injerto de mucosa bucal en posición dorsolateral. Un paciente con > 20 procedimientos endoscópicos previos durante 5 años fue tratado exitosamente en un procedimiento de 2 horas en régimen ambulatorio.

- **Cirugía de afirmación de género (vaginoplastia)**: el robot permite disección anterógrada de la cavidad neovaginal desde arriba con colgajos pediculados bien vascularizados, logrando profundidad de ~15 cm consistentemente con menos de 1 fístula por 500 casos.

- **Fístulas complejas post-radioterapia**: el SP puede asistir en la preparación del sitio y la anastomosis microvascular en combinación con el microscopio quirúrgico.

### Innovaciones técnicas

**Concepto "adjacent possible"** (del AUA 2026):
Las mayores innovaciones en cirugía robótica reconstructiva no son saltos cuánticos sino avances incrementales sobre técnicas abiertas existentes:
- La uretroplastia bulbar robótica extiende la técnica open de Barbagli al abordaje robótico.
- La reparación robótica de uretra posterior evoluciona del procedimiento open de Pierce añadiendo visión 3D y BMG.

**Filosofía ante las complicaciones**:
El AUA 2026 presentó una reflexión sobre el abordaje mental de las complicaciones: en lugar de verlas como fracasos personales, deben considerarse "capas más profundas del original plegamiento quirúrgico" — inherentes al oficio y necesarias para el crecimiento. Cada complicación es un generador de excelencia si se analiza correctamente.

### Futuro de la cirugía robótica reconstructiva (próxima década)
- **Proliferación de plataformas**: múltiples sistemas (J&J, Medtronic y otros) competirán reduciendo costos y ampliando acceso.
- **Telemedicina quirúrgica**: ya existe la asistencia remota por teléfono al robot de un colega; la telecirugía de procedimientos completos (ejemplo: Angola desde Orlando) está operando en condiciones de baja latencia.
- **Navegación AI**: identificación intraoperatoria de estructuras con aprendizaje automático, ya disponible comercialmente para algunas aplicaciones.
- **Automatización de tareas**: sutura robótica semi-autónoma (análoga al aparcamiento autónomo del automóvil); cámara con control AI ya disponible.
- **Pronóstico a 10 años**: la cirugía reconstructiva intrabdominal será predominantemente robótica; la BUAS robótica reemplazará a la abierta por mejores resultados de continencia.

## Errores frecuentes
- Creer que el robot "facilita" la cirugía sin experiencia: la curva de aprendizaje en reconstrucción robótica es larga.
- Usar robótica en procedimientos simples donde la cirugía abierta perineal es igualmente efectiva y más eficiente.

## Referencias
- AUA 2026: Robotic Surgery in Reconstructive Urology.
- Velarde L. 60 Tips. Tips de posicionamiento para casos robóticos.
$body$, 50, 0),

(v_mod, 'El futuro de la uretroplastia: abordaje transuretral e injertos líquidos', 'texto', $body$
## Objetivos de aprendizaje
Conocer las innovaciones técnicas que apuntan a la uretroplastia transuretral sin incisión cutánea, los dispositivos de fijación y sutura endoscópica en desarrollo, y el concepto de injertos líquidos (liquid grafts) como disrupción del paradigma actual de transferencia de tejido.

## Desarrollo teórico

### El problema con la uretroplastia abierta actual
A pesar de las excelentes tasas de éxito de la uretroplastia contemporánea, sigue siendo una cirugía invasiva con:
- Incisiones cutáneas (perineal, peneana, oral).
- Complicaciones de herida (dehiscencia, hematoma, infección) que representan la mayoría de la morbilidad postoperatoria según un estudio de AUA sobre uretroplastia de fosa navicular.
- Recuperación de 2-4 semanas.
- Necesidad de hospitalización o cirugía ambulatoria con anestesia general.

El futuro apunta hacia una uretroplastia transuretral que replique los principios de la cirugía abierta sin las incisiones cutáneas.

### Evolución histórica de la uretroplastia transuretral
- 1978 (Pattersson): primer intento endoscópico.
- 1983 (Gaur): técnica de incisión endoscópica.
- 1998 (Naude): 53 pacientes, 100% éxito bulbar, 50-75% en PFUI. Olvidada por complejidad técnica.
- 2011 (Barbagli): técnica de doble brazo de sutura para injerto transuretral de fosa navicular.
- 2025 (Warner): extensión de la técnica transuretral a estenosis peneanas hasta 15 cm.
- 2026: estudio multicéntrico de 12 cirujanos/12 instituciones/57 pacientes → 96% éxito transuretral ventral BMG fosa navicular. Sin fístulas, sin dehiscencia de glande.

### Dispositivos de fijación y sutura endoscópica

**"Sewing machine" del AUA 2026**: dispositivo con aguja espinal cargada con sutura barbada (V-lock) para sutura rápida endoscópica. Usa la aguja espinal como trocar transuretral; la sutura barbada permite sin nudo. También acelera la técnica abierta.

**Nick Warner's RD180**: dispositivo de sutura endoscópico similar al Kepner endoscopic suturing device. Presentado el 15 de mayo de 2026. Permite sutura transuretral en procedimientos de uretroplastia peneana.

**Micro-tacks de Ankur Joshi**: tacks absorbibles de titanio disparados transuretral para fijación del injerto sin sutura. Presentados en el AUA 2026 con entrega endoscópica demostrada por Nick Warner.

**Barbagli's glue**: pegamento acrílico aplicado al lecho receptor antes del injerto, que se presiona 2 minutos para fijar el injerto sin sutura. Técnica abierta con potencial adaptación endoscópica.

**Endoscopic robots**: el robot Virtuoso (Vanderbilt University) opera a través de un sheath de 26 Fr con instrumentos 10× más pequeños que el da Vinci. Permite sutura de precisión transuretral para procedimientos reconstructivos.

### Injertos líquidos: el cambio de paradigma
El concepto más disruptivo presentado en el AUA 2026 transforma el injerto de mucosa bucal de un sólido ("papel pintado que se pega") a un líquido ("semillas que se plantan" o "pintura en spray").

**Base biológica**: la mucosa bucal contiene células madre basales p75NGFR+ de alta capacidad migratoria y proliferativa. Al dispersar estas células en una solución y "sembrarlas" en el defecto uretral (sin cosechar un injerto sólido), las células migran, proliferan y regeneran el epitelio de tipo bucal en el lecho receptor.

**Evidencia preclínica**:
- Modelo de estenosis en conejo: defecto uretral sembrado con microinjertos de mucosa bucal → formó epitelio de tipo bucal sano. Controles → fibrosis cicatricial.
- Resultados confirmados en ensayo aleatorizado y ciego en animales.

**Ensayo clínico fase 1 humano**:
- 10 pacientes.
- Tiempo de procedimiento corto.
- Resultados preliminares "bastante buenos" (no cuantificados en el reporte del AUA 2026).
- Otros investigadores avanzan técnicas similares de siembra celular.

**Implicaciones**:
- Si el injerto líquido funciona en humanos, eliminaría la necesidad de cosecha de mucosa bucal (y su morbilidad en el sitio donador).
- Sería aplicable endoscópicamente, completando la visión de la uretroplastia sin incisiones.
- Requeriría estandarización de la preparación celular, definición de dosis, vehículo de entrega y verificación de la regeneración epitelial.

### Heineke-Mikulicz transuretral ("honeycombing")
Técnica de plastiaCirugía: incisión longitudinal larga de la estenosis, cerrada transversalmente con tejido nativo (sin injerto). Análoga a la piloroplastia. Presentada en el AUA 2026 con buenos resultados en >90 pacientes, sin necesidad de injerto en estenosis de longitud moderada.

## Perlas clínicas
- La técnica transuretral de fosa navicular (96% de éxito, multicéntrico) ya es considerada estándar por muchos expertos en 2026.
- Los injertos líquidos son ciencia de vanguardia: no cambiar la práctica clínica actual hasta que haya evidencia Fase 2-3 con seguimiento de al menos 2 años.
- La mayor innovación en uretroplastia en los próximos 5 años probablemente será la combinación de endoscopía + sutura semi-autónoma + injerto biológico.

## Referencias
- AUA 2026: Urethroplasty Evolution and Future. Transurethral procedures and liquid grafts.
- Barbagli G. Transurethral BMG inlay fossa navicularis. J Urol. 2011.
- Warner N. Penile urethral transurethral repair. Eur Urol. 2025.
$body$, 50, 1);

-- ══════════════════════════════════════════════════════════════
-- MÓDULO 12: Métricas de Éxito, Seguimiento y Perlas del Club
-- ══════════════════════════════════════════════════════════════
INSERT INTO public.modules (program_id, title, position)
VALUES (v_prog, 'Métricas de Éxito, Seguimiento Post-uretroplastia y Perlas del Club de la Uretra', 11)
RETURNING id INTO v_mod;

INSERT INTO public.lessons (module_id, title, kind, body, duration_min, position) VALUES
(v_mod, 'Stricture-fecta: definición consensuada de éxito en uretroplastia (Delphi EAU 2026)', 'texto', $body$
## Objetivos de aprendizaje
Comprender la necesidad de una definición estandarizada de éxito en uretroplastia, conocer el proceso Delphi que generó la "stricture-fecta", y aplicar sus tres criterios en la práctica clínica y en la comunicación de resultados quirúrgicos.

## Desarrollo teórico

### El problema de la heterogeneidad de resultados
La evaluación del éxito de la uretroplastia ha sido históricamente heterogénea: diferentes estudios utilizan definiciones distintas (Qmax > 15 mL/s, paso de cistoscopio 17 Fr, ausencia de retratamiento, mejoría de síntomas, satisfacción del paciente) lo que hace imposible la comparación entre centros, técnicas y cohortes.

El impacto de esta heterogeneidad es dramático: en un estudio de referencia de 712 hombres (el más citado al respecto), la probabilidad de éxito al año en la misma cohorte varió entre **57% y 94%** simplemente según la definición utilizada. Esta disparidad impide el benchmarking, la colaboración multicéntrica y la comunicación honesta con los pacientes.

En urología oncológica, el trifecta (control oncológico + continencia + función eréctil) ha demostrado ser un marco efectivo para la comunicación y comparación de resultados de la prostatectomía. El grupo EAU propuso crear un equivalente para la uretroplastia.

### El proceso Delphi internacional
Bajo los auspicios del Trauma and Reconstructive Urology Working Party (Young Academic Urologists, EAU), se convocó a 113 expertos internacionales en reconstrucción uretral de 5 sociedades científicas (EAU SGURS, GURS, ISRU, EAU Guidelines Panel, TURNS) para el consenso.

**Ronda 1** (87/113 participantes, 77%): se evaluaron 11 dominios de resultado usando escala Likert de 9 puntos. Consenso definido como: ≥ 70% calificando 7-9 Y ≤ 15% calificando 1-3.

**Dominios evaluados** (con sus definiciones):
- Uroflujometría: Qmax ≥ 15 mL/s
- Uroflujometría: mejora de Qmax ≥ 10 mL/s respecto al basal
- Residuo postmiccional ≤ 150 mL
- Paso de cistoscopio flexible 17 Fr sin disrupción mucosa
- Sin recurrencia anatómica en uretrografía
- **Ausencia de retratamiento de cualquier tipo**
- Satisfacción del paciente (subjetiva, sin escala)
- Satisfacción del paciente (mediante PROMs validados)
- Mejoría en scores de síntomas miccionales validados
- **Sin impacto significativo en continencia o función sexual**
- Ausencia de complicaciones postoperatorias

**Resultado Ronda 1**: 4 ítems alcanzaron umbral → pasaron a Ronda 2.

**Ronda 2** (65/87 participantes, 75%): 3 ítems alcanzaron consenso definitivo.

### Los tres criterios de la Stricture-fecta

**Criterio 1 — Ausencia de retratamiento**:
Definido como ausencia de cualquier intervención adicional, incluyendo: dilatación, uretrotomía interna (DVIU), derivación urinaria de cualquier tipo, y re-uretroplastia. Este criterio es el más "duro" y el más ampliamente aceptado en la literatura previa, pero su inclusión en el consenso le da legitimidad estandarizada.

*Matiz*: algunos pacientes pueden rechazar el retratamiento pese a recurrencia objetiva (por miedo a la cirugía, por satisfacción con el resultado actual, etc.). Esto puede inflar artificialmente el éxito por "ausencia de retratamiento". El grupo reconoce esta limitación.

**Criterio 2 — Sin impacto significativo en continencia o función sexual**:
Evaluado mediante instrumentos validados:
- Función eréctil: IIEF (International Index of Erectile Function).
- Función eyaculatoria: MSHQ (Male Sexual Health Questionnaire).
- Continencia: ICIQ-UI SF (International Consultation on Incontinence Questionnaire — Urinary Incontinence Short Form).

Este criterio reconoce que la uretroplastia no debe intercambiar la patología uretral por disfunción sexual o incontinencia. Es el primer consenso que hace esto obligatorio en la definición de éxito.

**Criterio 3 — Satisfacción del paciente**:
Evaluación subjetiva no cuantificada. La satisfacción puede medirse con PROMs (USS-PROM, ICIQ-Satisfaction) pero el consenso no exige una puntuación mínima específica, reconociendo que la satisfacción es multidimensional y varía entre culturas y expectativas.

### Qué NO alcanzó consenso
Interesantemente, los criterios "objetivos" clásicos — uroflujometría, residuo postmiccional, paso del cistoscopio — **no alcanzaron el umbral de consenso**. Esto refleja una evolución del pensamiento: la comunidad reconstructiva está abandonando los marcadores anatómicos/funcionales puros en favor de resultados centrados en el paciente (Patient-Centered Outcomes).

La uroflujometría, aunque muy usada, es "frágil y no específica" (palabras del consenso): los valores varían con el volumen miccional, la posición y la hidratación, y pueden estar falsamente normales con estenosis incipientes.

### Implementación práctica
La adopción de la stricture-fecta en la práctica clínica y en la investigación debería:
1. Reemplazar las definiciones ad hoc de éxito en publicaciones futuras.
2. Permitir la comparación de cohortes entre instituciones.
3. Mejorar el asesoramiento preoperatorio ("el objetivo de la cirugía no es solo que orine mejor, sino que esté libre de retratamientos, sin incontinencia nueva ni disfunción sexual, y satisfecho con el resultado").
4. Facilitar la colaboración multicéntrica en estudios prospectivos.

## Errores frecuentes
- Reportar el éxito de la uretroplastia solo con Qmax: dato insuficiente e inapropiado según el consenso 2026.
- No incluir función sexual y continencia en el seguimiento postoperatorio sistemático.
- No medir satisfacción del paciente en el seguimiento.

## Referencias
- Vetterlein MW et al. Stricture-fecta Delphi Consensus. Eur Urol Open Sci. 2026;83:120-124.
- Breyer BN et al. Multi-institutional study. J Urol. 2010.
- Martins FE. Textbook. Cap. 12: Predictores de recurrencia y seguimiento.
$body$, 50, 0),

(v_mod, 'Seguimiento post-uretroplastia: protocolo, PROMs y detección de recurrencia', 'texto', $body$
## Objetivos de aprendizaje
Diseñar un protocolo de seguimiento post-uretroplastia basado en la evidencia actual, conocer las herramientas de resultado reportado por el paciente (PROMs) disponibles para la estenosis uretral, y saber cuándo y cómo realizar estudios de imagen en el seguimiento.

## Desarrollo teórico

### Importancia del seguimiento estructurado
La recurrencia de la estenosis post-uretroplastia no siempre es sintomática en sus estadios iniciales. Una recurrencia precoz detectada y tratada tiene mejor pronóstico que una recurrencia tardía en un paciente que no consultó hasta la retención. La tasa de detección de recurrencias "subclínicas" (sin síntomas pero con evidencia instrumental) es mayor con un protocolo de seguimiento activo que con seguimiento solo por síntomas.

### Protocolo de seguimiento recomendado (post-uretroplastia)

| Tiempo | Herramientas |
|---|---|
| 3 meses | Uroflujometría + RPM + USS-PROM |
| 6 meses | Uroflujometría + RPM + USS-PROM + UCG si sospecha |
| 12 meses | Uroflujometría + RPM + USS-PROM + uretroscopía |
| 24 meses | Uroflujometría + RPM + USS-PROM |
| 5 años | Uroflujometría + RPM + USS-PROM + uretroscopía |
| Indefinido (LS) | Cada 12 meses de por vida dado el riesgo de recurrencia tardía |

**Criterios para estudios adicionales** en cualquier visita:
- Qmax < 12 mL/s (en paciente con > 150 mL de volumen miccional).
- RPM > 100 mL.
- LUTS obstructivos nuevos o empeoramiento de PROMs.
- Sospecha de LS activo (cambios en la mucosa meatal).

### PROMs (Patient-Reported Outcome Measures) en estenosis uretral

**USS-PROM (Urethral Stricture Surgery Patient-Reported Outcome Measure)**:
- Desarrollado específicamente para estenosis uretral en varones.
- Incluye subescalas de síntomas miccionales (LUTS), función sexual y satisfacción.
- Validado en múltiples idiomas y poblaciones.
- El seguimiento de largo plazo del LS con CIC (Saltman 2025) mostró mejora inicial del USS-PROM que decae con el tiempo, justificando el seguimiento indefinido.

**ICIQ-UI SF (Incontinence)**:
- 4 preguntas sobre frecuencia, cantidad e impacto de la incontinencia.
- Esencial para detectar incontinencia de novo post-uretroplastia posterior.

**IIEF (International Index of Erectile Function)**:
- 15 ítems, 5 dominios.
- Para detectar disfunción eréctil de novo o empeoramiento post-uretroplastia.
- Criterio obligatorio de la stricture-fecta.

**MSHQ (Male Sexual Health Questionnaire)**:
- Evalúa función eyaculatoria (importante en uretroplastia bulbar donde la lesión del músculo bulbocavernoso puede alterar la eyaculación).

**IPSS (International Prostate Symptom Score)**:
- Útil como herramienta de seguimiento sintomático general, aunque no específica para estenosis.
- Hayden et al. (2020) mostró mejoría del IPSS de mediana 12 a 8 con manejo conservador del LS.

### Definición de recurrencia a reportar
Siguiendo la stricture-fecta, la recurrencia debe reportarse como: **cualquier necesidad de retratamiento** (dilatación, DVIU, uretroplastia de revisión, derivación). Los estudios más honestos presentan curvas de Kaplan-Meier para la supervivencia libre de retratamiento, dando información sobre el tiempo a la recurrencia además de la tasa puntual.

### Imágenes en el seguimiento
- **Uroflujometría**: primera línea, no invasiva.
- **UCG**: indicada si la uroflujometría empeora, hay síntomas o se planea un nuevo procedimiento.
- **Uretroscopía flexible**: la más sensible para detectar recurrencias tempranas; permite diagnóstico y, en algunos casos, tratamiento (DVIU directa) en el mismo acto.
- **Ecografía uretral**: puede mostrar re-fibrosis periuretral antes de que la uroflujometría cambie. Útil en pacientes de alto riesgo (LS, campo irradiado).

### Seguimiento específico en LS
El LS uretral tiene el mayor riesgo de recurrencia tardía de todas las etiologías: 34% de fallos ocurren después del año 5 (Saltman 2025). Por ello, el seguimiento debe ser de por vida, con uroflujometría y PROMs anuales y uretroscopía cada 2-3 años. Los cambios visibles en el meato (depigmentación, induración) deben llevar a biopsia para descartar LS activo o carcinoma escamoso (complicación rara pero conocida del LS crónico).

## Errores frecuentes
- Dar de alta al paciente al año post-uretroplastia sin seguimiento: recurrencias tardías no detectadas.
- Usar Qmax como único criterio de seguimiento: no detecta recurrencias tempranas.
- No evaluar función sexual en el seguimiento post-uretroplastia bulbar/posterior.

## Referencias
- Vetterlein MW et al. Stricture-fecta. Eur Urol Open Sci. 2026.
- Saltman et al. Long-term CIC for LS. J Urol. 2025.
- Jackson MJ et al. USS-PROM development. Eur Urol. 2019.
- Hayden M et al. IPSS in LS management. J Urol. 2020.
$body$, 45, 1),

(v_mod, 'Perlas clínicas e iatrogenias frecuentes: los mejores Tips del Club de la Uretra', 'texto', $body$
## Objetivos de aprendizaje
Integrar las perlas clínicas más valiosas del Club de la Uretra en la práctica quirúrgica diaria, reconocer las principales iatrogenias uretrales prevenibles y conocer los errores más frecuentes en el manejo de casos complejos.

## Desarrollo teórico

### El Club de la Uretra: contexto
El Club de la Uretra nació en 2014 cuando cuatro urólogos jóvenes en el Hospital del Trabajador de Santiago de Chile crearon un grupo de WhatsApp para compartir casos clínicos de cirugía reconstructiva. El Dr. Reynaldo Gómez actuó como "entrenador". El grupo ha crecido hasta superar los 1.000 participantes de Latinoamérica, España y EEUU, convirtiéndose en la comunidad hispana de referencia en urología reconstructiva.

Los "60 Tips del Club de la Uretra" (Dra. Laura Velarde Ramos, 2024) son una síntesis de la experiencia colectiva del grupo, documentando las "recetas caseras" que han demostrado ser útiles en la práctica real.

### Perlas agrupadas por área

**Diagnóstico y evaluación**:
- Un chorro de orina que "disminuye pero no desaparece" es más probable estenosis que hiperplasia prostática; la curva en plateau en la uroflujometría lo confirma.
- Siempre realizar UCG bilateral (retrógrada + miccional) antes de cualquier uretroplastia posterior: la longitud de la distracción determina la técnica.
- El estetoscopio Doppler de $50 intraoperatorio puede salvarte de ligar las arterias cavernosas.
- No cateterizar "a ciegas" ante sospecha de ruptura uretral: si hay sangre en el meato tras un trauma, solicitar UCG antes del cateterismo.

**Cosecha del injerto de mucosa bucal**:
- El conducto de Stensen (a nivel del 2do molar superior) NUNCA debe incluirse en el injerto.
- Si el injerto cae al piso: lavarlo con clorhexidina 2% si fue < 3 minutos de exposición. Funciona.
- El timing de la infiltración anestésica oral (antes o después) no importa para el dolor postoperatorio: elegir según la logística del acto quirúrgico.
- Cierra siempre el defecto de la mejilla: reduce el sangrado y la morbilidad del donador.

**Posicionamiento e instrumental**:
- Sin bump sacro en la uretroplastia perineal, el campo se hunde y el procedimiento se vuelve imposible.
- El Scott bien colocado (en dermis, no en músculo) puede transformar una cirugía de 5 horas en 3.
- Los dilatadores de Bakes te ahorran minutos de búsqueda frustrada del cabo proximal obliterado.
- Invertir en lupas de calidad (2.5-3.5×) antes de cualquier otro equipamiento reconstructivo.

**Técnica quirúrgica**:
- El músculo bulbocavernoso: disecarlo, no seccionarlo, en la uretroplastia bulbar estándar.
- En la uretroplastia en etapas, si el paciente está satisfecho con el Johanson etapa 1 (hasta 75% en algunas series), no es obligatorio la segunda etapa.
- Nunca usar piel escrotal como mucosa uretral: el vello intraluminal genera cálculos de forma inevitable.
- En LS: nunca usar piel genital como injerto. Solo mucosa oral.
- El capitonaje del injerto dorsal es obligatorio, no opcional. Sin él, el injerto flota y no toma.

**Iatrogenias frecuentes (Tip 40)**:
Las principales iatrogenias uretrales prevenibles son:
1. **Cateterismo traumático repetido** con sonda de tamaño inadecuado: causa estenosis por presión isquémica del balón en la fosa navicular.
2. **RTU de próstata sin verificar el calibre uretral previo**: metoide uretral estrecho + resectoscopio 24-26 Fr → desgarros uretrales.
3. **Litotricia intracorpórea sin proteger la uretra**: fragmentos a alta velocidad puede lacerar la mucosa.
4. **Braquiterapia sin evaluar calibre uretral basal**: en estenosis preexistente, la radioterapia focal agrava irreversiblemente.
5. **DVIU repetidas indefinidamente**: cada DVIU aumenta la fibrosis periuretral y compromete la futura uretroplastia.

**RTUP + estenosis uretral (Tip 41)**:
Cuando un paciente con estenosis uretral requiere RTU de próstata, el orden es: primero resolver la estenosis, luego la RTU. Realizar ambas en el mismo acto es posible pero aumenta el riesgo de estenosis meatal post-RTU. Si la estenosis es distal, la meatoplastia previa al resectoscopio es una solución.

**UCG en estenosis anastomótica (Tip 42)**:
La UCG post-prostatectomía tiene características propias: el contraste puede reflujar al conducto deferente o seminal; el cuello vesical puede no verse por estenosis completa → añadir MCU anterógrada suprapúbica para visualizar el cabo proximal.

**Lesión medular y estenosis uretral (Tip 48)**:
El paciente con lesión medular tiene vejiga neurógena y frecuentemente usa CIC o catéter crónico. La estenosis es asintomática porque no percibe la dificultad miccional. El diagnóstico se hace por rutina o por complicaciones (ITU recurrente, litiasis). El manejo sigue los mismos principios que en el paciente neuronormal.

**Cierre de cuello vesical**:
- Femenino (Tip 59): indicado en vejiga neurógena con incontinencia total no tratable. Vía transvesical, disección del trígono, cierre en múltiples capas. Alta tasa de éxito en manos expertas.
- Masculino (Tip 49): vía transvesical igualmente. Reservado para casos extremos con cuello devastado y vejiga funcional.

**Cáncer de uretra (Tip 60)**:
El cirujano reconstructivo puede ser el primero en diagnosticarlo: masa uretral, hematuria, LUTS en un paciente con estenosis "resistente". La biopsia es mandatoria ante cualquier estenosis de aspecto irregular o cambio de carácter. La uretroplastia NO es tratamiento del cáncer de uretra.

### Principios del cirujano reconstructivo exitoso
1. **Conoce tu anatomía**: la uretroplastia sin entender la vascularización produce DFE y recurrencia.
2. **Opera sin tensión**: si hay duda, elige otra técnica.
3. **Respeta el tejido**: la cicatrización ocurre en el tejido del paciente, no en tus sutures.
4. **Sigue a tus pacientes**: la recurrencia tardía no detectada no es un éxito.
5. **Comparte tus casos**: el aprendizaje colectivo (modelo Club de la Uretra) acelera la curva de aprendizaje individual.
6. **Las complicaciones son parte del oficio**: aprender de ellas en lugar de evitar los casos difíciles.

## Cierre del diplomado
La cirugía reconstructiva uretral combina anatomía precisa, biología tisular profunda, innovación técnica constante y humildad ante la complejidad de la cicatrización. El cirujano reconstructivo es un artesano que trabaja con tejido vivo bajo condiciones de incertidumbre biológica. Los pilares del éxito son la formación continua, la experiencia acumulada, el seguimiento riguroso y la colaboración en comunidad — exactamente el espíritu que fundó el Club de la Uretra en 2014.

## Referencias
- Velarde L. 60 Tips del Club de la Uretra. Tips 40, 41, 42, 48, 49, 59, 60. 2024.
- Vetterlein MW et al. Stricture-fecta. Eur Urol Open Sci. 2026.
- AUA 2026: Conferencias completas de todas las sesiones citadas.
- Martins FE et al. Textbook of Male Genitourethral Reconstruction. Springer, 2020.
$body$, 60, 2);

END;
$SEED2$;
