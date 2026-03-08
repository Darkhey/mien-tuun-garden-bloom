

## Mobile Startseite -- Verbesserungsplan

### Probleme der aktuellen Version

1. **Kein Full-Width Hero** -- Das Hero-Bild ist auf 360px begrenzt mit viel Whitespace drumherum. Auf modernen Smartphones (390-430px) wirkt das klein und uninspirierend.
2. **Newsletter-Block zu frueh** -- Der Newsletter-Signup erscheint sofort im Hero, bevor der User ueberhaupt Vertrauen aufgebaut hat. Auf Mobile scrollt man direkt an einem Formular vorbei.
3. **Desktop-Komponenten werden 1:1 wiederverwendet** -- `WeatherForecastSection`, `SuggestedPostsSection`, `LatestPostsSection`, `LatestCommentsSection` sind fuer Desktop gestaltet (max-w-6xl, grid md:grid-cols-3, py-20). Auf Mobile gibt es zu viel Padding und die Cards sind nicht optimiert.
4. **Keine visuelle Hierarchie** -- Alle Sektionen sehen aehnlich aus (weisser Hintergrund, gleiche Schriftgroesse). Es fehlt ein visueller Rhythmus.
5. **Statische Saisontipps** -- Die 5 Tipps sind hardcoded und nicht saisonabhaengig (Erdbeeren im Winter?).
6. **Kein Swipe/Scroll-Erlebnis** -- Mobile User erwarten horizontales Scrollen fuer Karten (wie Instagram Stories oder App-Empfehlungen).
7. **Zu viele CTAs** -- Instagram-Button, Blog-Button, Newsletter -- alles gleichzeitig im oberen Bereich.

### Aenderungen

#### 1. Immersiver Hero mit Fullscreen-Bild
- Hero-Bild edge-to-edge (kein Padding), `h-[70vh]` mit Gradient-Overlay von unten
- Marianne-Portrait und Headline ueber dem Bild positioniert (absolute)
- Ein einziger primaerer CTA: "Gartentipps entdecken"

#### 2. Horizontaler Blog-Karussell
- Neue Komponente: horizontale Scroll-Leiste (`overflow-x-auto`, `snap-x`) fuer die neuesten Posts
- Kompakte Karten (Bild + Titel + Kategorie-Badge), ca. 75% Viewport-Breite pro Karte
- Ersetzt die Desktop-Grid-Darstellung von `LatestPostsSection` auf Mobile

#### 3. Wetter-Widget kompakt
- Statt der grossen Card eine kompakte Inline-Anzeige: Icon + Temperatur + kurzer Tipp in einer Zeile
- Expandierbar per Tap fuer Details (Collapsible)

#### 4. Saisontipps dynamisch nach Monat
- `SEASONAL_TIPS` Map mit Monatszuordnung (wie bereits in AussaatkalenderPage implementiert)
- Nur 3 Tipps anzeigen statt 5, als horizontale Swipe-Cards

#### 5. Newsletter nach unten verschieben
- Newsletter-Signup zwischen "Ueber mich" und Community-CTA platzieren -- nach dem Vertrauensaufbau
- Kompakteres Design mit einem einzigen Input-Feld

#### 6. Visueller Rhythmus
- Abwechselnde Hintergruende: transparent -> sage-50 -> transparent -> gradient
- Abgerundete Sections mit leichten Schatten fuer Tiefe

#### 7. Quick-Links Leiste
- Horizontale Pill-Buttons unter dem Hero: "Blog", "Rezepte", "Aussaatkalender", "Ueber mich"
- Sticky am oberen Rand beim Scrollen (optional, per IntersectionObserver)

### Betroffene Dateien

- `src/pages/MobileLandingPage.tsx` -- Kompletter Umbau
- `src/components/landing/MobilePostsCarousel.tsx` -- Neue Komponente fuer horizontales Blog-Karussell
- `src/components/landing/MobileWeatherWidget.tsx` -- Kompakte Wetter-Anzeige fuer Mobile

