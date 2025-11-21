'use client'

import AuthGuard from '@/components/auth/AuthGuard'
import { Button } from "@/components/ui/button"
import { Home, Users, Settings, BarChart2, LogOut } from "lucide-react"
import Link from "next/link"

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const navigation = [
    { name: "Dashboard", icon: Home, href: "/super-admin" },
    { name: "Societies", icon: Users, href: "/super-admin/societies" },
    { name: "Automation", icon: Settings, href: "/super-admin/automation" },
    { name: "Analytics", icon: BarChart2, href: "/super-admin/analytics" },
  ]

  return (
    <AuthGuard requiredRole="SUPER_ADMIN" redirectTo="/login">
      <div className="flex h-screen bg-gray-50">
        
        {/* Sidebar */}
        <div className="w-64 bg-white border-r shadow-md p-4 space-y-4">
          <h2 className="text-xl font-bold">SuperAdmin</h2>

          <nav className="space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-2 p-2 rounded-md text-gray-700 hover:bg-gray-200 hover:text-black transition"
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="absolute bottom-4">
            <form action="/logout" method="POST">
              <Button variant="destructive" type="submit" className="w-full flex items-center gap-2">
                <LogOut className="w-4 h-4" /> Logout
              </Button>
            </form>
          </div>
        </div>

        {/* Content Area */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </AuthGuard>
  )
}
