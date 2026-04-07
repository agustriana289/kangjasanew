import { NextRequest, NextResponse } from "next/server";
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

async function getValidAccessToken(): Promise<string | null> {
  const enabled = await getSetting("ticktick_enabled");
  if (enabled !== "true") return null;

  const accessToken = await getSetting("ticktick_access_token");
  if (!accessToken) return null;

  const expiresAtStr = await getSetting("ticktick_token_expires_at");
  if (expiresAtStr) {
    const expiresAt = new Date(expiresAtStr);
    if (expiresAt.getTime() - Date.now() < 5 * 60 * 1000) {
      const refreshToken = await getSetting("ticktick_refresh_token");
      if (refreshToken) {
        const newToken = await refreshAccessToken(refreshToken);
        if (newToken) return newToken;
      }
      return null;
    }
  }

  return accessToken;
}

async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  const credentials = Buffer.from(
    `${process.env.TICKTICK_CLIENT_ID}:${process.env.TICKTICK_CLIENT_SECRET}`
  ).toString("base64");

  const res = await fetch("https://ticktick.com/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${credentials}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }).toString(),
  });

  if (!res.ok) return null;

  const data = await res.json();
  const sb = supabaseAdmin();
  const expiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString();

  await sb.from("app_settings").upsert([
    { key: "ticktick_access_token", value: data.access_token, updated_at: new Date().toISOString() },
    { key: "ticktick_refresh_token", value: data.refresh_token || refreshToken, updated_at: new Date().toISOString() },
    { key: "ticktick_token_expires_at", value: expiresAt, updated_at: new Date().toISOString() },
  ]);

  return data.access_token;
}

export async function POST(req: NextRequest) {
  try {
    const { title, content, projectId: bodyProjectId } = await req.json();

    if (!title) {
      return NextResponse.json({ error: "title required" }, { status: 400 });
    }

    const accessToken = await getValidAccessToken();
    if (!accessToken) {
      return NextResponse.json({ error: "TickTick not connected" }, { status: 400 });
    }

    const projectId = bodyProjectId || (await getSetting("ticktick_project_id")) || undefined;

    const taskPayload: Record<string, unknown> = { title };
    if (content) taskPayload.content = content;
    if (projectId) taskPayload.projectId = projectId;

    const res = await fetch("https://api.ticktick.com/open/v1/task", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(taskPayload),
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ error: errText }, { status: res.status });
    }

    const task = await res.json();
    return NextResponse.json({ success: true, task });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
