'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Eye, EyeOff, Mail, Lock, Shield, Users, Crown, AlertCircle, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'

export default function LoginPage() {
  const [clientData, setClientData] = useState({
    email: 'client@saanify.com',
    password: 'client123',
    rememberMe: false
  })
  const [adminData, setAdminData] = useState({
    email: 'superadmin@saanify.com',
    password: 'admin123',
    rememberMe: false
  })
  const [showClientPassword, setShowClientPassword] = useState(false)
  const [showAdminPassword, setShowAdminPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [activeTab, setActiveTab] = useState('client')

  const validateClientForm = () => {
    const newErrors: Record<string, string> = {}

    if (!clientData.email.trim()) {
      newErrors.clientEmail = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(clientData.email)) {
      newErrors.clientEmail = 'Email is invalid'
    }

    if (!clientData.password) {
      newErrors.clientPassword = 'Password is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateAdminForm = () => {
    const newErrors: Record<string, string> = {}

    if (!adminData.email.trim()) {
      newErrors.adminEmail = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(adminData.email)) {
      newErrors.adminEmail = 'Email is invalid'
    }

    if (!adminData.password) {
      newErrors.adminPassword = 'Password is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleClientLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateClientForm()) {
      return
    }

    setIsLoading(true)

    try {
      console.log('Attempting client login with:', clientData.email)
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: clientData.email,
          password: clientData.password,
          userType: 'client',
          rememberMe: clientData.rememberMe
        }),
      })

      console.log('Response status:', response.status)
      const data = await response.json()
      console.log('Response data:', data)

      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }
      
      toast.success('🎉 Login successful!', {
        description: 'Welcome back to Saanify!',
        duration: 3000,
      })

      // Redirect to client dashboard
      setTimeout(() => {
        window.location.href = '/client/dashboard'
      }, 1500)

    } catch (error: any) {
      console.error('Login error:', error)
      toast.error('❌ Login failed', {
        description: error.message || 'Invalid email or password. Please try again.',
        duration: 3000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateAdminForm()) {
      return
    }

    setIsLoading(true)

    try {
      console.log('Attempting admin login with:', adminData.email)
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: adminData.email,
          password: adminData.password,
          userType: 'admin',
          rememberMe: adminData.rememberMe
        }),
      })

      console.log('Response status:', response.status)
      const data = await response.json()
      console.log('Response data:', data)

      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }
      
      toast.success('🎉 Admin login successful!', {
        description: 'Welcome to Saanify Admin Panel',
        duration: 3000,
      })

      // Redirect to admin dashboard
      setTimeout(() => {
        window.location.href = '/admin/dashboard'
      }, 1500)

    } catch (error: any) {
      console.error('Admin login error:', error)
      toast.error('❌ Admin login failed', {
        description: error.message || 'Invalid admin credentials. Please try again.',
        duration: 3000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClientInputChange = (field: string, value: string | boolean) => {
    setClientData(prev => ({ ...prev, [field]: value }))
    if (errors[`client${field.charAt(0).toUpperCase() + field.slice(1)}`]) {
      setErrors(prev => ({ ...prev, [`client${field.charAt(0).toUpperCase() + field.slice(1)}`]: '' }))
    }
  }

  const handleAdminInputChange = (field: string, value: string | boolean) => {
    setAdminData(prev => ({ ...prev, [field]: value }))
    if (errors[`admin${field.charAt(0).toUpperCase() + field.slice(1)}`]) {
      setErrors(prev => ({ ...prev, [`admin${field.charAt(0).toUpperCase() + field.slice(1)}`]: '' }))
    }
  }

  // Quick demo login functions
  const handleQuickClientLogin = () => {
    setClientData({
      email: 'client@saanify.com',
      password: 'client123',
      rememberMe: false
    })
    setActiveTab('client')
    setTimeout(() => {
      document.getElementById('clientLoginForm')?.requestSubmit()
    }, 100)
  }

  const handleQuickAdminLogin = () => {
    setAdminData({
      email: 'superadmin@saanify.com',
      password: 'admin123',
      rememberMe: false
    })
    setActiveTab('admin')
    setTimeout(() => {
      document.getElementById('adminLoginForm')?.requestSubmit()
    }, 100)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-950 dark:to-blue-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-6"
        >
          <Link 
            href="/"
            className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </motion.div>

        <Card className="shadow-2xl border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400 mt-2">
                Sign in to your Saanify account
              </CardDescription>
            </motion.div>
          </CardHeader>

          <CardContent>
            {/* Quick Demo Buttons */}
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-3">Quick Demo Access</h3>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={handleQuickClientLogin}
                  variant="outline"
                  size="sm"
                  className="text-xs bg-white dark:bg-gray-800 border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                >
                  <Users className="w-3 h-3 mr-1" />
                  Client Demo
                </Button>
                <Button
                  onClick={handleQuickAdminLogin}
                  variant="outline"
                  size="sm"
                  className="text-xs bg-white dark:bg-gray-800 border-amber-200 dark:border-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                >
                  <Shield className="w-3 h-3 mr-1" />
                  Admin Demo
                </Button>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="client" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Client
                </TabsTrigger>
                <TabsTrigger value="admin" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Admin
                </TabsTrigger>
              </TabsList>

              {/* Client Login */}
              <TabsContent value="client">
                <motion.form
                  id="clientLoginForm"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                  onSubmit={handleClientLogin}
                  className="space-y-4"
                >
                  <div>
                    <Label htmlFor="clientEmail">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="clientEmail"
                        type="email"
                        placeholder="john.doe@company.com"
                        value={clientData.email}
                        onChange={(e) => handleClientInputChange('email', e.target.value)}
                        className={`pl-10 ${errors.clientEmail ? 'border-red-500' : ''}`}
                        disabled={isLoading}
                      />
                    </div>
                    {errors.clientEmail && (
                      <p className="text-sm text-red-500 mt-1 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {errors.clientEmail}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="clientPassword">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="clientPassword"
                        type={showClientPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={clientData.password}
                        onChange={(e) => handleClientInputChange('password', e.target.value)}
                        className={`pl-10 pr-10 ${errors.clientPassword ? 'border-red-500' : ''}`}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowClientPassword(!showClientPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showClientPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.clientPassword && (
                      <p className="text-sm text-red-500 mt-1 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {errors.clientPassword}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="clientRemember"
                        checked={clientData.rememberMe}
                        onChange={(e) => handleClientInputChange('rememberMe', e.target.checked)}
                        className="rounded border-gray-300"
                        disabled={isLoading}
                      />
                      <Label htmlFor="clientRemember" className="text-sm text-gray-600 dark:text-gray-400">
                        Remember me
                      </Label>
                    </div>
                    <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-500">
                      Forgot password?
                    </Link>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Signing In...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Sign In as Client
                      </div>
                    )}
                  </Button>
                </motion.form>
              </TabsContent>

              {/* Admin Login */}
              <TabsContent value="admin">
                <motion.form
                  id="adminLoginForm"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                  onSubmit={handleAdminLogin}
                  className="space-y-4"
                >
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                      <Crown className="h-4 w-4" />
                      <span className="text-sm font-medium">Administrator Access</span>
                    </div>
                    <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                      Only authorized administrators can access this panel
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="adminEmail">Admin Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="adminEmail"
                        type="email"
                        placeholder="admin@saanify.com"
                        value={adminData.email}
                        onChange={(e) => handleAdminInputChange('email', e.target.value)}
                        className={`pl-10 ${errors.adminEmail ? 'border-red-500' : ''}`}
                        disabled={isLoading}
                      />
                    </div>
                    {errors.adminEmail && (
                      <p className="text-sm text-red-500 mt-1 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {errors.adminEmail}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="adminPassword">Admin Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="adminPassword"
                        type={showAdminPassword ? 'text' : 'password'}
                        placeholder="Enter admin password"
                        value={adminData.password}
                        onChange={(e) => handleAdminInputChange('password', e.target.value)}
                        className={`pl-10 pr-10 ${errors.adminPassword ? 'border-red-500' : ''}`}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowAdminPassword(!showAdminPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showAdminPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.adminPassword && (
                      <p className="text-sm text-red-500 mt-1 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {errors.adminPassword}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="adminRemember"
                        checked={adminData.rememberMe}
                        onChange={(e) => handleAdminInputChange('rememberMe', e.target.checked)}
                        className="rounded border-gray-300"
                        disabled={isLoading}
                      />
                      <Label htmlFor="adminRemember" className="text-sm text-gray-600 dark:text-gray-400">
                        Remember me
                      </Label>
                    </div>
                    <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-500">
                      Forgot password?
                    </Link>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Signing In...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Shield className="h-4 w-4 mr-2" />
                        Sign In as Admin
                      </div>
                    )}
                  </Button>
                </motion.form>
              </TabsContent>
            </Tabs>
          </CardContent>

          <CardFooter className="text-center pt-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="w-full space-y-3"
            >
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Don't have an account?{' '}
                <Link href="/signup" className="text-blue-600 hover:text-blue-500 font-medium">
                  Sign up here
                </Link>
              </p>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-300 dark:border-gray-600" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-gray-900 px-2 text-gray-500 dark:text-gray-400">
                    Or continue with
                  </span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  toast.info('🔐 GitHub Login', {
                    description: 'GitHub authentication coming soon!',
                    duration: 3000,
                  })
                }}
              >
                <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                Continue with GitHub
              </Button>
            </motion.div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}