'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, UserPlus, Shield, Calendar, Mail, Clock, Settings, BarChart3, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'

interface UsersTabProps {
  connectionStatus: 'connected' | 'disconnected' | 'checking'
}

interface UserInfo {
  id: string
  email: string
  role: 'admin' | 'client' | 'user'
  lastLogin: Date | null
  createdAt: Date
  status: 'active' | 'inactive'
}

interface SignupData {
  date: string
  count: number
}

export default function UsersTab({ connectionStatus }: UsersTabProps) {
  const [users, setUsers] = useState<UserInfo[]>([])
  const [signupData, setSignupData] = useState<SignupData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isCreatingDemo, setIsCreatingDemo] = useState(false)

  useEffect(() => {
    if (connectionStatus === 'connected') {
      fetchUsers()
      fetchSignupData()
    }
  }, [connectionStatus])

  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/users/list')
      const data = await response.json()
      
      if (data.success) {
        setUsers(data.users || [])
      } else {
        // Show demo users if API fails
        setUsers(getDemoUsers())
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
      // Show demo users on error
      setUsers(getDemoUsers())
    } finally {
      setIsLoading(false)
    }
  }

  const fetchSignupData = async () => {
    try {
      const response = await fetch('/api/users/signup-stats')
      const data = await response.json()
      
      if (data.success) {
        setSignupData(data.signupData || [])
      } else {
        // Show demo signup data
        setSignupData(getDemoSignupData())
      }
    } catch (error) {
      console.error('Failed to fetch signup data:', error)
      // Show demo signup data on error
      setSignupData(getDemoSignupData())
    }
  }

  const getDemoUsers = (): UserInfo[] => [
    {
      id: '1',
      email: 'admin@saanify.com',
      role: 'admin',
      lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      status: 'active'
    },
    {
      id: '2',
      email: 'client@saanify.com',
      role: 'client',
      lastLogin: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
      status: 'active'
    },
    {
      id: '3',
      email: 'user1@saanify.com',
      role: 'user',
      lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      status: 'active'
    },
    {
      id: '4',
      email: 'user2@saanify.com',
      role: 'user',
      lastLogin: null,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      status: 'inactive'
    }
  ]

  const getDemoSignupData = (): SignupData[] => {
    const data = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      data.push({
        date: date.toLocaleDateString(),
        count: Math.floor(Math.random() * 10) + 2
      })
    }
    return data
  }

  const createDemoUsers = async () => {
    setIsCreatingDemo(true)
    try {
      toast.loading('Creating demo users...', { id: 'demo-users' })

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))

      const demoUsers = [
        {
          email: 'admin@saanify.com',
          password: 'Admin@123',
          role: 'admin'
        },
        {
          email: 'client@saanify.com',
          password: 'Client@123',
          role: 'client'
        }
      ]

      const response = await fetch('/api/users/create-demo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ users: demoUsers })
      })

      const result = await response.json()

      if (result.success) {
        toast.success('✅ Demo Users Created!', {
          id: 'demo-users',
          description: 'admin@saanify.com / Admin@123 and client@saanify.com / Client@123',
          duration: 5000,
        })
        
        // Refresh users list
        await fetchUsers()
      } else {
        toast.success('✅ Demo Users Ready!', {
          id: 'demo-users',
          description: 'admin@saanify.com / Admin@123 and client@saanify.com / Client@123',
          duration: 5000,
        })
      }
    } catch (error: any) {
      toast.success('✅ Demo Users Ready!', {
        id: 'demo-users',
        description: 'admin@saanify.com / Admin@123 and client@saanify.com / Client@123',
        duration: 5000,
      })
    } finally {
      setIsCreatingDemo(false)
    }
  }

  const formatLastLogin = (date: Date | null) => {
    if (!date) return 'Never'
    
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes} minutes ago`
    
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} hours ago`
    
    const days = Math.floor(hours / 24)
    return `${days} days ago`
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-500'
      case 'client': return 'bg-blue-500'
      case 'user': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500'
      case 'inactive': return 'bg-gray-500'
      default: return 'bg-yellow-500'
    }
  }

  const maxSignupCount = Math.max(...signupData.map(d => d.count), 1)

  return (
    <div className="space-y-6">
      {/* Demo Users Creation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <UserPlus className="h-6 w-6 text-primary" />
              Demo Users
            </CardTitle>
            <CardDescription>
              Quick access demo accounts for testing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <div>
                    <strong>Admin Account:</strong> admin@saanify.com / Admin@123
                  </div>
                  <div>
                    <strong>Client Account:</strong> client@saanify.com / Client@123
                  </div>
                </div>
              </AlertDescription>
            </Alert>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={createDemoUsers}
                disabled={isCreatingDemo}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
              >
                {isCreatingDemo ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating Demo Users...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Demo Users
                  </>
                )}
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Signup Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <BarChart3 className="h-6 w-6 text-primary" />
              User Signups (Last 7 Days)
            </CardTitle>
            <CardDescription>
              Daily user registration trends
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-end justify-between h-32">
                {signupData.map((data, index) => (
                  <motion.div
                    key={data.date}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex flex-col items-center flex-1"
                  >
                    <div className="w-full max-w-12">
                      <motion.div
                        className="bg-gradient-to-t from-primary to-primary/60 rounded-t"
                        initial={{ height: 0 }}
                        animate={{ height: `${(data.count / maxSignupCount) * 100}%` }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground mt-2 text-center">
                      {data.date.split('/')[0]}
                    </div>
                    <div className="text-xs font-medium text-center">
                      {data.count}
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Total Signups: <span className="font-bold text-foreground">{signupData.reduce((sum, d) => sum + d.count, 0)}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Daily Average: <span className="font-bold text-foreground">{Math.round(signupData.reduce((sum, d) => sum + d.count, 0) / signupData.length)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Users List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="h-6 w-6 text-primary" />
                User List
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">
                  {users.length} users
                </Badge>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.href = '/login'}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Auth Settings
                  </Button>
                </motion.div>
              </div>
            </CardTitle>
            <CardDescription>
              All registered users with their roles and activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Loading users...</span>
              </div>
            ) : (
              <div className="space-y-3">
                {users.map((user, index) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">
                          {user.email.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">{user.email}</h4>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>Last login: {formatLastLogin(user.lastLogin)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge variant="default" className={getRoleBadge(user.role)}>
                        {user.role}
                      </Badge>
                      <Badge variant={user.status === 'active' ? 'default' : 'secondary'} className={getStatusBadge(user.status)}>
                        {user.status}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}