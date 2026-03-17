import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import PromoContent from "./PromoContent";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getPromo(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("promos")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();
  return data;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const promo = await getPromo(slug);
  if (!promo) return { title: "Promo Not Found" };
  return {
    title: promo.title,
    description: promo.excerpt,
    openGraph: {
      title: promo.title,
      description: promo.excerpt,
      images: promo.cover_image ? [{ url: promo.cover_image }] : [],
    },
  };
}

export default async function PromoDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const promo = await getPromo(slug);
  if (!promo) notFound();

  const supabase = await createClient();
  const { data: settings } = await supabase
    .from("settings")
    .select("phone_number")
    .eq("id", 1)
    .single();

  const waNumber = settings?.phone_number ? settings.phone_number.replace(/\D/g, "") : "";

  return <PromoContent promo={promo} waNumber={waNumber} />;
}
