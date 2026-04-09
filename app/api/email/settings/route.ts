import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createCipheriv } from "crypto";

const CIPHER_KEY = (process.env.EMAIL_CIPHER_KEY || process.env.NEXT_PUBLIC_EMAIL_CIPHER_KEY || "").padEnd(32, "0").slice(0, 32);
const CIPHER_IV = (process.env.EMAIL_CIPHER_IV || process.env.NEXT_PUBLIC_EMAIL_CIPHER_IV || "").padEnd(16, "0").slice(0, 16);

function encryptPassword(plain: string): string {
  const cipher = createCipheriv("aes-256-cbc", Buffer.from(CIPHER_KEY), Buffer.from(CIPHER_IV));
  let encrypted = cipher.update(plain, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Pastikan user adalah admin
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: currentUser } = await supabase
      .from("users")
      .select("is_admin")
      .eq("id", authData.user.id)
      .single();

    if (!currentUser?.is_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { gmail_address, gmail_app_password, show_email_in_promo } = body;

    // Jika tidak ada field yang dikirim, return error
    if (!gmail_address && show_email_in_promo === undefined) {
      return NextResponse.json({ error: "Tidak ada data yang diubah" }, { status: 400 });
    }

    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString()
    };

    if (gmail_address) {
      updateData.gmail_address = gmail_address;
    }

    if (gmail_app_password) {
      updateData.gmail_app_password_encrypted = encryptPassword(gmail_app_password);
    }

    if (show_email_in_promo !== undefined) {
      updateData.show_email_in_promo = show_email_in_promo;
    }

    const { error } = await supabase
      .from("email_settings")
      .update(updateData)
      .eq("id", 1);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, message: "Pengaturan berhasil disimpan" });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Terjadi kesalahan sistem" }, { status: 500 });
  }
}
