/*
  # Add Comprehensive Sowing Calendar Data

  1. New Data
    - Add detailed plant data for vegetables, herbs, fruits, and flowers
    - Include comprehensive growing information
    - Add companion planting relationships
    - Add detailed growing tips
  
  2. Structure
    - Organized by plant types
    - Includes all required information fields
    - Maintains proper data relationships
*/

-- Clear existing data to avoid duplicates
DELETE FROM public.plant_growing_tips;
DELETE FROM public.companion_plants;
DELETE FROM public.sowing_calendar;

-- Insert comprehensive vegetable data
INSERT INTO public.sowing_calendar (
  name, 
  type, 
  season, 
  direct_sow, 
  indoor, 
  plant_out, 
  harvest, 
  difficulty, 
  notes, 
  description,
  companion_plants,
  avoid_plants,
  growing_tips,
  common_problems
) VALUES
-- Wurzelgemüse
(
  'Möhren', 
  'Gemüse', 
  ARRAY['Frühling', 'Sommer', 'Herbst'], 
  ARRAY[3, 4, 5, 6, 7], 
  ARRAY[]::integer[], 
  ARRAY[]::integer[], 
  ARRAY[6, 7, 8, 9, 10, 11], 
  'Mittel', 
  'Lockerer, steinfreier Boden für gerade Wurzeln. Frühsorten ab März, Lagersorten bis Juni.',
  'Möhren (Daucus carota) gehören zu den beliebtesten Gemüsesorten im Hausgarten. Sie sind reich an Beta-Carotin und anderen Nährstoffen. Die Aussaat erfolgt direkt ins Freiland, wobei auf lockeren, tiefgründigen Boden zu achten ist.',
  ARRAY['Zwiebeln', 'Lauch', 'Tomaten', 'Radieschen', 'Erbsen'],
  ARRAY['Dill', 'Petersilie', 'Sellerie'],
  ARRAY['Vor der Aussaat den Boden 30 cm tief lockern', 'Samen nur dünn mit Erde bedecken', 'Regelmäßig vereinzeln auf 3-5 cm Abstand', 'Gleichmäßig feucht halten für optimales Wachstum'],
  ARRAY['Möhrenfliege', 'Mehltau', 'Rissige Wurzeln durch ungleichmäßige Bewässerung']
),
(
  'Rote Bete', 
  'Gemüse', 
  ARRAY['Frühling', 'Sommer'], 
  ARRAY[4, 5, 6, 7], 
  ARRAY[]::integer[], 
  ARRAY[]::integer[], 
  ARRAY[7, 8, 9, 10, 11], 
  'Einfach', 
  'Nährstoffreicher Boden, regelmäßige Bewässerung. Samen vor Aussaat einweichen.',
  'Rote Bete (Beta vulgaris) ist ein robustes Wurzelgemüse mit hohem Nährwert. Die intensiv gefärbten Knollen enthalten wertvolle Antioxidantien und sind vielseitig in der Küche verwendbar.',
  ARRAY['Zwiebeln', 'Kohl', 'Salat', 'Bohnen'],
  ARRAY['Spinat', 'Mangold', 'Spargel'],
  ARRAY['Samen 24 Stunden vor der Aussaat einweichen', 'Auf 10 cm Abstand vereinzeln', 'Regelmäßig hacken und Unkraut entfernen', 'Bei Trockenheit ausreichend gießen'],
  ARRAY['Blattfleckenkrankheit', 'Herzfäule', 'Schneckenbefall']
),
(
  'Radieschen', 
  'Gemüse', 
  ARRAY['Frühling', 'Sommer', 'Herbst'], 
  ARRAY[3, 4, 5, 6, 7, 8, 9], 
  ARRAY[]::integer[], 
  ARRAY[]::integer[], 
  ARRAY[4, 5, 6, 7, 8, 9, 10], 
  'Einfach', 
  'Schnellwachsend, ideal für Anfänger. Regelmäßige Aussaat für kontinuierliche Ernte.',
  'Radieschen (Raphanus sativus) sind perfekte Einsteiger-Gemüse mit kurzer Kulturzeit von nur 3-4 Wochen. Die würzigen Knollen sind reich an Vitamin C und Mineralstoffen.',
  ARRAY['Salat', 'Gurken', 'Erbsen', 'Karotten'],
  ARRAY['Kohlrabi', 'Kresse'],
  ARRAY['Gleichmäßig feucht halten', 'Nicht zu dicht säen (2-3 cm Abstand)', 'Bei Hitze für Schatten sorgen', 'Regelmäßig ernten, bevor sie holzig werden'],
  ARRAY['Erdflöhe', 'Kohlhernie', 'Pelziger Geschmack bei Trockenheit']
),
(
  'Pastinaken', 
  'Gemüse', 
  ARRAY['Frühling', 'Sommer'], 
  ARRAY[3, 4, 5], 
  ARRAY[]::integer[], 
  ARRAY[]::integer[], 
  ARRAY[10, 11, 12, 1, 2], 
  'Mittel', 
  'Lange Kulturzeit, frostverträglich. Geschmack verbessert sich nach Frost.',
  'Pastinaken (Pastinaca sativa) sind winterharte Wurzelgemüse mit süßlichem, nussigem Geschmack. Sie haben eine lange Kulturzeit von bis zu 6 Monaten und können den Winter über im Boden bleiben.',
  ARRAY['Erbsen', 'Bohnen', 'Salat'],
  ARRAY['Karotten', 'Petersilienwurzel'],
  ARRAY['Frische Samen verwenden (Keimfähigkeit nimmt schnell ab)', 'Boden tiefgründig lockern (30-40 cm)', 'Geduld haben - Keimung dauert 2-3 Wochen', 'Kann im Boden überwintern, Frost verbessert den Geschmack'],
  ARRAY['Möhrenfliege', 'Pastinakenschorf', 'Wurzelgallenälchen']
),

-- Blattgemüse
(
  'Salat', 
  'Gemüse', 
  ARRAY['Frühling', 'Sommer', 'Herbst'], 
  ARRAY[3, 4, 5, 6, 7, 8], 
  ARRAY[2, 3, 4], 
  ARRAY[4, 5, 6], 
  ARRAY[5, 6, 7, 8, 9, 10], 
  'Einfach', 
  'Lichtkeimer, nur leicht mit Erde bedecken. Verschiedene Sorten für kontinuierliche Ernte.',
  'Salat (Lactuca sativa) ist in verschiedenen Sorten erhältlich, von Kopfsalat bis Pflücksalat. Er bevorzugt nährstoffreichen, humosen Boden und gleichmäßige Feuchtigkeit.',
  ARRAY['Radieschen', 'Karotten', 'Gurken', 'Erdbeeren'],
  ARRAY['Petersilie', 'Sellerie'],
  ARRAY['Samen nur andrücken, nicht bedecken (Lichtkeimer)', 'Bei Hitze für Schatten sorgen, um Schossen zu vermeiden', 'Regelmäßig gießen, aber Blätter trocken halten', 'Gestaffelte Aussaat alle 2-3 Wochen für kontinuierliche Ernte'],
  ARRAY['Blattläuse', 'Falscher Mehltau', 'Schneckenbefall', 'Schossen bei Hitze']
),
(
  'Spinat', 
  'Gemüse', 
  ARRAY['Frühling', 'Herbst'], 
  ARRAY[3, 4, 8, 9], 
  ARRAY[]::integer[], 
  ARRAY[]::integer[], 
  ARRAY[5, 6, 9, 10, 11], 
  'Einfach', 
  'Schosst bei Hitze und langen Tagen. Ideal für Frühjahr und Herbst.',
  'Spinat (Spinacia oleracea) ist ein nährstoffreiches Blattgemüse, das kühle Temperaturen bevorzugt. Er ist reich an Eisen, Vitaminen und Antioxidantien und wächst schnell.',
  ARRAY['Erdbeeren', 'Kohl', 'Radieschen'],
  ARRAY['Rote Bete', 'Mangold', 'Rhabarber'],
  ARRAY['Bevorzugt kühle Temperaturen unter 20°C', 'Bei Langtagsbedingungen und Hitze schosst er schnell', 'Regelmäßig ernten, sobald Blätter groß genug sind', 'Herbstaussaat kann überwintert werden'],
  ARRAY['Falscher Mehltau', 'Blattläuse', 'Schnelles Schossen im Sommer']
),
(
  'Mangold', 
  'Gemüse', 
  ARRAY['Frühling', 'Sommer'], 
  ARRAY[4, 5, 6, 7], 
  ARRAY[3, 4], 
  ARRAY[5, 6], 
  ARRAY[6, 7, 8, 9, 10, 11], 
  'Einfach', 
  'Blätter nach Bedarf ernten, wächst nach. Robust und ertragreich.',
  'Mangold (Beta vulgaris subsp. vulgaris) ist ein robustes Blattgemüse, das sowohl für seine saftigen Stiele als auch für die nahrhaften Blätter geschätzt wird. Er ist mit der Roten Bete verwandt.',
  ARRAY['Kohl', 'Zwiebeln', 'Salat'],
  ARRAY['Spinat', 'Rote Bete'],
  ARRAY['Regelmäßig ernten, indem äußere Blätter abgeschnitten werden', 'Kann bei milder Witterung überwintern', 'Stiele und Blätter getrennt verarbeiten (unterschiedliche Garzeiten)', 'Regelmäßig gießen für zarte Blätter'],
  ARRAY['Blattfleckenkrankheit', 'Rübenfliege', 'Schneckenbefall']
),

