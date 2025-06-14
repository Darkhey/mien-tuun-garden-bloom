
-- Create the blog_posts table based on your frontend Typings
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  excerpt text NOT NULL,
  content text NOT NULL,
  author text NOT NULL,
  published_at date NOT NULL DEFAULT now(),
  updated_at date,
  featured_image text NOT NULL,
  category text NOT NULL,
  tags text[] NOT NULL DEFAULT '{}',
  reading_time integer NOT NULL,
  seo_title text NOT NULL,
  seo_description text NOT NULL,
  seo_keywords text[] NOT NULL DEFAULT '{}',
  featured boolean NOT NULL DEFAULT false,
  published boolean NOT NULL DEFAULT true,
  structured_data text,
  original_title text,
  og_image text
);

-- Insert the "Wasser sparen im Garten" article
INSERT INTO public.blog_posts (
  slug,
  title,
  excerpt,
  content,
  author,
  published_at,
  featured_image,
  category,
  tags,
  reading_time,
  seo_title,
  seo_description,
  seo_keywords,
  featured,
  published,
  structured_data,
  original_title,
  og_image
) VALUES (
  'wasser-sparen-im-garten',
  'Wasser sparen im Garten: Die besten Tipps für nachhaltige Bewässerung',
  'Mit einfachen Methoden lässt sich im Garten viel Wasser sparen – und dabei gesunde Pflanzen genießen. Entdecke clevere Tricks für mehr Nachhaltigkeit!',
  '<h2>Wasser sparen im Garten: Die besten Tipps</h2>
  <p>Angesichts immer heißerer Sommer ist ein bewusster Umgang mit Wasser im Garten wichtiger denn je. Mit diesen cleveren Tipps kannst du nachhaltig gärtnern und sorgst gleichzeitig für kräftige, gesunde Pflanzen:</p>
  <ul>
    <li><strong>Mulchen:</strong> Eine Mulchschicht hält den Boden länger feucht. Ideal sind Rasenschnitt, Laub oder gehäckselte Zweige.</li>
    <li><strong>Gießen am Morgen:</strong> Früh morgens verdunstet am wenigsten Wasser, die Pflanzen können effizient aufnehmen.</li>
    <li><strong>Regentonne nutzen:</strong> Sammle Regenwasser und gieße bevorzugt damit. Das spart Leitungswasser und ist besser für die Pflanzen.</li>
    <li><strong>Pflanzabstand beachten:</strong> Wer seine Pflanzen mit ausreichend Abstand setzt, sorgt für bessere Durchlüftung und reduziert Wasserverlust durch Verdunstung über die Blätter.</li>
    <li><strong>Standortgerecht pflanzen:</strong> Setze trockenheitsverträgliche Stauden oder Gemüsesorten in trockene Lagen.</li>
    <li><strong>Tropfbewässerung:</strong> Ein Tropfschlauch bringt Wasser genau dorthin, wo es gebraucht wird – direkt an die Wurzel.</li>
  </ul>
  <h3>Fazit</h3>
  <p>Mit ein paar einfachen Maßnahmen schonst du wertvolle Ressourcen und hast trotzdem üppiges Grün im Garten. Probier unsere Tipps gleich aus!</p>',
  'Anna',
  '2024-06-14',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&h=600&fit=crop',
  'Gartentipps',
  ARRAY['Nachhaltigkeit', 'Wasser', 'Garten', 'Sparen'],
  7,
  'Wasser sparen im Garten | Mien Tuun',
  'So sparst du Wasser beim Gärtnern – nachhaltige Tipps für deinen Garten.',
  ARRAY['Garten', 'Wasser sparen', 'nachhaltig', 'Tipps', 'Mien Tuun'],
  false,
  true,
  NULL,
  'Wasser sparen im Garten: Die besten Tipps für nachhaltige Bewässerung',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&h=600&fit=crop'
);

