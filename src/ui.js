// ===== Iconen =====
const ICON = {
  plus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
  links: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
  rechts: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>',
  sluit: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  ster: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.8l-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z"/></svg>',
  bord: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/></svg>',
  week: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>',
  pot: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3.5h10M8.5 3.5V7C6.3 8 5 9.6 5 12v6a2.5 2.5 0 002.5 2.5h9A2.5 2.5 0 0019 18v-6c0-2.4-1.3-4-3.5-5V3.5"/><path d="M5 13.5h14"/></svg>',
  regel: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h9M18 7h2M4 17h3M11 17h9"/><circle cx="15.5" cy="7" r="2.3"/><circle cx="8.5" cy="17" r="2.3"/></svg>',
  fiets: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="6" cy="16" r="3.5"/><circle cx="18" cy="16" r="3.5"/><path d="M6 16l3.5-7h6L18 16M9.5 9L8 6H5.5M13 9l1.5-3H17"/></svg>',
  prul: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M10 7V5h4v2M7 7l1 12.5h8L17 7"/></svg>'
};

const $ = (s, el = document) => el.querySelector(s);
const badge = (pts, zero) => `<span class="pts${zero || pts === 0 ? ' pts-zero' : ''} tnum">${pts}</span>`;
const regelTekst = p => p.zero ? 'ZeroPoints' : p.regel === 'vet' ? 'Vetregel' : p.regel === 'vast' ? 'Vaste punten' : '';
const regelBadge = p => { const t = regelTekst(p); return t ? `<span class="tag${p.zero ? ' tag-zero' : ''}">${t}</span>` : ''; };

// ===== Meldingen =====
let toastT;
function toast(msg, opt) {
  const el = $('#toast');
  el.innerHTML = `<span>${esc(msg)}</span>${opt && opt.actie ? `<button class="toast-btn" type="button">${esc(opt.actie)}</button>` : ''}`;
  el.classList.add('show');
  if (opt && opt.actie) el.querySelector('button').onclick = () => { el.classList.remove('show'); opt.fn(); };
  clearTimeout(toastT);
  toastT = setTimeout(() => el.classList.remove('show'), opt && opt.actie ? 5000 : 2600);
}

// ===== Panelen (sheets) =====
const sheets = [];
function openSheet(html, opt = {}) {
  const wrap = document.createElement('div');
  wrap.className = 'sheet-wrap';
  wrap.innerHTML = `<div class="sheet-backdrop" data-close></div><div class="sheet ${opt.cls || ''}" role="dialog" aria-modal="true" tabindex="-1">${html}</div>`;
  document.body.appendChild(wrap);
  wrap._onClose = opt.onClose;
  sheets.push(wrap);
  document.body.classList.add('noscroll');
  wrap.addEventListener('click', e => { if (e.target.closest('[data-close]')) closeSheet(); });
  requestAnimationFrame(() => requestAnimationFrame(() => wrap.classList.add('open')));
  const sh = wrap.querySelector('.sheet');
  try { sh.focus({ preventScroll: true }); } catch (e) { }
  return sh;
}
function closeSheet() {
  const w = sheets.pop();
  if (!w) return;
  w.classList.remove('open');
  setTimeout(() => w.remove(), 220);
  if (!sheets.length) document.body.classList.remove('noscroll');
  if (w._onClose) w._onClose();
}
function closeAllSheets() { while (sheets.length) closeSheet(); }
document.addEventListener('keydown', e => { if (e.key === 'Escape' && sheets.length) closeSheet(); });

const sheetHead = (titel, sub, extra = '') => `<div class="sheet-head"><div class="sh-row"><div class="sh-titles"><h2>${titel}</h2>${sub ? `<p class="sh-sub">${sub}</p>` : ''}</div>${extra}<button class="icon-btn" data-act="sluit" aria-label="Sluiten">${ICON.sluit}</button></div></div>`;

function vraag({ titel, tekst, ok = 'Ja', annuleer = 'Annuleren', gevaar = false }) {
  return new Promise(res => {
    let klaar = false;
    const done = v => { if (!klaar) { klaar = true; res(v); } };
    const sh = openSheet(`${sheetHead(esc(titel), '')}<div class="sheet-body"><p class="lead">${esc(tekst)}</p><div class="stack"><button class="btn ${gevaar ? 'btn-danger' : 'btn-primary'} btn-lg" data-act="ok">${esc(ok)}</button><button class="btn btn-soft btn-lg" data-act="nee">${esc(annuleer)}</button></div></div>`, { cls: 'sheet-small', onClose: () => done(false) });
    sh.addEventListener('click', e => {
      const a = e.target.closest('[data-act]'); if (!a) return;
      if (a.dataset.act === 'ok') { done(true); closeSheet(); }
      else { done(false); closeSheet(); }
    });
  });
}

// ===== Lijsten =====
function recentProducts(max) {
  const seen = new Set(), out = [];
  const log = [...S.log].sort((a, b) => b.ts - a.ts);
  for (const e of log) {
    if (seen.has(e.pid)) continue; seen.add(e.pid);
    const p = P(e.pid); if (p) out.push(p);
    if (out.length >= max) break;
  }
  return out;
}
const byUsage = (a, b) => (usage()[b.id] || 0) - (usage()[a.id] || 0) || a.naam.localeCompare(b.naam, 'nl');
function searchProducts(q) {
  const words = norm(q).split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  return S.products.filter(p => { const h = norm(p.naam + ' ' + p.cat); return words.every(w => h.includes(w)); })
    .sort((a, b) => (norm(b.naam).startsWith(words[0]) - norm(a.naam).startsWith(words[0])) || byUsage(a, b)).slice(0, 60);
}
function prodRow(p, act = 'kies') {
  const lp = lastPortion(p), por = p.porties[lp.pi] || p.porties[0];
  if (!por) return '';
  const pts = entryPoints(p, por, lp.qty), kcal = nutr(p, por.g).kcal * lp.qty;
  const hoeveel = (lp.qty !== 1 ? fmtQty(lp.qty) + ' × ' : '') + por.label;
  return `<button class="row" data-act="${act}" data-id="${p.id}"><span class="row-main"><span class="row-name">${esc(p.naam)}${p.fav ? ' <span class="fav" aria-label="favoriet">★</span>' : ''}</span><span class="row-sub">${esc(hoeveel)} · ${nf0.format(kcal)} kcal${p.regel === 'vet' ? ' · vetregel' : ''}</span></span>${badge(pts, p.zero)}</button>`;
}
function mealPoints(m) {
  let pts = 0, kcal = 0; const namen = [];
  for (const it of m.items) {
    const p = P(it.pid); if (!p) continue;
    const por = p.porties[it.pi] || p.porties[0];
    pts += entryPoints(p, por, it.qty); kcal += nutr(p, por.g).kcal * it.qty; namen.push(p.naam);
  }
  return { pts, kcal, namen };
}
function mealCard(m) {
  const r = mealPoints(m);
  return `<div class="mealcard"><div class="mc-top"><span class="row-main"><span class="row-name">${esc(m.naam)}</span><span class="row-sub">${esc(r.namen.join(', ') || 'Geen producten meer')} · ${nf0.format(r.kcal)} kcal</span></span>${badge(r.pts, false)}</div><div class="mc-actions"><button class="btn btn-primary btn-sm" data-act="maaltijd-add" data-id="${m.id}">Toevoegen</button><button class="btn btn-ghost btn-sm" data-act="maaltijd-edit" data-id="${m.id}">Aanpassen</button></div></div>`;
}

// ===== Weergaven =====
const app = () => $('#app');
function render() {
  const t = $('#topbar'), v = $('#view');
  if (S.view === 'week') renderWeek(t, v);
  else if (S.view === 'producten') renderProducten(t, v);
  else if (S.view === 'instellingen') renderInstellingen(t, v);
  else renderVandaag(t, v);
  for (const b of document.querySelectorAll('.tabbar [data-tab]')) b.setAttribute('aria-current', b.dataset.tab === S.view ? 'page' : 'false');
}

function banners() {
  const s = S.settings, out = [];
  if (BUILD === 'artifact' && !s.testMeldingWeg) out.push(`<div class="notice"><p><b>Testversie.</b> Wat je hier invoert, blijft alleen in deze browser en kan verloren gaan. Voor dagelijks gebruik installeer je de app op je iPhone.</p><button class="btn btn-soft btn-sm" data-act="test-weg">Begrepen</button></div>`);
  if (!S.storageOK) out.push(`<div class="notice notice-warn"><p>Je gegevens kunnen in deze weergave niet bewaard worden. Wat je invoert, verdwijnt als je de app sluit.</p></div>`);
  if (!s.budgetIngesteld) out.push(`<div class="notice"><p>Stel eerst je puntenbudget in. Tot dan reken ik met 30 dagpunten en 28 punten weekreserve.</p><button class="btn btn-primary btn-sm" data-act="naar-budget">Budget instellen</button></div>`);
  if (BUILD === 'pwa' && S.storageOK && new Set(S.log.map(e => e.date)).size >= 3) {
    const d = s.lastBackup ? daysBetween(s.lastBackup, todayKey()) : null;
    if (d === null || d >= 7) out.push(`<div class="notice"><p>${d === null ? 'Je hebt nog geen back-up gemaakt.' : `Je laatste back-up is van ${d} dagen geleden.`} Een back-upbestand beschermt je dagboek als er iets met je telefoon gebeurt.</p><button class="btn btn-soft btn-sm" data-act="backup-nu">Back-up maken</button></div>`);
  }
  return out.join('');
}

function entryRow(e) {
  const kcal = (e.unitN && e.unitN.kcal || 0) * e.qty;
  return `<button class="row" data-act="entry" data-id="${e.id}"><span class="row-main"><span class="row-name">${esc(e.naam)}</span><span class="row-sub">${e.qty !== 1 ? fmtQty(e.qty) + ' × ' : ''}${esc(e.portie)} · ${nf0.format(kcal)} kcal</span></span>${badge(e.punten, e.zero)}</button>`;
}

