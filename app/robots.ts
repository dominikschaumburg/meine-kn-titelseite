import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/analytics/'],
      },
    ],
    sitemap: 'https://kn.meine-titelseite.de/sitemap.xml',
  }
}
