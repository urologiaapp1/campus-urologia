-- ============================================================
-- Seed: Programa "Cirugía Reconstructiva Uretral"
-- Temas (módulos) basados FIELMENTE en el índice de la Parte I
-- (Urethral Reconstruction) del Textbook of Male Genitourethral
-- Reconstruction — Martins, Kulkarni, Köhler (Springer, 2020).
-- Ejecutar DESPUÉS de schema.sql y migration_topicos.sql.
-- ============================================================

with prog as (
  insert into public.programs (slug, title, kind, description, published)
  values (
    'cirugia-reconstructiva-uretral',
    'Cirugía Reconstructiva Uretral',
    'diplomado',
    'Programa de formación en cirugía reconstructiva uretral basado en el Textbook of Male Genitourethral Reconstruction (Martins, Kulkarni & Köhler, 2020). Recorre desde la anatomía funcional y el diagnóstico de la estenosis uretral hasta las técnicas de uretroplastia anterior y posterior, manejo de casos complejos, reconstrucción protésica asociada y seguimiento. Cada tema incorpora la discusión de casos reales del Club de la Uretra.',
    false
  )
  on conflict (slug) do update set title = excluded.title
  returning id
)
insert into public.modules (program_id, title, position)
select prog.id, t.title, t.pos
from prog, (values
  ('Historia de la estenosis uretral y anatomía funcional de la uretra (cap. 1–2)', 0),
  ('Etiología, epidemiología y panorama mundial del manejo de la estenosis (cap. 3–4)', 1),
  ('Presentación clínica y evaluación diagnóstica de la estenosis uretral (cap. 5)', 2),
  ('Principios de reconstrucción, instrumentación y técnicas de transferencia de tejido: injertos y colgajos (cap. 6–7)', 3),
  ('Estenosis de fosa navicular y uretra distal; hipospadias complejo del adulto (cap. 8–9)', 4),
  ('Reconstrucción de la uretra peneana: procedimientos en uno y dos tiempos (cap. 10–11)', 5),
  ('Predictores de recurrencia y uretroplastia bulbar no transectante / con preservación vascular (cap. 12–14)', 6),
  ('Uretroplastia bulbar: transección-anastomosis y uretroplastia de sustitución (cap. 15–16)', 7),
  ('Estenosis panuretral y reconstrucción de la uretroplastia anterior fallida (cap. 17–18)', 8),
  ('Divertículo, megalouretra, fístula uretrocutánea y necrosis uretral bulbar (cap. 19–20, 28)', 9),
  ('Uretra posterior: lesión uretral por fractura de pelvis (PFUI) y fractura pélvica compleja (cap. 21–22)', 10),
  ('Estenosis posterior: post-RTU de próstata y post-radioterapia membranosa (cap. 23–25)', 11),
  ('Reconstrucción tras erosión de esfínter urinario artificial y tras stents uretrales fallidos (cap. 26–27)', 12),
  ('Colgajos fasciocutáneos/miocutáneos, uso de intestino, uretrostomía perineal y derivación urinaria (cap. 29–32)', 13),
  ('Reconstrucción robótica, función sexual, ingeniería de tejidos y oxígeno hiperbárico (cap. 33–36)', 14)
) as t(title, pos);

-- Verifica:
-- select m.position + 1 as tema, m.title from public.modules m
-- join public.programs p on p.id = m.program_id
-- where p.slug = 'cirugia-reconstructiva-uretral' order by m.position;
