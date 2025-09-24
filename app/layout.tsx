import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Meine KN Titelseite',
  description: 'Erstelle deine personalisierte KN Titelseite',
  viewport: 'width=device-width, initial-scale=1.0, user-scalable=no'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  )
}