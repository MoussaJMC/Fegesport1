/*
  # Ajout de la catégorie d'âge pour les membres

  1. Modifications
    - Ajoute une colonne `age_category` à la table `members`
    - Valeurs possibles: '03-16', '17-35', '36+'
    - Rend la colonne `birth_date` optionnelle (déjà le cas)
  
  2. Détails
    - La catégorie d'âge est utilisée pour les joueurs individuels
    - Les clubs et partenaires n'ont pas besoin de cette information
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'members' AND column_name = 'age_category'
  ) THEN
    ALTER TABLE members 
    ADD COLUMN age_category text CHECK (age_category IN ('03-16', '17-35', '36+'));
  END IF;
END $$;