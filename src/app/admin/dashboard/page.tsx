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
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AddClientModal } from '@/components/admin/AddClientModal'
import { ClientsTable } from '@/components/admin/ClientsTable'
import { toast } from 'sonner'

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
}

interface KPICard {
  title: string
  value: number
  change: string
  icon: React.ReactNode
  gradient: string
}

export default function AdminDashboard() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [activeSection, setActiveSection] = useState('dashboard')
  const [userData, setUserData] = useState<any>(null)

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
      // Fallback logout
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
    // Simulate export
    setTimeout(() => {
      const csvContent = 'data:text/csv;charset=utf-8,' + 
        'Name,Email,Phone,Status,Plan,Created\n' +
        clients.map(c => `${c.name},${c.email},${c.phone},${c.status},${c.subscriptionPlan},${c.createdAt}`).join('\n')
      
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
    setLoading(true)
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

  const handleKpiClick = (kpiTitle: string) => {
    let section = 'dashboard'
    switch (kpiTitle) {
      case 'Total Clients':
        section = 'clients'
        break
      case 'Active':
        section = 'analytics'
        break
      case 'Trial':
        section = 'billing'
        break
      case 'Expired':
        section = 'reports'
        break
    }
    setActiveSection(section)
    toast.info(`Viewing ${kpiTitle}`, {
      description: `Showing detailed ${kpiTitle.toLowerCase()} information`,
      duration: 2000,
    })
  }
  const kpiCards: KPICard[] = [
    {
      title: 'Total Clients',
      value: clients.length,
      change: '+12%',
      icon: <Building2 className="h-5 w-5" />,
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Active',
      value: clients.filter(c => c.status === 'ACTIVE').length,
      change: '+8%',
      icon: <TrendingUp className="h-5 w-5" />,
      gradient: 'from-emerald-500 to-emerald-600'
    },
    {
      title: 'Trial',
      value: clients.filter(c => c.status === 'TRIAL').length,
      change: '+3',
      icon: <Users className="h-5 w-5" />,
      gradient: 'from-amber-500 to-amber-600'
    },
    {
      title: 'Expired',
      value: clients.filter(c => c.status === 'EXPIRED').length,
      change: '-2',
      icon: <AlertCircle className="h-5 w-5" />,
      gradient: 'from-red-500 to-red-600'
    }
  ]

  // Fetch clients
  const fetchClients = async () => {
    try {
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

  useEffect(() => {
    fetchClients()
    fetchUserData()
  }, [])

  // Filter clients
  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.adminName?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || client.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const handleClientAction = async (action: string, clientId: string) => {
    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      })

      if (response.ok) {
        toast.success(`Client ${action} successfully`)
        fetchClients()
      } else {
        toast.error(`Failed to ${action} client`)
      }
    } catch (error) {
      toast.error('An error occurred')
    }
  }

  const handleDeleteClient = async (clientId: string) => {
    if (confirm('Are you sure you want to delete this client?')) {
      try {
        const response = await fetch(`/api/clients/${clientId}`, {
          method: 'DELETE'
        })

        if (response.ok) {
          toast.success('Client deleted successfully')
          fetchClients()
        } else {
          toast.error('Failed to delete client')
        }
      } catch (error) {
        toast.error('An error occurred')
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="flex">
        {/* Sidebar */}
        <motion.div
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          className="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 min-h-screen p-6"
        >
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Saanify</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Super Admin Panel</p>
          </div>

          <nav className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.id}
                  variant={activeSection === item.id ? "default" : "ghost"}
                  className={`w-full justify-start ${
                    activeSection === item.id 
                      ? 'bg-sky-500 hover:bg-sky-600 text-white' 
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  onClick={() => handleNavigation(item.id)}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Button>
              )
            })}
          </nav>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Topbar */}
          <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-8 py-4"
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
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNotifications}
                  className="flex items-center gap-2 relative"
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
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export
                </Button>

                <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700">
                      <Plus className="mr-2 h-4 w-4" />
                      Add New Client
                    </Button>
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
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
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
                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {kpiCards.map((kpi, index) => (
                    <motion.div
                      key={kpi.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      whileHover={{ scale: 1.02, cursor: 'pointer' }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleKpiClick(kpi.title)}
                    >
                      <Card className="relative overflow-hidden hover:shadow-lg transition-shadow duration-300">
                        <div className={`absolute inset-0 bg-gradient-to-r ${kpi.gradient} opacity-5`} />
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                            {kpi.title}
                          </CardTitle>
                          <div className={`p-2 rounded-lg bg-gradient-to-r ${kpi.gradient} text-white`}>
                            {kpi.icon}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-slate-900 dark:text-white">{kpi.value}</div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            <span className={kpi.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}>
                              {kpi.change}
                            </span>{' '}
                            from last month
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {/* Filters and Search */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="flex flex-col sm:flex-row gap-4 mb-6"
                >
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Search clients..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="all">All Status</option>
                    <option value="TRIAL">Trial</option>
                    <option value="ACTIVE">Active</option>
                    <option value="EXPIRED">Expired</option>
                    <option value="LOCKED">Locked</option>
                  </select>
                </motion.div>

                {/* Clients Table */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Society Accounts</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {loading ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
                        </div>
                      ) : (
                        <ClientsTable
                          clients={filteredClients}
                          onAction={handleClientAction}
                          onDelete={handleDeleteClient}
                        />
                      )}
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