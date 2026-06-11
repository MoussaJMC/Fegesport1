-- ============================================================
-- FEGESPORT — Migration: history_timeline -> press-kit chronology
-- ============================================================
--
-- Purpose
--   Replace the legacy 4-row dataset of the `history_timeline` table
--   (Fondation 2009-2013, Reconnaissance Officielle 2017, Premiers
--   Championnats Nationaux 2018, Affiliation Internationale 2019)
--   with the 7-row factual chronology validated in the FEGESPORT
--   press kit and used by:
--     - /about (section Notre histoire)
--     - /federation-guineenne-esport
--     - /histoire-esport-guinee
--     - /esport-guinee
--
-- Status
--   READY — NOT EXECUTED. Run manually after review.
--
-- How to run (3 options)
--   1) Supabase Dashboard -> SQL Editor -> paste this file -> Run.
--   2) Supabase CLI (recommended):
--        supabase db push  -- if file is committed in supabase/migrations/
--      or for one-shot execution:
--        psql "$SUPABASE_DB_URL" -f \
--          supabase/migrations/migrate_history_timeline_press_kit.sql
--   3) Via /admin/history UI: manually delete the legacy rows and
--      insert the 7 entries below.
--
-- Safety
--   - Wraps everything in a transaction (BEGIN/COMMIT).
--   - Uses DELETE WHERE on the legacy rows by year_start so it is
--     idempotent and re-runnable.
--   - Does NOT touch other tables, columns, or RLS policies.
--   - Disable temporarily any RLS policy that blocks server-role
--     writes if you run via Dashboard SQL Editor (it bypasses RLS
--     by default with service role).
--
-- After running
--   - Visit /about -> the timeline should display the 8 cards
--     (2009 / 2014 / 2018 / 2019 / 2022 / 2023 / 2024 / Today).
--   - Then update src/pages/AboutPage.tsx to flip the render line:
--       const displayHistory =
--         historyEntries.length > 0 ? historyEntries : defaultHistory;
--     and remove the `void historyEntries;` companion.
-- ============================================================

BEGIN;

-- 1) Remove the legacy press-pre-kit rows.
--    Conditions on (year_start, title_fr) are conservative: they only
--    delete the documented legacy entries, not anything else an admin
--    might have added in the meantime.

DELETE FROM public.history_timeline
WHERE
  (year_start = 2009 AND title_fr ILIKE 'Fondation%')
  OR (year_start = 2017 AND title_fr ILIKE '%Reconnaissance%Officielle%')
  OR (year_start = 2018 AND title_fr ILIKE '%Premiers Championnats%')
  OR (year_start = 2019 AND title_fr ILIKE '%Affiliation Internationale%');

-- 2) Insert the 7 press-kit chronology rows.
--    `id` is left to default (uuid_generate_v4 / gen_random_uuid).
--    `year_end` is null on every row: each entry is a single-year
--    milestone (cleaner for a factual chronology). The 8th "Aujourd'hui"
--    indicators card is rendered client-side and intentionally not
--    stored in this table.

INSERT INTO public.history_timeline (
  title_fr, title_en, description_fr, description_en,
  year_start, year_end, order_position, is_active
) VALUES
  (
    'Creation de l''Association JMC',
    'Creation of the JMC Association',
    'Premier collectif guineen structure autour de la pratique competitive du jeu video. Acte fondateur de l''ecosysteme et debut d''un travail de structuration qui se poursuivra pendant plus d''une decennie.',
    'First Guinean collective organized around competitive video gaming. Founding act of the ecosystem and beginning of more than a decade of structural work.',
    2009, NULL, 1, true
  ),
  (
    'Reconnaissance officielle de l''Association JMC',
    'Official recognition of the JMC Association',
    'Apres cinq annees de travail de fond, l''Association JMC obtient sa reconnaissance officielle. Etape institutionnelle qui valide la legitimite d''un acteur organise autour du jeu video competitif.',
    'After five years of foundational work, the JMC Association obtains its official recognition — a key institutional milestone.',
    2014, NULL, 2, true
  ),
  (
    'Naissance de la FEGESPORT',
    'Birth of FEGESPORT',
    'Annee fondatrice. Trois jalons s''enchainent : creation de la Federation Guineenne d''Esport (dans la continuite directe de l''Association JMC), reconnaissance nationale, et cofondation de l''AEC (African Esports Confederation).',
    'Founding year. Three milestones come together: creation of the Guinean Esports Federation (in direct continuity with the JMC Association), national recognition, and co-founding of the AEC (African Esports Confederation).',
    2018, NULL, 3, true
  ),
  (
    'Premiers rendez-vous competitifs',
    'First competitive milestones',
    'Annee d''execution operationnelle : affiliation a la WESCO (West Esports Confederation), organisation de la premiere competition nationale, et premiere participation africaine de la Guinee.',
    'Year of operational execution: affiliation with WESCO (West Esports Confederation), first national competition organized, and first African participation for Guinea.',
    2019, NULL, 4, true
  ),
  (
    'Affiliation a l''IESF',
    'IESF affiliation',
    'La FEGESPORT obtient son affiliation a l''International Esports Federation (IESF), federation mondiale de reference de l''esport. Etape majeure pour l''ancrage international de l''ecosysteme guineen.',
    'FEGESPORT obtains affiliation with the International Esports Federation (IESF), the global reference body for esports — a major milestone in the international anchoring of the Guinean ecosystem.',
    2022, NULL, 5, true
  ),
  (
    'Cofondation de l''ACES et premiere participation mondiale',
    'ACES co-founding and first global participation',
    'Cofondation de l''ACES (Africa Esports Confederation), affiliation ACES/AESF et premiere participation mondiale de la Guinee a une competition esport. Trois etapes qui prolongent les affiliations precedentes.',
    'Co-founding of the ACES (Africa Esports Confederation), ACES/AESF affiliation, and first global participation of Guinea in an esports competition.',
    2023, NULL, 6, true
  ),
  (
    'Affiliation GEF et lancement de la LEG',
    'GEF affiliation and launch of the LEG',
    'Deux nouveaux paliers : affiliation a la Global Esports Federation (GEF) et creation de la LEG (League eSport Guinee), competition federale phare structuree autour d''un calendrier annuel et de plusieurs disciplines.',
    'Two new milestones: affiliation with the Global Esports Federation (GEF) and launch of the LEG (League eSport Guinea), the federation''s flagship competition with an annual calendar and multiple disciplines.',
    2024, NULL, 7, true
  );

-- 3) Sanity check (read-only). The result of this SELECT is shown in the
--    SQL Editor / psql output and confirms the new state.

SELECT
  order_position,
  year_start,
  title_fr,
  is_active
FROM public.history_timeline
WHERE is_active = true
ORDER BY order_position;

-- ============================================================
-- IMPORTANT: if the SELECT above returns the 7 expected rows AND
-- no other timestamped row predates them, COMMIT. Otherwise ROLLBACK
-- and re-run with corrected filters.
-- ============================================================

COMMIT;
