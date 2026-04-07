import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function getSetting(key: string): Promise<string | null> {
  const sb = supabaseAdmin();
  const { data } = await sb.from("app_settings").select("value").eq("key", key).single();
  return data?.value ?? null;
}

export async function GET() {
  const enabled = await getSetting("ticktick_enabled");
  if (enabled !== "true") {
    return NextResponse.json({ error: "TickTick not connected" }, { status: 400 });
  }

  const accessToken = await getSetting("ticktick_access_token");
  if (!accessToken) {
    return NextResponse.json({ error: "No access token" }, { status: 400 });
  }

  const res = await fetch("https://api.ticktick.com/open/v1/project", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json({ error: text }, { status: res.status });
  }

  const data = await res.json();
  const projects = (data || []).map((p: { id: string; name: string }) => ({
    id: p.id,
    name: p.name,
  }));

  return NextResponse.json({ projects });
}
