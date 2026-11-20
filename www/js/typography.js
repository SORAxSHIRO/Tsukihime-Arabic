export const FONTS = Object.freeze([
  { id: 'naskh', name: 'Noto Naskh Arabic', family: 'Tsuki Naskh' },
  { id: 'amiri', name: 'Amiri', family: 'Tsuki Amiri' },
  { id: 'plex', name: 'IBM Plex Sans Arabic', family: 'Tsuki Plex' },
  { id: 'sans', name: 'Noto Sans Arabic', family: 'Tsuki Sans' },
  { id: 'tajawal', name: 'Tajawal', family: 'Tsuki Tajawal' },
  { id: 'cairo', name: 'Cairo', family: 'Tsuki Cairo' },
]);
const KEY = 'tsuki.typography.v1';
export const TYPE_DEFAULTS = Object.freeze({ version: 1, font: 'naskh', size: 100 });
export function normalizeTypography(value) {
  const valid = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  return { version: 1, font: FONTS.some(font => font.id === valid.font) ? valid.font : TYPE_DEFAULTS.font,
    size: typeof valid.size === 'number' && Number.isFinite(valid.size) ? Math.max(80, Math.min(130, Math.round(valid.size / 5) * 5)) : TYPE_DEFAULTS.size };
}
let current = { ...TYPE_DEFAULTS }, installed = false, revision = 0;
let state = { loading: false, saved: true, error: '' };
export function typographySettings() { return { ...current }; }
export function typographyState() { return { ...state }; }
function announce() { dispatchEvent(new CustomEvent('tsuki:typography', { detail: { ...current, ...state } })); }
export async function setTypography(patch, { persist = true } = {}) {
  current = normalizeTypography({ ...current, ...patch });
  const selected = FONTS.find(font => font.id === current.font);
  const root = document.documentElement, generation = ++revision;
  root.style.setProperty('--story-font', '"' + selected.family + '", serif');
  root.style.setProperty('--story-size', `${42 * current.size / 100}px`);
  root.style.setProperty('--interface-font', '"Tsuki Plex", sans-serif');
  root.style.setProperty('--gallery-font', '"Tsuki Plex", sans-serif');
  root.style.setProperty('--flow-font', '"Tsuki Plex", sans-serif');
  root.dataset.typography = 'arabic';
  state = { loading: true, saved: true, error: '' };
  if (persist) { try { localStorage.setItem(KEY, JSON.stringify(current)); } catch { state.saved = false; } }
  announce();
  try {
    const faces = await document.fonts.load(`400 42px "${selected.family}"`, 'العربية 123');
    if (!faces.length || !faces.every(face => face.status === 'loaded')) throw new Error('font unavailable');
  } catch { if (generation === revision) state.error = 'تعذّر تحميل الخط. جرّب خطًا آخر.'; }
  if (generation === revision) {
    state.loading = false; announce();
    requestAnimationFrame(() => { const text = document.getElementById('text'); if (text && text.scrollHeight > text.clientHeight) text.scrollTop = text.scrollHeight; });
  }
  return typographySettings();
}
export function resetTypography() { return setTypography(TYPE_DEFAULTS); }
export function installTypography() {
  if (installed) return;
  installed = true;
  let saved;
  try { saved = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch { saved = null; }
  current = normalizeTypography(saved);
  // Direction follows content; the stage and its sprite coordinates remain LTR.
  const observe = () => {
    for (const el of document.querySelectorAll('#text, .logpage, .choice, .dialog-q, .scene-name, .fc-note, .fc-preview-title')) {
      if (!el.hasAttribute('dir')) el.setAttribute('dir', 'auto');
    }
  };
  observe();
  new MutationObserver(observe).observe(document.getElementById('stage') || document.body, { childList: true, subtree: true });
  // Wheel scrolling of an enlarged story page must not trigger the game's skip controls.
  document.getElementById('text')?.addEventListener('wheel', event => {
    const box = event.currentTarget;
    if (box.scrollHeight > box.clientHeight) { event.preventDefault(); event.stopPropagation(); box.scrollTop += event.deltaY; }
  }, { passive: false });
  setTypography(current, { persist: false });
  document.fonts.load('400 28px "Tsuki Plex"', 'الإعدادات Settings').catch(() => {});
}

// Two ordinary System-page rows, using the existing slider/button/digit system.
export function addTypographyRows(ui, page) {
  const definitions = ui.vm.system.config.buttons;
  const names = ['نوتو نسخ', 'أميري', 'IBM Plex', 'نوتو سانس', 'تجوال', 'القاهرة'];
  const row = (index, y) => {
    const first = 200 + index * 3;
    for (const [offset, source] of [[0, 63], [1, 65], [2, 64]]) definitions[first + offset] = definitions[source];
    return [{ id: first, x: 735, y, col: 0 }, { id: first + 1, x: 362, y: y - 108, col: 1 }, { id: first + 2, x: 1356, y, col: 2 }];
  };
  const fontWidgets = row(0, 1512), sizeWidgets = row(1, 1662);
  ui.confSlider(page.widgets, page.over, 12, fontWidgets, FONTS.findIndex(font => font.id === current.font), FONTS.length - 1,
    value => setTypography({ font: FONTS[value].id }), 1350, 1570,
    (parent) => {
      const value = document.createElement('span'); value.className = 'conf-fontvalue'; value.dir = 'auto';
      value.style.left = '1257px'; value.style.top = '1562px'; parent.append(value);
      return index => { value.textContent = names[index]; };
    });
  ui.confSlider(page.widgets, page.over, 13, sizeWidgets, (current.size - 80) / 5, 10,
    value => setTypography({ size: 80 + value * 5 }), 1350, 1720,
    (parent, x, y) => { const digits = ui.confDigits(parent, x, y); return value => digits(80 + value * 5); });
  for (const [widgets, label] of [[fontWidgets, 'خط الحوار'], [sizeWidgets, 'حجم الخط']]) {
    for (const widget of widgets) {
      const button = ui.conf.buttons.find(button => button.confId === widget.id);
      button?.setAttribute('aria-label', `${label} — ${widget.col === 0 ? 'السابق' : widget.col === 2 ? 'التالي' : 'القيمة'}`);
    }
  }
}

