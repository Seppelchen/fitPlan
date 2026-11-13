# FitPlan aufs iPhone bringen (offline nutzbar)

Der Ordner `fitplan` ist fertig. Du musst nichts mehr daran ändern.

```
fitplan/
├── index.html      Aufbau der Seite (welche Karten und Knöpfe es gibt)
├── css/app.css     Aussehen (Farben, Abstände, hell/dunkel)
├── js/             Programm, aufgeteilt nach Bereichen:
│   ├── design.js              Hell/Dunkel (wird zuerst geladen)
│   ├── daten-rezepte.js       mitgelieferte Rezepte
│   ├── daten-sport.js         Sportarten und Übungen
│   ├── daten-lebensmittel.js  Grundnahrungsmittel für die Suche
│   ├── kern.js                Grundlagen (Speichern, Tabs, Fenster)
│   ├── essen.js               Tab Essen, Rezepte, Wasser
│   ├── scanner-suche.js       Barcode-Scanner und Lebensmittelsuche
│   ├── sport.js               Tab Sport
│   ├── plan.js                Tab Plan und Einkaufsliste
│   ├── sync.js                Teilen mit anderen Handys (Firebase)
│   ├── einkaufsmodus.js       Einkaufsmodus im Vollbild
│   ├── familie.js             Tab Familie: Kalender, Geburtstage, Rezepte
│   ├── sync-ich.js            Eigene Geräte abgleichen (gleicher Name), Essen der Familie zur Auswahl
│   ├── familie-import.js      Kalender aus FamilyWall übernehmen
│   ├── kalender.js            Kalenderansichten (Liste, Tag, 3 Tage, Woche, Monat)
│   ├── fortschritt.js         Tab Fortschritt
│   ├── mehr.js                Tab Mehr (Ziele, Sicherung)
│   └── start.js               startet die App
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
2. Warte, bis die App geladen ist, und tippe einmal durch alle sechs Tabs unten
   (Essen, Plan, Familie, Sport, Fortschritt, Mehr).
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
- Deine Daten liegen **nur auf deinem iPhone**, nicht bei Netlify. Einzige Ausnahme ist, was du mit
  der Familie teilst (Einkaufsliste, Kalender, Geburtstage, Rezepte), wenn du das einrichtest (siehe unten). Wenn du das Icon
  löschst, sind die Daten weg. Nutze deshalb regelmäßig **Mehr → Exportieren**.
- Hast du schon Daten in einer alten Version? Dort **Exportieren**, in der neuen App
  **Importieren**.

- FitPlan merkt sich, welcher Tab (Essen, Plan, Familie, Sport, Fortschritt, Mehr) zuletzt offen war, und
  öffnet beim nächsten Start wieder dort.

## Design: hell oder dunkel

- Standard ist **System**: FitPlan ist hell oder dunkel, je nachdem wie das Handy eingestellt ist (auch
  wenn es abends automatisch umschaltet).
- Unter **Mehr → Design** lässt sich das fest auf **☀️ Hell** oder **🌙 Dunkel** stellen. Die Wahl gilt
  sofort und bleibt gespeichert. **📱 System** stellt es zurück.

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

## Grafische Übersicht

- **Essen:** Ein Ring zeigt die Kalorien des Tages, aufgeteilt nach Frühstück, Mittag, Abend
  und Snack. Daneben steht, wie viel noch übrig ist. Jedes Essen und jedes Rezept hat ein
  passendes Bild, bei eigenen Rezepten im Formular unter **Bild** wählbar.
- **Fortschritt → Wochenrückblick:** Das Balkendiagramm lässt sich umschalten auf
  **Kalorien**, **Mahlzeiten** oder **Nährstoffe**. Einen Tag antippen zeigt die genauen Werte.

## Freier Eintrag mit Vorschlägen

- Ab 2 Buchstaben schlägt FitPlan unter dem Namensfeld passende Lebensmittel vor: schon Gegessenes (auch
  von der Familie), deine gescannten Produkte, Produkte der Familie und die Grundnahrungsmittel (offline).
- **Antippen übernimmt** Kalorien, Eiweiß, Kohlenhydrate, Fett und Ballaststoffe. Darunter steht die
  **Menge** mit der **Einheit zum Umschalten**: **Stück** (bzw. Scheibe, Glas, Becher, EL … – je nachdem,
  was zum Lebensmittel passt), **g** oder **ml** (ml bei Getränken, Milch, Joghurt & Co., gerechnet mit
  1 ml ≈ 1 g). Beim Umschalten wird die Menge umgerechnet (2 Stück Apfel → 300 g). Schnellknöpfe wie
  „2 Stück · 300 g“ oder „200 g“ helfen. Bei schon Gegessenem zählen Portionen. Die Werte rechnen sich
  mit, der Knopf zeigt die Kalorien: „＋ Eintragen · 162 kcal“. Eingetragen wird z. B. „Apfel · 2 Stück (300 g)“.
- Tippst du den Namen genau so ein, wie es ihn schon gibt (z. B. „Banane“), wird er auch ohne Antippen
  übernommen.
- Werte lassen sich danach noch von Hand ändern. Nichts Passendes dabei? **🔍 … auch online suchen**
  sucht Markenprodukte bei Open Food Facts.

## Rezepte bearbeiten und löschen

- Die 100 Grundrezepte sind vegetarisch, mit gebratenem Lachs als einziger Ausnahme (kein Räucherlachs), und
  ohne Pilze. Statt Parmesan steht „vegetarischer Hartkäse (Parmesan-Art)“ im Rezept.
- Dazu kommen 7 Familienrezepte (je 1 Portion): Jägerschnitzel mit Kartoffeln und Mischgemüse, Bratreis,
  Kaiserschmarren, Currywurst mit Currysoße und Kartoffeln, Milchreis, Geflügel-Geschnetzeltes mit Reis
  (alle unter Mittag) und Kartoffel-Feta-Hack-Auflauf (Abend). Sie erscheinen nach dem Update von selbst.
- Jedes Rezept zeigt die Zubereitung als nummerierte Schritte.
- Bei schon gegessenen Einträgen aus einem Rezept steht unter **Essen → Gegessen** rechts ein **📖**: antippen
  öffnet das Rezept mit Zubereitung. Im Eintrag selbst (antippen) gibt es oben **📖 Zutaten & Zubereitung**
  zum Aufklappen – die Mengen passen sich der gewählten Portion an.
- Eigene Rezepte: **Essen → Rezepte → ＋ Neu**. Unter „Zubereitung – ein Schritt pro Zeile“
  schreibst du jeden Schritt in eine eigene Zeile. Fehlt die Zubereitung, steht im Rezept
  „＋ Zubereitung hinzufügen“.
- **Verwalten** (neben „＋ Neu“): 🗑 löscht ein Rezept, auch die mitgelieferten. Das lässt sich
  rückgängig machen. Gelöschte Standardrezepte holst du dort mit **↺ wiederherstellen**
  zurück.

## Wochenplan

- Standard ist Montag bis Sonntag. Über **📅 Zeitraum ändern** wählst du Von und Bis frei,
  z. B. Donnerstag bis nächsten Freitag (bis 28 Tage). Für Zeiträume ab heute gibt es
  Schnellknöpfe.
- Die Einkaufsliste gilt immer für genau den gewählten Zeitraum. ‹ › blättert zum vorherigen
  bzw. nächsten Zeitraum gleicher Länge.

- Ein geplantes Essen antippen: Du siehst Nährwerte, Zutaten und Zubereitung. Von dort kannst du
  es für diesen Tag eintragen, ein anderes Rezept wählen oder es aus dem Plan nehmen.
- Beim Auswählen öffnet das Antippen eines Rezepts erst die Vorschau, **＋** plant es direkt ein.
- Bereits gegessene Mahlzeiten bekommen im Plan ein „✓ gegessen“.

## Lebensmittel suchen

- **Essen → 🔍 Lebensmittel suchen**, z. B. „Apfel“ oder „Skyr“.
- Rund 130 Grundnahrungsmittel (Obst, Gemüse, Brot, Milchprodukte …) sind fest eingebaut und
  funktionieren auch ohne Internet. Dabei sind typische Portionen wie „1 Stück · 150 g“.
- Markenprodukte sucht FitPlan online bei Open Food Facts. Gesendet wird nur der Suchbegriff.
- **Menge in Stück, g oder ml:** Beim Eintragen (auch nach dem Barcode-Scan und bei Zutaten fürs Rezept)
  lässt sich neben der Menge die Einheit umschalten – Stück bzw. Scheibe, Glas, Portion …, g oder ml
  (ml bei Getränken, Milch & Co., 1 ml ≈ 1 g). Umschalten rechnet die Menge um. FitPlan merkt sich die
  zuletzt gewählte Menge. 30 oder mehr bei „Stück“ wird als Gramm gerechnet.
  Bei Zutaten steht dann z. B. „2 Scheiben Vollkornbrot“ in der Zutatenliste.

## Rezept aus Zutaten berechnen

- Beim Anlegen oder Bearbeiten eines Rezepts: **🧮 Aus Zutaten berechnen → ＋ Zutat**.
  Jede Zutat suchen oder scannen und die Menge wählen.
- Kalorien, Eiweiß, Kohlenhydrate, Fett und Ballaststoffe werden automatisch ausgerechnet. Die
  Zutatenliste füllt sich mit.
- Bei **„Ergibt Portionen“** z. B. 4 eintragen: Die Werte gelten dann pro Portion, und die
  Einkaufsliste rechnet die Mengen anteilig um.

## Gewichtsprognose

- Unter **Fortschritt → Verlauf** steht, wann du bei deinem aktuellen Tempo die nächsten
  5-kg-Etappen und dein Ziel erreichst. Im Diagramm zeigt eine gestrichelte Linie den weiteren
  Verlauf.
- Berechnet wird aus den letzten 4 Wochen. Die Prognose erscheint ab etwa 2 Wochen Messungen.

## Barcode-Scanner

- **Essen → Schnell eintragen → 📷 Barcode scannen.** Beim ersten Mal fragt das iPhone nach
  der Kamera – „Erlauben“ tippen. Falls versehentlich abgelehnt: Einstellungen → Safari → Kamera.
- Die Nährwerte kommen von **Open Food Facts** (freie Datenbank). Gesendet wird nur die
  Barcode-Nummer. Unbekannte Produkte kannst du selbst eintragen.
- Einmal gescannte Produkte merkt sich FitPlan – sie funktionieren danach auch ohne Internet.
- Klappt die Kamera nicht, die Nummer unter dem Barcode einfach eintippen.

## Einkaufsliste: zusammengefasst und nach Kategorien

- **Gleiche Artikel ergeben einen Eintrag** – egal ob aus verschiedenen Rezepten, aus dem Plan der anderen
  Person, als eigener Eintrag oder aus FamilyWall. Die Mengen werden addiert: 150 ml Milch + 350 ml
  Milch 1,5 % = **500 ml Milch**. Zusätze wie „1,5 %“, „fettarm“, „natur“ oder „TK“ und Einzahl/Mehrzahl
  („Banane“/„2 Bananen“) zählen dabei als derselbe Artikel. Verschiedene Einheiten stehen in einer Zeile
  („400 g + 1 Dose Tomaten“). Darunter steht klein, woher der Artikel kommt („aus deinem Plan · Plan von Ben“).
- **Sortiert nach Kategorien** in Supermarkt-Reihenfolge: Obst & Gemüse, Brot & Backwaren, Milchprodukte &
  Eier, Fleisch, Fisch & Tofu, Nudeln, Reis & Trockenware, Konserven & Soßen, Gewürze, Öl & Backen,
  Tiefkühl, Süßes & Snacks, Getränke, Haushalt & Drogerie, Sonstiges. Neben jeder Kategorie steht, wie
  viel noch offen ist. Abgehaktes rutscht innerhalb der Kategorie nach unten.
- Abhaken oder ✕ wirkt auf alle zusammengefassten Einträge (bei gemeinsamer Liste auf allen Handys).
- **Neue Einträge** tippst du oben direkt über der Liste ein, gern mit Menge („1 l Milch“) – dann wird
  auch das mit gleichen Artikeln zusammengerechnet.
- Einkaufsmodus und **Exportieren** nutzen dieselbe Sortierung.

## Einkaufsmodus

- **Plan → Einkaufsliste → 🛒 Einkaufen – nur die Liste** öffnet die Liste im Vollbild, mit großen
  Zeilen zum Abhaken mit einem Finger.
- Alles steht in einer Ansicht, nach Kategorien sortiert und gleiche Artikel zusammengefasst: gemeinsame
  Liste, FamilyWall-Artikel, Zutaten aus dem Plan und eigene Einträge.
- Abgehaktes wandert nach unten in **✓ Im Wagen**. Antippen klappt es auf, dort lässt sich ein Haken
  wieder entfernen. Direkt nach dem Abhaken geht es auch über „Rückgängig“.
- Oben zeigt ein Balken, wie viel schon erledigt ist. Unten kann man schnell noch etwas eintragen.
- Der Bildschirm bleibt an, solange der Einkaufsmodus offen ist (wenn das Handy es unterstützt).
- Bei gemeinsamer Liste sieht man die Haken der anderen Person nach wenigen Sekunden.
- **Fertig** oder die Zurück-Taste (Android) schließt den Einkaufsmodus.

## Einkaufsliste aus FamilyWall übernehmen

- **Android:** In FamilyWall die Einkaufsliste öffnen → **Teilen** → **FitPlan** wählen.
  FitPlan öffnet sich mit der erkannten Liste, dann **Übernehmen** tippen.
  (FitPlan erscheint im Teilen-Menü erst, nachdem Chrome die installierte App aktualisiert
  hat. Das kann bis zu einem Tag dauern. Sofort geht es, wenn du FitPlan neu installierst.
  Vorher unbedingt **Mehr → Exportieren**, sonst sind die Daten weg.)
- **iPhone:** Die FamilyWall-App auf dem iPhone schickt beim Teilen nur den Listennamen und
  eine Werbezeile, **keine Artikel**. Daran lässt sich in FitPlan nichts ändern. Stattdessen:
  1. **Vom Android-Handy teilen:** Die Liste ist in FamilyWall für alle synchron.
  2. **Oder über die FamilyWall-Webseite:** In Safari `app.familywall.com` öffnen, Liste
     öffnen, Artikel markieren → Kopieren → in FitPlan unter **Aus FamilyWall einfügen**
     einfügen.
- **Android ohne Teilen-Menü:** In FamilyWall Teilen → **Kopieren**, dann wie oben einfügen.
- Die Kategorien aus FamilyWall bleiben erhalten. Ein neuer Import ersetzt die vorherige
  FamilyWall-Liste.

## Familie: Kalender, Geburtstage und Rezepte

Der Tab **Familie** bündelt alles, was ihr gemeinsam nutzt – wie in FamilyWall. Bei Geburtstagen und
Rezepten steht oben **„Heute & nächste 7 Tage“** mit allen Terminen und Geburtstagen (im Kalender zeigt der
Kalender das selbst). Darunter wählst du zwischen
**📅 Kalender**, **🎂 Geburtstage** und **📖 Rezepte**. Die Zahl am Tab-Symbol zeigt, wie viele
Einträge heute anstehen.

- Ohne Verbindung funktioniert alles auf dem eigenen Handy. Mit **👥 Mit der Familie teilen** (oben im Tab,
  dieselbe Verbindung wie bei der Einkaufsliste) sehen alle verbundenen Handys dasselbe – nach wenigen
  Sekunden. Was vorher schon auf dem Handy stand, kommt beim Verbinden automatisch mit.
- Einträge der anderen Personen haben eine andere Farbe und „von …“ dabei.

### 📅 Kalender

- Oben wählst du die Ansicht – FitPlan merkt sie sich:
  - **Liste:** Der Monat steht oben fest, darunter alle Termine Tag für Tag. Beim Scrollen bleibt der Tag, bei
    dem du gerade bist, als Überschrift stehen und wird im Monat markiert. Der Monat blättert mit. Einen Tag
    im Monat antippen springt in der Liste dorthin. Punkte unter dem Datum = Termine (lila = Geburtstag).
  - **Tag, 3 Tage, Woche:** Stundenraster mit den Terminen zu ihrer Uhrzeit, Ganztägiges und Geburtstage oben.
    Eine freie Stelle antippen legt einen Termin zu dieser Uhrzeit an. Ein Tageskopf antippen öffnet den Tag.
  - **Monat:** Großes Raster mit Kalenderwochen und den Termintiteln. Einen Tag antippen öffnet ihn als Tag.
- ‹ › oder Wischen blättert (Monat, Tag, 3 Tage oder Woche), **Heute** springt zurück, **＋** legt einen Termin an.
- **＋ Termin:** Titel, Datum, ganztägig oder mit Uhrzeit, mehrtägig („Bis“), Wiederholung (täglich,
  wöchentlich, alle 2 Wochen, monatlich, jährlich, optional „bis“), Ort und Notiz.
- Termin antippen → **Bearbeiten** oder **Löschen**. Bei Serien geht auch **„Nur am … löschen“**.

### Kalender aus FamilyWall übernehmen

**Familie → Kalender → ⬇ Importieren.**

**So geht es mit FamilyWall (Android):**
1. In FamilyWall im Kalender das Menü öffnen, beim Kalender (z. B. „Kohlbach – Standardkalender“) auf **›**
   tippen → **„iCal-URL generieren“** → **Kopieren**.
2. In FitPlan den Link einfügen → **Laden**. FamilyWall erlaubt FitPlan nicht, den Link direkt zu laden.
   Deshalb erscheint der Knopf **⬇ Kalenderdatei herunterladen** – antippen. Chrome speichert
   „FamilyWall – Kohlbach.ics“ unter Downloads.
3. **📄 Kalenderdatei (.ics) wählen** → im Auswahlfenster oben links **☰** → **Downloads** → Datei antippen.
   FitPlan zeigt direkt unter dem Knopf, wie viele Termine drin sind, und scrollt zur Vorschau.
   **Oder** in Chrome unter **Downloads** bei der Datei **⋮ → Teilen → FitPlan**. (FitPlan erscheint dort,
   sobald Chrome die installierte App aktualisiert hat – das kann bis zu einem Tag dauern.)
4. Für den **Geburtstagskalender** dasselbe mit dessen Link. FitPlan erkennt am Kalendernamen, dass es
   Geburtstage sind, und legt sie in den Geburtstagskalender. Sonst gibt es in der Vorschau das Häkchen
   **„Das sind Geburtstage“**.

Neue Termine aus FamilyWall holst du später genauso – schon vorhandene werden nur aktualisiert, nicht verdoppelt.
Den Link nicht weitergeben: Wer ihn hat, sieht alle Termine. In FamilyWall erzeugt **↻** einen neuen Link,
dann gilt der alte nicht mehr.

**Weitere Wege:** eine `.ics`-Datei aus einem anderen Kalender (z. B. Google Kalender) auswählen, oder
**Text** einfügen: FitPlan erkennt Zeilen mit Datum und Uhrzeit, z. B. „Mo., 10.11. 16:30 Fußball“. Ein
iCal-Link eines Anbieters, der das direkte Laden erlaubt, kann gemerkt und regelmäßig aktualisiert werden.
Auf dem Android-Handy geht auch **Teilen → FitPlan**: Termine, Kalenderdateien und iCal-Links landen im
Kalender-Import, Einkaufslisten wie bisher bei der Einkaufsliste.

Vor dem Übernehmen zeigt FitPlan eine Vorschau. Einzelne Termine lassen sich mit ✕ weglassen, vergangene
Termine werden auf Wunsch übersprungen. Wiederkehrende Termine (z. B. jeden Dienstag) bleiben Serien.
**Geburtstage** (jährliche Termine mit „Geburtstag“ im Namen) landen im Geburtstagskalender. Ein erneuter
Import verdoppelt nichts, gleiche Termine werden nur aktualisiert. Direkt danach geht **Rückgängig**.

### Kalender exportieren (.ics)

**Familie → Kalender → ⬆ Exportieren** erstellt eine Kalenderdatei mit euren Terminen – für FamilyWall
(Kalender-Menü → „Ereignisse aus ICS importieren“), Google Kalender, Outlook oder als Sicherung.

- **Nur Termine ab heute** (Serien sind immer dabei) – ausschalten, um auch Vergangenes mitzunehmen.
- **Geburtstage mitnehmen** – als jährliche Termine „🎂 Name“.
- **Übernommene Termine mitnehmen** – ausschalten, wenn die Datei in FamilyWall eingelesen wird. Sonst
  stehen die Termine, die ursprünglich aus FamilyWall kamen, dort doppelt.
- Mit dabei sind Uhrzeit, mehrere Tage, Wiederholungen, ausgelassene Tage, Ort, Notiz und „Eingetragen von …“.
- **💾 In Downloads speichern** oder – falls das Handy es anbietet – **⬆ Teilen** (Mail, Drive, WhatsApp …).
- Liest man die Datei wieder in FitPlan ein, wird nichts doppelt: FitPlan erkennt seine eigenen Termine.

### 🎂 Geburtstage

- Liste nach dem nächsten Geburtstag sortiert, mit „in 5 Tagen“ und – wenn das Geburtsjahr eingetragen
  ist – „wird 34“. Geburtstage stehen auch im Kalender und oben bei „Heute & nächste 7 Tage“.
- **＋ Geburtstag:** Name, Tag, Monat, Jahr (optional). Antippen zum Ändern oder Löschen.

### 📖 Gemeinsame Rezepte

- **＋ Teilen** wählt eins deiner Rezepte aus (eigene stehen oben). Oder direkt im Rezept (Tab Essen →
  Rezept antippen) auf **👥 Mit der Familie teilen** tippen. Änderst du das Rezept später, ändert sich die
  geteilte Fassung mit.
- **＋ Neues Rezept anlegen und teilen** legt ein Rezept bei dir an und teilt es gleich.
- Gemeinsames Rezept antippen: Zutaten und Zubereitung, **📅 Einplanen** (Tag und Mahlzeit wählen),
  **🛒 Zutaten auf die Einkaufsliste**, **＋ In meine Rezepte übernehmen** oder entfernen.

## Gemeinsame Einkaufsliste für zwei Handys (Firebase)

Zwei oder mehr Personen teilen sich Einkaufsliste, Kalender, Geburtstage und Rezepte: Was einer einträgt
oder abhakt, sehen die anderen nach wenigen Sekunden. Das läuft über **Firebase** (Google), kostenlos und
ohne Kreditkarte. Nur diese Dinge (inklusive übernommener FamilyWall-Artikel und -Termine) und – wenn
eingeschaltet – der Essensplan mit den geplanten Rezepten, deine Essen zur Auswahl für alle und deine
Daten für deine eigenen Geräte liegen dort (siehe unten). Einrichten geht im Tab **Familie** oder im Tab **Plan**.

### Einmalig: Firebase einrichten (am PC, ca. 10 Minuten)

1. **https://console.firebase.google.com** öffnen und mit einem Google-Konto anmelden.
2. **Projekt erstellen** (bzw. „Neues Firebase-Projekt erstellen“) → Name z. B. `fitplan-einkauf`
   → Google Analytics **ausschalten** → Projekt erstellen.
3. **Anonyme Anmeldung einschalten:** Links **Erstellen/Build → Authentication** → „Jetzt starten“
   → Tab **Anmeldemethode** (Sign-in method) → **Anonym** → Aktivieren → Speichern.
4. **Datenbank anlegen:** Links **Erstellen/Build → Firestore Database** → **Datenbank erstellen**.
   Falls gefragt: **Standard-Edition**, Datenbank-ID `(default)` lassen.
   Standort: **europe-west3 (Frankfurt)** oder **eur3 (Europa)**. Danach **Im Produktionsmodus starten**
   → Erstellen.
5. **Regeln setzen:** In Firestore Database den Tab **Regeln** öffnen, alles löschen, Folgendes einfügen und
   **Veröffentlichen** tippen:

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /lists/{code} {
         allow get: if request.auth != null;
         allow create, update: if request.auth != null
           && code.size() == 20
           && request.resource.data.keys().hasOnly(['v', 'items', 'plans', 'cal', 'bd', 'rz', 'fv', 'pv'])
           && request.resource.data.get('items', {}).size() <= 500
           && request.resource.data.get('plans', {}).size() <= 10
           && request.resource.data.get('cal', {}).size() <= 1500
           && request.resource.data.get('bd', {}).size() <= 300
           && request.resource.data.get('rz', {}).size() <= 200
           && request.resource.data.get('pv', {}).size() <= 200;
         // Eigene Daten je Person (für mehrere eigene Geräte) und Essen der Familie zur Auswahl
         match /u/{doc} {
           allow get: if request.auth != null && code.size() == 20;
           allow create, update: if request.auth != null
             && code.size() == 20 && doc.size() <= 40
             && request.resource.data.keys().hasOnly(['e']);
         }
       }
     }
   }
   ```

   Damit kann nur lesen und schreiben, wer den 20-stelligen Listen-Code aus der Einladung kennt.
   Listen durchsuchen oder löschen kann niemand.

   **Schon eingerichtet?** Wer die Regeln von vor dem 13.11.2026 (Abend) hat, ersetzt sie einmal durch diese
   (Firestore Database → Regeln → einfügen → Veröffentlichen). Sonst gleichen deine eigenen Geräte nicht
   ab und deine Essen stehen den anderen nicht zur Auswahl (bei Regeln von vor dem 07.11.2026 auch keine
   Kalender, Geburtstage und Rezepte) – FitPlan zeigt dann unter **👥 Verwalten** einen roten Hinweis.
   Die Einkaufsliste funktioniert auch ohne das, und auf dem Handy geht nichts verloren.
