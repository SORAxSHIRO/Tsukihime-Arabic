// Keep combining marks attached to their base during progressive text reveal.
const segmenter = globalThis.Intl?.Segmenter ? new Intl.Segmenter('ar', { granularity: 'grapheme' }) : null;
export const hasArabic = text => /[\u0600-\u06ff\u0750-\u077f\u08a0-\u08ff\ufb50-\ufdff\ufe70-\ufeff]/u.test(text);
export function typingGraphemes(text) {
  if (!hasArabic(text)) return [...text]; // Retain the original English timing and special glyph banks.
  if (segmenter) return Array.from(segmenter.segment(text), part => part.segment);
  const units = [];
  for (const ch of text) {
    if (/\p{Mark}/u.test(ch) && units.length) units[units.length - 1] += ch;
    else units.push(ch);
  }
  return units;
}
