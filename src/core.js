// ===== Basis =====
const BUILD = window.APP_BUILD || 'pwa';
const APP_VERSION = '1.0.0';

const clone = o => JSON.parse(JSON.stringify(o));
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = (p = 'x') => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const pad = n => String(n).padStart(2, '0');
const toKey = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fromKey = k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (k, n) => { const d = fromKey(k); d.setDate(d.getDate() + n); return toKey(d); };
const todayKey = () => toKey(new Date());
const weekStartKey = k => { const d = fromKey(k); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return toKey(d); };
const daysBetween = (a, b) => Math.round((fromKey(b) - fromKey(a)) / 86400000);
const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const num = v => { const x = parseFloat(String(v ?? '').replace(',', '.')); return isFinite(x) ? x : NaN; };

const DAGEN = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'];
const DAGEN_KORT = ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'];
const MAANDEN = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];
const fmtDate = k => { const d = fromKey(k); return `${DAGEN[d.getDay()]} ${d.getDate()} ${MAANDEN[d.getMonth()]}`; };
const fmtShort = k => { const d = fromKey(k); return `${d.getDate()} ${MAANDEN[d.getMonth()].slice(0, 3)}`; };
const nf0 = new Intl.NumberFormat('nl-BE', { maximumFractionDigits: 0 });
const nf1 = new Intl.NumberFormat('nl-BE', { maximumFractionDigits: 1 });
const fmtQty = q => { const w = Math.floor(q), h = Math.abs(q - w - 0.5) < 1e-9; if (h) return (w ? w : '') + '½'; return nf1.format(q); };

const MOMENTEN = [['ontbijt', 'Ontbijt'], ['middag', 'Middag'], ['avond', 'Avond'], ['tussendoor', 'Tussendoor']];
const momentLabel = m => (MOMENTEN.find(x => x[0] === m) || MOMENTEN[3])[1];
function momentNu() {
  const d = new Date(), h = d.getHours() + d.getMinutes() / 60;
  if (h >= 4 && h < 10.5) return 'ontbijt';
  if (h >= 11 && h < 14.5) return 'middag';
  if (h >= 17 && h < 21) return 'avond';
  return 'tussendoor';
}

// ===== Standaardinstellingen =====
const DEFAULTS = {
  dagBudget: 30, weekReserve: 28, budgetIngesteld: false,
  formule: { kcal: 25, eiwit: 10, vezels: 5 },
  vetPerKl: 2,
  activiteiten: [
    { id: 'fiets', naam: 'Rustig fietsen', min: 15, punten: 1 },
    { id: 'zwem', naam: 'Zwemmen', min: 30, punten: 2 },
    { id: 'wandel', naam: 'Wandelen', min: 15, punten: 1 }
  ],
  profiel: { geslacht: '', leeftijd: '', lengte: '', gewicht: '', streefgewicht: '', activiteit: 1.375, tekort: 500, zeroKcal: 900, reservePerDag: 4 },
  toonVoeding: false, lastBackup: null, laatstePorties: {}, laatsteVet: 'olijfolie',
  seedVersion: 0, verwijderdeStandaard: [], testMeldingWeg: false
};

function mergeDefaults(v) {
  v = v || {};
  const s = Object.assign(clone(DEFAULTS), v);
  s.formule = Object.assign(clone(DEFAULTS.formule), v.formule || {});
  s.profiel = Object.assign(clone(DEFAULTS.profiel), v.profiel || {});
  if (!Array.isArray(s.activiteiten) || !s.activiteiten.length) s.activiteiten = clone(DEFAULTS.activiteiten);
  s.laatstePorties = s.laatstePorties || {};
  s.verwijderdeStandaard = s.verwijderdeStandaard || [];
  return s;
}

// ===== Opslag: IndexedDB op het toestel =====
// Elke databaseversie krijgt een migratiestap. Bestaande gegevens worden nooit gewist bij een update.
const DB_NAME = 'mijn-voeding', DB_VERSION = 1;
const STORES = ['products', 'meals', 'log', 'activities', 'settings'];

