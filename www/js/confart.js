import { translateUI, paintMenuText } from "./localize-ui.js";
// confart.js - the config's System page with its words at one size. The translated art had them at five: the rows' names
// at 38 px, ON / OFF at 32, the other choices at 26, "Display whole text" at 22, and the port's typing samples at 40. Here
// the three pictures that carry them (system_bg, btn_base1, btn_base2) are made again as the page opens for the first
// time in a visit: the old words taken out, the same words drawn at CONF_TEXT.size in the rows' own face, each in its
// state's colour and glow. Everything else in the pictures (the bars, the marks before each choice, "ms") is as it was.
// The samples take the same size in style.css (.confsample).

export const CONF_TEXT = { size: 28, line: 36, font: '"Tsuki Plex", Helvetica, Arial, "Liberation Sans", "Arimo Bundled", sans-serif', fill: "rgba(255, 255, 255, .96)" };
// system_bg (1432 x 1336): each row's name, the rows its old words lay in ([first, last]) and its lines. The words start
// at x 44; the first line keeps its old middle (14 px under the old words' top).
export const SYSTEM_LABELS = [
  { y: [24, 49], lines: ["Text settings"] },
  { y: [79, 115], lines: ["Unread text speed"] },
  { y: [259, 295], lines: ["Read text speed"] },
  { y: [432, 514], lines: ["Auto mode", "page switching"] },
  { y: [576, 650], lines: ["Auto mode", "click wait time"] },
  { y: [718, 800], lines: ["Read scenes", "auto skip"] },
  { y: [868, 897], lines: ["Fast forward"] },
  { y: [1027, 1064], lines: ["Text display"] },
  { y: [1184, 1220], lines: ["Read text display"] },
];
export const SYSTEM_AREA = { x0: 36, x1: 450, pad: 4, clean: 6, textX: 44, middle: 14 };
// The choices' sheets: three columns (normal, under the cursor, on) `col` apart and rows `row` apart; a cell's mark ends
// before x, where its word starts; base: the word's baseline in the row; room: the width a word may take.
export const OPTION_SHEETS = {
  btn_base1: { col: 256, row: 88, x: 48, base: 50, room: 190, width: 760, words: ["ON", "OFF", "Full", "Read", "Fade in", "Insta display", "Fade out", "Insta erasure"],
    lift: { "2:1": 4 } },   // (OFF's lit cell is cut 4 px higher than its others, system.json)
  // (the sheet is 904 wide: its third column, from 608, has 296 px, so a word may take 236 after the mark, glow and all)
  btn_base2: { col: 304, row: 80, x: 50, base: 47, room: 236, width: 904, words: ["Display whole text", "Display confirmation"], lift: {} },
};
// A column's look: the word's colour, its glow and the glow's width (sampled from the art).
export const OPTION_LOOKS = [
  { fill: "rgb(255, 255, 255)", glow: null, blur: 0 },
  { fill: "rgb(8, 235, 243)", glow: "rgba(0, 247, 239, .55)", blur: 7 },
  { fill: "rgb(120, 251, 246)", glow: "rgba(32, 199, 255, .95)", blur: 9 },
];

const face = () => isArabic() ? `400 ${CONF_TEXT.size}px "Tsuki Plex"` : `400 ${CONF_TEXT.size}px Helvetica, Arial, "Liberation Sans", "Arimo Bundled", sans-serif`;

// The first line's baseline for a row whose old words began at y0: its middle where the old first line's was.
export const labelBase = (y0) => y0 + SYSTEM_AREA.middle + Math.round(CONF_TEXT.size * 0.36);

function load(name) {
  return new Promise((done, fail) => {
    const img = new Image();
    img.onload = () => done(img);
    img.onerror = () => fail(Error(name));
    img.src = `/assets/ui/CONF_PARTS_JA/${name}.webp`;
  });
}
const canvasOf = (img) => {
  const c = document.createElement("canvas");
  c.width = img.naturalWidth; c.height = img.naturalHeight;
  const g = c.getContext("2d", { willReadFrequently: true });
  g.drawImage(img, 0, 0);
  return [c, g];
};
const address = (canvas) => new Promise((done) => canvas.toBlob((b) => done(b ? URL.createObjectURL(b) : null), "image/png"));

const isArabic = () => (typeof window !== "undefined" && window.__tsuki_lang === "ar");

