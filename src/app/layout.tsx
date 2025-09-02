import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers"; // 👈 wrapper cliente

// Configurar Open Sans
const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"], // agrega más pesos si los necesitas
  variable: "--font-open-sans",
});

export const metadata: Metadata = {
  title: "Fundecodes Digital",
  description: "Sistema administrativo y página informativa",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${openSans.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
