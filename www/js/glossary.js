import { GUIDE_ENTRIES } from './glossary-data.js';

const element = (tag, className, text) => {
  const node = document.createElement(tag);
  node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};

export function addGlossaryLink(ui, page, fromTitle, isArabic) {
  const posY = isArabic ? 1760 : 1480;
  const row = isArabic ? 14 : 12;

  const button = element('button', 'keyslot glossary-link ar-keep', isArabic ? 'دليل المصطلحات' : 'Glossary');
  button.type = 'button';
  button.confId = 206;
  button.placeY = posY;
  button.style.left = isArabic ? '460px' : '688px';
  button.style.top = `${posY}px`;
  button.style.width = '380px';
  button.style.height = '52px';
  button.setAttribute('aria-label', isArabic ? 'دليل المصطلحات' : 'Glossary');
  button.setSelected = selected => button.classList.toggle('sel', selected);
  ui.confWidget(page.widgets, button, row, 0, () => openGlossary(ui, fromTitle), { sound: 1 });

  // MADE BY SORA badge is exclusive to Arabic mode only
  if (isArabic) {
    const creditBadge = element('a', 'keyslot conf-credit-badge ar-keep');
    creditBadge.href = 'https://x.com/ali_soraa';
    creditBadge.target = '_blank';
    creditBadge.rel = 'noopener noreferrer';
    creditBadge.setAttribute('aria-label', 'MADE BY SORA');
    creditBadge.confId = 208;
    creditBadge.placeY = posY;
    creditBadge.style.left = '1320px';
    creditBadge.style.top = `${posY}px`;
    creditBadge.style.width = '380px';
    creditBadge.style.height = '52px';
    creditBadge.innerHTML = `<span class="conf-credit-x-icon"><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></span><span class="conf-credit-title">MADE BY SORA</span><span class="conf-credit-dot">·</span><span class="conf-credit-user">@ali_soraa</span>`;
    creditBadge.setSelected = selected => creditBadge.classList.toggle('sel', selected);
    ui.confWidget(page.widgets, creditBadge, row, 2, () => window.open('https://x.com/ali_soraa', '_blank'), { sound: 1 });
  }
}

export function openGlossary(ui, fromTitle = false) {
  const page = ui.begin('glossary', { blur: !fromTitle, title: fromTitle ? 'hold' : null });
  page.classList.add('glossary-page');
  ui.menuBackground(page, { settled: true });
  const backdrop = element('div', 'sp glossary-backdrop');
  page.append(backdrop);
  const list = element('div', 'glossary-scroll');
  const content = element('article', 'glossary-content');
  content.dir = 'rtl';
  content.append(element('h1', 'glossary-heading', 'دليل المصطلحات'));
  const creditCard = element('div', 'glossary-credits-card');
  creditCard.innerHTML = `<div class="glossary-credits-title">مشروع تعريب Tsukihime -A piece of blue glass moon-</div><div class="glossary-credits-row"><span class="glossary-credits-author">MADE BY <strong>SORA</strong></span><span class="glossary-credits-pipe">|</span><a href="https://x.com/ali_soraa" target="_blank" rel="noopener noreferrer" class="glossary-credits-link"><svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg><span>@ali_soraa</span></a></div>`;
  content.append(creditCard);
  const definitions = element('dl', 'glossary-entries');
  for (const entry of GUIDE_ENTRIES) {
    const heading = element('dt', 'glossary-term');
    heading.append(element('span', 'glossary-arabic', entry.term));
    const english = element('bdi', 'glossary-original', entry.source === 'Magic / True Magic' ? 'True Magic' : entry.source);
    english.dir = 'ltr';
    heading.append(english);
    definitions.append(heading);
    if (entry.description) definitions.append(element('dd', 'glossary-description', entry.description));
  }
  content.append(definitions);
  list.append(content);
  page.append(list);
  ui.scrollBar(page, list, () => list.scrollHeight > list.clientHeight + 1);
  ui.touchDrag(list, null, amount => { list.scrollTop += amount; });
  ui.helpBar(page, ['Back', 'Scroll']);
  ui.backFn = () => ui.config('system', fromTitle);
  ui.backSound = 2;
  ui.keyFn = event => {
    if (['F5', 'F11', 'F12'].includes(event.key)) return false;
    if (['Escape', 'Backspace'].includes(event.key)) ui.back();
    else if (event.key === 'ArrowDown') list.scrollTop += 100;
    else if (event.key === 'ArrowUp') list.scrollTop -= 100;
    else if (['PageDown', ' '].includes(event.key)) list.scrollTop += list.clientHeight * .8;
    else if (event.key === 'PageUp') list.scrollTop -= list.clientHeight * .8;
    else if (event.key === 'Home') list.scrollTop = 0;
    else if (event.key === 'End') list.scrollTop = list.scrollHeight;
    return true;
  };
}
