import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" })

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
}

export const metadata: Metadata = {
  metadataBase: new URL("https://mvmate.vercel.app"),
  title: {
    default: "MoveMate - Smart Moving Inventory Manager",
    template: "%s | MoveMate",
  },
  description:
    "Simplify your move with AI-powered inventory management. Snap photos to auto-identify items, track boxes, and stay organized throughout your relocation.",
  keywords: [
    "moving inventory",
    "moving app",
    "packing list",
    "relocation tracker",
    "AI inventory",
    "moving checklist",
    "home inventory",
    "moving organization",
  ],
  authors: [{ name: "MoveMate" }],
  creator: "MoveMate",
  publisher: "MoveMate",
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://mvmate.vercel.app",
    siteName: "MoveMate",
    title: "MoveMate - Smart Moving Inventory Manager",
    description:
      "Simplify your move with AI-powered inventory management. Snap photos to auto-identify items, track boxes, and stay organized.",
  },
  twitter: {
    card: "summary_large_image",
    title: "MoveMate - Smart Moving Inventory Manager",
    description:
      "Simplify your move with AI-powered inventory management. Snap photos to auto-identify items and stay organized.",
    creator: "@movemate",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "MoveMate",
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "msapplication-TileColor": "#000000",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geist.variable} ${geistMono.variable} font-sans antialiased`}>
        {children}
        <Analytics />
        <Toaster />
      </body>
    </html>
  )
}
