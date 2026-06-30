import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ── Supabase client ────────────────────────────────────────────────────────
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ── Helper: kirim balik pesan ke Telegram ──────────────────────────────────
async function replyTelegram(chatId: number | string, text: string) {
  await fetch(
    `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    }
  );
}

// ── Helper: format tanggal ke WIB ─────────────────────────────────────────
function formatWIB(dateString: string) {
  if (!dateString) return "-";
  try {
    return new Date(dateString).toLocaleString("id-ID", {
      timeZone: "Asia/Jakarta",
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch { return dateString; }
}

// ── Command Handlers ──────────────────────────────────────────────────────

async function handleHelp(chatId: number | string) {
  const text =
    `🤖 <b>Bot Akademik — Daftar Command</b>\n\n` +
    `/jadwal — Jadwal Zoom aktif\n` +
    `/materi — 10 materi terbaru\n` +
    `/materi [kata kunci] — Cari materi (mk/judul)\n` +
    `/tugas — Semua tugas aktif (kuliah + praktikum)\n` +
    `/tugaskuliah — Tugas perkuliahan saja\n` +
    `/tugasprak — Tugas praktikum saja\n` +
    `/absen — Status sistem absensi\n` +
    `/help — Tampilkan pesan ini`;
  await replyTelegram(chatId, text);
}

async function handleJadwal(chatId: number | string) {
  const now = new Date().toISOString();
  const { data, error } = await supabase.from("zoom_meetings").select("*").eq("is_active", true).gte("waktu_selesai", now).order("waktu_mulai", { ascending: true });

  if (error || !data || data.length === 0) { await replyTelegram(chatId, "📭 Tidak ada jadwal Zoom aktif saat ini."); return; }

  let text = `🎥 <b>JADWAL ZOOM AKTIF</b>\n\n`;
  data.forEach((z, i) => {
    text += `${i + 1}. <b>${z.judul}</b>\n 🕐 Mulai  : ${formatWIB(z.waktu_mulai)}\n 🕔 Selesai: ${formatWIB(z.waktu_selesai)}\n 🔗 <a href="${z.link}">Klik untuk Join</a>\n\n`;
  });
  await replyTelegram(chatId, text);
}

async function handleTugasKuliah(chatId: number | string) {
  const { data, error } = await supabase.from("tugas_perkuliahan").select("*").order("deadline", { ascending: true });
  if (error || !data || data.length === 0) { await replyTelegram(chatId, "📭 Tidak ada tugas perkuliahan aktif."); return; }

  let text = `📚 <b>TUGAS PERKULIAHAN</b>\n\n`;
  data.forEach((t, i) => {
    text += `${i + 1}. [${t.mk_nama || "-"}] <b>${t.judul_tugas}</b>\n ⏰ Deadline: ${formatWIB(t.deadline)}\n`;
    if (t.deskripsi) text += ` 📝 ${t.deskripsi}\n`;
    if (t.link_pengumpulan) text += ` 🔗 <a href="${t.link_pengumpulan}">Link Pengumpulan</a>\n\n`;
  });
  await replyTelegram(chatId, text);
}

async function handleTugasPrak(chatId: number | string) {
  const { data, error } = await supabase.from("tugas_praktikum").select("*").order("deadline", { ascending: true });
  if (error || !data) { await replyTelegram(chatId, "❌ Gagal mengambil data."); return; }

  const now = new Date();
  const aktif = data.filter((t) => {
    const batasHapus = new Date(t.deadline);
    batasHapus.setDate(batasHapus.getDate() + 3);
    return now <= batasHapus;
  });

  if (aktif.length === 0) { await replyTelegram(chatId, "📭 Tidak ada tugas praktikum aktif."); return; }

  let text = `🧪 <b>TUGAS PRAKTIKUM</b>\n\n`;
  aktif.forEach((t, i) => {
    text += `${i + 1}. [${t.mk_nama} - Gol ${t.golongan}] <b>${t.judul_tugas}</b>\n ⏰ Deadline: ${formatWIB(t.deadline)}\n`;
    if (t.deskripsi) text += ` 📝 ${t.deskripsi}\n`;
    if (t.link_pengumpulan) text += ` 🔗 <a href="${t.link_pengumpulan}">Link Pengumpulan</a>\n\n`;
  });
  await replyTelegram(chatId, text);
}

async function handleTugas(chatId: number | string) {
  await handleTugasKuliah(chatId);
  await handleTugasPrak(chatId);
}

async function handleAbsen(chatId: number | string) {
  const { data, error } = await supabase.from("status_sistem").select("*").eq("id", "absensi").maybeSingle();
  if (error || !data) { await replyTelegram(chatId, "❌ Gagal mengambil status."); return; }
  const status = data.is_active ? "🟢 DIBUKA" : "🔴 DITUTUP";
  const kode = data.is_active ? `\n🔑 Kode Akses: <code>${data.kode_akses || "-"}</code>` : "";
  await replyTelegram(chatId, `🚪 <b>STATUS ABSENSI</b>\n\nStatus: <b>${status}</b>${kode}`);
}

async function handleMateri(chatId: number | string, keyword: string) {
  let query = supabase.from("materi").select("*").order("created_at", { ascending: false });
  if (keyword) { query = query.or(`judul.ilike.%${keyword}%,mk_nama.ilike.%${keyword}%`); } else { query = query.limit(10); }

  const { data, error } = await query;
  if (error) { await replyTelegram(chatId, "❌ Gagal mengambil materi."); return; }
  if (!data || data.length === 0) {
    await replyTelegram(chatId, keyword ? `📭 Materi "<b>${keyword}</b>" tidak ditemukan.` : "📭 Belum ada materi.");
    return;
  }

  let text = keyword ? `📂 <b>HASIL PENCARIAN: "${keyword}"</b>\n\n` : `📂 <b>MATERI TERBARU</b>\n\n`;
  data.forEach((m, i) => { text += `${i + 1}. [${m.mk_nama}] <b>${m.judul}</b>\n 🔗 <a href="${m.file_url}">Buka Materi</a>\n\n`; });
  await replyTelegram(chatId, text);
}

// ── Main POST Handler ──────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = body?.message;
    if (!message) return NextResponse.json({ ok: true });

    const chatId = message.chat?.id;
    const text: string = message.text || "";

    const parts = text.split(" ");
    const command = parts[0].split("@")[0].trim().toLowerCase();
    const args = parts.slice(1).join(" ").trim();

    switch (command) {
      case "/start":
      case "/help":
        await handleHelp(chatId);
        break;
      case "/jadwal":
        await handleJadwal(chatId);
        break;
      case "/tugas":
        await handleTugas(chatId);
        break;
      case "/tugaskuliah":
        await handleTugasKuliah(chatId);
        break;
      case "/tugasprak":
        await handleTugasPrak(chatId);
        break;
      case "/absen":
        await handleAbsen(chatId);
        break;
      case "/materi":
        await handleMateri(chatId, args);
        break;
      // TAMBAHKAN INI AGAR /materi_cari merespons
      case "/materi_cari":
        await replyTelegram(chatId, "💡 Tips: Ketik /materi [kata kunci] untuk mencari materi.");
        break;
      default:
        break;
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[Webhook] Error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function GET() { return NextResponse.json({ status: "Webhook aktif ✅" }); }