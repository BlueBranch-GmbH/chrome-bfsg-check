import type { HighlightResult, Target, ToolState } from '../shared/types';
import { isRendered, resolveTarget } from './dom';

/**
 * Visual helpers drawn on top of the inspected page. Everything lives in one
 * shadow root so page styles cannot interfere, and is removed again when the
 * tool is switched off.
 */

export const HOST_ID = 'bfsg-check-overlay-host';
const STYLE_IDS = {
  textSpacing: 'bfsg-check-text-spacing',
  grayscale: 'bfsg-check-grayscale',
} as const;

const OVERLAY_CSS = `
  :host { all: initial; }
  .layer { position: absolute; top: 0; left: 0; width: 0; height: 0; pointer-events: none; z-index: 2147483647; }
  .box {
    position: absolute; box-sizing: border-box; border: 3px solid #d6336c; border-radius: 3px;
    box-shadow: 0 0 0 3px rgba(255,255,255,.9), 0 0 0 9999px rgba(15, 23, 42, .25);
    animation: pulse 1s ease-out 2;
  }
  .label {
    position: absolute; transform: translateY(-100%); max-width: 320px; padding: 2px 6px;
    background: #d6336c; color: #fff; font: 600 12px/1.4 system-ui, sans-serif; border-radius: 3px 3px 0 0;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .badge {
    position: absolute; min-width: 20px; height: 20px; padding: 0 4px; box-sizing: border-box;
    transform: translate(-50%, -50%); border-radius: 10px; background: #1d4ed8; color: #fff;
    font: 700 11px/20px system-ui, sans-serif; text-align: center; box-shadow: 0 0 0 2px #fff;
  }
  .badge.positive { background: #c2410c; }
  .outline { position: absolute; box-sizing: border-box; border: 2px dashed #1d4ed8; border-radius: 2px; }
  @keyframes pulse { 0% { outline: 6px solid rgba(214,51,108,.6); } 100% { outline: 18px solid rgba(214,51,108,0); } }
  @media (prefers-reduced-motion: reduce) { .box { animation: none; } }
`;

let host: HTMLElement | null = null;
let highlightLayer: HTMLElement | null = null;
let tabOrderLayer: HTMLElement | null = null;
let highlighted: { el: Element; label: string } | null = null;
let tabOrderActive = false;
let repositionQueued = false;

function ensureHost(): ShadowRoot {
  if (host?.isConnected && host.shadowRoot) return host.shadowRoot;
  host = document.createElement('div');
  host.id = HOST_ID;
  host.setAttribute('aria-hidden', 'true');
  host.style.cssText = 'position:absolute;top:0;left:0;width:0;height:0;z-index:2147483647;';
  const shadow = host.attachShadow({ mode: 'open' });
  const style = document.createElement('style');
  style.textContent = OVERLAY_CSS;
  shadow.append(style);
  highlightLayer = document.createElement('div');
  highlightLayer.className = 'layer';
  tabOrderLayer = document.createElement('div');
  tabOrderLayer.className = 'layer';
  shadow.append(tabOrderLayer, highlightLayer);
  document.documentElement.append(host);
  window.addEventListener('scroll', queueReposition, { passive: true, capture: true });
  window.addEventListener('resize', queueReposition, { passive: true });
  return shadow;
}

function queueReposition(): void {
  if (repositionQueued) return;
  repositionQueued = true;
  requestAnimationFrame(() => {
    repositionQueued = false;
    if (highlighted) drawHighlight();
    if (tabOrderActive) drawTabOrder();
  });
}

function pageRect(el: Element): { top: number; left: number; width: number; height: number } {
  const rect = el.getBoundingClientRect();
  // Elements inside same-origin iframes: add the iframe's offset.
  let top = rect.top;
  let left = rect.left;
  let win: Window | null = el.ownerDocument.defaultView;
  while (win && win !== window && win.frameElement) {
    const frameRect = win.frameElement.getBoundingClientRect();
    top += frameRect.top;
    left += frameRect.left;
    win = win.parent;
  }
  return { top: top + window.scrollY, left: left + window.scrollX, width: rect.width, height: rect.height };
}

