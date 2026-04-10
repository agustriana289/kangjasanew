import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await req.json();
    const { email, name } = body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Email tidak valid" }, { status: 400 });
    }

    const { data: existing } = await supabase
      .from("email_subscribers")
      .select("id")
      .eq("email", email)
      .single();

    if (existing) {
      return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 400 });
    }

    const { error } = await supabase.from("email_subscribers").insert({
      email: email.toLowerCase(),
      name: name?.trim() || null,
    });

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 400 });
      }
      throw error;
    }

    return NextResponse.json({ success: true, message: "Email berhasil ditambahkan" });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Terjadi kesalahan sistem" },
      { status: 500 }
    );
  }
}
