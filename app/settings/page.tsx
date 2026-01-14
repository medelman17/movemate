"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft, MapPin, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SettingsPage() {
  const router = useRouter()

  const settingsPages = [
    {
      title: "Locations",
      description: "Manage rooms and storage areas",
      icon: MapPin,
      href: "/settings/locations",
      iconColor: "text-blue-600",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Categories",
      description: "Organize items by category",
      icon: Tag,
      href: "/settings/categories",
      iconColor: "text-purple-600",
      bgColor: "bg-purple-500/10",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/")}
              className="shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back to inventory</span>
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold">Settings</h1>
              <p className="text-sm text-muted-foreground">
                Manage your MoveMate preferences
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 py-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {settingsPages.map((page) => {
            const Icon = page.icon
            return (
              <Card
                key={page.href}
                className="cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => router.push(page.href)}
              >
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className={`rounded-lg ${page.bgColor} p-3 shrink-0`}>
                      <Icon className={`h-6 w-6 ${page.iconColor}`} />
                    </div>
                    <div className="flex-1">
                      <CardTitle>{page.title}</CardTitle>
                      <CardDescription className="mt-1.5">
                        {page.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" className="w-full justify-start">
                    Manage {page.title.toLowerCase()} →
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </main>
    </div>
  )
}
