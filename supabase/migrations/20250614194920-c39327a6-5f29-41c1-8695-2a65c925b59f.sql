
INSERT INTO public.recipes (
  slug,
  title,
  description,
  image_url,
  ingredients,
  instructions,
  user_id
) VALUES (
  'holunderbluetensirup-selber-machen',
  'Holunderblütensirup selber machen',
  'Ein Klassiker für den Frühling und Sommer: Selbstgemachter Holunderblütensirup. Einfach, lecker und eine tolle Basis für Limonaden und Cocktails.',
  'https://images.unsplash.com/photo-1621651033549-7022d0a0b255?q=80&w=1200&auto=format&fit=crop',
  '[
    {"name": "Holunderblütendolden", "unit": "Stück", "amount": 25, "notes": "frisch gepflückt"},
    {"name": "Wasser", "unit": "l", "amount": 2},
    {"name": "Zucker", "unit": "kg", "amount": 2},
    {"name": "Zitronen", "unit": "Stück", "amount": 2, "notes": "unbehandelt"},
    {"name": "Zitronensäure", "unit": "g", "amount": 50}
  ]',
  '[
    {"step": 1, "text": "Die Holunderblütendolden vorsichtig ausschütteln, um Insekten zu entfernen. Nicht waschen, da sonst der Blütenstaub (und damit das Aroma) verloren geht."},
    {"step": 2, "text": "Die Zitronen heiß abwaschen und in Scheiben schneiden."},
    {"step": 3, "text": "Wasser und Zucker in einem großen Topf unter Rühren aufkochen, bis der Zucker sich vollständig aufgelöst hat. Den Topf vom Herd nehmen und etwas abkühlen lassen."},
    {"step": 4, "text": "Die Holunderblütendolden, Zitronenscheiben und Zitronensäure in das Zuckerwasser geben und gut umrühren."},
    {"step": 5, "text": "Den Sirupansatz zugedeckt an einem kühlen, dunklen Ort für 3-5 Tage ziehen lassen. Täglich einmal umrühren."},
    {"step": 6, "text": "Nach der Ziehzeit den Sirup durch ein feines Sieb oder ein sauberes Tuch abseihen, um Blüten und Zitronen zu entfernen."},
    {"step": 7, "text": "Den fertigen Sirup nochmals kurz aufkochen und sofort heiß in saubere, sterilisierte Flaschen abfüllen. Gut verschließen. So hält er sich mehrere Monate."},
    {"step": 8, "text": "Für eine erfrischende Holunderlimonade einfach einen Schuss Sirup mit Mineralwasser aufgießen."}
  ]',
  NULL
);