function drawHighlight(): void {
  ensureHost();
  if (!highlightLayer) return;
  highlightLayer.replaceChildren();
  if (!highlighted) return;
  const rect = pageRect(highlighted.el);
  const box = document.createElement('div');
  box.className = 'box';
  const pad = 4;
  box.style.cssText = `top:${rect.top - pad}px;left:${rect.left - pad}px;width:${rect.width + pad * 2}px;height:${rect.height + pad * 2}px;`;
  const label = document.createElement('div');
  label.className = 'label';
  label.textContent = highlighted.label;
  // Above the box by default; below it when there is no room at the top of the page.
  const below = rect.top - pad - 22 < window.scrollY;
  label.style.cssText = below
    ? `top:${rect.top + rect.height + pad}px;left:${rect.left - pad}px;transform:none;border-radius:0 0 3px 3px;`
    : `top:${rect.top - pad}px;left:${rect.left - pad}px;`;
  highlightLayer.append(box, label);
}

export function highlight(target: Target, label: string): HighlightResult {
  const el = resolveTarget(target);
  if (!el) {
    clearHighlight();
    return { found: false, visible: false };
  }
  const visible = isRendered(el);
  el.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' as ScrollBehavior });
  highlighted = { el, label };
  drawHighlight();
  return { found: true, visible };
}

export function clearHighlight(): void {
  highlighted = null;
  highlightLayer?.replaceChildren();
}

const FOCUSABLE = [
  'a[href]',
  'area[href]',
  'button',
  'input:not([type="hidden"])',
  'select',
  'textarea',
  'iframe',
  'summary',
  'audio[controls]',
  'video[controls]',
  '[contenteditable]:not([contenteditable="false"])',
  '[tabindex]',
].join(',');

/** Elements in the order the Tab key visits them (positive tabindex first, then DOM order). */
export function tabOrder(doc: Document = document): HTMLElement[] {
  const candidates = Array.from(doc.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => {
    if (el.tabIndex < 0) return false;
    if ((el as HTMLButtonElement).disabled) return false;
    if (el.closest('[inert]')) return false;
    if (el.localName === 'summary' && el.parentElement?.localName !== 'details') return false;
    return isRendered(el);
  });
  const positive = candidates.filter((el) => el.tabIndex > 0).sort((a, b) => a.tabIndex - b.tabIndex);
  const natural = candidates.filter((el) => el.tabIndex === 0);
  return [...positive, ...natural].slice(0, 500);
}

function drawTabOrder(): number {
  ensureHost();
  if (!tabOrderLayer) return 0;
  tabOrderLayer.replaceChildren();
  const elements = tabOrder();
  const fragment = document.createDocumentFragment();
  elements.forEach((el, index) => {
    const rect = pageRect(el);
    const outline = document.createElement('div');
    outline.className = 'outline';
    outline.style.cssText = `top:${rect.top}px;left:${rect.left}px;width:${rect.width}px;height:${rect.height}px;`;
    const badge = document.createElement('div');
    badge.className = el.tabIndex > 0 ? 'badge positive' : 'badge';
    badge.textContent = String(index + 1);
    // Keep badges of elements at the page edge fully visible.
    badge.style.cssText = `top:${Math.max(rect.top, window.scrollY + 10)}px;left:${Math.max(rect.left, window.scrollX + 10)}px;`;
    fragment.append(outline, badge);
  });
  tabOrderLayer.append(fragment);
  return elements.length;
}

function toggleStyle(id: string, css: string, enabled: boolean): void {
  const existing = document.getElementById(id);
  if (!enabled) {
    existing?.remove();
    return;
  }
  if (existing) return;
  const style = document.createElement('style');
  style.id = id;
  style.textContent = css;
  (document.head ?? document.documentElement).append(style);
}

/** WCAG 1.4.12 test values: content must stay readable with these spacings. */
const TEXT_SPACING_CSS = `
  *:not(#${HOST_ID}) {
    line-height: 1.5 !important;
    letter-spacing: 0.12em !important;
    word-spacing: 0.16em !important;
  }
  p { margin-bottom: 2em !important; }
`;

const GRAYSCALE_CSS = 'html { filter: grayscale(1) !important; }';

export function setTool(tool: keyof ToolState, enabled: boolean): number | null {
  switch (tool) {
    case 'tabOrder':
      tabOrderActive = enabled;
      if (!enabled) {
        tabOrderLayer?.replaceChildren();
        return null;
      }
      return drawTabOrder();
    case 'textSpacing':
      toggleStyle(STYLE_IDS.textSpacing, TEXT_SPACING_CSS, enabled);
      queueReposition();
      return null;
    case 'grayscale':
      toggleStyle(STYLE_IDS.grayscale, GRAYSCALE_CSS, enabled);
      return null;
  }
}

export function getTools(): ToolState {
  return {
    tabOrder: tabOrderActive,
    textSpacing: Boolean(document.getElementById(STYLE_IDS.textSpacing)),
    grayscale: Boolean(document.getElementById(STYLE_IDS.grayscale)),
  };
}
