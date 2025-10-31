'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  Building2, 
  TrendingUp, 
  CreditCard, 
  Calendar,
  Settings,
  LogOut,
  User,
  ChevronDown,
  ArrowUpRight,
  AlertCircle,
  CheckCircle,
  Eye,
  Edit,
  Trash2,
  Download,
  RefreshCw,
  Activity,
  DollarSign,
  FileText,
  Shield,
  Menu,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// Import new components
import { ClientDashboardStats } from '@/components/client/ClientDashboardStats'
import { MembersManagement } from '@/components/client/MembersManagement'
import { PassbookManagement } from '@/components/client/PassbookManagement'
import { LoansManagement } from '@/components/client/LoansManagement'
import { MaturityTracking } from '@/components/client/MaturityTracking'
import { AdminFundManagement } from '@/components/client/AdminFundManagement'
import { ReportsManagement } from '@/components/client/ReportsManagement'
import { UserManagement } from '@/components/client/UserManagement'
import { useClientApi } from '@/lib/useClientApi'

interface SocietyInfo {
  id: string
  name: string
  status: 'TRIAL' | 'ACTIVE' | 'EXPIRED' | 'LOCKED'
  subscriptionPlan: 'TRIAL' | 'BASIC' | 'PRO' | 'ENTERPRISE'
  subscriptionEndsAt?: string
  adminName: string
  adminEmail: string
  adminPhone: string
  address?: string
  createdAt: string
  totalMembers?: number
  totalLoans?: number
  totalSavings?: number
}

interface DashboardStats {
  totalMembers: number
  activeMembers: number
  pendingPayments: number
  monthlyRevenue: number
  eventsThisMonth: number
  pendingApprovals: number
  totalLoans: number
  totalSavings: number
  activeLoans: number
  pendingLoans: number
  maturityAmount: number
}

