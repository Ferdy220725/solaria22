import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import * as cheerio from 'cheerio';
import axios from 'axios';

// 1. Inisialisasi Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!; 
const supabase = createClient(supabaseUrl, supabaseKey);

// 2. Token Telegram Bot (Sesuai .env.local kamu)
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

async function handleSiamik(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    console.log("Menengok website SIAMIK UPN Jatim...");

    // 3. Ambil data HTML asli dari SIAMIK
    const { data } = await axios.get('https://siamik.upnjatim.ac.id/html/siamik/index.asp');
    const $ = cheerio.load(data);

    const container = $('.media-body.text-xs-left');
    if (container.length === 0) {
      return NextResponse.json({ message: 'Gagal membaca kontainer pengumuman.' });
    }

    // Ambil baris teks bersih
    const lines = container.text().split('\n').map(l => l.trim()).filter(Boolean);
    
    let jumlahPesanTerkirim = 0;

    // Loop menyusir teks untuk mencari baris "Publish,"
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.startsWith('Publish,')) {
        // Baris sebelum "Publish," otomatis adalah Judul Pengumuman
        const judulTerbaru = lines[i - 1];
        const tanggalPublish = line;

        // Validasi: Pastikan judulnya valid dan bukan teks navigasi web
        if (!judulTerbaru || judulTerbaru.toLowerCase().includes('siamik') || judulTerbaru.toLowerCase().startsWith('more') || judulTerbaru.toLowerCase().startsWith('next') || judulTerbaru.length < 5) {
          continue;
        }

        // 4. Cek ke tabel siamik_logs Supabase apakah judul ini sudah pernah dicatat
        const { data: logSiamik, error: dbError } = await supabase
          .from('siamik_logs')
          .select('judul_terakhir')
          .eq('judul_terakhir', judulTerbaru)
          .maybeSingle();

        if (dbError) throw dbError;

        // 5. Jika BELUM ada di Supabase, kirim notifikasi ringkas ke Telegram!
        if (!logSiamik) {
          console.log("🚨 Menemukan info baru:", judulTerbaru);

          // Tampilan ringkas, padat, dan estetik pesananmu
          const pesanTelegram = `📢 <b>INFO BARU SIAMIK UPN JATIM</b> \n\n📌 <b>Judul:</b> ${judulTerbaru}\n📅 <b>${tanggalPublish}</b>\n\n🌐 <i>Silakan cek detail lengkapnya di:</i>\nhttps://siamik.upnjatim.ac.id/`;

          try {
            await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
              chat_id: TELEGRAM_CHAT_ID,
              text: pesanTelegram,
              parse_mode: 'HTML',
              disable_web_page_preview: true // Biar gak muncul preview link raksasa di Telegram
            });
            jumlahPesanTerkirim++;
          } catch (tgError: any) {
            const detailEror = tgError.response?.data ? JSON.stringify(tgError.response.data) : tgError.message;
            console.error(`Gagal mengirim ke Telegram: ${detailEror}`);
            continue; 
          }

          // Catat ke database Supabase
          const { error: insertError } = await supabase
            .from('siamik_logs')
            .insert([{ judul_terakhir: judulTerbaru }]);
          
          if (insertError) throw insertError;
        }
      }
    }

    if (jumlahPesanTerkirim > 0) {
      return NextResponse.json({ message: `Sukses! Berhasil mengirim ${jumlahPesanTerkirim} notifikasi pengumuman baru.` });
    }

    return NextResponse.json({ message: 'Aman, tidak ada pengumuman baru dari SIAMIK.' });

  } catch (error: any) {
    console.error('Error Keseluruhan Cron SIAMIK:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export { handleSiamik as GET, handleSiamik as POST };