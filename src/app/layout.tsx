import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'NutriTrack',
  description: 'Seguimiento nutricional Team Pantera',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${plusJakartaSans.variable} h-full antialiased`}>
      <body className="min-h-full bg-background text-foreground">{children}</body>
    </html>
  )
}
