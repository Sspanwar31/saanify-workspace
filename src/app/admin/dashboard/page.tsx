'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  Building2, 
  TrendingUp, 
  AlertCircle, 
  Plus, 
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Lock,
  Unlock,
  Trash2,
  Settings,
  LogOut,
  User,
  ChevronDown,
  BarChart3,
  CreditCard,
  Calendar,
  FileText,
  HelpCircle,
  Bell,
  Download,
  Upload,
  RefreshCw,
  ArrowUpDown,
  Shield
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AddClientModal } from '@/components/admin/AddClientModal'
import { EnhancedClientsTable } from '@/components/admin/EnhancedClientsTable'
import { UnifiedAnalytics } from '@/components/admin/UnifiedAnalytics'
import { SecureRevenueToggle } from '@/components/admin/SecureRevenueToggle'
import { AnalyticsCharts } from '@/components/admin/AnalyticsCharts'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Client {
  id: string
  name: string
  adminName: string
  email: string
  phone: string
  status: 'TRIAL' | 'ACTIVE' | 'EXPIRED' | 'LOCKED'
  subscriptionPlan: 'TRIAL' | 'BASIC' | 'PRO' | 'ENTERPRISE'
  trialEndsAt?: string
  subscriptionEndsAt?: string
  createdAt: string
  startDate?: string
  expiryDate?: string
}

