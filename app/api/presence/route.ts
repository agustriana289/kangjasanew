import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: NextRequest) {
  const { sessionId } = await req.json();
  if (!sessionId) return NextResponse.json({ ok: false }, { status: 400 });

  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  await supabase.from("user_presence").upsert(
    {
      session_id: sessionId,
      user_id: user?.id ?? null,
      last_seen: new Date().toISOString(),
    },
    { onConflict: "session_id" }
  );

  return NextResponse.json({ ok: true });
}

export async function GET() {
  const supabase = await createClient();

  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

  const { count } = await supabase
    .from("user_presence")
    .select("*", { count: "exact", head: true })
    .gte("last_seen", fiveMinutesAgo);

  return NextResponse.json({ count: count ?? 0 });
}
