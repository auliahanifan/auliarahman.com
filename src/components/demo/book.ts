import { ic, rp, short, pad, esc, shell, delegate, openSheet, updateSheet, closeSheet, toast, countUp, rng, dayOffset, fmtLong, fmtDate } from './shared';

const OPEN = 600, CLOSE = 1200; // menit dari tengah malam: 10.00 sampai 20.00, 1 menit = 1 px
const BARBERS = [
  { id: 'bayu', name: 'Bayu', role: 'Senior', tone: 'ungu' },
  { id: 'doni', name: 'Doni', role: 'Stylist', tone: 'langit' },
  { id: 'eko', name: 'Eko', role: 'Junior', tone: 'mint' },
];
const SVC = [
  { id: 'cut', name: 'Potong rambut', dur: 30, price: 50000, tone: 'ungu' },
  { id: 'wash', name: 'Potong + keramas', dur: 45, price: 65000, tone: 'langit' },
  { id: 'beard', name: 'Rapikan jenggot', dur: 30, price: 30000, tone: 'amber' },
  { id: 'color', name: 'Pewarnaan', dur: 90, price: 150000, tone: 'koral' },
  { id: 'kids', name: 'Potong anak', dur: 30, price: 40000, tone: 'mint' },
];
const NAMES = ['Raka', 'Bima', 'Fajar', 'Yoga', 'Dimas', 'Arif', 'Hendra', 'Wisnu', 'Galih', 'Satria', 'Tegar', 'Angga', 'Rizky', 'Bagas', 'Iqbal', 'Naufal'];
const STATUS: Record<string, string> = { booked: 'Terjadwal', checkin: 'Sedang dilayani', done: 'Selesai' };
type Bk = { id: string; barber: string; start: number; svc: string; name: string; status: 'booked' | 'checkin' | 'done'; fresh?: boolean };

const t = (m: number) => `${pad(Math.floor(m / 60))}.${pad(m % 60)}`;
const svc = (id: string) => SVC.find((s) => s.id === id)!;
const barber = (id: string) => BARBERS.find((b) => b.id === id)!;
const nowMin = () => { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); };

