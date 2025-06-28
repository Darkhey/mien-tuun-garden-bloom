/*
  # Create Sowing Calendar Tables

  1. New Tables
    - sowing_calendar: Main table for plant sowing data
    - companion_plants: Table for companion planting information
    - plant_growing_tips: Table for detailed growing tips
  
  2. Security
    - Tables are accessible to all authenticated users for reading
    - Only admins can modify the data
*/

-- Create sowing_calendar table
CREATE TABLE IF NOT EXISTS public.sowing_calendar (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('Gemüse', 'Obst', 'Kräuter', 'Blumen')),
  season text[] NOT NULL,
  direct_sow integer[] DEFAULT '{}',
  indoor integer[] DEFAULT '{}',
  plant_out integer[] DEFAULT '{}',
  harvest integer[] DEFAULT '{}',
  difficulty text NOT NULL CHECK (difficulty IN ('Einfach', 'Mittel', 'Schwer')),
  notes text,
  description text,
  image_url text,
  companion_plants text[],
  avoid_plants text[],
  growing_tips text[],
  common_problems text[],
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create companion_plants table
CREATE TABLE IF NOT EXISTS public.companion_plants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plant text NOT NULL UNIQUE,
  good jsonb DEFAULT '[]',
  bad jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create plant_growing_tips table
CREATE TABLE IF NOT EXISTS public.plant_growing_tips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plant text NOT NULL UNIQUE,
  temperature text,
  watering text,
  light text,
  timing text,
  difficulty text NOT NULL CHECK (difficulty IN ('Einfach', 'Mittel', 'Schwer')),
  specific_tips text[] DEFAULT '{}',
  common_mistakes text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_sowing_calendar_updated_at
BEFORE UPDATE ON public.sowing_calendar
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_companion_plants_updated_at
BEFORE UPDATE ON public.companion_plants
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plant_growing_tips_updated_at
BEFORE UPDATE ON public.plant_growing_tips
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_sowing_calendar_name ON public.sowing_calendar(name);
CREATE INDEX IF NOT EXISTS idx_sowing_calendar_type ON public.sowing_calendar(type);
CREATE INDEX IF NOT EXISTS idx_companion_plants_plant ON public.companion_plants(plant);
CREATE INDEX IF NOT EXISTS idx_plant_growing_tips_plant ON public.plant_growing_tips(plant);

-- Set up RLS policies
ALTER TABLE public.sowing_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companion_plants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plant_growing_tips ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access to sowing_calendar" 
  ON public.sowing_calendar FOR SELECT 
  TO public 
  USING (true);

CREATE POLICY "Allow public read access to companion_plants" 
  ON public.companion_plants FOR SELECT 
  TO public 
  USING (true);

CREATE POLICY "Allow public read access to plant_growing_tips" 
  ON public.plant_growing_tips FOR SELECT 
  TO public 
  USING (true);

-- Allow admin write access
CREATE POLICY "Allow admin write access to sowing_calendar" 
  ON public.sowing_calendar FOR ALL 
  TO authenticated 
  USING (has_role(uid(), 'admin'::app_role)) 
  WITH CHECK (has_role(uid(), 'admin'::app_role));

CREATE POLICY "Allow admin write access to companion_plants" 
  ON public.companion_plants FOR ALL 
  TO authenticated 
  USING (has_role(uid(), 'admin'::app_role)) 
  WITH CHECK (has_role(uid(), 'admin'::app_role));

CREATE POLICY "Allow admin write access to plant_growing_tips" 
  ON public.plant_growing_tips FOR ALL 
  TO authenticated 
  USING (has_role(uid(), 'admin'::app_role)) 
  WITH CHECK (has_role(uid(), 'admin'::app_role));

