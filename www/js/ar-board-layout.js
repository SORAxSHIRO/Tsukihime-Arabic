// Focus panels follow the Arabic board texture; saved script state is untouched.
export const ARABIC_EDUCATIONAL_BOARDS = Object.freeze(["IMG1699", "IMG1700", "IMG1701", "IMG1702", "IMG2378", "IMG2379", "IMG2380", "IMG2381", "IMG2382", "IMG2383", "IMG2384", "IMG2385", "IMG2386", "IMG2387", "IMG2388", "IMG2389", "IMG2390", "IMG2391", "IMG2392", "IMG2393", "IMG2394", "IMG2395", "IMG2396", "IMG2397", "IMG2398", "IMG2399", "IMG2400", "IMG2401", "IMG2402", "IMG2403", "IMG2404", "IMG2406", "IMG2407", "IMG2408", "IMG2409", "IMG2410", "IMG2411", "IMG2412", "IMG2413", "IMG2414", "IMG2416", "IMG2417", "IMG2418", "IMG2419", "IMG2420", "IMG2421", "IMG2422", "IMG2423", "IMG2424", "IMG2425", "IMG2426", "IMG2427", "IMG2428", "IMG2429", "IMG2430", "IMG2431", "IMG2432", "IMG2433", "IMG2434", "IMG2435", "IMG2436", "IMG2437", "IMG3819", "IMG3821", "IMG3822", "IMG5026"]);
const names = new Set(ARABIC_EDUCATIONAL_BOARDS);

export function adjustArabicBoardPanels(placed, layers) {
  if (window.__tsuki_lang !== 'ar') return placed;
  const panels = new Map();
  // Linked reveal layers carry the current board's placement. Prefer the top
  // visible board when a fade has both the old and new reveal on the same panel.
  for (const layer of [...layers].sort((a, b) => b.z - a.z)) {
    if (!names.has(String(layer.image || '').toUpperCase()) || layer.z < 1 || !layer.ready) continue;
    const at = placed.get(layer), clip = at?.clip;
    if (!clip || !(at.alpha > 0) || panels.has(clip.group)) continue;
    const [x, y, width, height] = clip.rect;
    // Board ink is mirrored about x=945 in its 1892px texture (the edited
    // interior spans x=110..1780). Stored-image pixels render at 1.5 * zoom.
    const pivotX = (at.pivot?.[0] || 0) * at.zx;
    const centre = at.x - pivotX - 1.5 * at.zx;
    const horizontalPadding = 32, verticalPadding = 18;
    panels.set(clip.group, {
      ...clip,
      rect: [2 * centre - x - width - horizontalPadding, y - verticalPadding,
        width + 2 * horizontalPadding, height + 2 * verticalPadding],
      rot: -(clip.rot || 0),
    });
  }
  for (const [layer, at] of placed) {
    const replacement = at.clip && panels.get(at.clip.group);
    if (replacement) placed.set(layer, { ...at, clip: replacement });
  }
  return placed;
}
