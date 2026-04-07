/* 
  =========================================
  SOLARIA SERVICE WORKER (VERSION 2.0)
  =========================================
  Fitur: Offline Caching + Push Notifications
*/

const CACHE_NAME = 'solaria-cache-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/logo.png',
  '/favicon.ico', // Tambahkan ini agar tidak error 404 lagi
];

// 1. INSTALL: Menyimpan file inti ke cache saat pertama kali dibuka
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// 2. ACTIVATE: Membersihkan cache lama jika ada update
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// 3. FETCH: Mengambil data dari cache jika sedang offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// 4. PUSH LISTENER: Menangkap sinyal notifikasi dari Server (Google/Apple)
// Ini yang bikin notif bisa muncul meski web ditutup!
self.addEventListener('push', function(event) {
  let data = { 
    title: 'Info Solaria 🍃', 
    message: 'Ada pembaruan informasi di dashboard kamu.',
    url: '/'
  };

  // Coba membaca data kiriman dari server (Payload)
  if (event.data) {
    try {
      const payload = event.data.json();
      data = {
        title: payload.title || data.title,
        message: payload.message || payload.body || data.message,
        url: payload.url || data.url
      };
    } catch (e) {
      // Jika data bukan JSON (teks biasa), ambil sebagai pesan sederhana
      data.message = event.data.text();
    }
  }

  const options = {
    body: data.message,
    icon: '/logo.png',       // Pastikan file ini ada di folder public
    badge: '/logo.png',      // Ikon kecil di bar status HP
    vibrate: [200, 100, 200], // Pola getar HP
    data: {
      url: data.url
    },
    tag: 'solaria-notification', // Menghindari penumpukan notif yang sama
    renotify: true
  };

  // Tampilkan notifikasi ke sistem operasi (Android/Windows/iOS)
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// 5. NOTIFICATION CLICK: Aksi saat notifikasi di-tap/klik oleh user
self.addEventListener('notificationclick', function(event) {
  event.notification.close(); // Tutup jendela notifikasi

  // Logika untuk membuka atau memfokuskan tab Solaria
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(function(clientList) {
      // Jika tab web sudah terbuka di browser, fokuskan saja (jangan buka tab baru)
      for (let i = 0; i < clientList.length; i++) {
        let client = clientList[i];
        if (client.url === event.notification.data.url && 'focus' in client) {
          return client.focus();
        }
      }
      // Jika tab belum terbuka sama sekali, baru buka tab baru
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url);
      }
    })
  );
});