import { translateUI } from './strings-ar.js';

export { translateUI };
export const arabicUI = () => document.documentElement.classList.contains('ar-ui');
// Convert a physical pointer position to the original menu coordinate system.
export function menuX(clientX, bounds, width = 1920) {
  const value = ((clientX - bounds.left) * width) / (bounds.width || width);
  return arabicUI() ? width - value : value;
}
export function menuKey(event) {
  if (!arabicUI() || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return event;
  const key = event.key === 'ArrowLeft' ? 'ArrowRight' : 'ArrowLeft';
  return new Proxy(event, { get(target, name) {
    if (name === 'key' || name === 'code') return key;
    const value = Reflect.get(target, name, target);
    return typeof value === 'function' ? value.bind(target) : value;
  } });
}
// The UI is reflected as a layout. Counter-reflect glyphs, never the whole atlas.
export function paintMenuText(context, text, x, y, maxWidth) {
  if (!arabicUI()) {
    if (maxWidth) context.fillText(text, x, y, maxWidth); else context.fillText(text, x, y);
    return;
  }
  text = translateUI(text);
  const measured = context.measureText(text).width;
  const width = maxWidth ? Math.min(maxWidth, measured) : measured;
  const align = context.textAlign;
  const left = align === 'center' ? x - width / 2 : align === 'right' || align === 'end' ? x - width : x;
  context.save();
  context.translate(2 * left + width, 0); context.scale(-1, 1);
  context.textAlign = 'left'; context.direction = 'rtl';
  if (maxWidth) context.fillText(text, left, y, maxWidth); else context.fillText(text, left, y);
  context.restore();
}

const ROOTS = '#ui, #sysui, .modepanel, #rotate, #touch-back, #touch-hint, #toast';
const CONTENT = '.ar-ink, .glossary-content, .logpage, .confsample, .ch, #text, #choices, script, style';
let installed = false;
export function installArabicUI() {
  if (installed || (typeof window !== 'undefined' && window.__tsuki_lang !== 'ar')) return;
  installed = true;
  const html = document.documentElement;
  html.lang = 'ar'; html.dir = 'rtl'; html.classList.add('ar-ui');
  document.title = 'تسوكيهيمي — قطعة من القمر الزجاجي الأزرق';
  let queued = false;
  const visit = () => {
    queued = false;
    for (const root of document.querySelectorAll(ROOTS)) {
      // Translate text as complete runs, preserving dictionary/control IDs in source.
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      const nodes = [];
      while (walker.nextNode()) {
        const node = walker.currentNode;
        if (node.nodeValue.trim() && !node.parentElement?.closest(CONTENT)) nodes.push(node);
      }
      for (const node of nodes) {
        if (!node.isConnected) continue;
        const ink = document.createElement('span'); ink.className = 'ar-ink'; ink.dir = 'auto';
        ink.textContent = translateUI(node.nodeValue); node.replaceWith(ink);
      }
      for (const element of [root, ...root.querySelectorAll('[aria-label], [title]')]) {
        for (const name of ['aria-label', 'title']) {
          const text = element.getAttribute(name);
          if (text && translateUI(text) !== text) element.setAttribute(name, translateUI(text));
        }
      }
    }
  };
  const schedule = () => { if (!queued) { queued = true; queueMicrotask(visit); } };
  new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true, characterData: true,
    attributes: true, attributeFilter: ['aria-label', 'title'] });
  visit();
}
