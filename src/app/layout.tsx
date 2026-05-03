import type { Metadata, Viewport } from "next"
import "./globals.css"
import { AppProvider } from "@/lib/context/AppContext"
import { LanguageProvider } from "@/lib/context/LanguageContext"

export const metadata: Metadata = {
  title: "Tarzi – Your Tailor, Your Style",
  description: "Connect with skilled Dubai tailors for alterations, bespoke clothing, and upcycling.",
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
