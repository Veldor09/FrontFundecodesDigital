import './globals.css'
import type { Metadata } from 'next'
import { Open_Sans } from 'next/font/google'
import { Toaster } from 'react-hot-toast'

const openSans = Open_Sans({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FUNDECODES',
  description: 'Plataforma administrativa',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={openSans.className}>
        {children}
        {/* Toaster global para notificaciones */}
        <Toaster position="top-right" />
      </body>
    </html>
  )
}