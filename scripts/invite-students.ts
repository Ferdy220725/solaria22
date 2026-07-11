import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

// Memuat environment variables dari file .env.local
config({ path: ".env.local" });

// Pastikan variabel ini ada di .env.local kamu
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("❌ ERROR: NEXT_PUBLIC_SUPABASE_URL atau SUPABASE_SERVICE_ROLE_KEY tidak ditemukan di .env.local!");
  process.exit(1);
}

// Admin client menggunakan service_role key
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

// Daftar 45 mahasiswa yang akan diundang
const students = [
  { npm: "25025010093", nama: "SITI NUR FADILAH" },
  { npm: "25025010094", nama: "AGNIA LAQUINTA A-ABIN" },
  { npm: "25025010095", nama: "AFIA DWI AGUSTIN" },
  { npm: "25025010096", nama: "APRILITA MASYFATAH" },
  { npm: "25025010097", nama: "SYAKILA BALQIS AL-FANEZA" },
  { npm: "25025010098", nama: "AULIA EKA SAITRI" },
  { npm: "25025010099", nama: "CALLISTA ZAHRATUNISSA" },
  { npm: "25025010101", nama: "DHEA FITRI RAMADHANI" },
  { npm: "25025010102", nama: "ALIEF RAHMAT AKBARANI" },
  { npm: "25025010103", nama: "KARISMA ZAHRA LAILATUL FUADAH" },
  { npm: "25025010104", nama: "JAZZICA AZZURRA ANINDYA ZANDRA" },
  { npm: "25025010105", nama: "ENDYATMA ADRIEL FABIAN DAVID" },
  { npm: "25025010106", nama: "RIZQI SURYA PRATAMA" },
  { npm: "25025010107", nama: "ANNISA AULIA RAMADANI" },
  { npm: "25025010108", nama: "EKA RISZIANA AGUSTIN" },
  { npm: "25025010109", nama: "KHULLATUL BARIROH" },
  { npm: "25025010110", nama: "AGATHA ZULEYKA RAMDAN" },
  { npm: "25025010111", nama: "FAQIHATUN NISA'" },
  { npm: "25025010112", nama: "SALSABILLA OCTAVIA RAMADHANI" },
  { npm: "25025010113", nama: "KEYSHA AULIA AZZAHRA" },
  { npm: "25025010114", nama: "ANGEL MONICA NH" },
  { npm: "25025010115", nama: "USWATUN KHASANAH" },
  { npm: "25025010116", nama: "DHARMA AJI WISNU UTAMA" },
  { npm: "25025010117", nama: "KEIKY RESVANTI RAMADHANTI" },
  { npm: "25025010118", nama: "ANDINI SALWA INGRAINI" },
  { npm: "25025010119", nama: "TALITHA LISTYA SALSABILA" },
  { npm: "25025010120", nama: "ANDREA BENAYA PAGONGGANG" },
  { npm: "25025010121", nama: "AQDRIA YASHIRLY AMIRILA" },
  { npm: "25025010122", nama: "MOHAMMAD RIZKY HIKMAL PRAWIRA" },
  { npm: "25025010123", nama: "SAFRINA BR TINJAK" },
  { npm: "25025010124", nama: "CITRA PUTRI RAHMADANY" },
  { npm: "25025010125", nama: "ARJUNA WIRA KUSUMA" },
  { npm: "25025010126", nama: "NADIA FEBRISCA RACHMA" },
  { npm: "25025010127", nama: "KHANZA AFIFAH AMALINA" },
  { npm: "25025010128", nama: "FARINA PUTRI AURELIA" },
  { npm: "25025010130", nama: "LILIS DWI NURFADILAH" },
  { npm: "25025010131", nama: "AGNIA ALYA PUTRI" },
  { npm: "25025010132", nama: "CIKA RAHMA DWI ANJARSARI" },
  { npm: "25025010133", nama: "MARCELLY ELZA VARODIES" },
  { npm: "25025010135", nama: "RAFINES AL MUSLIM" },
  { npm: "25025010137", nama: "SONYA DAMAYANTI AZ-ZAHARA" },
  { npm: "25025010138", nama: "PRATIWI CITRA OKTAVIA" },
].map((s) => ({
  ...s,
  email: `${s.npm}@student.upnjatim.ac.id`,
}));

async function inviteAllStudents() {
  console.log(`🚀 Memulai proses pengiriman undangan untuk ${students.length} mahasiswa...\n`);

  for (const s of students) {
    try {
      const { error } = await supabaseAdmin.auth.admin.inviteUserByEmail(s.email, {
        data: {
          nama: s.nama,
          npm: s.npm,
        },
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/set-password`,
      });

      if (error) {
        console.error(`❌ Gagal mengundang ${s.email} (${s.nama}): ${error.message}`);
      } else {
        console.log(`✅ Undangan berhasil terkirim ke: ${s.email} (${s.nama})`);
      }
    } catch (err: any) {
      console.error(`❌ Terjadi error pada sistem saat mengundang ${s.email}:`, err.message);
    }

    // Delay 2 detik antar kirim untuk menghindari rate-limit dari penyedia email
    await new Promise((r) => setTimeout(r, 2000));
  }

  console.log("\n✨ Selesai! Semua mahasiswa telah diproses. Cek log di atas untuk yang gagal (jika ada).");
}

inviteAllStudents();