export default function EnhancedAdminDashboard() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedPlan, setSelectedPlan] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('name')
  const [activeSection, setActiveSection] = useState('dashboard')
  const [userData, setUserData] = useState<any>(null)
  const [showRevenue, setShowRevenue] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  // Check if user is Super Admin
  const isAdmin = userData?.role === 'SUPER_ADMIN'

  // Navigation items
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Building2 },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'help', label: 'Help', icon: HelpCircle }
  ]

  // Load preferences from localStorage
  useEffect(() => {
    const savedRevenuePreference = localStorage.getItem('revenue-visibility')
    if (savedRevenuePreference) {
      const preference = JSON.parse(savedRevenuePreference)
      if (isAdmin || !preference.requiresAdmin) {
        setShowRevenue(preference.showRevenue)
      }
    }
  }, [isAdmin])

  // Fetch user data
  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/auth/check-session')
      if (response.ok) {
        const data = await response.json()
        setUserData(data.user)
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error)
    }
  }

  // Fetch clients with caching
  const fetchClients = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/clients')
      if (response.ok) {
        const data = await response.json()
        setClients(data.clients || [])
      }
    } catch (error) {
      console.error('Failed to fetch clients:', error)
      toast.error('Failed to fetch clients')
    } finally {
      setLoading(false)
    }
  }

  // Navigation handlers
  const handleNavigation = (section: string) => {
    setActiveSection(section)
    toast.success(`Navigated to ${section}`, {
      description: `You are now viewing the ${section} section`,
      duration: 2000,
    })
  }

  const handleLogout = async () => {
    try {
      const { logout } = await import('@/lib/auth')
      await logout()
    } catch (error) {
      console.error('Logout failed:', error)
      window.location.href = '/'
    }
  }

  const handleProfile = () => {
    toast.info('Profile', {
      description: 'Profile management coming soon!',
      duration: 3000,
    })
  }

  const handleSettings = () => {
    setActiveSection('settings')
    toast.info('Settings', {
      description: 'Opening settings panel...',
      duration: 2000,
    })
  }

  const handleExportData = () => {
    toast.success('Export Started', {
      description: 'Exporting client data to CSV...',
      duration: 3000,
    })
    
    setTimeout(() => {
      const csvContent = 'data:text/csv;charset=utf-8,' + 
        'Name,Email,Phone,Status,Plan,Created,Trial Ends,Subscription Ends\n' +
        clients.map(c => `${c.name},${c.email},${c.phone},${c.status},${c.subscriptionPlan},${c.createdAt},${c.trialEndsAt || ''},${c.subscriptionEndsAt || ''}`).join('\n')
      
      const encodedUri = encodeURI(csvContent)
      const link = document.createElement('a')
      link.setAttribute('href', encodedUri)
      link.setAttribute('download', 'clients_export.csv')
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }, 1000)
  }

  const handleRefreshData = () => {
    setRefreshKey(prev => prev + 1)
    fetchClients()
    toast.info('Refreshing', {
      description: 'Fetching latest data...',
      duration: 2000,
    })
  }

  const handleNotifications = () => {
    toast.info('Notifications', {
      description: 'You have 3 new notifications',
      duration: 3000,
    })
  }

  // Client actions
  const handleClientAction = async (action: string, clientId: string) => {
    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      })

      if (response.ok) {
        toast.success(`Client ${action} successfully`)
        fetchClients() // Instant refresh
      } else {
        toast.error(`Failed to ${action} client`)
      }
    } catch (error) {
      toast.error('An error occurred')
    }
  }

  const handleDeleteClient = async (clientId: string) => {
    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Client deleted successfully')
        fetchClients() // Instant refresh
      } else {
        toast.error('Failed to delete client')
      }
    } catch (error) {
      toast.error('An error occurred')
    }
  }

  const handleRenewClient = async (clientId: string, plan: string) => {
    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'renew', plan })
      })

      if (response.ok) {
        const result = await response.json()
        const newEndDate = result.client.subscriptionEndsAt
        
        toast.success('✅ Subscription renewed successfully', {
          description: `Subscription renewed till ${new Date(newEndDate).toLocaleDateString()}`,
          duration: 4000,
        })
        
        fetchClients() // Instant refresh
      } else {
        toast.error('Failed to renew subscription')
      }
    } catch (error) {
      toast.error('An error occurred during renewal')
    }
  }

  useEffect(() => {
    fetchClients()
    fetchUserData()
  }, [refreshKey])

  // Filter and sort clients
  const filteredClients = clients
    .filter(client => {
      const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           client.adminName?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = selectedStatus === 'all' || client.status === selectedStatus
      const matchesPlan = selectedPlan === 'all' || client.subscriptionPlan === selectedPlan
      return matchesSearch && matchesStatus && matchesPlan
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'status':
          return a.status.localeCompare(b.status)
        case 'plan':
          return a.subscriptionPlan.localeCompare(b.subscriptionPlan)
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        default:
          return 0
      }
    })

  const calculateTotalRevenue = () => {
    const planPrices = {
      TRIAL: 0,
      BASIC: 99,
      PRO: 299,
      ENTERPRISE: 999
    }
    
    return clients.reduce((total, client) => {
      return total + (planPrices[client.subscriptionPlan as keyof typeof planPrices] || 0)
    }, 0)
  }

  const monthlyGrowth = 18 // Mock growth percentage

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="flex">
        {/* Enhanced Sidebar */}
        <motion.div
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          className="w-64 bg-white/90 backdrop-blur-sm dark:bg-slate-800/90 border-r border-slate-200/50 dark:border-slate-700/50 min-h-screen p-6 sticky top-0"
        >
          <div className="mb-8">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">Saanify</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
              Super Admin Panel
              {isAdmin && (
                <Shield className="h-3 w-3 text-emerald-500" title="Super Admin" />
              )}
            </p>
          </div>

          <nav className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <motion.div
                  key={item.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant={activeSection === item.id ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start transition-all duration-200",
                      activeSection === item.id 
                        ? 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-lg' 
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700'
                    )}
                    onClick={() => handleNavigation(item.id)}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </Button>
                </motion.div>
              )
            })}
          </nav>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Enhanced Topbar */}
          <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white/90 backdrop-blur-sm dark:bg-slate-800/90 border-b border-slate-200/50 dark:border-slate-700/50 px-8 py-4 sticky top-0 z-10"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white capitalize">
                  {activeSection === 'dashboard' ? 'Client Management' : activeSection}
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {activeSection === 'dashboard' 
                    ? 'Manage your society accounts and subscriptions' 
                    : `Manage your ${activeSection} settings and information`
                  }
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefreshData}
                  className="flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNotifications}
                  className="flex items-center gap-2 relative hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <Bell className="h-4 w-4" />
                  Notifications
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-bold">3</span>
                  </span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportData}
                  className="flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <Download className="h-4 w-4" />
                  Export
                </Button>

                <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                  <DialogTrigger asChild>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 shadow-lg">
                        <Plus className="mr-2 h-4 w-4" />
                        Add New Client
                      </Button>
                    </motion.div>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Add New Client</DialogTitle>
                    </DialogHeader>
                    <AddClientModal 
                      onClose={() => setIsAddModalOpen(false)}
                      onSuccess={() => {
                        setIsAddModalOpen(false)
                        fetchClients()
                      }}
                    />
                  </DialogContent>
                </Dialog>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 flex items-center justify-center">
                        <User className="h-4 w-4 text-white" />
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleProfile}>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSettings}>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleNotifications}>
                      <Bell className="mr-2 h-4 w-4" />
                      Notifications
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </motion.header>

          {/* Main Content Area */}
          <main className="p-8">
            {/* Dynamic Content Based on Active Section */}
            {activeSection !== 'dashboard' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
              >
                <Card>
                  <CardContent className="p-8 text-center">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 capitalize">
                      {activeSection} Section
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                      This section is under development. Full {activeSection} functionality coming soon!
                    </p>
                    <div className="flex justify-center gap-4">
                      <Button onClick={() => setActiveSection('dashboard')}>
                        Back to Dashboard
                      </Button>
                      <Button variant="outline" onClick={() => toast.info(`Coming Soon`, {
                        description: `${activeSection} features will be available soon!`,
                        duration: 3000,
                      })}>
                        Notify Me When Ready
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Dashboard Content */}
            {activeSection === 'dashboard' && (
              <>
                {/* Secure Revenue Toggle */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-8"
                >
                  <SecureRevenueToggle
                    showRevenue={showRevenue}
                    onToggle={setShowRevenue}
                    totalRevenue={calculateTotalRevenue()}
                    monthlyGrowth={monthlyGrowth}
                    isAdmin={isAdmin}
                  />
                </motion.div>

                {/* Unified Analytics Overview */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="mb-8"
                >
                  <UnifiedAnalytics 
                    clients={clients} 
                    showRevenue={showRevenue} 
                    isAdmin={isAdmin}
                  />
                </motion.div>

                {/* Analytics Charts */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mb-8"
                >
                  <AnalyticsCharts clients={clients} showRevenue={showRevenue && isAdmin} />
                </motion.div>

                {/* Enhanced Filter Bar */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mb-6"
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                            <Input
                              placeholder="Search clients by name, email, or admin..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="pl-10"
                            />
                          </div>
                        </div>
                        
                        <div className="flex gap-3">
                          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                            <SelectTrigger className="w-40">
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Status</SelectItem>
                              <SelectItem value="TRIAL">Trial</SelectItem>
                              <SelectItem value="ACTIVE">Active</SelectItem>
                              <SelectItem value="EXPIRED">Expired</SelectItem>
                              <SelectItem value="LOCKED">Locked</SelectItem>
                            </SelectContent>
                          </Select>

                          <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                            <SelectTrigger className="w-40">
                              <SelectValue placeholder="Plan" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Plans</SelectItem>
                              <SelectItem value="TRIAL">Trial</SelectItem>
                              <SelectItem value="BASIC">Basic</SelectItem>
                              <SelectItem value="PRO">Pro</SelectItem>
                              <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                            </SelectContent>
                          </Select>

                          <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="w-40">
                              <ArrowUpDown className="h-4 w-4 mr-2" />
                              <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="name">Name</SelectItem>
                              <SelectItem value="status">Status</SelectItem>
                              <SelectItem value="plan">Plan</SelectItem>
                              <SelectItem value="created">Created</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Enhanced Clients Table */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Card className="border-2 border-slate-200 dark:border-slate-700">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>Client Management</span>
                        <Badge variant="outline" className="text-sm">
                          {filteredClients.length} of {clients.length} clients
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <EnhancedClientsTable
                        clients={filteredClients}
                        onAction={handleClientAction}
                        onDelete={handleDeleteClient}
                        onRenew={handleRenewClient}
                        showRevenue={showRevenue && isAdmin}
                        loading={loading}
                      />
                    </CardContent>
                  </Card>
                </motion.div>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}