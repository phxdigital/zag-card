import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://zagnfc.com.br'),
  title: "Zag NFC - Cartão de Visita Digital Inteligente",
  description:
    "Transforme conexões em oportunidades com o cartão de visita digital NFC. Compartilhe suas informações profissionais com um simples toque.",
  generator: "v0.app",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Zag NFC - Cartão de Visita Digital Inteligente",
    description:
      "Transforme conexões em oportunidades com o cartão de visita digital NFC. Compartilhe suas informações profissionais com um simples toque.",
    images: [
      {
        url: "/thumbnail.png",
        width: 1200,
        height: 630,
        alt: "Zag NFC - Cartão de Visita Digital",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zag NFC - Cartão de Visita Digital Inteligente",
    description:
      "Transforme conexões em oportunidades com o cartão de visita digital NFC. Compartilhe suas informações profissionais com um simples toque.",
    images: ["/thumbnail.png"],
  },
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
        <SpeedInsights />
      </body>
    </html>
  );
}
