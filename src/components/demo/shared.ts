// Alat bersama untuk empat aplikasi demo: ikon, format angka, sheet, toast, dan animasi kecil.

export const rp = (n: number) => 'Rp' + Math.round(n).toLocaleString('id-ID');
export const short = (n: number) =>
  n >= 1e6 ? `${(n / 1e6).toLocaleString('id-ID', { maximumFractionDigits: 1 })} jt` : `${Math.round(n / 1000)} rb`;
export const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
export const pad = (n: number, w = 2) => String(n).padStart(w, '0');
export const DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
export const DAYS_LONG = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
export const MONTHS_LONG = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
export const dayOffset = (n: number) => { const d = new Date(); d.setDate(d.getDate() + n); return d; };
export const fmtDate = (d: Date) => `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`;
export const fmtLong = (d: Date) => `${DAYS_LONG[d.getDay()]}, ${d.getDate()} ${MONTHS_LONG[d.getMonth()]}`;
export const clock = (d = new Date()) => `${pad(d.getHours())}.${pad(d.getMinutes())}`;
export const ini = (s: string) => s.replace(/^(Bu|Pak|Mas|Mbak) /, '').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
export const rng = (seed: number) => () => (seed = (seed * 16807) % 2147483647) / 2147483647;
export const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
export const phone = () => matchMedia('(max-width: 640px)').matches;

const P: Record<string, string> = {
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  cart: '<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l2.7 12.4a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6"/>',
  bars: '<path d="M5 21V10M12 21V4M19 21v-7"/>',
  chart: '<path d="M3 3v18h18"/><path d="m7 15 4-4 3 3 6-6"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
  users: '<circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0"/><path d="M16 4a4 4 0 0 1 0 8M22 21a7 7 0 0 0-4-6.3"/>',
  settings: '<path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  coffee: '<path d="M4 8h13v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"/><path d="M17 10h1.5a2.5 2.5 0 0 1 0 5H17"/><path d="M8 2.5v2.5M12 2.5v2.5"/>',
  cup: '<path d="M6 8h12l-1.4 12.2a2 2 0 0 1-2 1.8H9.4a2 2 0 0 1-2-1.8z"/><path d="M5 8h14"/><path d="m13 8 2-6h3"/><path d="M7 13h10"/>',
  leaf: '<path d="M5 20c0-9 6-15 15-15 0 9-6 15-15 15z"/><path d="M5 20 14 11"/>',
  bread: '<path d="M5 11a4 4 0 0 1 2-7.5h10A4 4 0 0 1 19 11v8a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1z"/><path d="M9 8v3M15 8v3"/>',
  bowl: '<path d="M3 11h18a9 9 0 0 1-18 0z"/><path d="M7 21h10"/><path d="M9 7c0-1.5 1-1.5 1-3M13 7c0-1.5 1-1.5 1-3"/>',
  flame: '<path d="M12 22c4 0 7-3 7-7 0-5-5-7-5-12-3 2-5 5-5 8-1-1-2-2-2-4-2 2-2 5-2 8 0 4 3 7 7 7z"/>',
  qr: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM20 14v.01M17 20h4M14 20v.01"/>',
  cash: '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 12h.01M18 12h.01"/>',
  card: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h4"/>',
  up: '<path d="m3 17 6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
  down: '<path d="m3 7 6 6 4-4 8 8"/><path d="M15 17h6v-6"/>',
  package: '<path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="m3 8 9 5 9-5M12 13v8"/>',
  message: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 21l1.9-5.4A8 8 0 1 1 21 12z"/>',
  phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
  insta: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/>',
  chevL: '<path d="m15 18-6-6 6-6"/>',
  chevR: '<path d="m9 18 6-6-6-6"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  receipt: '<path d="M5 3h14v18l-3-2-2 2-2-2-2 2-2-2-3 2z"/><path d="M9 8h6M9 12h6M9 16h3"/>',
  printer: '<path d="M6 9V3h12v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M7 14h10v7H7z"/>',
  sparkle: '<path d="M12 3c.5 4 2 5.5 6 6-4 .5-5.5 2-6 6-.5-4-2-5.5-6-6 4-.5 5.5-2 6-6z"/><path d="M19 15c.2 1.6.8 2.2 2.4 2.4-1.6.2-2.2.8-2.4 2.4-.2-1.6-.8-2.2-2.4-2.4 1.6-.2 2.2-.8 2.4-2.4z"/>',
  scissors: '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4 8.1 15.9M14.5 14.5 20 20M8.1 8.1 12 12"/>',
  copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/>',
  send: '<path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  refresh: '<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/>',
  percent: '<path d="M19 5 5 19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  kanban: '<rect x="3" y="3" width="5" height="18" rx="1.5"/><rect x="10" y="3" width="5" height="12" rx="1.5"/><rect x="17" y="3" width="4" height="8" rx="1.5"/>',
  share: '<path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7"/><path d="m16 6-4-4-4 4M12 2v13"/>',
  store: '<path d="M3 9l1.5-5h15L21 9"/><path d="M3 9h18v1.5a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0z"/><path d="M5 13v8h14v-8"/>',
};
export const ic = (n: string, cls = '') => `<svg class="i ${cls}" viewBox="0 0 24 24" aria-hidden="true">${P[n] ?? ''}</svg>`;

