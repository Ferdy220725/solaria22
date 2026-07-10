import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Jika sukses, arahkan user ke halaman set-password
      return NextResponse.redirect(`${origin}/set-password`);
    }
  }

  // Jika gagal, arahkan ke login
  return NextResponse.redirect(`${origin}/login`);
}