function nutriGrid(st, deel = 1) {
  const f = x => nf0.format(x / deel);
  return `<div class="nutri-grid tnum"><div class="nutri-kcal"><span class="nv-big">${f(st.kcal)}</span><span class="nl">kcal</span></div><div class="nutri-macros"><div><span class="nv">${f(st.eiwit)} g</span><span class="nl">eiwit</span></div><div><span class="nv">${f(st.kh)} g</span><span class="nl">koolhydraten</span></div><div><span class="nv">${f(st.vet)} g</span><span class="nl">vet</span></div><div><span class="nv">${f(st.vezels)} g</span><span class="nl">vezels</span></div></div></div>
  <p class="nutri-note tnum">Waarvan ${f(st.zeroKcal)} kcal uit ZeroPoints-producten. Fruit: ${fmtQty(Math.round(st.fruitPorties / deel * 2) / 2)} ${Math.round(st.fruitPorties / deel * 2) / 2 === 1 ? 'portie' : 'porties'}, ongeveer ${f(st.fruitKcal)} kcal.</p>`;
}

function renderVandaag(top, view) {
  const k = S.day, t = todayKey(), B = S.settings.dagBudget, st = dayStats(k), wi = weekInfo(weekStartKey(k));
  const rest = B - st.punten, overDag = Math.max(0, -rest);
  const eyebrow = k === t ? '<span class="eyebrow">Vandaag</span>' : `<button class="eyebrow eyebrow-link" data-act="dag-vandaag">${k === addDays(t, -1) ? 'Gisteren' : k === addDays(t, 1) ? 'Morgen' : 'Andere dag'} · naar vandaag</button>`;
  top.innerHTML = `<div class="tb"><button class="icon-btn" data-act="dag" data-d="-1" aria-label="Vorige dag">${ICON.links}</button><div class="tb-mid">${eyebrow}<h1 class="tb-title">${fmtDate(k)}</h1></div><button class="icon-btn" data-act="dag" data-d="1" aria-label="Volgende dag">${ICON.rechts}</button></div>`;
  const pct = B > 0 ? Math.min(100, st.punten / B * 100) : 100;
  let h = `<section class="sum" aria-label="Punten">
    <div class="sum-top">
      <div class="sum-day"><div class="big tnum">${Math.max(0, rest)}</div><div class="big-label">${rest >= 0 ? 'dagpunten over' : 'dagpunten op'}</div></div>
      <div class="sum-week"><div class="mid tnum">${Math.max(0, wi.rest)}</div><div class="big-label">weekreserve over</div></div>
    </div>
    <div class="bar${overDag ? ' bar-over' : ''}" role="img" aria-label="${st.punten} van ${B} dagpunten gebruikt"><span style="width:${pct}%"></span></div>
    <p class="sum-line tnum">${st.punten} van ${B} dagpunten gebruikt${overDag ? ` · ${overDag} uit je weekreserve` : ''}</p>
    <p class="sum-line muted tnum">Weekreserve ${wi.reserve}${wi.bonus ? ` + ${wi.bonus} door beweging` : ''}${wi.over ? `, ${wi.over} gebruikt` : ''}${wi.rest < 0 ? `. Deze week ${-wi.rest} boven je reserve.` : ''}</p>
  </section>
  <div class="actions">
    <button class="btn btn-primary btn-lg" data-act="toevoegen">${ICON.plus}<span>Eten toevoegen</span></button>
    <button class="btn btn-soft btn-lg" data-act="beweging">${ICON.fiets}<span>Beweging</span></button>
  </div>
  <button class="btn-craving" data-act="eetdrang"><span class="craving-t">Ik heb eetdrang</span><span class="craving-s">Wat kan ik eten?</span>${ICON.rechts}</button>
  ${banners()}`;
  for (const [m, label] of MOMENTEN) {
    const es = S.log.filter(e => e.date === k && e.moment === m).sort((a, b) => a.ts - b.ts);
    const som = es.reduce((s, e) => s + e.punten, 0);
    h += `<section class="meal"><div class="meal-head"><h2>${label}</h2><span class="meal-pts tnum">${es.length ? som + ' p' : ''}</span><button class="icon-btn icon-btn-soft" data-act="toevoegen" data-moment="${m}" aria-label="Toevoegen aan ${label.toLowerCase()}">${ICON.plus}</button></div>
    ${es.length ? `<div class="list">${es.map(entryRow).join('')}</div><button class="link" data-act="bewaar-maaltijd" data-moment="${m}">Bewaar als vaste maaltijd</button>` : ''}</section>`;
  }
  h += `<details class="nutri"${S.settings.toonVoeding ? ' open' : ''}><summary>Voedingswaarden ${k === t ? 'vandaag' : 'deze dag'}</summary>${nutriGrid(st)}<p class="nutri-note muted">Schattingen op basis van gemiddelde waarden per portie.</p></details>`;
  view.innerHTML = h;
}

function renderWeek(top, view) {
  const wk = S.week, wi = weekInfo(wk), t = todayKey(), B = S.settings.dagBudget, isNu = wk === weekStartKey(t);
  const eyebrow = isNu ? '<span class="eyebrow">Deze week</span>' : '<button class="eyebrow eyebrow-link" data-act="week-nu">Naar deze week</button>';
  top.innerHTML = `<div class="tb"><button class="icon-btn" data-act="week" data-d="-1" aria-label="Vorige week">${ICON.links}</button><div class="tb-mid">${eyebrow}<h1 class="tb-title">${fmtShort(wk)} tot ${fmtShort(addDays(wk, 6))}</h1></div><button class="icon-btn" data-act="week" data-d="1" aria-label="Volgende week">${ICON.rechts}</button></div>`;
  let h = `<section class="card ledger tnum"><h2 class="card-title">Weekreserve</h2>
    <div class="lr"><span>Startreserve</span><span>${wi.reserve}</span></div>
    <div class="lr"><span>Verdiend met beweging</span><span>+ ${wi.bonus}</span></div>
    <div class="lr"><span>Gebruikt boven je dagbudget</span><span>− ${wi.over}</span></div>
    <div class="lr lr-total"><span>Over</span><span>${wi.rest}</span></div></section>`;
  h += `<section class="card"><h2 class="card-title">Punten per dag</h2><div class="days">${wi.days.map(d => {
    const dd = fromKey(d.k), pct = B > 0 ? Math.min(100, d.st.punten / B * 100) : 0;
    return `<button class="dayrow${d.k === t ? ' is-today' : ''}" data-act="open-dag" data-k="${d.k}"><span class="dl">${DAGEN_KORT[dd.getDay()]} ${dd.getDate()}</span><span class="bar bar-sm${d.o ? ' bar-over' : ''}"><span style="width:${pct}%"></span></span><span class="dn tnum${d.st.n ? '' : ' muted'}">${d.st.punten}<small>/${B}</small></span></button>`;
  }).join('')}</div><p class="hint">Je dagbudget is ${B}. Wat erboven gaat, komt uit je weekreserve.</p></section>`;
  const gevuld = wi.days.filter(d => d.st.n > 0);
  if (gevuld.length) {
    const som = { kcal: 0, eiwit: 0, kh: 0, vet: 0, vezels: 0, zeroKcal: 0, fruitKcal: 0, fruitPorties: 0 };
    for (const d of gevuld) for (const x in som) som[x] += d.st[x];
    h += `<section class="card"><h2 class="card-title">Gemiddeld per dag</h2><p class="hint">Over ${gevuld.length} ${gevuld.length === 1 ? 'dag' : 'dagen'} met registraties.</p>${nutriGrid(som, gevuld.length)}</section>`;
  }
  h += `<section class="card"><div class="card-head"><h2 class="card-title">Beweging</h2><button class="btn btn-soft btn-sm" data-act="beweging">Noteren</button></div>
    ${wi.acts.length ? `<div class="list">${wi.acts.sort((a, b) => a.date.localeCompare(b.date) || a.ts - b.ts).map(a => `<div class="row row-static"><span class="row-main"><span class="row-name">${esc(a.naam)}</span><span class="row-sub">${fmtDate(a.date)} · ${a.minuten} min</span></span><span class="pts pts-bonus tnum">+${a.punten}</span><button class="icon-btn" data-act="act-del" data-id="${a.id}" aria-label="Verwijder ${esc(a.naam)}">${ICON.prul}</button></div>`).join('')}</div>` : '<p class="empty">Nog geen beweging genoteerd deze week.</p>'}</section>`;
  view.innerHTML = h;
}

function renderProducten(top, view) {
  top.innerHTML = `<div class="tb"><div class="tb-mid tb-left"><span class="eyebrow">${S.products.length} producten</span><h1 class="tb-title">Producten</h1></div><button class="btn btn-primary btn-sm" data-act="prod-nieuw">${ICON.plus}<span>Nieuw</span></button></div>`;
  const cats = CATS.filter(c => S.products.some(p => p.cat === c));
  const chip = (id, l) => `<button class="chip" data-act="prod-cat" data-cat="${esc(id)}" aria-pressed="${S.prodCat === id}">${esc(l)}</button>`;
  view.innerHTML = `<input id="prod-zoek" class="search" type="search" placeholder="Zoek een product" autocomplete="off" aria-label="Zoek een product" value="${esc(S.prodQ)}">
    <div class="chips chips-scroll">${chip('alle', 'Alle')}${chip('fav', 'Favorieten')}${chip('zero', 'ZeroPoints')}${cats.map(c => chip(c, c)).join('')}</div>
    <p class="hint">Tik op een product om porties, punten of de ZeroPoints-instelling aan te passen.</p>
    <div id="prod-list"></div>`;
  renderProdList();
}
function renderProdList() {
  const el = $('#prod-list'); if (!el) return;
  const q = S.prodQ.trim();
  let list = q ? searchProducts(q) : [...S.products];
  if (S.prodCat === 'fav') list = list.filter(p => p.fav);
  else if (S.prodCat === 'zero') list = list.filter(p => p.zero);
  else if (S.prodCat !== 'alle') list = list.filter(p => p.cat === S.prodCat);
  if (!list.length) { el.innerHTML = `<p class="empty">${S.prodCat === 'fav' ? 'Nog geen favorieten. Tik op de ster bij een product.' : 'Geen producten gevonden.'}</p>`; return; }
  if (q) { el.innerHTML = `<div class="list">${list.map(p => prodRow(p, 'prod-open')).join('')}</div>`; return; }
  let h = '';
  for (const c of CATS) {
    const g = list.filter(p => p.cat === c).sort((a, b) => a.naam.localeCompare(b.naam, 'nl'));
    if (g.length) h += `<h3 class="list-h">${esc(c)}</h3><div class="list">${g.map(p => prodRow(p, 'prod-open')).join('')}</div>`;
  }
  const rest = list.filter(p => !CATS.includes(p.cat));
  if (rest.length) h += `<h3 class="list-h">Overige</h3><div class="list">${rest.map(p => prodRow(p, 'prod-open')).join('')}</div>`;
  el.innerHTML = h;
}

