"use client";

import { useEffect } from 'react';

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('Solaria SW terdaftar dengan scope:', registration.scope);
          })
          .catch((error) => {
            console.error('Solaria SW gagal terdaftar:', error);
          });
      });
    }
  }, []);

  return null; // Komponen ini tidak menampilkan apa-apa, hanya menjalankan skrip
}