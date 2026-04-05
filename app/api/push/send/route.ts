import { NextResponse } from 'next/server';
import webpush from 'web-push';

// Konfigurasi Kunci VAPID
webpush.setVapidDetails(
  'mailto:agrotek@solaria.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(request: Request) {
  try {
    const { subscription, title, body } = await request.json();

    const payload = JSON.stringify({
      title: title || 'Notifikasi Solaria',
      body: body || 'Ada info baru!',
    });

    // Kirim ke server push browser
    await webpush.sendNotification(subscription, payload);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Gagal kirim push:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}