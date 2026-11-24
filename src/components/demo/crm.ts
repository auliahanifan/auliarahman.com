import { ic, rp, short, esc, ini, shell, delegate, openSheet, updateSheet, closeSheet, toast, countUp, confetti, clock } from './shared';

const STAGES = [
  { id: 'baru', name: 'Baru', tone: 'langit' },
  { id: 'follow', name: 'Follow-up', tone: 'amber' },
  { id: 'nego', name: 'Negosiasi', tone: 'ungu' },
  { id: 'deal', name: 'Deal', tone: 'mint' },
] as const;
type Stage = (typeof STAGES)[number]['id'];
type Lead = { id: string; name: string; org: string; need: string; pax: number; date: string; due: number; value: number; ch: string; stage: Stage; last: string; tag: string; log: { t: string; text: string }[]; fresh?: boolean };
const CH: Record<string, string> = { WhatsApp: 'message', Instagram: 'insta', Telepon: 'phone' };
const TPL = [
  { id: 'sapa', name: 'Sapaan', text: 'Halo {name}, terima kasih sudah menghubungi Dapur Ratna. Untuk {need} tanggal {date}, boleh saya kirim pilihan menunya?' },
  { id: 'menu', name: 'Kirim menu', text: 'Halo {name}, ini pilihan paket untuk {pax} porsi: Paket Nusantara Rp30.000 dan Paket Spesial Rp38.000 per porsi. Mau coba tester dulu?' },
  { id: 'dp', name: 'Pengingat DP', text: 'Halo {name}, supaya tanggal {date} bisa kami kunci, mohon DP 30% sebesar {dp}. Kalau sudah transfer, kabari saya ya.' },
  { id: 'ok', name: 'Konfirmasi', text: 'Halo {name}, pesanan {need} untuk {date} sudah kami catat. H-2 kami hubungi lagi untuk jumlah akhir. Terima kasih!' },
];
const DEF_TPL: Record<Stage, string> = { baru: 'sapa', follow: 'menu', nego: 'dp', deal: 'ok' };
const L = (id: string, name: string, org: string, need: string, pax: number, date: string, due: number, per: number, ch: string, stage: Stage, last: string, tag: string, log: string[]): Lead =>
  ({ id, name, org, need, pax, date, due, value: pax * per, ch, stage, last, tag, log: log.map((x) => { const [t, text] = x.split('|'); return { t, text }; }) });

