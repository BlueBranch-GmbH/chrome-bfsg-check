import type { Locale, RuleResult } from './types';

/** Who is affected by a problem. Used to group issues in the simple view. */
export type Audience = 'screenreader' | 'keyboard' | 'vision' | 'forms' | 'structure' | 'media' | 'legal';

export interface RuleText {
  /** Problem in plain language. */
  title: string;
  /** Who is affected and how. */
  why: string;
  /** What to do about it. */
  fix: string;
  /** Shown instead of the title when the check passed (custom checks only). */
  passTitle?: string;
}

interface RuleCopy {
  audience: Audience;
  de: RuleText;
  en: RuleText;
}

/**
 * Plain-language texts for the simple view. Covers the rules that show up
 * most often in practice and all custom BFSG checks. Rules without an entry
 * fall back to axe-core's own (translated) texts.
 */
export const RULE_TEXTS: Record<string, RuleCopy> = {
  'image-alt': {
    audience: 'screenreader',
    de: {
      title: 'Bilder ohne Alternativtext',
      why: 'Blinde Menschen erfahren nicht, was auf dem Bild zu sehen ist. Der Screenreader liest bestenfalls den Dateinamen vor.',
      fix: 'Jedem Bild ein aussagekräftiges alt-Attribut geben. Rein dekorative Bilder bekommen alt="".',
    },
    en: {
      title: 'Images without alternative text',
      why: 'Blind users do not learn what the image shows. At best, the screen reader reads out the file name.',
      fix: 'Give every image a meaningful alt attribute. Purely decorative images get alt="".',
    },
  },
  'color-contrast': {
    audience: 'vision',
    de: {
      title: 'Text mit zu geringem Kontrast',
      why: 'Menschen mit Sehschwäche, ältere Menschen und alle, die bei Sonnenlicht auf das Handy schauen, können den Text schlecht lesen.',
      fix: 'Kontrast auf mindestens 4,5:1 erhöhen (große Schrift ab 24 px bzw. 18,5 px fett: 3:1). Meist reicht eine dunklere Textfarbe.',
    },
    en: {
      title: 'Text with insufficient contrast',
      why: 'People with low vision, older people and anyone reading on a phone in sunlight struggle to read the text.',
      fix: 'Increase the contrast to at least 4.5:1 (large text from 24 px or 18.5 px bold: 3:1). A darker text colour is usually enough.',
    },
  },
  'link-name': {
    audience: 'screenreader',
    de: {
      title: 'Links ohne erkennbaren Namen',
      why: 'Screenreader lesen nur „Link“ vor. Niemand weiß, wohin der Link führt. Typisch bei Icon-Links (z. B. Social Media, Logo).',
      fix: 'Sichtbaren Linktext ergänzen oder bei Icons ein aria-label bzw. einen Alternativtext für das Bild setzen.',
    },
    en: {
      title: 'Links without a recognisable name',
      why: 'Screen readers only announce “link”. Nobody knows where it leads. Typical for icon links (social media, logo).',
      fix: 'Add visible link text, or for icons set an aria-label or an alternative text on the image.',
    },
  },
  'button-name': {
    audience: 'screenreader',
    de: {
      title: 'Schaltflächen ohne Beschriftung',
      why: 'Screenreader-Nutzer hören nur „Schaltfläche“ und wissen nicht, was beim Klick passiert, z. B. bei Menü-, Schließen- oder Suchen-Buttons mit Icon.',
      fix: 'Sichtbaren Text in den Button schreiben oder ein aria-label vergeben (z. B. aria-label="Menü öffnen").',
    },
    en: {
      title: 'Buttons without a label',
      why: 'Screen reader users only hear “button” and do not know what happens, e.g. for icon-only menu, close or search buttons.',
      fix: 'Put visible text inside the button or add an aria-label (e.g. aria-label="Open menu").',
    },
  },
  label: {
    audience: 'forms',
    de: {
      title: 'Formularfelder ohne Beschriftung',
      why: 'Screenreader-Nutzer wissen nicht, was sie in das Feld eintragen sollen. Auch die Spracheingabe kann das Feld nicht ansprechen.',
      fix: 'Jedem Feld ein <label for="…"> zuordnen. Ein Platzhaltertext ersetzt die Beschriftung nicht.',
    },
    en: {
      title: 'Form fields without a label',
      why: 'Screen reader users do not know what to enter. Voice control cannot target the field either.',
      fix: 'Associate a <label for="…"> with every field. Placeholder text does not replace a label.',
    },
  },
  'select-name': {
    audience: 'forms',
    de: {
      title: 'Auswahllisten ohne Beschriftung',
      why: 'Screenreader-Nutzer wissen nicht, was sie auswählen.',
      fix: 'Der Auswahlliste ein <label> zuordnen.',
    },
    en: {
      title: 'Select lists without a label',
      why: 'Screen reader users do not know what they are choosing.',
      fix: 'Associate a <label> with the select element.',
    },
  },
  'input-image-alt': {
    audience: 'screenreader',
    de: {
      title: 'Grafische Absende-Buttons ohne Alternativtext',
      why: 'Der Button wird nur als „Schaltfläche“ vorgelesen.',
      fix: 'Dem <input type="image"> ein alt-Attribut geben, das die Aktion beschreibt (z. B. „Suchen“).',
    },
    en: {
      title: 'Image buttons without alternative text',
      why: 'The button is only announced as “button”.',
      fix: 'Give the <input type="image"> an alt attribute describing the action (e.g. “Search”).',
    },
  },
  'html-has-lang': {
    audience: 'structure',
    de: {
      title: 'Sprache der Seite nicht angegeben',
      why: 'Screenreader lesen deutschen Text womöglich mit englischer Aussprache vor, das ist kaum verständlich.',
      fix: '<html lang="de"> (bzw. passende Sprache) setzen.',
    },
    en: {
      title: 'Page language not set',
      why: 'Screen readers may read the text with the wrong pronunciation, which is hard to understand.',
      fix: 'Set <html lang="en"> (or the matching language).',
    },
  },
  'html-lang-valid': {
    audience: 'structure',
    de: {
      title: 'Ungültige Sprachangabe',
      why: 'Mit einem ungültigen Sprachcode wählt der Screenreader keine passende Aussprache.',
      fix: 'Einen gültigen Sprachcode verwenden, z. B. lang="de" oder lang="de-DE".',
    },
    en: {
      title: 'Invalid page language',
      why: 'With an invalid language code the screen reader cannot pick the right pronunciation.',
      fix: 'Use a valid language code, e.g. lang="en" or lang="en-GB".',
    },
  },
  'valid-lang': {
    audience: 'structure',
    de: {
      title: 'Ungültige Sprachangabe in Textabschnitten',
      why: 'Fremdsprachige Abschnitte werden falsch ausgesprochen.',
      fix: 'Gültige Sprachcodes im lang-Attribut verwenden.',
    },
    en: {
      title: 'Invalid language on text passages',
      why: 'Passages in another language are pronounced incorrectly.',
      fix: 'Use valid language codes in the lang attribute.',
    },
  },
  'document-title': {
    audience: 'structure',
    de: {
      title: 'Seite ohne Titel',
      why: 'Der Seitentitel ist das Erste, was ein Screenreader vorliest, und hilft bei der Orientierung zwischen Tabs.',
      fix: 'Ein aussagekräftiges <title> setzen, z. B. „Kontakt – Firmenname“.',
    },
    en: {
      title: 'Page without a title',
      why: 'The page title is the first thing a screen reader announces and helps to tell tabs apart.',
      fix: 'Set a meaningful <title>, e.g. “Contact – Company name”.',
    },
  },
  'meta-viewport': {
    audience: 'vision',
    de: {
      title: 'Zoomen auf Mobilgeräten ist gesperrt',
      why: 'Menschen mit Sehschwäche können die Seite auf dem Smartphone nicht vergrößern.',
      fix: 'user-scalable=no und maximum-scale unter 2 aus dem Viewport-Meta-Tag entfernen.',
    },
    en: {
      title: 'Zooming is blocked on mobile devices',
      why: 'People with low vision cannot enlarge the page on their phone.',
      fix: 'Remove user-scalable=no and any maximum-scale below 2 from the viewport meta tag.',
    },
  },
  bypass: {
    audience: 'keyboard',
    de: {
      title: 'Keine Möglichkeit, die Navigation zu überspringen',
      why: 'Tastatur-Nutzer müssen auf jeder Seite erst durch alle Menüpunkte tabben, bevor sie zum Inhalt kommen.',
      fix: 'Einen „Zum Inhalt springen“-Link an den Anfang setzen und den Hauptbereich mit <main> auszeichnen.',
    },
    en: {
      title: 'No way to skip the navigation',
      why: 'Keyboard users have to tab through every menu item on every page before reaching the content.',
      fix: 'Add a “Skip to content” link at the start and mark up the main area with <main>.',
    },
  },
  'frame-title': {
    audience: 'screenreader',
    de: {
      title: 'Eingebettete Inhalte (iframes) ohne Titel',
      why: 'Screenreader-Nutzer wissen nicht, was im eingebetteten Bereich steckt (z. B. Karte, Video, Formular).',
      fix: 'Jedem <iframe> ein title-Attribut geben, z. B. title="Anfahrtskarte".',
    },
    en: {
      title: 'Embedded content (iframes) without a title',
      why: 'Screen reader users do not know what the embedded area contains (map, video, form …).',
      fix: 'Give every <iframe> a title attribute, e.g. title="Directions map".',
    },
  },
  'aria-hidden-focus': {
    audience: 'keyboard',
    de: {
      title: 'Versteckte Elemente sind per Tastatur erreichbar',
      why: 'Der Tastaturfokus landet auf Elementen, die der Screenreader nicht ankündigt. Nutzer verlieren die Orientierung.',
      fix: 'Elemente in aria-hidden-Bereichen aus der Tab-Reihenfolge nehmen (tabindex="-1" oder inert).',
    },
    en: {
      title: 'Hidden elements are reachable by keyboard',
      why: 'Keyboard focus lands on elements the screen reader does not announce. Users lose their bearings.',
      fix: 'Remove elements inside aria-hidden regions from the tab order (tabindex="-1" or inert).',
    },
  },
  'aria-required-attr': {
    audience: 'screenreader',
    de: {
      title: 'ARIA-Rollen mit fehlenden Pflichtangaben',
      why: 'Bedienelemente wie Schieberegler oder Checkboxen melden dem Screenreader keinen Zustand.',
      fix: 'Die für die Rolle vorgeschriebenen aria-Attribute ergänzen (z. B. aria-checked, aria-valuenow).',
    },
    en: {
      title: 'ARIA roles missing required attributes',
      why: 'Controls such as sliders or checkboxes do not report their state to the screen reader.',
      fix: 'Add the aria attributes required by the role (e.g. aria-checked, aria-valuenow).',
    },
  },
  'aria-valid-attr-value': {
    audience: 'screenreader',
    de: {
      title: 'Ungültige ARIA-Werte',
      why: 'Falsche ARIA-Angaben führen dazu, dass Screenreader Elemente falsch oder gar nicht ankündigen.',
      fix: 'ARIA-Attribute auf gültige Werte prüfen, z. B. verweisen aria-controls/aria-labelledby auf existierende IDs.',
    },
    en: {
      title: 'Invalid ARIA values',
      why: 'Wrong ARIA values make screen readers announce elements incorrectly or not at all.',
      fix: 'Check ARIA attributes for valid values, e.g. aria-controls/aria-labelledby must reference existing IDs.',
    },
  },
  'aria-valid-attr': {
    audience: 'screenreader',
    de: {
      title: 'Unbekannte ARIA-Attribute',
      why: 'Tippfehler in ARIA-Attributen werden ignoriert, die gewünschte Information kommt nicht an.',
      fix: 'Schreibweise der aria-Attribute korrigieren.',
    },
    en: {
      title: 'Unknown ARIA attributes',
      why: 'Misspelled ARIA attributes are ignored, so the intended information never arrives.',
      fix: 'Correct the spelling of the aria attributes.',
    },
  },
  'aria-roles': {
    audience: 'screenreader',
    de: {
      title: 'Ungültige ARIA-Rollen',
      why: 'Screenreader verstehen die Funktion des Elements nicht.',
      fix: 'Nur gültige Rollen verwenden, idealerweise native HTML-Elemente (button, nav …) statt role-Attributen.',
    },
    en: {
      title: 'Invalid ARIA roles',
      why: 'Screen readers do not understand what the element does.',
      fix: 'Use valid roles only; better still, use native HTML elements (button, nav …) instead of role attributes.',
    },
  },
  'aria-allowed-attr': {
    audience: 'screenreader',
    de: {
      title: 'ARIA-Attribute an falscher Stelle',
      why: 'Das Attribut passt nicht zur Rolle des Elements und wird ignoriert oder verwirrt.',
      fix: 'Nur ARIA-Attribute verwenden, die für die jeweilige Rolle erlaubt sind.',
    },
    en: {
      title: 'ARIA attributes in the wrong place',
      why: 'The attribute does not fit the element’s role and is ignored or confusing.',
      fix: 'Only use ARIA attributes that are allowed for the element’s role.',
    },
  },
  'aria-prohibited-attr': {
    audience: 'screenreader',
    de: {
      title: 'Verbotene ARIA-Beschriftungen',
      why: 'aria-label an Elementen ohne passende Rolle (z. B. <div>, <span>) wird von Screenreadern oft nicht vorgelesen.',
      fix: 'Beschriftung als sichtbaren Text umsetzen oder dem Element eine passende Rolle geben.',
    },
    en: {
      title: 'Prohibited ARIA labels',
      why: 'aria-label on elements without a suitable role (e.g. <div>, <span>) is often not read out.',
      fix: 'Provide the label as visible text or give the element a suitable role.',
    },
  },
  'aria-input-field-name': {
    audience: 'forms',
    de: {
      title: 'Eingabefelder (ARIA) ohne Beschriftung',
      why: 'Eigene Eingabe-Komponenten (Combobox, Suche …) werden ohne Namen vorgelesen.',
      fix: 'Per aria-label oder aria-labelledby eine Beschriftung vergeben.',
    },
    en: {
      title: 'ARIA input fields without a label',
      why: 'Custom input components (combobox, search …) are announced without a name.',
      fix: 'Provide a label via aria-label or aria-labelledby.',
    },
  },
  'aria-command-name': {
    audience: 'screenreader',
    de: {
      title: 'Bedienelemente (ARIA) ohne Beschriftung',
      why: 'Eigene Buttons, Links oder Menüpunkte werden ohne Namen vorgelesen.',
      fix: 'Sichtbaren Text, aria-label oder aria-labelledby ergänzen.',
    },
    en: {
      title: 'ARIA controls without a label',
      why: 'Custom buttons, links or menu items are announced without a name.',
      fix: 'Add visible text, aria-label or aria-labelledby.',
    },
  },
  'aria-required-children': {
    audience: 'screenreader',
    de: {
      title: 'ARIA-Strukturen unvollständig',
      why: 'Listen, Menüs oder Tabs ohne die vorgesehenen Unterelemente werden falsch vorgelesen.',
      fix: 'Erforderliche Kind-Rollen ergänzen (z. B. role="tab" innerhalb von role="tablist").',
    },
    en: {
      title: 'Incomplete ARIA structures',
      why: 'Lists, menus or tabs without the expected child elements are announced incorrectly.',
      fix: 'Add the required child roles (e.g. role="tab" inside role="tablist").',
    },
  },
  'aria-required-parent': {
    audience: 'screenreader',
    de: {
      title: 'ARIA-Elemente ohne passendes Elternelement',
      why: 'Ein Menüpunkt oder Tab steht nicht im vorgesehenen Container und wird falsch vorgelesen.',
      fix: 'Elemente in den passenden Container setzen (z. B. role="menuitem" in role="menu").',
    },
    en: {
      title: 'ARIA elements without the required parent',
      why: 'A menu item or tab is not inside its expected container and is announced incorrectly.',
      fix: 'Place elements in the right container (e.g. role="menuitem" inside role="menu").',
    },
  },
  'nested-interactive': {
    audience: 'keyboard',
    de: {
      title: 'Verschachtelte Bedienelemente',
      why: 'Ein Button im Link (oder umgekehrt) ist per Tastatur und Screenreader nicht zuverlässig bedienbar.',
      fix: 'Bedienelemente nicht ineinander verschachteln.',
    },
    en: {
      title: 'Nested interactive controls',
      why: 'A button inside a link (or vice versa) cannot be operated reliably by keyboard or screen reader.',
      fix: 'Do not nest interactive controls inside each other.',
    },
  },
  list: {
    audience: 'structure',
    de: {
      title: 'Fehlerhaft aufgebaute Listen',
      why: 'Screenreader können die Anzahl der Einträge nicht ansagen, die Struktur geht verloren.',
      fix: 'In <ul>/<ol> nur <li>-Elemente (sowie <script>/<template>) direkt verwenden.',
    },
    en: {
      title: 'Incorrectly structured lists',
      why: 'Screen readers cannot announce the number of items, the structure gets lost.',
      fix: 'Only use <li> elements (plus <script>/<template>) as direct children of <ul>/<ol>.',
    },
  },
  listitem: {
    audience: 'structure',
    de: {
      title: 'Listeneinträge außerhalb einer Liste',
      why: 'Screenreader erkennen die Einträge nicht als zusammengehörige Liste.',
      fix: '<li>-Elemente immer in <ul> oder <ol> einschließen.',
    },
    en: {
      title: 'List items outside a list',
      why: 'Screen readers do not recognise the items as a list.',
      fix: 'Always wrap <li> elements in <ul> or <ol>.',
    },
  },
  'definition-list': {
    audience: 'structure',
    de: {
      title: 'Fehlerhaft aufgebaute Definitionslisten',
      why: 'Begriffe und Erklärungen werden nicht korrekt zugeordnet.',
      fix: 'In <dl> nur <dt>/<dd> (oder <div> mit diesen) verwenden.',
    },
    en: {
      title: 'Incorrectly structured definition lists',
      why: 'Terms and descriptions are not associated correctly.',
      fix: 'Only use <dt>/<dd> (or <div> containing them) inside <dl>.',
    },
  },
  'duplicate-id-aria': {
    audience: 'screenreader',
    de: {
      title: 'Doppelte IDs bei Beschriftungen',
      why: 'Verweisen Beschriftungen auf doppelte IDs, liest der Screenreader eventuell die falsche Beschriftung vor.',
      fix: 'IDs, die in aria-labelledby, aria-describedby oder <label for> verwendet werden, eindeutig machen.',
    },
    en: {
      title: 'Duplicate IDs used for labels',
      why: 'If labels point to duplicate IDs, the screen reader may read out the wrong label.',
      fix: 'Make IDs referenced by aria-labelledby, aria-describedby or <label for> unique.',
    },
  },
  'autocomplete-valid': {
    audience: 'forms',
    de: {
      title: 'Ungültige autocomplete-Angaben',
      why: 'Browser und Hilfsmittel können persönliche Daten (Name, Adresse) nicht automatisch ausfüllen. Das hilft besonders Menschen mit motorischen oder kognitiven Einschränkungen.',
      fix: 'Gültige Werte verwenden, z. B. autocomplete="given-name", "email", "postal-code".',
    },
    en: {
      title: 'Invalid autocomplete values',
      why: 'Browsers and assistive technology cannot fill in personal data (name, address) automatically, which especially helps people with motor or cognitive impairments.',
      fix: 'Use valid values, e.g. autocomplete="given-name", "email", "postal-code".',
    },
  },
  'form-field-multiple-labels': {
    audience: 'forms',
    de: {
      title: 'Formularfelder mit mehreren Beschriftungen',
      why: 'Screenreader lesen nur eine oder alle Beschriftungen in unklarer Reihenfolge vor.',
      fix: 'Jedem Feld genau ein <label> zuordnen, Zusatzinfos mit aria-describedby verknüpfen.',
    },
    en: {
      title: 'Form fields with multiple labels',
      why: 'Screen readers read only one, or all of them in an unclear order.',
      fix: 'Associate exactly one <label> per field; link extra info via aria-describedby.',
    },
  },
  'target-size': {
    audience: 'keyboard',
    de: {
      title: 'Zu kleine Klickflächen',
      why: 'Menschen mit Zittern oder eingeschränkter Feinmotorik treffen kleine Buttons und Links schwer.',
      fix: 'Klickflächen mindestens 24 × 24 px groß machen oder genügend Abstand zwischen ihnen lassen.',
    },
    en: {
      title: 'Click targets too small',
      why: 'People with tremors or limited fine motor control struggle to hit small buttons and links.',
      fix: 'Make targets at least 24 × 24 px or leave enough space around them.',
    },
  },
  'scrollable-region-focusable': {
    audience: 'keyboard',
    de: {
      title: 'Scrollbereiche nicht per Tastatur bedienbar',
      why: 'Tastatur-Nutzer können den Inhalt des Scrollbereichs nicht erreichen.',
      fix: 'Dem Bereich tabindex="0" und eine Beschriftung geben oder fokussierbare Elemente darin platzieren.',
    },
    en: {
      title: 'Scrollable regions not keyboard accessible',
      why: 'Keyboard users cannot reach the content of the scrollable area.',
      fix: 'Give the area tabindex="0" and a label, or place focusable elements inside it.',
    },
  },
  'svg-img-alt': {
    audience: 'screenreader',
    de: {
      title: 'Grafiken (SVG) ohne Alternativtext',
      why: 'Inhaltlich wichtige Grafiken bleiben für blinde Menschen unsichtbar.',
      fix: 'SVG mit role="img" eine Beschriftung per aria-label oder <title> geben.',
    },
    en: {
      title: 'Graphics (SVG) without alternative text',
      why: 'Meaningful graphics remain invisible to blind users.',
      fix: 'Give SVGs with role="img" a label via aria-label or <title>.',
    },
  },
  'role-img-alt': {
    audience: 'screenreader',
    de: {
      title: 'Bild-Elemente ohne Alternativtext',
      why: 'Elemente mit role="img" werden ohne Beschreibung vorgelesen.',
      fix: 'aria-label oder aria-labelledby ergänzen.',
    },
    en: {
      title: 'Image elements without alternative text',
      why: 'Elements with role="img" are announced without a description.',
      fix: 'Add aria-label or aria-labelledby.',
    },
  },
  'object-alt': {
    audience: 'screenreader',
    de: {
      title: 'Eingebettete Objekte ohne Alternativtext',
      why: 'Der Inhalt des <object> ist für Screenreader nicht erfassbar.',
      fix: 'Eine Textalternative ergänzen (aria-label, title oder Fallback-Inhalt).',
    },
    en: {
      title: 'Embedded objects without alternative text',
      why: 'Screen readers cannot access the content of the <object>.',
      fix: 'Add a text alternative (aria-label, title or fallback content).',
    },
  },
  'link-in-text-block': {
    audience: 'vision',
    de: {
      title: 'Links im Fließtext nur durch Farbe erkennbar',
      why: 'Menschen mit Farbsehschwäche erkennen die Links im Text nicht.',
      fix: 'Links unterstreichen oder anders als nur über die Farbe hervorheben.',
    },
    en: {
      title: 'Links in text only distinguishable by colour',
      why: 'People with colour vision deficiency cannot spot the links.',
      fix: 'Underline links or distinguish them by something other than colour.',
    },
  },
  'no-autoplay-audio': {
    audience: 'media',
    de: {
      title: 'Automatisch abgespielter Ton',
      why: 'Der Ton überlagert die Sprachausgabe des Screenreaders. Blinde Nutzer finden den Stopp-Knopf dann kaum noch.',
      fix: 'Kein Autoplay mit Ton, oder eine sofort erreichbare Pause-/Stumm-Funktion anbieten.',
    },
    en: {
      title: 'Audio plays automatically',
      why: 'The sound drowns out the screen reader, making it hard for blind users to find the stop button.',
      fix: 'Do not autoplay sound, or provide an immediately reachable pause/mute control.',
    },
  },
  'video-caption': {
    audience: 'media',
    de: {
      title: 'Videos ohne Untertitel',
      why: 'Gehörlose und schwerhörige Menschen verstehen den gesprochenen Inhalt nicht.',
      fix: 'Untertitel per <track kind="captions"> bereitstellen.',
    },
    en: {
      title: 'Videos without captions',
      why: 'Deaf and hard-of-hearing people cannot follow the spoken content.',
      fix: 'Provide captions via <track kind="captions">.',
    },
  },
  'meta-refresh': {
    audience: 'structure',
    de: {
      title: 'Seite lädt automatisch neu oder leitet weiter',
      why: 'Nutzer werden beim Lesen unterbrochen und verlieren ihre Position.',
      fix: 'Kein zeitgesteuertes meta refresh verwenden.',
    },
    en: {
      title: 'Page refreshes or redirects automatically',
      why: 'Users are interrupted while reading and lose their place.',
      fix: 'Do not use timed meta refresh.',
    },
  },
  'td-headers-attr': {
    audience: 'structure',
    de: {
      title: 'Fehlerhafte Tabellen-Zuordnungen',
      why: 'Screenreader können Zellen nicht den richtigen Überschriften zuordnen.',
      fix: 'headers-Attribute nur auf Überschriftenzellen derselben Tabelle verweisen lassen.',
    },
    en: {
      title: 'Broken table header associations',
      why: 'Screen readers cannot associate cells with the right headers.',
      fix: 'Only reference header cells of the same table in headers attributes.',
    },
  },
  'th-has-data-cells': {
    audience: 'structure',
    de: {
      title: 'Tabellenüberschriften ohne Daten',
      why: 'Die Tabellenstruktur ist für Screenreader nicht nachvollziehbar.',
      fix: 'Jede <th> muss Datenzellen beschreiben; Layout-Tabellen vermeiden.',
    },
    en: {
      title: 'Table headers without data cells',
      why: 'Screen readers cannot follow the table structure.',
      fix: 'Every <th> must describe data cells; avoid layout tables.',
    },
  },
  'css-orientation-lock': {
    audience: 'vision',
    de: {
      title: 'Bildschirmausrichtung ist festgelegt',
      why: 'Wer das Tablet z. B. am Rollstuhl fest montiert hat, kann die Seite nicht nutzen.',
      fix: 'Inhalte im Hoch- und im Querformat anzeigen.',
    },
    en: {
      title: 'Screen orientation is locked',
      why: 'People with a tablet mounted in a fixed position (e.g. on a wheelchair) cannot use the page.',
      fix: 'Display content in both portrait and landscape.',
    },
  },
  'avoid-inline-spacing': {
    audience: 'vision',
    de: {
      title: 'Textabstände lassen sich nicht anpassen',
      why: 'Menschen mit Leseschwäche können sich keinen größeren Zeilen- oder Buchstabenabstand einstellen.',
      fix: 'line-height, letter-spacing und word-spacing nicht per Inline-Style mit !important festlegen.',
    },
    en: {
      title: 'Text spacing cannot be adjusted',
      why: 'People with reading difficulties cannot increase line or letter spacing.',
      fix: 'Do not set line-height, letter-spacing or word-spacing via inline styles with !important.',
    },
  },
  'label-content-name-mismatch': {
    audience: 'keyboard',
    de: {
      title: 'Sichtbare Beschriftung weicht vom Namen ab',
      why: 'Spracheingabe-Nutzer sagen „Klicke Absenden“, aber der Button heißt intern anders.',
      fix: 'Der zugängliche Name muss den sichtbaren Text enthalten.',
    },
    en: {
      title: 'Visible label differs from the accessible name',
      why: 'Voice control users say “click Submit”, but the button is named differently internally.',
      fix: 'The accessible name must contain the visible text.',
    },
  },
  // Best practices (not strictly required by WCAG, but strongly recommended)
  region: {
    audience: 'structure',
    de: {
      title: 'Inhalte außerhalb von Seitenbereichen',
      why: 'Screenreader-Nutzer springen über Bereiche wie Navigation, Hauptinhalt und Fußzeile. Inhalte außerhalb davon übersehen sie leicht.',
      fix: 'Alle Inhalte in <header>, <nav>, <main>, <footer> o. Ä. einordnen.',
    },
    en: {
      title: 'Content outside of page regions',
      why: 'Screen reader users jump between regions such as navigation, main content and footer, and easily miss content outside of them.',
      fix: 'Place all content inside <header>, <nav>, <main>, <footer> or similar.',
    },
  },
  'landmark-one-main': {
    audience: 'structure',
    de: {
      title: 'Kein Hauptbereich (<main>) ausgezeichnet',
      why: 'Screenreader-Nutzer können nicht direkt zum Hauptinhalt springen.',
      fix: 'Den Hauptinhalt in genau ein <main>-Element setzen.',
    },
    en: {
      title: 'No main region (<main>)',
      why: 'Screen reader users cannot jump straight to the main content.',
      fix: 'Wrap the main content in exactly one <main> element.',
    },
  },
  'page-has-heading-one': {
    audience: 'structure',
    de: {
      title: 'Keine Hauptüberschrift (h1)',
      why: 'Viele Screenreader-Nutzer springen zuerst zur h1, um zu erfahren, worum es auf der Seite geht.',
      fix: 'Eine aussagekräftige <h1> pro Seite verwenden.',
    },
    en: {
      title: 'No main heading (h1)',
      why: 'Many screen reader users jump to the h1 first to find out what the page is about.',
      fix: 'Use one meaningful <h1> per page.',
    },
  },
  'heading-order': {
    audience: 'structure',
    de: {
      title: 'Überschriften-Ebenen werden übersprungen',
      why: 'Die Gliederung wirkt lückenhaft (z. B. h2 → h4). Screenreader-Nutzer navigieren über Überschriften.',
      fix: 'Überschriften-Ebenen lückenlos verwenden. Die Optik über CSS steuern, nicht über die Ebene.',
    },
    en: {
      title: 'Heading levels are skipped',
      why: 'The outline has gaps (e.g. h2 → h4). Screen reader users navigate by headings.',
      fix: 'Use heading levels without gaps; control the appearance with CSS, not the level.',
    },
  },
  'empty-heading': {
    audience: 'structure',
    de: {
      title: 'Leere Überschriften',
      why: 'Screenreader kündigen eine Überschrift ohne Inhalt an, das verwirrt.',
      fix: 'Leere Überschriften entfernen oder mit Text füllen.',
    },
    en: {
      title: 'Empty headings',
      why: 'Screen readers announce a heading without content, which is confusing.',
      fix: 'Remove empty headings or fill them with text.',
    },
  },
  'landmark-unique': {
    audience: 'structure',
    de: {
      title: 'Gleichartige Seitenbereiche nicht unterscheidbar',
      why: 'Mehrere Navigationen ohne eigene Beschriftung lassen sich nicht auseinanderhalten.',
      fix: 'Gleichartigen Bereichen ein eindeutiges aria-label geben (z. B. „Hauptmenü“, „Footer-Menü“).',
    },
    en: {
      title: 'Similar regions cannot be told apart',
      why: 'Several navigations without their own label cannot be distinguished.',
      fix: 'Give similar regions a unique aria-label (e.g. “Main menu”, “Footer menu”).',
    },
  },
  'image-redundant-alt': {
    audience: 'screenreader',
    de: {
      title: 'Doppelt vorgelesene Bildtexte',
      why: 'Alternativtext und daneben stehender Text sind identisch und werden zweimal vorgelesen.',
      fix: 'Bei Bildern neben gleichlautendem Text alt="" verwenden.',
    },
    en: {
      title: 'Image text read out twice',
      why: 'The alternative text repeats the adjacent text, so it is announced twice.',
      fix: 'Use alt="" for images next to identical text.',
    },
  },
  tabindex: {
    audience: 'keyboard',
    de: {
      title: 'Positive tabindex-Werte',
      why: 'Die Tab-Reihenfolge weicht von der sichtbaren Reihenfolge ab. Tastatur-Nutzer springen scheinbar wild über die Seite.',
      fix: 'Nur tabindex="0" oder "-1" verwenden und die Reihenfolge über die HTML-Struktur steuern.',
    },
    en: {
      title: 'Positive tabindex values',
      why: 'The tab order differs from the visual order; keyboard users seem to jump around the page.',
      fix: 'Only use tabindex="0" or "-1" and control the order through the HTML structure.',
    },
  },
  'landmark-no-duplicate-banner': {
    audience: 'structure',
    de: {
      title: 'Mehrere Kopfbereiche (banner)',
      why: 'Screenreader-Nutzer finden den eigentlichen Seitenkopf nicht eindeutig.',
      fix: 'Nur ein <header> auf oberster Ebene verwenden.',
    },
    en: {
      title: 'Multiple banner regions',
      why: 'Screen reader users cannot identify the actual page header.',
      fix: 'Use only one top-level <header>.',
    },
  },
  'landmark-no-duplicate-contentinfo': {
    audience: 'structure',
    de: {
      title: 'Mehrere Fußbereiche (contentinfo)',
      why: 'Screenreader-Nutzer finden den eigentlichen Seitenfuß nicht eindeutig.',
      fix: 'Nur ein <footer> auf oberster Ebene verwenden.',
    },
    en: {
      title: 'Multiple contentinfo regions',
      why: 'Screen reader users cannot identify the actual page footer.',
      fix: 'Use only one top-level <footer>.',
    },
  },
  'skip-link': {
    audience: 'keyboard',
    de: {
      title: 'Sprunglink führt ins Leere',
      why: 'Der „Zum Inhalt“-Link verweist auf ein Ziel, das es nicht gibt.',
      fix: 'Das Linkziel (z. B. id="main") auf der Seite anlegen.',
    },
    en: {
      title: 'Skip link points nowhere',
      why: 'The “skip to content” link points to a target that does not exist.',
      fix: 'Add the link target (e.g. id="main") to the page.',
    },
  },
  // Custom BFSG checks
  'bfsg-accessibility-statement': {
    audience: 'legal',
    de: {
      title: 'Kein Link zur Barrierefreiheitserklärung gefunden',
      passTitle: 'Link zur Barrierefreiheitserklärung gefunden',
      why: 'Wer Dienstleistungen nach dem BFSG anbietet, muss Informationen zur Barrierefreiheit veröffentlichen (§ 14 BFSG, Anlage 3), in der Regel als Barrierefreiheitserklärung.',
      fix: 'Eine Barrierefreiheitserklärung erstellen und von jeder Seite aus verlinken, üblicherweise im Footer. Falls sie anders benannt ist, bitte manuell prüfen.',
    },
    en: {
      title: 'No link to an accessibility statement found',
      passTitle: 'Link to an accessibility statement found',
      why: 'Providers of services covered by the BFSG must publish accessibility information (§ 14 BFSG, Annex 3), usually as an accessibility statement.',
      fix: 'Create an accessibility statement and link it from every page, typically in the footer. If it is named differently, please check manually.',
    },
  },
  'bfsg-generic-link-text': {
    audience: 'screenreader',
    de: {
      title: 'Nichtssagende Linktexte („hier“, „mehr“)',
      passTitle: 'Keine nichtssagenden Linktexte gefunden',
      why: 'Screenreader-Nutzer lassen sich oft alle Links auflisten. „Mehr“ oder „hier“ sagt dann nicht, wohin der Link führt.',
      fix: 'Linkziel im Text nennen („Mehr über unsere Preise“) oder per aria-label ergänzen. Prüfen Sie, ob der Zusammenhang den Zweck ausreichend erklärt.',
    },
    en: {
      title: 'Non-descriptive link texts (“here”, “more”)',
      passTitle: 'No non-descriptive link texts found',
      why: 'Screen reader users often list all links. “More” or “here” does not say where a link goes.',
      fix: 'Name the destination in the text (“More about our pricing”) or add it via aria-label. Check whether the context explains the purpose sufficiently.',
    },
  },
  'bfsg-pdf-documents': {
    audience: 'legal',
    de: {
      title: 'Verlinkte PDF-Dokumente',
      passTitle: 'Keine verlinkten PDF-Dokumente',
      why: 'Auch herunterladbare Dokumente (AGB, Formulare, Produktinfos) müssen barrierefrei sein. PDFs sind das häufig nicht.',
      fix: 'Prüfen, ob die PDFs getaggt sind (z. B. mit PAC), oder die Inhalte als HTML-Seite anbieten.',
    },
    en: {
      title: 'Linked PDF documents',
      passTitle: 'No linked PDF documents',
      why: 'Downloadable documents (terms, forms, product info) must be accessible too, and PDFs often are not.',
      fix: 'Check whether the PDFs are tagged (e.g. with PAC) or offer the content as an HTML page.',
    },
  },
  'bfsg-autoplay-video': {
    audience: 'media',
    de: {
      title: 'Automatisch startende Videos ohne Steuerung',
      passTitle: 'Keine automatisch startenden Videos ohne Steuerung',
      why: 'Bewegte Inhalte lenken ab, z. B. Menschen mit ADHS oder Konzentrationsstörungen. Läuft das Video länger als 5 Sekunden, muss es sich anhalten lassen.',
      fix: 'Einen sichtbaren Pause-Button anbieten oder auf Autoplay verzichten. prefers-reduced-motion berücksichtigen.',
    },
    en: {
      title: 'Auto-playing videos without controls',
      passTitle: 'No auto-playing videos without controls',
      why: 'Moving content distracts, e.g. people with ADHD or attention disorders. If it runs longer than 5 seconds, it must be possible to pause it.',
      fix: 'Provide a visible pause button or do not autoplay. Respect prefers-reduced-motion.',
    },
  },
  'bfsg-captcha': {
    audience: 'forms',
    de: {
      title: 'CAPTCHA gefunden',
      passTitle: 'Kein CAPTCHA gefunden',
      why: 'Bild- oder Rätsel-CAPTCHAs sind für blinde Menschen und Menschen mit kognitiven Einschränkungen oft unlösbar.',
      fix: 'Prüfen, ob es eine barrierefreie Alternative gibt (z. B. Audio-CAPTCHA, unsichtbare Prüfung, Honeypot).',
    },
    en: {
      title: 'CAPTCHA found',
      passTitle: 'No CAPTCHA found',
      why: 'Image or puzzle CAPTCHAs are often impossible for blind people and people with cognitive impairments.',
      fix: 'Check that an accessible alternative exists (audio CAPTCHA, invisible check, honeypot).',
    },
  },
  'bfsg-placeholder-label': {
    audience: 'forms',
    de: {
      title: 'Formularfelder nur mit Platzhaltertext',
      passTitle: 'Keine Formularfelder, die nur einen Platzhalter haben',
      why: 'Der Platzhalter verschwindet beim Tippen, danach weiß niemand mehr, was ins Feld gehört. Er hat oft auch zu wenig Kontrast.',
      fix: 'Eine sichtbare <label> ergänzen. Der Platzhalter darf zusätzlich ein Beispiel zeigen.',
    },
    en: {
      title: 'Form fields with placeholder text only',
      passTitle: 'No form fields relying on placeholder text only',
      why: 'The placeholder disappears while typing, and then nobody knows what belongs in the field. It often has too little contrast as well.',
      fix: 'Add a visible <label>. The placeholder may additionally show an example.',
    },
  },
};

