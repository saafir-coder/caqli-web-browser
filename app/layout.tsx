import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Caqli AI — AI Coding for Somali Developers',
  description: 'Build software with AI. Free access to powerful models.',
  verification: {
    google: '8-Gsr51oE82tvBuvu5ernU2PJ4Wm-ZqVG1eXuxF5X3A',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-zinc-950 text-zinc-100 min-h-screen`}>
        {children}
      </body>
    </html>
  )
}
