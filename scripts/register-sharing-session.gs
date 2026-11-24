// Apps Script untuk Sheet "Pendaftar Vibe Coding for Founders 26 Nov 2026".
// Deploy: Extensions → Apps Script → tempel file ini → Deploy → New deployment →
// Web app, Execute as: Me, Who has access: Anyone. URL /exec-nya dipakai di
// src/pages/register-sharing-session.astro (const endpoint).

const FIELDS = ['nama', 'pekerjaan', 'bidang', 'instansi', 'threads', 'wa', 'pengalaman', 'kendala', 'ai', 'belajar'];

function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents);
    const v = (k) => String(d[k] ?? '').trim().slice(0, 1000);
    if (!v('nama') || !v('pekerjaan') || !v('bidang') || !v('instansi') || !v('pengalaman') || !v('ai') || !v('belajar') || (!v('threads') && !v('wa'))) {
      return json({ ok: false, error: 'missing' });
    }
    if ((v('threads') && !/^@[a-zA-Z0-9._]{1,30}$/.test(v('threads'))) || (v('wa') && !/^(\+62|62|0)8\d{7,12}$/.test(v('wa')))) {
      return json({ ok: false, error: 'contact' });
    }
    // Awalan ' supaya nomor WA (0812...) dan isian lain tetap teks, tidak diubah jadi angka/rumus.
    const row = [new Date()].concat(FIELDS.map((k) => (v(k) ? "'" + v(k) : '')));
    SpreadsheetApp.getActiveSpreadsheet().getSheets()[0].appendRow(row);
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
