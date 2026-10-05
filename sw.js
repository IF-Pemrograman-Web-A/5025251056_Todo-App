// Service Worker Sederhana untuk menangani notifikasi (Kriteria 3)
self.addEventListener('install', function(e) {
  console.log('Service Worker terinstall');
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  console.log('Service Worker aktif');
});

// Listener untuk menampilkan notifikasi
self.addEventListener('message', function(e) {
  if (e.data && e.data.type === 'SHOW_NOTIFICATION') {
    self.registration.showNotification(e.data.title, {
      body: e.data.body,
      icon: 'https://via.placeholder.com/128'
    });
  }
});