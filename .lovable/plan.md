

## Admin Panel Funktionsanalyse -- Gefundene Probleme

### 1. Tote Menupunkte (keine View implementiert)

Die sidebar in `adminMenu.ts` definiert 3 Menupunkte, die im `AdminDashboard.tsx` switch-Statement **nicht existieren**:

- **"Dashboard"** (`id: 'dashboard'`) -- kein case, fällt auf default (BlogPostsView)
- **"Newsletter"** (`id: 'newsletter'`) -- kein case, fällt auf default
- **"Veranstaltungen"** (`id: 'events'`) -- kein case, fällt auf default
- **"Einstellungen"** (`id: 'settings'`) -- kein case, fällt auf default

### 2. EditBlogPostModal: `published`-Flag wird nicht synchronisiert

Wenn man den Status von "entwurf" auf "veröffentlicht" wechselt (oder umgekehrt), wird im `handleSave` nur `status` gespeichert, **aber nicht `published`**. Die DB-Tabelle hat separate `status` UND `published` Felder. Die `useBlogPostsData.handleToggleStatus` setzt beides korrekt, aber das Edit-Modal nicht.

**Fix:** Im `EditBlogPostModal.handleSave`, `published: formData.status === 'veröffentlicht'` zum updateData hinzufügen.

### 3. Hardcoded "87%" Performance-Wert

In `ContentStrategyView.tsx` Zeile 128 steht ein hartcodierter Wert `87%` fuer "Erfolgsrate der letzten 30 Tage" statt den echten Wert aus `cronJobService`.

**Fix:** Den tatsaechlichen `successRate` Wert verwenden.

### 4. AdminStatsService: `avg()` Aggregation funktioniert nicht mit Supabase JS Client

`supabase.from('blog_posts').select('avg(quality_score)').single()` -- der Supabase JS Client unterstuetzt keine SQL-Aggregationen in `.select()`. Das gibt immer `null` oder einen Fehler zurueck.

**Fix:** Alle Posts mit `quality_score` laden und clientseitig den Durchschnitt berechnen, oder eine DB-Funktion verwenden.

### 5. Fehlende View-Implementierungen

Folgende Menu-Eintraege brauchen mindestens eine Platzhalter-View:
- **Dashboard**: Uebersichtsseite mit Statistiken (Artikel heute, Quality Score, aktive Jobs)
- **Newsletter**: Zeige `newsletter_subscribers` (Anzahl, confirmed/unconfirmed)
- **Einstellungen**: Pipeline-Config bearbeiten (quality_threshold, auto_publish, batch_size)

"Veranstaltungen" kann entfernt werden, da keine DB-Tabelle existiert.

### 6. Kein Admin-Rollen-Check

`AdminDashboard` prueft nur ob ein User eingeloggt ist (`!user`), aber **nicht ob er Admin ist**. Die `user_roles` Tabelle und `has_role()` Funktion existieren bereits. Ohne diesen Check kann jeder eingeloggte User das Admin-Panel oeffnen (auch wenn DB-Operationen durch RLS blockiert werden, sieht der User trotzdem die UI).

### Implementierungsplan

1. **EditBlogPostModal fix**: `published`-Flag beim Speichern synchronisieren
2. **ContentStrategyView fix**: Hardcoded 87% durch echten Wert ersetzen
3. **AdminStatsService fix**: `getAverageBlogQualityScore` clientseitig berechnen
4. **Dashboard-View erstellen**: Statistik-Uebersicht (Posts, Quality, Jobs, Newsletter)
5. **Newsletter-View erstellen**: subscriber-Liste aus `newsletter_subscribers`
6. **Settings-View erstellen**: `pipeline_config` bearbeiten (quality_threshold, auto_publish)
7. **Veranstaltungen aus Menu entfernen** (keine Tabelle vorhanden)
8. **Admin-Rollen-Check**: `useIsAdmin` Hook im AdminDashboard einbauen