function systemPage(img) {
  const [c, g] = canvasOf(img), A = SYSTEM_AREA, w = A.x1 - A.x0;
  if (!isArabic()) {
    c.height = img.naturalHeight + 250;
    g.drawImage(img, 0, 0);
    g.fillStyle = 'rgba(8, 14, 44, .52)';
    g.fillRect(14, img.naturalHeight - 16, 1402, 260);
    const origLabels = [
      { y: [79, 115], lines: ["Unread text speed"] },
      { y: [259, 295], lines: ["Read text speed"] },
      { y: [432, 514], lines: ["Auto mode", "page switching"] },
      { y: [576, 650], lines: ["Auto mode", "click wait time"] },
      { y: [718, 800], lines: ["Read scenes", "auto skip"] },
      { y: [868, 897], lines: ["Fast forward"] },
      { y: [1027, 1064], lines: ["Text display"] },
      { y: [1184, 1220], lines: ["Read text display"] },
    ];
    for (const { y: [y0, y1], lines } of origLabels) {
      const top = y0 - A.clean, h = y1 + A.clean - top + 1, im = g.getImageData(A.x0, top, w, h), d = im.data;
      for (let x = 0; x < w; x++) for (let k = 0; k < 4; k++) {
        const a = d[x * 4 + k], b = d[((h - 1) * w + x) * 4 + k];
        for (let y = 1; y < h - 1; y++) d[(y * w + x) * 4 + k] = a + ((b - a) * y) / (h - 1);
      }
      g.putImageData(im, A.x0, top);
      g.font = face();
      g.textBaseline = "alphabetic";
      g.fillStyle = CONF_TEXT.fill;
      lines.forEach((line, i) => g.fillText(line, A.textX, labelBase(y0) + i * CONF_TEXT.line));
    }
    return address(c);
  }
  // Extend the existing artwork by two native settings rows, without a new panel.
  c.height = img.naturalHeight + 364;
  g.drawImage(img, 0, 0);
  for (const { y: [y0, y1], lines } of SYSTEM_LABELS) {
    // the old words out: each column filled between the clean rows above and below them (the panel shades sideways)
    const top = y0 - A.clean, h = y1 + A.clean - top + 1, im = g.getImageData(A.x0, top, w, h), d = im.data;
    for (let x = 0; x < w; x++) for (let k = 0; k < 4; k++) {
      const a = d[x * 4 + k], b = d[((h - 1) * w + x) * 4 + k];
      for (let y = 1; y < h - 1; y++) d[(y * w + x) * 4 + k] = a + ((b - a) * y) / (h - 1);
    }
    g.putImageData(im, A.x0, top);
    g.font = face();
    g.textBaseline = "alphabetic";
    g.fillStyle = CONF_TEXT.fill;
    lines.forEach((line, i) => paintMenuText(g, line, A.textX, labelBase(y0) + i * CONF_TEXT.line, 400));
  }
  for (const [x,y] of [[1008,153],[1008,332],[1008,490],[1008,633]]) {
    // The original unit's descenders reach y+28; clear the whole ink area,
    // interpolating within the number panel so its borders remain intact.
    const unit=g.getImageData(x-28,y-1,56,38), pixels=unit.data;
    for(let xx=0;xx<56;xx++)for(let k=0;k<4;k++){
      const a=pixels[xx*4+k],b=pixels[(37*56+xx)*4+k];
      for(let yy=1;yy<37;yy++)pixels[(yy*56+xx)*4+k]=a+(b-a)*yy/37;
    }
    g.putImageData(unit,x-28,y-1);
    g.font=face();g.fillStyle=CONF_TEXT.fill;g.textAlign='center';paintMenuText(g,'م.ث',x+36,y+28,52);
  }
  const row = document.createElement('canvas'); row.width = img.naturalWidth; row.height = 150;
  const r = row.getContext('2d', { willReadFrequently: true });
  r.drawImage(img, 0, 548, img.naturalWidth, 150, 0, 0, img.naturalWidth, 150);
  // Remove the old label while retaining the original horizontal panel shading.
  const clean = r.getImageData(A.x0, 5, w, 135), pixels = clean.data;
  for (let x = 0; x < w; x++) for (let k = 0; k < 4; k++) {
    const top = pixels[x * 4 + k], bottom = pixels[(134 * w + x) * 4 + k];
    for (let y = 1; y < 134; y++) pixels[(y * w + x) * 4 + k] = top + (bottom - top) * y / 134;
  }
  r.putImageData(clean, A.x0, 5);
  // Clear the old "ms" unit; the first row has a font name, the second a percent.
  const unitBackground = r.getImageData(980, 80, 56, 1);
  r.clearRect(980, 85, 56, 39);
  for (let y = 85; y < 124; y++) r.putImageData(unitBackground, 980, y);
  // Continue the native dark sheet behind the two added rows and its bottom padding.
  g.fillStyle = 'rgba(8, 14, 44, .52)';
  g.fillRect(14, img.naturalHeight - 16, 1402, 380);
  ["خط الحوار", "حجم الخط"].forEach((label, index) => {
    const y = img.naturalHeight - 16 + index * 150;
    g.drawImage(row, 0, y);
    g.font = face(); g.fillStyle = CONF_TEXT.fill; g.textBaseline = 'alphabetic';
    g.direction = 'rtl'; g.textAlign = 'left'; paintMenuText(g, label, A.textX, y + 51, 400);
    if (index === 1) { g.direction = 'ltr'; paintMenuText(g, '%', 1008, y + 108); }
  });
  g.direction = 'inherit';
  return address(c);
}

