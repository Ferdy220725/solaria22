import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Harus login dulu" }, { status: 401 });
    }

    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userData?.user) {
      return NextResponse.json({ error: "Sesi tidak valid, silakan login ulang" }, { status: 401 });
    }

    const user = userData.user;

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("kelas_id")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile?.kelas_id) {
      return NextResponse.json({ error: "Profil belum lengkap (kelas belum terdaftar)" }, { status: 400 });
    }

    const subscription = await req.json();
    if (!subscription?.endpoint) {
      return NextResponse.json({ error: "Subscription tidak valid" }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from("push_subscriptions").upsert(
      {
        user_id: user.id,
        kelas_id: profile.kelas_id,
        endpoint: subscription.endpoint,
        subscription: subscription,
      },
      { onConflict: "endpoint" }
    );

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error save-subscription:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}