6. **Web-App anlegen:** Oben links auf **⚙️ → Projekteinstellungen** → ganz unten bei „Meine Apps“
   auf das Symbol **`</>`** (Web) → Name z. B. `FitPlan` → „Firebase Hosting“ **nicht** ankreuzen →
   **App registrieren**. Es erscheint ein Block, der so beginnt:

   ```
   const firebaseConfig = {
     apiKey: "AIza…",
     authDomain: "fitplan-einkauf.firebaseapp.com",
     projectId: "fitplan-einkauf",
     …
   };
   ```

   Diesen ganzen Block kopieren und dir z. B. per Mail oder Notiz aufs Handy schicken.
   (Später wiederzufinden unter ⚙️ → Projekteinstellungen → Allgemein → Meine Apps.)
   Der Block ist kein Passwort. Er sagt FitPlan nur, welches Firebase-Projekt es nutzen soll.

### Erstes Handy: Liste anlegen

1. FitPlan → **Familie** → **👥 Mit der Familie teilen** (oder **Plan** → unten bei der Einkaufsliste
   **👥 Mit anderem Handy teilen** – das ist dieselbe Verbindung).
2. **Neue Liste anlegen** → deinen Namen eintragen → den `firebaseConfig`-Block einfügen → **Verbinden**.
3. **📨 Andere Person einladen** → die Einladung z. B. per WhatsApp schicken.

