"use client";

import { useState, useEffect } from "react";
import { Tag, Copy, MessageCircle, ExternalLink, Clock } from "lucide-react";

interface PromoInteractiveProps {
  promo_code: string | null;
  order_link: string | null;
  expired_at: string | null;
  title: string;
  waNumber: string;
}

function useCountdown(expired_at: string | null) {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    if (!expired_at) {
      setExpired(false);
      return;
    }
    const calc = () => {
      const diff = new Date(expired_at).getTime() - Date.now();
      if (diff <= 0) {
        setExpired(true);
        setTimeLeft(null);
        return;
      }
      setExpired(false);
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [expired_at]);

  return { timeLeft, expired };
}

export default function PromoInteractive({ promo_code, order_link, expired_at, title, waNumber }: PromoInteractiveProps) {
  const { timeLeft, expired } = useCountdown(expired_at);
  const [copied, setCopied] = useState(false);

  const waText = promo_code
    ? `Halo, saya ingin memesan menggunakan kode promo *${promo_code}* — ${title}`
    : `Halo, saya ingin memesan dari promo: ${title}`;

  const waHref = order_link
    ? order_link
    : waNumber
    ? `https://wa.me/${waNumber}?text=${encodeURIComponent(waText)}`
    : null;

  const handleCopy = () => {
    if (!promo_code || expired) return;
    navigator.clipboard.writeText(promo_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {expired_at && timeLeft && (
        <div className="mb-8 p-5 rounded-2xl bg-indigo-50 border border-indigo-100">
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Promo Berakhir Dalam</p>
          <div className="flex items-center gap-3">
            {[
              { label: "Hari", value: timeLeft.days },
              { label: "Jam", value: timeLeft.hours },
              { label: "Menit", value: timeLeft.minutes },
              { label: "Detik", value: timeLeft.seconds },
            ].map(({ label, value }) => (
              <div key={label} className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-white border border-indigo-100 shadow-sm flex items-center justify-center">
                  <span className="text-2xl font-extrabold text-slate-900 tabular-nums">
                    {String(value).padStart(2, "0")}
                  </span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {expired_at && expired && (
        <div className="mb-8 p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
          <Clock className="w-5 h-5 text-slate-400 shrink-0" />
          <p className="text-sm font-semibold text-slate-500">Promo ini sudah berakhir.</p>
        </div>
      )}

      <div className={`mt-12 rounded-3xl border p-6 transition-all ${expired ? "bg-slate-50 border-slate-200 opacity-70" : "bg-indigo-50 border-indigo-100"}`}>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">
          {expired ? "Promo Ini Sudah Berakhir" : "Gunakan Promo Ini"}
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          {promo_code && (
            <button
              onClick={handleCopy}
              disabled={expired}
              className={`flex-1 inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-5 py-3.5 text-sm font-bold tracking-widest transition-all ${
                expired
                  ? "border-slate-300 text-slate-400 cursor-not-allowed bg-white"
                  : "border-primary/40 text-primary bg-white hover:bg-indigo-50 hover:border-primary cursor-pointer"
              }`}
            >
              <Tag size={15} />
              {copied ? "Tersalin!" : promo_code}
              {!expired && <Copy size={13} className="ml-1 opacity-50" />}
            </button>
          )}

          {waHref && (
            <a
              href={expired ? undefined : waHref}
              target={expired ? undefined : "_blank"}
              rel="noopener noreferrer"
              className={`flex-1 inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-bold transition-all ${
                expired
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed pointer-events-none"
                  : "bg-primary hover:bg-secondary text-white shadow-md shadow-indigo-200 cursor-pointer"
              }`}
            >
              <MessageCircle size={15} />
              {order_link ? <>Order Sekarang <ExternalLink size={13} /></> : <>Order via WhatsApp <ExternalLink size={13} /></>}
            </a>
          )}
        </div>
        {expired && (
          <p className="text-xs text-slate-400 mt-3">Kode voucher dan tombol order telah dinonaktifkan karena promo sudah berakhir.</p>
        )}
      </div>
    </>
  );
}
