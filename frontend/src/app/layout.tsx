import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'

export const metadata: Metadata = {
  title: 'AirWeight - Smart Baggage Credit Management',
  description: 'Transform unused baggage weight into digital credits. Save money on excess baggage fees.',
  keywords: ['baggage', 'travel', 'airline', 'credits', 'weight management', 'smart travel'],
  authors: [{ name: 'Kais Oueriemmi' }],
  openGraph: {
    title: 'AirWeight - Smart Baggage Credit Management',
    description: 'Transform unused baggage weight into digital credits',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  )
}
