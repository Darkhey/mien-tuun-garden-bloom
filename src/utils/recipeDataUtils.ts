
// Hilfsfunktion: Parsing und Normalisierung von Arrays (Zutaten, Schritte etc.)
export function parseRecipeArray(val: any): any[] {
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    try {
      const arr = JSON.parse(val);
      if (Array.isArray(arr)) return arr;
    } catch (e) { }
  }
  return [];
}

// Normalisiert ein RecipeStep-Objekt (auch Fallback für reine Strings)
export function normalizeStep(step: any, idx: number): {
  id?: string;
  step: number;
  text: string;
  description?: string;
  image?: string;
  time?: number;
} {
  if (typeof step === "string") {
    return { step: idx + 1, text: step };
  }
  // Wenn image fehlt, prüfe auf evtl. image_url oder ähnliches
  let image = step.image || step.image_url || "";
  return {
    id: step.id || undefined,
    step: step.step || idx + 1,
    text: step.text || step.description || "",
    description: step.description,
    image: image && typeof image === "string" ? image : undefined,
    time: step.time ? Number(step.time) : undefined,
  };
}

// Zutaten normalisieren (Strings und Objekte unterstützen)
export function normalizeIngredient(ing: any): any {
  if (typeof ing === "string") {
    return { name: ing };
  }
  return {
    ...ing,
    name: ing.name || "",
    amount:
      typeof ing.amount === "string"
        ? parseFloat(ing.amount.replace(",", "."))
        : ing.amount,
    unit: ing.unit || "",
    notes: ing.notes || "",
    group: ing.group || "",
    optional: !!ing.optional,
  };
}

// Tipps/Tricks als String-Array normalisieren
export function normalizeTips(val: any): string[] {
  if (Array.isArray(val)) {
    return val.map((tip) =>
      typeof tip === "string" ? tip : (tip.text || JSON.stringify(tip))
    );
  } else if (typeof val === "string") {
    try {
      const arr = JSON.parse(val);
      return Array.isArray(arr)
        ? arr.map((tip) =>
            typeof tip === "string" ? tip : (tip.text || JSON.stringify(tip))
          )
        : [];
    } catch {
      return [val];
    }
  }
  return [];
}
