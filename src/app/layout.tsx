import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import MobileNav from '../components/layout/MobileNav'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'MYFC - My Face Coach',
  description: 'Daily facial fitness workouts for everyone',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-neutral-50`}>
        <main className="pb-16 md:pb-0">
          {children}
        </main>
        <MobileNav />
      </body>
    </html>
  )
} 