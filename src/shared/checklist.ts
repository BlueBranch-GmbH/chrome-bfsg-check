import type { Locale, ToolState } from './types';

export type ChecklistStatus = 'open' | 'pass' | 'fail' | 'na';

export interface ChecklistItem {
  id: string;
  criteria: string[];
  /** Tool in the "Tools" tab that helps with this check. */
  tool?: keyof ToolState | 'zoom' | 'reflow';
  text: Record<Locale, { title: string; how: string }>;
}

/**
 * Checks that cannot be automated reliably. Roughly half of all WCAG
 * criteria need human judgement, so this list matters as much as the
 * automated results.
 */
export const CHECKLIST: ChecklistItem[] = [
  {
    id: 'keyboard',
    criteria: ['2.1.1'],
    text: {
      de: {
        title: 'Alles ist per Tastatur bedienbar',
        how: 'Maus beiseitelegen. Mit Tab, Shift+Tab, Enter, Leertaste und Pfeiltasten alle Menüs, Formulare, Slider, Dialoge und den Cookie-Banner bedienen.',
      },
      en: {
        title: 'Everything works with the keyboard',
        how: 'Put the mouse aside. Operate all menus, forms, sliders, dialogs and the cookie banner with Tab, Shift+Tab, Enter, Space and the arrow keys.',
      },
    },
  },
  {
    id: 'keyboard-trap',
    criteria: ['2.1.2'],
    text: {
      de: {
        title: 'Keine Tastaturfalle',
        how: 'Der Fokus kann jedes Element (z. B. eingebettete Videos, Karten, Dialoge) per Tastatur wieder verlassen.',
      },
      en: {
        title: 'No keyboard trap',
        how: 'Focus can leave every element (embedded videos, maps, dialogs …) using the keyboard.',
      },
    },
  },
  {
    id: 'focus-visible',
    criteria: ['2.4.7', '2.4.11'],
    text: {
      de: {
        title: 'Fokus ist immer deutlich sichtbar',
        how: 'Beim Tabben ist jederzeit klar erkennbar, welches Element den Fokus hat. Er wird nicht von Sticky-Headern oder Bannern verdeckt.',
      },
      en: {
        title: 'Focus is always clearly visible',
        how: 'While tabbing it is always obvious which element has focus, and it is not hidden behind sticky headers or banners.',
      },
    },
  },
  {
    id: 'focus-order',
    criteria: ['2.4.3', '1.3.2'],
    tool: 'tabOrder',
    text: {
      de: {
        title: 'Fokus-Reihenfolge ist logisch',
        how: 'Die Tab-Reihenfolge folgt der Lesereihenfolge. Beim Öffnen eines Dialogs springt der Fokus hinein und beim Schließen zurück.',
      },
      en: {
        title: 'Focus order is logical',
        how: 'The tab order follows the reading order. Opening a dialog moves focus into it; closing returns focus.',
      },
    },
  },
  {
    id: 'alt-quality',
    criteria: ['1.1.1'],
    text: {
      de: {
        title: 'Alternativtexte sind sinnvoll',
        how: 'Die Alternativtexte beschreiben Inhalt und Zweck des Bildes, nicht „Bild1.jpg“ oder „Foto“. Dekorative Bilder haben alt="".',
      },
      en: {
        title: 'Alternative texts are meaningful',
        how: 'Alt texts describe the content and purpose of the image, not “image1.jpg” or “photo”. Decorative images have alt="".',
      },
    },
  },
  {
    id: 'zoom',
    criteria: ['1.4.4'],
    tool: 'zoom',
    text: {
      de: {
        title: 'Seite funktioniert bei 200 % Zoom',
        how: 'Browser-Zoom auf 200 % stellen. Alle Inhalte und Funktionen sind weiterhin nutzbar, nichts überlappt oder wird abgeschnitten.',
      },
      en: {
        title: 'Page works at 200 % zoom',
        how: 'Set browser zoom to 200 %. All content and functions remain usable; nothing overlaps or gets cut off.',
      },
    },
  },
  {
    id: 'reflow',
    criteria: ['1.4.10'],
    tool: 'reflow',
    text: {
      de: {
        title: 'Kein horizontales Scrollen bei 320 px Breite',
        how: 'Bei 320 CSS-Pixeln Breite (entspricht 400 % Zoom auf 1280 px) bricht der Inhalt um, ohne dass seitlich gescrollt werden muss.',
      },
      en: {
        title: 'No horizontal scrolling at 320 px width',
        how: 'At 320 CSS pixels width (400 % zoom on 1280 px) content reflows without horizontal scrolling.',
      },
    },
  },
  {
    id: 'text-spacing',
    criteria: ['1.4.12'],
    tool: 'textSpacing',
    text: {
      de: {
        title: 'Größere Textabstände zerstören das Layout nicht',
        how: 'Das Werkzeug „Textabstände“ aktivieren. Kein Text wird abgeschnitten oder überlappt.',
      },
      en: {
        title: 'Larger text spacing does not break the layout',
        how: 'Enable the “Text spacing” tool. No text gets cut off or overlaps.',
      },
    },
  },
  {
    id: 'color-only',
    criteria: ['1.4.1'],
    tool: 'grayscale',
    text: {
      de: {
        title: 'Informationen nicht nur über Farbe',
        how: 'Graustufen aktivieren. Pflichtfelder, Fehler, Links, Diagramme und Status sind weiterhin erkennbar.',
      },
      en: {
        title: 'Information is not conveyed by colour alone',
        how: 'Enable grayscale. Required fields, errors, links, charts and states are still recognisable.',
      },
    },
  },
  {
    id: 'non-text-contrast',
    criteria: ['1.4.11'],
    text: {
      de: {
        title: 'Bedienelemente und Grafiken haben genug Kontrast',
        how: 'Rahmen von Eingabefeldern, Icons, Checkboxen und Fokus-Rahmen haben mindestens 3:1 Kontrast zum Hintergrund.',
      },
      en: {
        title: 'Controls and graphics have enough contrast',
        how: 'Input borders, icons, checkboxes and focus indicators have at least 3:1 contrast against the background.',
      },
    },
  },
  {
    id: 'hover-content',
    criteria: ['1.4.13'],
    text: {
      de: {
        title: 'Tooltips und Aufklapp-Inhalte sind beherrschbar',
        how: 'Inhalte, die bei Hover oder Fokus erscheinen, lassen sich mit Esc schließen, bleiben beim Darüberfahren sichtbar und verschwinden nicht von selbst.',
      },
      en: {
        title: 'Tooltips and pop-up content are controllable',
        how: 'Content appearing on hover or focus can be dismissed with Esc, stays visible while hovered and does not disappear by itself.',
      },
    },
  },
  {
    id: 'form-errors',
    criteria: ['3.3.1', '3.3.3', '4.1.3'],
    text: {
      de: {
        title: 'Fehlermeldungen sind verständlich',
        how: 'Formular mit Fehlern absenden. Fehler werden als Text benannt, dem Feld zugeordnet, vom Screenreader angesagt und enthalten einen Korrekturvorschlag.',
      },
      en: {
        title: 'Error messages are understandable',
        how: 'Submit a form with errors. Errors are described in text, associated with the field, announced by screen readers and suggest a fix.',
      },
    },
  },
  {
    id: 'media-alternatives',
    criteria: ['1.2.1', '1.2.2', '1.2.3', '1.2.5'],
    text: {
      de: {
        title: 'Videos haben Untertitel und Audiodeskription',
        how: 'Aufgezeichnete Videos haben Untertitel. Wichtige visuelle Informationen werden zusätzlich beschrieben (Audiodeskription oder Transkript).',
      },
      en: {
        title: 'Videos have captions and audio description',
        how: 'Prerecorded videos have captions. Important visual information is also described (audio description or transcript).',
      },
    },
  },
  {
    id: 'timing',
    criteria: ['2.2.1', '2.2.2'],
    text: {
      de: {
        title: 'Zeitlimits und Bewegung sind steuerbar',
        how: 'Session-Timeouts lassen sich verlängern. Slider, Karussells und Animationen lassen sich anhalten.',
      },
      en: {
        title: 'Time limits and motion are controllable',
        how: 'Session timeouts can be extended. Sliders, carousels and animations can be paused.',
      },
    },
  },
  {
    id: 'screenreader',
    criteria: ['4.1.2', '1.3.1'],
    text: {
      de: {
        title: 'Stichprobe mit dem Screenreader',
        how: 'Mit NVDA (Windows) oder VoiceOver (macOS: Cmd+F5) die wichtigsten Abläufe durchgehen, z. B. Navigation, Suche, Kontaktformular, Warenkorb, Checkout.',
      },
      en: {
        title: 'Spot check with a screen reader',
        how: 'Use NVDA (Windows) or VoiceOver (macOS: Cmd+F5) to go through the key journeys: navigation, search, contact form, cart, checkout.',
      },
    },
  },
  {
    id: 'consistency',
    criteria: ['3.2.3', '3.2.4', '3.2.6'],
    text: {
      de: {
        title: 'Navigation und Hilfe sind einheitlich',
        how: 'Navigation, Bezeichnungen und Kontakt-/Hilfe-Angebote stehen auf allen Seiten an der gleichen Stelle und heißen gleich.',
      },
      en: {
        title: 'Navigation and help are consistent',
        how: 'Navigation, labels and contact/help options appear in the same place and with the same names on every page.',
      },
    },
  },
  {
    id: 'authentication',
    criteria: ['3.3.8'],
    text: {
      de: {
        title: 'Login ohne Gedächtnis- oder Rätselaufgaben',
        how: 'Passwort-Manager und Einfügen funktionieren. Es gibt keine Aufgabe, bei der man sich etwas merken oder ein Rätsel lösen muss.',
      },
      en: {
        title: 'Login without memory or puzzle tasks',
        how: 'Password managers and paste work. There is no task requiring memorising or solving a puzzle.',
      },
    },
  },
  {
    id: 'statement-content',
    criteria: [],
    text: {
      de: {
        title: 'Barrierefreiheitserklärung ist vollständig',
        how: 'Die Erklärung beschreibt die Dienstleistung, wie die Anforderungen erfüllt werden, und nennt u. a. die zuständige Marktüberwachungsbehörde (§ 14 BFSG, Anlage 3).',
      },
      en: {
        title: 'Accessibility statement is complete',
        how: 'The statement describes the service, how the requirements are met, and names, among other things, the responsible market surveillance authority (§ 14 BFSG, Annex 3).',
      },
    },
  },
];