type Shell = { logo: string; brand: string; page: string; nav: string[]; active: number; user: string; role: string; search?: string };
export const shell = (o: Shell) => `
  <div class="shell">
    <nav class="rail" aria-hidden="true">
      <span class="rail-logo">${o.logo}</span>
      ${o.nav.map((n, i) => `<span class="rail-i${i === o.active ? ' on' : ''}">${ic(n)}</span>`).join('')}
      <span class="rail-sp"></span>
      <span class="rail-i">${ic('settings')}</span>
    </nav>
    <div class="main">
      <header class="topbar">
        <span class="tb-logo" aria-hidden="true">${o.logo}</span>
        <div class="tb-title"><span class="tb-crumb">${o.brand}</span><strong>${o.page}</strong></div>
        ${o.search ? `<label class="tb-search">${ic('search')}<input data-in="search" type="search" placeholder="${o.search}" aria-label="${o.search}" autocomplete="off" /><kbd>⌘K</kbd></label>` : ''}
        <button type="button" class="tb-icon" data-a="bell" aria-label="Notifikasi">${ic('bell')}<i class="dot"></i></button>
        <span class="tb-user"><span class="av t-acc">${o.user[0]}</span><span class="tb-name">${o.user}<em>${o.role}</em></span></span>
      </header>
      <div class="content" data-r="content"></div>
      <div class="sheet-wrap"></div>
      <div class="toasts" role="status" aria-live="polite"></div>
    </div>
  </div>`;

// Klik didelegasikan lewat atribut data-a (aksi) dan data-v (nilai).
export function delegate(el: HTMLElement, fn: (a: string, v: string, t: HTMLElement, e: MouseEvent) => void) {
  el.addEventListener('click', (e) => {
    const t = (e.target as HTMLElement).closest<HTMLElement>('[data-a]');
    if (!t || !el.contains(t) || (t as HTMLButtonElement).disabled) return;
    fn(t.dataset.a!, t.dataset.v ?? '', t, e);
  });
  el.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSheet(el); });
}

let lastFocus: HTMLElement | null = null;
export function openSheet(host: HTMLElement, html: string, cls = '') {
  const wrap = host.querySelector<HTMLElement>('.sheet-wrap')!;
  lastFocus = document.activeElement as HTMLElement;
  wrap.className = `sheet-wrap open ${cls}`;
  wrap.innerHTML = `<div class="sheet-bg" data-a="close"></div><div class="sheet" role="dialog" aria-modal="true" tabindex="-1"><div class="sheet-body">${html}</div></div>`;
  if (phone()) document.documentElement.classList.add('sheet-lock');
  wrap.querySelector<HTMLElement>('.sheet')!.focus({ preventScroll: true });
}
export function updateSheet(host: HTMLElement, html: string) {
  const b = host.querySelector('.sheet-body');
  if (b) b.innerHTML = html;
}
export function closeSheet(host: HTMLElement) {
  const wrap = host.querySelector<HTMLElement>('.sheet-wrap');
  if (!wrap?.classList.contains('open')) return;
  wrap.classList.replace('open', 'closing');
  document.documentElement.classList.remove('sheet-lock');
  lastFocus?.focus?.({ preventScroll: true });
  setTimeout(() => { if (wrap.classList.contains('closing')) { wrap.className = 'sheet-wrap'; wrap.innerHTML = ''; } }, 280);
}

export function toast(host: HTMLElement, msg: string, icon = 'check') {
  const box = host.querySelector('.toasts')!;
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = `${ic(icon)}<span>${esc(msg)}</span>`;
  box.append(t);
  setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 320); }, 2400);
}