function storageStatus() {
  if (!S.storageOK) return 'Opslag is niet beschikbaar in deze weergave. Gegevens verdwijnen als je de app sluit.';
  if (S.persistent === true) return 'Je gegevens staan blijvend op dit toestel.';
  return 'Je gegevens staan op dit toestel. Het systeem kan websitegegevens in uitzonderlijke gevallen opruimen, dus maak geregeld een back-up.';
}

function renderInstellingen(top, view) {
  const s = S.settings, pr = s.profiel, F = s.formule;
  top.innerHTML = `<div class="tb"><div class="tb-mid tb-left"><span class="eyebrow">Jouw regels</span><h1 class="tb-title">Instellingen</h1></div></div>`;
  const inp = (id, attr, val, label, extra = '') => `<label class="field" for="${id}"><span>${label}</span><input id="${id}" ${attr} inputmode="decimal" value="${esc(val)}" ${extra}></label>`;
  const gem = gemetenZeroKcal();
  view.innerHTML = `
  <section class="card" id="sec-budget"><h2 class="card-title">Puntenbudget</h2>
    <div class="grid2">${inp('set-dag', 'data-set="dagBudget"', s.dagBudget, 'Dagpunten')}${inp('set-week', 'data-set="weekReserve"', s.weekReserve, 'Weekreserve')}</div>
    <p class="hint">Bewegingspunten komen bovenop je weekreserve en starten elke maandag opnieuw op nul. Ongebruikte dagpunten schuiven niet door.</p>
  </section>
  <section class="card" id="sec-voorstel"><h2 class="card-title">Budget berekenen</h2>
    <p class="hint">Op basis van je energieverbruik, een gematigd tekort en wat je gemiddeld uit ZeroPoints eet. Deze gegevens blijven op dit toestel.</p>
    <div class="seg" role="group" aria-label="Geslacht"><button data-act="geslacht" data-v="man" aria-pressed="${pr.geslacht === 'man'}">Man</button><button data-act="geslacht" data-v="vrouw" aria-pressed="${pr.geslacht === 'vrouw'}">Vrouw</button></div>
    <div class="grid2">${inp('pr-leeftijd', 'data-prof="leeftijd"', pr.leeftijd, 'Leeftijd')}${inp('pr-lengte', 'data-prof="lengte"', pr.lengte, 'Lengte (cm)')}${inp('pr-gewicht', 'data-prof="gewicht"', pr.gewicht, 'Gewicht (kg)')}${inp('pr-streef', 'data-prof="streefgewicht"', pr.streefgewicht, 'Streefgewicht (kg)')}</div>
    <label class="field" for="pr-act"><span>Hoe actief ben je overdag?</span><select id="pr-act" data-prof="activiteit">${ACTNIVEAUS.map(([v, l]) => `<option value="${v}"${num(pr.activiteit) === v ? ' selected' : ''}>${l}</option>`).join('')}</select></label>
    <div class="grid2">${inp('pr-tekort', 'data-prof="tekort"', pr.tekort, 'Tekort (kcal per dag)')}${inp('pr-zero', 'data-prof="zeroKcal"', pr.zeroKcal, 'Kcal uit ZeroPoints per dag')}</div>
    ${gem && gem.n >= 5 ? `<p class="hint">In je dagboek kwam de voorbije ${gem.n} dagen gemiddeld ${nf0.format(gem.gem)} kcal per dag uit ZeroPoints-producten. <button class="link link-inline" data-act="gebruik-gemeten" data-v="${Math.round(gem.gem)}">Gebruik deze waarde</button></p>` : '<p class="hint">Na een week noteren toont de app hier hoeveel kcal je echt uit ZeroPoints-producten haalt.</p>'}
    ${inp('pr-res', 'data-prof="reservePerDag"', pr.reservePerDag, 'Punten per dag naar je weekreserve')}
    <div id="voorstel-uit"></div>
  </section>
  <section class="card"><h2 class="card-title">Puntenformule</h2>
    <p class="formula tnum" id="formule-tekst"></p>
    <div class="grid3">${inp('f-kcal', 'data-form="kcal"', F.kcal, 'kcal per punt')}${inp('f-eiwit', 'data-form="eiwit"', F.eiwit, 'g eiwit per punt korting')}${inp('f-vezels', 'data-form="vezels"', F.vezels, 'g vezels per punt korting')}</div>
    ${inp('f-vet', 'data-set="vetPerKl"', s.vetPerKl, 'Bereidingsvet: punten per koffielepel')}
    <p class="hint">Volgorde: eerst ZeroPoints, dan de vetregel, dan vaste punten, anders deze formule. Een aanpassing geldt voor wat je vanaf nu noteert; je dagboek van vroeger blijft zoals het was.</p>
    <button class="link" data-act="formule-standaard">Standaardwaarden terugzetten</button>
  </section>
  <section class="card"><h2 class="card-title">Bewegingspunten</h2>
    <div class="act-types">${s.activiteiten.map((a, i) => `<div class="act-type"><input id="at-n-${i}" aria-label="Activiteit" data-acti="${i}" data-f="naam" value="${esc(a.naam)}"><label class="mini"><input id="at-m-${i}" aria-label="Minuten" inputmode="numeric" data-acti="${i}" data-f="min" value="${a.min}"><span>min</span></label><label class="mini"><span>+</span><input id="at-p-${i}" aria-label="Bonuspunten" inputmode="numeric" data-acti="${i}" data-f="punten" value="${a.punten}"></label><button class="icon-btn" data-act="at-weg" data-i="${i}" aria-label="Verwijder ${esc(a.naam)}">${ICON.prul}</button></div>`).join('')}</div>
    <button class="btn btn-soft btn-sm" data-act="at-nieuw">${ICON.plus}<span>Activiteit toevoegen</span></button>
    <p class="hint">Een aanmoediging, geen berekening van verbrande calorieën.</p>
  </section>
  <section class="card"><h2 class="card-title">Weergave</h2>
    <label class="switch-row" for="set-toon"><span>Voedingswaarden standaard openklappen</span><input type="checkbox" class="switch" id="set-toon" data-set="toonVoeding"${s.toonVoeding ? ' checked' : ''}></label>
  </section>
  <section class="card" id="sec-data"><h2 class="card-title">Gegevens en back-up</h2>
    <p>${storageStatus()}</p>
    <p class="hint">${s.lastBackup ? `Laatste back-up: ${fmtDate(s.lastBackup)}.` : 'Nog geen back-up gemaakt.'} ${S.log.length} registraties, ${S.products.length} producten, ${S.meals.length} vaste maaltijden.</p>
    <div class="stack">
      ${BUILD === 'pwa' ? '<button class="btn btn-primary" data-act="backup-bestand">Back-up bewaren als bestand</button>' : ''}
      <button class="btn btn-soft" data-act="backup-tekst">Back-up kopiëren als tekst</button>
      <button class="btn btn-soft" data-act="backup-terug">Back-up terugzetten</button>
    </div>
  </section>
  <section class="card about"><h2 class="card-title">Over deze app</h2>
    <p>De punten zijn jouw eigen regels, geen algemeen voedingsadvies. Calorieën en voedingswaarden zijn gemiddelden per standaardportie, zonder merkverschillen.</p>
    <p class="hint">Versie ${APP_VERSION}${BUILD === 'artifact' ? ' (testversie)' : ''}</p>
  </section>`;
  updateFormuleTekst(); updateVoorstel();
}
function updateFormuleTekst() {
  const el = $('#formule-tekst'); if (!el) return;
  const F = S.settings.formule;
  el.innerHTML = `punten = kcal ÷ <b>${nf1.format(F.kcal)}</b> − eiwit ÷ <b>${nf1.format(F.eiwit)}</b> − vezels ÷ <b>${nf1.format(F.vezels)}</b>`;
}
// Alleen vervangen als de inhoud echt verandert: anders verdwijnt een knop net terwijl je erop tikt.
function setHtml(el, html) { if (el._html !== html) { el._html = html; el.innerHTML = html; } }
function updateVoorstel() {
  const out = $('#voorstel-uit'); if (!out) return;
  const v = budgetVoorstel(S.settings.profiel);
  if (!v) { setHtml(out, '<p class="hint">Kies man of vrouw en vul leeftijd, lengte en gewicht in om het voorstel te zien.</p>'); return; }
  const pr = S.settings.profiel, act = (ACTNIVEAUS.find(a => a[0] === num(pr.activiteit)) || [1.375])[0];
  setHtml(out, `<div class="calc tnum">
    <div class="lr"><span>Rustverbruik</span><span>${nf0.format(v.bmr)} kcal</span></div>
    <div class="lr"><span>Dagverbruik (× ${new Intl.NumberFormat('nl-BE', { maximumFractionDigits: 3 }).format(act)})</span><span>${nf0.format(v.tdee)} kcal</span></div>
    <div class="lr"><span>Doel (− ${nf0.format(num(pr.tekort) || 0)} kcal)</span><span>${nf0.format(v.doel)} kcal</span></div>
    <div class="lr"><span>Voor punten (− ${nf0.format(v.zk)} kcal ZeroPoints)</span><span>${nf0.format(v.puntenKcal)} kcal</span></div>
    <div class="lr"><span>Punten per dag (÷ ${nf1.format(S.settings.formule.kcal)})</span><span>${v.perDag}</span></div>
    <div class="lr lr-total"><span>Voorstel</span><span>${v.dag} per dag + ${v.week} weekreserve</span></div>
  </div>
  ${v.begrensd ? `<p class="hint">Het doel is begrensd op ${v.minimum} kcal per dag, zodat het haalbaar blijft.</p>` : ''}
  <button class="btn btn-primary btn-block" data-act="voorstel-gebruik" data-dag="${v.dag}" data-week="${v.week}">Gebruik dit voorstel</button>
  <p class="hint">Een startpunt. Na drie à vier weken kun je bijsturen op basis van je gewichtstrend.</p>`);
}

