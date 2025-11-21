"use client";

import AuthGuard from "@/components/auth/AuthGuard";
import Sidebar from "@/components/super-admin/Sidebar";
import { useState } from "react";

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <AuthGuard requiredRole="SUPER_ADMIN" redirectTo="/login">
      <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/20 to-teal-50/30">
        {/* Sidebar */}
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Main Area */}
        <div className="flex flex-col flex-1 transition-all">
          {/* Top Header */}
          <header className="sticky top-0 bg-white/90 backdrop-blur-md shadow-sm px-6 py-4 flex justify-between items-center z-20">
            <h1 className="text-xl font-semibold text-gray-900">Super Admin Dashboard</h1>
            <button
              onClick={() => (window.location.href = "/login")}
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition"
            >
              Logout
            </button>
          </header>

          {/* Page Content */}
          <main className="p-6">
            <div className="max-w-7xl mx-auto w-full">{children}</div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
