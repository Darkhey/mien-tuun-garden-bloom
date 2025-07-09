export const translations = {
  de: {
    titleOptimizationFailed: 'Titel-Optimierung fehlgeschlagen',
    titleOptimizationPartial: 'Titel-Optimierung teilweise erfolgreich',
    titleOptimizationSuccess: '✨ Titel-Optimierung abgeschlossen!',
    titleOptimizationAllFailedDesc: 'Alle {{failed}} Versuche sind fehlgeschlagen',
    titleOptimizationPartialDesc: '{{success}} Titel optimiert, {{failed}} fehlgeschlagen',
    titleOptimizationSuccessDesc: '{{count}} Artikel-Titel wurden erfolgreich mit KI optimiert.',
    genericError: 'Unbekannter Fehler',
    batchOperationFailed: 'Batch-Operation fehlgeschlagen',
    batchOperationFailedDesc: 'Unbekannter Fehler bei der parallelen Verarbeitung',
    imageBatchSuccessTitle: '🎉 Alle Bilder erfolgreich generiert!',
    imageBatchSuccess: '{{count}} hochwertige KI-Bilder wurden mit 3 parallelen Prozessen erstellt und automatisch zugewiesen.',
    imageBatchPartialTitle: 'Batch-Verarbeitung abgeschlossen',
    imageBatchPartial: '{{success}} Bilder erstellt, {{failure}} mit Fallback-Bildern.',
    imageBatchFallbackTitle: 'Bild-Generierung mit Fallbacks',
    imageBatchFallback: '{{failure}} Artikel erhielten Fallback-Bilder da die KI-Generierung nicht verfügbar war.'
  }
};

export type TranslationKey = keyof typeof translations.de;

export function t(key: TranslationKey, params: Record<string, string | number> = {}): string {
  let str = translations.de[key] || key;
  for (const [k, v] of Object.entries(params)) {
    str = str.replace(`{{${k}}}`, String(v));
  }
  return str;
}
