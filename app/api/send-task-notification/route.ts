import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';

// 1. Ambil Kunci VAPID dari Environment Variables
const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;

// Pengaman: setVapidDetails hanya dijalankan jika kedua KEY tersedia dan valid
if (publicKey && privateKey) {
  try {
    webpush.setVapidDetails('mailto:agrotek@zora.com', publicKey, privateKey);
  } catch (error) {
    console.error('Gagal inisialisasi VAPID pada saat build:', error);
  }
}

// 2. Koneksi Supabase internal
const supabase = createClient(
  'https://etdcqxdjmdyexbvgjaza.supabase.co',
  'sb_publishable_69qNJfkxRc2lPnSUMYXCeQ_lsypv2Ba'
);

export async function POST(request: Request) {
  try {
    // Validasi darurat jika key ternyata kosong saat runtime API dipanggil
    if (!publicKey || !privateKey) {
      return NextResponse.json({ error: 'Konfigurasi VAPID tidak ditemukan di server.' }, { status: 500 });
    }

    const body = await request.json();
    
    // Membaca data kiriman dari MonitorJadwal
    const { nama_tugas, deadline } = body.record; 

    // Ambil semua token mahasiswa dari tabel zora_notifications
    const { data: users, error: supabaseError } = await supabase
      .from('zora_notifications')
      .select('subscription_json');

    if (supabaseError) {
      console.error('Error mengambil data Supabase:', supabaseError.message);
      return NextResponse.json({ error: supabaseError.message }, { status: 500 });
    }

    if (!users || users.length === 0) {
      console.log('Tidak ada token target di tabel zora_notifications');
      return NextResponse.json({ message: 'Tidak ada token target di database' });
    }

    // Format isi pesan baru yang AMAN dari crash format jam/tanggal JavaScript
    const payload = JSON.stringify({
      title: 'Zora: Jadwal Kuliah Baru! 📝',
      body: `Jadwal: ${nama_tugas}. Tanggal: ${deadline}. Cek aplikasi sekarang!`
    });

    // Kirim notifikasi ke semua perangkat yang terdaftar
    const pushPromises = users.map(user => {
      // Pastikan data subscription_json ada sebelum ditembak
      if (user.subscription_json) {
        return webpush.sendNotification(user.subscription_json, payload)
          .catch(err => console.error('Token expired atau tidak valid:', err));
      }
      return Promise.resolve();
    });

    await Promise.all(pushPromises);

    return NextResponse.json({ success: true, message: 'Notifikasi jadwal otomatis terkirim!' });
  } catch (error: any) {
    console.error('Crash internal pada API:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}