'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  Building, 
  TrendingUp, 
  CreditCard, 
  Settings, 
  LogOut,
  Menu,
  X,
  ArrowUpRight,
  Calendar,
  DollarSign,
  Activity,
  Shield
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'

interface SocietyData {
  id: string
  name: string
  status: 'TRIAL' | 'ACTIVE' | 'EXPIRED' | 'LOCKED'
  subscriptionPlan: 'TRIAL' | 'BASIC' | 'PRO' | 'ENTERPRISE'
  trialEndsAt: string | null
  subscriptionEndsAt: string | null
  totalMembers: number
  city: string | null
  state: string | null
  createdAt: string
}

interface DashboardStats {
  totalMembers: number
  activeMembers: number
  pendingPayments: number
  monthlyRevenue: number
  totalRevenue: number
  pendingRequests: number
}

export default function ClientDashboard() {
  const [societyData, setSocietyData] = useState<SocietyData | null>(null)
  const [stats, setStats] = useState<DashboardStats>({
    totalMembers: 0,
    activeMembers: 0,
    pendingPayments: 0,
    monthlyRevenue: 0,
    totalRevenue: 0,
    pendingRequests: 0
  })
  const [loading, setLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Check session and get user data
      const sessionResponse = await fetch('/api/auth/check-session')
      if (sessionResponse.ok) {
        const { user } = await sessionResponse.json()
        
        if (user.societyAccount) {
          setSocietyData(user.societyAccount)
          
          // Generate dummy stats based on society data
          const dummyStats: DashboardStats = {
            totalMembers: user.societyAccount.totalMembers || 0,
            activeMembers: Math.floor((user.societyAccount.totalMembers || 0) * 0.85),
            pendingPayments: Math.floor(Math.random() * 10) + 5,
            monthlyRevenue: user.societyAccount.totalMembers * 150,
            totalRevenue: user.societyAccount.totalMembers * 150 * 12,
            pendingRequests: Math.floor(Math.random() * 20) + 10
          }
          setStats(dummyStats)
        }
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400'
      case 'TRIAL': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case 'EXPIRED': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      case 'LOCKED': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'ENTERPRISE': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
      case 'PRO': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400'
      case 'BASIC': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case 'TRIAL': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  const getTrialDaysLeft = (trialEndsAt: string | null) => {
    if (!trialEndsAt) return null
    const trialEnd = new Date(trialEndsAt)
    const now = new Date()
    const diffTime = trialEnd.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  const sidebarItems = [
    { icon: Building, label: 'Dashboard', active: true },
    { icon: Users, label: 'Members', active: false },
    { icon: CreditCard, label: 'Payments', active: false },
    { icon: Calendar, label: 'Events', active: false },
    { icon: Settings, label: 'Settings', active: false },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div className={`flex items-center space-x-3 ${!isSidebarOpen && 'justify-center'}`}>
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-lg flex items-center justify-center">
                <Building className="w-5 h-5 text-white" />
              </div>
              {isSidebarOpen && (
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  Saanify
                </span>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              {isSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </div>

          <nav className="space-y-2">
            {sidebarItems.map((item, index) => (
              <motion.button
                key={item.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  item.active
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {isSidebarOpen && <span>{item.label}</span>}
              </motion.button>
            ))}
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            onClick={() => {
              // Handle logout
              window.location.href = '/login'
            }}
          >
            <LogOut className="w-5 h-5 mr-3" />
            {isSidebarOpen && 'Logout'}
          </Button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Top Bar */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <motion.h1 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-bold text-gray-900 dark:text-white"
              >
                Welcome, {societyData?.name}!
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-gray-600 dark:text-gray-400"
              >
                Manage your society efficiently with our comprehensive tools
              </motion.p>
            </div>
            <div className="flex items-center space-x-4">
              {societyData?.status === 'TRIAL' && (
                <Badge className={getStatusColor(societyData.status)}>
                  {getTrialDaysLeft(societyData.trialEndsAt)} days left in trial
                </Badge>
              )}
              <Badge className={getPlanColor(societyData?.subscriptionPlan || 'TRIAL')}>
                {societyData?.subscriptionPlan} Plan
              </Badge>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Status Alert */}
          {societyData?.status === 'TRIAL' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <div>
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                      Trial Period Active
                    </h3>
                    <p className="text-blue-700 dark:text-blue-300">
                      You have {getTrialDaysLeft(societyData.trialEndsAt)} days left in your trial period.
                    </p>
                  </div>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Upgrade Plan
                </Button>
              </div>
            </motion.div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { label: 'Total Members', value: stats.totalMembers, icon: Users, color: 'from-blue-600 to-cyan-600', change: '+12%' },
              { label: 'Active Members', value: stats.activeMembers, icon: Activity, color: 'from-emerald-600 to-teal-600', change: '+8%' },
              { label: 'Monthly Revenue', value: `₹${stats.monthlyRevenue.toLocaleString()}`, icon: DollarSign, color: 'from-amber-600 to-orange-600', change: '+15%' },
              { label: 'Pending Requests', value: stats.pendingRequests, icon: Shield, color: 'from-purple-600 to-pink-600', change: '-5%' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center`}>
                        <stat.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className={`flex items-center text-sm font-medium ${
                        stat.change.startsWith('+') ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                        <ArrowUpRight className="w-4 h-4 mr-1" />
                        {stat.change}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                        {stat.label}
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stat.value}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Dashboard Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Membership Overview */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="w-5 h-5 mr-2 text-emerald-600" />
                    Membership Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Active Members</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {stats.activeMembers} / {stats.totalMembers}
                        </span>
                      </div>
                      <Progress 
                        value={(stats.activeMembers / stats.totalMembers) * 100} 
                        className="h-2"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <div className="text-center p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                          {stats.activeMembers}
                        </div>
                        <div className="text-sm text-emerald-700 dark:text-emerald-300">
                          Active
                        </div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                          {stats.totalMembers - stats.activeMembers}
                        </div>
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                          Inactive
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Financial Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="w-5 h-5 mr-2 text-emerald-600" />
                    Financial Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                      <div>
                        <div className="font-medium text-emerald-900 dark:text-emerald-100">
                          Monthly Revenue
                        </div>
                        <div className="text-sm text-emerald-700 dark:text-emerald-300">
                          Current month
                        </div>
                      </div>
                      <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                        ₹{stats.monthlyRevenue.toLocaleString()}
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div>
                        <div className="font-medium text-blue-900 dark:text-blue-100">
                          Total Revenue
                        </div>
                        <div className="text-sm text-blue-700 dark:text-blue-300">
                          Year to date
                        </div>
                      </div>
                      <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                        ₹{stats.totalRevenue.toLocaleString()}
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                      <div>
                        <div className="font-medium text-amber-900 dark:text-amber-100">
                          Pending Payments
                        </div>
                        <div className="text-sm text-amber-700 dark:text-amber-300">
                          Need attention
                        </div>
                      </div>
                      <div className="text-xl font-bold text-amber-600 dark:text-amber-400">
                        {stats.pendingPayments}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Coming Soon Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8 p-8 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl text-white text-center"
          >
            <h2 className="text-2xl font-bold mb-4">
              Client Dashboard Coming Soon
            </h2>
            <p className="text-emerald-100 mb-6 max-w-2xl mx-auto">
              This panel will display society-specific data including member management, 
              financial reports, maintenance requests, event scheduling, and more powerful tools 
              to manage your society efficiently.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="secondary" className="bg-white text-emerald-600 hover:bg-gray-100">
                View Features
              </Button>
              <Button variant="outline" className="border-white text-white hover:bg-white hover:text-emerald-600">
                Request Early Access
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}