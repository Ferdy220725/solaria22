import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env.local" });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Menggunakan data dari list students yang kamu buat
const students = [
  { npm: "25025010100", nama: "AHMAT CHOYRUL FERDYANSYAH" },

].map((s) => ({
  ...s,
  email: `${s.npm}@student.upnjatim.ac.id`,
}));

async function inviteAllStudents() {
  console.log(`Mulai mengundang ${students.length} mahasiswa...\n`);

  for (const s of students) {
    try {
      const { error } = await supabaseAdmin.auth.admin.inviteUserByEmail(s.email, {
        data: { nama: s.nama, npm: s.npm },
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/set-password`,
      });

      if (error) {
        console.error(`❌ Gagal undang ${s.email}: ${error.message}`);
      } else {
        console.log(`✅ Undangan terkirim ke ${s.email} (${s.nama})`);
      }
    } catch (err: any) {
      console.error(`❌ Error saat undang ${s.email}:`, err.message);
    }

    // Delay 2 detik agar tidak kena rate limit provider email
    await new Promise((r) => setTimeout(r, 2000));
  }

  console.log("\nSelesai! Cek email (termasuk folder Spam) untuk link undangannya.");
}

inviteAllStudents();