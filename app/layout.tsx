import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { AuthProvider } from "@/lib/auth"
import { CollaborationProvider } from "@/lib/collaboration"
import { ProjectProvider } from "@/lib/projects"
import { Toaster } from "@/components/ui/sonner"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { ThemeProvider } from '@/components/theme-provider'
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sketch-MQ - Professional Collaborative Drawing",
  description: "Professional sketch and drawing application with real-time collaboration, advanced tools, and seamless user experience.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="scroll-smooth antialiased" suppressHydrationWarning>
      <body className={`font-sans ${geistSans.variable} ${geistMono.variable} min-h-screen flex flex-col`}>

        <Suspense fallback={<div>Loading...</div>}>
          <ThemeProvider enableSystem attribute="class" defaultTheme="system" disableTransitionOnChange>
            <AuthProvider>
              <ProjectProvider>
                <CollaborationProvider>
                  <Header />
                  <main className="flex-1">{children}</main>
                  <Footer />
                  <Toaster />
                </CollaborationProvider>
              </ProjectProvider>
            </AuthProvider>
          </ThemeProvider>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}



