import type { HeadingInfo, LandmarkInfo, StructureInfo } from '../shared/types';
import { approximateName, isRendered, normalizeSpace, targetOf } from './dom';

const MAX_ENTRIES = 200;

function isExposed(el: Element): boolean {
  return isRendered(el) && !el.closest('[aria-hidden="true"]');
}

function headings(doc: Document): HeadingInfo[] {
  const list: HeadingInfo[] = [];
  doc.querySelectorAll('h1, h2, h3, h4, h5, h6, [role="heading"]').forEach((el) => {
    if (list.length >= MAX_ENTRIES || !isExposed(el)) return;
    const explicitLevel = Number(el.getAttribute('aria-level'));
    const level = explicitLevel > 0 ? explicitLevel : /^h[1-6]$/.test(el.localName) ? Number(el.localName[1]) : 2;
    const text = approximateName(el);
    list.push({ level, text: text.length > 120 ? `${text.slice(0, 120)}…` : text, target: targetOf(el) });
  });
  return list;
}

const SECTIONING = 'article, aside, main, nav, section';
const LANDMARK_SELECTOR = [
  'header',
  'footer',
  'main',
  'nav',
  'aside',
  'form',
  'section',
  'search',
  '[role="banner"]',
  '[role="contentinfo"]',
  '[role="main"]',
  '[role="navigation"]',
  '[role="complementary"]',
  '[role="search"]',
  '[role="region"]',
  '[role="form"]',
].join(',');

function landmarkRole(el: Element): string | null {
  const role = el.getAttribute('role');
  if (role) {
    const first = role.trim().split(/\s+/)[0];
    return ['banner', 'contentinfo', 'main', 'navigation', 'complementary', 'search', 'region', 'form'].includes(first) ? first : null;
  }
  const named = Boolean(el.getAttribute('aria-label')?.trim() || el.getAttribute('aria-labelledby')?.trim());
  switch (el.localName) {
    case 'header':
      return el.parentElement?.closest(SECTIONING) ? null : 'banner';
    case 'footer':
      return el.parentElement?.closest(SECTIONING) ? null : 'contentinfo';
    case 'main':
      return 'main';
    case 'nav':
      return 'navigation';
    case 'aside':
      return 'complementary';
    case 'search':
      return 'search';
    case 'section':
      return named ? 'region' : null;
    case 'form':
      return named ? 'form' : null;
    default:
      return null;
  }
}

function landmarks(doc: Document): LandmarkInfo[] {
  const list: LandmarkInfo[] = [];
  doc.querySelectorAll(LANDMARK_SELECTOR).forEach((el) => {
    if (list.length >= MAX_ENTRIES || !isExposed(el)) return;
    const role = landmarkRole(el);
    if (!role) return;
    const labelledBy = el.getAttribute('aria-labelledby');
    const label = el.getAttribute('aria-label') ?? (labelledBy ? approximateName(el) : '');
    list.push({ role, label: normalizeSpace(label), target: targetOf(el) });
  });
  return list;
}

export function collectStructure(doc: Document = document): StructureInfo {
  return {
    title: doc.title,
    lang: doc.documentElement.getAttribute('lang') ?? '',
    headings: headings(doc),
    landmarks: landmarks(doc),
  };
}