// ===== Toevoegen =====
function openToevoegen(moment, date) {
  date = date || S.day;
  const st = { moment: moment || (date === todayKey() ? momentNu() : 'middag'), tab: S.log.length ? 'recent' : 'alles', q: '', cat: '', added: 0 };
  const sh = openSheet(`<div class="sheet-head">
      <div class="sh-row"><div class="sh-titles"><h2>Toevoegen</h2>${date !== todayKey() ? `<p class="sh-sub">${fmtDate(date)}</p>` : ''}</div><button class="btn btn-soft btn-sm" data-act="klaar">Klaar</button></div>
      <div class="seg seg-4" role="group" aria-label="Moment" data-slot="mom"></div>
      <input id="zoek-add" class="search" type="search" placeholder="Zoek een product of maaltijd" autocomplete="off" enterkeyhint="search" aria-label="Zoek een product of maaltijd">
    </div><div class="sheet-body" data-slot="body"></div>`, { cls: 'sheet-tall', onClose: () => render() });
  const mom = $('[data-slot=mom]', sh), body = $('[data-slot=body]', sh), klaar = $('[data-act=klaar]', sh);
  const ctx = {
    get moment() { return st.moment; }, date,
    onAdded: () => { st.added++; klaar.textContent = `Klaar (${st.added})`; if (!st.q && st.tab === 'recent') drawBody(); }
  };
  const drawMom = () => { mom.innerHTML = MOMENTEN.map(([m, l]) => `<button data-act="mom" data-m="${m}" aria-pressed="${m === st.moment}">${l}</button>`).join(''); };
  const nieuwKnop = q => `<button class="btn btn-soft btn-block" data-act="nieuw">${ICON.plus}<span>${q ? `"${esc(q)}" als nieuw product` : 'Nieuw product'}</span></button>`;
  const drawBody = () => {
    const q = st.q.trim();
    let h = '';
    if (!q) {
      const av = P('avocado');
      h += `<div class="quick"><button class="quick-btn" data-act="vet"><span class="qb-t">Bereidingsvet</span><span class="qb-s">${S.settings.vetPerKl} p per koffielepel</span></button>${av ? `<button class="quick-btn" data-act="avocado"><span class="qb-t">Avocado</span><span class="qb-s">¼ · ½ · hele</span></button>` : ''}</div>`;
      h += `<div class="tabs" role="tablist">${[['recent', 'Recent'], ['fav', 'Favorieten'], ['vast', 'Maaltijden'], ['alles', 'Alles']].map(([t, l]) => `<button role="tab" data-act="tab" data-tab="${t}" aria-selected="${st.tab === t}">${l}</button>`).join('')}</div>`;
      if (st.tab === 'recent') {
        const list = recentProducts(30);
        h += list.length ? `<div class="list">${list.map(p => prodRow(p)).join('')}</div>` : '<p class="empty">Wat je noteert, verschijnt hier, zodat je het de volgende keer meteen terugvindt.</p>';
      } else if (st.tab === 'fav') {
        const list = S.products.filter(p => p.fav).sort(byUsage);
        h += list.length ? `<div class="list">${list.map(p => prodRow(p)).join('')}</div>` : '<p class="empty">Tik bij een product op de ster om het hier te bewaren.</p>';
      } else if (st.tab === 'vast') {
        h += S.meals.length ? `<div class="meals">${S.meals.map(mealCard).join('')}</div>` : '<p class="empty">Noteer bijvoorbeeld je ontbijt en tik op het dagscherm op "Bewaar als vaste maaltijd". Daarna voeg je het hier met één tik toe.</p>';
      } else {
        const cats = CATS.filter(c => S.products.some(p => p.cat === c));
        h += `<div class="chips chips-scroll">${cats.map(c => `<button class="chip" data-act="cat" data-cat="${esc(c)}" aria-pressed="${st.cat === c}">${esc(c)}</button>`).join('')}</div>`;
        for (const c of cats) {
          if (st.cat && st.cat !== c) continue;
          const g = S.products.filter(p => p.cat === c).sort(byUsage);
          h += `<h3 class="list-h">${esc(c)}</h3><div class="list">${g.map(p => prodRow(p)).join('')}</div>`;
        }
        h += nieuwKnop('');
      }
    } else {
      const nq = norm(q);
      const meals = S.meals.filter(m => norm(m.naam).includes(nq));
      const prods = searchProducts(q);
      if (meals.length) h += `<h3 class="list-h">Vaste maaltijden</h3><div class="meals">${meals.map(mealCard).join('')}</div>`;
      h += prods.length ? `<div class="list">${prods.map(p => prodRow(p)).join('')}</div>` : `<p class="empty">Geen product gevonden voor "${esc(q)}".</p>`;
      h += nieuwKnop(q);
    }
    body.innerHTML = h;
  };
  drawMom(); drawBody();
  $('#zoek-add', sh).addEventListener('input', e => { st.q = e.target.value; drawBody(); });
  sh.addEventListener('click', async e => {
    const a = e.target.closest('[data-act]'); if (!a) return;
    const act = a.dataset.act;
    if (act === 'klaar' || act === 'sluit') closeSheet();
    else if (act === 'mom') { st.moment = a.dataset.m; drawMom(); }
    else if (act === 'tab') { st.tab = a.dataset.tab; drawBody(); body.scrollTop = 0; }
    else if (act === 'cat') { st.cat = st.cat === a.dataset.cat ? '' : a.dataset.cat; drawBody(); }
    else if (act === 'kies') { const p = P(a.dataset.id); if (p) openPortie(p, ctx); }
    else if (act === 'vet') openVet(ctx);
    else if (act === 'avocado') openAvocado(ctx);
    else if (act === 'maaltijd-add') await addMaaltijd(a.dataset.id, ctx);
    else if (act === 'maaltijd-edit') openMaaltijdEdit(a.dataset.id, drawBody);
    else if (act === 'nieuw') openProductEditor(null, { naam: st.q.trim(), onSaved: p => { drawBody(); openPortie(p, ctx); } });
  });
}

function openPortie(p, ctx) {
  const lp = lastPortion(p), st = { pi: lp.pi, qty: lp.qty };
  const sh = openSheet(`${sheetHead(esc(p.naam), `${esc(p.cat)} ${regelBadge(p)}`)}<div class="sheet-body" data-slot="b"></div>`);
  const b = $('[data-slot=b]', sh);
  const draw = () => {
    const por = p.porties[st.pi] || p.porties[0], pts = entryPoints(p, por, st.qty), n = nutr(p, por.g), q = st.qty;
    b.innerHTML = `<h3 class="lbl">Portie</h3>
      <div class="chips">${p.porties.map((x, i) => `<button class="chip chip-lg" data-act="pi" data-i="${i}" aria-pressed="${i === st.pi}"><span>${esc(x.label)}</span><small class="tnum">${nf1.format(num(x.g) || 0)} ${eenheid(p)} · ${portionPoints(p, x)} p</small></button>`).join('')}</div>
      <h3 class="lbl">Hoeveel</h3>
      <div class="qty"><button class="icon-btn icon-btn-soft" data-act="qmin" aria-label="Minder">−</button><output class="qty-v tnum">${fmtQty(q)}</output><button class="icon-btn icon-btn-soft" data-act="qplus" aria-label="Meer">+</button></div>
      <div class="chips">${[0.5, 1, 1.5, 2, 3].map(x => `<button class="chip" data-act="q" data-q="${x}" aria-pressed="${x === q}">${fmtQty(x)}</button>`).join('')}</div>
      <div class="result"><div class="result-pts"><span class="big tnum${pts === 0 ? ' is-zero' : ''}">${pts}</span><span class="big-label">${pts === 1 ? 'punt' : 'punten'}</span></div>
      <div class="result-n tnum"><b>${nf0.format(n.kcal * q)} kcal</b><br>${nf1.format(n.eiwit * q)} g eiwit · ${nf1.format(n.kh * q)} g koolhydraten<br>${nf1.format(n.vet * q)} g vet · ${nf1.format(n.vezels * q)} g vezels</div></div>
      <p class="hint">${esc(regelUitleg(p, por))}</p>${p.notitie ? `<p class="hint">${esc(p.notitie)}</p>` : ''}
      <button class="btn btn-primary btn-lg btn-block" data-act="add">Toevoegen aan ${momentLabel(ctx.moment).toLowerCase()}</button>
      <div class="row-actions"><button class="btn btn-ghost btn-sm${p.fav ? ' is-fav' : ''}" data-act="fav" aria-pressed="${!!p.fav}">${ICON.ster}<span>${p.fav ? 'Favoriet' : 'Bewaar als favoriet'}</span></button><button class="btn btn-ghost btn-sm" data-act="edit">Product aanpassen</button></div>`;
  };
  draw();
  sh.addEventListener('click', async e => {
    const a = e.target.closest('[data-act]'); if (!a) return;
    switch (a.dataset.act) {
      case 'sluit': closeSheet(); break;
      case 'pi': st.pi = +a.dataset.i; draw(); break;
      case 'q': st.qty = +a.dataset.q; draw(); break;
      case 'qmin': st.qty = Math.max(0.5, st.qty - 0.5); draw(); break;
      case 'qplus': st.qty = Math.min(20, st.qty + 0.5); draw(); break;
      case 'add': await addEntry(makeEntry(p, st.pi, st.qty, ctx.moment, ctx.date)); toast(`${p.naam} toegevoegd`); closeSheet(); if (ctx.onAdded) ctx.onAdded(); break;
      case 'fav': p.fav = !p.fav; await bewaar('products', p); draw(); break;
      case 'edit': openProductEditor(p, { onSaved: () => { if (st.pi >= p.porties.length) st.pi = 0; draw(); } }); break;
    }
  });
}

