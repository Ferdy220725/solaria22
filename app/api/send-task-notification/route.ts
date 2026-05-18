import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';

// 1. Inisialisasi Kunci VAPID untuk Web Push
const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;

if (publicKey && privateKey) {
  try {
    webpush.setVapidDetails('mailto:agrotek@zora.com', publicKey, privateKey);
  } catch (error) {
    console.error('Gagal inisialisasi VAPID:', error);
  }
}

// 2. Hubungkan ke Supabase menggunakan SERVICE_ROLE_KEY (Bukan Anon Key)
// Ini penting supaya API bisa membaca tabel zora_notifications tanpa terhalang RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(request: Request) {
  try {
    if (!publicKey || !privateKey) {
      return NextResponse.json({ error: 'VAPID Key tidak ditemukan di env Vercel.' }, { status: 500 });
    }

    // Mengambil data tugas/jadwal yang baru saja diinput oleh Admin
    const body = await request.json().catch(() => ({}));
    
    // Antispasasi jika dipicu lewat Webhook Supabase (body.record) atau fetch biasa (body)
    const recordData = body.record || body;
    const nama_tugas = recordData.nama_tugas || "Ada Tugas Baru!";
    const deadline = recordData.deadline || "Cek aplikasi sekarang";

    // 3. Ambil semua token browser mahasiswa dari tabel kamu
    const { data: users, error: supabaseError } = await supabase
      .from('zora_notifications') // 👈 Memastikan mengambil dari tabel ini
      .select('subscription_json');

    if (supabaseError) {
      console.error('Gagal mengambil token:', supabaseError.message);
      return NextResponse.json({ error: supabaseError.message }, { status: 500 });
    }

    if (!users || users.length === 0) {
      return NextResponse.json({ message: 'Tidak ada device terdaftar di zora_notifications.' }, { status: 200 });
    }

    // 4. Bungkus pesan ke format JSON String (Wajib agar sw.js kamu tidak error)
    const payload = JSON.stringify({
      title: 'Zora: Tugas Baru Dirilis! 📝',
      body: `Mata Kuliah: ${nama_tugas}. Deadline: ${deadline}.`
    });

    // 5. Kirim Notifikasi Massal ke seluruh device
    const pushPromises = users.map(user => {
      if (!user.subscription_json) return Promise.resolve();
      
      // Parsing string JSON dari database menjadi objek siap pakai
      const subJson = typeof user.subscription_json === 'string' 
        ? JSON.parse(user.subscription_json) 
        : user.subscription_json;

      return webpush.sendNotification(subJson, payload)
        .catch(err => console.error('Token kedaluwarsa atau tidak valid:', err.statusCode));
    });

    await Promise.all(pushPromises);
    return NextResponse.json({ success: true, message: 'Notifikasi tugas otomatis terkirim ke mahasiswa!' });

  } catch (error: any) {
    console.error('Crash internal API:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}