function optionSheet(img, S) {
  const [c, g] = canvasOf(img);
  g.font = face();
  g.textBaseline = "alphabetic";
  if (!isArabic()) {
    S.words.forEach((word, row) => OPTION_LOOKS.forEach((look, col) => {
      const x = col * S.col + S.x, y = row * S.row - (S.lift[`${col}:${row}`] || 0);
      const wipe = g.createLinearGradient(x - 12, 0, x, 0);
      wipe.addColorStop(0, "rgba(0, 0, 0, 0)");
      wipe.addColorStop(1, "rgba(0, 0, 0, 1)");
      g.save();
      g.globalCompositeOperation = "destination-out";
      g.fillStyle = wipe;
      g.fillRect(x - 12, y, S.col - S.x + 12, S.row);
      g.restore();
      const squeeze = Math.min(1, S.room / (g.measureText(word).width || S.room));
      g.save();
      g.beginPath(); g.rect(x - 12, y, S.col - S.x + 12, S.row); g.clip();
      if (squeeze < 1) { g.translate(x, y + S.base); g.scale(squeeze, 1); }
      g.fillStyle = look.fill;
      if (look.glow) { g.shadowColor = look.glow; g.shadowBlur = look.blur; g.fillText(word, squeeze < 1 ? 0 : x, squeeze < 1 ? 0 : y + S.base); }
      g.fillText(word, squeeze < 1 ? 0 : x, squeeze < 1 ? 0 : y + S.base);
      g.restore();
    }));
    return address(c);
  }
  S.words.forEach((word, row) => OPTION_LOOKS.forEach((look, col) => {
    word = translateUI(word);
    const x = col * S.col + S.x, y = row * S.row - (S.lift[`${col}:${row}`] || 0);
    // the old word out, from just before where it began; the mark's own glow is let go softly, not cut at an edge
    const wipe = g.createLinearGradient(x - 12, 0, x, 0);
    wipe.addColorStop(0, "rgba(0, 0, 0, 0)");
    wipe.addColorStop(1, "rgba(0, 0, 0, 1)");
    g.save();
    g.globalCompositeOperation = "destination-out";
    g.fillStyle = wipe;
    g.fillRect(x - 12, y, S.col - S.x + 12, S.row);
    g.restore();
    const squeeze = Math.min(1, S.room / (g.measureText(word).width || S.room));   // a word too long for its cell is drawn a little narrower
    g.save();
    g.beginPath(); g.rect(x - 12, y, S.col - S.x + 12, S.row); g.clip();
    g.translate(x + g.measureText(word).width * squeeze, y + S.base);
    g.scale(-squeeze, 1);
    g.direction = "rtl"; g.textAlign = "left";
    g.fillStyle = look.fill;
    if (look.glow) { g.shadowColor = look.glow; g.shadowBlur = look.blur; g.fillText(word, 0, 0); }
    g.fillText(word, 0, 0);
    g.restore();
  }));
  return address(c);
}

// The three pictures made again: { system_bg, btn_base1, btn_base2 } as addresses, without those that could not be made
// (no canvas, a picture missing), for which the art as it is stands in.
export async function relettered() {
  const out = {};
  if (typeof Image === "undefined" || typeof document === "undefined") return out;
  const make = async (name, draw) => { try { const a = await draw(await load(name)); if (a) out[name] = a; } catch (e) { console.warn("config art:", e.message); } };
  await Promise.all([
    make("system_bg", systemPage),
    ...Object.entries(OPTION_SHEETS).map(([name, S]) => make(name, (img) => optionSheet(img, S))),
  ]);
  return out;
}
