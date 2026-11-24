import { ic, rp, pad, shell, delegate, openSheet, updateSheet, closeSheet, toast, countUp, fly, confetti, rng, clock, fmtDate } from './shared';

type Item = { id: string; name: string; cat: string; price: number; icon: string; g: [string, string]; tag?: string; drink?: boolean };
export const MENU: Item[] = [
  { id: 'ksa', name: 'Kopi Susu Aren', cat: 'Kopi', price: 22000, icon: 'cup', g: ['#F6D9B0', '#B9773D'], tag: 'Terlaris', drink: true },
  { id: 'lat', name: 'Caffe Latte', cat: 'Kopi', price: 25000, icon: 'coffee', g: ['#EEDFCF', '#9C6B43'], drink: true },
  { id: 'ame', name: 'Americano', cat: 'Kopi', price: 20000, icon: 'coffee', g: ['#D8CEC6', '#4D3B2F'], drink: true },
  { id: 'v60', name: 'V60 Gayo', cat: 'Kopi', price: 28000, icon: 'cup', g: ['#E8D8C6', '#6E4F35'], tag: 'Baru', drink: true },
  { id: 'tub', name: 'Kopi Tubruk', cat: 'Kopi', price: 12000, icon: 'coffee', g: ['#DCCFC4', '#3E3027'], drink: true },
  { id: 'mat', name: 'Matcha Latte', cat: 'Non-kopi', price: 26000, icon: 'leaf', g: ['#DFF0D3', '#5E9447'], drink: true },
  { id: 'coc', name: 'Cokelat Rempah', cat: 'Non-kopi', price: 24000, icon: 'cup', g: ['#EBD2C6', '#6F3F30'], drink: true },
  { id: 'teh', name: 'Es Teh Jawa', cat: 'Non-kopi', price: 8000, icon: 'cup', g: ['#F8E3B4', '#C0771F'], drink: true },
  { id: 'cro', name: 'Croissant Mentega', cat: 'Makanan', price: 22000, icon: 'bread', g: ['#FCE7BC', '#D3912F'], tag: 'Terlaris' },
  { id: 'rot', name: 'Roti Bakar Srikaya', cat: 'Makanan', price: 18000, icon: 'bread', g: ['#F5E3BF', '#B1813F'] },
  { id: 'pis', name: 'Pisang Goreng Keju', cat: 'Makanan', price: 16000, icon: 'flame', g: ['#FDEBB3', '#DB9C17'] },
  { id: 'nas', name: 'Nasi Goreng Kampung', cat: 'Makanan', price: 28000, icon: 'bowl', g: ['#F9D7C4', '#C25A35'] },
];
const CATS = ['Semua', 'Kopi', 'Non-kopi', 'Makanan'];
const TYPES = ['Makan di sini', 'Bawa pulang', 'Ojol'];
const item = (id: string) => MENU.find((m) => m.id === id)!;
export const thumb = (m: Item, size = '') =>
  `<span class="pthumb ${size}" style="--g1:${m.g[0]};--g2:${m.g[1]}">${ic(m.icon)}${m.tag && !size ? `<em>${m.tag}</em>` : ''}</span>`;

type Line = { key: string; id: string; q: number; opts: string[]; extra: number };
type Mod = { id: string; size: string; temp: string; sugar: string; q: number };
type Snap = { lines: Line[]; sub: number; disc: number; tax: number; total: number; method: string; cash: number; no: number; at: string };

