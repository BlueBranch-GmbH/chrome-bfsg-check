import type { Locale } from './types';

export interface SuccessCriterion {
  id: string;
  level: 'A' | 'AA';
  /** WCAG version that introduced the criterion. */
  since: '2.0' | '2.1' | '2.2';
  name: Record<Locale, string>;
}

/**
 * WCAG success criteria of level A and AA. The BFSG refers to EN 301 549,
 * which requires WCAG 2.1 AA for websites (clause 9). German names follow the
 * authorized German translation of WCAG 2.1 / 2.2.
 */
const CRITERIA: SuccessCriterion[] = [
  { id: '1.1.1', level: 'A', since: '2.0', name: { de: 'Nicht-Text-Inhalt', en: 'Non-text Content' } },
  { id: '1.2.1', level: 'A', since: '2.0', name: { de: 'Reine Audio- und reine Videoinhalte (aufgezeichnet)', en: 'Audio-only and Video-only (Prerecorded)' } },
  { id: '1.2.2', level: 'A', since: '2.0', name: { de: 'Untertitel (aufgezeichnet)', en: 'Captions (Prerecorded)' } },
  { id: '1.2.3', level: 'A', since: '2.0', name: { de: 'Audiodeskription oder Medienalternative (aufgezeichnet)', en: 'Audio Description or Media Alternative (Prerecorded)' } },
  { id: '1.2.4', level: 'AA', since: '2.0', name: { de: 'Untertitel (live)', en: 'Captions (Live)' } },
  { id: '1.2.5', level: 'AA', since: '2.0', name: { de: 'Audiodeskription (aufgezeichnet)', en: 'Audio Description (Prerecorded)' } },
  { id: '1.3.1', level: 'A', since: '2.0', name: { de: 'Info und Beziehungen', en: 'Info and Relationships' } },
  { id: '1.3.2', level: 'A', since: '2.0', name: { de: 'Bedeutungstragende Reihenfolge', en: 'Meaningful Sequence' } },
  { id: '1.3.3', level: 'A', since: '2.0', name: { de: 'Sensorische Eigenschaften', en: 'Sensory Characteristics' } },
  { id: '1.3.4', level: 'AA', since: '2.1', name: { de: 'Ausrichtung', en: 'Orientation' } },
  { id: '1.3.5', level: 'AA', since: '2.1', name: { de: 'Bestimmung des Zwecks einer Eingabe', en: 'Identify Input Purpose' } },
  { id: '1.4.1', level: 'A', since: '2.0', name: { de: 'Benutzung von Farbe', en: 'Use of Color' } },
  { id: '1.4.2', level: 'A', since: '2.0', name: { de: 'Audio-Steuerelement', en: 'Audio Control' } },
  { id: '1.4.3', level: 'AA', since: '2.0', name: { de: 'Kontrast (Minimum)', en: 'Contrast (Minimum)' } },
  { id: '1.4.4', level: 'AA', since: '2.0', name: { de: 'Textgröße ändern', en: 'Resize Text' } },
  { id: '1.4.5', level: 'AA', since: '2.0', name: { de: 'Bilder eines Textes', en: 'Images of Text' } },
  { id: '1.4.10', level: 'AA', since: '2.1', name: { de: 'Umbruch', en: 'Reflow' } },
  { id: '1.4.11', level: 'AA', since: '2.1', name: { de: 'Nicht-Text-Kontrast', en: 'Non-text Contrast' } },
  { id: '1.4.12', level: 'AA', since: '2.1', name: { de: 'Textabstand', en: 'Text Spacing' } },
  { id: '1.4.13', level: 'AA', since: '2.1', name: { de: 'Eingeblendete Inhalte bei Hover oder Fokus', en: 'Content on Hover or Focus' } },
  { id: '2.1.1', level: 'A', since: '2.0', name: { de: 'Tastatur', en: 'Keyboard' } },
  { id: '2.1.2', level: 'A', since: '2.0', name: { de: 'Keine Tastaturfalle', en: 'No Keyboard Trap' } },
  { id: '2.1.4', level: 'A', since: '2.1', name: { de: 'Tastaturkurzbefehle', en: 'Character Key Shortcuts' } },
  { id: '2.2.1', level: 'A', since: '2.0', name: { de: 'Zeitvorgaben anpassbar', en: 'Timing Adjustable' } },
  { id: '2.2.2', level: 'A', since: '2.0', name: { de: 'Pausieren, beenden, ausblenden', en: 'Pause, Stop, Hide' } },
  { id: '2.3.1', level: 'A', since: '2.0', name: { de: 'Grenzwert von dreimaligem Blitzen oder weniger', en: 'Three Flashes or Below Threshold' } },
  { id: '2.4.1', level: 'A', since: '2.0', name: { de: 'Blöcke umgehen', en: 'Bypass Blocks' } },
  { id: '2.4.2', level: 'A', since: '2.0', name: { de: 'Seite mit Titel versehen', en: 'Page Titled' } },
  { id: '2.4.3', level: 'A', since: '2.0', name: { de: 'Fokus-Reihenfolge', en: 'Focus Order' } },
  { id: '2.4.4', level: 'A', since: '2.0', name: { de: 'Linkzweck (im Kontext)', en: 'Link Purpose (In Context)' } },
  { id: '2.4.5', level: 'AA', since: '2.0', name: { de: 'Verschiedene Methoden', en: 'Multiple Ways' } },
  { id: '2.4.6', level: 'AA', since: '2.0', name: { de: 'Überschriften und Beschriftungen', en: 'Headings and Labels' } },
  { id: '2.4.7', level: 'AA', since: '2.0', name: { de: 'Fokus sichtbar', en: 'Focus Visible' } },
  { id: '2.4.11', level: 'AA', since: '2.2', name: { de: 'Fokus nicht verdeckt (Minimum)', en: 'Focus Not Obscured (Minimum)' } },
  { id: '2.5.1', level: 'A', since: '2.1', name: { de: 'Zeigergesten', en: 'Pointer Gestures' } },
  { id: '2.5.2', level: 'A', since: '2.1', name: { de: 'Zeigerabbruch', en: 'Pointer Cancellation' } },
  { id: '2.5.3', level: 'A', since: '2.1', name: { de: 'Beschriftung im Namen', en: 'Label in Name' } },
  { id: '2.5.4', level: 'A', since: '2.1', name: { de: 'Betätigung durch Bewegung', en: 'Motion Actuation' } },
  { id: '2.5.7', level: 'AA', since: '2.2', name: { de: 'Ziehbewegungen', en: 'Dragging Movements' } },
  { id: '2.5.8', level: 'AA', since: '2.2', name: { de: 'Zielgröße (Minimum)', en: 'Target Size (Minimum)' } },
  { id: '3.1.1', level: 'A', since: '2.0', name: { de: 'Sprache der Seite', en: 'Language of Page' } },
  { id: '3.1.2', level: 'AA', since: '2.0', name: { de: 'Sprache von Teilen', en: 'Language of Parts' } },
  { id: '3.2.1', level: 'A', since: '2.0', name: { de: 'Bei Fokus', en: 'On Focus' } },
  { id: '3.2.2', level: 'A', since: '2.0', name: { de: 'Bei Eingabe', en: 'On Input' } },
  { id: '3.2.3', level: 'AA', since: '2.0', name: { de: 'Konsistente Navigation', en: 'Consistent Navigation' } },
  { id: '3.2.4', level: 'AA', since: '2.0', name: { de: 'Konsistente Erkennung', en: 'Consistent Identification' } },
  { id: '3.2.6', level: 'A', since: '2.2', name: { de: 'Konsistente Hilfe', en: 'Consistent Help' } },
  { id: '3.3.1', level: 'A', since: '2.0', name: { de: 'Fehlererkennung', en: 'Error Identification' } },
  { id: '3.3.2', level: 'A', since: '2.0', name: { de: 'Beschriftungen oder Anweisungen', en: 'Labels or Instructions' } },
  { id: '3.3.3', level: 'AA', since: '2.0', name: { de: 'Fehlerempfehlung', en: 'Error Suggestion' } },
  { id: '3.3.4', level: 'AA', since: '2.0', name: { de: 'Fehlervermeidung (rechtlich, finanziell, Daten)', en: 'Error Prevention (Legal, Financial, Data)' } },
  { id: '3.3.7', level: 'A', since: '2.2', name: { de: 'Redundante Eingaben', en: 'Redundant Entry' } },
  { id: '3.3.8', level: 'AA', since: '2.2', name: { de: 'Barrierefreie Authentifizierung (Minimum)', en: 'Accessible Authentication (Minimum)' } },
  { id: '4.1.1', level: 'A', since: '2.0', name: { de: 'Syntaxanalyse', en: 'Parsing' } },
  { id: '4.1.2', level: 'A', since: '2.0', name: { de: 'Name, Rolle, Wert', en: 'Name, Role, Value' } },
  { id: '4.1.3', level: 'AA', since: '2.1', name: { de: 'Statusmeldungen', en: 'Status Messages' } },
];

const BY_ID = new Map(CRITERIA.map((criterion) => [criterion.id, criterion]));

export function getCriterion(id: string): SuccessCriterion | undefined {
  return BY_ID.get(id);
}

/** "wcag143" → "1.4.3", "wcag1412" → "1.4.12". Returns null for level tags like "wcag21aa". */
export function criterionFromTag(tag: string): string | null {
  const match = /^wcag(\d)(\d)(\d{1,2})$/.exec(tag);
  if (!match) return null;
  const id = `${match[1]}.${match[2]}.${match[3]}`;
  return BY_ID.has(id) ? id : null;
}

export function criteriaOf(tags: string[]): string[] {
  return tags.map(criterionFromTag).filter((id): id is string => id !== null);
}

/** EN 301 549 clause for web content: 9 + WCAG number. */
export function enClause(criterionId: string): string {
  return `9.${criterionId}`;
}

export function compareCriteria(a: string, b: string): number {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if (pa[i] !== pb[i]) return pa[i] - pb[i];
  }
  return 0;
}
