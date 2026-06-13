-- ============================================================
-- Seed: Tópicos de ejemplo del "Club de la Uretra"
-- Basados en discusiones clínicas reales del grupo (junio–julio 2023).
-- Se publican bajo el usuario administrador como contenido semilla;
-- luego cada participante podrá crear los suyos, opinar y calificar.
--
-- Requisitos previos:
--   1. schema.sql, migration_topicos.sql y seed_reconstructiva.sql ejecutados.
--   2. Existir el usuario admin (info@urologiasur.cl) con perfil rol 'admin'.
-- Ejecutar en el SQL Editor de Supabase.
-- ============================================================

do $$
declare
  v_author uuid;
  v_prog uuid;
  m_diag uuid;        -- Tema 3: diagnóstico
  m_principios uuid;  -- Tema 4: principios, injertos y colgajos
  m_peneana uuid;     -- Tema 6: uretra peneana
  m_noTrans uuid;     -- Tema 7: bulbar no transectante / preservación vascular
  m_pan uuid;         -- Tema 9: panuretral / liquen
  m_pfui uuid;        -- Tema 11: uretra posterior / PFUI
  m_post uuid;        -- Tema 12: post-RTU / post-radioterapia / endoscópico
  m_aus uuid;         -- Tema 13: erosión de esfínter / stents
  m_deriv uuid;       -- Tema 14: derivación urinaria / casos complejos
