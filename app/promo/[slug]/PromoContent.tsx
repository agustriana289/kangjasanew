"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { ArrowLeft, Calendar, ChevronRight, Tag, Clock, CheckCircle2, Copy, ExternalLink, MessageCircle } from "lucide-react";
import { useState, useEffect } from "react";

interface PromoContentProps {
  promo: {
    title: string;
    slug: string;
    content: string | null;
    excerpt: string | null;
    published_at: string;
    cover_image: string | null;
    promo_code: string | null;
    order_link: string | null;
    expired_at: string | null;
  };
  waNumber: string;
}

function useCountdown(expired_at: string | null) {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    if (!expired_at) return;

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

export default function PromoContent({ promo, waNumber }: PromoContentProps) {
  const { timeLeft, expired } = useCountdown(promo.expired_at);
  const [copied, setCopied] = useState(false);

  const onlyExpiredAt = promo.expired_at && !timeLeft && expired;
  const isRunning = !expired;

  const handleCopy = () => {
    if (!promo.promo_code || expired) return;
    navigator.clipboard.writeText(promo.promo_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const waText = promo.promo_code
    ? `Halo, saya ingin memesan menggunakan kode promo *${promo.promo_code}* — ${promo.title}`
    : `Halo, saya ingin memesan dari promo: ${promo.title}`;

  const waHref = promo.order_link
    ? promo.order_link
    : waNumber
    ? `https://wa.me/${waNumber}?text=${encodeURIComponent(waText)}`
    : null;

  return (
    <div className="min-h-screen bg-white font-sans">
      <Header />

      <div className="pt-28 pb-24 mx-auto max-w-4xl px-4 sm:px-6">

        <nav className="flex items-center gap-1.5 text-xs font-medium text-slate-400 mb-10">
          <Link href="/" className="hover:text-slate-700 transition-colors">Beranda</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/promo" className="hover:text-slate-700 transition-colors">Promo</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-slate-600 truncate max-w-[200px]">{promo.title}</span>
        </nav>

        <div className="flex flex-wrap items-center gap-3 mb-5">
          {expired ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-200 text-slate-600 px-3 py-1 text-xs font-bold">
              <Clock size={12} /> Kadaluarsa
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 text-emerald-700 px-3 py-1 text-xs font-bold">
              <CheckCircle2 size={12} /> Berjalan
            </span>
          )}
          {promo.promo_code && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-primary/40 bg-indigo-50 px-3 py-1 text-xs font-bold text-primary tracking-widest">
              <Tag size={11} /> {promo.promo_code}
            </span>
          )}
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight mb-4">
          {promo.title}
        </h1>

        {promo.excerpt && (
          <p className="text-lg text-slate-500 leading-relaxed mb-6">
            {promo.excerpt}
          </p>
        )}

        <div className="flex items-center gap-2 text-sm text-slate-400 mb-8 pb-8 border-b border-slate-100">
          <Calendar className="w-4 h-4" />
          <time>
            {new Date(promo.published_at).toLocaleDateString("id-ID", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </time>
          {promo.expired_at && (
            <>
              <span className="mx-1">·</span>
              <Clock className="w-4 h-4" />
              <span className={expired ? "text-rose-500 font-semibold" : "text-amber-500 font-semibold"}>
                {expired ? "Berakhir" : "Berakhir"} {new Date(promo.expired_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
              </span>
            </>
          )}
        </div>

        {promo.expired_at && timeLeft && (
          <div className="mb-8 p-5 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 ring-1 ring-indigo-50">
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

        {promo.cover_image && (
          <div className="mb-10 rounded-3xl overflow-hidden aspect-video shadow-sm ring-1 ring-slate-100">
            <img
              src={promo.cover_image}
              alt={promo.title}
              className={`w-full h-full object-cover ${expired ? "grayscale opacity-70" : ""}`}
            />
          </div>
        )}

        {promo.content && (
          <div className="blog-content" dangerouslySetInnerHTML={{ __html: promo.content }} />
        )}

        <div className={`mt-12 rounded-3xl border p-6 transition-all ${expired ? "bg-slate-50 border-slate-200 opacity-70" : "bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-100"}`}>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">
            {expired ? "Promo Ini Sudah Berakhir" : "Gunakan Promo Ini"}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            {promo.promo_code && (
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
                {copied ? "Tersalin!" : promo.promo_code}
                {!expired && <Copy size={13} className="ml-1 opacity-50" />}
              </button>
            )}

            {waHref && (
              <a
                href={expired ? undefined : waHref}
                target={expired ? undefined : "_blank"}
                rel="noopener noreferrer"
                aria-disabled={expired}
                className={`flex-1 inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-bold transition-all ${
                  expired
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed pointer-events-none"
                    : "bg-primary hover:bg-secondary text-white shadow-md shadow-indigo-200 cursor-pointer"
                }`}
              >
                <MessageCircle size={15} />
                {promo.order_link ? (
                  <>Order Sekarang <ExternalLink size={13} /></>
                ) : (
                  <>Order via WhatsApp <ExternalLink size={13} /></>
                )}
              </a>
            )}
          </div>
          {expired && (
            <p className="text-xs text-slate-400 mt-3">Kode voucher dan tombol order telah dinonaktifkan karena promo sudah berakhir.</p>
          )}
        </div>

        <div className="mt-10 pt-6 border-t border-slate-100">
          <Link
            href="/promo"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Semua Promo
          </Link>
        </div>

      </div>

      <Footer />

      <style>{`
        .blog-content { color: #475569; font-size: 1.0625rem; line-height: 1.9; }
        .blog-content h1 { font-size: 1.875rem; font-weight: 800; color: #0f172a; margin: 2.5rem 0 1rem; line-height: 1.2; }
        .blog-content h2 { font-size: 1.5rem; font-weight: 700; color: #1e293b; margin: 2.25rem 0 0.875rem; line-height: 1.3; }
        .blog-content h3 { font-size: 1.2rem; font-weight: 700; color: #1e293b; margin: 1.75rem 0 0.75rem; }
        .blog-content p { margin-bottom: 1.5rem; }
        .blog-content ul { list-style-type: disc; margin-left: 1.5rem; margin-bottom: 1.5rem; }
        .blog-content ol { list-style-type: decimal; margin-left: 1.5rem; margin-bottom: 1.5rem; }
        .blog-content li { margin-bottom: 0.5rem; }
        .blog-content a { color: #4f46e5; font-weight: 600; text-decoration: underline; text-underline-offset: 3px; }
        .blog-content a:hover { color: #4338ca; }
        .blog-content strong { color: #0f172a; font-weight: 700; }
        .blog-content em { font-style: italic; }
        .blog-content code { background: #f1f5f9; color: #4f46e5; padding: 0.15rem 0.45rem; border-radius: 0.375rem; font-size: 0.875em; font-family: monospace; border: 1px solid #e2e8f0; }
        .blog-content pre { background: #1e293b; color: #e2e8f0; padding: 1.5rem; border-radius: 1rem; overflow-x: auto; margin: 1.75rem 0; font-size: 0.875rem; }
        .blog-content pre code { background: none; color: inherit; padding: 0; border: none; }
        .blog-content blockquote { border-left: 3px solid #6366f1; background: #f5f3ff; padding: 1rem 1.5rem; border-radius: 0 1rem 1rem 0; margin: 1.75rem 0; color: #4b5563; font-style: italic; }
        .blog-content hr { border: none; border-top: 1px solid #e2e8f0; margin: 2.5rem 0; }
        .blog-content img { border-radius: 1.25rem; max-width: 100%; margin: 2rem auto; display: block; box-shadow: 0 20px 40px -12px rgb(0 0 0 / 0.15); }
        .blog-content table { width: 100%; border-collapse: collapse; margin: 1.75rem 0; font-size: 0.9rem; }
        .blog-content th { background: #f8fafc; font-weight: 700; color: #1e293b; padding: 0.75rem 1rem; border: 1px solid #e2e8f0; text-align: left; }
        .blog-content td { padding: 0.75rem 1rem; border: 1px solid #e2e8f0; }
      `}</style>
    </div>
  );
}