Eigene Einträge und die FamilyWall-Liste, die schon auf der Liste standen, wandern dabei in die
gemeinsame Liste – ebenso Termine, Geburtstage und Rezepte aus dem Tab Familie.

### Zweites Handy: Einladung annehmen

1. FitPlan installieren (siehe oben) und öffnen.
2. **Familie** → **👥 Mit der Familie teilen** → **Einladung annehmen**.
3. Namen eintragen, die **ganze Nachricht** mit der Einladung einfügen → **Verbinden**.

### So funktioniert die gemeinsame Liste

- **👥 Gemeinsame Liste:** Alles, was hier steht, sehen beide. Neue Einträge über das Eingabefeld landen
  automatisch hier. Bei Einträgen der anderen Person steht „von …“.
- **🗓️ Aus dem Plan:** Die Zutaten der geplanten Essen stehen automatisch auf der gemeinsamen Liste –
  bei beiden. Kommt ein Essen in den Plan, sind seine Zutaten gleich drauf. Fliegt es raus, verschwinden
  sie wieder. Ändert sich die Menge, wird der Eintrag angepasst (und der Haken entfernt, damit man
  nachkauft). Es gilt der Zeitraum, der im Tab **Plan** angezeigt wird. Blättern im Tab **Essen**
  ändert die Liste nicht.