function openVet(ctx) {
  const vets = S.products.filter(p => p.regel === 'vet');
  if (!vets.length) { toast('Er staan geen bereidingsvetten in je productenlijst.'); return; }
  let sel = vets.find(v => v.id === S.settings.laatsteVet) || vets[0];
  const sh = openSheet(`${sheetHead('Bereidingsvet', `Elk vet telt hetzelfde: ${S.settings.vetPerKl} punten per koffielepel.`)}<div class="sheet-body" data-slot="b"></div>`);
  const b = $('[data-slot=b]', sh);
  const draw = () => {
    b.innerHTML = `<h3 class="lbl">Welk vet?</h3><div class="chips">${vets.map(v => `<button class="chip" data-act="soort" data-id="${v.id}" aria-pressed="${v.id === sel.id}">${esc(v.naam)}</button>`).join('')}</div>
    <h3 class="lbl">Hoeveel?</h3><div class="choices">${[1, 2, 3].map(n => `<button class="choice" data-act="kl" data-n="${n}"><span class="choice-t">${n} koffielepel${n > 1 ? 's' : ''}</span><span class="choice-p tnum">${n * S.settings.vetPerKl} p</span></button>`).join('')}</div>
    <p class="hint">Tik op een hoeveelheid om ze meteen toe te voegen aan ${momentLabel(ctx.moment).toLowerCase()}.</p>`;
  };
  draw();
  sh.addEventListener('click', async e => {
    const a = e.target.closest('[data-act]'); if (!a) return;
    if (a.dataset.act === 'sluit') closeSheet();
    else if (a.dataset.act === 'soort') { sel = P(a.dataset.id) || sel; S.settings.laatsteVet = sel.id; saveSettings(); draw(); }
    else if (a.dataset.act === 'kl') {
      const n = +a.dataset.n;
      let pi = sel.porties.findIndex(x => num(x.kl) === n), qty = 1;
      if (pi < 0) { pi = 0; qty = n / (num(sel.porties[0].kl) || 1); }
      await addEntry(makeEntry(sel, pi, qty, ctx.moment, ctx.date));
      S.settings.laatsteVet = sel.id; saveSettings();
      toast(`${n} koffielepel${n > 1 ? 's' : ''} ${sel.naam.toLowerCase()} toegevoegd`);
      closeSheet(); if (ctx.onAdded) ctx.onAdded();
    }
  });
}

function openAvocado(ctx) {
  const p = P('avocado');
  if (!p) { toast('Avocado staat niet meer in je productenlijst.'); return; }
  const sh = openSheet(`${sheetHead('Avocado', 'Vaste punten, ongeacht de grootte.')}<div class="sheet-body"><div class="choices">${p.porties.map((x, i) => `<button class="choice" data-act="av" data-i="${i}"><span class="choice-t">${esc(x.label)}</span><span class="choice-p tnum">${portionPoints(p, x)} p</span></button>`).join('')}</div><p class="hint">Tik om meteen toe te voegen aan ${momentLabel(ctx.moment).toLowerCase()}.</p></div>`);
  sh.addEventListener('click', async e => {
    const a = e.target.closest('[data-act]'); if (!a) return;
    if (a.dataset.act === 'sluit') closeSheet();
    else if (a.dataset.act === 'av') {
      const i = +a.dataset.i;
      await addEntry(makeEntry(p, i, 1, ctx.moment, ctx.date));
      toast(`${p.porties[i].label} toegevoegd`); closeSheet(); if (ctx.onAdded) ctx.onAdded();
    }
  });
}

async function addMaaltijd(id, ctx) {
  const m = S.meals.find(x => x.id === id); if (!m) return;
  let n = 0;
  for (const it of m.items) {
    const p = P(it.pid); if (!p) continue;
    const pi = p.porties[it.pi] ? it.pi : 0;
    await addEntry(makeEntry(p, pi, it.qty, ctx.moment, ctx.date)); n++;
  }
  toast(n ? `${m.naam} toegevoegd (${n} ${n === 1 ? 'product' : 'producten'})` : 'Deze maaltijd bevat geen bestaande producten meer.');
  if (n && ctx.onAdded) ctx.onAdded();
}

function openMaaltijdEdit(id, done) {
  const m = S.meals.find(x => x.id === id); if (!m) return;
  const d = clone(m);
  const sh = openSheet(`${sheetHead('Vaste maaltijd aanpassen', '')}<div class="sheet-body"><label class="field" for="mt-naam"><span>Naam</span><input id="mt-naam" value="${esc(d.naam)}"></label><h3 class="lbl">Producten</h3><div data-slot="items"></div><div class="stack"><button class="btn btn-primary btn-lg" data-act="opslaan">Opslaan</button><button class="btn btn-ghost" data-act="weg-alles">Deze maaltijd verwijderen</button></div></div>`);
  const items = $('[data-slot=items]', sh);
  const draw = () => {
    items.innerHTML = d.items.length ? `<div class="list">${d.items.map((it, i) => { const p = P(it.pid); return `<div class="row row-static"><span class="row-main"><span class="row-name">${esc(p ? p.naam : it.naam)}</span><span class="row-sub">${it.qty !== 1 ? fmtQty(it.qty) + ' × ' : ''}${esc(p && p.porties[it.pi] ? p.porties[it.pi].label : it.portie)}${p ? '' : ' · product bestaat niet meer'}</span></span><button class="icon-btn" data-act="weg" data-i="${i}" aria-label="Verwijder uit maaltijd">${ICON.prul}</button></div>`; }).join('')}</div>` : '<p class="empty">Geen producten meer in deze maaltijd.</p>';
  };
  draw();
  sh.addEventListener('click', async e => {
    const a = e.target.closest('[data-act]'); if (!a) return;
    const act = a.dataset.act;
    if (act === 'sluit') closeSheet();
    else if (act === 'weg') { d.items.splice(+a.dataset.i, 1); draw(); }
    else if (act === 'opslaan') {
      d.naam = $('#mt-naam', sh).value.trim() || m.naam;
      Object.assign(m, d); await bewaar('meals', m); toast('Maaltijd bewaard'); closeSheet(); if (done) done();
    } else if (act === 'weg-alles') {
      if (await vraag({ titel: 'Maaltijd verwijderen?', tekst: `"${m.naam}" verdwijnt uit je vaste maaltijden. Je dagboek blijft zoals het is.`, ok: 'Verwijderen', gevaar: true })) {
        S.meals = S.meals.filter(x => x.id !== id); await verwijder('meals', id); toast('Maaltijd verwijderd'); closeSheet(); if (done) done();
      }
    }
  });
}

function openBewaarMaaltijd(moment) {
  const es = S.log.filter(e => e.date === S.day && e.moment === moment).sort((a, b) => a.ts - b.ts);
  if (!es.length) return;
  const def = `Mijn ${momentLabel(moment).toLowerCase()}`;
  const sh = openSheet(`${sheetHead('Bewaar als vaste maaltijd', 'Daarna voeg je dit met één tik toe.')}<div class="sheet-body">
    <label class="field" for="bm-naam"><span>Naam</span><input id="bm-naam" value="${esc(def)}"></label>
    <div class="list">${es.map(e => `<div class="row row-static"><span class="row-main"><span class="row-name">${esc(e.naam)}</span><span class="row-sub">${e.qty !== 1 ? fmtQty(e.qty) + ' × ' : ''}${esc(e.portie)}</span></span>${badge(e.punten, e.zero)}</div>`).join('')}</div>
    <button class="btn btn-primary btn-lg btn-block" data-act="bewaar">Bewaren</button></div>`, { cls: 'sheet-small' });
  sh.addEventListener('click', async e => {
    const a = e.target.closest('[data-act]'); if (!a) return;
    if (a.dataset.act === 'sluit') closeSheet();
    else if (a.dataset.act === 'bewaar') {
      const naam = $('#bm-naam', sh).value.trim() || def;
      const m = { id: uid('m'), naam, items: es.map(x => ({ pid: x.pid, pi: x.pi || 0, qty: x.qty, naam: x.naam, portie: x.portie })) };
      S.meals.push(m); await bewaar('meals', m);
      toast(`"${naam}" bewaard bij je vaste maaltijden`); closeSheet();
    }
  });
}

