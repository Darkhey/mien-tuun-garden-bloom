
# Blog-Kategorien Dokumentation

## Übersicht
Diese Dokumentation beschreibt die erweiterten Blog-Kategorien im Mien Tuun System und deren Implementierung.

## Kategorien-Liste

### Garten & Planung
- **gartenplanung** - Gartenplanung: Allgemeine Planung, Design, Beetaufteilung
- **aussaat-pflanzung** - Aussaat & Pflanzung: Saatgut, Jungpflanzen, Vermehrung
- **jahreszeitliche-arbeiten** - Jahreszeitliche Arbeiten: Saisonale Gartenarbeiten

### Pflanzenpflege
- **pflanzenpflege** - Pflanzenpflege: Allgemeine Pflege, Düngen, Gießen, Schneiden
- **schaedlingsbekaempfung** - Schädlingsbekämpfung: Natürliche Bekämpfung, Nützlinge
- **bodenpflege** - Bodenpflege: Bodenverbesserung, Humusaufbau, Kompostierung
- **kompostierung** - Kompostierung: Spezifisch für Kompost-Themen

### Ernte & Küche
- **ernte** - Ernte: Erntetechniken, optimaler Zeitpunkt
- **saisonale-kueche** - Saisonale Küche: Saisonales Kochen, Ernteküche
- **konservieren-haltbarmachen** - Konservieren & Haltbarmachen: Methoden der Haltbarmachung
- **lagerung-vorratshaltung** - Lagerung & Vorratshaltung: Richtige Lagerung von Ernte
- **kraeuter-heilpflanzen** - Kräuter & Heilpflanzen: Kräutergarten, Heilpflanzen

### Nachhaltigkeit & Umwelt
- **nachhaltigkeit** - Nachhaltigkeit: Allgemeine Nachhaltigkeitsthemen
- **wassersparen-bewaesserung** - Wassersparen & Bewässerung: Effiziente Wassernutzung
- **permakultur** - Permakultur: Permakultur-Prinzipien und -Methoden

### Spezielle Gartenbereiche
- **urban-gardening** - Urban Gardening: Gärtnern in der Stadt
- **balkon-terrasse** - Balkon & Terrasse: Topfgarten, mobile Gärten
- **indoor-gardening** - Indoor Gardening: Zimmerpflanzen, Hydroponik

### Selbermachen & Ausrüstung
- **diY-projekte** - DIY Projekte: Selbstbau, Upcycling für den Garten
- **gartengeraete-werkzeuge** - Gartengeräte & Werkzeuge: Auswahl und Pflege von Werkzeugen

### Philosophie & Lifestyle
- **selbstversorgung** - Selbstversorgung: Autarkie, Eigenanbau

### Allgemein
- **tipps-tricks** - Tipps & Tricks: Praktische Gartentipps
- **sonstiges** - Sonstiges: Nicht anderweitig kategorisierbare Inhalte

## Technische Implementierung

### Betroffene Dateien
1. `src/components/admin/blogHelpers.ts` - Hauptkonfiguration der Kategorien
2. `src/components/admin/BlogMetaForm.tsx` - UI-Komponente für Kategorieauswahl
3. `src/components/admin/BlogMetaSection.tsx` - Erweiterte Meta-Sektion
4. `src/pages/BlogOverview.tsx` - Frontend-Kategorien für Benutzer
5. `supabase/functions/auto-blog-post/constants.ts` - Backend-Kategorien für KI
6. `src/services/ContentGenerationService.ts` - KI-Kontext-Mappings

### Kategorie-Trend-Tags
Jede Kategorie hat spezifische Trend-Tags, die automatisch vorgeschlagen werden:
- Gartenplanung: ["Permakultur", "No-Dig", "Biogarten", "Hochbeet", "Mischkultur"]
- Nachhaltigkeit: ["Plastikfrei", "Regenerativ", "Naturgarten", "Kreislaufwirtschaft"]
- etc.

### KI-Kontext-Verbesserungen
Der `ContentGenerationService` wurde erweitert um:
- Kategorie-spezifische Kontext-Mappings
- Verbesserte Prompt-Generierung
- Zielgruppen-spezifische Ansprache

## Datenbank-Kompatibilität
Die neuen Kategorien sind vollständig kompatibel mit der bestehenden `blog_posts` Tabelle:
- `category` Feld: text (unterstützt alle neuen Werte)
- Keine Datenbankänderungen erforderlich
- Bestehende Artikel bleiben unverändert

## Content-Pipeline Optimierungen
- Verbesserte Dropdown-Menüs mit logischer Gruppierung
- Erweiterte Tag-Vorschläge basierend auf Kategorien
- Optimierte KI-Prompts für bessere Content-Qualität

## Migration bestehender Inhalte
Bestehende Blog-Posts mit alten Kategorien funktionieren weiterhin:
- Alte Kategorien werden weiterhin angezeigt
- Neue Artikel sollten die erweiterten Kategorien verwenden
- Empfehlung: Schrittweise Migration alter Artikel zu neuen Kategorien
