

## Analyse: Cronjobs und taegliche Content-Produktion

### Aktuelle Situation

**Kritisch: Keine Cronjobs existieren.** Die `cron_jobs`-Tabelle ist komplett leer. Es gibt kein `pg_cron`-Setup, das die Edge Functions automatisch aufruft. Obwohl die Infrastruktur (Tabellen, Edge Functions, CronJobService) vorhanden ist, laeuft **nichts automatisch**.

Weitere Probleme:
- **`content-automation-executor`**: Generiert nur Lorem-Ipsum-Platzhalter statt echte KI-Artikel
- **`fetch-current-trends`** existiert, wird aber nicht in die Blog-Generierung integriert
- **`auto-blog-post`** funktioniert technisch, wird aber nie automatisch getriggert
- **`constants.ts`** hat doppelte `corsHeaders`-Exporte (Build-Fehler)

### Implementierungsplan

#### 1. Neue Edge Function: `daily-content-pipeline`

Eine zentrale Pipeline-Funktion, die taeglich:
1. Aktuelle Trends per `fetch-current-trends` abruft (oder intern Trends generiert)
2. Basierend auf Trends + Saison + Kategorie-Rotation ein Thema waehlt
3. Duplikat- und Blacklist-Pruefung durchfuehrt
4. Einen vollstaendigen Marianne-Stil Blogartikel generiert (OpenAI mit Gemini-Fallback)
5. KI-Bild generiert und hochlaedt
6. SEO-Metadaten (Title, Description, Keywords, Structured Data) erstellt
7. Quality-Score berechnet und gegen `pipeline_config.quality_threshold` prueft
8. Artikel in DB speichert (auto-publish basierend auf Config)
9. Ergebnis in `content_automation_logs` protokolliert

Diese Funktion kombiniert die Logik aus `auto-blog-post` und `create-strategy-article` mit Trend-Integration.

#### 2. `content-automation-executor` reparieren

Den Platzhalter-Code ersetzen: Statt Lorem Ipsum wird die `auto-blog-post`-Funktion aufgerufen, um echten KI-Content zu erzeugen.

#### 3. `constants.ts` Fix

Doppelten `corsHeaders`-Export entfernen (importiert und deklariert gleichzeitig).

#### 4. pg_cron einrichten

SQL ausfuehren, um taeglich um 7:00 Uhr die `daily-content-pipeline` zu triggern:

```text
Zeitplan:
- 07:00 Uhr: Tagesartikel generieren (daily-content-pipeline)
- 14:00 Uhr: Zweiter Artikel (optional, anderes Thema/Kategorie)
```

#### 5. Cron-Jobs in DB seeden

Vorkonfigurierte Jobs in die `cron_jobs`-Tabelle einfuegen, damit sie im Admin-Panel sichtbar und verwaltbar sind:
- "Taeglicher Blogartikel" (auto-blog-post, `0 7 * * *`)
- "Trend-basierter Artikel" (daily-content-pipeline, `0 14 * * *`)
- "Trend-Analyse" (fetch-current-trends, `0 6 * * *`)

#### 6. Config-Updates

- `supabase/config.toml`: Neue Functions registrieren mit `verify_jwt = false`
- Pipeline-Config Defaults sicherstellen (quality_threshold, auto_publish)

### Technische Details

- **KI-Provider**: OpenAI (gpt-4o-mini fuer Text, gpt-image-1 fuer Bilder) mit Gemini-Fallback -- bestehende API-Keys werden weiterverwendet
- **Trend-Integration**: `fetch-current-trends` liefert aktuelle Keywords, die als Kontext in den Artikel-Prompt einfliessen
- **SEO**: Automatische Title-Tags, Meta-Descriptions, Keywords, Schema.org StructuredData (Article-Schema)
- **Quality Gate**: Artikel unter dem konfigurierten Threshold werden als "Entwurf" gespeichert statt veroeffentlicht
- **Kategorie-Rotation**: Verhindert, dass immer die gleiche Kategorie gewaehlt wird (prueft letzte 7 Artikel)

