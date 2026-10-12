# BFSG Check

Ein kostenloses Open-Source-Tool von [BlueBranch](https://www.bluebranch.de/).

Chrome-Erweiterung, die die geöffnete Webseite auf Barrierefreiheit nach dem **Barrierefreiheitsstärkungsgesetz (BFSG)** prüft – also nach EN 301 549 bzw. **WCAG 2.1 AA** – und lokale **Performance-Hinweise** gibt.

**Alles läuft lokal im Browser.** Es werden keine Daten übertragen, es gibt keine externen APIs, kein Tracking.

*English summary below.*

## Funktionen

- **Barrierefreiheit** mit [axe-core](https://github.com/dequelabs/axe-core) (WCAG 2.1 AA, optional WCAG 2.2 AA und Best Practices)
- **BFSG-Zusatzprüfungen**: Link zur Barrierefreiheitserklärung, nichtssagende Linktexte („mehr“, „hier“), verlinkte PDFs, CAPTCHAs, Formularfelder nur mit Platzhalter, automatisch startende Videos
- **Zwei Ansichten**
  - *Einfach*: Ampel, die wichtigsten Probleme in verständlicher Sprache – wer ist betroffen, wie wird es behoben
  - *Ausführlich*: gruppiert nach WCAG-Kriterium mit EN-301-549-Abschnitt, Schweregrad, Selektor, HTML-Ausschnitt, Filter, Suche und Seitenstruktur (Überschriften, Landmarks)
- **Deutsch und Englisch**, inklusive übersetzter axe-core-Meldungen
- **Elemente auf der Seite markieren**
- **Performance (lokal)**: LCP, CLS, INP, TTFB, FCP, Blockierzeit, Seitengewicht nach Typ, Drittanbieter, Optimierungshinweise (zu große Bilder, fehlendes Lazy Loading, render-blockierende Ressourcen, fehlende Komprimierung, `font-display` …)
- **Manuelle Checkliste** für das, was sich nicht automatisieren lässt (Tastatur, Fokus, Zoom, Reflow …). Der Stand wird pro Website gespeichert.
- **Werkzeuge**: Tab-Reihenfolge anzeigen, Textabstände nach WCAG 1.4.12, Graustufen, 200 % Zoom, 320-px-Ansicht
- **Export** als HTML-Bericht (druckbar als PDF), CSV oder JSON

> Automatische Tests finden nur einen Teil aller Barrieren (ca. 30–50 %). Die Erweiterung ersetzt keine vollständige Prüfung und ist keine Konformitätsbestätigung nach BFSG.

## Installation (Entwicklung)

Voraussetzung: Node.js ≥ 20

```bash
npm install
npm run dev      # startet Chrome mit der Erweiterung und Hot Reload
npm run build    # Produktions-Build nach .output/chrome-mv3
npm run zip      # ZIP für den Chrome Web Store
npm test         # Unit-Tests
npm run typecheck
```

Manuell laden: `chrome://extensions` → Entwicklermodus → „Entpackte Erweiterung laden“ → `.output/chrome-mv3`.

## Bedienung

1. Auf das BFSG-Check-Symbol in der Symbolleiste klicken (oder `Alt+Shift+B`). Die Seitenleiste öffnet sich, und der Tab wird für die Prüfung freigegeben.
2. „Seite prüfen“ klicken. Vorher am besten Menüs, Dialoge oder Formularfehler öffnen, damit auch diese Zustände geprüft werden.
3. Für vergleichbare Performance-Werte „Neu laden & prüfen“ verwenden.

Wechselt man den Tab oder die Domain, muss man erneut auf das Symbol klicken (`activeTab`). Alternativ kann man in der Erweiterung dauerhaft den Zugriff auf alle Websites erlauben.

## Architektur

| Teil | Datei(en) | Aufgabe |
|---|---|---|
| Background | `src/entrypoints/background.ts` | öffnet die Seitenleiste beim Klick aufs Symbol |
| Scanner | `src/entrypoints/scanner.ts`, `src/scanner/*` | wird per `chrome.scripting` in den Tab injiziert: axe-core, Zusatzprüfungen, Performance-Messung, Overlays |
| Side Panel | `src/entrypoints/sidepanel/`, `src/panel/*` | Vue-3-Oberfläche |
| Inhalte | `src/shared/rule-texts.ts`, `wcag.ts`, `checklist.ts` | verständliche Regeltexte, WCAG-Kriterien, Checkliste (DE/EN) |
| Build | `build/axe-locale-plugin.ts` | kompiliert die axe-Übersetzungen vorab, weil Erweiterungen kein `eval` erlauben |

Technik: [WXT](https://wxt.dev), Vue 3, TypeScript, Manifest V3.

Berechtigungen: `activeTab`, `scripting`, `sidePanel`, `storage`, optional `<all_urls>`.

## Mitmachen

Issues und Pull Requests sind willkommen, besonders für:

- weitere verständliche Regeltexte in `src/shared/rule-texts.ts`
- zusätzliche BFSG-Prüfungen in `src/scanner/checks.ts` (mit Test in `tests/checks.test.ts`)

## Lizenz

[MIT](LICENSE). Enthält [axe-core](https://github.com/dequelabs/axe-core) von Deque Systems, Inc. unter der [Mozilla Public License 2.0](https://www.mozilla.org/MPL/2.0/) (unverändert gebündelt). Icons der Tab-Leiste aus [Lucide](https://lucide.dev) (ISC-Lizenz).

---

## English summary

BFSG Check, a free open-source tool by [BlueBranch](https://www.bluebranch.de/), is a Chrome extension that checks the open page for accessibility according to the German Accessibility Act (BFSG / EN 301 549 / WCAG 2.1 AA) using axe-core plus extra BFSG-specific checks. It also gives local performance hints (Core Web Vitals, page weight, optimisation tips). It offers a simple and a detailed view in German and English, element highlighting, a manual checklist, testing tools and HTML/CSV/JSON export. Everything runs locally: no data leaves the browser.

Development: `npm install`, then `npm run dev`. See the commands above.
