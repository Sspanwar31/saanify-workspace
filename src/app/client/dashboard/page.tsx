'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Building2, 
  Users, 
  TrendingUp, 
  CreditCard, 
  Calendar,
  Settings,
  LogOut,
  User,
  ChevronDown,
  ArrowUpRight,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'

interface DashboardStats {
  totalMembers: number
  activeMembers: number
  pendingPayments: number
  monthlyRevenue: number
  eventsThisMonth: number
  pendingApprovals: number
}

export default function ClientDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalMembers: 0,
    activeMembers: 0,
    pendingPayments: 0,
    monthlyRevenue: 0,
    eventsThisMonth: 0,
    pendingApprovals: 0
  })
  const [societyInfo, setSocietyInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Mock data for demonstration
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setStats({
        totalMembers: 156,
        activeMembers: 142,
        pendingPayments: 8,
        monthlyRevenue: 245000,
        eventsThisMonth: 3,
        pendingApprovals: 5
      })
      
      setSocietyInfo({
        name: 'Green Valley Society',
        status: 'ACTIVE',
        subscriptionPlan: 'PRO',
        subscriptionEndsAt: '2024-12-31',
        adminName: 'John Doe'
      })
      
      setLoading(false)
    }, 1000)
  }, [])

  const getStatusBadge = (status: string) => {
    const variants = {
      TRIAL: 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300',
      ACTIVE: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300',
      EXPIRED: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
      LOCKED: 'bg-slate-100 text-slate-800 dark:bg-slate-900/20 dark:text-slate-300'
    }
    
    return (
      <Badge className={variants[status as keyof typeof variants] || variants.ACTIVE}>
        {status}
      </Badge>
    )
  }

  const getPlanBadge = (plan: string) => {
    const variants = {
      TRIAL: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
      BASIC: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
      PRO: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300',
      ENTERPRISE: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300'
    }
    
    return (
      <Badge className={variants[plan as keyof typeof variants] || variants.PRO}>
        {plan}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Topbar */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-8 py-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Welcome, {societyInfo?.name}
            </h1>
            <div className="flex items-center gap-3 mt-2">
              {getStatusBadge(societyInfo?.status)}
              {getPlanBadge(societyInfo?.subscriptionPlan)}
              <span className="text-sm text-slate-500 dark:text-slate-400">
                Admin: {societyInfo?.adminName}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700">
              <ArrowUpRight className="mr-2 h-4 w-4" />
              Upgrade Plan
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="p-8">
        {/* Coming Soon Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-r from-sky-500 to-blue-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Client Dashboard Coming Soon</h2>
                  <p className="text-sky-100">
                    This panel will display society-specific data including member management, 
                    financial reports, event scheduling, and more powerful features.
                  </p>
                </div>
                <div className="hidden md:block">
                  <Building2 className="h-16 w-16 text-sky-200" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {[
            {
              title: 'Total Members',
              value: stats.totalMembers,
              change: '+12%',
              icon: <Users className="h-5 w-5" />,
              gradient: 'from-blue-500 to-blue-600'
            },
            {
              title: 'Active Members',
              value: stats.activeMembers,
              change: '+8%',
              icon: <CheckCircle className="h-5 w-5" />,
              gradient: 'from-emerald-500 to-emerald-600'
            },
            {
              title: 'Pending Payments',
              value: stats.pendingPayments,
              change: '-3',
              icon: <AlertCircle className="h-5 w-5" />,
              gradient: 'from-amber-500 to-amber-600'
            },
            {
              title: 'Monthly Revenue',
              value: `₹${stats.monthlyRevenue.toLocaleString()}`,
              change: '+15%',
              icon: <TrendingUp className="h-5 w-5" />,
              gradient: 'from-purple-500 to-purple-600'
            },
            {
              title: 'Events This Month',
              value: stats.eventsThisMonth,
              change: '+2',
              icon: <Calendar className="h-5 w-5" />,
              gradient: 'from-indigo-500 to-indigo-600'
            },
            {
              title: 'Pending Approvals',
              value: stats.pendingApprovals,
              change: '+1',
              icon: <CreditCard className="h-5 w-5" />,
              gradient: 'from-red-500 to-red-600'
            }
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="relative overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-r ${stat.gradient} opacity-5`} />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${stat.gradient} text-white`}>
                    {stat.icon}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    <span className={stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}>
                      {stat.change}
                    </span>{' '}
                    from last month
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button 
                  variant="outline" 
                  className="h-20 flex-col"
                  onClick={() => toast.info('Member management coming soon!')}
                >
                  <Users className="h-6 w-6 mb-2" />
                  Manage Members
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col"
                  onClick={() => toast.info('Payment system coming soon!')}
                >
                  <CreditCard className="h-6 w-6 mb-2" />
                  Payments
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col"
                  onClick={() => toast.info('Event calendar coming soon!')}
                >
                  <Calendar className="h-6 w-6 mb-2" />
                  Events
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col"
                  onClick={() => toast.info('Reports coming soon!')}
                >
                  <TrendingUp className="h-6 w-6 mb-2" />
                  Reports
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}