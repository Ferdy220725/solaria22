// app/kelas/[kode]/page.tsx
import { createClient } from '@/utils/supabase/server';
import AbsensiMahasiswa from '@/components/AbsensiMahasiswa';
import { notFound } from 'next/navigation';

export default async function KelasPage({
  params,
}: {
  params: { kode: string };
}) {
  const supabase = await createClient(); // <-- tambahkan await di sini

  // kode di URL selalu lowercase, misal /kelas/agt-a
  // sementara di DB kolom "kode" disimpan uppercase, misal "AGT-A"
  const kodeUpper = params.kode.toUpperCase();

  const { data: kelas, error } = await supabase
    .from('kelas')
    .select('id, nama, kode')
    .eq('kode', kodeUpper)
    .maybeSingle();

  if (error || !kelas) {
    notFound();
  }

  return (
    <AbsensiMahasiswa
      kelasId={kelas.id}
      kodeKelas={kelas.kode}
      namaKelas={kelas.nama}
    />
  );
}