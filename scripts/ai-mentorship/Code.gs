// Apps Script untuk Sheet "Pendaftar AI Mentorship".
// Dikelola dengan clasp dari folder ini (scriptId di .clasp.json):
//   npx @google/clasp push && npx @google/clasp deploy -i AKfycbwtUmuF9QEofkTUns5DS0U_bTJ5fwQ3vS2YIFKkewZVepx-cFtjZ465VOobaTHJiAC1
// Pakai deployment ID yang sama supaya URL /exec di src/pages/ai-mentorship.astro tidak berubah.

// Folder Drive bukti transfer dibuat otomatis saat pendaftaran pertama, ID-nya disimpan di Script Properties.
function folder() {
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty('FOLDER_ID');
  if (id) return DriveApp.getFolderById(id);
  const f = DriveApp.createFolder('Bukti transfer AI Mentorship');
  props.setProperty('FOLDER_ID', f.getId());
  return f;
}

// Harus sama dengan `tracks` di src/pages/ai-mentorship.astro.
// close: pendaftaran ditutup mulai tanggal ini 00.00 WIB (H-1 pertemuan pertama masih buka).
const TRACKS = {
  finance: { free: 2, paid: 4, close: '2026-12-02' },
  marketing: { free: 2, paid: 4, close: '2026-12-01' },
  hr: { free: 2, paid: 4, close: '2026-12-03' },
  management: { free: 0, paid: 6, close: '2026-11-30' },
};

const HEADER = ['waktu', 'track', 'jalur', 'status', 'nama', 'wa', 'jabatan', 'perusahaan', 'yoe', 'pengalaman', 'ai', 'rutin', 'rekening refund', 'bukti'];
const FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf'];
const MAX_BYTES = 5 * 1024 * 1024;

function sheet() {
  const s = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  if (s.getLastRow() === 0) s.appendRow(HEADER);
  return s;
}

// Kursi berbayar terpakai per track: baris jalur berbayar dengan status terdaftar.
function paidCounts(s) {
  const counts = Object.fromEntries(Object.keys(TRACKS).map((k) => [k, 0]));
  s.getDataRange().getValues().slice(1).forEach((r) => {
    if (r[2] === 'berbayar' && r[3] === 'terdaftar' && r[1] in counts) counts[r[1]]++;
  });
  return counts;
}

function doGet() {
  return json({ ok: true, paid: paidCounts(sheet()) });
}

function doPost(e) {
  // Kunci supaya dua pendaftar terakhir tidak sama-sama dapat kursi yang tinggal satu.
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const d = JSON.parse(e.postData.contents);
    const v = (k) => String(d[k] ?? '').trim().slice(0, 1000);
    const t = TRACKS[v('track')];
    const jalur = v('jalur');
    if (!t || !['free', 'berbayar'].includes(jalur)) return json({ ok: false, error: 'track' });
    if (jalur === 'free' && !t.free) return json({ ok: false, error: 'track' });
    if (new Date() >= new Date(t.close + 'T00:00:00+07:00')) return json({ ok: false, error: 'closed' });
    if (!v('nama') || !v('jabatan') || !v('perusahaan') || !v('yoe') || !v('pengalaman') || !v('ai') || !v('rutin')) {
      return json({ ok: false, error: 'missing' });
    }
    if (!/^(\+62|62|0)8\d{7,12}$/.test(v('wa'))) return json({ ok: false, error: 'contact' });
    if (jalur === 'free' && !v('rekening')) return json({ ok: false, error: 'rekening' });

    const f = d.bukti || {};
    const bytes = f.data ? Utilities.base64Decode(String(f.data)) : [];
    if (!bytes.length || bytes.length > MAX_BYTES || !FILE_TYPES.includes(f.type)) return json({ ok: false, error: 'bukti' });

    const s = sheet();
    let status = 'seleksi';
    if (jalur === 'berbayar') status = paidCounts(s)[v('track')] < t.paid ? 'terdaftar' : 'waiting list';

    const name = [v('track'), jalur, v('nama'), Date.now()].join('_').replace(/[^\w.-]+/g, '-') + '_' + String(f.name || 'bukti').slice(-60);
    const file = folder().createFile(Utilities.newBlob(bytes, f.type, name));

    // Awalan ' supaya nomor WA (0812...) dan isian lain tetap teks, tidak diubah jadi angka/rumus.
    const text = (k) => (v(k) ? "'" + v(k) : '');
    s.appendRow([new Date(), v('track'), jalur, status, text('nama'), text('wa'), text('jabatan'), text('perusahaan'), text('yoe'), text('pengalaman'), text('ai'), text('rutin'), text('rekening'), file.getUrl()]);
    return json({ ok: true, status });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