const CATEGORY_AUDIENCE: Record<string, Audience> = {
  'cat.text-alternatives': 'screenreader',
  'cat.aria': 'screenreader',
  'cat.name-role-value': 'screenreader',
  'cat.keyboard': 'keyboard',
  'cat.color': 'vision',
  'cat.sensory-and-visual-cues': 'vision',
  'cat.forms': 'forms',
  'cat.time-and-media': 'media',
  'cat.structure': 'structure',
  'cat.semantics': 'structure',
  'cat.tables': 'structure',
  'cat.parsing': 'structure',
  'cat.language': 'structure',
};

export function audienceOf(rule: Pick<RuleResult, 'id' | 'tags'>): Audience {
  const copy = RULE_TEXTS[rule.id];
  if (copy) return copy.audience;
  for (const tag of rule.tags) {
    if (CATEGORY_AUDIENCE[tag]) return CATEGORY_AUDIENCE[tag];
  }
  return 'structure';
}

/** Plain-language text for a rule, falling back to axe-core's own texts. */
export function ruleText(rule: Pick<RuleResult, 'id' | 'help' | 'description'>, locale: Locale): RuleText & { plain: boolean } {
  const copy = RULE_TEXTS[rule.id];
  if (copy) return { ...copy[locale], plain: true };
  return { title: rule.help || rule.id, why: rule.description, fix: '', plain: false };
}

/**
 * Title for a rule result. Plain titles describe the problem, so for passed
 * axe-core rules the neutral axe-core title ("Images must have alternative
 * text") reads better.
 */
export function ruleTitle(rule: Pick<RuleResult, 'id' | 'help' | 'description' | 'outcome'>, locale: Locale): string {
  const text = ruleText(rule, locale);
  if (rule.outcome === 'pass') return text.passTitle ?? (rule.help || text.title);
  return text.title;
}
