'use client'

import AuthGuard from '@/components/auth/AuthGuard'

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // Role check 'SUPER_ADMIN' pass kar rahe hain
    <AuthGuard requiredRole="SUPER_ADMIN" redirectTo="/login">
      {children}
    </AuthGuard>
  )
}
