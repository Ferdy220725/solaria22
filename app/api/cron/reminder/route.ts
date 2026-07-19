// app/api/cron/reminder/route.ts
// Dipanggil oleh scheduler eksternal (cron-job.org) 09:00 & 12:00 WIB.
// Mengirim pengingat H-1 (deadline besok) dan H-0 (deadline hari ini),
// per kelas, lewat Telegram dan Web Push (langsung ke browser/HP).

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT as string,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string,
  process.env.VAPID_PRIVATE_KEY as string
);

async function sendTelegram(chatId: string, text: string) {
  const res = await fetch(
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
  const data = await res.json().catch(() => null);
  if (!data?.ok) console.error(`[Cron Reminder] Gagal kirim Telegram ke ${chatId}:`, data);
  return data?.ok === true;
}

async function sendPushToKelas(kelasId: string, title: string, body: string) {
  const { data: subs } = await supabase
    .from("push_subscriptions")
    .select("*")
    .eq("kelas_id", kelasId);

  if (!subs || subs.length === 0) return 0;

  const payload = JSON.stringify({ title, body, url: "/dashboard#tugas-section" });
  let terkirim = 0;

  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(sub.subscription, payload);
        terkirim++;
      } catch (err: any) {
        // Subscription sudah tidak valid (browser di-uninstall/ditolak dsb) -> bersihkan
        if (err.statusCode === 410 || err.statusCode === 404) {
          await supabase.from("push_subscriptions").delete().eq("id", sub.id);
        } else {
          console.error(`[Cron Reminder] Gagal kirim push ke subscription ${sub.id}:`, err.message);
        }
      }
    })
  );

  return terkirim;
}

function formatWIB(dateString: string) {
  if (!dateString) return "-";
  try {
    return new Date(dateString).toLocaleString("id-ID", {
      timeZone: "Asia/Jakarta",
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return dateString;
  }
}

function tanggalWIB(date: Date) {
  return date.toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
}

function isDeadlineTomorrow(dateString: string) {
  if (!dateString) return false;
  const deadline = new Date(dateString);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tanggalWIB(deadline) === tanggalWIB(tomorrow);
}

function isDeadlineToday(dateString: string) {
  if (!dateString) return false;
  const deadline = new Date(dateString);
  return tanggalWIB(deadline) === tanggalWIB(new Date());
}

function buildTelegramMessage(namaKelas: string, label: string, kuliah: any[], prak: any[]) {
  let text = `⏰ <b>PENGINGAT DEADLINE ${label}</b>\n🏫 Kelas: <b>${namaKelas}</b>\n\n`;

  if (kuliah.length > 0) {
    text += `📚 <b>Tugas Perkuliahan</b>\n`;
    kuliah.forEach((t, i) => {
      text += `${i + 1}. [${t.mk_nama || "-"}] <b>${t.judul_tugas}</b>\n   ⏰ Deadline: ${formatWIB(t.deadline)}\n`;
      if (t.link_pengumpulan) text += `   🔗 <a href="${t.link_pengumpulan}">Link Pengumpulan</a>\n`;
      text += "\n";
    });
  }

  if (prak.length > 0) {
    text += `🧪 <b>Tugas Praktikum</b>\n`;
    prak.forEach((t, i) => {
      text += `${i + 1}. [${t.mk_nama || "-"} - Gol ${t.golongan || "-"}] <b>${t.judul_tugas}</b>\n   ⏰ Deadline: ${formatWIB(t.deadline)}\n`;
      if (t.link_pengumpulan) text += `   🔗 <a href="${t.link_pengumpulan}">Link Pengumpulan</a>\n`;
      text += "\n";
    });
  }

  text += `🙏 Jangan sampai telat ya, segera dikerjakan!`;
  return text;
}

function buildPushBody(kuliah: any[], prak: any[]) {
  const judulList = [...kuliah, ...prak].map((t) => t.judul_tugas);
  if (judulList.length === 1) return judulList[0];
  return `${judulList[0]}, dan ${judulList.length - 1} tugas lainnya. Cek Zora sekarang!`;
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { data: kelasList, error: kelasError } = await supabase
      .from("kelas")
      .select("id, nama, kode, telegram_chat_id");

    if (kelasError) throw kelasError;

    const hasil: any[] = [];

    for (const kelas of kelasList || []) {
      const { data: tugasKuliah } = await supabase
        .from("tugas_perkuliahan")
        .select("*")
        .eq("kelas_id", kelas.id)
        .order("deadline", { ascending: true });

      const { data: tugasPrak } = await supabase
        .from("tugas_praktikum")
        .select("*")
        .eq("kelas_id", kelas.id)
        .order("deadline", { ascending: true });

      const kuliahBesok = (tugasKuliah || []).filter((t) => isDeadlineTomorrow(t.deadline));
      const prakBesok = (tugasPrak || []).filter((t) => isDeadlineTomorrow(t.deadline));
      const kuliahHariIni = (tugasKuliah || []).filter((t) => isDeadlineToday(t.deadline));
      const prakHariIni = (tugasPrak || []).filter((t) => isDeadlineToday(t.deadline));

      const ringkasan: any = { kelas: kelas.nama, h1: 0, h0: 0, telegram: false, push: 0 };

      // --- H-1: deadline besok ---
      if (kuliahBesok.length > 0 || prakBesok.length > 0) {
        ringkasan.h1 = kuliahBesok.length + prakBesok.length;

        if (kelas.telegram_chat_id) {
          const text = buildTelegramMessage(kelas.nama, "BESOK", kuliahBesok, prakBesok);
          ringkasan.telegram = await sendTelegram(kelas.telegram_chat_id, text);
        }

        const terkirim = await sendPushToKelas(
          kelas.id,
          "📚 Tugas Deadline BESOK",
          buildPushBody(kuliahBesok, prakBesok)
        );
        ringkasan.push += terkirim;
      }

      // --- H-0: deadline hari ini ---
      if (kuliahHariIni.length > 0 || prakHariIni.length > 0) {
        ringkasan.h0 = kuliahHariIni.length + prakHariIni.length;

        if (kelas.telegram_chat_id) {
          const text = buildTelegramMessage(kelas.nama, "HARI INI", kuliahHariIni, prakHariIni);
          await sendTelegram(kelas.telegram_chat_id, text);
        }

        const terkirim = await sendPushToKelas(
          kelas.id,
          "⏰ Tugas Deadline HARI INI",
          buildPushBody(kuliahHariIni, prakHariIni)
        );
        ringkasan.push += terkirim;
      }

      hasil.push(ringkasan);
    }

    return NextResponse.json({ ok: true, kelas_diproses: hasil.length, detail: hasil });
  } catch (err) {
    console.error("[Cron Reminder] Error:", err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}