-- Fruchtgemüse
(
  'Tomaten', 
  'Gemüse', 
  ARRAY['Frühling', 'Sommer'], 
  ARRAY[]::integer[], 
  ARRAY[2, 3, 4], 
  ARRAY[5, 6], 
  ARRAY[7, 8, 9, 10], 
  'Mittel', 
  'Wärmebedürftig, nach Eisheiligen auspflanzen. Regelmäßig ausgeizen.',
  'Tomaten (Solanum lycopersicum) gehören zu den beliebtesten Gemüsepflanzen im Hausgarten. Sie benötigen viel Wärme, Licht und regelmäßige Pflege für optimale Erträge.',
  ARRAY['Basilikum', 'Karotten', 'Zwiebeln', 'Tagetes', 'Sellerie'],
  ARRAY['Kartoffeln', 'Fenchel', 'Mais', 'Kohl', 'Gurken'],
  ARRAY['Regelmäßig ausgeizen (Seitentriebe entfernen)', 'An Stäben oder Schnüren aufbinden', 'Nur an der Basis gießen, Blätter trocken halten', 'Bei Freilandkultur vor Regen schützen (Dach)'],
  ARRAY['Kraut- und Braunfäule', 'Blütenendfäule', 'Weiße Fliege', 'Blattläuse']
),
(
  'Gurken', 
  'Gemüse', 
  ARRAY['Frühling', 'Sommer'], 
  ARRAY[5, 6], 
  ARRAY[4, 5], 
  ARRAY[5, 6], 
  ARRAY[7, 8, 9], 
  'Mittel', 
  'Wärmeliebend, viel Wasser und Nährstoffe. Rankhilfe für Schlangengurken.',
  'Gurken (Cucumis sativus) sind wärmeliebende Gemüsepflanzen mit hohem Wasserbedarf. Es gibt Schlangengurken (rankend) und Einlegegurken (buschig).',
  ARRAY['Bohnen', 'Erbsen', 'Salat', 'Dill', 'Zwiebeln'],
  ARRAY['Kartoffeln', 'Tomaten', 'Radieschen'],
  ARRAY['Viel und regelmäßig gießen (trockene Phasen vermeiden)', 'Rankhilfe für Schlangengurken bereitstellen', 'Früchte regelmäßig ernten fördert Neubildung', 'Mulchschicht hält Boden feucht und warm'],
  ARRAY['Echter Mehltau', 'Falscher Mehltau', 'Gurkenmosaikvirus', 'Bittere Früchte bei Wassermangel']
),
(
  'Zucchini', 
  'Gemüse', 
  ARRAY['Frühling', 'Sommer'], 
  ARRAY[5, 6], 
  ARRAY[4, 5], 
  ARRAY[5, 6], 
  ARRAY[7, 8, 9, 10], 
  'Einfach', 
  'Platzbedarf beachten, sehr ertragreich. Regelmäßig ernten.',
  'Zucchini (Cucurbita pepo) sind robuste und ertragreiche Gemüsepflanzen aus der Familie der Kürbisgewächse. Sie benötigen viel Platz und Nährstoffe.',
  ARRAY['Bohnen', 'Mais', 'Kapuzinerkresse', 'Ringelblumen'],
  ARRAY['Kartoffeln', 'Gurken'],
  ARRAY['Regelmäßig ernten, wenn Früchte 15-20 cm lang sind', 'Direkt an der Basis gießen', 'Mulchschicht gegen Austrocknung und Unkraut', 'Männliche und weibliche Blüten für Befruchtung benötigt'],
  ARRAY['Echter Mehltau', 'Grauschimmel', 'Fruchtfäule bei Nässe']
),
(
  'Paprika', 
  'Gemüse', 
  ARRAY['Frühling', 'Sommer'], 
  ARRAY[]::integer[], 
  ARRAY[2, 3], 
  ARRAY[5, 6], 
  ARRAY[7, 8, 9, 10], 
  'Mittel', 
  'Sehr wärmebedürftig, lange Kulturdauer. Windgeschützter Standort.',
  'Paprika (Capsicum annuum) benötigen viel Wärme und eine lange Vegetationsperiode. Sie sind in verschiedenen Farben, Formen und Schärfegraden erhältlich.',
  ARRAY['Basilikum', 'Karotten', 'Zwiebeln', 'Tagetes'],
  ARRAY['Fenchel', 'Bohnen', 'Erbsen'],
  ARRAY['Früh vorziehen (Februar/März)', 'Erst nach den Eisheiligen auspflanzen', 'Windgeschützten, sonnigen Standort wählen', 'Bei Topfkultur mindestens 5-Liter-Gefäße verwenden'],
  ARRAY['Blattläuse', 'Spinnmilben', 'Grauschimmel', 'Sonnenbrand bei plötzlicher Hitze']
),

-- Hülsenfrüchte
(
  'Bohnen', 
  'Gemüse', 
  ARRAY['Frühling', 'Sommer'], 
  ARRAY[5, 6, 7], 
  ARRAY[]::integer[], 
  ARRAY[]::integer[], 
  ARRAY[7, 8, 9, 10], 
  'Einfach', 
  'Stangenbohnen brauchen Rankhilfe, Buschbohnen nicht. Erst nach Eisheiligen säen.',
  'Bohnen (Phaseolus vulgaris) sind stickstoffsammelnde Pflanzen, die den Boden verbessern. Es gibt Buschbohnen (niedrig) und Stangenbohnen (rankend).',
  ARRAY['Gurken', 'Kartoffeln', 'Karotten', 'Salat', 'Kohl'],
  ARRAY['Zwiebeln', 'Knoblauch', 'Lauch', 'Fenchel'],
  ARRAY['Direkt ins Freiland säen nach den Eisheiligen', 'Stangenbohnen benötigen stabile Rankhilfen (2-2,5 m hoch)', 'Nicht bei Nässe ernten (Rostgefahr)', 'Regelmäßig ernten fördert Neubildung'],
  ARRAY['Schwarze Bohnenläuse', 'Bohnenfliege', 'Fettfleckenkrankheit', 'Bohnenrost']
),
(
  'Erbsen', 
  'Gemüse', 
  ARRAY['Frühling', 'Sommer'], 
  ARRAY[3, 4, 5, 6], 
  ARRAY[]::integer[], 
  ARRAY[]::integer[], 
  ARRAY[6, 7, 8, 9], 
  'Einfach', 
  'Kälteresistent, frühe Aussaat möglich. Rankende Sorten brauchen Stütze.',
  'Erbsen (Pisum sativum) sind kältetolerante Hülsenfrüchte, die bereits ab März ausgesät werden können. Sie verbessern als Leguminosen den Boden durch Stickstoffanreicherung.',
  ARRAY['Karotten', 'Radieschen', 'Gurken', 'Salat', 'Kohl'],
  ARRAY['Zwiebeln', 'Knoblauch', 'Tomaten'],
  ARRAY['Frühe Aussaat möglich (ab 5°C Bodentemperatur)', 'Samen vor Aussaat 12 Stunden einweichen', 'Rankhilfe für hochwachsende Sorten bereitstellen', 'Regelmäßig ernten, wenn Hülsen prall gefüllt sind'],
  ARRAY['Echter Mehltau', 'Erbsenwickler', 'Grauschimmel']
),

-- Kohlgemüse
(
  'Brokkoli', 
  'Gemüse', 
  ARRAY['Frühling', 'Sommer', 'Herbst'], 
  ARRAY[4, 5], 
  ARRAY[2, 3], 
  ARRAY[4, 5, 6, 7], 
  ARRAY[6, 7, 8, 9, 10], 
  'Mittel', 
  'Nach Haupternte Seitentriebe nutzen. Gleichmäßige Bewässerung wichtig.',
  'Brokkoli (Brassica oleracea var. italica) ist ein nährstoffreiches Kohlgemüse mit hohem Vitamin-C-Gehalt. Nach der Ernte des Haupttriebs bilden sich oft erntewürdige Seitentriebe.',
  ARRAY['Zwiebeln', 'Salat', 'Sellerie', 'Kamille', 'Dill'],
  ARRAY['Erdbeeren', 'Tomaten', 'Bohnen'],
  ARRAY['Regelmäßig gießen, besonders während der Kopfbildung', 'Ernten, bevor sich die Blütenknospen öffnen', 'Seitentriebe nach Haupternte weiter nutzen', 'Kohlnetz gegen Schädlinge verwenden'],
  ARRAY['Kohlweißling', 'Kohlfliege', 'Kohlhernie', 'Schneckenbefall']
),
(
  'Blumenkohl', 
  'Gemüse', 
  ARRAY['Frühling', 'Sommer', 'Herbst'], 
  ARRAY[4, 5], 
  ARRAY[2, 3], 
  ARRAY[4, 5, 6, 7], 
  ARRAY[6, 7, 8, 9, 10], 
  'Schwer', 
  'Gleichmäßige Feuchtigkeit wichtig. Blätter über Kopf knicken zum Bleichen.',
  'Blumenkohl (Brassica oleracea var. botrytis) bildet weiße, kompakte Köpfe und benötigt gleichmäßige Wachstumsbedingungen. Er ist anspruchsvoller als andere Kohlarten.',
  ARRAY['Sellerie', 'Zwiebeln', 'Salat', 'Spinat'],
  ARRAY['Erdbeeren', 'Tomaten', 'Bohnen', 'Erbsen'],
  ARRAY['Blätter über den Kopf knicken, um Weißfärbung zu fördern', 'Gleichmäßige Wasserversorgung für Kopfbildung', 'Nährstoffreichen Boden bereitstellen', 'Vor Hitze und direkter Sonne schützen'],
  ARRAY['Kohlweißling', 'Kohlfliege', 'Kohlhernie', 'Kopffäule bei zu viel Nässe']
),

