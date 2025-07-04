# Mien Tuun Garden

Mien Tuun ist eine React/Tailwind Anwendung rund um Garten, Küche und nachhaltiges Leben. Dieses Repository enthält den Quellcode der Webanwendung sowie alle notwendigen Konfigurationsdateien.

## Inhalt
- [Voraussetzungen](#voraussetzungen)
- [Lokale Entwicklung](#lokale-entwicklung)
- [Skripte](#skripte)
- [Umgebungsvariablen](#umgebungsvariablen)
- [Tests](#tests)
- [Beitrag leisten](#beitrag-leisten)
- [Roadmap](#roadmap)
- [Iterative Optimierung & Wartung](#iterative-optimierung--wartung)

## Voraussetzungen
- Node.js >= 18
- npm

```sh
# Abhängigkeiten installieren
npm ci
```

## Lokale Entwicklung
Starte einen Entwicklungsserver mit automatischem Reloading.

```sh
npm run dev
```

## Skripte
- `npm run dev` – lokaler Entwicklungsserver
- `npm run build` – Produktionsbuild in `dist` (erstellt automatisch eine `sitemap.xml`)
- `npm run sitemap` – generiert `public/sitemap.xml`
- `npm run lint` – Codequalität prüfen
- `npm test` – Test-Suite ausführen

## Umgebungsvariablen
Alle benötigten Variablen werden über eine `.env`-Datei bereitgestellt. Eine Vorlage findest du in [`.env.example`](./.env.example).

```
VITE_SUPABASE_URL=<Deine Supabase URL>
UNSPLASH_ACCESS=<Dein Unsplash Access Key>
VITE_SUPABASE_ANON_KEY=<Dein Supabase Anon Key>
VITE_WEATHER_API_URL=https://api.open-meteo.com/v1/forecast
VITE_WEATHER_LATITUDE=53.5
VITE_WEATHER_LONGITUDE=7.1
VITE_WEATHER_TIMEZONE=Europe/Berlin
```

## Tests
Die Tests werden mit [Vitest](https://vitest.dev/) ausgeführt.

```sh
npx vitest run
```

## Beitrag leisten
1. Forke das Repository und erstelle einen Branch.
2. Stelle sicher, dass `npm run lint` und `npx vitest run` ohne Fehler durchlaufen.
3. Sende einen Pull Request.

## Roadmap
Siehe [docs/ROADMAP.md](docs/ROADMAP.md) für geplante Features und Meilensteine.

## Iterative Optimierung & Wartung
Details zur kontinuierlichen Verbesserung des Systems findest du in [docs/ITERATIVE_OPTIMIZATION_GUIDE.md](docs/ITERATIVE_OPTIMIZATION_GUIDE.md).

