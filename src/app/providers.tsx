'use client'

import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/components/auth/SupabaseProvider"
import { ReactNode, useEffect, useState } from "react"

/**
 * ✅ This provider ensures all browser-only logic (localStorage, session) 
 * runs only on the client — not during server rendering.
 */

export default function Providers({ children }: { children: ReactNode }) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    // Wait until component mounts on client
    setIsClient(true)
  }, [])

  if (!isClient) {
    // Avoid rendering any localStorage/Session components on server
    return null
  }

  return (
    <SessionProvider>
      <AuthProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </AuthProvider>
    </SessionProvider>
  )
}
