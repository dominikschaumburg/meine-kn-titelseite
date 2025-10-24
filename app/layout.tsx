import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Meine KN-Titelseite',
  description: 'Erstelle deine personalisierte KN-Titelseite mit einem Selfie. Nimm ein Foto auf und erhalte deine individuelle Kieler Nachrichten Titelseite zum Teilen.',
  keywords: ['Meine', 'KN', 'Kieler Nachrichten', 'Titelseite', 'Selfie', 'personalisiert'],
  authors: [{ name: 'Kieler Nachrichten' }],
  applicationName: 'Meine KN-Titelseite',
  metadataBase: new URL('https://kn.meine-titelseite.de'),
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
    url: 'https://kn.meine-titelseite.de',
    siteName: 'Meine KN-Titelseite',
    title: 'Meine KN-Titelseite',
    description: 'Erstelle deine personalisierte KN-Titelseite mit einem Selfie.',
    images: [
      {
        url: '/assets/share-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Meine KN-Titelseite Vorschau'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Meine KN-Titelseite',
    description: 'Erstelle deine personalisierte KN-Titelseite mit einem Selfie.',
    images: ['/assets/share-image.jpg']
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1.0,
  userScalable: false
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