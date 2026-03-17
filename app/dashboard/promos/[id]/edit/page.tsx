"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Loader2, Image as ImageIcon, Type, Globe, CheckCircle, Clock, Tag, Link as LinkIcon, CalendarClock } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/components/ToastProvider";
import RichTextEditor from "@/components/RichTextEditor";
import ImageUploader from "@/components/admin/ImageUploader";

function toLocalDatetimeValue(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function EditPromoPage() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();
  const { showToast } = useToast();
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    cover_image: "",
    promo_code: "",
    order_link: "",
    expired_at: "",
    is_published: false,
  });

  const fetchPromo = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("promos")
        .select("*")
        .eq("id", params.id)
        .single();
      if (error) throw error;
      if (data) {
        setFormData({
          title: data.title,
          slug: data.slug,
          excerpt: data.excerpt || "",
          content: data.content || "",
          cover_image: data.cover_image || "",
          promo_code: data.promo_code || "",
          order_link: data.order_link || "",
          expired_at: toLocalDatetimeValue(data.expired_at),
          is_published: data.is_published,
        });
      }
    } catch (error: any) {
      showToast(error.message, "error");
      router.push("/dashboard/promos");
    } finally {
      setFetching(false);
    }
  }, [params.id, supabase, showToast, router]);

  useEffect(() => {
    fetchPromo();
  }, [fetchPromo]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase
        .from("promos")
        .update({
          title: formData.title,
          slug: formData.slug,
          excerpt: formData.excerpt,
          content: formData.content,
          cover_image: formData.cover_image,
          promo_code: formData.promo_code || null,
          order_link: formData.order_link || null,
          expired_at: formData.expired_at ? new Date(formData.expired_at).toISOString() : null,
          is_published: formData.is_published,
          published_at: formData.is_published ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", params.id);
      if (error) throw error;
      showToast("Promo berhasil diperbarui!", "success");
      router.push("/dashboard/promos");
    } catch (error: any) {
      showToast(error.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full bg-white border border-slate-200 text-slate-900 text-sm font-medium rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-secondary p-3 transition-all outline-none";

  if (fetching) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="pt-6 px-4 pb-16 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Link href="/dashboard/promos" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar
        </Link>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-primary hover:bg-secondary text-white text-sm font-bold px-6 py-2.5 rounded-xl shadow-sm shadow-indigo-200 transition-colors disabled:opacity-60"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Perbarui Promo
        </button>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-5">
          <div className="bg-white shadow-sm ring-1 ring-slate-100 rounded-2xl p-6 space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Judul Promo</label>
              <div className="relative">
                <Type className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  required
                  value={formData.title}
                  onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Judul promo..."
                  className={`${inputClass} pl-10 text-lg font-semibold placeholder:font-normal placeholder:text-slate-300`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Deskripsi Singkat</label>
              <textarea
                rows={2}
                value={formData.excerpt}
                onChange={e => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                placeholder="Ringkasan singkat promo ini..."
                className={`${inputClass} resize-none`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Konten</label>
              <RichTextEditor
                value={formData.content}
                onChange={content => setFormData(prev => ({ ...prev, content }))}
              />
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-white shadow-sm ring-1 ring-slate-100 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <ImageIcon className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Cover Promo</h3>
            </div>
            <ImageUploader
              label="Gambar Cover"
              value={formData.cover_image}
              onChange={(url) => setFormData(prev => ({ ...prev, cover_image: url }))}
              folder="promos"
            />
          </div>

          <div className="bg-white shadow-sm ring-1 ring-slate-100 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Tag className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Kode & Link</h3>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Kode Promo</label>
              <div className="relative">
                <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  value={formData.promo_code}
                  onChange={e => setFormData(prev => ({ ...prev, promo_code: e.target.value.toUpperCase() }))}
                  className={`${inputClass} pl-10 font-bold tracking-widest`}
                  placeholder="contoh: HEMAT50"
                />
              </div>
              <p className="text-xs text-slate-400 mt-1.5">Kosongkan jika tidak ada kode</p>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Link Order (opsional)</label>
              <div className="relative">
                <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  value={formData.order_link}
                  onChange={e => setFormData(prev => ({ ...prev, order_link: e.target.value }))}
                  className={`${inputClass} pl-10`}
                  placeholder="https://wa.me/... atau link lainnya"
                />
              </div>
              <p className="text-xs text-slate-400 mt-1.5">Jika kosong, akan diarahkan ke WA default</p>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Slug URL</label>
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-3">
                <span className="text-slate-400 text-sm font-medium shrink-0">/promo/</span>
                <input
                  required
                  value={formData.slug}
                  onChange={e => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  className="bg-transparent border-none p-0 text-sm font-bold text-primary focus:ring-0 w-full outline-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-white shadow-sm ring-1 ring-slate-100 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <CalendarClock className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Waktu Kadaluarsa</h3>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Berakhir Pada</label>
              <input
                type="datetime-local"
                value={formData.expired_at}
                onChange={e => setFormData(prev => ({ ...prev, expired_at: e.target.value }))}
                className={inputClass}
              />
              <p className="text-xs text-slate-400 mt-1.5">Kosongkan jika promo tidak memiliki batas waktu</p>
            </div>
          </div>

          <div className="bg-white shadow-sm ring-1 ring-slate-100 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <CheckCircle className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Penerbitan</h3>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${formData.is_published ? "bg-emerald-50 text-emerald-600" : "bg-slate-200 text-slate-400"}`}>
                  {formData.is_published ? <Globe className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{formData.is_published ? "Diterbitkan" : "Draf"}</p>
                  <p className="text-xs text-slate-400">{formData.is_published ? "Terlihat oleh publik" : "Belum diterbitkan"}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, is_published: !prev.is_published }))}
                className={`w-11 h-6 rounded-full relative transition-all ${formData.is_published ? "bg-primary" : "bg-slate-300"}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${formData.is_published ? "right-1" : "left-1"}`} />
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
