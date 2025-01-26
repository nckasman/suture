import { TopBar } from "@/components/top-bar"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"
import { Poppins } from "next/font/google"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-poppins",
})

export const metadata = {
  title: "Suture - AI Video Editor",
  description: "Edit your videos using AI-powered transcripts",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} font-sans`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          <TopBar />
          <main className="pt-14">{children}</main>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}