export function initBook(el: HTMLElement) {
  const days = new Map<number, Bk[]>();
  const st = { day: 0, draft: null as null | { barber: string; start: number; svc: string; name: string }, open: '' };
  const nums = new Map<string, number>();

  function gen(day: number) {
    const r = rng(day * 131 + 977), list: Bk[] = [], now = nowMin();
    BARBERS.forEach((b, bi) => {
      let m = OPEN + [0, 30, 60][Math.floor(r() * 3)];
      for (;;) {
        const s = SVC[Math.floor(r() * SVC.length)];
        if (m + s.dur > CLOSE) break;
        const end = m + s.dur;
        const status = day < 0 || (day === 0 && end <= now) ? 'done' : day === 0 && m <= now ? 'checkin' : 'booked';
        list.push({ id: `${day}-${bi}-${m}`, barber: b.id, start: m, svc: s.id, name: NAMES[Math.floor(r() * NAMES.length)], status });
        m = end + [0, 0, 15, 30, 30, 60, 90][Math.floor(r() * 7)];
      }
    });
    return list;
  }
  const list = () => { if (!days.has(st.day)) days.set(st.day, gen(st.day)); return days.get(st.day)!; };
  const overlaps = (b: string, start: number, dur: number) => list().some((x) => x.barber === b && start < x.start + svc(x.svc).dur && x.start < start + dur);

  el.innerHTML = shell({ logo: 'CK', brand: 'Cukur Kidul', page: 'Jadwal kapster', nav: ['home', 'calendar', 'users', 'scissors', 'bars'], active: 1, user: 'Sekar', role: 'Admin', search: 'Cari pelanggan…' });
  el.querySelector('[data-r="content"]')!.innerHTML = `
    <div class="bk">
      <div class="bk-nav">
        <div class="bk-arrows"><button type="button" class="icon-btn" data-a="day" data-v="-1" aria-label="Hari sebelumnya">${ic('chevL')}</button><button type="button" class="icon-btn" data-a="day" data-v="1" aria-label="Hari berikutnya">${ic('chevR')}</button></div>
        <div class="bk-date"><strong data-r="date"></strong><span class="sub">3 kapster · buka 10.00 sampai 20.00</span></div>
        <button type="button" class="chip-btn" data-a="today">Hari ini</button>
      </div>
      <div class="stats" data-r="stats"></div>
      <div class="bk-main">
        <div class="tl" data-r="tl"></div>
        <aside class="bk-side" data-r="side"></aside>
      </div>
    </div>`;
  const $ = (n: string) => el.querySelector<HTMLElement>(`[data-r="${n}"]`)!;

  function renderHead() {
    const d = dayOffset(st.day);
    $('date').textContent = fmtLong(d);
    el.querySelector<HTMLButtonElement>('[data-a="today"]')!.disabled = st.day === 0;
    el.querySelector<HTMLButtonElement>('[data-a="day"][data-v="-1"]')!.disabled = st.day <= -3;
    el.querySelector<HTMLButtonElement>('[data-a="day"][data-v="1"]')!.disabled = st.day >= 6;
  }

  function renderStats() {
    const l = list(), busy = l.reduce((s, b) => s + svc(b.svc).dur, 0), cap = BARBERS.length * (CLOSE - OPEN);
    const util = Math.round((busy / cap) * 100), rev = l.reduce((s, b) => s + svc(b.svc).price, 0);
    let free = 0;
    BARBERS.forEach((b) => { for (let m = OPEN; m < CLOSE; m += 30) if (!overlaps(b.id, m, 30)) free++; });
    $('stats').innerHTML = `
      <div class="stat"><span>${ic('calendar')}Booking</span><strong data-num="${l.length}" data-key="n">${l.length}</strong></div>
      <div class="stat"><span>${ic('chart')}Kursi terisi</span><strong data-num="${util}" data-key="u" data-fmt="pct">${util}%</strong><span class="meter"><i style="width:${util}%"></i></span></div>
      <div class="stat"><span>${ic('cash')}Perkiraan omzet</span><strong data-num="${rev}" data-key="r" data-fmt="jt">${short(rev)}</strong></div>
      <div class="stat"><span>${ic('clock')}Slot kosong</span><strong data-num="${free}" data-key="f">${free}</strong></div>`;
    countUp($('stats'), nums);
  }

  function renderTl(scroll: boolean) {
    const l = list(), now = nowMin();
    const showNow = st.day === 0 && now > OPEN && now < CLOSE;
    const hours = Array.from({ length: (CLOSE - OPEN) / 60 + 1 }, (_, i) => OPEN / 60 + i);
    const prevScroll = $('tl').querySelector('.tl-scroll')?.scrollTop ?? 0;
    $('tl').innerHTML = `
      <div class="tl-head"><span class="tl-corner">${ic('clock')}</span>${BARBERS.map((b) => {
        const n = l.filter((x) => x.barber === b.id).length;
        return `<div class="tl-bh"><span class="av t-${b.tone}">${b.name[0]}</span><div><strong>${b.name}</strong><span>${b.role} · ${n} booking</span></div></div>`;
      }).join('')}</div>
      <div class="tl-scroll"><div class="tl-grid" style="--h:${CLOSE - OPEN}px">
        <div class="tl-times">${hours.map((h) => `<span style="top:${(h * 60 - OPEN)}px">${pad(h)}.00</span>`).join('')}</div>
        ${BARBERS.map((b) => `<div class="tl-col" data-a="slot" data-v="${b.id}" aria-label="Kolom ${b.name}, klik jam kosong untuk booking">
          ${l.filter((x) => x.barber === b.id).map((x) => {
            const s = svc(x.svc);
            return `<button type="button" class="bkb t-${s.tone} s-${x.status}${s.dur <= 45 ? ' xs' : ''}${x.fresh ? ' pop' : ''}" style="top:${x.start - OPEN}px;height:${s.dur}px" data-a="open" data-v="${x.id}" aria-label="${esc(x.name)}, ${s.name}, ${t(x.start)}">
              <span class="bkb-t">${t(x.start)}</span><strong>${esc(x.name)}</strong><span class="bkb-s">${s.name}</span>${x.status === 'checkin' ? '<i class="bkb-live"></i>' : ''}
            </button>`;
          }).join('')}
          <div class="tl-ghost" hidden></div>
        </div>`).join('')}
        ${showNow ? `<div class="tl-now" style="top:${now - OPEN}px"><span>${t(now)}</span></div>` : ''}
      </div></div>`;
    l.forEach((x) => (x.fresh = false));
    const sc = $('tl').querySelector<HTMLElement>('.tl-scroll')!;
    sc.scrollTop = scroll ? (showNow ? Math.max(0, now - OPEN - 120) : 0) : prevScroll;
  }

  function renderSide() {
    const l = list(), now = st.day === 0 ? nowMin() : 0;
    const next = l.filter((x) => x.status === 'booked' && x.start >= now).sort((a, b) => a.start - b.start).slice(0, 4);
    const counts = SVC.map((s) => ({ s, n: l.filter((x) => x.svc === s.id).length }));
    const maxN = Math.max(1, ...counts.map((c) => c.n));
    $('side').innerHTML = `
      <section class="card">
        <div class="card-h"><div><strong>Berikutnya</strong><span class="sub">${st.day === 0 ? 'Antrean setelah jam ini' : fmtDate(dayOffset(st.day))}</span></div></div>
        ${next.length ? `<ul class="next">${next.map((x) => {
          const s = svc(x.svc), mins = x.start - now;
          return `<li><span class="nx-t t-${s.tone}">${t(x.start)}</span><div><strong>${esc(x.name)}</strong><span>${s.name} · ${barber(x.barber).name}</span></div>${st.day === 0 && mins < 120 ? `<em>${mins < 60 ? `${mins} mnt` : `${Math.floor(mins / 60)} j ${mins % 60} m`}</em>` : ''}</li>`;
        }).join('')}</ul>` : `<p class="sub pad">Tidak ada antrean lagi hari ini.</p>`}
      </section>
      <section class="card">
        <div class="card-h"><div><strong>Layanan</strong><span class="sub">Jumlah booking per layanan</span></div></div>
        <ul class="svc-bars">${counts.map(({ s, n }) => `<li class="t-${s.tone}"><span><i class="svc-dot"></i>${s.name}</span><b>${n}</b><span class="meter"><i style="width:${(n / maxN) * 100}%"></i></span></li>`).join('')}</ul>
      </section>`;
  }

  function newHtml() {
    const d = st.draft!, s = svc(d.svc), b = barber(d.barber);
    return `<div class="sh-head"><div><span class="eyebrow-s">Booking baru</span><strong class="sh-title">${b.name} · ${t(d.start)}</strong></div><button type="button" class="icon-btn" data-a="close" aria-label="Tutup">${ic('x')}</button></div>
      <div class="chips-row"><span class="chip-i">${ic('calendar')}${fmtDate(dayOffset(st.day))}</span><span class="chip-i">${ic('clock')}${t(d.start)} – ${t(d.start + s.dur)}</span><span class="chip-i t-${b.tone}"><i class="svc-dot"></i>${b.name}</span></div>
      <span class="lbl">Layanan</span>
      <div class="svc-list" role="radiogroup" aria-label="Layanan">${SVC.map((x) => {
        const bad = d.start + x.dur > CLOSE || overlaps(d.barber, d.start, x.dur);
        return `<button type="button" class="svc-opt t-${x.tone}" role="radio" aria-checked="${x.id === d.svc}" data-a="svc" data-v="${x.id}" ${bad ? 'disabled' : ''}><i class="svc-dot"></i><span><strong>${x.name}</strong><em>${bad ? 'Bentrok dengan jadwal lain' : `${x.dur} menit`}</em></span><b>${rp(x.price)}</b></button>`;
      }).join('')}</div>
      <label class="fld"><span class="lbl">Nama pelanggan</span><input data-in="bname" type="text" value="${esc(d.name)}" placeholder="mis. Andi" autocomplete="off" /></label>
      <button type="button" class="btn btn-pri btn-lg wide" data-a="save">Simpan booking · ${rp(s.price)}</button>`;
  }

  function detailHtml(x: Bk) {
    const s = svc(x.svc), b = barber(x.barber), steps = ['booked', 'checkin', 'done'], idx = steps.indexOf(x.status);
    return `<div class="bd-band t-${s.tone}"></div>
      <div class="sh-head"><div><span class="eyebrow-s">${STATUS[x.status]}</span><strong class="sh-title">${esc(x.name)}</strong></div><button type="button" class="icon-btn" data-a="close" aria-label="Tutup">${ic('x')}</button></div>
      <dl class="dr-info">
        <div><dt>Layanan</dt><dd>${s.name}</dd></div><div><dt>Kapster</dt><dd>${b.name}</dd></div>
        <div><dt>Waktu</dt><dd>${t(x.start)} – ${t(x.start + s.dur)}</dd></div><div><dt>Harga</dt><dd>${rp(s.price)}</dd></div>
      </dl>
      <ol class="steps4 three">${steps.map((k, i) => `<li class="${i <= idx ? 'done' : ''}${i === idx ? ' cur' : ''}"><span>${STATUS[k]}</span></li>`).join('')}</ol>
      <div class="sh-actions">${x.status === 'booked'
        ? `<button type="button" class="btn btn-ghost danger" data-a="cancel" data-v="${x.id}">Batalkan</button><button type="button" class="btn btn-pri" data-a="status" data-v="checkin">${ic('scissors')}Mulai layani</button>`
        : x.status === 'checkin'
          ? `<button type="button" class="btn btn-pri wide" data-a="status" data-v="done">${ic('check')}Selesai dan bayar ${rp(s.price)}</button>`
          : `<div class="won">${ic('check')}Layanan selesai</div>`}</div>`;
  }

  const all = (scroll: boolean) => { renderHead(); renderStats(); renderTl(scroll); renderSide(); };

  delegate(el, (a, v, tg, e) => {
    if (a === 'close') return closeSheet(el);
    if (a === 'bell') return toast(el, 'Raka minta jadwal ulang ke besok', 'bell');
    if (a === 'day') { st.day = Math.max(-3, Math.min(6, st.day + Number(v))); all(true); }
    if (a === 'today') { st.day = 0; all(true); }
    if (a === 'slot') {
      const rect = tg.getBoundingClientRect();
      const m = OPEN + Math.floor((e.clientY - rect.top) / 30) * 30;
      if (m >= CLOSE) return;
      if (st.day === 0 && m + 30 <= nowMin()) return toast(el, 'Jam itu sudah lewat', 'clock');
      if (overlaps(v, m, 30)) return toast(el, 'Jam itu sudah terisi', 'clock');
      st.draft = { barber: v, start: m, svc: 'cut', name: '' };
      openSheet(el, newHtml());
    }
    if (a === 'svc' && st.draft) { st.draft.svc = v; updateSheet(el, newHtml()); }
    if (a === 'save' && st.draft) {
      const d = st.draft, name = d.name.trim() || 'Pelanggan baru';
      list().push({ id: `n${Date.now()}`, barber: d.barber, start: d.start, svc: d.svc, name, status: 'booked', fresh: true });
      closeSheet(el);
      renderStats(); renderTl(false); renderSide();
      toast(el, `Booking ${name} pukul ${t(d.start)} tersimpan`, 'calendar');
      st.draft = null;
    }
    if (a === 'open') { st.open = v; const x = list().find((b) => b.id === v); if (x) openSheet(el, detailHtml(x)); }
    if (a === 'status') {
      const x = list().find((b) => b.id === st.open);
      if (!x) return;
      x.status = v as Bk['status'];
      closeSheet(el); renderTl(false); renderSide();
      toast(el, v === 'done' ? `${x.name} selesai, ${rp(svc(x.svc).price)} tercatat` : `${x.name} sedang dilayani`, v === 'done' ? 'cash' : 'scissors');
    }
    if (a === 'cancel') {
      const l = list(), x = l.find((b) => b.id === v);
      if (!x) return;
      l.splice(l.indexOf(x), 1);
      closeSheet(el); renderStats(); renderTl(false); renderSide();
      toast(el, `Booking ${x.name} dibatalkan`, 'x');
    }
  });
  el.addEventListener('input', (e) => { const i = e.target as HTMLInputElement; if (i.dataset.in === 'bname' && st.draft) st.draft.name = i.value; });

  // Bayangan slot mengikuti kursor di kolom kosong (hanya mouse).
  const tl = $('tl');
  tl.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    tl.querySelectorAll<HTMLElement>('.tl-ghost').forEach((g) => (g.hidden = true));
    const col = (e.target as HTMLElement).closest<HTMLElement>('.tl-col');
    if (!col || (e.target as HTMLElement).closest('.bkb')) return;
    const m = OPEN + Math.floor((e.clientY - col.getBoundingClientRect().top) / 30) * 30;
    if (m >= CLOSE || overlaps(col.dataset.v!, m, 30) || (st.day === 0 && m + 30 <= nowMin())) return;
    const g = col.querySelector<HTMLElement>('.tl-ghost')!;
    g.hidden = false;
    g.style.top = `${m - OPEN}px`;
    g.innerHTML = `${ic('plus')}${t(m)}`;
  });
  tl.addEventListener('pointerleave', () => tl.querySelectorAll<HTMLElement>('.tl-ghost').forEach((g) => (g.hidden = true)));

  all(true);
  return { show() { nums.clear(); renderStats(); renderTl(true); } };
}
