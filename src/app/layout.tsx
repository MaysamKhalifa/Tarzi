import type { Metadata, Viewport } from "next"
import "./globals.css"
import { AppProvider } from "@/lib/context/AppContext"

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AppProvider>
          {/* App shell — centers the mobile UI on desktop */}
          <div id="app-shell">
            {children}
          </div>
        </AppProvider>
      </body>
    </html>
  )
}