export default function ModernClientDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [societyInfo, setSocietyInfo] = useState<SocietyInfo | null>(null)
  const [stats, setStats] = useState<DashboardStats>({
    totalMembers: 0,
    activeMembers: 0,
    pendingPayments: 0,
    monthlyRevenue: 0,
    eventsThisMonth: 0,
    pendingApprovals: 0,
    totalLoans: 0,
    totalSavings: 0,
    activeLoans: 0,
    pendingLoans: 0,
    maturityAmount: 0
  })

  // Fetch society data
  const fetchSocietyData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/society/current')
      if (response.ok) {
        const data = await response.json()
        setSocietyInfo(data.society)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Failed to fetch society data:', error)
      toast.error('Failed to load society data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSocietyData()
  }, [])

  const getStatusBadge = (status: string) => {
    const variants = {
      TRIAL: 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300 border-amber-200',
      ACTIVE: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300 border-emerald-200',
      EXPIRED: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300 border-red-200',
      LOCKED: 'bg-slate-100 text-slate-800 dark:bg-slate-900/20 dark:text-slate-300 border-slate-200'
    }
    
    return (
      <Badge className={cn(variants[status as keyof typeof variants] || variants.ACTIVE, 'font-medium')}>
        {status}
      </Badge>
    )
  }

  const getPlanBadge = (plan: string) => {
    const variants = {
      TRIAL: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 border-blue-200',
      BASIC: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300 border-purple-200',
      PRO: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300 border-indigo-200',
      ENTERPRISE: 'bg-teal-100 text-teal-800 dark:bg-teal-900/20 dark:text-teal-300 border-teal-200'
    }
    
    return (
      <Badge className={cn(variants[plan as keyof typeof variants] || variants.PRO, 'font-medium')}>
        {plan}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-900 dark:from-slate-900 dark:to-slate-800">
      {/* Enhanced Topbar */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/90 backdrop-blur-sm dark:bg-slate-800/90 border-b border-slate-200/50 dark:border-slate-700/50 px-8 py-4 sticky top-0 z-50"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Welcome, {societyInfo?.name || 'Society Dashboard'}
            </h1>
            <div className="flex items-center gap-3 mt-2">
              {getStatusBadge(societyInfo?.status || 'ACTIVE')}
              {getPlanBadge(societyInfo?.subscriptionPlan || 'TRIAL')}
              <span className="text-sm text-slate-500 dark:text-slate-400">
                Admin: {societyInfo?.adminName || 'Admin'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700">
              <ArrowUpRight className="mr-2 h-4 w-4" />
              Upgrade Plan
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Eye className="mr-2 h-4 w-4" />
                  View Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4 text-red-600" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </motion.header>

      {/* Main Content */}
      <main className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-6 bg-white/90 backdrop-blur-sm dark:bg-slate-800/90 border border border-slate-200/50 dark:border-slate-700/50 rounded-lg p-1">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-emerald-500 text-white data-[state=active]:text-emerald-700"
            >
              <Building2 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="members" 
              className="data-[state=active]:bg-blue-500 text-white data-[state=active]:text-blue-700"
            >
              <Users className="h-4 w-4 mr-2" />
              Members
            </TabsTrigger>
            <TabsTrigger 
              value="passbook" 
              className="data-[state=active]:bg-purple-500 text-white data-[state=active]:text-purple-700"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Passbook
            </TabsTrigger>
            <TabsTrigger 
              value="loans" 
              className="data-[state=active]:bg-orange-500 text-white data-[state=active]:text-orange-700"
            >
              <FileText className="h-4 w-4 mr-2" />
              Loans
            </TabsTrigger>
            <TabsTrigger 
              value="maturity" 
              className="data-[state=active]:bg-indigo-500 text-white data-[state=active]:text-indigo-700"
            >
              <Activity className="h-4 w-4 mr-2" />
              Maturity
            </TabsTrigger>
            <TabsTrigger 
              value="fund" 
              className="data-[state=active]:bg-teal-500 text-white data-[state=active]:text-teal-700"
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Admin Fund
            </TabsTrigger>
            <TabsTrigger 
              value="reports" 
              className="data-[state=active]:bg-pink-500 text-white data-[state=active]:text-pink-700"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Reports
            </TabsTrigger>
            <TabsTrigger 
              value="users" 
              className="data-[state=active]:bg-slate-500 text-white data-[state=active]:text-slate-700"
            >
              <Shield className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <ClientDashboardStats stats={stats} societyInfo={societyInfo} />
          
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-2 border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Activity className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {[
                    {
                      icon: <Users className="h-4 w-4 text-blue-500" />,
                      title: 'New member joined',
                      description: 'John Doe joined Green Valley Society',
                      time: '2 hours ago',
                      color: 'text-blue-600'
                    },
                    {
                      icon: <CreditCard className="h-4 w-4 text-emerald-500" />,
                      title: 'Loan approved',
                      description: 'Business loan for Mary Johnson',
                      time: '5 hours ago',
                      color: 'text-emerald-600'
                    },
                    {
                      icon: <DollarSign className="h-4 w-4 text-purple-500" />,
                      title: 'Payment received',
                      description: 'Monthly subscription payment',
                      time: '1 day ago',
                      color: 'text-purple-600'
                    }
                  ].map((activity, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-start gap-4 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <div className={cn(
                        "p-2 rounded-full",
                        activity.color === 'text-blue-600' ? 'bg-blue-100 dark:bg-blue-900/20' :
                        activity.color === 'text-emerald-600' ? 'bg-emerald-100 dark:bg-emerald-900/20' :
                        activity.color === 'text-purple-600' ? 'bg-purple-100 dark:bg-purple-900/20' : 'bg-slate-100 dark:bg-slate-900/20'
                      )}>
                        {activity.icon}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900 dark:text-white">
                          {activity.title}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {activity.description}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-500">
                          {activity.time}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members" className="space-y-6">
          <MembersManagement societyInfo={societyInfo} />
        </TabsContent>

        {/* Passbook Tab */}
        <TabsContent value="passbook" className="space-y-6">
          <PassbookManagement societyInfo={societyInfo} />
        </TabsContent>

        {/* Loans Tab */}
        <TabsContent value="loans" className="space-y-6">
          <LoansManagement societyInfo={societyInfo} />
        </TabsContent>

        {/* Maturity Tab */}
        <TabsContent value="maturity" className="space-y-6">
          <MaturityTracking societyInfo={societyInfo} />
        </TabsContent>

        {/* Admin Fund Tab */}
        <TabsContent value="fund" className="space-y-6">
          <AdminFundManagement societyInfo={societyInfo} />
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <ReportsManagement societyInfo={societyInfo} />
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <UserManagement societyInfo={societyInfo} />
        </TabsContent>
      </main>
    </div>
  )
}