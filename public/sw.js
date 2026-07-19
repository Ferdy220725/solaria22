self.addEventListener('push', function (event) {
  let data = { title: 'Zora', body: 'Ada pemberitahuan baru.' };
  try {
    data = event.data.json();
  } catch (err) {
    const text = event.data ? event.data.text() : null;
    if (text) data = { title: 'Zora', body: text };
  }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon || '/icon.png',
      badge: '/badge.png',
      data: { url: data.url || '/' }
    })
  );
});
self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});
