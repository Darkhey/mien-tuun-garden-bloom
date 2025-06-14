
-- Insert the "Saisonales Kochen im Sommer" article
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
  'saisonales-kochen-im-sommer',
  'Saisonales Kochen im Sommer: Frische Rezepte für heiße Tage',
  'Entdecke die Vielfalt des Sommers auf deinem Teller! Wir zeigen dir, wie du mit saisonalen Zutaten leichte und leckere Gerichte zauberst.',
  '<h2>Saisonales Kochen im Sommer: Frische Rezepte für heiße Tage</h2>
  <p>Der Sommer ist die perfekte Zeit, um die Fülle an frischem, regionalem Gemüse und Obst zu genießen. Saisonale Zutaten sind nicht nur besonders aromatisch und nährstoffreich, sondern auch nachhaltiger. Wir haben ein paar Ideen für dich, wie du den Sommer auf den Teller bringst.</p>
  <h3>Unsere Lieblings-Sommerzutaten:</h3>
  <ul>
    <li><strong>Tomaten:</strong> Ob im Salat, als Suppe oder auf der Pizza – sonnengereifte Tomaten sind das Herzstück der Sommerküche.</li>
    <li><strong>Zucchini:</strong> Vielseitig und kalorienarm. Perfekt für Pasta, gegrillt oder als Zoodles.</li>
    <li><strong>Beeren:</strong> Erdbeeren, Himbeeren, Blaubeeren – sie versüßen jedes Dessert, Müsli oder einfach als Snack zwischendurch.</li>
    <li><strong>Gurken:</strong> Der ultimative Frischekick an heißen Tagen, ideal für Salate und erfrischende Getränke.</li>
  </ul>
  <h3>Rezeptidee: Schneller Tomaten-Zucchini-Salat</h3>
  <p>Würfle eine Zucchini und zwei große Tomaten. Mische sie mit einer fein gehackten roten Zwiebel, frischem Basilikum und einem Dressing aus Olivenöl, Balsamico, Salz und Pfeffer. Perfekt als leichte Mahlzeit oder als Beilage zum Grillen. Guten Appetit!</p>',
  'Mika',
  '2025-06-14',
  'https://images.unsplash.com/photo-1597362925123-51c9d644ce77?w=1200&h=600&fit=crop',
  'Saisonale Küche',
  ARRAY['Sommer', 'Rezepte', 'Saisonal', 'Gesund'],
  6,
  'Saisonales Kochen im Sommer | Mien Tuun',
  'Leckere und einfache Sommerrezepte mit saisonalen Zutaten. Hol dir Inspiration für deine Küche!',
  ARRAY['Sommerküche', 'Saisonale Rezepte', 'leichte Gerichte', 'Tomaten', 'Zucchini'],
  true,
  true,
  NULL,
  'Saisonales Kochen im Sommer: Frische Rezepte für heiße Tage',
  'https://images.unsplash.com/photo-1597362925123-51c9d644ce77?w=1200&h=600&fit=crop'
);
