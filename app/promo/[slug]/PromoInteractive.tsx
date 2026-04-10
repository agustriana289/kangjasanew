"use client";

import { useState, useEffect } from "react";
import { Tag, Copy, MessageCircle, ExternalLink, Clock, Mail, Loader2, CheckCircle, User, Phone } from "lucide-react";

interface PromoInteractiveProps {
  promo_code: string | null;
  order_link: string | null;
  expired_at: string | null;
  title: string;
  waNumber: string;
  show_subscriber_email: boolean;
  email_section_title: string;
  email_section_description: string;
  email_button_text: string;
}

function useCountdown(expired_at: string | null) {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    if (!expired_at) { setExpired(false); return; }
    const calc = () => {
      const diff = new Date(expired_at).getTime() - Date.now();
      if (diff <= 0) { setExpired(true); setTimeLeft(null); return; }
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

export default function PromoInteractive({
  promo_code, order_link, expired_at, title, waNumber,
  show_subscriber_email, email_section_title, email_section_description, email_button_text,
}: PromoInteractiveProps) {
  const { timeLeft, expired } = useCountdown(expired_at);
  const [copied, setCopied] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [subscriberName, setSubscriberName] = useState("");
  const [subscriberEmail, setSubscriberEmail] = useState("");
  const [subscriberWa, setSubscriberWa] = useState("");
  const [emailError, setEmailError] = useState("");

  const handleSubscribeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(subscriberEmail)) { setEmailError("Email tidak valid"); return; }
    setEmailLoading(true);
    try {
      const response = await fetch("/api/email/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: subscriberEmail, name: subscriberName, whatsapp: subscriberWa }),
      });
      const data = await response.json();
      if (!response.ok) { setEmailError(data.error || "Gagal mendaftar"); return; }
      setEmailSubmitted(true);
      setSubscriberName(""); setSubscriberEmail(""); setSubscriberWa("");
      setTimeout(() => setEmailSubmitted(false), 4000);
    } catch {
      setEmailError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setEmailLoading(false);
    }
  };

  const waText = promo_code
    ? `Halo, saya ingin memesan menggunakan kode promo *${promo_code}* — ${title}`
    : `Halo, saya ingin memesan dari promo: ${title}`;
  const waHref = order_link ? order_link : waNumber ? `https://wa.me/${waNumber}?text=${encodeURIComponent(waText)}` : null;

  const handleCopy = () => {
    if (!promo_code || expired) return;
    navigator.clipboard.writeText(promo_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {expired_at && timeLeft && (
        <div className="mb-6 p-5 rounded-2xl bg-indigo-50 border border-indigo-100">
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
                  <span className="text-2xl font-extrabold text-slate-900 tabular-nums">{String(value).padStart(2, "0")}</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {expired_at && expired && (
        <div className="mb-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
          <Clock className="w-5 h-5 text-slate-400 shrink-0" />
          <p className="text-sm font-semibold text-slate-500">Promo ini sudah berakhir.</p>
        </div>
      )}

      {show_subscriber_email && (
        <div className="mb-6 rounded-3xl overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-indigo-50 via-white to-purple-50 shadow-lg shadow-indigo-100">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
                <Mail className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">{email_section_title}</h3>
            </div>
            <p className="text-sm text-slate-500 mb-4 ml-10">{email_section_description}</p>

            {emailSubmitted ? (
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                <p className="text-sm font-semibold text-emerald-700">Berhasil terdaftar! Terima kasih.</p>
              </div>
            ) : (
              <form onSubmit={handleSubscribeEmail} className="space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={subscriberName}
                      onChange={(e) => setSubscriberName(e.target.value)}
                      placeholder="Nama Anda"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      disabled={emailLoading}
                    />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      value={subscriberWa}
                      onChange={(e) => setSubscriberWa(e.target.value)}
                      placeholder="No. WhatsApp (opsional)"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      disabled={emailLoading}
                    />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={subscriberEmail}
                      onChange={(e) => { setSubscriberEmail(e.target.value); setEmailError(""); }}
                      placeholder="nama@email.com"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      disabled={emailLoading}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={emailLoading || !subscriberEmail}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-secondary text-white text-sm font-bold transition-all disabled:opacity-60 whitespace-nowrap shadow-md shadow-indigo-200"
                  >
                    {emailLoading ? <><Loader2 className="w-4 h-4 animate-spin" />Mengirim...</> : <><Mail className="w-4 h-4" />{email_button_text}</>}
                  </button>
                </div>
                {emailError && <p className="text-xs text-rose-500 font-medium">{emailError}</p>}
              </form>
            )}
          </div>
        </div>
      )}

      <div className={`rounded-3xl border p-6 transition-all ${expired ? "bg-slate-50 border-slate-200 opacity-70" : "bg-indigo-50 border-indigo-100"}`}>
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
        {expired && <p className="text-xs text-slate-400 mt-3">Kode voucher dan tombol order telah dinonaktifkan karena promo sudah berakhir.</p>}
      </div>
    </>
  );
}