- Eine Plan-Zutat, die man mit ✕ oder **Abgehakte löschen** entfernt (z. B. weil sie noch im Schrank
  ist), bleibt weg, bis sich ihre Menge im Plan ändert.
- Abschalten unter **👥 Gemeinsame Liste verwalten → „Zutaten aus meinem Plan automatisch auf die
  Liste“**. Dann bleiben die Plan-Zutaten erst einmal auf dem eigenen Handy („nur hier“). Mit
  **↑ teilen** kommen sie von Hand auf die gemeinsame Liste.
- Abhaken, ✕, **Abgehakte löschen**, **Liste leeren** und **Haken zurücksetzen** wirken bei
  gemeinsamen Einträgen auf **beiden** Handys.
- Abgeglichen wird, solange der Tab **Plan** offen ist, etwa alle 5 Sekunden. Oben rechts in der Liste
  steht „✓ aktuell“. **Ohne Internet** kann man weiter abhaken und eintragen. FitPlan schickt die
  Änderungen, sobald wieder Netz da ist.
- **Verbindung trennen** (im selben Menü): Offene Einträge bleiben auf diesem Handy als eigene
  Einträge erhalten, Kalender, Geburtstage und Rezepte ebenfalls.
- Wer die Einladung hat, kann die Liste sehen und ändern. Schick sie nur an die Person, mit der du
  die Liste teilen willst.