function openEntry(id) {
  const e = S.log.find(x => x.id === id); if (!e) return;
  const st = { qty: e.qty, moment: e.moment };
  const sh = openSheet(`${sheetHead(esc(e.naam), `${esc(e.portie)} · ${fmtDate(e.date)}`)}<div class="sheet-body" data-slot="b"></div>`, { cls: 'sheet-small' });
  const b = $('[data-slot=b]', sh);
  const draw = () => {
    const pts = Math.round(e.unitPunten * st.qty), kcal = (e.unitN && e.unitN.kcal || 0) * st.qty;
    b.innerHTML = `<h3 class="lbl">Hoeveel</h3>
      <div class="qty"><button class="icon-btn icon-btn-soft" data-act="qmin" aria-label="Minder">−</button><output class="qty-v tnum">${fmtQty(st.qty)}</output><button class="icon-btn icon-btn-soft" data-act="qplus" aria-label="Meer">+</button><span class="qty-res tnum">${pts} p · ${nf0.format(kcal)} kcal</span></div>
      <h3 class="lbl">Moment</h3><div class="seg seg-4">${MOMENTEN.map(([m, l]) => `<button data-act="mom" data-m="${m}" aria-pressed="${m === st.moment}">${l}</button>`).join('')}</div>
      <div class="stack"><button class="btn btn-primary btn-lg" data-act="opslaan">Opslaan</button><button class="btn btn-ghost" data-act="weg">Verwijderen uit dagboek</button></div>`;
  };
  draw();
  sh.addEventListener('click', async ev => {
    const a = ev.target.closest('[data-act]'); if (!a) return;
    switch (a.dataset.act) {
      case 'sluit': closeSheet(); break;
      case 'qmin': st.qty = Math.max(0.5, st.qty - 0.5); draw(); break;
      case 'qplus': st.qty = Math.min(20, st.qty + 0.5); draw(); break;
      case 'mom': st.moment = a.dataset.m; draw(); break;
      case 'opslaan':
        e.qty = st.qty; e.moment = st.moment; e.punten = Math.round(e.unitPunten * e.qty);
        await bewaar('log', e); closeSheet(); render(); break;
      case 'weg':
        S.log = S.log.filter(x => x.id !== e.id); S._usage = null; await verwijder('log', e.id); closeSheet(); render();
        toast(`${e.naam} verwijderd`, { actie: 'Ongedaan maken', fn: async () => { S.log.push(e); S._usage = null; await bewaar('log', e); render(); } });
        break;
    }
  });
}

// ===== Eetdrang =====
function ideeInfo(idee) {
  let pts = 0, kcal = 0; const namen = [];
  for (const [pid, pi, q] of idee.items) {
    const p = P(pid); if (!p) return null;
    const por = p.porties[pi] || p.porties[0];
    pts += entryPoints(p, por, q); kcal += nutr(p, por.g).kcal * q; namen.push(p.naam);
  }
  return { pts, kcal, namen };
}
function openEetdrang() {
  const st = { tag: null };
  const ctx = { moment: 'tussendoor', date: S.day, onAdded: () => draw() };
  const sh = openSheet(`${sheetHead('Ik heb eetdrang', 'Waar heb je zin in?')}<div class="sheet-body" data-slot="b"></div>`, { cls: 'sheet-tall', onClose: () => render() });
  const b = $('[data-slot=b]', sh);
  const draw = () => {
    let h = `<div class="cravings">${TAGS.map(([t, l]) => `<button class="crave" data-act="tag" data-tag="${t}" aria-pressed="${st.tag === t}">${l}</button>`).join('')}</div>`;
    if (st.tag) {
      const B = S.settings.dagBudget, ds = dayStats(S.day), wi = weekInfo(weekStartKey(S.day));
      h += `<p class="hint tnum">Je hebt nog ${Math.max(0, B - ds.punten)} dagpunten en ${Math.max(0, wi.rest)} punten weekreserve.</p>`;
      const ideeen = IDEEEN.filter(i => i.tags.split(' ').includes(st.tag)).map(i => ({ i, r: ideeInfo(i) })).filter(x => x.r).sort((a, b) => a.r.pts - b.r.pts);
      if (ideeen.length) h += `<h3 class="list-h">Snelle ideeën</h3><div class="ideas">${ideeen.map(({ i, r }) => `<div class="idea"><div class="idea-top"><h4>${esc(i.naam)}</h4>${badge(r.pts, r.pts === 0)}</div><p>${esc(i.uitleg)}</p><p class="row-sub tnum">${esc(r.namen.join(', '))} · ongeveer ${nf0.format(r.kcal)} kcal</p><button class="btn btn-soft btn-sm" data-act="idee" data-id="${i.id}">${ICON.plus}<span>Toevoegen</span></button></div>`).join('')}</div>`;
      const prods = S.products.filter(p => (p.tags || []).includes(st.tag)).map(p => { const lp = lastPortion(p); return { p, pts: entryPoints(p, p.porties[lp.pi] || p.porties[0], lp.qty) }; })
        .sort((a, b) => a.pts - b.pts || (usage()[b.p.id] || 0) - (usage()[a.p.id] || 0)).slice(0, 15).map(x => x.p);
      if (prods.length) h += `<h3 class="list-h">Uit je producten</h3><div class="list">${prods.map(p => prodRow(p)).join('')}</div>`;
    } else {
      h += '<p class="hint">Kies wat je nu wil. Je krijgt ideeën en producten met hun punten en calorieën.</p>';
    }
    b.innerHTML = h;
  };
  draw();
  sh.addEventListener('click', async e => {
    const a = e.target.closest('[data-act]'); if (!a) return;
    const act = a.dataset.act;
    if (act === 'sluit') closeSheet();
    else if (act === 'tag') { st.tag = st.tag === a.dataset.tag ? null : a.dataset.tag; draw(); }
    else if (act === 'kies') { const p = P(a.dataset.id); if (p) openPortie(p, ctx); }
    else if (act === 'idee') {
      const i = IDEEEN.find(x => x.id === a.dataset.id); if (!i) return;
      for (const [pid, pi, q] of i.items) { const p = P(pid); if (p) await addEntry(makeEntry(p, p.porties[pi] ? pi : 0, q, ctx.moment, ctx.date)); }
      toast(`${i.naam} toegevoegd als tussendoortje`); draw();
    }
  });
}

// ===== Beweging =====
function openBeweging() {
  const types = S.settings.activiteiten, date = S.day;
  if (!types.length) { toast('Voeg eerst een activiteit toe bij Instellingen.'); return; }
  const st = { tid: types[0].id, min: types[0].min, dup: false };
  const sh = openSheet(`${sheetHead('Beweging', 'Elke beweging telt mee, niets moet. Bonuspunten gaan naar je weekreserve.')}<div class="sheet-body" data-slot="b"></div>`, { onClose: () => render() });
  const b = $('[data-slot=b]', sh);
  const type = () => types.find(x => x.id === st.tid) || types[0];
  const punten = () => { const t = type(); return Math.floor(st.min / Math.max(1, t.min)) * t.punten; };
  const draw = () => {
    const t = type(), pts = punten();
    b.innerHTML = `<h3 class="lbl">Wat heb je gedaan?</h3><div class="chips">${types.map(x => `<button class="chip chip-lg" data-act="type" data-id="${x.id}" aria-pressed="${x.id === t.id}"><span>${esc(x.naam)}</span><small>${x.min} min = +${x.punten}</small></button>`).join('')}</div>
      <h3 class="lbl">Hoe lang?</h3>
      <div class="qty"><button class="icon-btn icon-btn-soft" data-act="mmin" aria-label="5 minuten minder">−</button><output class="qty-v tnum">${st.min} min</output><button class="icon-btn icon-btn-soft" data-act="mplus" aria-label="5 minuten meer">+</button></div>
      <div class="chips">${[15, 30, 45, 60, 90].map(m => `<button class="chip" data-act="min" data-m="${m}" aria-pressed="${m === st.min}">${m} min</button>`).join('')}</div>
      <div class="result"><div class="result-pts"><span class="big tnum is-bonus">+${pts}</span><span class="big-label">voor je weekreserve</span></div></div>
      ${pts === 0 ? `<p class="hint">${esc(t.naam)} telt per ${t.min} minuten.</p>` : ''}
      ${st.dup ? `<div class="notice"><p>Je noteerde ${date === todayKey() ? 'vandaag' : 'op ' + fmtDate(date)} al ${st.min} minuten ${esc(t.naam.toLowerCase())}. Was dit een tweede keer?</p><div class="stack-h"><button class="btn btn-primary btn-sm" data-act="dup-ja">Ja, ook noteren</button><button class="btn btn-soft btn-sm" data-act="dup-nee">Nee</button></div></div>`
        : `<button class="btn btn-primary btn-lg btn-block" data-act="noteer"${pts === 0 ? ' disabled' : ''}>Noteren${date !== todayKey() ? ` voor ${fmtShort(date)}` : ''}</button>`}`;
  };
  const save = async () => {
    const t = type(), pts = punten();
    const a = { id: uid('a'), date, type: t.id, naam: t.naam, minuten: st.min, punten: pts, ts: Date.now() };
    S.activities.push(a); await bewaar('activities', a);
    toast(`+${pts} in je weekreserve`); closeSheet();
  };
  draw();
  sh.addEventListener('click', async e => {
    const a = e.target.closest('[data-act]'); if (!a) return;
    switch (a.dataset.act) {
      case 'sluit': closeSheet(); break;
      case 'type': { st.tid = a.dataset.id; st.min = type().min; st.dup = false; draw(); break; }
      case 'min': st.min = +a.dataset.m; st.dup = false; draw(); break;
      case 'mmin': st.min = Math.max(5, st.min - 5); st.dup = false; draw(); break;
      case 'mplus': st.min = Math.min(600, st.min + 5); st.dup = false; draw(); break;
      case 'noteer': {
        const t = type();
        if (S.activities.some(x => x.date === date && x.type === t.id && x.minuten === st.min)) { st.dup = true; draw(); }
        else await save();
        break;
      }
      case 'dup-ja': await save(); break;
      case 'dup-nee': st.dup = false; draw(); break;
    }
  });
}
async function delActiviteit(id) {
  const a = S.activities.find(x => x.id === id); if (!a) return;
  S.activities = S.activities.filter(x => x.id !== id); await verwijder('activities', id); render();
  toast(`${a.naam} verwijderd`, { actie: 'Ongedaan maken', fn: async () => { S.activities.push(a); await bewaar('activities', a); render(); } });
}

