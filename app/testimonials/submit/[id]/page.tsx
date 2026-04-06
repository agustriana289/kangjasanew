import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import SubmitTestimonialClient from "./SubmitTestimonialClient";
import { Clock, AlertTriangle } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Kirim Testimoni",
  description: "Bagikan pengalaman Anda bekerja sama dengan kami.",
};

export default async function SubmitTestimonialPage({ params }: { params: { id: string } | Promise<{ id: string }> }) {
  const { id } = await (params instanceof Promise ? params : Promise.resolve(params));
  
  // Use service role to bypass RLS for public testimonial link
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Ambil data order
  const { data: order, error: orderError } = await supabaseAdmin
    .from("store_orders")
    .select("*, store_products(title, category), store_services(title, category)")
    .eq("id", id)
    .single();

  if (!order || orderError) notFound();

  // 1. Check if Status is Completed
  if (order.status !== 'completed') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-sm border border-slate-100">
          <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Proyek Belum Selesai</h1>
          <p className="text-slate-500 mb-6">Proyek ini harus ditandai sebagai selesai sebelum Anda dapat memberikan testimoni.</p>
          <Link href="/" className="inline-block bg-primary text-white font-bold py-3 px-6 rounded-xl hover:bg-secondary transition-colors">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  // 2. Check Expiry (7 Days from link generation)
  const linkGeneratedAt = order.testimonial_link_generated_at ? new Date(order.testimonial_link_generated_at) : null;
  const now = new Date();
  
  // If link never generated, it's invalid
  if (!linkGeneratedAt) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-sm border border-slate-100">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Link Tidak Valid</h1>
          <p className="text-slate-500 mb-6">Link testimoni ini tidak valid atau belum dibuat dengan benar oleh administrator.</p>
          <Link href="/" className="inline-block bg-primary text-white font-bold py-3 px-6 rounded-xl hover:bg-secondary transition-colors">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  // Calculate difference in milliseconds
  const diffTime = now.getTime() - linkGeneratedAt.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays > 7) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-sm border border-slate-100">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Link Kadaluwarsa</h1>
          <p className="text-slate-500 mb-6">Link testimoni ini sudah kadaluwarsa (maksimal 7 hari setelah proyek selesai). Hubungi kami jika Anda masih ingin memberikan ulasan!</p>
          <Link href="/" className="inline-block bg-primary text-white font-bold py-3 px-6 rounded-xl hover:bg-secondary transition-colors">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  // 3. check if already filled
  const { data: existingTestimonial } = await supabaseAdmin
    .from("store_testimonials")
    .select("id")
    .eq("order_id", id)
    .maybeSingle();

  if (existingTestimonial) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-sm border border-slate-100">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Testimoni Diterima</h1>
          <p className="text-slate-500 mb-6">Anda sudah pernah mengirimkan testimoni untuk proyek ini. Terima kasih atas ulasan Anda!</p>
          <Link href="/" className="inline-block bg-primary text-white font-bold py-3 px-6 rounded-xl hover:bg-secondary transition-colors">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  // Generate nama klien dari form data
  let fd: any = {};
  try {
    fd = typeof order.form_data === 'string' ? JSON.parse(order.form_data) : (order.form_data || {});
  } catch (e) {}
  
  const clientName = fd.customer_name || fd["Client Name"] || "Kangjasa Client";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl mb-3">
            Beri Penilaian
          </h1>
          <p className="text-lg text-slate-500 max-w-xl mx-auto">
            Bagaimana pengalaman Anda bekerja sama dengan kami? Ulasan Anda sangat berarti bagi kami.
          </p>
        </div>
        
        <SubmitTestimonialClient order={order} clientName={clientName} />
      </div>
    </div>
  );
}
