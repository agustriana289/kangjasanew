import { MetadataRoute } from 'next'
import { createClient } from '@/utils/supabase/server'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.kanglogo.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()

  const [
    { data: services },
    { data: blogs },
    { data: pages },
  ] = await Promise.all([
    supabase
      .from('store_services')
      .select('slug, updated_at')
      .eq('is_published', true),
    supabase
      .from('blogs')
      .select('slug, updated_at')
      .eq('is_published', true),
    supabase
      .from('pages')
      .select('slug, updated_at')
      .eq('is_published', true),
  ])

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${BASE_URL}/services`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/portfolios`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/testimonials`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/promo`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ]

  const serviceRoutes: MetadataRoute.Sitemap = (services ?? []).map((item) => ({
    url: `${BASE_URL}/services/${item.slug}`,
    lastModified: item.updated_at ? new Date(item.updated_at) : new Date(),
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  const blogRoutes: MetadataRoute.Sitemap = (blogs ?? []).map((item) => ({
    url: `${BASE_URL}/blog/${item.slug}`,
    lastModified: item.updated_at ? new Date(item.updated_at) : new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  const pageRoutes: MetadataRoute.Sitemap = (pages ?? []).map((page) => ({
    url: `${BASE_URL}/pages/${page.slug}`,
    lastModified: page.updated_at ? new Date(page.updated_at) : new Date(),
    changeFrequency: 'monthly',
    priority: 0.5,
  }))

  return [...staticRoutes, ...serviceRoutes, ...blogRoutes, ...pageRoutes]
}
