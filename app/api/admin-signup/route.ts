import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/utils/supabase/service-role';

export async function POST(req: Request) {
  try {
    const { nama, email, password, kelasId } = await req.json();

    if (!nama?.trim() || !email?.trim() || !password || !kelasId) {
      return NextResponse.json({ error: 'Semua field wajib diisi.' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password minimal 6 karakter.' }, { status: 400 });
    }

    const supabaseAdmin = createServiceRoleClient();

    // 1. Bikin akun auth
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email: email.trim(),
      password,
      email_confirm: true,
    });

    if (userError || !userData.user) {
      return NextResponse.json(
        { error: userError?.message || 'Gagal membuat akun.' },
        { status: 400 }
      );
    }

    // 2. Isi profil sebagai admin (pakai service role, jadi bypass RLS)
    const { error: profileError } = await supabaseAdmin.from('profiles').upsert({
      id: userData.user.id,
      nama: nama.trim(),
      role: 'pending_admin',
      kelas_id: kelasId,
      requested_at: new Date().toISOString(),
    });

    if (profileError) {
      // Kalau gagal isi profil, hapus lagi akun auth-nya biar nggak nyangkut
      await supabaseAdmin.auth.admin.deleteUser(userData.user.id);
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Terjadi kesalahan server.' },
      { status: 500 }
    );
  }
}