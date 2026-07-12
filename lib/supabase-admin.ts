// lib/supabase-admin.ts
// Client Supabase khusus server-side (API routes), pakai Service Role Key
// supaya bisa update kolom konten_teks tanpa terhalang RLS.
// JANGAN pernah import file ini di komponen client ("use client").

import { createClient } from "@supabase/supabase-js";

export function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}