// ===== Product bewerken =====
function openProductEditor(p, opt = {}) {
  const nieuw = !p;
  const d = nieuw ? { id: uid('p'), naam: opt.naam || '', cat: 'Eigen producten', zero: false, regel: 'formule', eenheid: 'g', n: { kcal: '', eiwit: '', kh: '', vet: '', vezels: '' }, porties: [{ label: 'portie', g: 100 }], tags: [], fav: false, std: false, notitie: '' } : clone(p);
  if (!d.porties || !d.porties.length) d.porties = [{ label: 'portie', g: 100 }];
  const nv = [['kcal', 'kcal'], ['eiwit', 'eiwit (g)'], ['kh', 'koolhydraten (g)'], ['vet', 'vet (g)'], ['vezels', 'vezels (g)']];
  const sh = openSheet(`${sheetHead(nieuw ? 'Nieuw product' : 'Product aanpassen', d.std ? 'Standaardproduct. Je aanpassingen blijven bewaard.' : '')}<div class="sheet-body">
    <label class="field" for="pe-naam"><span>Naam</span><input id="pe-naam" value="${esc(d.naam)}" autocomplete="off"></label>
    <label class="field" for="pe-cat"><span>Categorie</span><select id="pe-cat">${CATS.map(c => `<option${c === d.cat ? ' selected' : ''}>${esc(c)}</option>`).join('')}</select></label>
    <label class="switch-row" for="pe-zero"><span><b>ZeroPoints</b><small>Altijd 0 punten. De calorieën tellen wel mee.</small></span><input type="checkbox" class="switch" id="pe-zero"${d.zero ? ' checked' : ''}></label>
    <div class="field"><span>Puntenregel</span><div class="seg" data-slot="regel"></div></div>
    <fieldset class="fs"><legend>Voedingswaarden per 100 <span data-slot="eh">${eenheid(d)}</span></legend>
      <div class="grid3">${nv.map(([k, l]) => `<label class="field" for="pe-n-${k}"><span>${l}</span><input id="pe-n-${k}" data-nv="${k}" inputmode="decimal" value="${esc(d.n[k])}"></label>`).join('')}
      <label class="field" for="pe-eh"><span>eenheid</span><select id="pe-eh"><option value="g"${d.eenheid !== 'ml' ? ' selected' : ''}>gram</option><option value="ml"${d.eenheid === 'ml' ? ' selected' : ''}>ml</option></select></label></div>
    </fieldset>
    <fieldset class="fs"><legend>Porties</legend><div data-slot="porties"></div><button class="btn btn-soft btn-sm" data-act="por-nieuw">${ICON.plus}<span>Portie toevoegen</span></button></fieldset>
    <fieldset class="fs"><legend>Past bij eetdrang</legend><div class="chips" data-slot="tags"></div></fieldset>
    <p class="err" role="alert" data-slot="err"></p>
    <div class="stack"><button class="btn btn-primary btn-lg" data-act="opslaan">Opslaan</button>${nieuw ? '' : '<button class="btn btn-ghost" data-act="verwijder">Product verwijderen</button>'}</div>
  </div>`, { cls: 'sheet-tall' });
  const regelSlot = $('[data-slot=regel]', sh), porSlot = $('[data-slot=porties]', sh), tagSlot = $('[data-slot=tags]', sh), err = $('[data-slot=err]', sh);
  const lees = () => {
    d.naam = $('#pe-naam', sh).value; d.cat = $('#pe-cat', sh).value; d.zero = $('#pe-zero', sh).checked; d.eenheid = $('#pe-eh', sh).value;
    for (const [k] of nv) d.n[k] = $(`#pe-n-${k}`, sh).value;
  };
  const tmp = () => ({ ...d, n: Object.fromEntries(nv.map(([k]) => [k, num(d.n[k]) || 0])) });
  const drawRegel = () => { regelSlot.innerHTML = [['formule', 'Formule'], ['vast', 'Vaste punten'], ['vet', 'Bereidingsvet']].map(([r, l]) => `<button data-act="regel" data-r="${r}" aria-pressed="${d.regel === r}">${l}</button>`).join(''); };
  const derde = () => d.regel === 'vet' ? ['kl', 'kl'] : ['punten', 'punten'];
  const drawPorties = () => {
    const [veld, label] = derde();
    porSlot.innerHTML = `<div class="por-head"><span>Omschrijving</span><span>${eenheid(d)}</span><span>${label}</span><span></span><span></span></div>` + d.porties.map((x, i) => `<div class="por-row"><input id="po-l-${i}" aria-label="Omschrijving" data-pf="label" data-i="${i}" value="${esc(x.label)}"><input id="po-g-${i}" aria-label="Hoeveelheid" inputmode="decimal" data-pf="g" data-i="${i}" value="${esc(x.g)}"><input id="po-x-${i}" aria-label="${label}" inputmode="decimal" data-pf="${veld}" data-i="${i}" value="${esc(x[veld] ?? '')}"><span class="pts tnum" data-pp="${i}"></span><button class="icon-btn" data-act="por-weg" data-i="${i}" aria-label="Portie verwijderen">${ICON.sluit}</button></div>`).join('') + `<p class="hint">${d.regel === 'vet' ? 'Kl = aantal koffielepels in deze portie.' : d.regel === 'vast' ? 'Vul per portie de vaste punten in.' : 'Laat punten leeg om de formule te gebruiken, of vul zelf een vaste waarde in.'}</p>`;
    preview();
  };
  const preview = () => {
    const t = tmp();
    d.porties.forEach((x, i) => { const el = $(`[data-pp="${i}"]`, sh); if (el) el.textContent = portionPoints(t, { ...x, g: num(x.g) || 0 }); });
    $('[data-slot=eh]', sh).textContent = eenheid(d);
  };
  const drawTags = () => { tagSlot.innerHTML = TAGS.map(([t, l]) => `<button class="chip" data-act="tag" data-tag="${t}" aria-pressed="${d.tags.includes(t)}">${l}</button>`).join(''); };
  drawRegel(); drawPorties(); drawTags();
  sh.addEventListener('input', e => {
    const el = e.target;
    if (el.dataset.pf) d.porties[+el.dataset.i][el.dataset.pf] = el.value;
    lees(); preview();
  });
  sh.addEventListener('change', e => { if (e.target.id === 'pe-eh') { lees(); drawPorties(); } else { lees(); preview(); } });
  sh.addEventListener('click', async e => {
    const a = e.target.closest('[data-act]'); if (!a) return;
    switch (a.dataset.act) {
      case 'sluit': closeSheet(); break;
      case 'regel': lees(); d.regel = a.dataset.r; drawRegel(); drawPorties(); break;
      case 'por-nieuw': lees(); d.porties.push(d.regel === 'vet' ? { label: `${d.porties.length + 1} koffielepels`, g: 4.5 * (d.porties.length + 1), kl: d.porties.length + 1 } : { label: 'portie', g: 100 }); drawPorties(); break;
      case 'por-weg': lees(); if (d.porties.length > 1) { d.porties.splice(+a.dataset.i, 1); drawPorties(); } else err.textContent = 'Een product heeft minstens één portie nodig.'; break;
      case 'tag': { const t = a.dataset.tag; d.tags = d.tags.includes(t) ? d.tags.filter(x => x !== t) : [...d.tags, t]; drawTags(); break; }
      case 'opslaan': {
        lees();
        const naam = d.naam.trim();
        if (!naam) { err.textContent = 'Geef het product een naam.'; return; }
        const porties = [];
        for (const x of d.porties) {
          const g = num(x.g), label = String(x.label || '').trim() || 'portie';
          if (!(g > 0)) { err.textContent = `Vul bij "${label}" een hoeveelheid groter dan 0 in.`; return; }
          const po = { label, g };
          if (d.regel === 'vet') po.kl = num(x.kl) > 0 ? num(x.kl) : 1;
          else if (x.punten !== undefined && x.punten !== null && String(x.punten).trim() !== '') {
            const pt = num(x.punten); if (!(pt >= 0)) { err.textContent = `De punten bij "${label}" zijn geen geldig getal.`; return; }
            po.punten = pt;
          } else if (d.regel === 'vast') { err.textContent = `Vul bij "${label}" de vaste punten in, of kies de formule.`; return; }
          porties.push(po);
        }
        const nvals = {}; for (const [k] of nv) { const x = num(d.n[k]); nvals[k] = x >= 0 ? x : 0; }
        const out = { id: d.id, naam, cat: d.cat, zero: d.zero, regel: d.regel, eenheid: d.eenheid, n: nvals, porties, tags: d.tags, fav: !!d.fav, std: !!d.std, notitie: d.notitie || '' };
        if (nieuw) { S.products.push(out); await bewaar('products', out); }
        else { Object.assign(p, out); await bewaar('products', p); }
        toast(`${naam} bewaard`); closeSheet();
        if (opt.onSaved) opt.onSaved(nieuw ? out : p);
        if (S.view === 'producten') renderProdList();
        break;
      }
      case 'verwijder': {
        if (await vraag({ titel: 'Product verwijderen?', tekst: `"${p.naam}" verdwijnt uit je productenlijst. Wat je eerder noteerde, blijft in je dagboek staan.`, ok: 'Verwijderen', gevaar: true })) {
          S.products = S.products.filter(x => x.id !== p.id);
          if (p.std && !S.settings.verwijderdeStandaard.includes(p.id)) { S.settings.verwijderdeStandaard.push(p.id); await saveSettings(); }
          await verwijder('products', p.id); toast(`${p.naam} verwijderd`); closeSheet(); render();
        }
        break;
      }
    }
  });
}

