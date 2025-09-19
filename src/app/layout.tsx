// src/app/layout.tsx  (SERVER COMPONENT — sin "use client")
import "./globals.css";
import { Open_Sans } from "next/font/google";
import Providers from "./providers"; // <- envolverá clientes como Toaster

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      {/* suppressHydrationWarning por si alguna extensión mete atributos en <body> */}
      <body className={openSans.className} suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