const Store = {
  db: null, mem: null,
  open() {
    return new Promise((res, rej) => {
      if (!self.indexedDB) return rej(new Error('Geen IndexedDB'));
      let klaar = false;
      const t = setTimeout(() => { if (!klaar) { klaar = true; rej(new Error('Time-out')); } }, 4000);
      let req;
      try { req = indexedDB.open(DB_NAME, DB_VERSION); } catch (e) { clearTimeout(t); return rej(e); }
      req.onupgradeneeded = ev => {
        const db = req.result, oud = ev.oldVersion;
        if (oud < 1) {
          for (const s of STORES) if (!db.objectStoreNames.contains(s)) db.createObjectStore(s, { keyPath: s === 'settings' ? 'key' : 'id' });
        }
        // Volgende versies: if (oud < 2) { ... }
      };
      req.onsuccess = () => {
        if (klaar) { try { req.result.close(); } catch (e) { } return; }
        klaar = true; clearTimeout(t);
        this.db = req.result;
        this.db.onversionchange = () => { try { this.db.close(); } catch (e) { } location.reload(); };
        res();
      };
      req.onerror = () => { if (klaar) return; klaar = true; clearTimeout(t); rej(req.error); };
    });
  },
  useMemory() { this.mem = {}; for (const s of STORES) this.mem[s] = new Map(); },
  key: o => o.id ?? o.key,
  all(store) {
    if (this.mem) return Promise.resolve([...this.mem[store].values()].map(clone));
    return new Promise((res, rej) => {
      const r = this.db.transaction(store, 'readonly').objectStore(store).getAll();
      r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
    });
  },
  write(store, fn) {
    if (this.mem) { fn({ put: o => this.mem[store].set(this.key(o), clone(o)), delete: id => this.mem[store].delete(id), clear: () => this.mem[store].clear() }); return Promise.resolve(); }
    return new Promise((res, rej) => {
      const tx = this.db.transaction(store, 'readwrite');
      fn(tx.objectStore(store));
      tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error); tx.onabort = () => rej(tx.error);
    });
  },
  put(store, obj) { return this.write(store, os => os.put(obj)); },
  del(store, id) { return this.write(store, os => os.delete(id)); },
  bulkPut(store, arr) { return this.write(store, os => { for (const o of arr) os.put(o); }); },
  // Alles in één transactie: een terugzetting lukt volledig of verandert niets.
  replaceAll(data) {
    if (this.mem) { for (const s of STORES) { this.mem[s].clear(); for (const o of data[s] || []) this.mem[s].set(this.key(o), clone(o)); } return Promise.resolve(); }
    return new Promise((res, rej) => {
      const tx = this.db.transaction(STORES, 'readwrite');
      for (const s of STORES) { const os = tx.objectStore(s); os.clear(); for (const o of data[s] || []) os.put(o); }
      tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error); tx.onabort = () => rej(tx.error);
    });
  }
};

// ===== Toestand =====
const S = {
  products: [], meals: [], log: [], activities: [], settings: mergeDefaults({}),
  storageOK: true, persistent: null,
  view: 'vandaag', day: todayKey(), week: weekStartKey(todayKey()),
  prodQ: '', prodCat: 'alle', _usage: null
};
const P = id => S.products.find(p => p.id === id);

async function bewaar(store, obj) {
  try { await Store.put(store, obj); }
  catch (e) { console.error(e); toast('Opslaan mislukt. Maak zo snel mogelijk een back-up.'); }
}
async function verwijder(store, id) {
  try { await Store.del(store, id); }
  catch (e) { console.error(e); toast('Verwijderen mislukt.'); }
}
function saveSettings() { return bewaar('settings', { key: 'app', value: S.settings }); }

async function mergeSeeds() {
  const have = new Set(S.products.map(p => p.id));
  const weg = new Set(S.settings.verwijderdeStandaard);
  const nieuw = seedProducts().filter(p => !have.has(p.id) && !weg.has(p.id));
  if (nieuw.length) {
    S.products.push(...nieuw);
    try { await Store.bulkPut('products', nieuw); } catch (e) { console.error(e); }
  }
  if (S.settings.seedVersion !== SEED_VERSION) { S.settings.seedVersion = SEED_VERSION; await saveSettings(); }
}

