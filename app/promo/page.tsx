import { createClient } from "@/utils/supabase/server";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FadeIn from "@/components/landing/FadeIn";
import Link from "next/link";
import { Calendar, ArrowRight, Tag, Clock, CheckCircle2 } from "lucide-react";
import Pagination from "@/components/landing/Pagination";

export const revalidate = 60;

async function getPromos(page: number, limit: number) {
  const supabase = await createClient();
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, count } = await supabase
    .from("promos")
    .select("id, title, slug, excerpt, cover_image, promo_code, expired_at, published_at", { count: "exact" })
    .eq("is_published", true)
    .order("published_at", { ascending: false })
    .range(from, to);

  return { data: data || [], total: count || 0 };
}

function isExpired(expired_at: string | null) {
  if (!expired_at) return false;
  return new Date(expired_at) < new Date();
}

export default async function PromoPage(props: { searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams;
  const pageStr = searchParams?.page;
  const page = typeof pageStr === "string" ? parseInt(pageStr, 10) : 1;
  const limit = 9;

  const { data: promos, total } = await getPromos(page, limit);
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      <Header />

      <div className="pt-8 pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn delay={100} className="max-w-2xl mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-sm font-medium text-primary mb-6">
              <Tag size={14} />
              <span>Promo & Penawaran</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl mb-4">
              Promo Spesial Untuk Anda
            </h1>
            <p className="text-lg text-slate-600">
              Temukan penawaran terbaik dan dapatkan layanan berkualitas dengan harga spesial menggunakan kode promo eksklusif kami.
            </p>
          </FadeIn>

          {promos.length === 0 ? (
            <FadeIn delay={200} className="text-center py-32 rounded-3xl bg-slate-50 ring-1 ring-slate-100">
              <Tag className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">Belum ada promo yang aktif.</p>
              <p className="text-slate-400 text-sm mt-1">Periksa kembali nanti untuk promo terbaru.</p>
            </FadeIn>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {promos.map((promo, idx) => {
                const expired = isExpired(promo.expired_at);
                return (
                  <FadeIn key={promo.id} delay={150 + idx * 80}>
                    <article className="group relative flex flex-col bg-white rounded-3xl ring-1 ring-slate-100/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden h-full">
                      <div className="relative aspect-video overflow-hidden">
                        {promo.cover_image ? (
                          <img
                            src={promo.cover_image}
                            alt={promo.title}
                            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${expired ? "grayscale opacity-60" : ""}`}
                          />
                        ) : (
                          <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
                            <Tag className="w-10 h-10" />
                          </div>
                        )}
                        <div className="absolute top-4 left-4">
                          {expired ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-700/90 backdrop-blur-sm px-3 py-1 text-xs font-bold text-white shadow-sm">
                              <Clock size={11} /> Kadaluarsa
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/90 backdrop-blur-sm px-3 py-1 text-xs font-bold text-white shadow-sm">
                              <CheckCircle2 size={11} /> Berjalan
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col flex-1 p-6">
                        <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
                          <Calendar size={13} />
                          <time>{new Date(promo.published_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</time>
                          {promo.expired_at && (
                            <>
                              <span>·</span>
                              <span className={expired ? "text-rose-400 font-medium" : "text-amber-500 font-medium"}>
                                {expired ? "Berakhir" : "Hingga"} {new Date(promo.expired_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                              </span>
                            </>
                          )}
                        </div>
                        <h2 className="text-lg font-bold text-slate-900 leading-snug mb-3 group-hover:text-primary transition-colors line-clamp-2">
                          {promo.title}
                        </h2>
                        {promo.excerpt && (
                          <p className="text-sm text-slate-500 leading-relaxed line-clamp-3 mb-4 flex-1">
                            {promo.excerpt}
                          </p>
                        )}
                        {promo.promo_code && (
                          <div className="mb-4">
                            <span className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-primary/40 bg-indigo-50 px-3 py-1.5 text-xs font-bold text-primary tracking-widest">
                              <Tag size={11} /> {promo.promo_code}
                            </span>
                          </div>
                        )}
                        <div className="mt-auto">
                          <Link
                            href={`/promo/${promo.slug}`}
                            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary transition-colors"
                          >
                            Lihat Promo <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                          </Link>
                        </div>
                      </div>
                    </article>
                  </FadeIn>
                );
              })}
            </div>
          )}

          {totalPages > 1 && (
            <Pagination totalPages={totalPages} currentPage={page} />
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
