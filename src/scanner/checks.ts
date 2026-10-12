import type { Impact, Outcome, RuleResult, ScanNode } from '../shared/types';
import { MAX_NODES_PER_RULE } from '../shared/types';
import { approximateName, isInViewport, isRendered, normalizeSpace, outerHtmlSnippet, targetOf } from './dom';

/**
 * Checks that axe-core does not cover but that matter for the BFSG. They are
 * heuristics, so almost all of them produce "review" results instead of
 * violations. The texts live in the side panel (src/shared/rule-texts.ts).
 */

function node(el: Element, data?: Record<string, string | number>): ScanNode {
  return { target: targetOf(el), html: outerHtmlSnippet(el), inViewport: isInViewport(el), data };
}

function result(id: string, outcome: Outcome, impact: Impact | null, tags: string[], nodes: ScanNode[]): RuleResult {
  return {
    id,
    source: 'bfsg',
    outcome,
    impact: outcome === 'pass' ? null : impact,
    tags: ['bfsg', ...tags],
    help: '',
    description: '',
    nodes: nodes.slice(0, MAX_NODES_PER_RULE),
    nodeCount: nodes.length,
  };
}

const STATEMENT_PATTERN =
  /barrierefrei|barrierefreiheit|barrierearm|zugänglichkeit|accessibility|accessible|a11y|accessibilité|toegankelijkheid/i;

/** BFSG §14 + Anlage 3: services must publish accessibility information. */
export function checkAccessibilityStatement(doc: Document): RuleResult {
  const links = Array.from(doc.querySelectorAll('a[href]')).filter((a) => {
    const href = a.getAttribute('href') ?? '';
    if (href.startsWith('#')) return false;
    const text = `${approximateName(a)} ${href}`;
    return STATEMENT_PATTERN.test(text);
  });
  if (links.length > 0) {
    return result('bfsg-accessibility-statement', 'pass', null, ['bfsg-statement'], links.slice(0, 3).map((a) => node(a)));
  }
  return result('bfsg-accessibility-statement', 'review', 'serious', ['bfsg-statement'], []);
}

const GENERIC_LINK_TEXTS = new Set([
  'hier',
  'hier klicken',
  'klicken sie hier',
  'klick hier',
  'mehr',
  'mehr erfahren',
  'mehr lesen',
  'mehr infos',
  'mehr informationen',
  'weiter',
  'weiterlesen',
  'zum artikel',
  'details',
  'link',
  'click here',
  'here',
  'more',
  'read more',
  'learn more',
  'more info',
  'more information',
  'continue',
  'continue reading',
]);

/** WCAG 2.4.4: link text such as "read more" does not say where the link goes. */
export function checkGenericLinkText(doc: Document): RuleResult {
  const nodes: ScanNode[] = [];
  doc.querySelectorAll('a[href]').forEach((a) => {
    if (!isRendered(a)) return;
    const name = approximateName(a);
    const normalized = name
      .toLowerCase()
      .replace(/[.:…»«›>→\-–—!?"']/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (GENERIC_LINK_TEXTS.has(normalized)) nodes.push(node(a, { text: name }));
  });
  return result('bfsg-generic-link-text', nodes.length ? 'review' : 'pass', 'moderate', ['wcag2a', 'wcag244'], nodes);
}

/** Documents offered for download fall under the BFSG as well. */
export function checkPdfLinks(doc: Document): RuleResult {
  const nodes: ScanNode[] = [];
  doc.querySelectorAll('a[href]').forEach((a) => {
    const href = a.getAttribute('href') ?? '';
    if (/\.pdf($|[?#])/i.test(href)) nodes.push(node(a, { href }));
  });
  return result('bfsg-pdf-documents', nodes.length ? 'review' : 'pass', 'moderate', [], nodes);
}

/** WCAG 2.2.2: moving content that starts automatically needs a way to pause it. */
export function checkAutoplayVideo(doc: Document): RuleResult {
  const nodes: ScanNode[] = [];
  doc.querySelectorAll('video').forEach((video) => {
    const playing = video.autoplay || (!video.paused && !video.ended);
    if (playing && !video.controls && isRendered(video)) nodes.push(node(video));
  });
  return result('bfsg-autoplay-video', nodes.length ? 'review' : 'pass', 'serious', ['wcag2a', 'wcag222'], nodes);
}

const CAPTCHA_SELECTOR = [
  'iframe[src*="recaptcha"]',
  'iframe[src*="hcaptcha"]',
  'iframe[src*="challenges.cloudflare.com"]',
  'iframe[src*="friendlycaptcha"]',
  '.g-recaptcha',
  '.h-captcha',
  '.cf-turnstile',
  '.frc-captcha',
].join(',');

/** WCAG 1.1.1 / 3.3.8: CAPTCHAs need an accessible alternative. */
export function checkCaptcha(doc: Document): RuleResult {
  const found = Array.from(doc.querySelectorAll(CAPTCHA_SELECTOR));
  // Skip nested matches, e.g. the iframe inside .g-recaptcha.
  const roots = found.filter((el) => !found.some((other) => other !== el && other.contains(el)));
  return result('bfsg-captcha', roots.length ? 'review' : 'pass', 'serious', ['wcag2a', 'wcag111'], roots.map((el) => node(el)));
}

const NON_TEXT_INPUTS = new Set(['hidden', 'submit', 'button', 'reset', 'image', 'checkbox', 'radio', 'range', 'color', 'file']);

/** WCAG 3.3.2: a placeholder disappears while typing and is not a replacement for a label. */
export function checkPlaceholderLabel(doc: Document): RuleResult {
  const nodes: ScanNode[] = [];
  doc.querySelectorAll('input[placeholder], textarea[placeholder]').forEach((el) => {
    const field = el as HTMLInputElement | HTMLTextAreaElement;
    if (field instanceof HTMLInputElement && NON_TEXT_INPUTS.has(field.type)) return;
    if (!isRendered(field)) return;
    const hasLabel =
      (field.labels && Array.from(field.labels).some((label) => normalizeSpace(label.textContent ?? '') !== '')) ||
      field.getAttribute('aria-label')?.trim() ||
      field.getAttribute('aria-labelledby')?.trim() ||
      field.getAttribute('title')?.trim();
    if (!hasLabel) nodes.push(node(field, { placeholder: field.placeholder }));
  });
  return result('bfsg-placeholder-label', nodes.length ? 'review' : 'pass', 'serious', ['wcag2a', 'wcag332'], nodes);
}

export function runCustomChecks(doc: Document = document): RuleResult[] {
  return [
    checkAccessibilityStatement(doc),
    checkGenericLinkText(doc),
    checkPdfLinks(doc),
    checkAutoplayVideo(doc),
    checkCaptcha(doc),
    checkPlaceholderLabel(doc),
  ];
}
