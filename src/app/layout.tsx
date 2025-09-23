import "./globals.css";
import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import ClientProviders from "./ClientProviders";

const openSans = Open_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FUNDECODES",
  description: "Plataforma administrativa",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={openSans.className} suppressHydrationWarning>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