-- Zwiebelgewächse
(
  'Zwiebeln', 
  'Gemüse', 
  ARRAY['Frühling', 'Sommer'], 
  ARRAY[3, 4], 
  ARRAY[2, 3], 
  ARRAY[4, 5], 
  ARRAY[7, 8, 9], 
  'Mittel', 
  'Steckzwiebeln sind einfacher als Aussaat. Boden sollte nicht zu feucht sein.',
  'Zwiebeln (Allium cepa) können aus Samen oder Steckzwiebeln gezogen werden. Sie bevorzugen sonnige Standorte und durchlässigen Boden.',
  ARRAY['Karotten', 'Salat', 'Tomaten', 'Kohl', 'Erdbeeren'],
  ARRAY['Bohnen', 'Erbsen', 'Kohl'],
  ARRAY['Steckzwiebeln sind einfacher als Aussaat', 'Nicht zu tief pflanzen (Spitze sollte sichtbar sein)', 'Laub welkt vor der Ernte - dann mit Ernte warten', 'Nach der Ernte gut trocknen lassen für Lagerung'],
  ARRAY['Zwiebelfliege', 'Falscher Mehltau', 'Zwiebelfäule']
),
(
  'Knoblauch', 
  'Gemüse', 
  ARRAY['Herbst', 'Winter'], 
  ARRAY[10, 11], 
  ARRAY[]::integer[], 
  ARRAY[]::integer[], 
  ARRAY[7, 8], 
  'Einfach', 
  'Winterknoblauch im Herbst stecken. Einzelne Zehen mit Spitze nach oben pflanzen.',
  'Knoblauch (Allium sativum) wird meist im Herbst gepflanzt und im Sommer geerntet. Er ist pflegeleicht und hat eine natürliche abwehrende Wirkung gegen viele Schädlinge.',
  ARRAY['Erdbeeren', 'Tomaten', 'Karotten', 'Rosen'],
  ARRAY['Bohnen', 'Erbsen', 'Kohl'],
  ARRAY['Einzelne Zehen mit Spitze nach oben 3-5 cm tief pflanzen', 'Blütenstände (Scapes) entfernen für größere Knollen', 'Ernten, wenn das Laub zu 2/3 gelb ist', 'Nach der Ernte 2-3 Wochen trocknen lassen'],
  ARRAY['Zwiebelfliege', 'Milben', 'Weißfäule']
),

-- Kräuter
(
  'Basilikum', 
  'Kräuter', 
  ARRAY['Frühling', 'Sommer'], 
  ARRAY[5, 6], 
  ARRAY[3, 4, 5], 
  ARRAY[5, 6], 
  ARRAY[6, 7, 8, 9], 
  'Mittel', 
  'Wärmebedürftig, regelmäßig entspitzen. Nicht zu nass halten.',
  'Basilikum (Ocimum basilicum) ist ein aromatisches Küchenkraut mediterraner Herkunft. Es benötigt viel Wärme und einen geschützten Standort.',
  ARRAY['Tomaten', 'Paprika', 'Gurken'],
  ARRAY['Rucola', 'Salbei'],
  ARRAY['Regelmäßig Triebspitzen entfernen für buschigen Wuchs', 'Nicht über die Blätter gießen', 'Vor der Blüte ernten für bestes Aroma', 'Vor dem ersten Frost ernten oder ins Haus holen'],
  ARRAY['Grauschimmel', 'Blattflecken', 'Schneckenbefall', 'Wurzelfäule bei Staunässe']
),
(
  'Petersilie', 
  'Kräuter', 
  ARRAY['Frühling', 'Sommer', 'Herbst'], 
  ARRAY[3, 4, 5, 6, 7], 
  ARRAY[2, 3, 4], 
  ARRAY[4, 5], 
  ARRAY[5, 6, 7, 8, 9, 10], 
  'Einfach', 
  'Samen langsam keimend, vorher einweichen. Zweijährige Pflanze.',
  'Petersilie (Petroselinum crispum) ist ein zweijähriges Küchenkraut mit hohem Vitamin-C-Gehalt. Es gibt glatte und krause Sorten, wobei die glatten oft aromatischer sind.',
  ARRAY['Tomaten', 'Rosen', 'Zwiebeln', 'Karotten'],
  ARRAY['Salat', 'Kohl'],
  ARRAY['Samen 24 Stunden in lauwarmem Wasser einweichen', 'Keimung dauert 2-3 Wochen (Geduld!)', 'Regelmäßig ernten fördert Neuaustrieb', 'Im zweiten Jahr blüht die Pflanze und stirbt dann ab'],
  ARRAY['Petersilienminierfliege', 'Mehltau', 'Wurzelfäule bei Staunässe']
),
(
  'Schnittlauch', 
  'Kräuter', 
  ARRAY['Frühling', 'Sommer', 'Herbst'], 
  ARRAY[3, 4, 5], 
  ARRAY[2, 3], 
  ARRAY[4, 5], 
  ARRAY[4, 5, 6, 7, 8, 9, 10], 
  'Einfach', 
  'Mehrjährig, schneidet immer wieder nach. Alle 3-4 Jahre teilen.',
  'Schnittlauch (Allium schoenoprasum) ist ein mehrjähriges Küchenkraut aus der Familie der Zwiebelgewächse. Die röhrenförmigen Blätter haben ein mildes Zwiebelaroma.',
  ARRAY['Karotten', 'Tomaten', 'Erdbeeren', 'Gurken'],
  ARRAY['Bohnen', 'Erbsen'],
  ARRAY['Etwa 5 cm über dem Boden abschneiden', 'Blüten entfernen, wenn nicht gewünscht', 'Alle 3-4 Jahre teilen und neu pflanzen', 'Kann im Winter ins Haus geholt werden für frische Ernte'],
  ARRAY['Rostpilze', 'Zwiebelfliege', 'Thripse']
),
(
  'Thymian', 
  'Kräuter', 
  ARRAY['Frühling', 'Sommer'], 
  ARRAY[4, 5], 
  ARRAY[2, 3], 
  ARRAY[5, 6], 
  ARRAY[6, 7, 8, 9, 10], 
  'Mittel', 
  'Mehrjährig, mag trockene Standorte. Winterhart aber Schutz empfehlenswert.',
  'Thymian (Thymus vulgaris) ist ein aromatisches Küchenkraut und Heilpflanze mit holzigem Wuchs. Er bevorzugt sonnige, trockene Standorte und durchlässigen Boden.',
  ARRAY['Rosmarin', 'Salbei', 'Kohl', 'Erdbeeren'],
  ARRAY['Basilikum', 'Dill'],
  ARRAY['Sonnigen, warmen Standort wählen', 'Durchlässigen, kalkhaltigen Boden bevorzugt', 'Sparsam gießen, Staunässe vermeiden', 'Im Frühjahr leicht zurückschneiden'],
  ARRAY['Grauschimmel', 'Spinnmilben', 'Winterfeuchtigkeit']
),

-- Obst
(
  'Erdbeeren', 
  'Obst', 
  ARRAY['Frühling', 'Sommer'], 
  ARRAY[]::integer[], 
  ARRAY[]::integer[], 
  ARRAY[3, 4, 8, 9], 
  ARRAY[6, 7, 8], 
  'Einfach', 
  'Pflanzen im August für Ernte im nächsten Jahr. Stroh unterlegen gegen Fäulnis.',
  'Erdbeeren (Fragaria × ananassa) sind beliebte Beerenfrüchte für den Hausgarten. Sie können im Beet, in Töpfen oder sogar in Hängeampeln kultiviert werden.',
  ARRAY['Knoblauch', 'Zwiebeln', 'Spinat', 'Borretsch', 'Thymian'],
  ARRAY['Kohl', 'Tomaten', 'Kartoffeln'],
  ARRAY['Stroh unter die Früchte legen gegen Fäulnis', 'Alle 2-3 Jahre neu pflanzen', 'Ausläufer regelmäßig entfernen (außer zur Vermehrung)', 'Nach der Ernte Laub zurückschneiden'],
  ARRAY['Grauschimmel', 'Schnecken', 'Erdbeermilben', 'Verticillium-Welke']
),
(
  'Himbeeren', 
  'Obst', 
  ARRAY['Sommer'], 
  ARRAY[]::integer[], 
  ARRAY[]::integer[], 
  ARRAY[3, 4, 10, 11], 
  ARRAY[6, 7, 8, 9], 
  'Mittel', 
  'Sommertragende nach Ernte zurückschneiden, herbsttragende im Winter.',
  'Himbeeren (Rubus idaeus) sind mehrjährige Beerensträucher mit hohem Ertrag. Es gibt sommertragende und herbsttragende Sorten mit unterschiedlichem Schnittbedarf.',
  ARRAY['Knoblauch', 'Zwiebeln', 'Ringelblumen'],
  ARRAY['Kartoffeln', 'Tomaten', 'Erdbeeren'],
  ARRAY['Rankhilfe oder Spalier bereitstellen', 'Sommertragende: Tragruten nach Ernte entfernen', 'Herbsttragende: Im Winter bodennah zurückschneiden', 'Regelmäßig wässern, besonders während der Fruchtbildung'],
  ARRAY['Rutenkrankheit', 'Himbeerkäfer', 'Grauschimmel', 'Wurzelfäule bei Staunässe']
),

