import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import TickTickSettingsClient from "./TickTickSettingsClient";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: "Integrasi TickTick",
  description: "Hubungkan TickTick untuk sinkronisasi pesanan otomatis",
};

export default async function TickTickSettingsPage() {
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
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">Integrasi TickTick</h1>
        <p className="text-sm font-medium text-slate-500">
          Otomatis kirim pesanan baru sebagai task ke TickTick.
        </p>
      </div>
      <Suspense fallback={<div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
        <TickTickSettingsClient />
      </Suspense>
    </div>
  );
}
