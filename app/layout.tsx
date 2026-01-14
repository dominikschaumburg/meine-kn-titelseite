import type { Metadata, Viewport } from 'next'
import './globals.css'
import { loadConfig } from '@/lib/config'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1.0,
  userScalable: false
}

export async function generateMetadata(): Promise<Metadata> {
  const config = await loadConfig()

  const title = config.whiteLabel.metaTitle || 'Meine Titelseite'
  const description = config.whiteLabel.metaDescription || 'Erstelle deine personalisierte Titelseite'
  const shareImage = config.whiteLabel.socialShareImage || '/preview.gif'

  return {
    title,
    description,
    keywords: ['Titelseite', 'Selfie', 'personalisiert'],
    applicationName: title,
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://kn.meine-titelseite.de'),
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    other: {
      'mobile-web-app-capable': 'yes'
    },
    manifest: '/site.webmanifest',
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: 'any' },
        { url: '/favicon.svg', type: 'image/svg+xml' },
        { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' }
      ],
      apple: [
        { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
      ]
    },
    openGraph: {
      type: 'website',
      locale: 'de_DE',
      url: process.env.NEXT_PUBLIC_APP_URL || 'https://kn.meine-titelseite.de',
      siteName: title,
      title,
      description,
      images: [
        {
          url: shareImage,
          width: 1200,
          height: 630,
          alt: `${title} Vorschau`
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [shareImage]
    }
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de">
      <head>
        <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body>{children}</body>
    </html>
  )
}