-- Blumen
(
  'Ringelblumen', 
  'Blumen', 
  ARRAY['Frühling', 'Sommer'], 
  ARRAY[4, 5, 6], 
  ARRAY[3, 4], 
  ARRAY[5], 
  ARRAY[6, 7, 8, 9, 10], 
  'Einfach', 
  'Selbstaussaat möglich. Essbare Blüten, auch als Nützlingsmagnet wertvoll.',
  'Ringelblumen (Calendula officinalis) sind robuste Garten- und Heilpflanzen mit leuchtend orangegelben Blüten. Sie ziehen Nützlinge an und haben eine abwehrende Wirkung gegen bestimmte Schädlinge.',
  ARRAY['Tomaten', 'Kohl', 'Salat', 'Gurken'],
  ARRAY[]::text[],
  ARRAY['Direkte Aussaat ins Freiland möglich', 'Verblühtes regelmäßig entfernen für längere Blüte', 'Selbstaussaat zulassen für nächstes Jahr', 'Blüten können in der Küche verwendet werden'],
  ARRAY['Echter Mehltau', 'Blattläuse', 'Schnecken']
),
(
  'Kapuzinerkresse', 
  'Blumen', 
  ARRAY['Frühling', 'Sommer'], 
  ARRAY[4, 5, 6], 
  ARRAY[]::integer[], 
  ARRAY[]::integer[], 
  ARRAY[6, 7, 8, 9, 10], 
  'Einfach', 
  'Essbare Blüten und Blätter. Wirkt als Schädlingsabwehr, lockt Blattläuse an.',
  'Kapuzinerkresse (Tropaeolum majus) ist eine vielseitige Pflanze mit essbaren, würzig-scharfen Blüten und Blättern. Sie wirkt als Schädlingsfalle und Nützlingsmagnet im Garten.',
  ARRAY['Gurken', 'Zucchini', 'Kürbis', 'Radieschen', 'Kohl'],
  ARRAY[]::text[],
  ARRAY['Direkte Aussaat nach den Eisheiligen', 'Rankhilfe für kletternde Sorten bereitstellen', 'Mageren Boden bevorzugt (sonst weniger Blüten)', 'Blüten und Blätter in Salaten verwenden'],
  ARRAY['Kohlweißlingsraupen', 'Blattläuse (wirkt als Fangpflanze)', 'Echter Mehltau']
);

-- Insert comprehensive companion planting data
INSERT INTO public.companion_plants (plant, good, bad) VALUES
-- Gemüse
(
  'Tomaten', 
  '[
    {"plant": "Basilikum", "reason": "Verbessert den Geschmack und hält Schädlinge wie Weiße Fliegen fern"},
    {"plant": "Karotten", "reason": "Lockern den Boden und konkurrieren nicht um die gleichen Nährstoffe"},
    {"plant": "Zwiebeln", "reason": "Halten Blattläuse und andere Schädlinge fern durch ihren intensiven Geruch"},
    {"plant": "Petersilie", "reason": "Verbessert das Wachstum und den Geschmack der Tomaten"},
    {"plant": "Tagetes", "reason": "Hält Nematoden und andere Bodenschädlinge fern"},
    {"plant": "Sellerie", "reason": "Verbessert den Geschmack und hält Schädlinge ab"}
  ]', 
  '[
    {"plant": "Kartoffeln", "reason": "Beide Nachtschattengewächse - fördern Krankheitsübertragung wie Kraut- und Braunfäule"},
    {"plant": "Fenchel", "reason": "Hemmt das Wachstum durch allelopathische Substanzen"},
    {"plant": "Mais", "reason": "Konkurriert um Licht und Nährstoffe, kann Tomaten überschatten"},
    {"plant": "Kohl", "reason": "Hoher Nährstoffbedarf führt zu Konkurrenz um Stickstoff"},
    {"plant": "Gurken", "reason": "Ähnliche Krankheitsanfälligkeit und Nährstoffkonkurrenz"}
  ]'
),
(
  'Karotten', 
  '[
    {"plant": "Zwiebeln", "reason": "Möhrenfliege wird durch Zwiebelgeruch abgehalten, Zwiebeln profitieren von lockerem Boden"},
    {"plant": "Lauch", "reason": "Ähnlicher Effekt wie Zwiebeln - hält Möhrenfliege fern"},
    {"plant": "Tomaten", "reason": "Karotten lockern Boden für Tomatenwurzeln, verschiedene Wurzeltiefen"},
    {"plant": "Radieschen", "reason": "Radieschen sind schnell abgeerntet und lockern Boden für Karotten"},
    {"plant": "Salat", "reason": "Oberflächlicher Wurzelbereich, keine Konkurrenz um Nährstoffe"},
    {"plant": "Erbsen", "reason": "Erbsen fixieren Stickstoff, den Karotten gut verwerten können"}
  ]', 
  '[
    {"plant": "Dill", "reason": "Kann das Karottenwachstum hemmen und zieht Möhrenfliege an"},
    {"plant": "Petersilie", "reason": "Verwandte Doldenblütler - können sich gegenseitig in der Entwicklung hemmen"},
    {"plant": "Sellerie", "reason": "Ebenfalls Doldenblütler mit ähnlichen Nährstoffansprüchen"},
    {"plant": "Fenchel", "reason": "Allelopathische Wirkung hemmt Karottenwachstum"}
  ]'
),
(
  'Gurken', 
  '[
    {"plant": "Bohnen", "reason": "Bohnen fixieren Stickstoff, den Gurken für ihr Blattwachstum benötigen"},
    {"plant": "Erbsen", "reason": "Stickstoffdüngung durch Bohnen kommt Gurken zugute"},
    {"plant": "Salat", "reason": "Bodenbeschattung hält Feuchtigkeit, verschiedene Wurzeltiefen"},
    {"plant": "Zwiebeln", "reason": "Halten Blattläuse und andere Schädlinge durch Geruch fern"},
    {"plant": "Dill", "reason": "Verbessert Geschmack und hält Schädlinge wie Spinnmilben fern"}
  ]', 
  '[
    {"plant": "Kartoffeln", "reason": "Konkurrenz um Wasser und Nährstoffe, ähnliche Krankheitsanfälligkeit"},
    {"plant": "Tomaten", "reason": "Beide wärmebedürftig - Konkurrenz um beste Standorte und Krankheitsübertragung"},
    {"plant": "Radieschen", "reason": "Radieschen können Gurkenwurzeln beim Wachstum stören"},
    {"plant": "Aromahafte Kräuter", "reason": "Zu intensive Gerüche können Gurkengeschmack beeinträchtigen"}
  ]'
),
(
  'Bohnen', 
  '[
    {"plant": "Karotten", "reason": "Bohnen fixieren Stickstoff, Karotten lockern Boden für Bohnenwurzeln"},
    {"plant": "Gurken", "reason": "Stickstoffdüngung durch Bohnen unterstützt Gurkenwachstum"},
    {"plant": "Kartoffeln", "reason": "Ergänzende Nährstoffbedürfnisse und Bohnen verbessern Bodenstruktur"},
    {"plant": "Kohl", "reason": "Stickstoffversorgung für Kohl, verschiedene Wurzeltiefen"},
    {"plant": "Salat", "reason": "Schnelle Ernte, profitiert von Stickstoff der Bohnen"}
  ]', 
  '[
    {"plant": "Zwiebeln", "reason": "Zwiebeln hemmen das Wachstum der Knöllchenbakterien an Bohnenwurzeln"},
    {"plant": "Knoblauch", "reason": "Ähnlicher hemmender Effekt auf Stickstoff-Fixierung wie Zwiebeln"},
    {"plant": "Fenchel", "reason": "Allelopathische Substanzen können Bohnenwachstum beeinträchtigen"},
    {"plant": "Lauch", "reason": "Kann die Stickstoff-Fixierung der Bohnen beeinträchtigen"}
  ]'
),
(
  'Kohl', 
  '[
    {"plant": "Zwiebeln", "reason": "Halten Kohlweißling und andere Schädlinge durch intensiven Geruch fern"},
    {"plant": "Kartoffeln", "reason": "Kartoffeln halten Erdflöhe fern, Kohl schützt vor Kartoffelkäfer"},
    {"plant": "Salat", "reason": "Beschattet Boden, verschiedene Nährstoffansprüche"},
    {"plant": "Spinat", "reason": "Bodenbeschattung und schnelle Ernte vor Kohlentwicklung"},
    {"plant": "Sellerie", "reason": "Hält Kohlweißling fern und verbessert Bodenstruktur"}
  ]', 
  '[
    {"plant": "Erdbeeren", "reason": "Kohl entzieht Erdbeeren wichtige Nährstoffe und hemmt Fruchtbildung"},
    {"plant": "Knoblauch", "reason": "Kann Kohlwachstum durch allelopathische Wirkung hemmen"},
    {"plant": "Andere Kohlarten", "reason": "Gleiche Schädlinge und Krankheiten, Nährstoffkonkurrenz"}
  ]'
),