export function initPos(el: HTMLElement) {
  const st = {
    cat: 'Semua', q: '', type: TYPES[0], member: false, no: 142, fresh: '', pop: '',
    lines: [
      { key: 'ksa|Regular|Es|Gula normal', id: 'ksa', q: 2, opts: ['Regular', 'Es', 'Gula normal'], extra: 0 },
      { key: 'cro', id: 'cro', q: 1, opts: [], extra: 0 },
    ] as Line[],
    mod: null as Mod | null,
    pay: { method: 'QRIS', cash: 0, last: '' },
    snap: null as Snap | null,
  };
  const nums = new Map<string, number>();

  el.innerHTML = shell({ logo: 'KL', brand: 'Kedai Lereng', page: 'Kasir', nav: ['home', 'cart', 'receipt', 'bars', 'package'], active: 1, user: 'Nisa', role: 'Kasir · shift pagi', search: 'Cari menu…' });
  el.querySelector('[data-r="content"]')!.innerHTML = `
    <div class="pos">
      <section class="pos-menu" aria-label="Menu">
        <div class="pos-top">
          <div><span class="eyebrow-s">${fmtDate(new Date())} · buka sampai 22.00</span><h3 class="h">Menu hari ini</h3></div>
          <div class="cats" data-r="cats" role="radiogroup" aria-label="Kategori"></div>
        </div>
        <div class="pgrid" data-r="grid"></div>
      </section>
      <aside class="pos-order" data-r="order" aria-label="Pesanan"></aside>
    </div>`;
  const $ = (r: string) => el.querySelector<HTMLElement>(`[data-r="${r}"]`)!;

  const qtyOf = (id: string) => st.lines.filter((l) => l.id === id).reduce((s, l) => s + l.q, 0);
  const totals = () => {
    const sub = st.lines.reduce((s, l) => s + (item(l.id).price + l.extra) * l.q, 0);
    const disc = st.member ? Math.round(sub * 0.1) : 0;
    const tax = Math.round((sub - disc) * 0.1);
    return { sub, disc, tax, total: sub - disc + tax, count: st.lines.reduce((s, l) => s + l.q, 0) };
  };
  const order = () => `#A-${pad(st.no, 4)}`;

  function renderCats() {
    $('cats').innerHTML = CATS.map((c) => {
      const n = c === 'Semua' ? MENU.length : MENU.filter((m) => m.cat === c).length;
      return `<button type="button" role="radio" aria-checked="${c === st.cat}" data-a="cat" data-v="${c}">${c}<span>${n}</span></button>`;
    }).join('');
  }

  function renderGrid(animate: boolean) {
    const g = $('grid');
    const list = MENU.filter((m) => (st.cat === 'Semua' || m.cat === st.cat) && m.name.toLowerCase().includes(st.q.toLowerCase().trim()));
    g.classList.toggle('stagger', animate);
    g.innerHTML = list.length
      ? list.map((m, i) => {
          const q = qtyOf(m.id);
          return `<button type="button" class="pcard${q ? ' in' : ''}" data-a="pick" data-v="${m.id}" style="--d:${i * 40}ms" aria-label="${m.name}, ${rp(m.price)}${q ? `, ${q} di pesanan` : ''}">
            ${thumb(m)}
            <span class="pc-body"><span class="pc-name">${m.name}</span><span class="pc-row"><span class="pc-price">${rp(m.price)}</span><span class="pc-add">${ic('plus')}</span></span></span>
            ${q ? `<span class="pc-q${m.id === st.pop ? ' pop' : ''}">${q}</span>` : ''}
          </button>`;
        }).join('')
      : `<div class="empty">${ic('search')}<strong>Menu tidak ditemukan</strong><span>Coba kata lain, misalnya “kopi”.</span></div>`;
    st.pop = '';
  }

  function renderOrder() {
    const t = totals();
    $('order').innerHTML = `
      <div class="oh"><div><span class="eyebrow-s">Pesanan baru</span><strong>${order()}</strong></div><span class="oh-count" data-r="count">${ic('cart')}<b>${t.count}</b></span></div>
      <div class="seg seg-full" role="radiogroup" aria-label="Jenis pesanan">${TYPES.map((x) => `<button type="button" role="radio" aria-checked="${x === st.type}" data-a="type" data-v="${x}">${x}</button>`).join('')}</div>
      <div class="olines">${st.lines.length
        ? `<ul>${st.lines.map((l) => { const m = item(l.id); return `<li class="oline${l.key === st.fresh ? ' fresh' : ''}">
            ${thumb(m, 'sm')}
            <div class="ol-main"><strong>${m.name}</strong><span>${l.opts.join(' · ') || 'Tanpa catatan'}</span><b>${rp((m.price + l.extra) * l.q)}</b></div>
            <div class="stepper"><button type="button" data-a="dec" data-v="${l.key}" aria-label="Kurangi ${m.name}">${ic('minus')}</button><span>${l.q}</span><button type="button" data-a="inc" data-v="${l.key}" aria-label="Tambah ${m.name}">${ic('plus')}</button></div>
          </li>`; }).join('')}</ul>`
        : `<div class="o-empty"><span class="o-empty-ic">${ic('cart')}</span><strong>Belum ada pesanan</strong><span>Ketuk menu untuk mulai mencatat.</span></div>`}</div>
      <div class="o-foot">
        <button type="button" class="promo${st.member ? ' on' : ''}" role="switch" aria-checked="${st.member}" data-a="member">${ic('percent')}<span><strong>Diskon member 10%</strong><em>${st.member ? `Hemat ${rp(t.disc)}` : 'Ketuk untuk memakai'}</em></span><span class="tg"><i></i></span></button>
        <dl class="totals">
          <div><dt>Subtotal</dt><dd>${rp(t.sub)}</dd></div>
          ${t.disc ? `<div class="disc"><dt>Diskon member</dt><dd>−${rp(t.disc)}</dd></div>` : ''}
          <div><dt>Pajak (10%)</dt><dd>${rp(t.tax)}</dd></div>
          <div class="grand"><dt>Total</dt><dd data-num="${t.total}" data-key="total" data-fmt="rp">${rp(t.total)}</dd></div>
        </dl>
        <button type="button" class="btn btn-pri btn-lg" data-a="pay" ${t.count ? '' : 'disabled'}><span>Bayar</span><span class="sep"></span><span>${rp(t.total)}</span></button>
      </div>`;
    countUp($('order'), nums);
    st.fresh = '';
  }

  const group = (label: string, key: string, opts: { v: string; label: string; hint?: string }[], cur: string) =>
    `<fieldset class="og"><legend class="lbl">${label}</legend><div class="og-opts" role="radiogroup" aria-label="${label}">${opts.map((o) =>
      `<button type="button" class="opt" role="radio" aria-checked="${o.v === cur}" data-a="opt" data-v="${key}:${o.v}"><span>${o.label}</span>${o.hint ? `<em>${o.hint}</em>` : ''}</button>`).join('')}</div></fieldset>`;

  function modHtml() {
    const m = st.mod!, it = item(m.id), extra = m.size === 'Large' ? 5000 : 0;
    return `<div class="sh-hero">${thumb(it, 'lg')}<div class="sh-t"><span class="eyebrow-s">${it.cat}</span><strong>${it.name}</strong><span>${rp(it.price)}</span></div><button type="button" class="icon-btn" data-a="close" aria-label="Tutup">${ic('x')}</button></div>
      ${group('Ukuran', 'size', [{ v: 'Regular', label: 'Regular', hint: '250 ml' }, { v: 'Large', label: 'Large', hint: '+Rp5.000' }], m.size)}
      ${group('Suhu', 'temp', [{ v: 'Es', label: 'Es' }, { v: 'Panas', label: 'Panas' }], m.temp)}
      ${group('Gula', 'sugar', ['Normal', 'Kurang', 'Tanpa'].map((v) => ({ v, label: v })), m.sugar)}
      <div class="sh-foot"><div class="stepper lg"><button type="button" data-a="mq" data-v="-1" aria-label="Kurangi">${ic('minus')}</button><span>${m.q}</span><button type="button" data-a="mq" data-v="1" aria-label="Tambah">${ic('plus')}</button></div>
      <button type="button" class="btn btn-pri btn-lg grow" data-a="addmod">Tambah · ${rp((it.price + extra) * m.q)}</button></div>`;
  }

  function qr(seed: number) {
    const r = rng(seed * 97 + 13), n = 25;
    const inF = (x: number, y: number) => (x < 8 && y < 8) || (x >= n - 8 && y < 8) || (x < 8 && y >= n - 8);
    let s = '';
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (!inF(x, y) && r() > 0.5) s += `<rect x="${x}" y="${y}" width="1" height="1"/>`;
    for (const [fx, fy] of [[0, 0], [n - 7, 0], [0, n - 7]]) s += `<rect x="${fx}" y="${fy}" width="7" height="7" rx="1.2"/><rect x="${fx + 1}" y="${fy + 1}" width="5" height="5" rx=".8" fill="#fff"/><rect x="${fx + 2}" y="${fy + 2}" width="3" height="3" rx=".5"/>`;
    return `<svg viewBox="-1 -1 27 27" fill="currentColor" shape-rendering="crispEdges" aria-hidden="true">${s}</svg>`;
  }

  function payHtml() {
    const t = totals(), p = st.pay;
    const swap = p.method !== p.last ? ' swap' : '';
    p.last = p.method;
    let body = '';
    if (p.method === 'Tunai') {
      const quick = [t.total, ...[50000, 100000, 150000, 200000].filter((v) => v > t.total)].slice(0, 4);
      body = `<div class="cash"><span class="lbl">Uang diterima</span><strong class="cash-amt">${rp(p.cash)}</strong>
        <div class="quick">${quick.map((v, i) => `<button type="button" class="opt" aria-pressed="${p.cash === v}" data-a="cash" data-v="${v}"><span>${i === 0 ? 'Uang pas' : rp(v)}</span></button>`).join('')}</div>
        <div class="change${p.cash >= t.total ? ' ok' : ''}"><span>Kembalian</span><strong>${p.cash >= t.total ? rp(p.cash - t.total) : '—'}</strong></div></div>`;
    } else if (p.method === 'QRIS') {
      body = `<div class="qris"><div class="qr-box">${qr(st.no)}<span class="qr-logo">KL</span><span class="scan"></span></div>
        <div class="qr-info"><strong>Pindai untuk membayar</strong><span>GoPay, OVO, DANA, ShopeePay, atau aplikasi bank.</span><span class="waiting"><i></i>Menunggu pembayaran…</span></div></div>`;
    } else {
      body = `<div class="qris"><div class="edc-dev"><span class="edc-screen">${rp(t.total)}</span><span class="edc-keys">${'<i></i>'.repeat(9)}</span></div>
        <div class="qr-info"><strong>Tempel atau masukkan kartu</strong><span>Debit dan kredit dari semua bank.</span><span class="waiting"><i></i>Menunggu kartu…</span></div></div>`;
    }
    const can = p.method !== 'Tunai' || p.cash >= t.total;
    return `<div class="sh-head"><div><span class="eyebrow-s">Pembayaran ${order()}</span><strong class="pay-total">${rp(t.total)}</strong></div><button type="button" class="icon-btn" data-a="close" aria-label="Tutup">${ic('x')}</button></div>
      <div class="pm" role="radiogroup" aria-label="Metode bayar">${[['Tunai', 'cash'], ['QRIS', 'qr'], ['Kartu', 'card']].map(([m, i]) => `<button type="button" class="pm-opt" role="radio" aria-checked="${m === p.method}" data-a="method" data-v="${m}">${ic(i)}<span>${m}</span></button>`).join('')}</div>
      <div class="pm-body${swap}">${body}</div>
      <button type="button" class="btn btn-pri btn-lg wide" data-a="confirm" ${can ? '' : 'disabled'}>${p.method === 'Tunai' ? 'Selesaikan pembayaran' : 'Pembayaran sudah diterima'}</button>`;
  }

  function doneHtml(s: Snap) {
    const row = (a: string, b: string, cls = '') => `<div class="rc-row ${cls}"><span>${a}</span><span>${b}</span></div>`;
    return `<div class="done">
      <svg class="done-check" viewBox="0 0 52 52" aria-hidden="true"><circle cx="26" cy="26" r="24"/><path d="M15 27l7 7 15-15"/></svg>
      <strong>Pembayaran berhasil</strong><span class="sub">${s.method} · ${s.at}</span>
      <div class="printer"><span class="slot"></span><div class="rc-clip"><div class="receipt">
        <div class="rc-brand">KEDAI LERENG<span>Sleman, Yogyakarta</span></div>
        ${row(`#A-${pad(s.no, 4)}`, s.at)}
        <div class="rc-sep"></div>
        ${s.lines.map((l) => { const m = item(l.id); return row(`${l.q}× ${m.name}`, rp((m.price + l.extra) * l.q)); }).join('')}
        <div class="rc-sep"></div>
        ${row('Subtotal', rp(s.sub))}${s.disc ? row('Diskon member', `−${rp(s.disc)}`) : ''}${row('Pajak 10%', rp(s.tax))}
        ${row('TOTAL', rp(s.total), 'grand')}
        ${s.method === 'Tunai' ? row('Tunai', rp(s.cash)) + row('Kembali', rp(s.cash - s.total)) : row(s.method, 'Lunas')}
        <div class="rc-thanks">Terima kasih, sampai jumpa lagi</div><div class="rc-barcode"></div>
      </div></div></div>
      <div class="done-actions"><button type="button" class="btn btn-ghost" data-a="reprint">${ic('printer')}Cetak ulang</button><button type="button" class="btn btn-pri" data-a="neworder">Pesanan baru</button></div>
    </div>`;
  }

  function addLine(id: string, opts: string[], extra: number, q: number, from: Element | null) {
    const key = [id, ...opts].join('|');
    const ex = st.lines.find((l) => l.key === key);
    if (ex) ex.q += q; else st.lines.push({ key, id, q, opts, extra });
    st.fresh = key;
    st.pop = id;
    fly(from, $('count')).then(() => {
      const c = $('count');
      c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump');
    });
    renderOrder();
    renderGrid(false);
  }

  delegate(el, (a, v, t) => {
    if (a === 'close') return closeSheet(el);
    if (a === 'bell') return toast(el, '2 pesanan ojol menunggu diproses', 'bell');
    if (a === 'cat') { st.cat = v; renderCats(); renderGrid(true); }
    if (a === 'pick') {
      const it = item(v);
      if (it.drink) { st.mod = { id: v, size: 'Regular', temp: 'Es', sugar: 'Normal', q: 1 }; openSheet(el, modHtml()); }
      else addLine(v, [], 0, 1, t.querySelector('.pthumb'));
    }
    if (a === 'opt' && st.mod) { const [k, val] = v.split(':'); (st.mod as Record<string, unknown>)[k] = val; updateSheet(el, modHtml()); }
    if (a === 'mq' && st.mod) { st.mod.q = Math.max(1, st.mod.q + Number(v)); updateSheet(el, modHtml()); }
    if (a === 'addmod' && st.mod) {
      const m = st.mod;
      closeSheet(el);
      addLine(m.id, [m.size, m.temp, `Gula ${m.sugar.toLowerCase()}`], m.size === 'Large' ? 5000 : 0, m.q, el.querySelector(`.pcard[data-v="${m.id}"] .pthumb`));
    }
    if (a === 'inc' || a === 'dec') {
      const l = st.lines.find((x) => x.key === v);
      if (l) { l.q += a === 'inc' ? 1 : -1; if (!l.q) st.lines = st.lines.filter((x) => x !== l); }
      renderOrder(); renderGrid(false);
    }
    if (a === 'type') { st.type = v; renderOrder(); }
    if (a === 'member') { st.member = !st.member; renderOrder(); }
    if (a === 'pay') { st.pay = { method: 'QRIS', cash: 0, last: '' }; openSheet(el, payHtml()); }
    if (a === 'method') { st.pay.method = v; st.pay.cash = 0; updateSheet(el, payHtml()); }
    if (a === 'cash') { st.pay.cash = Number(v); updateSheet(el, payHtml()); }
    if (a === 'confirm') {
      st.snap = { ...totals(), lines: st.lines.map((l) => ({ ...l })), method: st.pay.method, cash: st.pay.cash, no: st.no, at: clock() };
      updateSheet(el, doneHtml(st.snap));
      setTimeout(() => confetti(el.querySelector('.done-check')), 350);
    }
    if (a === 'reprint' && st.snap) { updateSheet(el, doneHtml(st.snap)); toast(el, 'Struk dicetak ulang', 'printer'); }
    if (a === 'neworder') {
      closeSheet(el);
      st.lines = []; st.member = false; st.no++;
      renderOrder(); renderGrid(false);
      toast(el, `Pesanan #A-${pad(st.no - 1, 4)} selesai`, 'receipt');
    }
  });
  el.addEventListener('input', (e) => {
    const t = e.target as HTMLInputElement;
    if (t.dataset.in === 'search') { st.q = t.value; renderGrid(true); }
  });

  renderCats(); renderGrid(false); renderOrder();
  return { show() { nums.clear(); renderGrid(true); renderOrder(); } };
}
