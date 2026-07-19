import type { Metadata } from "next"
import { Bricolage_Grotesque, Source_Sans_3, Geist_Mono } from "next/font/google"

import { cn } from "@/lib/utils"

import "./globals.css"

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
})

const sans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-sans",
})

const mono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
})

export const metadata: Metadata = {
  title: "Event Backdrop — Sine Wave Image Processor",
  description:
    "Upload a photo and apply a retro sine-wave scan-line duotone for event backdrops.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "dark h-full antialiased",
        display.variable,
        sans.variable,
        mono.variable,
        "font-sans"
      )}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  )
}
