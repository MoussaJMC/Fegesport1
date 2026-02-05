/*
  # Ajout du champ image aux disciplines LEG

  1. Modifications
    - Ajout d'un champ `image` à la table `leg_disciplines` pour stocker l'URL de l'image de la discipline
    - Ce champ permettra d'afficher des images visuelles pour chaque discipline d'esport
*/

-- Ajout du champ image à la table leg_disciplines
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leg_disciplines' AND column_name = 'image'
  ) THEN
    ALTER TABLE leg_disciplines ADD COLUMN image text;
  END IF;
END $$;