export function initCrm(el: HTMLElement) {
  let leads: Lead[] = [
    L('l1', 'Bu Sari', 'Arisan RT 05', 'Nasi box', 120, '6 Des', 12, 30000, 'WhatsApp', 'baru', 'Hari ini', 'Keluarga', ['Hari ini|Menanyakan harga nasi box lewat WhatsApp']),
    L('l2', 'Mas Anton', 'PT Sinar Mataram', 'Makan siang kantor', 40, '1 Jan', 38, 600000, 'Telepon', 'baru', 'Kemarin', 'Kantor', ['Kemarin|Telepon masuk, minta penawaran langganan bulanan']),
    L('l3', 'Mbak Laras', 'Lamaran keluarga', 'Prasmanan', 80, '14 Des', 20, 80000, 'Instagram', 'baru', '2 hari lalu', 'Keluarga', ['2 hari lalu|DM Instagram dari unggahan menu prasmanan']),
    L('l4', 'Pak Heru', 'Masjid Al-Ikhlas', 'Snack box', 200, '20 Des', 26, 15000, 'WhatsApp', 'follow', '3 hari lalu', 'Komunitas', ['3 hari lalu|Menu snack box terkirim', '5 hari lalu|Kontak pertama dari rekomendasi jamaah']),
    L('l5', 'Bu Dewi', 'TK Ceria', 'Tumpeng ulang tahun', 3, '9 Des', 15, 550000, 'WhatsApp', 'follow', '5 hari lalu', 'Sekolah', ['5 hari lalu|Kirim foto tumpeng mini dan tumpeng besar']),
    L('l6', 'Mas Rizal', 'Kopi Kita', 'Gathering karyawan', 60, '18 Des', 24, 70000, 'Instagram', 'follow', 'Seminggu lalu', 'Kantor', ['Seminggu lalu|Minta tester untuk 3 orang']),
    L('l7', 'Pak Bambang', 'Bengkel Maju', 'Syukuran', 100, '12 Des', 18, 35000, 'Telepon', 'nego', 'Kemarin', 'Kantor', ['Kemarin|Minta potongan 5%', '3 hari lalu|Penawaran Paket Nusantara terkirim']),
    L('l8', 'Mbak Nadia', 'Wisuda keluarga', 'Prasmanan', 50, '7 Des', 13, 85000, 'WhatsApp', 'nego', 'Hari ini', 'Keluarga', ['Hari ini|Setuju menu, menunggu DP']),
    L('l9', 'Bu Endah', 'Pengajian ibu-ibu', 'Nasi box', 75, '30 Nov', 6, 30000, 'WhatsApp', 'deal', 'Kemarin', 'Komunitas', ['Kemarin|DP 30% diterima', '4 hari lalu|Menu disetujui']),
    L('l10', 'Pak Yusuf', 'Kantor Notaris', 'Rapat tahunan', 30, '3 Des', 9, 55000, 'Telepon', 'deal', 'Hari ini', 'Kantor', ['Hari ini|Lunas, minta faktur']),
  ];
  const st = { q: '', open: '', tpl: '', typing: false, drag: null as null | { id: string; x: number; y: number; ghost?: HTMLElement; over?: HTMLElement | null }, suppress: false };
  const nums = new Map<string, number>();

  el.innerHTML = shell({ logo: 'DR', brand: 'Dapur Ratna', page: 'Calon pelanggan', nav: ['home', 'kanban', 'calendar', 'message', 'bars'], active: 1, user: 'Ratna', role: 'Pemilik' });
  el.querySelector('[data-r="content"]')!.innerHTML = `
    <div class="crm">
      <div class="crm-top">
        <div><span class="eyebrow-s">Pesanan Desember</span><h3 class="h">Pipeline katering</h3></div>
        <div class="crm-actions"><label class="search sm">${ic('search')}<input data-in="q" type="search" placeholder="Cari nama atau acara…" aria-label="Cari calon pelanggan" autocomplete="off" /></label>
          <button type="button" class="btn btn-pri" data-a="add">${ic('plus')}<span>Tambah</span></button></div>
      </div>
      <div class="stats" data-r="kpis"></div>
      <div class="funnel" data-r="funnel" aria-hidden="true"></div>
      <div class="board" data-r="board"></div>
      <p class="hint">${ic('sparkle')}<span class="hint-m">Seret kartu ke kolom lain untuk mengubah status, atau klik kartu untuk detail.</span><span class="hint-t">Ketuk kartu untuk detail dan mengubah status.</span></p>
    </div>`;
  const $ = (n: string) => el.querySelector<HTMLElement>(`[data-r="${n}"]`)!;
  const stage = (id: string) => STAGES.find((s) => s.id === id)!;
  const lead = (id: string) => leads.find((l) => l.id === id);
  const fill = (tpl: string, l: Lead) => TPL.find((x) => x.id === tpl)!.text
    .replace('{name}', l.name).replace('{need}', l.need.toLowerCase()).replace('{date}', l.date).replace('{pax}', String(l.pax)).replace('{dp}', rp(l.value * 0.3));

  function renderKpis() {
    const open = leads.filter((l) => l.stage !== 'deal'), deal = leads.filter((l) => l.stage === 'deal');
    const pipe = open.reduce((s, l) => s + l.value, 0), dv = deal.reduce((s, l) => s + l.value, 0);
    const conv = Math.round((deal.length / leads.length) * 100), avg = deal.length ? dv / deal.length : 0;
    $('kpis').innerHTML = `
      <div class="stat"><span>${ic('kanban')}Nilai pipeline</span><strong data-num="${pipe}" data-key="p" data-fmt="jt">${short(pipe)}</strong></div>
      <div class="stat ok"><span>${ic('check')}Sudah deal</span><strong data-num="${dv}" data-key="d" data-fmt="jt">${short(dv)}</strong></div>
      <div class="stat"><span>${ic('percent')}Konversi</span><strong data-num="${conv}" data-key="c" data-fmt="pct">${conv}%</strong></div>
      <div class="stat"><span>${ic('cash')}Rata-rata deal</span><strong data-num="${avg}" data-key="a" data-fmt="jt">${short(avg)}</strong></div>`;
    countUp($('kpis'), nums);
  }

  function renderFunnel() {
    const box = $('funnel');
    if (!box.children.length) box.innerHTML = STAGES.map((s) => `<div class="fseg t-${s.tone}" data-s="${s.id}" style="flex-grow:0"><span></span><b></b></div>`).join('');
    requestAnimationFrame(() => STAGES.forEach((s) => {
      const v = leads.filter((l) => l.stage === s.id).reduce((a, l) => a + l.value, 0);
      const seg = box.querySelector<HTMLElement>(`[data-s="${s.id}"]`)!;
      seg.style.flexGrow = String(Math.max(v, 1));
      seg.querySelector('span')!.textContent = s.name;
      seg.querySelector('b')!.textContent = short(v);
    }));
  }

  function renderBoard() {
    const q = st.q.toLowerCase().trim();
    const vis = leads.filter((l) => !q || `${l.name} ${l.org} ${l.need}`.toLowerCase().includes(q));
    $('board').innerHTML = STAGES.map((s) => {
      const items = vis.filter((l) => l.stage === s.id), sum = items.reduce((a, l) => a + l.value, 0);
      return `<section class="kcol t-${s.tone}" data-stage="${s.id}" aria-label="${s.name}">
        <header><i class="kdot"></i><strong>${s.name}</strong><span class="kcount">${items.length}</span><span class="ksum">${short(sum)}</span></header>
        <div class="klist">${items.map((l) => `
          <article class="lcard${l.fresh ? ' fresh' : ''}" data-a="lead" data-v="${l.id}" tabindex="0" role="button" aria-label="${esc(l.name)}, ${esc(l.need)}, ${short(l.value)}">
            <div class="lc-top"><span class="ltag">${l.tag}</span><span class="lch" title="${l.ch}">${ic(CH[l.ch])}</span></div>
            <strong>${esc(l.name)}</strong>
            <span class="lc-need">${esc(l.need)} · ${l.pax} ${l.pax < 10 ? 'buah' : 'porsi'}</span>
            <div class="lc-foot"><span class="due${l.due <= 7 && l.stage !== 'deal' ? ' soon' : ''}">${ic('clock')}${l.date}</span><span class="lc-av t-${s.tone}">${ini(l.name)}</span><b>${short(l.value)}</b></div>
          </article>`).join('') || `<div class="kempty">${q ? 'Tidak ada yang cocok' : 'Tarik kartu ke sini'}</div>`}</div>
      </section>`;
    }).join('');
    leads.forEach((l) => (l.fresh = false));
  }

  function waHtml(l: Lead) {
    const tpl = st.tpl || DEF_TPL[l.stage];
    return `<div class="wa-h"><span class="lbl">Template WhatsApp</span><div class="tpls" role="radiogroup" aria-label="Template">${TPL.map((x) => `<button type="button" role="radio" aria-checked="${x.id === tpl}" data-a="tpl" data-v="${x.id}">${x.name}</button>`).join('')}</div></div>
      <div class="wa-chat"><span class="wa-day">Hari ini</span>
        ${st.typing ? '<div class="bubble typing" aria-label="Menyusun pesan"><i></i><i></i><i></i></div>'
          : `<div class="bubble"><span data-r="msg">${esc(fill(tpl, l))}</span><span class="wa-meta">${clock()} <span class="ticks">✓✓</span></span></div>`}
      </div>
      <div class="wa-actions"><button type="button" class="btn btn-ghost" data-a="copy">${ic('copy')}Salin</button><button type="button" class="btn btn-wa" data-a="send">${ic('send')}Tandai terkirim</button></div>`;
  }

  function drawerHtml(l: Lead) {
    const idx = STAGES.findIndex((s) => s.id === l.stage), s = stage(l.stage);
    return `<div class="dr-head"><span class="av lg t-${s.tone}">${ini(l.name)}</span><div><strong>${esc(l.name)}</strong><span>${esc(l.org)}</span></div><button type="button" class="icon-btn" data-a="close" aria-label="Tutup">${ic('x')}</button></div>
      <ol class="steps4">${STAGES.map((x, i) => `<li class="${i <= idx ? 'done' : ''}${i === idx ? ' cur' : ''}"><button type="button" data-a="setstage" data-v="${x.id}">${x.name}</button></li>`).join('')}</ol>
      <dl class="dr-info">
        <div><dt>Kebutuhan</dt><dd>${esc(l.need)}</dd></div><div><dt>Jumlah</dt><dd>${l.pax} ${l.pax < 10 ? 'buah' : 'porsi'}</dd></div>
        <div><dt>Tanggal acara</dt><dd>${l.date} · ${l.due} hari lagi</dd></div><div><dt>Nilai</dt><dd>${rp(l.value)}</dd></div>
        <div><dt>Kanal</dt><dd>${l.ch}</dd></div><div><dt>Kontak terakhir</dt><dd>${l.last}</dd></div>
      </dl>
      <div class="wa" data-r="wa">${waHtml(l)}</div>
      <div class="dr-log"><span class="lbl">Aktivitas</span><ol>${l.log.map((x, i) => `<li class="${i === 0 && l.fresh ? 'fresh' : ''}"><span>${x.t}</span>${esc(x.text)}</li>`).join('')}</ol></div>
      <div class="dr-foot">${idx < 3
        ? `<button type="button" class="btn btn-pri btn-lg wide" data-a="advance">Pindah ke ${STAGES[idx + 1].name}${ic('chevR')}</button>`
        : `<div class="won">${ic('check')}Deal tercatat · ${rp(l.value)}</div>`}</div>`;
  }

  function move(l: Lead, to: Stage, anchor: Element | null) {
    if (l.stage === to) return;
    l.stage = to; l.last = 'Baru saja'; l.fresh = true;
    l.log.unshift({ t: clock(), text: `Status diubah ke ${stage(to).name}` });
    st.tpl = '';
    renderKpis(); renderFunnel(); renderBoard();
    if (to === 'deal') { confetti(anchor); toast(el, `Deal! ${l.name} senilai ${short(l.value)}`, 'sparkle'); }
    else toast(el, `${l.name} dipindah ke ${stage(to).name}`, 'kanban');
  }

  const refreshDrawer = () => { const l = lead(st.open); if (l) updateSheet(el, drawerHtml(l)); };

  function addHtml() {
    return `<div class="sh-head"><div><span class="eyebrow-s">Calon pelanggan baru</span><strong class="sh-title">Tambah ke pipeline</strong></div><button type="button" class="icon-btn" data-a="close" aria-label="Tutup">${ic('x')}</button></div>
      <label class="fld"><span class="lbl">Nama</span><input data-in="an" type="text" placeholder="mis. Bu Rina" autocomplete="off" /></label>
      <label class="fld"><span class="lbl">Acara</span><input data-in="ae" type="text" placeholder="mis. Nasi box arisan" autocomplete="off" /></label>
      <label class="fld"><span class="lbl">Jumlah porsi</span><input data-in="ap" type="number" inputmode="numeric" min="1" placeholder="mis. 50" /></label>
      <p class="sub">Nilai dihitung otomatis dengan Paket Nusantara Rp30.000 per porsi.</p>
      <button type="button" class="btn btn-pri btn-lg wide" data-a="create">${ic('plus')}Simpan ke kolom Baru</button>`;
  }

  delegate(el, (a, v, tg) => {
    if (st.suppress) { st.suppress = false; return; }
    if (a === 'close') { closeSheet(el); st.open = ''; return; }
    if (a === 'bell') return toast(el, 'Bu Sari membalas pesan Anda', 'message');
    if (a === 'lead') { st.open = v; st.tpl = ''; st.typing = false; openSheet(el, drawerHtml(lead(v)!), 'drawer'); }
    if (a === 'setstage' || a === 'advance') {
      const l = lead(st.open)!, idx = STAGES.findIndex((s) => s.id === l.stage);
      move(l, (a === 'advance' ? STAGES[idx + 1].id : v) as Stage, tg);
      refreshDrawer();
    }
    if (a === 'tpl') {
      st.tpl = v; st.typing = true;
      const l = lead(st.open)!;
      $('wa').innerHTML = waHtml(l);
      setTimeout(() => { st.typing = false; const w = el.querySelector<HTMLElement>('[data-r="wa"]'); if (w && st.open === l.id) w.innerHTML = waHtml(l); }, 650);
    }
    if (a === 'copy') {
      const text = el.querySelector('[data-r="msg"]')?.textContent ?? '';
      navigator.clipboard?.writeText(text).catch(() => {});
      toast(el, 'Pesan disalin, tinggal tempel di WhatsApp', 'copy');
    }
    if (a === 'send') {
      const l = lead(st.open)!, name = TPL.find((x) => x.id === (st.tpl || DEF_TPL[l.stage]))!.name;
      l.log.unshift({ t: clock(), text: `Pesan “${name}” dikirim lewat WhatsApp` });
      l.last = 'Baru saja'; l.fresh = true;
      refreshDrawer(); l.fresh = false;
      toast(el, 'Aktivitas tercatat', 'send');
    }
    if (a === 'add') openSheet(el, addHtml());
    if (a === 'create') {
      const val = (k: string) => el.querySelector<HTMLInputElement>(`[data-in="${k}"]`)?.value.trim() ?? '';
      const name = val('an'), need = val('ae') || 'Nasi box', pax = Number(val('ap'));
      if (!name) { el.querySelector<HTMLInputElement>('[data-in="an"]')?.focus(); return toast(el, 'Nama belum diisi', 'user'); }
      if (!(pax > 0)) { el.querySelector<HTMLInputElement>('[data-in="ap"]')?.focus(); return toast(el, 'Jumlah porsi belum diisi', 'user'); }
      leads.unshift({ ...L(`n${Date.now()}`, name, 'Kontak baru', need, pax, '20 Des', 26, 30000, 'WhatsApp', 'baru', 'Baru saja', 'Baru', [`${clock()}|Ditambahkan ke pipeline`]), fresh: true });
      closeSheet(el); renderKpis(); renderFunnel(); renderBoard();
      toast(el, `${name} masuk ke kolom Baru`, 'plus');
    }
  });
  el.addEventListener('input', (e) => { const i = e.target as HTMLInputElement; if (i.dataset.in === 'q') { st.q = i.value; renderBoard(); } });
  el.addEventListener('keydown', (e) => {
    const c = (e.target as HTMLElement).closest<HTMLElement>('.lcard');
    if (c && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); c.click(); }
  });

  // Seret kartu antarkolom dengan mouse atau pena. Di layar sentuh, status diubah lewat detail.
  const board = $('board');
  board.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'touch' || e.button !== 0) return;
    const c = (e.target as HTMLElement).closest<HTMLElement>('.lcard');
    if (!c) return;
    st.drag = { id: c.dataset.v!, x: e.clientX, y: e.clientY };
  });
  board.addEventListener('dragstart', (e) => e.preventDefault());
  window.addEventListener('pointermove', (e) => {
    const d = st.drag;
    if (!d) return;
    if (!d.ghost) {
      if (Math.hypot(e.clientX - d.x, e.clientY - d.y) < 6) return;
      try { board.setPointerCapture(e.pointerId); } catch { /* pointer sudah lepas */ }
      const card = board.querySelector<HTMLElement>(`.lcard[data-v="${d.id}"]`)!, r = card.getBoundingClientRect();
      d.ghost = card.cloneNode(true) as HTMLElement;
      d.ghost.classList.add('drag-ghost');
      Object.assign(d.ghost.style, { left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px` });
      el.closest('.demo')!.append(d.ghost);
      card.classList.add('placeholder');
      d.x = e.clientX - r.left; d.y = e.clientY - r.top;
      document.documentElement.classList.add('dragging');
    }
    d.ghost.style.transform = `translate(${e.clientX - d.x - parseFloat(d.ghost.style.left)}px, ${e.clientY - d.y - parseFloat(d.ghost.style.top)}px) rotate(3deg)`;
    const col = document.elementFromPoint(e.clientX, e.clientY)?.closest<HTMLElement>('.kcol') ?? null;
    if (col !== d.over) { d.over?.classList.remove('over'); col?.classList.add('over'); d.over = col; }
  });
  const drop = (e: PointerEvent) => {
    const d = st.drag;
    st.drag = null;
    if (!d?.ghost) return;
    d.over?.classList.remove('over');
    d.over = e.type === 'pointercancel' ? null : document.elementFromPoint(e.clientX, e.clientY)?.closest<HTMLElement>('.kcol') ?? null;
    st.suppress = true;
    setTimeout(() => (st.suppress = false), 0);
    document.documentElement.classList.remove('dragging');
    d.over?.classList.remove('over');
    const l = lead(d.id)!, to = d.over?.dataset.stage as Stage | undefined;
    const ghost = d.ghost;
    if (to && to !== l.stage) { ghost.remove(); move(l, to, d.over!.querySelector('header')); }
    else {
      const card = board.querySelector<HTMLElement>(`.lcard[data-v="${d.id}"]`);
      const r = card?.getBoundingClientRect();
      const anim = r ? ghost.animate([{ transform: ghost.style.transform }, { transform: `translate(${r.left - parseFloat(ghost.style.left)}px, ${r.top - parseFloat(ghost.style.top)}px) rotate(0)` }], { duration: 220, easing: 'ease-out' }) : null;
      (anim?.finished ?? Promise.resolve()).then(() => { ghost.remove(); card?.classList.remove('placeholder'); });
    }
  };
  window.addEventListener('pointerup', drop);
  window.addEventListener('pointercancel', drop);

  renderKpis(); renderFunnel(); renderBoard();
  return { show() { nums.clear(); renderKpis(); $('funnel').innerHTML = ''; renderFunnel(); } };
}
