

## Naechste Verbesserungsrunde -- Engagement, Performance & Monetarisierung

Basierend auf dem aktuellen Stand gibt es noch einige wirkungsvolle Massnahmen:

---

### 1. Infinite Scroll / "Mehr laden" auf Blog-Uebersicht
**Problem**: Alle Posts werden auf einmal geladen -- bei 50+ Artikeln langsam und ueberfordernd.
**Loesung**: Pagination mit "Mehr Artikel laden"-Button (12 Posts pro Seite). Reduziert initiale Ladezeit und haelt User am Scrollen.
- Aenderung in `BlogOverview.tsx`: Supabase `.range()` Query + Button

### 2. Geschaetzte Lesezeit im Blog-Header verbessern + Fortschritts-Anzeige pro Abschnitt
**Problem**: Die Lesezeit steht zwar oben, aber waehrend des Lesens gibt es keinen Kontext ("Noch 3 Min").
**Loesung**: Unter dem ReadingProgressBar eine kleine "Noch X Min"-Anzeige einblenden, die sich beim Scrollen aktualisiert.
- Erweiterung von `ReadingProgressBar.tsx`

### 3. Social Share Buttons prominenter + Pinterest-optimierte Bilder
**Problem**: Share-Buttons sind erst ganz unten -- die meisten User teilen aber waehrend des Lesens.
**Loesung**: Floating Share-Buttons am linken Rand (Desktop) bzw. sticky am unteren Rand (Mobile). Zusaetzlich Pinterest-Meta-Tags fuer bessere Pins.
- Neue Komponente `FloatingShareBar.tsx`
- Einbau in `BlogPost.tsx`

### 4. "Inhaltsverzeichnis" Drawer fuer Mobile
**Problem**: `BlogPostNavigationSidebar` existiert, aber auf Mobile ist die Sidebar nicht sichtbar/nutzbar.
**Loesung**: Ein Floating-Button unten links auf Mobile, der ein Sheet/Drawer mit dem Inhaltsverzeichnis oeffnet. Nutzt bereits vorhandene Heading-Extraktion.
- Erweiterung von `BlogPost.tsx` mit mobilem Sheet-Trigger

### 5. Lazy Loading fuer Blog-Bilder + Blur-Placeholder
**Problem**: Blog-Post-Bilder in `BlogPostContent.tsx` laden ohne Platzhalter -- Layout-Shift und langsam.
**Loesung**: `loading="lazy"` und ein CSS Blur-Placeholder fuer alle Markdown-Bilder. Verbessert Core Web Vitals (LCP/CLS).
- Erweiterung von `BlogPostContent.tsx` img-Komponente

### 6. Kategorie-Seiten mit eigenem SEO
**Problem**: `/blog?category=Gartenplanung` ist kein eigener URL-Pfad -- Google indexiert das schlecht.
**Loesung**: Dedizierte Route `/blog/kategorie/:category` mit eigenem Helmet-Title und Structured Data. Mehr indexierbare Seiten = mehr organischer Traffic.
- Neue Route in `App.tsx`
- Wiederverwendung von `BlogOverview.tsx` mit vorgefilterter Kategorie

### 7. Affiliate-Produkt-Widgets in Blog-Artikeln
**Problem**: Monetarisierung ist vorbereitet aber nicht in Blog-Content eingebaut.
**Loesung**: Ein `AffiliateProductCard`-Komponente (Bild + Name + Preis + "Bei Amazon kaufen"-Button) die in `BlogPostContent.tsx` per Custom-Markdown-Syntax oder automatisch nach bestimmten Keywords eingefuegt wird.
- Neue Komponente `AffiliateProductCard.tsx`
- Integration in `BlogPostContent.tsx`

### 8. 404-Seite mit Empfehlungen
**Problem**: Die NotFound-Seite ist ein Dead End -- User springen sofort ab.
**Loesung**: Auf der 404-Seite beliebte Artikel und eine Suchleiste anzeigen. Haelt abgeirrte User auf der Seite.
- Erweiterung von `NotFound.tsx`

---

### Priorisierung

| # | Massnahme | Impact | Aufwand |
|---|-----------|--------|---------|
| 1 | Pagination Blog | Hoch | Niedrig |
| 2 | "Noch X Min" Anzeige | Mittel | Niedrig |
| 3 | Floating Share Buttons | Hoch | Mittel |
| 4 | Mobile Inhaltsverzeichnis | Hoch | Niedrig |
| 5 | Lazy Loading Bilder | Hoch | Niedrig |
| 6 | Kategorie-Seiten SEO | Hoch | Mittel |
| 7 | Affiliate-Widgets | Mittel | Mittel |
| 8 | 404 mit Empfehlungen | Mittel | Niedrig |

### Betroffene Dateien

- `src/pages/BlogOverview.tsx` -- Pagination
- `src/components/ReadingProgressBar.tsx` -- "Noch X Min"
- `src/components/blog/FloatingShareBar.tsx` -- Neu
- `src/pages/BlogPost.tsx` -- Floating Share, Mobile TOC
- `src/components/blog/BlogPostContent.tsx` -- Lazy Loading
- `src/components/blog/AffiliateProductCard.tsx` -- Neu
- `src/pages/NotFound.tsx` -- Empfehlungen
- `src/App.tsx` -- Kategorie-Route