// ===== Back-up =====
function markBackup() { S.settings.lastBackup = todayKey(); saveSettings(); if (S.view !== 'producten') render(); }
async function backupBestand() {
  const json = JSON.stringify(backupObject()), naam = `mijn-voeding-backup-${todayKey()}.json`;
  try {
    const file = new File([json], naam, { type: 'application/json' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: 'Back-up Mijn Voeding' });
      markBackup(); toast('Back-up bewaard'); return;
    }
  } catch (e) { if (e && e.name === 'AbortError') return; }
  try {
    const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
    const a = document.createElement('a'); a.href = url; a.download = naam; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    markBackup(); toast('Back-upbestand gedownload');
  } catch (e) { toast('Bewaren als bestand lukt hier niet. Kopieer de back-up als tekst.'); }
}
function backupTekst() {
  const json = JSON.stringify(backupObject());
  const fallback = () => {
    const sh = openSheet(`${sheetHead('Back-up als tekst', 'Selecteer alles, kopieer en bewaar het in een notitie of mail aan jezelf.')}<div class="sheet-body"><textarea id="bk-tekst" class="mono" rows="8" readonly>${esc(json)}</textarea><button class="btn btn-primary btn-block" data-act="gedaan">Ik heb hem gekopieerd</button></div>`, { cls: 'sheet-small' });
    const ta = $('#bk-tekst', sh); setTimeout(() => { try { ta.focus(); ta.select(); } catch (e) { } }, 250);
    sh.addEventListener('click', e => { const a = e.target.closest('[data-act]'); if (!a) return; if (a.dataset.act === 'gedaan') { markBackup(); closeSheet(); } else if (a.dataset.act === 'sluit') closeSheet(); });
  };
  try {
    navigator.clipboard.writeText(json).then(() => { markBackup(); toast('Back-up gekopieerd. Plak hem in een notitie of mail aan jezelf.'); }, fallback);
  } catch (e) { fallback(); }
}
function openTerugzetten() {
  const sh = openSheet(`${sheetHead('Back-up terugzetten', 'Kies een back-upbestand of plak de back-uptekst.')}<div class="sheet-body">
    <label class="btn btn-soft btn-lg btn-block file-btn" for="imp-file">Bestand kiezen<input id="imp-file" class="vh" type="file" accept="application/json,.json,text/plain,.txt"></label>
    <label class="field" for="imp-tekst"><span>Of plak de back-uptekst</span><textarea id="imp-tekst" class="mono" rows="4"></textarea></label>
    <button class="btn btn-soft btn-block" data-act="tekst">Tekst terugzetten</button>
    <p class="err" role="alert" data-slot="err"></p></div>`);
  const err = $('[data-slot=err]', sh);
  const verwerk = async text => {
    err.textContent = '';
    let o;
    try { o = parseBackup(text); } catch (e) { err.textContent = e.message; return; }
    const dt = o.gemaakt ? new Date(o.gemaakt) : null;
    const wanneer = dt && !isNaN(dt) ? fmtDate(toKey(dt)) : 'onbekende datum';
    const ok = await vraag({ titel: 'Back-up terugzetten?', tekst: `Dit vervangt alle gegevens op dit toestel door de back-up van ${wanneer}: ${(o.data.log || []).length} registraties en ${(o.data.products || []).length} producten.`, ok: 'Terugzetten', gevaar: true });
    if (!ok) return;
    try { await restoreBackup(o); closeAllSheets(); render(); toast('Back-up teruggezet'); }
    catch (e) { console.error(e); err.textContent = 'Terugzetten mislukt. Je huidige gegevens zijn niet veranderd.'; }
  };
  $('#imp-file', sh).addEventListener('change', e => {
    const f = e.target.files && e.target.files[0]; if (!f) return;
    const r = new FileReader(); r.onload = () => verwerk(String(r.result)); r.onerror = () => { err.textContent = 'Het bestand kon niet gelezen worden.'; }; r.readAsText(f);
  });
  sh.addEventListener('click', e => {
    const a = e.target.closest('[data-act]'); if (!a) return;
    if (a.dataset.act === 'sluit') closeSheet();
    else if (a.dataset.act === 'tekst') { const t = $('#imp-tekst', sh).value.trim(); if (t) verwerk(t); else err.textContent = 'Plak eerst de back-uptekst.'; }
  });
}

// ===== Gebeurtenissen in het hoofdscherm =====
function bindApp() {
  const root = app();
  root.addEventListener('click', async e => {
    const a = e.target.closest('[data-act], [data-tab]'); if (!a) return;
    if (a.dataset.tab) {
      if (a.dataset.tab === 'week' && S.view !== 'week') S.week = weekStartKey(S.day);
      S.view = a.dataset.tab; render(); window.scrollTo(0, 0); return;
    }
    const s = S.settings;
    switch (a.dataset.act) {
      case 'dag': S.day = addDays(S.day, +a.dataset.d); render(); break;
      case 'dag-vandaag': S.day = todayKey(); render(); break;
      case 'toevoegen': openToevoegen(a.dataset.moment); break;
      case 'eetdrang': openEetdrang(); break;
      case 'beweging': openBeweging(); break;
      case 'entry': openEntry(a.dataset.id); break;
      case 'bewaar-maaltijd': openBewaarMaaltijd(a.dataset.moment); break;
      case 'naar-budget': S.view = 'instellingen'; render(); { const el = $('#sec-voorstel'); if (el) el.scrollIntoView({ block: 'start' }); } break;
      case 'backup-nu': if (BUILD === 'pwa') backupBestand(); else backupTekst(); break;
      case 'test-weg': s.testMeldingWeg = true; saveSettings(); render(); break;
      case 'week': S.week = addDays(S.week, 7 * (+a.dataset.d)); render(); break;
      case 'week-nu': S.week = weekStartKey(todayKey()); render(); break;
      case 'open-dag': S.day = a.dataset.k; S.view = 'vandaag'; render(); window.scrollTo(0, 0); break;
      case 'act-del': await delActiviteit(a.dataset.id); break;
      case 'prod-nieuw': openProductEditor(null, { onSaved: () => renderProdList() }); break;
      case 'prod-open': { const p = P(a.dataset.id); if (p) openProductEditor(p, { onSaved: () => renderProdList() }); break; }
      case 'prod-cat': S.prodCat = a.dataset.cat; for (const c of root.querySelectorAll('[data-act=prod-cat]')) c.setAttribute('aria-pressed', c.dataset.cat === S.prodCat); renderProdList(); break;
      case 'geslacht': s.profiel.geslacht = a.dataset.v; saveSettings(); for (const c of root.querySelectorAll('[data-act=geslacht]')) c.setAttribute('aria-pressed', c.dataset.v === s.profiel.geslacht); updateVoorstel(); break;
      case 'gebruik-gemeten': s.profiel.zeroKcal = +a.dataset.v; saveSettings(); { const el = $('#pr-zero'); if (el) el.value = s.profiel.zeroKcal; } updateVoorstel(); break;
      case 'voorstel-gebruik': s.dagBudget = +a.dataset.dag; s.weekReserve = +a.dataset.week; s.budgetIngesteld = true; await saveSettings(); { const d = $('#set-dag'), w = $('#set-week'); if (d) d.value = s.dagBudget; if (w) w.value = s.weekReserve; } toast(`Budget ingesteld: ${s.dagBudget} per dag en ${s.weekReserve} weekreserve`); break;
      case 'formule-standaard': s.formule = clone(DEFAULTS.formule); s.vetPerKl = DEFAULTS.vetPerKl; await saveSettings(); render(); toast('Standaardformule teruggezet'); break;
      case 'at-nieuw': s.activiteiten.push({ id: uid('t'), naam: 'Nieuwe activiteit', min: 15, punten: 1 }); await saveSettings(); render(); break;
      case 'at-weg': { const i = +a.dataset.i; if (s.activiteiten.length <= 1) { toast('Hou minstens één activiteit over.'); break; } s.activiteiten.splice(i, 1); await saveSettings(); render(); break; }
      case 'backup-bestand': backupBestand(); break;
      case 'backup-tekst': backupTekst(); break;
      case 'backup-terug': openTerugzetten(); break;
    }
  });
  root.addEventListener('input', e => {
    const el = e.target;
    if (el.id === 'prod-zoek') { S.prodQ = el.value; renderProdList(); }
    else if (el.dataset.prof && el.tagName !== 'SELECT') { S.settings.profiel[el.dataset.prof] = el.value.trim(); updateVoorstel(); }
  });
  root.addEventListener('change', e => {
    const el = e.target, s = S.settings;
    if (el.dataset.set) {
      const k = el.dataset.set;
      if (el.type === 'checkbox') s[k] = el.checked;
      else {
        const v = num(el.value);
        if (!(v >= 0)) { toast('Vul een geldig getal in.'); el.value = s[k]; return; }
        s[k] = Math.round(v);
        if (k === 'dagBudget' || k === 'weekReserve') s.budgetIngesteld = true;
        el.value = s[k];
      }
      saveSettings(); updateVoorstel();
    } else if (el.dataset.prof) {
      s.profiel[el.dataset.prof] = el.tagName === 'SELECT' ? num(el.value) : el.value.trim();
      saveSettings(); updateVoorstel();
    } else if (el.dataset.form) {
      const v = num(el.value);
      if (!(v >= 1)) { toast('Gebruik een getal van minstens 1.'); el.value = s.formule[el.dataset.form]; return; }
      s.formule[el.dataset.form] = v; saveSettings(); updateFormuleTekst(); updateVoorstel();
    } else if (el.dataset.acti !== undefined) {
      const at = s.activiteiten[+el.dataset.acti], f = el.dataset.f; if (!at) return;
      if (f === 'naam') at.naam = el.value.trim() || at.naam;
      else { const v = Math.round(num(el.value)); if (!(v >= (f === 'min' ? 1 : 0))) { toast('Vul een geldig getal in.'); el.value = at[f]; return; } at[f] = v; }
      saveSettings();
    }
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible') return;
    const t = todayKey();
    if (S._lastToday && S._lastToday !== t) { if (S.day === S._lastToday) S.day = t; S._lastToday = t; if (!sheets.length) render(); }
  });
}

// ===== Start =====
async function start() {
  try { await Store.open(); S.storageOK = true; }
  catch (e) { console.warn('Opslag niet beschikbaar', e); Store.useMemory(); S.storageOK = false; }
  try { await loadAll(); } catch (e) { console.error(e); }
  S._lastToday = todayKey();
  bindApp();
  render();
  try {
    if (S.storageOK && navigator.storage && navigator.storage.persist) {
      S.persistent = (await navigator.storage.persisted()) || (await navigator.storage.persist());
    }
  } catch (e) { }
  if (BUILD === 'pwa' && 'serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => { });
}
start();