-- Kräuter
(
  'Basilikum', 
  '[
    {"plant": "Tomaten", "reason": "Verbessert Geschmack und Wachstum, hält Schädlinge fern"},
    {"plant": "Paprika", "reason": "Fördert Wachstum und Aroma, wirkt als natürlicher Schädlingsschutz"},
    {"plant": "Gurken", "reason": "Verbessert Geschmack und schützt vor Mehltau"},
    {"plant": "Zucchini", "reason": "Hält Schädlinge fern und verbessert das Aroma"}
  ]', 
  '[
    {"plant": "Rucola", "reason": "Konkurrenz um Nährstoffe und Wachstumshemmung"},
    {"plant": "Salbei", "reason": "Unterschiedliche Wachstumsbedingungen, Salbei kann Basilikum unterdrücken"},
    {"plant": "Thymian", "reason": "Unterschiedliche Wasseransprüche können problematisch sein"}
  ]'
),
(
  'Thymian', 
  '[
    {"plant": "Kohl", "reason": "Hält Kohlweißling und andere Kohlschädlinge fern"},
    {"plant": "Erdbeeren", "reason": "Verbessert Wachstum und Aroma, hält Schädlinge fern"},
    {"plant": "Rosmarin", "reason": "Ähnliche Standortansprüche, ergänzen sich gut"},
    {"plant": "Tomaten", "reason": "Hält Schädlinge fern und verbessert Bodenstruktur"}
  ]', 
  '[
    {"plant": "Basilikum", "reason": "Unterschiedliche Wasseransprüche können problematisch sein"},
    {"plant": "Gurken", "reason": "Unterschiedliche Standortansprüche, Thymian mag es trocken"}
  ]'
);

-- Insert comprehensive growing tips
INSERT INTO public.plant_growing_tips (
  plant, 
  temperature, 
  watering, 
  light, 
  timing, 
  difficulty, 
  specific_tips, 
  common_mistakes
) VALUES
-- Gemüse
(
  'Tomaten', 
  '18-25°C optimal, mindestens 15°C nachts', 
  'Gleichmäßig feucht, aber nicht nass. Morgens gießen.', 
  '6-8 Stunden direktes Sonnenlicht täglich', 
  'Nach den Eisheiligen (Mitte Mai) auspflanzen', 
  'Mittel', 
  ARRAY[
    'Ausgeizen (Seitentriebe entfernen) für bessere Fruchtentwicklung', 
    'Stütze oder Rankhilfe bereits beim Pflanzen anbringen', 
    'Mulchen verhindert Krankheiten und hält Feuchtigkeit', 
    'Kalium-reiche Düngung für bessere Fruchtbildung',
    'Regelmäßig auf Krankheiten kontrollieren, besonders bei feuchtem Wetter'
  ], 
  ARRAY[
    'Zu früh auspflanzen - Frostgefahr!', 
    'Blätter beim Gießen benetzen - fördert Krankheiten',
    'Überdüngung mit Stickstoff - viel Blatt, wenig Frucht',
    'Zu eng pflanzen - mindestens 50-60 cm Abstand nötig',
    'Unregelmäßiges Gießen - führt zu Blütenendfäule'
  ]
),
(
  'Karotten', 
  '15-20°C optimal, keimen ab 8°C', 
  'Gleichmäßig feucht, besonders während Keimung', 
  'Volle Sonne bis Halbschatten', 
  'März bis Juli säen möglich', 
  'Mittel', 
  ARRAY[
    'Boden tiefgründig lockern für gerade Wurzeln (30 cm)',
    'Dünn säen und später vereinzeln auf 3-5 cm Abstand',
    'Samen vor Aussaat in feuchtem Sand stratifizieren',
    'Reihen mit Radieschen markieren (keimen schneller)',
    'Frischen Mist vermeiden - führt zu gegabelten Wurzeln'
  ], 
  ARRAY[
    'Zu dicht säen - Karotten bleiben klein',
    'Unregelmäßiges Gießen - rissige Wurzeln',
    'Zu schwerer oder steiniger Boden - verformte Wurzeln',
    'Frischer Mist - führt zu Verzweigungen',
    'Zu tiefe Aussaat - verzögerte und ungleichmäßige Keimung'
  ]
),
(
  'Gurken', 
  '20-25°C optimal, sehr wärmebedürftig', 
  'Viel Wasser, aber keine Staunässe', 
  'Volle Sonne, windgeschützt', 
  'Nach Eisheiligen, ab 15°C Bodentemperatur', 
  'Mittel', 
  ARRAY[
    'Rankhilfe für Schlangengurken bereitstellen',
    'Regelmäßig ernten für kontinuierliche Produktion',
    'Weibliche Blüten nicht entfernen bei Freilandgurken',
    'Kalium-reiche Düngung für aromatische Früchte',
    'Mulchschicht hält Boden feucht und warm'
  ], 
  ARRAY[
    'Zu früh säen - Kälteschock',
    'Unregelmäßiges Gießen - bittere Gurken',
    'Früchte zu spät ernten - hemmt weitere Bildung',
    'Blätter beim Gießen benetzen - fördert Mehltau',
    'Zu enge Pflanzung - schlechte Luftzirkulation'
  ]
),
(
  'Salat', 
  '15-20°C optimal, schosst bei Hitze', 
  'Regelmäßig, aber nicht zu nass', 
  'Halbschatten bis volle Sonne', 
  'Frühjahr und Herbst ideal', 
  'Einfach', 
  ARRAY[
    'Lichtkeimer - Samen nur andrücken, nicht bedecken',
    'Bei Hitze für Schatten sorgen',
    'Kopfsalat braucht mehr Platz als Pflücksalat',
    'Gestaffelte Aussaat alle 2 Wochen für kontinuierliche Ernte',
    'Verschiedene Sorten für unterschiedliche Jahreszeiten wählen'
  ], 
  ARRAY[
    'Zu tief säen - Samen keimen nicht',
    'Im Hochsommer säen - schosst sofort',
    'Zu wenig Abstand - kleine Köpfe',
    'Unregelmäßiges Gießen - bitterer Geschmack',
    'Zu späte Ernte - wird bitter und schosst'
  ]
),

-- Kräuter
(
  'Basilikum', 
  '20-25°C, sehr wärmebedürftig', 
  'Mäßig, nicht über Blätter gießen', 
  'Volle Sonne, geschützter Standort', 
  'Nach Eisheiligen ins Freie', 
  'Mittel', 
  ARRAY[
    'Blütenstände ausbrechen für mehr Blattmasse',
    'Triebspitzen regelmäßig entspitzen für buschigen Wuchs',
    'Im Topf überwintern möglich bei 15-18°C',
    'Nicht zu früh ernten - Pflanze muss etabliert sein',
    'Immer ganze Triebe abschneiden, nicht einzelne Blätter'
  ], 
  ARRAY[
    'Zu kalt stellen - stirbt ab unter 10°C',
    'Überwässern - Wurzelfäule',
    'Blüten stehen lassen - weniger aromatische Blätter',
    'Zu früh ins Freie pflanzen - kälteempfindlich',
    'Zu wenig Licht - lange, schwache Triebe'
  ]
),
(
  'Schnittlauch', 
  '15-25°C, robust und winterhart', 
  'Regelmäßig, nicht austrocknen lassen', 
  'Sonnig bis halbschattig', 
  'Frühjahr oder Herbst pflanzen', 
  'Einfach', 
  ARRAY[
    'Etwa 5 cm über dem Boden abschneiden',
    'Blüten entfernen, wenn nicht gewünscht (essbar!)',
    'Alle 3-4 Jahre teilen und neu pflanzen',
    'Kann im Winter ins Haus geholt werden für frische Ernte',
    'Nach starkem Rückschnitt mit Flüssigdünger unterstützen'
  ], 
  ARRAY[
    'Zu tief schneiden - schwächt die Pflanze',
    'Zu selten ernten - verholzt und verliert Aroma',
    'Zu eng pflanzen - mindestens 20 cm Abstand nötig',
    'Staunässe - führt zu Wurzelfäule',
    'Zu starke Düngung - wässriges Aroma'
  ]
),

