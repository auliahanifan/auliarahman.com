import { ic, rp, short, pad, shell, delegate, toast, countUp, smooth, spark, dayOffset, fmtDate, clock, reduced } from './shared';
import { MENU, thumb } from './pos';

type Series = { labels: string[]; vals: number[]; prev: number[]; unit: string; pay: number[] };
const mk = (labels: string[], vals: number[], unit: string, pay: number[]): Series => ({
  labels, vals, unit, pay, prev: vals.map((v, i) => Math.round(v * (0.8 + 0.1 * Math.sin(i * 1.7 + 1)) / 1000) * 1000),
});
const SERIES: Record<string, Series> = {
  hari: mk(
    Array.from({ length: 14 }, (_, i) => `${pad(8 + i)}.00`),
    [180, 240, 310, 420, 560, 610, 480, 360, 300, 390, 560, 640, 520, 300].map((v) => v * 1000),
    'jam', [58, 28, 14],
  ),
  '7': mk(
    Array.from({ length: 7 }, (_, i) => fmtDate(dayOffset(i - 6))),
    [2410000, 2860000, 2650000, 3120000, 3980000, 4350000, 3240000], 'hari', [52, 31, 17],
  ),
  '30': mk(
    Array.from({ length: 30 }, (_, i) => fmtDate(dayOffset(i - 29))),
    Array.from({ length: 30 }, (_, i) => Math.round((2.5 + 0.6 * Math.sin(i / 1.6) + i * 0.025 + ([5, 6].includes(dayOffset(i - 29).getDay()) ? 0.9 : 0)) * 100) * 10000),
    'hari', [49, 34, 17],
  ),
};
const PERIODS = [['hari', 'Hari ini'], ['7', '7 hari'], ['30', '30 hari']];
const PAY = [['QRIS', 'var(--kobalt-500)', 'qr'], ['Tunai', 'var(--mint-500)', 'cash'], ['Kartu', 'var(--amber-500)', 'card']];
const TOP = [['ksa', 34], ['lat', 19], ['cro', 15], ['mat', 12], ['teh', 9]] as const;
const HD = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
const HOURS = Array.from({ length: 12 }, (_, i) => 9 + i);
const BASE: Record<number, number> = { 9: .35, 10: .5, 11: .6, 12: .88, 13: .8, 14: .52, 15: .6, 16: .84, 17: .96, 18: .8, 19: .68, 20: .48 };
const HEAT = HD.map((_, d) => HOURS.map((h) => Math.round(BASE[h] * (d >= 5 ? 1.32 : d === 4 ? 1.14 : 1) * (0.86 + 0.28 * Math.abs(Math.sin(d * 7 + h * 3))) * 40)));
const HMAX = Math.max(...HEAT.flat()), HMIN = Math.min(...HEAT.flat());

const pct = (a: number, b: number) => Math.round((a / b - 1) * 100);
const niceMax = (v: number) => { const p = 10 ** Math.floor(Math.log10(v)); return Math.ceil((v / p) * 2) / 2 * p; };