- **Essensplan teilen:** Jedes Handy teilt automatisch seine geplanten Essen (ab gestern bis 4 Wochen
  voraus) mit den kompletten Rezepten. Im Tab **Plan** erscheint dann die Karte **👥 Essensplan von …**.
  Sie zeigt immer heute bis in 6 Tagen (auch Tage, an denen nichts geplant ist), weitere geplante Tage per Knopf.
  Zusätzlich steht im eigenen Wochenplan bei jedem Tag und im Tab **Essen** (mit den Datums-Pfeilen auch für
  morgen) „👥 Ben · Mittag: …“. Ein Essen antippen zeigt Zutaten und Zubereitung. Von dort geht **📅 Auch bei mir einplanen** (gleicher
  Tag, gleiche Mahlzeit) oder **＋ In meine Rezepte übernehmen**. Abschalten lässt sich das unter
  **👥 Gemeinsame Liste verwalten → Meinen Essensplan mit Rezepten teilen**.
  Wer die Firebase-Regeln noch von vor dem 06.11.2026 hat, muss sie einmal durch die Regeln oben
  ersetzen (Firestore Database → Regeln → einfügen → Veröffentlichen). Bis dahin zeigt FitPlan im
  Plan-Tab einen roten Hinweis. Die Einkaufsliste funktioniert auch ohne das.