-- Obst
(
  'Erdbeeren', 
  '15-25°C optimal', 
  'Regelmäßig, besonders während Fruchtbildung', 
  'Sonnig bis halbschattig', 
  'Pflanzung August-September oder März-April', 
  'Einfach', 
  ARRAY[
    'Stroh unter die Früchte legen gegen Fäulnis',
    'Alle 2-3 Jahre neu pflanzen für gute Erträge',
    'Ausläufer regelmäßig entfernen (außer zur Vermehrung)',
    'Nach der Ernte Laub zurückschneiden',
    'Vor Blüte mit Kalium düngen für bessere Fruchtbildung'
  ], 
  ARRAY[
    'Zu tief pflanzen - Herzblatt muss frei bleiben',
    'Zu viel Stickstoff - viel Laub, wenig Früchte',
    'Zu wenig Abstand - schlechte Luftzirkulation',
    'Alte Pflanzen behalten - Ertrag nimmt nach 2-3 Jahren ab',
    'Falsche Bewässerung - Früchte werden wässrig'
  ]
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sowing_calendar_season ON public.sowing_calendar USING GIN (season);
CREATE INDEX IF NOT EXISTS idx_sowing_calendar_direct_sow ON public.sowing_calendar USING GIN (direct_sow);
CREATE INDEX IF NOT EXISTS idx_sowing_calendar_harvest ON public.sowing_calendar USING GIN (harvest);

-- Add more comprehensive data
INSERT INTO public.sowing_calendar (
  name, 
  type, 
  season, 
  direct_sow, 
  indoor, 
  plant_out, 
  harvest, 
  difficulty, 
  notes, 
  description,
  companion_plants,
  avoid_plants,
  growing_tips,
  common_problems
) VALUES
-- Mehr Gemüse
(
  'Kohlrabi', 
  'Gemüse', 
  ARRAY['Frühling', 'Sommer', 'Herbst'], 
  ARRAY[4, 5, 6, 7], 
  ARRAY[2, 3], 
  ARRAY[4, 5, 6], 
  ARRAY[5, 6, 7, 8, 9, 10], 
  'Einfach', 
  'Schnellwachsend, mehrere Sätze möglich. Gleichmäßig gießen für zarte Knollen.',
  'Kohlrabi (Brassica oleracea var. gongylodes) bildet oberirdische Knollen und ist ein schnellwachsendes Kohlgemüse. Er ist reich an Vitamin C und Ballaststoffen.',
  ARRAY['Salat', 'Spinat', 'Gurken', 'Zwiebeln', 'Dill'],
  ARRAY['Tomaten', 'Erdbeeren', 'Bohnen'],
  ARRAY['Ernten, wenn Knollen 5-8 cm Durchmesser haben', 'Gleichmäßig gießen für zarte Knollen', 'Mehrere Sätze für kontinuierliche Ernte', 'Kohlnetz gegen Schädlinge verwenden'],
  ARRAY['Kohlhernie', 'Kohlweißling', 'Erdflöhe', 'Holzige Knollen bei zu später Ernte']
),
(
  'Fenchel', 
  'Gemüse', 
  ARRAY['Sommer', 'Herbst'], 
  ARRAY[6, 7], 
  ARRAY[5, 6], 
  ARRAY[6, 7], 
  ARRAY[8, 9, 10, 11], 
  'Mittel', 
  'Schosst bei Hitze und Trockenheit. Nicht neben andere Doldenblütler pflanzen.',
  'Fenchel (Foeniculum vulgare) bildet aromatische Knollen mit anisartigem Geschmack. Er ist ein Doldenblütler und hat allelopathische Wirkung auf viele andere Pflanzen.',
  ARRAY['Gurken', 'Salat', 'Zwiebeln'],
  ARRAY['Tomaten', 'Bohnen', 'Karotten', 'Kohl'],
  ARRAY['Direkte Aussaat ab Juni', 'Gleichmäßig feucht halten gegen Schossen', 'Nicht zu eng pflanzen (30 cm Abstand)', 'Bei Trockenheit mulchen'],
  ARRAY['Vorzeitiges Schossen', 'Blattläuse', 'Schneckenbefall', 'Möhrenfliege']
),
(
  'Kürbis', 
  'Gemüse', 
  ARRAY['Frühling', 'Sommer'], 
  ARRAY[5, 6], 
  ARRAY[4, 5], 
  ARRAY[5, 6], 
  ARRAY[9, 10], 
  'Einfach', 
  'Viel Platz und Nährstoffe benötigt. Rankt stark, kann über Kompost gepflanzt werden.',
  'Kürbisse (Cucurbita) sind platzbedürftige Rankpflanzen mit hohem Nährstoffbedarf. Es gibt zahlreiche Sorten von Speise- bis Zierkürbissen in verschiedenen Größen und Formen.',
  ARRAY['Mais', 'Bohnen', 'Kapuzinerkresse', 'Ringelblumen'],
  ARRAY['Kartoffeln', 'Tomaten', 'Radieschen'],
  ARRAY['Auf Komposthaufen pflanzen für optimale Nährstoffversorgung', 'Viel Platz lassen (2-3 m²/Pflanze)', 'Früchte auf Brettern oder Stroh lagern', 'Regelmäßig gießen, aber Blätter trocken halten'],
  ARRAY['Echter Mehltau', 'Schneckenbefall bei jungen Pflanzen', 'Kürbisfliege', 'Fruchtfäule bei Bodenkontakt']
),
(
  'Mais', 
  'Gemüse', 
  ARRAY['Frühling', 'Sommer'], 
  ARRAY[5], 
  ARRAY[4], 
  ARRAY[5], 
  ARRAY[8, 9], 
  'Mittel', 
  'Wärmebedürftig, windgeschützter Standort. In Gruppen pflanzen für Bestäubung.',
  'Mais (Zea mays) ist ein Süßgras mit hohem Wärmebedarf. Er wird idealerweise in Blöcken gepflanzt, um die Windbestäubung zu fördern.',
  ARRAY['Bohnen', 'Kürbis', 'Gurken', 'Zucchini'],
  ARRAY['Tomaten', 'Sellerie'],
  ARRAY['In Blöcken pflanzen (mind. 4x4 Pflanzen) für Bestäubung', 'Windgeschützten Standort wählen', 'Mehrere Kolben pro Pflanze entfernen für größere Hauptkolben', 'Ernten, wenn Körner milchig sind (Fingernagel-Test)'],
  ARRAY['Maiszünsler', 'Vögel (Saatgut und reife Körner)', 'Trockenschäden', 'Mangelhafte Bestäubung']
),

-- Mehr Kräuter
(
  'Rosmarin', 
  'Kräuter', 
  ARRAY['Frühling', 'Sommer'], 
  ARRAY[]::integer[], 
  ARRAY[2, 3, 4], 
  ARRAY[5, 6], 
  ARRAY[6, 7, 8, 9, 10], 
  'Schwer', 
  'Mehrjährig, frostschutz erforderlich. Mag trockene, sonnige Standorte.',
  'Rosmarin (Rosmarinus officinalis) ist ein immergrüner Halbstrauch mit aromatischen, nadelförmigen Blättern. Er stammt aus dem Mittelmeerraum und bevorzugt warme, trockene Standorte.',
  ARRAY['Salbei', 'Thymian', 'Kohl', 'Bohnen'],
  ARRAY['Basilikum', 'Petersilie', 'Minze'],
  ARRAY['Durchlässigen, kalkhaltigen Boden verwenden', 'Sparsam gießen, Staunässe vermeiden', 'Im Winter hell und kühl (5-10°C) überwintern', 'Im Frühjahr leicht zurückschneiden, nicht ins alte Holz'],
  ARRAY['Frostschäden', 'Grauschimmel bei zu viel Feuchtigkeit', 'Spinnmilben', 'Wurzelfäule bei Staunässe']
),
(
  'Minze', 
  'Kräuter', 
  ARRAY['Frühling', 'Sommer'], 
  ARRAY[4, 5], 
  ARRAY[2, 3, 4], 
  ARRAY[5, 6], 
  ARRAY[6, 7, 8, 9, 10], 
  'Einfach', 
  'Mehrjährig, breitet sich stark aus, Rhizomsperre empfehlenswert.',
  'Minze (Mentha) ist ein aromatisches, stark wucherndes Kraut mit vielen Sorten und Aromen. Sie bevorzugt feuchte Standorte und breitet sich über unterirdische Ausläufer aus.',
  ARRAY['Tomaten', 'Kohl', 'Salat'],
  ARRAY['Kamille', 'Petersilie'],
  ARRAY['In Töpfen oder mit Rhizomsperre pflanzen', 'Regelmäßig zurückschneiden für buschigen Wuchs', 'Feuchten Standort bevorzugt', 'Alle 2-3 Jahre teilen und neu pflanzen'],
  ARRAY['Unkontrollierte Ausbreitung', 'Rostpilze', 'Blattfleckenkrankheit', 'Minzekäfer']
),
(
  'Dill', 
  'Kräuter', 
  ARRAY['Frühling', 'Sommer'], 
  ARRAY[4, 5, 6, 7], 
  ARRAY[]::integer[], 
  ARRAY[]::integer[], 
  ARRAY[6, 7, 8, 9], 
  'Einfach', 
  'Selbstaussaat, mehrere Sätze für kontinuierliche Ernte. Blüten für Samen stehen lassen.',
  'Dill (Anethum graveolens) ist ein einjähriges Küchenkraut aus der Familie der Doldenblütler. Sowohl Blätter als auch Samen werden in der Küche verwendet.',
  ARRAY['Gurken', 'Kohl', 'Zwiebeln', 'Salat'],
  ARRAY['Karotten', 'Tomaten', 'Fenchel'],
  ARRAY['Direkte Aussaat, nicht verpflanzen (Pfahlwurzel)', 'Mehrere Aussaaten für kontinuierliche Ernte', 'Blüten für Saatgutgewinnung stehen lassen', 'Junge Blätter für frischen Verzehr, Samen zum Würzen'],
  ARRAY['Blattläuse', 'Mehltau', 'Vorzeitiges Schossen bei Hitze', 'Umfallen junger Pflanzen']
),

-- Mehr Obst
(
  'Johannisbeeren', 
  'Obst', 
  ARRAY['Sommer'], 
  ARRAY[]::integer[], 
  ARRAY[]::integer[], 
  ARRAY[3, 4, 10, 11], 
  ARRAY[6, 7, 8], 
  'Einfach', 
  'Mehrjährig, verträgt auch Halbschatten. Regelmäßiger Schnitt für gute Erträge.',
  'Johannisbeeren (Ribes) sind robuste Beerensträucher, die in roten, weißen und schwarzen Sorten erhältlich sind. Sie sind reich an Vitamin C und Antioxidantien.',
  ARRAY['Knoblauch', 'Tagetes', 'Kapuzinerkresse'],
  ARRAY['Walnuss'],
  ARRAY['Regelmäßiger Schnitt im Winter für gute Erträge', 'Alte Triebe (älter als 3 Jahre) entfernen', 'Mulchschicht gegen Austrocknung', 'Schwarze Johannisbeeren benötigen mehr Schnitt als rote'],
  ARRAY['Johannisbeerglasflügler', 'Blattläuse', 'Mehltau', 'Johannisbeerrost']
),
(
  'Stachelbeeren', 
  'Obst', 
  ARRAY['Sommer'], 
  ARRAY[]::integer[], 
  ARRAY[]::integer[], 
  ARRAY[3, 4, 10, 11], 
  ARRAY[6, 7, 8], 
  'Einfach', 
  'Mehrjährig, dornig. Regelmäßiger Schnitt für gute Erträge und Luftzirkulation.',
  'Stachelbeeren (Ribes uva-crispa) sind dornige Beerensträucher mit grünen, gelben oder roten Früchten. Sie sind robust und langlebig.',
  ARRAY['Knoblauch', 'Tagetes', 'Kapuzinerkresse'],
  ARRAY['Walnuss'],
  ARRAY['Regelmäßiger Schnitt für luftigen Wuchs', 'Alte und bodenliegende Triebe entfernen', 'Handschuhe beim Schnitt und der Ernte tragen', 'Mulchschicht gegen Austrocknung'],
  ARRAY['Amerikanischer Stachelbeermehltau', 'Blattläuse', 'Stachelbeerblattwespe', 'Fruchtfäule']
),

-- Blumen
(
  'Tagetes', 
  'Blumen', 
  ARRAY['Frühling', 'Sommer'], 
  ARRAY[5, 6], 
  ARRAY[3, 4], 
  ARRAY[5], 
  ARRAY[6, 7, 8, 9, 10], 
  'Einfach', 
  'Wirksam gegen Nematoden im Boden. Verschiedene Höhen und Farben verfügbar.',
  'Tagetes (Tagetes) sind robuste Sommerblumen mit intensivem Duft. Sie wirken als natürliche Schädlingsabwehr im Garten und sind in verschiedenen Größen erhältlich.',
  ARRAY['Tomaten', 'Rosen', 'Kartoffeln', 'Erdbeeren'],
  ARRAY[]::text[],
  ARRAY['Direkte Aussaat nach den Eisheiligen', 'Regelmäßig verblühtes entfernen für längere Blüte', 'Zwischen Gemüsepflanzen setzen zur Schädlingsabwehr', 'Sonnigen Standort wählen'],
  ARRAY['Blattläuse', 'Schneckenbefall bei jungen Pflanzen', 'Grauschimmel bei zu viel Nässe']
),
(
  'Borretsch', 
  'Blumen', 
  ARRAY['Frühling', 'Sommer'], 
  ARRAY[4, 5, 6], 
  ARRAY[]::integer[], 
  ARRAY[]::integer[], 
  ARRAY[6, 7, 8, 9], 
  'Einfach', 
  'Essbare blaue Blüten, Bienenweide. Selbstaussaat möglich.',
  'Borretsch (Borago officinalis) ist eine einjährige Pflanze mit essbaren blauen Blüten und gurkig schmeckenden Blättern. Er ist ein hervorragender Bienenlockstoff und verbessert den Geschmack von Erdbeeren.',
  ARRAY['Erdbeeren', 'Tomaten', 'Gurken', 'Zucchini'],
  ARRAY[]::text[],
  ARRAY['Direkte Aussaat ab April', 'Selbstaussaat zulassen für nächstes Jahr', 'Blüten in Salaten und als Dekoration verwenden', 'Lockeren, nährstoffreichen Boden bevorzugt'],
  ARRAY['Echter Mehltau', 'Zu enge Pflanzung - benötigt Luftzirkulation', 'Staunässe']
);

-- Insert comprehensive growing tips for more plants
INSERT INTO public.plant_growing_tips (
  plant, 
  temperature, 
  watering, 
  light, 
  timing, 
  difficulty, 
  specific_tips, 
  common_mistakes
) VALUES
(
  'Gurken', 
  '20-25°C optimal, sehr wärmebedürftig', 
  'Viel Wasser, aber keine Staunässe', 
  'Volle Sonne, windgeschützt', 
  'Nach Eisheiligen, ab 15°C Bodentemperatur', 
  'Mittel', 
  ARRAY[
    'Rankhilfe für Schlangengurken bereitstellen',
    'Regelmäßig ernten für kontinuierliche Produktion',
    'Weibliche Blüten nicht entfernen bei Freilandgurken',
    'Kalium-reiche Düngung für aromatische Früchte',
    'Mulchschicht hält Boden feucht und warm'
  ], 
  ARRAY[
    'Zu früh säen - Kälteschock',
    'Unregelmäßiges Gießen - bittere Gurken',
    'Früchte zu spät ernten - hemmt weitere Bildung',
    'Blätter beim Gießen benetzen - fördert Mehltau',
    'Zu enge Pflanzung - schlechte Luftzirkulation'
  ]
),
(
  'Zucchini', 
  '18-25°C optimal', 
  'Regelmäßig und reichlich', 
  'Volle Sonne', 
  'Nach den Eisheiligen auspflanzen', 
  'Einfach', 
  ARRAY[
    'Regelmäßig ernten, wenn Früchte 15-20 cm lang sind',
    'Direkt an der Basis gießen',
    'Mulchschicht gegen Austrocknung und Unkraut',
    'Männliche und weibliche Blüten für Befruchtung benötigt',
    'Viel Platz lassen (mind. 1 m² pro Pflanze)'
  ], 
  ARRAY[
    'Zu späte Ernte - Früchte werden hart und bitter',
    'Zu enge Pflanzung - fördert Mehltau',
    'Blätter beim Gießen benetzen - fördert Pilzkrankheiten',
    'Zu früh auspflanzen - Kälteschäden'
  ]
),
(
  'Brokkoli', 
  '15-20°C optimal', 
  'Gleichmäßig feucht', 
  'Volle Sonne bis Halbschatten', 
  'Frühjahr oder Spätsommer', 
  'Mittel', 
  ARRAY[
    'Regelmäßig gießen, besonders während der Kopfbildung',
    'Ernten, bevor sich die Blütenknospen öffnen',
    'Seitentriebe nach Haupternte weiter nutzen',
    'Kohlnetz gegen Schädlinge verwenden',
    'Nährstoffreichen Boden bereitstellen'
  ], 
  ARRAY[
    'Zu späte Ernte - Blüten öffnen sich',
    'Unregelmäßige Bewässerung - ungleichmäßiges Wachstum',
    'Kein Schutz vor Kohlweißling',
    'Zu enge Pflanzung - kleine Köpfe'
  ]
),
(
  'Radieschen', 
  '10-20°C optimal', 
  'Regelmäßig, nicht austrocknen lassen', 
  'Sonnig bis halbschattig', 
  'März bis September', 
  'Einfach', 
  ARRAY[
    'Schnellwachsend - nach 4-6 Wochen erntereif',
    'Alle 2 Wochen nachsäen für kontinuierliche Ernte',
    'Bei Hitze täglich gießen',
    'Erdflöhe mit Kulturschutznetz abhalten',
    'Lockeren, humosen Boden bevorzugt'
  ], 
  ARRAY[
    'Zu spät ernten - werden holzig und scharf',
    'Unregelmäßiges Gießen - platzen auf',
    'Zu dicht stehen lassen - bilden keine Knollen',
    'Zu stickstoffreiche Düngung - viel Laub, kleine Knollen'
  ]
),
(
  'Bohnen', 
  '18-25°C optimal, kälteempfindlich', 
  'Regelmäßig, nicht über Blätter', 
  'Sonnig', 
  'Nach den Eisheiligen', 
  'Einfach', 
  ARRAY[
    'Direkt ins Freiland säen nach den Eisheiligen',
    'Stangenbohnen benötigen stabile Rankhilfen (2-2,5 m hoch)',
    'Nicht bei Nässe ernten (Rostgefahr)',
    'Regelmäßig ernten fördert Neubildung',
    'Samen vor Aussaat nicht einweichen (Fäulnisgefahr)'
  ], 
  ARRAY[
    'Zu frühe Aussaat - Kälteschäden',
    'Zu tiefe Aussaat - Keimprobleme',
    'Ernte bei Nässe - Rostbildung',
    'Unzureichende Rankhilfen bei Stangenbohnen'
  ]
),
(
  'Erdbeeren', 
  '15-25°C optimal', 
  'Regelmäßig, besonders während Fruchtbildung', 
  'Sonnig bis halbschattig', 
  'Pflanzung August-September oder März-April', 
  'Einfach', 
  ARRAY[
    'Stroh unter die Früchte legen gegen Fäulnis',
    'Alle 2-3 Jahre neu pflanzen für gute Erträge',
    'Ausläufer regelmäßig entfernen (außer zur Vermehrung)',
    'Nach der Ernte Laub zurückschneiden',
    'Vor Blüte mit Kalium düngen für bessere Fruchtbildung'
  ], 
  ARRAY[
    'Zu tief pflanzen - Herzblatt muss frei bleiben',
    'Zu viel Stickstoff - viel Laub, wenig Früchte',
    'Zu wenig Abstand - schlechte Luftzirkulation',
    'Alte Pflanzen behalten - Ertrag nimmt nach 2-3 Jahren ab',
    'Falsche Bewässerung - Früchte werden wässrig'
  ]
),
(
  'Thymian', 
  '15-25°C, hitzetolerant', 
  'Sparsam, Trockenheit tolerant', 
  'Volle Sonne', 
  'Frühjahr oder Herbst', 
  'Mittel', 
  ARRAY[
    'Sonnigen, warmen Standort wählen',
    'Durchlässigen, kalkhaltigen Boden bevorzugt',
    'Sparsam gießen, Staunässe vermeiden',
    'Im Frühjahr leicht zurückschneiden',
    'Vor der Blüte ernten für bestes Aroma'
  ], 
  ARRAY[
    'Zu feuchter Standort - Wurzelfäule',
    'Zu nährstoffreicher Boden - weniger Aroma',
    'Zu starker Rückschnitt ins alte Holz',
    'Winterfeuchtigkeit - kann zu Ausfällen führen'
  ]
),
(
  'Rosmarin', 
  '15-25°C, frostempfindlich', 
  'Sparsam, Trockenheit tolerant', 
  'Volle Sonne', 
  'Frühjahr', 
  'Schwer', 
  ARRAY[
    'Durchlässigen, kalkhaltigen Boden verwenden',
    'Sparsam gießen, Staunässe vermeiden',
    'Im Winter hell und kühl (5-10°C) überwintern',
    'Im Frühjahr leicht zurückschneiden, nicht ins alte Holz',
    'In Töpfen kultivieren für bessere Überwinterung'
  ], 
  ARRAY[
    'Frostschäden - nicht winterhart in kalten Regionen',
    'Grauschimmel bei zu viel Feuchtigkeit',
    'Spinnmilben bei trockener Heizungsluft',
    'Wurzelfäule bei Staunässe',
    'Zu starker Rückschnitt ins alte Holz'
  ]
),
(
  'Ringelblumen', 
  '10-25°C, robust', 
  'Mäßig, Trockenheit tolerant', 
  'Sonnig bis halbschattig', 
  'April bis Juni', 
  'Einfach', 
  ARRAY[
    'Direkte Aussaat ins Freiland möglich',
    'Verblühtes regelmäßig entfernen für längere Blüte',
    'Selbstaussaat zulassen für nächstes Jahr',
    'Blüten können in der Küche verwendet werden',
    'Mageren Boden bevorzugt für mehr Blüten'
  ], 
  ARRAY[
    'Echter Mehltau bei zu engem Stand',
    'Blattläuse bei zu viel Stickstoff',
    'Schneckenbefall bei jungen Pflanzen',
    'Zu nährstoffreicher Boden - weniger Blüten, mehr Blätter'
  ]
);

-- Add more companion planting relationships
INSERT INTO public.companion_plants (plant, good, bad) VALUES
(
  'Zucchini', 
  '[
    {"plant": "Mais", "reason": "Mais bietet Windschutz und Schatten für Zucchini"},
    {"plant": "Bohnen", "reason": "Bohnen fixieren Stickstoff, den Zucchini für ihr Wachstum benötigen"},
    {"plant": "Kapuzinerkresse", "reason": "Hält Schädlinge fern und lockt Bestäuber an"},
    {"plant": "Ringelblumen", "reason": "Wirken als Schädlingsabwehr und fördern Bestäuber"}
  ]', 
  '[
    {"plant": "Kartoffeln", "reason": "Konkurrenz um Nährstoffe und erhöhtes Krankheitsrisiko"},
    {"plant": "Gurken", "reason": "Ähnliche Nährstoffansprüche und Anfälligkeit für die gleichen Krankheiten"}
  ]'
),
(
  'Paprika', 
  '[
    {"plant": "Basilikum", "reason": "Verbessert Geschmack und hält Schädlinge fern"},
    {"plant": "Zwiebeln", "reason": "Schützen vor Blattläusen und anderen Schädlingen"},
    {"plant": "Karotten", "reason": "Lockern den Boden und konkurrieren nicht um Nährstoffe"},
    {"plant": "Tagetes", "reason": "Wirken gegen Nematoden im Boden"}
  ]', 
  '[
    {"plant": "Fenchel", "reason": "Hemmt das Wachstum durch allelopathische Substanzen"},
    {"plant": "Bohnen", "reason": "Ungünstige Wachstumsbedingungen für beide Pflanzen"},
    {"plant": "Kohl", "reason": "Konkurrenz um Nährstoffe"}
  ]'
),
(
  'Zwiebeln', 
  '[
    {"plant": "Karotten", "reason": "Klassische Partnerschaft - Zwiebelgeruch hält Möhrenfliege fern"},
    {"plant": "Rote Bete", "reason": "Verschiedene Wurzeltiefen, Zwiebeln schützen vor Blattläusen"},
    {"plant": "Salat", "reason": "Schutz vor Schädlingen, verschiedene Nährstoffansprüche"},
    {"plant": "Tomaten", "reason": "Halten Blattläuse und andere Schädlinge von Tomaten fern"},
    {"plant": "Erdbeeren", "reason": "Schützen vor Grauschimmel und anderen Pilzkrankheiten"}
  ]', 
  '[
    {"plant": "Bohnen", "reason": "Hemmen die Knöllchenbakterien und damit Stickstoff-Fixierung der Bohnen"},
    {"plant": "Erbsen", "reason": "Ähnlicher negativer Effekt auf Stickstoff-Fixierung wie bei Bohnen"},
    {"plant": "Spargel", "reason": "Konkurrenz um Nährstoffe und Wasser"}
  ]'
),
(
  'Salat', 
  '[
    {"plant": "Karotten", "reason": "Oberflächliche Wurzeln konkurrieren nicht mit tiefen Karottenwurzeln"},
    {"plant": "Radieschen", "reason": "Beide schnellwachsend, Radieschen lockern Boden für Salat"},
    {"plant": "Gurken", "reason": "Salat beschattet Boden und hält Feuchtigkeit für Gurken"},
    {"plant": "Erdbeeren", "reason": "Salat hält Boden feucht und unkrautfrei für Erdbeeren"},
    {"plant": "Zwiebeln", "reason": "Zwiebelgeruch hält Blattläuse vom Salat fern"}
  ]', 
  '[
    {"plant": "Petersilie", "reason": "Kann Salat in der Entwicklung hemmen durch Wurzelausscheidungen"},
    {"plant": "Sellerie", "reason": "Konkurrenz um oberflächennahe Nährstoffe"},
    {"plant": "Kresse", "reason": "Wachstumshemmung durch allelopathische Wirkung"}
  ]'
),
(
  'Erdbeeren', 
  '[
    {"plant": "Knoblauch", "reason": "Schützt vor Grauschimmel und anderen Pilzkrankheiten"},
    {"plant": "Spinat", "reason": "Beschattet Boden, hält Feuchtigkeit und ist früh abgeerntet"},
    {"plant": "Borretsch", "reason": "Verbessert Geschmack und zieht Bestäuber an"},
    {"plant": "Zwiebeln", "reason": "Schützen vor Pilzkrankheiten und Schädlingen"},
    {"plant": "Thymian", "reason": "Hält Schnecken fern und verbessert Erdbeergeschmack"}
  ]', 
  '[
    {"plant": "Kohl", "reason": "Entzieht Erdbeeren wichtige Nährstoffe und hemmt Fruchtbildung"},
    {"plant": "Tomaten", "reason": "Können Verticillium-Welke übertragen"},
    {"plant": "Kartoffeln", "reason": "Können Krankheiten übertragen und konkurrieren um Nährstoffe"}
  ]'
);

-- Add comments
COMMENT ON TABLE public.sowing_calendar IS 'Comprehensive sowing calendar data for vegetables, herbs, fruits, and flowers';
COMMENT ON TABLE public.companion_plants IS 'Detailed companion planting relationships with reasons';
COMMENT ON TABLE public.plant_growing_tips IS 'Specific growing tips and common mistakes for plants';