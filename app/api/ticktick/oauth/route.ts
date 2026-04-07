import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const TICKTICK_CLIENT_ID = process.env.TICKTICK_CLIENT_ID!;
const TICKTICK_CLIENT_SECRET = process.env.TICKTICK_CLIENT_SECRET!;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL!;
const REDIRECT_URI = `${BASE_URL}/api/ticktick/oauth`;

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function upsertSetting(key: string, value: string | null) {
  const sb = supabaseAdmin();
  await sb.from("app_settings").upsert({ key, value, updated_at: new Date().toISOString() });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(`${BASE_URL}/dashboard/settings?ticktick=error&reason=${error}`);
  }

  if (!code) {
    const params = new URLSearchParams({
      client_id: TICKTICK_CLIENT_ID,
      scope: "tasks:write tasks:read",
      redirect_uri: REDIRECT_URI,
      response_type: "code",
    });
    return NextResponse.redirect(`https://ticktick.com/oauth/authorize?${params.toString()}`);
  }

  const credentials = Buffer.from(`${TICKTICK_CLIENT_ID}:${TICKTICK_CLIENT_SECRET}`).toString("base64");
  const tokenRes = await fetch("https://ticktick.com/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${credentials}`,
    },
    body: new URLSearchParams({
      code,
      grant_type: "authorization_code",
      redirect_uri: REDIRECT_URI,
    }).toString(),
  });

  if (!tokenRes.ok) {
    const txt = await tokenRes.text();
    return NextResponse.redirect(`${BASE_URL}/dashboard/settings?ticktick=error&reason=${encodeURIComponent(txt)}`);
  }

  const tokenData = await tokenRes.json();
  const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000).toISOString();

  await upsertSetting("ticktick_access_token", tokenData.access_token);
  await upsertSetting("ticktick_refresh_token", tokenData.refresh_token || null);
  await upsertSetting("ticktick_token_expires_at", expiresAt);
  await upsertSetting("ticktick_enabled", "true");

  return NextResponse.redirect(`${BASE_URL}/dashboard/settings?ticktick=success`);
}
