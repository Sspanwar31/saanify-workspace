'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import LoadingSpinner from '@/components/ui/loading-spinner'

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: 'SUPER_ADMIN' | 'CLIENT' | 'SUPERADMIN'
  redirectTo?: string
}

export default function AuthGuard({ children, requiredRole, redirectTo = '/login' }: AuthGuardProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // ✅ FIX: document.cookie हटा दिया (क्योंकि HttpOnly cookie JS नहीं पढ़ सकता)
        // सीधा API कॉल करें, Browser अपने आप Cookie भेजेगा।
        
        const response = await fetch('/api/auth/check-session', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          cache: 'no-store' // Cache se bachein
        })

        if (!response.ok) {
          throw new Error('Not authenticated')
        }

        const data = await response.json()
        
        if (!data.authenticated || !data.user) {
          throw new Error('Invalid session')
        }

        // ✅ FIX: Role Checking Logic (Flexible)
        if (requiredRole) {
          const userRole = String(data.user.role).toUpperCase(); // Role ko bada (uppercase) karein
          
          // Agar SUPER_ADMIN chahiye
          if (requiredRole === 'SUPER_ADMIN' || requiredRole === 'SUPERADMIN') {
            // Check karein ki role me 'SUPER' aur 'ADMIN' dono shabd hain
            if (!userRole.includes('SUPER') || !userRole.includes('ADMIN')) {
              toast.error('Access denied. Super Admin rights required.')
              router.push('/not-authorized')
              return
            }
          } 
          // Baki roles ke liye exact match
          else if (userRole !== requiredRole) {
            toast.error('Access denied. Insufficient privileges.')
            router.push('/not-authorized') // RedirectTo ki jagah not-authorized safe hai
            return
          }
        }

        setIsAuthenticated(true)
      } catch (error) {
        // console.error('Auth check failed:', error)
        // Toast hata diya taaki user pareshan na ho agar wo bas refresh kar raha hai
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
    return null // Redirect ho raha hai
  }

  return <>{children}</>
}