- **FamilyWall:** Eine übernommene FamilyWall-Liste landet bei Verbindung ebenfalls in der gemeinsamen
  Liste (Abschnitt „📋 FamilyWall · gemeinsam“, nach Kategorien). Übernimmt das andere Handy dieselbe
  Liste, entstehen keine doppelten Artikel. Eine FamilyWall-Liste, die schon vor dem Verbinden auf
  dem Handy war, wird automatisch mit übernommen.

### Eigene Geräte abgleichen (gleicher Name)

- Wer FitPlan auf mehreren eigenen Geräten nutzt (z. B. Handy und Tablet), verbindet jedes Gerät mit
  derselben Einladung und trägt überall **denselben Namen** ein (Groß-/Kleinschreibung egal).
- Dann sind auf allen diesen Geräten gleich: Essen (Gegessen-Liste), Wasser, Sport und Übungen, Gewicht,
  Maße, Wochenplan, Rezepte, Favoriten, gescannte Produkte und Ziele. Was auf einem Gerät eingetragen,
  geändert oder gelöscht wird, ist nach wenigen Sekunden auf den anderen.
- Beim ersten Verbinden eines weiteren Geräts kommen die Daten vom schon verbundenen Gerät dazu. Tage, an
  denen auf beiden Geräten etwas eingetragen war, werden zusammengeführt – es geht nichts verloren.