// Angka berjalan dari nilai sebelumnya ke nilai baru. Elemen ditandai data-num, data-key, data-fmt.
const FMT: Record<string, (v: number) => string> = {
  rp, jt: short, pct: (v) => `${Math.round(v)}%`, int: (v) => Math.round(v).toLocaleString('id-ID'),
};
export function countUp(scope: HTMLElement, store: Map<string, number>) {
  scope.querySelectorAll<HTMLElement>('[data-num]').forEach((el) => {
    const key = el.dataset.key!, to = Number(el.dataset.num), f = FMT[el.dataset.fmt ?? 'int'];
    const from = store.get(key) ?? 0;
    store.set(key, to);
    if (reduced() || from === to) { el.textContent = f(to); return; }
    const t0 = performance.now(), d = 900;
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / d);
      el.textContent = f(from + (to - from) * (1 - Math.pow(1 - p, 4)));
      if (p < 1) requestAnimationFrame(step);
    };
    el.textContent = f(from);
    requestAnimationFrame(step);
  });
}

// Salinan elemen terbang ke target (misalnya gambar menu ke keranjang).
export function fly(from: Element | null, to: Element | null) {
  const layer = from?.closest('.demo');
  if (!from || !to || !layer || reduced()) return Promise.resolve();
  const a = from.getBoundingClientRect(), b = to.getBoundingClientRect();
  const c = from.cloneNode(true) as HTMLElement;
  c.classList.add('flyer');
  Object.assign(c.style, { left: `${a.left}px`, top: `${a.top}px`, width: `${a.width}px`, height: `${a.height}px` });
  layer.append(c);
  const dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.top + a.height / 2);
  return c.animate(
    [
      { transform: 'translate(0,0) scale(1) rotate(0)', opacity: 1 },
      { transform: `translate(${dx * 0.45}px, ${dy * 0.45 - 80}px) scale(.62) rotate(-12deg)`, opacity: 1, offset: 0.5 },
      { transform: `translate(${dx}px, ${dy}px) scale(.16) rotate(8deg)`, opacity: 0.3 },
    ],
    { duration: 720, easing: 'cubic-bezier(.55,0,.3,1)' },
  ).finished.then(() => c.remove());
}

export function confetti(from: Element | null) {
  const layer = from?.closest('.demo');
  if (!from || !layer || reduced()) return;
  const r = from.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
  const colors = ['#3A5BFF', '#25B892', '#FFB224', '#FF6B47', '#8B5CF6', '#2BB3FF'];
  for (let i = 0; i < 36; i++) {
    const s = document.createElement('i');
    s.className = 'confetti';
    s.style.cssText = `left:${x}px;top:${y}px;background:${colors[i % colors.length]};${i % 3 ? '' : 'border-radius:50%;'}`;
    layer.append(s);
    const ang = Math.random() * Math.PI * 2, d = 70 + Math.random() * 130;
    s.animate(
      [
        { transform: 'translate(-50%,-50%) rotate(0) scale(1)', opacity: 1 },
        { transform: `translate(${Math.cos(ang) * d}px, ${Math.sin(ang) * d - 40}px) rotate(${Math.random() * 540}deg) scale(1)`, opacity: 1, offset: 0.55 },
        { transform: `translate(${Math.cos(ang) * d * 1.2}px, ${Math.sin(ang) * d + 120}px) rotate(${Math.random() * 900}deg) scale(.6)`, opacity: 0 },
      ],
      { duration: 1100 + Math.random() * 600, easing: 'cubic-bezier(.15,.7,.35,1)' },
    ).finished.then(() => s.remove());
  }
}

// Kurva halus melewati semua titik (Catmull-Rom ke Bezier).
export function smooth(pts: number[][]) {
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1} ${c2} ${p2}`;
  }
  return d;
}

let sparkId = 0;
export function spark(vals: number[], color: string) {
  const w = 120, h = 36, max = Math.max(...vals), min = Math.min(...vals) * 0.9;
  const pts = vals.map((v, i) => [(i / (vals.length - 1)) * w, h - 3 - ((v - min) / (max - min || 1)) * (h - 8)]);
  const line = smooth(pts), id = `sp${++sparkId}`;
  return `<svg class="spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true">
    <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:${color};stop-opacity:.25"/><stop offset="1" style="stop-color:${color};stop-opacity:0"/></linearGradient></defs>
    <path d="${line} L${w},${h} L0,${h} Z" fill="url(#${id})"/>
    <path d="${line}" class="l" style="stroke:${color}" vector-effect="non-scaling-stroke"/></svg>`;
}
