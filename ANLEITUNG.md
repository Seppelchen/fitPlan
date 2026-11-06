# FitPlan aufs iPhone bringen (offline nutzbar)

Der Ordner `fitplan` ist fertig. Du musst nichts mehr daran ändern.

```
fitplan/
├── index.html      deine App
├── manifest.json   App-Name, Farben, Icons
├── sw.js           macht die App offline-fähig
├── _headers        Netlify-Einstellung für Updates
├── icon.svg        Icon
├── icon-180.png    iPhone-Icon
├── icon-192.png    Android-Icon
├── icon-512.png    Android-Icon (groß)
├── zxing.min.js    Barcode-Scanner (läuft offline)
└── zxing-LICENSE.txt  Lizenz des Barcode-Scanners
```

## Die App ist online

**https://seppelchen.github.io/fitPlan/**

Sie wird über GitHub Pages aus dem Repo `Seppelchen/fitPlan` veröffentlicht. Jede
Änderung, die nach GitHub hochgeladen wird (`git push`), ist nach etwa einer Minute online.
Weiter mit Schritt 3.

## (Alternative) Bei Netlify hochladen (am PC)

1. Öffne **https://app.netlify.com/signup** und lege ein kostenloses Konto an
   (z. B. mit E-Mail). Ohne Konto wird die Seite nach kurzer Zeit wieder gelöscht.
2. Öffne danach **https://app.netlify.com/drop**.
3. Ziehe den **ganzen Ordner `fitplan`** mit der Maus in das Feld
   („Drag and drop your site output folder here“).
4. Nach ein paar Sekunden bekommst du einen Link wie
   `https://zufaelliger-name-123.netlify.app`.
5. Empfohlen: **Site configuration → Change site name** → z. B. `fitplan-laura`.
   Dann lautet der Link `https://fitplan-laura.netlify.app`.
6. Öffne den Link einmal am PC und prüfe, ob die App erscheint.

## Schritt 3: Auf dem iPhone installieren

1. Öffne den Link in **Safari** (nicht in Chrome, nicht aus WhatsApp heraus).
2. Warte, bis die App geladen ist, und tippe einmal durch alle fünf Tabs unten
   (Essen, Plan, Sport, Fortschritt, Mehr).
3. Tippe auf das **Teilen-Symbol** (Quadrat mit Pfeil nach oben).
4. Scrolle nach unten und tippe auf **„Zum Home-Bildschirm“**.
5. Falls angezeigt: **„Als Web-App öffnen“** eingeschaltet lassen.
6. Tippe oben rechts auf **„Hinzufügen“**.

FitPlan liegt jetzt mit dem blauen Herz-Icon auf deinem Home-Bildschirm.

**Offline testen:** FitPlan einmal über das Icon öffnen und wieder schließen →
Flugmodus an → FitPlan erneut über das Icon öffnen. Die App startet trotzdem.

## Android (falls gewünscht)

1. Link in **Chrome** öffnen.
2. Oben rechts auf **⋮** → **„App installieren“** bzw. **„Zum Startbildschirm hinzufügen“**.

## Wichtig

- **Öffne FitPlan immer über das Icon auf dem Home-Bildschirm**, nicht über Safari.
  Dort bleiben deine Daten dauerhaft gespeichert. Die Daten in Safari und in der
  Home-Bildschirm-App sind getrennt.
- Deine Daten liegen **nur auf deinem iPhone**, nicht bei Netlify. Wenn du das Icon
  löschst, sind die Daten weg. Nutze deshalb regelmäßig **Mehr → Exportieren**.
- Hast du schon Daten in einer alten Version? Dort **Exportieren**, in der neuen App
  **Importieren**.

## Nährwerte

- Bei jedem Eintrag, jeder Mahlzeit und jedem Rezept stehen Kalorien, **E**iweiß,
  **K**ohlen**h**ydrate und **F**ett, z. B. „405 kcal · E 25 · KH 44 · F 12 g“.
- Oben im Tab **Essen** siehst du die Tagessumme mit Ballaststoffen und einen Balken, wie
  sich die Kalorien auf Eiweiß, Kohlenhydrate und Fett verteilen.
- Die mitgelieferten Rezepte haben Werte, die aus den Zutaten berechnet sind. Gescannte Produkte
  bekommen sie von Open Food Facts. Bei eigenen Rezepten und freien Einträgen sind sie optional.
- Ältere Einträge ohne Werte: antippen → „Kohlenhydrate, Fett, Ballaststoffe ergänzen“.
- Unter **Mehr → Ziele** kannst du Ziele für Kohlenhydrate, Fett und Ballaststoffe setzen
  (leer lassen = kein Ziel).

## Barcode-Scanner

- **Essen → Schnell eintragen → 📷 Barcode scannen.** Beim ersten Mal fragt das iPhone nach
  der Kamera – „Erlauben“ tippen. Falls versehentlich abgelehnt: Einstellungen → Safari → Kamera.
- Die Nährwerte kommen von **Open Food Facts** (freie Datenbank). Gesendet wird nur die
  Barcode-Nummer. Unbekannte Produkte kannst du selbst eintragen.
- Einmal gescannte Produkte merkt sich FitPlan – sie funktionieren danach auch ohne Internet.
- Klappt die Kamera nicht, die Nummer unter dem Barcode einfach eintippen.

## Einkaufsliste aus FamilyWall übernehmen

- **Android:** In FamilyWall die Einkaufsliste öffnen → **Teilen** → **FitPlan** wählen.
  FitPlan öffnet sich mit der erkannten Liste, dann **Übernehmen** tippen.
  (FitPlan erscheint im Teilen-Menü erst, nachdem Chrome die installierte App aktualisiert
  hat. Das kann bis zu einem Tag dauern. Sofort geht es, wenn du FitPlan neu installierst.
  Vorher unbedingt **Mehr → Exportieren**, sonst sind die Daten weg.)
- **iPhone (und Android ohne Teilen):** In FamilyWall Teilen → **Kopieren**, dann in FitPlan
  **Plan → Einkaufsliste → Aus FamilyWall einfügen** → **Aus Zwischenablage einfügen** → **Übernehmen**.
- Die Kategorien aus FamilyWall bleiben erhalten. Ein neuer Import ersetzt die vorherige
  FamilyWall-Liste.

## App später ändern

1. Datei im Ordner `fitplan` ändern.
2. Änderung committen und mit `git push` zu GitHub hochladen. Nach etwa einer Minute ist sie online.
   Die Cache-Version in `sw.js` wird dabei automatisch neu gesetzt – nichts hochzählen nötig.
   (Nur bei Netlify per Drag-and-drop: in `sw.js` die Zeile `const VERSION = …` von Hand ändern.)
3. Auf dem iPhone FitPlan mit Internet öffnen, ganz schließen und noch einmal öffnen.
   Dann ist die neue Version da. Deine Daten bleiben erhalten.
