
-- Create sowing_calendar table
CREATE TABLE public.sowing_calendar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Gemüse', 'Obst', 'Kräuter', 'Blumen')),
  season TEXT[] NOT NULL DEFAULT '{}',
  direct_sow INTEGER[] NOT NULL DEFAULT '{}',
  indoor INTEGER[] NOT NULL DEFAULT '{}',
  plant_out INTEGER[] NOT NULL DEFAULT '{}',
  harvest INTEGER[] NOT NULL DEFAULT '{}',
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Einfach', 'Mittel', 'Schwer')),
  notes TEXT,
  description TEXT,
  image_url TEXT,
  companion_plants TEXT[] DEFAULT '{}',
  avoid_plants TEXT[] DEFAULT '{}',
  growing_tips TEXT[] DEFAULT '{}',
  common_problems TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create companion_plants table
CREATE TABLE public.companion_plants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plant TEXT NOT NULL UNIQUE,
  good JSONB NOT NULL DEFAULT '[]',
  bad JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create plant_growing_tips table
CREATE TABLE public.plant_growing_tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plant TEXT NOT NULL UNIQUE,
  temperature TEXT NOT NULL,
  watering TEXT NOT NULL,
  light TEXT NOT NULL,
  timing TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Einfach', 'Mittel', 'Schwer')),
  specific_tips TEXT[] NOT NULL DEFAULT '{}',
  common_mistakes TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sowing_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companion_plants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plant_growing_tips ENABLE ROW LEVEL SECURITY;

-- Create policies for sowing_calendar
CREATE POLICY "Anyone can view sowing calendar" ON public.sowing_calendar
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage sowing calendar" ON public.sowing_calendar
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'::app_role
    )
  );

-- Create policies for companion_plants
CREATE POLICY "Anyone can view companion plants" ON public.companion_plants
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage companion plants" ON public.companion_plants
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'::app_role
    )
  );

-- Create policies for plant_growing_tips
CREATE POLICY "Anyone can view growing tips" ON public.plant_growing_tips
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage growing tips" ON public.plant_growing_tips
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'::app_role
    )
  );

-- Add some sample data
INSERT INTO public.sowing_calendar (name, type, season, direct_sow, indoor, plant_out, harvest, difficulty, notes) VALUES
('Radieschen', 'Gemüse', '{"Frühling", "Sommer", "Herbst"}', '{3,4,5,6,7,8,9}', '{}', '{}', '{4,5,6,7,8,9,10}', 'Einfach', 'Schnellwachsend, ideal für Anfänger'),
('Möhren', 'Gemüse', '{"Frühling", "Sommer", "Herbst"}', '{3,4,5,6,7}', '{}', '{}', '{6,7,8,9,10,11}', 'Mittel', 'Gleichmäßig feucht halten, nicht zu dicht säen'),
('Salat', 'Gemüse', '{"Frühling", "Sommer", "Herbst"}', '{3,4,5,6,7,8}', '{2,3,4}', '{4,5,6}', '{5,6,7,8,9,10}', 'Einfach', 'Lichtkeimer, nur leicht mit Erde bedecken');
