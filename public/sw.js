// Listener untuk menangkap sinyal "Push" dari server (Google/Apple Push Service)
self.addEventListener('push', function(event) {
  let data = { 
    title: 'Info Solaria 🍃', 
    message: 'Ada pembaruan informasi di dashboard kamu.',
    url: '/'
  };

  // Coba membaca data kiriman dari server
  if (event.data) {
    try {
      const payload = event.data.json();
      data = {
        title: payload.title || data.title,
        message: payload.message || payload.body || data.message,
        url: payload.url || data.url
      };
    } catch (e) {
      // Jika data bukan JSON (teks biasa), ambil sebagai pesan
      data.message = event.data.text();
    }
  }

  const options = {
    body: data.message,
    icon: '/logo.png',       // Logo yang muncul di samping pesan
    badge: '/logo.png',      // Ikon kecil di bar status HP
    vibrate: [200, 100, 200], // Pola getar: Getar 200ms, Diam 100ms, Getar 200ms
    data: {
      url: data.url
    },
    // Menghindari penumpukan notifikasi yang sama
    tag: 'solaria-notification',
    renotify: true
  };

  // Tampilkan notifikasi ke sistem operasi
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Listener ketika notifikasi di HP/Laptop di-KLIK oleh user
self.addEventListener('notificationclick', function(event) {
  event.notification.close(); // Tutup jendela notifikasi

  // Buka halaman web Solaria otomatis
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(function(clientList) {
      // Jika tab web sudah terbuka, fokuskan saja
      for (let i = 0; i < clientList.length; i++) {
        let client = clientList[i];
        if (client.url === event.notification.data.url && 'focus' in client) {
          return client.focus();
        }
      }
      // Jika tab belum terbuka, buka tab baru
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url);
      }
    })
  );
});