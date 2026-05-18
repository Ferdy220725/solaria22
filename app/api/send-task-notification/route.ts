import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';

// 1. Ambil Kunci VAPID dari Environment Variables (Lebih Aman & Fleksibel)
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
    
    // Membaca data tugas yang baru saja kamu input di web
    const { nama_tugas, deadline } = body.record; 

    // Ambil semua token mahasiswa dari tabel zora_notifications
    const { data: users } = await supabase.from('zora_notifications').select('subscription_json');

    if (!users || users.length === 0) {
      return NextResponse.json({ message: 'Tidak ada token target' });
    }

    // Format isi pesan pengingat tugas
    const payload = JSON.stringify({
      title: 'Zora: Tugas Baru Terdeteksi! 📝',
      body: `Tugas "${nama_tugas}" harus dikumpul pada ${new Date(deadline).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}. Jangan telat!`
    });

    // Kirim notifikasi ke semua perangkat yang terdaftar
    const pushPromises = users.map(user => 
      webpush.sendNotification(user.subscription_json, payload).catch(err => console.error('Token expired:', err))
    );

    await Promise.all(pushPromises);

    return NextResponse.json({ success: true, message: 'Notifikasi tugas otomatis terkirim!' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}