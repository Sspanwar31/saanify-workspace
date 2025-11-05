'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import LoadingSpinner from '@/components/ui/loading-spinner'

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: 'SUPER_ADMIN' | 'CLIENT'
  redirectTo?: string
}

export default function AuthGuard({ children, requiredRole, redirectTo = '/login' }: AuthGuardProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = document.cookie
          .split('; ')
          .find(row => row.startsWith('auth-token='))
          ?.split('=')[1]

        if (!token) {
          toast.error('Please login to continue')
          router.push(redirectTo)
          return
        }

        // Verify token with server
        const response = await fetch('/api/auth/check-session', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (!response.ok) {
          throw new Error('Invalid token')
        }

        const data = await response.json()
        
        // Check role if required
        if (requiredRole && data.user.role !== requiredRole) {
          toast.error('Access denied. Insufficient privileges.')
          router.push(redirectTo)
          return
        }

        setIsAuthenticated(true)
      } catch (error) {
        console.error('Auth check failed:', error)
        toast.error('Session expired. Please login again.')
        router.push(redirectTo)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router, requiredRole, redirectTo])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect
  }

  return <>{children}</>
}