begin
  select id into v_author from auth.users where email = 'info@urologiasur.cl';
  if v_author is null then
    raise exception 'No existe el usuario info@urologiasur.cl. Créalo primero en Authentication.';
  end if;

  select id into v_prog from public.programs where slug = 'cirugia-reconstructiva-uretral';

  select id into m_diag       from public.modules where program_id = v_prog and position = 2;
  select id into m_principios from public.modules where program_id = v_prog and position = 3;
  select id into m_peneana    from public.modules where program_id = v_prog and position = 5;
  select id into m_noTrans    from public.modules where program_id = v_prog and position = 6;
  select id into m_pan        from public.modules where program_id = v_prog and position = 8;
  select id into m_pfui       from public.modules where program_id = v_prog and position = 10;
  select id into m_post       from public.modules where program_id = v_prog and position = 11;
  select id into m_aus        from public.modules where program_id = v_prog and position = 12;
  select id into m_deriv      from public.modules where program_id = v_prog and position = 13;

  insert into public.topics (module_id, author_id, title, body) values

  (m_pfui, v_author,
   'Caso: fractura de pelvis + lesión uretral con cistostomía y ausencia de erecciones',
   E'Varón de 24 años, atropello (2018): fractura de pelvis + lesión de uretra, portador de cistostomía suprapúbica desde entonces. No orina por el pene y niega erecciones. La UCG retrógrada muestra obliteración del cabo distal y no se logra fase miccional, por lo que no se puede definir el defecto.\n\nPuntos de discusión del Club:\n• Indicación de cistoscopia anterógrada (bajo sedación con flexible) para definir el defecto.\n• Ante la ausencia de erecciones: ecodoppler peneano con PGE1 + arteriografía pudenda para descartar insuficiencia arterial; eventual revascularización peneana PREVIA a la uretroplastia para favorecer la vascularización uretral y prevenir falla por isquemia.\n• Maniobras de elongación para ganar uretra en la anastomosis término-terminal: liberación bulbar, separación de cuerpos cavernosos (incisión del ligamento transverso), pubectomía inferior y, como último recurso, pubectomía total — siempre asegurando sutura mucosa-mucosa sin tensión ni tejido fibroso.\n\n¿Revascularizarían siempre, o solo a los que pierden erecciones demostrado por Doppler/arteriografía? ¿Auscultación intraoperatoria con Doppler para preservar arterias bulbares cuando no es posible estudiar?'),

  (m_post, v_author,
   'Optilume (balón de paclitaxel) en estenosis bulbar: evidencia ROBUST I–III y experiencia regional',
   E'Tema recurrente del Club. Casos presentados con balón medicado con paclitaxel en estenosis bulbar corta (~1,5–2 cm) cercana al esfínter, varios como alternativa a re-uretroplastia en pacientes añosos o de alto riesgo.\n\nPuntos de discusión:\n• ROBUST I (piloto, sin grupo control → bajo nivel de evidencia, no determinante para guías) vs ROBUST III (control con uretrotomía/dilatación con balón no medicado; ya en guías europeas con la publicación de los 12 meses; data de 2 años en camino). Tasa libre de re-tratamiento mantenida en el tiempo.\n• Pretratamiento (uretrotomía con cuchillo frío vs dilatación vs balón no medicado): los tres con resultados comparables; el más económico sería la uretrotomía. Protocolo ROBUST III: DVIU a todos.\n• Uso off-label en varios países (Argentina): consentimiento informado explícito.\n• Definición de éxito en ROBUST (paso de cisto 16F): crítica sobre su sensibilidad.\n\n¿Optilume como primera opción tras uretroplastia fallida? ¿Tendrá valor como terapia primaria?'),

  (m_diag, v_author,
   'Enfrentamiento del varón con sospecha de estrechez uretral: diagnóstico multimodal',
   E'Tips del Club para quienes se inician en "uretrología". Ninguna herramienta por sí sola es completamente satisfactoria; se propone un enfoque multimodal:\n• Medición de calibre con sondas, uroflujometría, score de síntomas LUTS, UCG y cistoscopía.\n• Urodinamia en casos seleccionados; videourodinamia y EMG (con aguja, idealmente) cuando se sospecha DSD o pseudo-DSD — recordar reportar si la calidad de la EMG fue adecuada.\n• Idea (no protocolizada) de uroflujo inmediatamente pre y post dilatación a calibre por definir (24–30 Fr) como posible estándar.\n• Atención a obstrucciones extraluminales por pérdida de elasticidad periuretral sin reducción del lumen; y en mujeres, relación temporal con cirugías previas de incontinencia (TVT/TOT) o prolapso.\n\nHistoria clínica detallada como base de todo el proceso.'),

  (m_diag, v_author,
   'Estenosis de uretra femenina: claves de diagnóstico y diferenciación de obstrucción funcional',
   E'En la mujer la fase miccional de la UCG es fundamental: observar cuánto se distiende la uretra proximal y si la vejiga se vacía sin residuo pese a estar obstruida.\n\nDiferenciación con obstrucción funcional: la cistoscopía debe verse normal en la funcional. Detalles técnicos del Club: el cistoscopio masculino no sirve (se escapa el fluido); se usa la camisa del uretrotomo o un cistoscopio flexible, con mucho cuidado de no dilatar e inducir falso negativo. La estrechez femenina a veces se reduce a pequeños diafragmas.'),

  (m_pan, v_author,
   'Estenosis panuretral / sospecha de liquen escleroso: injerto dorsolateral de Kulkarni',
   E'Varón de 57 años con estenosis de uretra anterior larga (inicia 2 cm tras el meato), HBP ~50–60 g, reflujo vésico-ureteral bilateral, función renal normal, portador de cistostomía.\n\nDiscusión:\n• Aunque parece liquen, en éste la uretra distal/fosa estarían respetadas. Imagen con zonas de estrechez crítica, reparable en un tiempo.\n• Técnica preferida: uretroplastia de aumento dorsolateral (Kulkarni) por abordaje perineal con invaginación peneana — evita el denudamiento coronal cuando hay que extender el injerto a la uretra bulbar.\n• Injerto: mucosa bucal (de sobra en carrillos) preferida sobre lingual o piel retroauricular.\n• Secuencia: primero la uretra; manejar la HBP con tratamiento combinado y reevaluar la micción tras retirar la sonda (próstata no tan grande como para justificar la obstrucción).'),

  (m_aus, v_author,
   'Esfínter urinario artificial + uretroplastia: técnica transcorpórea y protección de la cara ventral (Gullwing)',
   E'A partir de un artículo del Dr. Martins (especial "50 años del esfínter urinario artificial moderno").\n\nDiscusión del Club:\n• La técnica transcorpórea protege principalmente la cara DORSAL de la uretra, pero la mayoría de las erosiones son VENTRALES. Indicación cada vez más restringida: cuerpo esponjoso débil/poco robusto o cirugía dorsal previa.\n• Técnica Gullwing y uso de flap de túnica albugínea más amplio lateralmente para cubrir cara ventral; manejo del gap de albugínea en cavernosos (allograft o fascia de rectos abdominales aprovechando la incisión inguinal del reservorio), considerando futuro implante de prótesis peneana.\n• Alternativas para reducir erosiones: interposición de músculo isquiocavernoso, fascia autóloga ventral.\n\n¿Qué técnica usan para proteger la uretra y cómo manejan el gap cavernoso?'),

  (m_deriv, v_author,
   'Caso complejo: gangrena de Fournier en parapléjico con pérdida de uretra bulbar e incontinencia total',
   E'Varón de 27 años, parapléjico (T3) desde hace 18 meses, sonda Foley uretral crónica; desarrolla gangrena de Fournier que requirió desbridamiento amplio con pérdida de piel del pene y ausencia de 3–4 cm de uretra bulbar distal. Incontinencia total al retirar la Foley; ya con cistostomía.\n\nDiscusión:\n• La uretrostomía perineal no es buena opción en neurogénico incontinente (mala cicatrización).\n• Recomendación mayoritaria: diferir el manejo funcional hasta resolver lo infeccioso; luego derivación urinaria continente — cierre de cuello vesical + ampliación vesical + conducto cateterizable (Mitrofanoff/Monti o segmento ileal; hemi-Indiana con colon derecho) con estoma umbilical. Cirugía plástica resuelve la cobertura genital sin preocuparse por la uretra.\n• Alternativa conservadora inicial (Virasoro): sistema VAC + tutorización uretral para evitar obliteración, con reepitelización ventral a partir de "dorsal strip" (principio de Russell) — casuística presentada en SIU; trofismo comprometido por la condición neurogénica.'),

  (m_principios, v_author,
   'Metaplasia prostática en uretra bulbar: un hallazgo infrecuente',
   E'Varón de 34 años, uretritis no gonocócica por clamidia tratada (doxiciclina + ceftriaxona); persisten síntomas leves (disuria, sensación de "mentolado", dolor testicular izquierdo intermitente). Uretroscopía: tejido lábil, sangrado fácil en uretra bulbar con placas blanquecinas. Biopsia: metaplasia uretral prostática (muestra tomada en uretra bulbar, no prostática).\n\nDiscusión: hallazgo raro, sin guías claras de manejo; literatura escasa. Se planteó tratamiento corto con esteroides. ¿Alguien ha visto metaplasia de glándulas prostáticas en uretra bulbar y cómo la manejó?'),

  (m_noTrans, v_author,
   'Estenosis bulbar doble ("reloj de arena") cercana al esfínter tras RTU de próstata',
   E'Varón de 69 años, HTA, LUTS severos; RTU-P (2022) con próstata pequeña obstructiva; estrechez puntiforme de uretra bulbar proximal cercana al esfínter externo con fibrosis importante. La UCG sugiere un segundo punto más proximal "en reloj de arena" que podría ser el esfínter.\n\nDiscusión:\n• Antes de decidir preservación esfinteriana, descartar estenosis doble con cistoscopia anterógrada.\n• Opción: uretroplastia no transectante con preservación del esfínter; si hay dos estenosis separadas por uretra sana, término-terminal no transectante en la proximal + injerto en la distal, o injerto único si el segmento intermedio es corto.\n• En añosos de alto riesgo, dar una oportunidad al manejo endoscópico de ambas estrecheces si no hay uretrotomía previa.');

  raise notice 'Tópicos del Club de la Uretra insertados correctamente.';
end $$;