- Ändern zwei Geräte gleichzeitig denselben Tag (z. B. ohne Internet), bleiben alle Einträge erhalten.
- Gleiche Plan-Zutaten erscheinen auf der Einkaufsliste nur einmal, und der Essensplan der eigenen Geräte
  erscheint nicht als „Essensplan von …“.
- Ein-/ausschalten unter **👥 Verwalten → Meine Daten auf meinen Geräten abgleichen**. Name ändern
  verbindet das Gerät mit den Geräten des neuen Namens.
- Hinweis: Wer die Einladung hat, könnte diese Daten technisch auch lesen – schick sie nur an deine Familie.

### Essen der Familie zur Auswahl

- Eigene Rezepte, was in den letzten 4 Monaten gegessen wurde, Favoriten und gescannte Produkte stehen
  allen Verbundenen zur Auswahl – egal auf welchem Gerät sie eingetragen wurden:
  - Tab **Essen → Rezepte:** unten „👥 Von der Familie“ mit „von …“. ＋ trägt direkt ein, Antippen zeigt
    Zutaten und Zubereitung, **📅 Einplanen** oder **＋ In meine Rezepte übernehmen**.
  - **Lebensmittel suchen:** „Schon eingetragen“ und „👥 Produkte der Familie“.
  - **Freier Eintrag:** Beim Tippen des Namens werden bekannte Essen vorgeschlagen (siehe unten).
  - **Wochenplan:** Bei der Rezeptauswahl stehen die Rezepte der Familie unten.
- Falsches oder doppeltes Essen: antippen → **Für alle aus der Auswahl nehmen**.
- Abschalten unter **👥 Verwalten → Was ich esse, steht allen zur Auswahl**.

## App später ändern

1. Datei im Ordner `fitplan` ändern – meist die Datei in `js/` für den betroffenen Tab (siehe Liste oben).
   Kommt eine neue Datei in `js/` dazu, muss sie in `index.html` (Zeilen `<script src=…>`, Reihenfolge
   beachten) und in `sw.js` (Liste `APP`, damit sie offline funktioniert) eingetragen werden.
2. Änderung committen und mit `git push` zu GitHub hochladen. Nach etwa einer Minute ist sie online.
   Die Cache-Version in `sw.js` wird dabei automatisch neu gesetzt – nichts hochzählen nötig.
   (Nur bei Netlify per Drag-and-drop: in `sw.js` die Zeile `const VERSION = …` von Hand ändern.)
3. Auf dem iPhone FitPlan mit Internet öffnen, ganz schließen und noch einmal öffnen.
   Dann ist die neue Version da. Deine Daten bleiben erhalten.
