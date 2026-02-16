import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Inter } from 'next/font/google'
import './globals.css'
import Link from 'next/link'
import { MobileNav } from '@/components/MobileNav'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Scheme Saathi | Find Government Schemes',
  description: 'AI-powered platform to find and apply for Indian government schemes with voice support.',
}

import { Toaster } from "@/components/ui/toaster"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${jakarta.variable} ${inter.variable} font-sans bg-bg-warm min-h-screen flex flex-col`}>
        <nav className="sticky top-0 z-50 w-full glass border-b border-border/40">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="h-8 w-8 bg-gradient-to-br from-brand-saffron to-brand-teal rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:shadow-brand-saffron/20 transition-all">S</div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-saffron to-brand-teal">Scheme Saathi</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex gap-8 text-sm font-medium text-muted-foreground">
              <Link href="/" className="hover:text-brand-saffron transition-colors">Home</Link>
              <Link href="/check-eligibility" className="hover:text-brand-saffron transition-colors">Check Eligibility</Link>
              <Link href="/schemes" className="hover:text-brand-saffron transition-colors">Schemes</Link>
              <Link href="/csc/dashboard" className="hover:text-brand-saffron transition-colors">CSC Portal</Link>
            </div>

            {/* Mobile Nav */}
            <div className="md:hidden">
              <MobileNav />
            </div>
          </div>
        </nav>
        <main className="flex-1">
          {children}
        </main>
        <Toaster />
        <footer className="bg-white border-t border-border/40 py-12 mt-auto">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-6 w-6 bg-gradient-to-br from-brand-saffron to-brand-teal rounded flex items-center justify-center text-white font-bold text-xs">S</div>
                  <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-saffron to-brand-teal">Scheme Saathi</span>
                </div>
                <p className="text-muted-foreground text-sm max-w-xs">
                  Bridging the gap between citizens and government benefits through AI and voice technology.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Quick Links</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><Link href="/schemes" className="hover:text-brand-saffron">Browse Schemes</Link></li>
                  <li><Link href="/check-eligibility" className="hover:text-brand-saffron">Check Eligibility</Link></li>
                  <li><Link href="/csc/dashboard" className="hover:text-brand-saffron">CSC Login</Link></li>
                </ul>
              </div>
              <div>
                {/* <h4 className="font-semibold text-gray-900 mb-4">Support</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="#" className="hover:text-brand-saffron">Help Center</a></li>
                  <li><a href="#" className="hover:text-brand-saffron">Contact Us</a></li>
                  <li><a href="#" className="hover:text-brand-saffron">Privacy Policy</a></li>
                </ul> */}
              </div>
            </div>
            <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-xs text-muted-foreground">© 2026 Scheme Saathi. All rights reserved.</p>
              <div className="flex items-center gap-2 text-xs font-medium text-gray-500 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                <span>Made with</span>
                <span className="text-red-500">❤️</span>
                <span>in India 🇮🇳</span>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
