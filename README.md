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
- `npm run build` – Produktionsbuild in `dist`
- `npm run lint` – Codequalität prüfen
- `npm test` – Test-Suite ausführen

## Umgebungsvariablen
Alle benötigten Variablen werden über eine `.env`-Datei bereitgestellt. Eine Vorlage findest du in [`.env.example`](./.env.example).

```
VITE_SUPABASE_URL=<Deine Supabase URL>
VITE_SUPABASE_ANON_KEY=<Dein Supabase Anon Key>
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

