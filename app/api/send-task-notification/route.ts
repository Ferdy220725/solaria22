import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';

const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;

if (publicKey && privateKey) {
  try {
    webpush.setVapidDetails('mailto:agrotek@zora.com', publicKey, privateKey);
  } catch (error) {
    console.error('Gagal inisialisasi VAPID:', error);
  }
}

// ❌ JANGAN buat "const supabase = createClient(...)" di luar fungsi sini lagi.
// Kita akan buat di dalam fungsi POST saja agar aman saat runtime!

export async function POST(request: Request) {
  try {
    // 1. Ambil ENV secara real-time saat API ditembak
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // 2. Validasi darurat jika ENV masih ngambek
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("❌ Kunci Supabase tidak terbaca di env server!");
      return NextResponse.json(
        { error: 'Konfigurasi Environment Variables Supabase (URL/Service Role Key) hilang atau kosong.' }, 
        { status: 500 }
      );
    }

    if (!publicKey || !privateKey) {
      return NextResponse.json({ error: 'VAPID Key tidak ditemukan di env.' }, { status: 500 });
    }

    // 3. Buat client Supabase di dalam sini (Aman dari error global crash)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // --- SISA KODE POST DI BAWAHNYA TETAP SAMA ---
    const body = await request.json().catch(() => ({}));
    const recordData = body.record || body;
    const nama_tugas = recordData.nama_tugas || "Ada Tugas Baru!";
    const deadline = recordData.deadline || "Cek aplikasi sekarang";

    const { data: users, error: supabaseError } = await supabase
      .from('zora_notifications')
      .select('subscription_json');

    if (supabaseError) {
      return NextResponse.json({ error: supabaseError.message }, { status: 500 });
    }

    if (!users || users.length === 0) {
      return NextResponse.json({ message: 'Tidak ada device terdaftar.' }, { status: 200 });
    }

    const payload = JSON.stringify({
      title: 'Zora: Tugas Baru Dirilis! 📝',
      body: `Mata Kuliah: ${nama_tugas}. Deadline: ${deadline}.`
    });

    const pushPromises = users.map(user => {
      if (!user.subscription_json) return Promise.resolve();
      const subJson = typeof user.subscription_json === 'string' 
        ? JSON.parse(user.subscription_json) 
        : user.subscription_json;

      return webpush.sendNotification(subJson, payload)
        .catch(err => console.error('Token expired:', err.statusCode));
    });

    await Promise.all(pushPromises);
    return NextResponse.json({ success: true, message: 'Notifikasi terkirim!' });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}