export function initDash(el: HTMLElement) {
  const st = {
    period: '7', heat: '', no: 188, todayTrx: 86,
    stock: [
      { id: 's1', name: 'Susu UHT', left: '4 liter', min: 12, lvl: .33, state: '' },
      { id: 's2', name: 'Gula aren cair', left: '1,2 kg', min: 5, lvl: .24, state: '' },
      { id: 's3', name: 'Biji kopi house blend', left: '0,8 kg', min: 3, lvl: .27, state: '' },
      { id: 's4', name: 'Cup 16 oz', left: '60 pcs', min: 200, lvl: .3, state: '' },
    ],
    feed: [] as { no: number; t: string; items: string; method: string; amt: number; fresh?: boolean }[],
  };
  const nums = new Map<string, number>();
  const r = Math.random;
  const trxItem = () => {
    const a = MENU[Math.floor(r() * MENU.length)], n = 1 + Math.floor(r() * 3);
    const b = r() > 0.5 ? MENU[Math.floor(r() * MENU.length)] : null;
    return { items: `${n}× ${a.name}${b && b !== a ? `, ${b.name}` : ''}`, amt: Math.round((a.price * n + (b && b !== a ? b.price : 0)) * 1.1 / 100) * 100, method: PAY[Math.floor(r() * 2.6)][0] };
  };
  for (let i = 0; i < 5; i++) { const d = new Date(Date.now() - (i * 4 + 2) * 60000); st.feed.push({ no: st.no - i, t: clock(d), ...trxItem() }); }

  el.innerHTML = shell({ logo: 'KL', brand: 'Kedai Lereng', page: 'Ringkasan', nav: ['home', 'cart', 'receipt', 'bars', 'package'], active: 3, user: 'Nisa', role: 'Pemilik', search: 'Cari laporan…' });
  el.querySelector('[data-r="content"]')!.innerHTML = `
    <div class="dash">
      <div class="dash-hero">
        <div><span class="eyebrow-s">${fmtDate(new Date())}</span><h3 class="h">Selamat datang kembali, Nisa</h3><p class="sub">Penjualan Kedai Lereng <span class="live"><i></i>Live</span></p></div>
        <div class="seg" data-r="period" role="radiogroup" aria-label="Periode"></div>
      </div>
      <div class="kpis" data-r="kpis"></div>
      <div class="dgrid">
        <section class="card c-chart" aria-label="Grafik omzet">
          <div class="card-h"><div><strong>Omzet per <span data-r="unit"></span></strong><span class="sub">Arahkan kursor atau ketuk grafik</span></div>
            <div class="legend"><span><i class="lg-cur"></i>Periode ini</span><span><i class="lg-prev"></i>Sebelumnya</span></div></div>
          <div class="area" data-r="area"></div>
        </section>
        <section class="card" aria-label="Metode bayar" data-r="donut"></section>
        <section class="card" aria-label="Jam ramai" data-r="heat"></section>
        <section class="card" aria-label="Menu terlaris" data-r="top"></section>
        <section class="card" aria-label="Transaksi terbaru" data-r="feed"></section>
        <section class="card" aria-label="Stok menipis" data-r="stock"></section>
      </div>
    </div>`;
  const $ = (n: string) => el.querySelector<HTMLElement>(`[data-r="${n}"]`)!;
  const S = () => SERIES[st.period];

  function renderPeriod() {
    $('period').innerHTML = PERIODS.map(([k, l]) => `<button type="button" role="radio" aria-checked="${k === st.period}" data-a="period" data-v="${k}">${l}</button>`).join('');
    $('unit').textContent = S().unit;
  }

  function renderKpis(animate: boolean) {
    const s = S(), om = s.vals.reduce((a, b) => a + b, 0), pom = s.prev.reduce((a, b) => a + b, 0);
    const trx = Math.round(om / 38500), ptrx = Math.round(pom / 37400), avg = Math.round(om / trx / 100) * 100, pavg = pom / ptrx;
    const cust = Math.round(trx * 0.17), pcust = Math.round(ptrx * 0.15);
    const k = [
      ['Omzet', 'bars', om, 'rp', pct(om, pom), s.vals],
      ['Transaksi', 'receipt', trx, 'int', pct(trx, ptrx), s.vals.map((v, i) => v * (0.92 + 0.16 * Math.sin(i * 1.3)))],
      ['Rata-rata belanja', 'cart', avg, 'rp', pct(avg, pavg), s.vals.map((_, i) => 36000 + 2500 * Math.sin(i * 0.9) + i * 120)],
      ['Pelanggan baru', 'users', cust, 'int', pct(cust, pcust), s.vals.map((v, i) => v * (0.7 + 0.3 * Math.cos(i * 0.8)))],
    ] as const;
    const box = $('kpis');
    box.classList.toggle('stagger', animate);
    box.innerHTML = k.map(([label, icon, val, fmt, d, sp], i) => `
      <div class="kpi" style="--d:${i * 70}ms">
        <div class="kpi-h"><span class="kpi-ic">${ic(icon)}</span><span>${label}</span><em class="delta ${d >= 0 ? 'up' : 'down'}">${ic(d >= 0 ? 'up' : 'down')}${Math.abs(d)}%</em></div>
        <strong data-num="${val}" data-key="k${i}" data-fmt="${fmt}">${fmt === 'rp' ? rp(val) : val.toLocaleString('id-ID')}</strong>
        ${spark([...sp], i % 2 ? '#25B892' : '#3A5BFF')}
      </div>`).join('');
    countUp(box, nums);
  }

  let geo: { pts: number[][]; prev: number[][]; padL: number; step: number; W: number } | null = null;
  let lastW = 0;
  function renderArea(animate: boolean) {
    const box = $('area'), s = S(), n = s.vals.length;
    const W = box.clientWidth || 600, H = W < 420 ? 180 : 230, padL = 46, padR = 10, padT = 14, padB = 28;
    lastW = W;
    const max = niceMax(Math.max(...s.vals, ...s.prev));
    const step = (W - padL - padR) / (n - 1);
    const x = (i: number) => padL + i * step, y = (v: number) => padT + (1 - v / max) * (H - padT - padB);
    const pts = s.vals.map((v, i) => [x(i), y(v)]), prev = s.prev.map((v, i) => [x(i), y(v)]);
    const line = smooth(pts);
    const every = Math.ceil(n / Math.max(2, Math.floor((W - padL) / 64)));
    geo = { pts, prev, padL, step, W };
    box.innerHTML = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" class="${animate && !reduced() ? 'draw' : ''}" aria-hidden="true">
      <defs><linearGradient id="dash-ag" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:#3A5BFF;stop-opacity:.28"/><stop offset="1" style="stop-color:#3A5BFF;stop-opacity:0"/></linearGradient></defs>
      <g class="a-grid">${[0, .25, .5, .75, 1].map((f) => `<line x1="${padL}" x2="${W - padR}" y1="${y(max * f)}" y2="${y(max * f)}"/><text x="${padL - 8}" y="${y(max * f) + 3.5}" text-anchor="end">${f ? short(max * f) : '0'}</text>`).join('')}</g>
      <path class="a-prev" d="${smooth(prev)}"/>
      <path class="a-fill" d="${line} L${x(n - 1)},${H - padB} L${x(0)},${H - padB} Z" fill="url(#dash-ag)"/>
      <path class="a-line" d="${line}" pathLength="1"/>
      <g class="a-x">${s.labels.map((l, i) => (i % every === 0 || i === n - 1) && !(i !== n - 1 && n - 1 - i < every / 2) ? `<text x="${x(i)}" y="${H - 8}" text-anchor="middle">${st.period === 'hari' ? l : l.split(', ')[1]}</text>` : '').join('')}</g>
      <g class="a-hover" opacity="0"><line class="a-cross" y1="${padT}" y2="${H - padB}"/><circle class="a-dot" r="5.5"/></g>
    </svg><div class="a-tip" hidden></div>`;
  }
  function hover(e: PointerEvent) {
    if (!geo) return;
    const box = $('area'), b = box.getBoundingClientRect(), s = S();
    const i = Math.max(0, Math.min(s.vals.length - 1, Math.round((e.clientX - b.left - geo.padL) / geo.step)));
    const [px, py] = geo.pts[i];
    const g = box.querySelector('.a-hover')!;
    g.setAttribute('opacity', '1');
    g.querySelector('line')!.setAttribute('x1', String(px)); g.querySelector('line')!.setAttribute('x2', String(px));
    g.querySelector('circle')!.setAttribute('cx', String(px)); g.querySelector('circle')!.setAttribute('cy', String(py));
    const tip = box.querySelector<HTMLElement>('.a-tip')!, d = pct(s.vals[i], s.prev[i]);
    tip.hidden = false;
    tip.innerHTML = `<span>${s.labels[i]}</span><strong>${rp(s.vals[i])}</strong><em class="${d < 0 ? 'dn' : ''}">${d >= 0 ? '+' : ''}${d}% dari sebelumnya</em>`;
    tip.style.left = `${Math.max(80, Math.min(geo.W - 80, px))}px`;
    tip.style.top = `${py}px`;
  }
  const area = $('area');
  area.addEventListener('pointermove', hover);
  area.addEventListener('pointerdown', hover);
  area.addEventListener('pointerleave', () => { area.querySelector('.a-hover')?.setAttribute('opacity', '0'); const t = area.querySelector<HTMLElement>('.a-tip'); if (t) t.hidden = true; });
  new ResizeObserver(() => { if (Math.abs(area.clientWidth - lastW) > 2) requestAnimationFrame(() => renderArea(false)); }).observe(area);

  function renderDonut(animate: boolean) {
    const s = S(), om = s.vals.reduce((a, b) => a + b, 0), trx = Math.round(om / 38500), C = 2 * Math.PI * 52;
    let off = 0;
    const segs = PAY.map(([, c], i) => { const len = (s.pay[i] / 100) * C; const seg = `<circle class="d-seg" cx="70" cy="70" r="52" style="stroke:${c};stroke-dasharray:${Math.max(0, len - 3)} ${C};stroke-dashoffset:${-off};--d:${i * 150}ms"/>`; off += len; return seg; }).join('');
    $('donut').innerHTML = `<div class="card-h"><div><strong>Metode bayar</strong><span class="sub">Porsi dari ${trx.toLocaleString('id-ID')} transaksi</span></div></div>
      <div class="donut-wrap${animate && !reduced() ? ' draw' : ''}">
        <div class="donut"><svg viewBox="0 0 140 140" aria-hidden="true"><circle class="d-track" cx="70" cy="70" r="52"/>${segs}</svg>
          <div class="d-center"><strong data-num="${s.pay[0]}" data-key="dq" data-fmt="pct">${s.pay[0]}%</strong><span>lewat QRIS</span></div></div>
        <ul class="d-legend">${PAY.map(([m, c, i], k) => `<li><i style="background:${c}"></i><span class="d-m">${ic(i)}${m}</span><b>${s.pay[k]}%</b><span class="d-amt">${rp(om * s.pay[k] / 100)}</span></li>`).join('')}</ul>
      </div>`;
    countUp($('donut'), nums);
  }

  function renderHeat(animate: boolean) {
    let pd = 5, ph = 8;
    HEAT.forEach((row, d) => row.forEach((v, h) => { if (v > HEAT[pd][ph]) { pd = d; ph = h; } }));
    const [sd, sh] = st.heat ? st.heat.split('-').map(Number) : [pd, ph];
    $('heat').innerHTML = `<div class="card-h"><div><strong>Jam paling ramai</strong><span class="sub">Rata-rata 4 minggu terakhir</span></div>
        <span class="heat-scale">Sepi<span class="hs-bar"></span>Ramai</span></div>
      <div class="heat${animate && !reduced() ? ' stagger' : ''}">
        <span></span>${HOURS.map((h, i) => `<span class="hx">${i % 3 === 0 ? pad(h) : ''}</span>`).join('')}
        ${HEAT.map((row, d) => `<span class="hl">${HD[d]}</span>${row.map((v, h) => `<span class="hc${d === sd && h === sh ? ' on' : ''}" data-a="heat" data-v="${d}-${h}" style="--v:${(0.06 + 0.94 * (v - HMIN) / (HMAX - HMIN)).toFixed(2)};--d:${(d + h) * 22}ms" title="${HD[d]} ${pad(HOURS[h])}.00 · ${v} transaksi"></span>`).join('')}`).join('')}
      </div>
      <p class="heat-note">${ic('sparkle')}<span><b>${HD[sd]} ${pad(HOURS[sh])}.00</b> rata-rata ${HEAT[sd][sh]} transaksi per jam${sd === pd && sh === ph ? '. Waktu paling ramai, siapkan satu barista tambahan.' : '.'}</span></p>`;
  }

  function renderTop(animate: boolean) {
    const s = S(), om = s.vals.reduce((a, b) => a + b, 0), trx = om / 38500;
    const box = $('top');
    box.innerHTML = `<div class="card-h"><div><strong>Menu terlaris</strong><span class="sub">Jumlah terjual</span></div></div>
      <ol class="tp${animate && !reduced() ? ' stagger' : ''}">${TOP.map(([id, share], i) => {
        const m = MENU.find((x) => x.id === id)!, qty = Math.round((share / 100) * trx * 1.6);
        return `<li style="--d:${i * 90}ms">${thumb(m, 'sm')}<div><div class="tp-name"><span>${m.name}</span><b data-num="${qty}" data-key="tp${i}">${qty}</b></div><span class="bar-t"><i style="width:${(share / 34) * 100}%"></i></span></div><span class="rv">${short(qty * m.price)}</span></li>`;
      }).join('')}</ol>`;
    countUp(box, nums);
  }

  function renderFeed() {
    $('feed').innerHTML = `<div class="card-h"><div><strong>Transaksi terbaru</strong><span class="sub"><b data-num="${st.todayTrx}" data-key="today">${st.todayTrx}</b> transaksi hari ini</span></div><span class="live"><i></i>Live</span></div>
      <ul class="feed">${st.feed.map((f) => `<li class="${f.fresh ? 'fresh' : ''}"><span class="fd-ic m-${f.method}">${ic(PAY.find((p) => p[0] === f.method)![2])}</span>
        <div><strong>${f.items}</strong><span>#A-${pad(f.no, 4)} · ${f.t} · ${f.method}</span></div><b>+${rp(f.amt)}</b></li>`).join('')}</ul>`;
    countUp($('feed'), nums);
    st.feed.forEach((f) => (f.fresh = false));
  }

  function renderStock() {
    $('stock').innerHTML = `<div class="card-h"><div><strong>Stok menipis</strong><span class="sub">Di bawah batas minimal</span></div>${st.stock.length ? `<span class="pill warn">${st.stock.length} bahan</span>` : ''}</div>
      ${st.stock.length ? `<ul class="stk">${st.stock.map((s) => `<li class="${s.state === 'gone' ? 'leaving' : ''}">
          <span class="ring" style="--p:${s.lvl}"><span>${Math.round(s.lvl * 100)}%</span></span>
          <div class="stk-info"><strong>${s.name}</strong><span>Sisa ${s.left} · minimal ${s.min.toLocaleString('id-ID')}</span></div>
          <button type="button" class="btn btn-ghost btn-sm${s.state === 'done' || s.state === 'gone' ? ' ok' : ''}" data-a="restock" data-v="${s.id}" ${s.state ? 'disabled' : ''}>${s.state === 'loading' ? '<i class="spin"></i>Memesan' : s.state ? `${ic('check')}Dipesan` : 'Pesan ulang'}</button>
        </li>`).join('')}</ul>`
        : `<div class="all-good"><span>${ic('check')}</span><strong>Semua stok aman</strong><span class="sub">Pesanan ke pemasok sudah dikirim.</span></div>`}`;
  }

  function all(animate: boolean) { renderPeriod(); renderKpis(animate); renderArea(animate); renderDonut(animate); renderHeat(animate); renderTop(animate); renderFeed(); renderStock(); }

  delegate(el, (a, v) => {
    if (a === 'bell') return toast(el, 'Laporan mingguan siap diunduh', 'bell');
    if (a === 'period') { st.period = v; renderPeriod(); renderKpis(false); renderArea(true); renderDonut(true); renderTop(true); }
    if (a === 'heat') { st.heat = v; renderHeat(false); }
    if (a === 'restock') {
      const s = st.stock.find((x) => x.id === v)!;
      s.state = 'loading'; renderStock();
      setTimeout(() => { s.state = 'done'; renderStock(); }, 800);
      setTimeout(() => { s.state = 'gone'; renderStock(); toast(el, `${s.name} dipesan ke pemasok`, 'package'); }, 1700);
      setTimeout(() => { st.stock = st.stock.filter((x) => x !== s); renderStock(); }, 2150);
    }
  });

  // Transaksi baru masuk tiap beberapa detik selama panel terlihat.
  let visible = false;
  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(el);
  setInterval(() => {
    if (!visible || el.hidden || document.hidden) return;
    st.no++; st.todayTrx++;
    st.feed.unshift({ no: st.no, t: clock(), ...trxItem(), fresh: true });
    st.feed = st.feed.slice(0, 5);
    renderFeed();
  }, 4200);

  all(false);
  return { show() { nums.clear(); st.heat = ''; all(true); } };
}