async function loadAll() {
  const res = await Promise.all(STORES.map(s => Store.all(s).catch(() => [])));
  const [products, meals, log, activities, settingsRows] = res;
  S.products = products; S.meals = meals; S.log = log; S.activities = activities;
  const app = settingsRows.find(r => r.key === 'app');
  S.settings = mergeDefaults(app && app.value);
  S._usage = null;
  await mergeSeeds();
}

// ===== Puntenmotor =====
// Volgorde: ZeroPoints → vetregel → vaste punten → formule.
// Formule (eigen ontwerp): kcal ÷ 25 − eiwit (g) ÷ 10 − vezels (g) ÷ 5, nooit onder 0, afgerond per portie.
function nutr(p, g) {
  const f = (num(g) || 0) / 100, n = p.n || {};
  return { kcal: (n.kcal || 0) * f, eiwit: (n.eiwit || 0) * f, kh: (n.kh || 0) * f, vet: (n.vet || 0) * f, vezels: (n.vezels || 0) * f };
}
function rawPoints(n) {
  const F = S.settings.formule;
  return n.kcal / Math.max(1, F.kcal) - n.eiwit / Math.max(1, F.eiwit) - n.vezels / Math.max(1, F.vezels);
}
const heeftVast = por => por && por.punten !== undefined && por.punten !== null && por.punten !== '' && isFinite(num(por.punten));
function portionPoints(p, por) {
  if (!p || !por) return 0;
  if (p.zero) return 0;
  if (p.regel === 'vet') return (num(por.kl) || 1) * S.settings.vetPerKl;
  if (heeftVast(por)) return num(por.punten);
  if (p.regel === 'vast') return 0;
  return Math.max(0, Math.round(rawPoints(nutr(p, por.g))));
}
function regelUitleg(p, por) {
  if (p.zero) return 'ZeroPoints: 0 punten. De calorieën tellen wel mee in je voedingswaarden.';
  if (p.regel === 'vet') return `Vetregel: elk bereidingsvet telt ${S.settings.vetPerKl} punten per koffielepel.`;
  if (heeftVast(por)) return 'Vaste punten voor deze portie.';
  const n = nutr(p, por.g), F = S.settings.formule, r = rawPoints(n);
  return `${nf0.format(n.kcal)} kcal ÷ ${F.kcal} − ${nf1.format(n.eiwit)} g eiwit ÷ ${F.eiwit} − ${nf1.format(n.vezels)} g vezels ÷ ${F.vezels} = ${nf1.format(r)}, afgerond ${Math.max(0, Math.round(r))}`;
}
const entryPoints = (p, por, qty) => Math.round(portionPoints(p, por) * qty);
const eenheid = p => p && p.eenheid === 'ml' ? 'ml' : 'g';

function makeEntry(p, pi, qty, moment, date) {
  const por = p.porties[pi] || p.porties[0];
  const unit = portionPoints(p, por);
  return {
    id: uid('e'), date, moment, pid: p.id, pi, naam: p.naam, cat: p.cat, zero: !!p.zero,
    portie: por.label, g: por.g, eenheid: eenheid(p), qty,
    unitPunten: unit, punten: Math.round(unit * qty), unitN: nutr(p, por.g), ts: Date.now()
  };
}
async function addEntry(e) {
  S.log.push(e); S._usage = null;
  S.settings.laatstePorties[e.pid] = { pi: e.pi, qty: e.qty };
  await bewaar('log', e); await saveSettings();
}

function usage() {
  if (S._usage) return S._usage;
  const u = {}, grens = addDays(todayKey(), -120);
  for (const e of S.log) if (e.date >= grens) u[e.pid] = (u[e.pid] || 0) + 1;
  return (S._usage = u);
}
function lastPortion(p) {
  const lp = S.settings.laatstePorties[p.id];
  if (lp && p.porties[lp.pi]) return { pi: lp.pi, qty: lp.qty || 1 };
  return { pi: 0, qty: 1 };
}

