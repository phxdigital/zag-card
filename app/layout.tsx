import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Zag NFC - Cartão de Visita Digital Inteligente",
  description:
    "Transforme conexões em oportunidades com o cartão de visita digital NFC. Compartilhe suas informações profissionais com um simples toque.",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
