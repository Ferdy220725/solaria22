// KODE UNTUK FILE: components/NotificationHandler.tsx
"use client";

import { useEffect } from 'react';
import { createClient } from '../utils/supabase/client'; 
import { toast } from 'sonner';

export default function NotificationHandler() {
  const supabase = createClient();

  useEffect(() => {
    // Fungsi minta izin ke browser untuk notifikasi desktop
    const askPermission = async () => {
      if (Notification.permission !== "granted") {
        await Notification.requestPermission();
      }
    };
    askPermission();

    // MENGHUBUNGKAN KE DATABASE SECARA REALTIME
    const channel = supabase
      .channel('notif-channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        (payload) => {
          console.log("SINYAL REALTIME DITERIMA:", payload);
          const { title, message } = payload.new;

          // Munculkan Pop-up di dalam web
          toast.success(title, { description: message });

          // Munculkan Notifikasi Windows/HP (jika web sedang di-minimize)
          if (Notification.permission === "granted") {
            new Notification(title, { body: message, icon: "/logo.png" });
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [supabase]);

  return null;
}