// ===== Dag, week en budget =====
function dayStats(k) {
  const r = { punten: 0, kcal: 0, eiwit: 0, kh: 0, vet: 0, vezels: 0, zeroKcal: 0, fruitKcal: 0, fruitPorties: 0, n: 0 };
  for (const e of S.log) {
    if (e.date !== k) continue;
    const q = e.qty, n = e.unitN || {};
    r.n++; r.punten += e.punten;
    r.kcal += (n.kcal || 0) * q; r.eiwit += (n.eiwit || 0) * q; r.kh += (n.kh || 0) * q; r.vet += (n.vet || 0) * q; r.vezels += (n.vezels || 0) * q;
    if (e.zero) r.zeroKcal += (n.kcal || 0) * q;
    if (e.cat === 'Fruit') { r.fruitKcal += (n.kcal || 0) * q; r.fruitPorties += q; }
  }
  return r;
}
function weekInfo(wk) {
  const B = S.settings.dagBudget, eind = addDays(wk, 6);
  let over = 0;
  const days = [];
  for (let i = 0; i < 7; i++) {
    const k = addDays(wk, i), st = dayStats(k), o = Math.max(0, st.punten - B);
    over += o; days.push({ k, st, o });
  }
  const acts = S.activities.filter(a => a.date >= wk && a.date <= eind);
  const bonus = acts.reduce((s, a) => s + (a.punten || 0), 0);
  const R = S.settings.weekReserve;
  return { days, acts, bonus, reserve: R, over, beschikbaar: R + bonus, rest: R + bonus - over };
}

const ACTNIVEAUS = [[1.2, 'Vooral zittend'], [1.375, 'Licht actief'], [1.55, 'Matig actief'], [1.725, 'Zwaar fysiek werk']];
function budgetVoorstel(pr) {
  const w = num(pr.gewicht), h = num(pr.lengte), a = num(pr.leeftijd);
  if (!(w > 0) || !(h > 0) || !(a > 0) || !pr.geslacht) return null;
  const bmr = 10 * w + 6.25 * h - 5 * a + (pr.geslacht === 'man' ? 5 : -161);
  const tdee = bmr * (num(pr.activiteit) || 1.375);
  const minimum = pr.geslacht === 'man' ? 1500 : 1200;
  let doel = tdee - (num(pr.tekort) || 0), begrensd = false;
  if (doel < minimum) { doel = minimum; begrensd = true; }
  const zk = Math.max(0, num(pr.zeroKcal) || 0);
  const puntenKcal = Math.max(0, doel - zk);
  const perDag = Math.round(puntenKcal / Math.max(1, S.settings.formule.kcal));
  const res = Math.max(0, Math.min(Math.round(num(pr.reservePerDag) || 0), perDag));
  return { bmr, tdee, doel, minimum, begrensd, zk, puntenKcal, perDag, dag: perDag - res, week: res * 7, res };
}
function gemetenZeroKcal() {
  const tot = todayKey(); let som = 0, n = 0;
  for (let i = 1; i <= 14; i++) {
    const k = addDays(tot, -i), st = dayStats(k);
    if (st.n >= 3) { som += st.zeroKcal; n++; }
  }
  return n ? { gem: som / n, n } : null;
}

// ===== Back-up =====
function backupObject() {
  return {
    app: 'mijn-voeding', schema: 1, versie: APP_VERSION, gemaakt: new Date().toISOString(),
    data: { products: S.products, meals: S.meals, log: S.log, activities: S.activities, settings: S.settings }
  };
}
function parseBackup(text) {
  let o;
  try { o = JSON.parse(text); } catch (e) { throw new Error('Dit is geen geldig back-upbestand (geen leesbare tekst).'); }
  if (!o || o.app !== 'mijn-voeding' || !o.data) throw new Error('Dit bestand komt niet van deze app.');
  const d = o.data;
  for (const k of ['products', 'meals', 'log', 'activities']) if (d[k] !== undefined && !Array.isArray(d[k])) throw new Error('Het back-upbestand is beschadigd.');
  return o;
}
async function restoreBackup(o) {
  const d = o.data;
  const data = {
    products: d.products || [], meals: d.meals || [], log: d.log || [], activities: d.activities || [],
    settings: [{ key: 'app', value: mergeDefaults(d.settings || {}) }]
  };
  await Store.replaceAll(data);
  await loadAll();
}
