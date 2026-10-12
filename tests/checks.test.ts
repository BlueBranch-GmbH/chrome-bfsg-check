import { beforeAll, describe, expect, it } from 'vitest';
import {
  checkAccessibilityStatement,
  checkCaptcha,
  checkGenericLinkText,
  checkPdfLinks,
  checkPlaceholderLabel,
} from '../src/scanner/checks';

beforeAll(() => {
  // happy-dom does no layout; treat every element as rendered.
  (HTMLElement.prototype as unknown as { checkVisibility: () => boolean }).checkVisibility = () => true;
});

function doc(html: string): Document {
  document.body.innerHTML = html;
  return document;
}

describe('custom BFSG checks', () => {
  it('finds a link to the accessibility statement', () => {
    expect(checkAccessibilityStatement(doc('<a href="/barrierefreiheit">Erklärung zur Barrierefreiheit</a>')).outcome).toBe('pass');
    expect(checkAccessibilityStatement(doc('<a href="/impressum">Impressum</a>')).outcome).toBe('review');
    expect(checkAccessibilityStatement(doc('<a href="#barrierefrei">Sprung</a>')).outcome).toBe('review');
  });

  it('flags generic link texts', () => {
    const result = checkGenericLinkText(doc('<a href="/a">Mehr erfahren »</a><a href="/b">Unsere Preise</a><a href="/c" aria-label="Mehr zu Preisen">mehr</a>'));
    expect(result.outcome).toBe('review');
    expect(result.nodeCount).toBe(1);
    expect(result.nodes[0].data?.text).toBe('Mehr erfahren »');
  });

  it('lists linked PDF documents', () => {
    const result = checkPdfLinks(doc('<a href="/agb.pdf">AGB</a><a href="/file.PDF?x=1">Datei</a><a href="/page">Seite</a>'));
    expect(result.nodeCount).toBe(2);
  });

  it('flags fields that only have a placeholder', () => {
    const result = checkPlaceholderLabel(
      doc(`
        <input placeholder="E-Mail">
        <label for="n">Name</label><input id="n" placeholder="Max">
        <input aria-label="Suche" placeholder="Suchen">
        <input type="submit" placeholder="x">
      `),
    );
    expect(result.nodeCount).toBe(1);
    expect(result.nodes[0].data?.placeholder).toBe('E-Mail');
  });

  it('detects CAPTCHA widgets once', () => {
    const result = checkCaptcha(doc('<div class="g-recaptcha"><iframe src="https://www.google.com/recaptcha/api2/anchor"></iframe></div>'));
    expect(result.outcome).toBe('review');
    expect(result.nodeCount).toBe(1);
  });
});
