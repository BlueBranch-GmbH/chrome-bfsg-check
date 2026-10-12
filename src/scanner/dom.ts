import type { Target } from '../shared/types';

const MAX_HTML_LENGTH = 300;

/** Opening tag of an element, shortened so results stay small. */
export function outerHtmlSnippet(el: Element): string {
  const html = el.outerHTML;
  const end = html.indexOf('>');
  const opening = end >= 0 ? html.slice(0, end + 1) : html;
  const text = (el.textContent ?? '').replace(/\s+/g, ' ').trim();
  const snippet = text && !opening.endsWith('/>') ? `${opening}${text.slice(0, 80)}${text.length > 80 ? '…' : ''}` : opening;
  return snippet.length > MAX_HTML_LENGTH ? `${snippet.slice(0, MAX_HTML_LENGTH)}…` : snippet;
}

function cssEscape(value: string): string {
  return typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(value) : value.replace(/([^\w-])/g, '\\$1');
}

function isUnique(root: Document | ShadowRoot, selector: string): boolean {
  try {
    return root.querySelectorAll(selector).length === 1;
  } catch {
    return false;
  }
}

/**
 * Builds a selector that is unique within the element's root (document or
 * shadow root). Prefers ids, falls back to an nth-of-type path.
 */
export function uniqueSelector(el: Element): string {
  const root = el.getRootNode() as Document | ShadowRoot;
  if (el.id && isUnique(root, `#${cssEscape(el.id)}`)) return `#${cssEscape(el.id)}`;

  const parts: string[] = [];
  let current: Element | null = el;
  while (current && current.nodeType === Node.ELEMENT_NODE) {
    if (current.id && isUnique(root, `#${cssEscape(current.id)}`)) {
      parts.unshift(`#${cssEscape(current.id)}`);
      break;
    }
    const tag = current.localName;
    const parent: Element | null = current.parentElement;
    if (!parent) {
      parts.unshift(tag);
      break;
    }
    const sameTag = Array.from(parent.children).filter((child) => child.localName === tag);
    parts.unshift(sameTag.length > 1 ? `${tag}:nth-of-type(${sameTag.indexOf(current) + 1})` : tag);
    const selector = parts.join(' > ');
    if (isUnique(root, selector)) return selector;
    current = parent;
  }
  return parts.join(' > ');
}

/** Target (in axe-core format) for an element in the top document, including shadow DOM hops. */
export function targetOf(el: Element): Target {
  const chain: string[] = [];
  let current: Element = el;
  for (;;) {
    chain.unshift(uniqueSelector(current));
    const root = current.getRootNode();
    if (root instanceof ShadowRoot) {
      current = root.host;
    } else {
      break;
    }
  }
  return [chain.length === 1 ? chain[0] : chain];
}

function queryIn(root: Document | ShadowRoot, part: string | string[]): Element | null {
  try {
    if (typeof part === 'string') return root.querySelector(part);
    let scope: Document | ShadowRoot = root;
    let el: Element | null = null;
    for (const selector of part) {
      el = scope.querySelector(selector);
      if (!el) return null;
      if (el.shadowRoot) scope = el.shadowRoot;
    }
    return el;
  } catch {
    return null;
  }
}

/**
 * Resolves a target to an element. For targets inside cross-origin iframes
 * the iframe itself is returned, since its content is not reachable.
 */
export function resolveTarget(target: Target): Element | null {
  let doc: Document = document;
  let el: Element | null = null;
  for (let i = 0; i < target.length; i++) {
    el = queryIn(doc, target[i]);
    if (!el) return null;
    if (i < target.length - 1) {
      const frameDoc = (el as HTMLIFrameElement).contentDocument;
      if (!frameDoc) return el;
      doc = frameDoc;
    }
  }
  return el;
}

/** Rendered and not hidden via CSS. Does not check whether it is scrolled into view. */
export function isRendered(el: Element): boolean {
  if (!el.isConnected) return false;
  if (typeof (el as HTMLElement).checkVisibility === 'function') {
    return (el as HTMLElement).checkVisibility({ visibilityProperty: true, opacityProperty: false } as CheckVisibilityOptions);
  }
  const rect = el.getBoundingClientRect();
  const style = getComputedStyle(el);
  return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
}

export function isInViewport(el: Element): boolean {
  const rect = el.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) return false;
  return rect.bottom > 0 && rect.right > 0 && rect.top < window.innerHeight && rect.left < window.innerWidth;
}

/** Rough accessible name: good enough for heuristics, not a full accname implementation. */
export function approximateName(el: Element): string {
  const labelledBy = el.getAttribute('aria-labelledby');
  if (labelledBy) {
    const text = labelledBy
      .split(/\s+/)
      .map((id) => el.ownerDocument.getElementById(id)?.textContent ?? '')
      .join(' ');
    if (text.trim()) return normalizeSpace(text);
  }
  const ariaLabel = el.getAttribute('aria-label');
  if (ariaLabel?.trim()) return normalizeSpace(ariaLabel);
  let text = '';
  el.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      text += node.textContent ?? '';
    } else if (node instanceof Element) {
      if (node.getAttribute('aria-hidden') === 'true') return;
      if (node instanceof HTMLImageElement) text += ` ${node.alt} `;
      else text += ` ${approximateName(node)} `;
    }
  });
  text = normalizeSpace(text);
  if (text) return text;
  return normalizeSpace(el.getAttribute('title') ?? '');
}

export function normalizeSpace(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}
