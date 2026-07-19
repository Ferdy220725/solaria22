"use server";

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // pakai service role, bukan anon key
);

/**
 * Mengirim pesan ke grup Telegram kelas tertentu, berdasarkan kelas_id.
 * Wajib dipanggil dari server (server action / route handler).
 */
export async function sendTelegramNotification(kelasId: string, message: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    console.error("[Telegram] TELEGRAM_BOT_TOKEN belum diset di env.");
    return { ok: false, error: "Konfigurasi Telegram tidak lengkap" };
  }

  // Ambil chat_id sesuai kelas
  const { data: kelas, error: kelasError } = await supabase
    .from("kelas")
    .select("telegram_chat_id, nama")
    .eq("id", kelasId)
    .single();

  if (kelasError || !kelas?.telegram_chat_id) {
    console.error("[Telegram] Kelas belum punya telegram_chat_id:", kelasId, kelasError);
    return { ok: false, error: "Kelas ini belum terhubung ke grup Telegram" };
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: kelas.telegram_chat_id,
        text: message,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });

    const data = await res.json();

    if (!data.ok) {
      console.error("[Telegram] API error:", data);
      return { ok: false, error: data.description || "Gagal mengirim pesan" };
    }

    return { ok: true, data };
  } catch (err: any) {
    console.error("[Telegram] Fetch error:", err);
    return { ok: false, error: err.message };
  }
}