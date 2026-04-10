"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/components/ToastProvider";
import {
  Trophy, Users, Mail, Shuffle, ChevronDown, Loader2,
  RotateCcw, Copy, CheckCircle2, Sparkles, Gift
} from "lucide-react";

type Source = "subscribers" | "customers";

type Participant = {
  id: string;
  name: string;
  email: string;
  whatsapp?: string;
  source: Source;
};

type Winner = Participant;

const SPIN_DURATION = 3000;
const SPIN_INTERVAL = 60;

export default function UndianClient() {
  const supabase = createClient();
  const { showToast } = useToast();

  const [source, setSource] = useState<Source>("subscribers");
  const [winnerCount, setWinnerCount] = useState(1);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [displayName, setDisplayName] = useState<string>("");
  const [phase, setPhase] = useState<"idle" | "spinning" | "done">("idle");
  const [currentWinnerIdx, setCurrentWinnerIdx] = useState(0);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const spinTimerRef = useRef<NodeJS.Timeout | null>(null);
  const doneTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchParticipants = useCallback(async () => {
    setLoading(true);
    setWinners([]);
    setPhase("idle");
    setDisplayName("");
    try {
      if (source === "subscribers") {
        const { data, error } = await supabase
          .from("email_subscribers")
          .select("id, name, email, whatsapp");
        if (error) throw error;
        setParticipants(
          (data || []).map((d) => ({
            id: d.id,
            name: d.name || d.email,
            email: d.email,
            whatsapp: d.whatsapp || undefined,
            source: "subscribers",
          }))
        );
      } else {
        const { data: orders, error } = await supabase
          .from("store_orders")
          .select("id, form_data, guest_name, guest_phone, user_id");
        if (error) throw error;
        const { data: users } = await supabase
          .from("users")
          .select("id, full_name, email, phone");
        const userMap: Record<string, { full_name: string; email: string; phone?: string | null }> = {};
        (users || []).forEach((u) => { if (u.id) userMap[u.id] = u as any; });

        const seen = new Set<string>();
        const list: Participant[] = [];
        (orders || []).forEach((o) => {
          let name = "";
          let email = "";
          let phone = "";
          const user = o.user_id ? userMap[o.user_id] : null;
          if (user) { name = user.full_name; email = user.email; phone = user.phone || ""; }
          if (!name || !email) {
            try {
              const fd = typeof o.form_data === "string" ? JSON.parse(o.form_data) : o.form_data || {};
              if (!email) email = fd.email || fd.customer_email || "";
              if (!name) name = fd.customer_name || fd["Client Name"] || o.guest_name || "";
              if (!phone) phone = fd.whatsapp || o.guest_phone || "";
            } catch {}
          }
          const key = email || o.id;
          if (!seen.has(key)) {
            seen.add(key);
            list.push({ id: o.id, name: name || email || "Tidak Dikenal", email, whatsapp: phone || undefined, source: "customers" });
          }
        });
        setParticipants(list);
      }
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  }, [source, supabase, showToast]);

  useEffect(() => {
    fetchParticipants();
  }, [fetchParticipants]);

  const startDraw = () => {
    if (participants.length === 0) { showToast("Tidak ada peserta.", "error"); return; }
    if (winnerCount > participants.length) { showToast(`Jumlah pemenang (${winnerCount}) melebihi peserta (${participants.length}).`, "error"); return; }

    setWinners([]);
    setPhase("spinning");
    setCurrentWinnerIdx(0);
    setSpinning(true);

    const shuffled = [...participants].sort(() => Math.random() - 0.5);
    const picked = shuffled.slice(0, winnerCount);

    let elapsed = 0;
    spinTimerRef.current = setInterval(() => {
      const rnd = participants[Math.floor(Math.random() * participants.length)];
      setDisplayName(rnd.name);
      elapsed += SPIN_INTERVAL;
    }, SPIN_INTERVAL);

    doneTimerRef.current = setTimeout(() => {
      if (spinTimerRef.current) clearInterval(spinTimerRef.current);
      setSpinning(false);
      setWinners(picked);
      setDisplayName(picked[0].name);
      setCurrentWinnerIdx(0);
      setPhase("done");
    }, SPIN_DURATION);
  };

  const reset = () => {
    if (spinTimerRef.current) clearInterval(spinTimerRef.current);
    if (doneTimerRef.current) clearTimeout(doneTimerRef.current);
    setWinners([]);
    setPhase("idle");
    setDisplayName("");
    setCurrentWinnerIdx(0);
  };

  const copyWinner = (idx: number) => {
    const w = winners[idx];
    const text = `${w.name} | ${w.email}${w.whatsapp ? ` | WA: ${w.whatsapp}` : ""}`;
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const inputClass = "bg-white border border-slate-200 text-slate-900 text-sm font-medium rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-secondary p-3 transition-all outline-none w-full";
  const labelClass = "block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2";

  return (
    <div className="pt-6 px-4 pb-16 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Modul Undian</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Pilih pemenang secara acak dari daftar peserta.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-5">
          <div className="bg-white shadow-sm ring-1 ring-slate-100 rounded-2xl p-6 space-y-5">
            <div>
              <label className={labelClass}>Sumber Peserta</label>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { val: "subscribers", label: "Subscriber Email", icon: Mail },
                  { val: "customers", label: "Pelanggan Proyek", icon: Users },
                ] as { val: Source; label: string; icon: any }[]).map(({ val, label, icon: Icon }) => (
                  <button
                    key={val}
                    onClick={() => setSource(val)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 text-xs font-bold transition-all ${
                      source === val
                        ? "border-primary bg-indigo-50 text-primary"
                        : "border-slate-200 text-slate-500 hover:border-slate-300"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={labelClass}>Jumlah Pemenang</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setWinnerCount((n) => Math.max(1, n - 1))}
                  className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 text-lg font-bold transition-colors"
                >
                  −
                </button>
                <input
                  type="number"
                  min={1}
                  max={participants.length || 999}
                  value={winnerCount}
                  onChange={(e) => setWinnerCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className={`${inputClass} text-center text-xl font-extrabold`}
                />
                <button
                  onClick={() => setWinnerCount((n) => n + 1)}
                  className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 text-lg font-bold transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl px-4 py-3 flex items-center justify-between border border-slate-100">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Peserta</span>
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
              ) : (
                <span className="text-lg font-extrabold text-slate-900">{participants.length}</span>
              )}
            </div>

            <button
              onClick={startDraw}
              disabled={spinning || loading || participants.length === 0}
              className="w-full inline-flex items-center justify-center gap-2 bg-primary hover:bg-secondary text-white text-sm font-bold px-6 py-3.5 rounded-xl shadow-md shadow-indigo-200 transition-colors disabled:opacity-60"
            >
              {spinning ? <><Loader2 className="w-4 h-4 animate-spin" />Mengundi...</> : <><Shuffle className="w-4 h-4" />Mulai Undian</>}
            </button>

            {phase !== "idle" && (
              <button
                onClick={reset}
                disabled={spinning}
                className="w-full inline-flex items-center justify-center gap-2 border border-slate-200 text-slate-600 text-sm font-bold px-6 py-3 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-60"
              >
                <RotateCcw className="w-4 h-4" />Ulangi Undian
              </button>
            )}
          </div>

          <div className="bg-white shadow-sm ring-1 ring-slate-100 rounded-2xl p-4 max-h-64 overflow-y-auto">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Daftar Peserta ({participants.length})
            </p>
            {loading ? (
              <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>
            ) : participants.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">Tidak ada peserta.</p>
            ) : (
              <ul className="space-y-1">
                {participants.map((p) => (
                  <li key={p.id} className="text-xs text-slate-600 px-2 py-1.5 rounded-lg hover:bg-slate-50 flex items-center gap-2 transition-colors">
                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400 shrink-0">
                      {(p.name || "?")[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 truncate">{p.name}</p>
                      <p className="text-slate-400 truncate">{p.email}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white shadow-sm ring-1 ring-slate-100 rounded-2xl p-8 min-h-[480px] flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/40 via-white to-purple-50/40 pointer-events-none" />

            {phase === "idle" && (
              <div className="relative text-center">
                <div className="w-24 h-24 rounded-full bg-indigo-50 border-2 border-indigo-100 flex items-center justify-center mx-auto mb-6">
                  <Gift className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-xl font-extrabold text-slate-700 mb-2">Siap Mengundi</h2>
                <p className="text-sm text-slate-400">Pilih sumber dan jumlah pemenang, lalu klik <b>Mulai Undian</b>.</p>
              </div>
            )}

            {phase === "spinning" && (
              <div className="relative text-center w-full">
                <div className="flex items-center justify-center gap-2 mb-6">
                  <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Mengundi...</span>
                  <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
                </div>
                <div className="relative bg-gradient-to-br from-primary to-secondary rounded-3xl p-8 mx-auto max-w-sm shadow-2xl shadow-indigo-300">
                  <div className="absolute -top-3 -right-3">
                    <div className="w-8 h-8 rounded-full bg-amber-400 animate-bounce flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <p
                    className="text-white text-2xl font-extrabold text-center break-words"
                    style={{ minHeight: "2.5rem", transition: "opacity 0.05s" }}
                  >
                    {displayName || "..."}
                  </p>
                </div>
                <div className="mt-6 flex justify-center gap-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full bg-primary animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            )}

            {phase === "done" && winners.length > 0 && (
              <div className="relative w-full">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-4 py-1.5 mb-3">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    <span className="text-sm font-bold text-amber-700">
                      {winners.length} Pemenang Terpilih!
                    </span>
                  </div>
                  <h2 className="text-xl font-extrabold text-slate-900">Selamat kepada Pemenang 🎉</h2>
                </div>

                <div className="space-y-3">
                  {winners.map((w, idx) => (
                    <div
                      key={w.id}
                      className="flex items-center gap-4 bg-gradient-to-r from-indigo-50 to-white border border-indigo-100 rounded-2xl p-4 shadow-sm"
                      style={{ animationDelay: `${idx * 0.1}s` }}
                    >
                      <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-extrabold text-sm shrink-0 shadow-md shadow-indigo-200">
                        #{idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-extrabold text-slate-900 text-sm truncate">{w.name}</p>
                        <p className="text-xs text-slate-500 truncate">{w.email}</p>
                        {w.whatsapp && (
                          <p className="text-xs text-emerald-600 font-medium truncate">WA: {w.whatsapp}</p>
                        )}
                      </div>
                      <button
                        onClick={() => copyWinner(idx)}
                        className="p-2 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-primary hover:border-primary/30 transition-colors shrink-0"
                        title="Salin data pemenang"
                      >
                        {copiedIdx === idx ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
