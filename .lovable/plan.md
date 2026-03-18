

## Aussaatkalender -- Verbesserungsplan

Nach Analyse aller Kalender-Komponenten (`AussaatkalenderPage`, `ModularSowingCalendar`, `SowingCalendarTable`, `SowingCalendarFilters`, `CompanionPlantFinder`, `PlantGrowingTipsCard`, `GardenBedManager`) hier die wichtigsten Schwachstellen und Verbesserungen:

---

### 1. Mobile-Ansicht: Kalender-Tabelle ist unbrauchbar
**Problem**: Die 15-spaltige Tabelle (Pflanze + Art + Level + 12 Monate) ist auf dem aktuellen 393px Viewport praktisch nicht nutzbar -- horizontales Scrollen mit winzigen Dots.
**Loesung**: Mobile Card-View statt Tabelle. Jede Pflanze als kompakte Karte mit farbigen Monatsbalken. Automatischer Switch unter `md` Breakpoint.
- Neue Komponente `SowingCalendarMobileCards.tsx`
- Responsive Switch in `SowingCalendarTable.tsx`

### 2. Tab-Navigation auf Mobile kaputt
**Problem**: 4 Tabs ("Aussaatkalender", "Beetnachbarn-Finder", "Aussaat-Tipps", "Trefle API") passen nicht auf 393px -- Text wird abgeschnitten oder laeuft ueber.
**Loesung**: Tabs auf Mobile als Icon-Only mit Tooltip, oder als horizontale Scroll-Leiste. "Trefle API" ist fuer normale User irrelevant -- nur fuer Admins anzeigen.
- Aenderung in `ModularSowingCalendar.tsx`

### 3. Aktuellen Monat automatisch hervorheben & vorfiltern
**Problem**: User muessen selbst den richtigen Monat waehlen. Die "Was steht im Fruehling an?"-Sektion ist statisch und nicht mit dem Kalender verknuepft.
**Loesung**: Kalender startet automatisch mit dem aktuellen Monat vorselektiert. Ein "Jetzt saeen"-Quick-Button zeigt sofort nur Pflanzen, die JETZT relevant sind.
- "Jetzt aussaeen"-Button in `SowingCalendarFilters.tsx`
- Default-Filter auf aktuellen Monat

### 4. Pflanzen-Detailseite / Modal
**Problem**: Klick auf Pflanze wechselt nur zum "Tipps"-Tab -- kein komplettes Pflanzenprofil mit Bild, Beschreibung, Companion Plants, Kalender-Timeline in einer Ansicht.
**Loesung**: Ein Modal/Sheet das alle Infos zu einer Pflanze zusammenfasst: Bild, Beschreibung, Anbau-Timeline als visueller Balken, Beetnachbarn, Tipps -- alles auf einen Blick.
- Neue Komponente `PlantDetailModal.tsx`
- Oeffnet sich bei Klick auf Pflanzennamen

### 5. Kalender als visuelle Timeline statt nur Dots
**Problem**: Die farbigen Dots sind schwer lesbar -- man muss jede Zelle einzeln lesen. Keine visuelle Verbindung zwischen zusammenhaengenden Monaten.
**Loesung**: Farbige Balken statt einzelner Dots. Zusammenhaengende Monate (z.B. Aussaat Maerz-Mai) werden als durchgehender Balken dargestellt. Viel lesbarer auf einen Blick.
- Ueberarbeitung von `SowingCalendarTable.tsx` Rendering-Logik

### 6. Persoenlicher Gartenplaner
**Problem**: `GardenBedManager` existiert, ist aber nicht mit dem Aussaatkalender verknuepft. User koennen keine Pflanzen aus dem Kalender zu ihrem Beet hinzufuegen.
**Loesung**: "Zu meinem Garten hinzufuegen"-Button im Kalender und im Pflanzen-Detail. Persoenlicher Kalender zeigt nur die eigenen Pflanzen mit Erinnerungen.
- Button in `SowingCalendarTable.tsx` und `PlantDetailModal.tsx`
- Verknuepfung mit `GardenBedService`

### 7. Druckansicht / PDF-Export
**Problem**: Gaertner wollen den Kalender ausdrucken und in den Garten mitnehmen.
**Loesung**: Print-optimiertes CSS + optionaler PDF-Download-Button. Zeigt nur die gefilterten Pflanzen in einer druckfreundlichen Tabelle.
- Print-Stylesheet in `SowingCalendarTable.tsx`
- Button in `SowingCalendarFilters.tsx`

---

### Priorisierung

| # | Massnahme | Impact | Aufwand |
|---|-----------|--------|---------|
| 1 | Mobile Card-View | Sehr hoch | Mittel |
| 2 | Mobile Tabs fixen | Hoch | Niedrig |
| 3 | "Jetzt saeen"-Filter | Hoch | Niedrig |
| 4 | Pflanzen-Detail-Modal | Hoch | Mittel |
| 5 | Balken statt Dots | Hoch | Mittel |
| 6 | Gartenplaner-Verknuepfung | Mittel | Mittel |
| 7 | Druckansicht | Mittel | Niedrig |

### Betroffene Dateien

**Neu:**
- `src/components/sowing/SowingCalendarMobileCards.tsx` -- Mobile Kartenansicht
- `src/components/sowing/PlantDetailModal.tsx` -- Pflanzen-Detailansicht

**Geaendert:**
- `src/components/sowing/SowingCalendarTable.tsx` -- Balken-Rendering, responsive Switch, Print-CSS
- `src/components/sowing/ModularSowingCalendar.tsx` -- Mobile Tabs, "Jetzt saeen"-Integration
- `src/components/sowing/SowingCalendarFilters.tsx` -- "Jetzt saeen"-Button, Druck-Button