-- Insert sample data
INSERT INTO public.sowing_calendar (name, type, season, direct_sow, indoor, plant_out, harvest, difficulty, notes)
VALUES
  ('Radieschen', 'Gemüse', ARRAY['Frühling', 'Sommer', 'Herbst'], ARRAY[3, 4, 5, 6, 7, 8, 9], ARRAY[]::integer[], ARRAY[]::integer[], ARRAY[4, 5, 6, 7, 8, 9, 10], 'Einfach', 'Schnellwachsend, ideal für Anfänger'),
  ('Möhren', 'Gemüse', ARRAY['Frühling', 'Sommer', 'Herbst'], ARRAY[3, 4, 5, 6, 7], ARRAY[]::integer[], ARRAY[]::integer[], ARRAY[6, 7, 8, 9, 10, 11], 'Mittel', 'Gleichmäßig feucht halten, nicht zu dicht säen'),
  ('Salat', 'Gemüse', ARRAY['Frühling', 'Sommer', 'Herbst'], ARRAY[3, 4, 5, 6, 7, 8], ARRAY[2, 3, 4], ARRAY[4, 5, 6], ARRAY[5, 6, 7, 8, 9, 10], 'Einfach', 'Lichtkeimer, nur leicht mit Erde bedecken'),
  ('Tomaten', 'Gemüse', ARRAY['Frühling', 'Sommer'], ARRAY[]::integer[], ARRAY[2, 3, 4], ARRAY[5, 6], ARRAY[7, 8, 9, 10], 'Mittel', 'Wärmebedürftig, nach Eisheiligen auspflanzen'),
  ('Basilikum', 'Kräuter', ARRAY['Frühling', 'Sommer'], ARRAY[5, 6], ARRAY[3, 4, 5], ARRAY[5, 6], ARRAY[6, 7, 8, 9], 'Mittel', 'Wärmebedürftig, regelmäßig entspitzen')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.companion_plants (plant, good, bad)
VALUES
  ('Tomaten', 
   '[{"plant": "Basilikum", "reason": "Verbessert den Geschmack und hält Schädlinge wie Weiße Fliegen fern"}, {"plant": "Karotten", "reason": "Lockern den Boden und konkurrieren nicht um die gleichen Nährstoffe"}, {"plant": "Zwiebeln", "reason": "Halten Blattläuse und andere Schädlinge fern durch ihren intensiven Geruch"}]', 
   '[{"plant": "Kartoffeln", "reason": "Beide Nachtschattengewächse - fördern Krankheitsübertragung wie Kraut- und Braunfäule"}, {"plant": "Fenchel", "reason": "Hemmt das Wachstum durch allelopathische Substanzen"}]'),
  ('Karotten', 
   '[{"plant": "Zwiebeln", "reason": "Möhrenfliege wird durch Zwiebelgeruch abgehalten, Zwiebeln profitieren von lockerem Boden"}, {"plant": "Lauch", "reason": "Ähnlicher Effekt wie Zwiebeln - hält Möhrenfliege fern"}]', 
   '[{"plant": "Dill", "reason": "Kann das Karottenwachstum hemmen und zieht Möhrenfliege an"}]')
ON CONFLICT (plant) DO NOTHING;

INSERT INTO public.plant_growing_tips (plant, temperature, watering, light, timing, difficulty, specific_tips, common_mistakes)
VALUES
  ('Tomaten', 
   '18-25°C optimal, mindestens 15°C nachts', 
   'Gleichmäßig feucht, aber nicht nass. Morgens gießen.', 
   '6-8 Stunden direktes Sonnenlicht täglich', 
   'Nach den Eisheiligen (Mitte Mai) auspflanzen', 
   'Mittel', 
   ARRAY['Ausgeizen (Seitentriebe entfernen) für bessere Fruchtentwicklung', 'Stütze oder Rankhilfe bereits beim Pflanzen anbringen', 'Mulchen verhindert Krankheiten und hält Feuchtigkeit'], 
   ARRAY['Zu früh auspflanzen - Frostgefahr!', 'Blätter beim Gießen benetzen - fördert Krankheiten']),
  ('Basilikum', 
   '20-25°C, sehr wärmebedürftig', 
   'Mäßig, nicht über Blätter gießen', 
   'Volle Sonne, geschützter Standort', 
   'Nach Eisheiligen ins Freie', 
   'Mittel', 
   ARRAY['Blütenstände ausbrechen für mehr Blattmasse', 'Triebspitzen regelmäßig entspitzen', 'Im Topf überwintern möglich'], 
   ARRAY['Zu kalt stellen - stirbt ab', 'Überwässern - Wurzelfäule'])
ON CONFLICT (plant) DO NOTHING;

-- Comments
COMMENT ON TABLE public.sowing_calendar IS 'Main table for plant sowing calendar data';
COMMENT ON TABLE public.companion_plants IS 'Information about companion planting relationships';
COMMENT ON TABLE public.plant_growing_tips IS 'Detailed growing tips for specific plants';