import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import EmailSettingsClient from "./EmailSettingsClient";

export const metadata = {
  title: "Pengaturan Email",
  description: "Konfigurasi pengiriman email via Gmail SMTP",
};

export default async function EmailSettingsPage() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    redirect("/login");
  }

  const { data: currentUser } = await supabase
    .from("users")
    .select("is_admin")
    .eq("id", authData.user.id)
    .single();

  if (!currentUser?.is_admin) {
    redirect("/dashboard");
  }

  return (
    <div className="pt-6 px-4 pb-12 h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">Pengaturan Email</h1>
        <p className="text-sm font-medium text-slate-500">
          Konfigurasi Gmail SMTP, custom domain pengirim, template email, dan kirim email ke klien.
        </p>
      </div>
      <EmailSettingsClient />
    </div>
  );
}
