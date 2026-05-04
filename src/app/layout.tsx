import type { Metadata, Viewport } from "next"
import "./globals.css"
import { AppProvider } from "@/lib/context/AppContext"
import { LanguageProvider } from "@/lib/context/LanguageContext"

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://tarzi-xi.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: "Tarzi – Your Tailor, Your Style",
  description: "Connect with skilled Dubai tailors for alterations, bespoke clothing from scratch, and garment upcycling. Fast, easy, beautiful.",
  applicationName: "Tarzi",
  keywords: ["tailor", "Dubai", "alterations", "bespoke", "upcycling", "fashion", "clothing", "tailoring"],
  authors: [{ name: "Tarzi" }],
  openGraph: {
    type: "website",
    url: APP_URL,
    siteName: "Tarzi",
    title: "Tarzi – Your Tailor, Your Style",
    description: "Connect with skilled Dubai tailors for alterations, bespoke clothing, and upcycling. Book in seconds.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Tarzi – Your Tailor, Your Style",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tarzi – Your Tailor, Your Style",
    description: "Connect with skilled Dubai tailors for alterations, bespoke clothing, and upcycling. Book in seconds.",
    images: ["/opengraph-image"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "32x32" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
}

export const viewport: Viewport = {
  themeColor: "#e91e8c",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <head>
        {/* Fallback OG tags for older crawlers (WhatsApp/iMessage use these) */}
        <meta property="og:image" content={`${APP_URL}/opengraph-image`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:title" content="Tarzi – Your Tailor, Your Style" />
        <meta property="og:description" content="Connect with skilled Dubai tailors for alterations, bespoke clothing, and upcycling. Book in seconds." />
        <meta property="og:url" content={APP_URL} />
        <meta property="og:site_name" content="Tarzi" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={`${APP_URL}/opengraph-image`} />
      </head>
      <body>
        <LanguageProvider>
          <AppProvider>
            <div id="app-shell">
              {children}
            </div>
          </AppProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
