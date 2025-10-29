'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  Building, 
  TrendingUp, 
  AlertCircle, 
  Plus, 
  Search,
  Filter,
  MoreHorizontal,
  Lock,
  Unlock,
  Trash2,
  Eye,
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'
import ClientsTable from '@/components/admin/ClientsTable'
import AddClientModal from '@/components/admin/AddClientModal'

interface SocietyAccount {
  id: string
  name: string
  adminEmail: string
  adminPhone: string | null
  status: 'TRIAL' | 'ACTIVE' | 'EXPIRED' | 'LOCKED'
  subscriptionPlan: 'TRIAL' | 'BASIC' | 'PRO' | 'ENTERPRISE'
  trialEndsAt: string | null
  subscriptionEndsAt: string | null
  totalMembers: number
  createdAt: string
  city: string | null
  state: string | null
}

interface Stats {
  totalClients: number
  activeClients: number
  trialClients: number
  expiredClients: number
  lockedClients: number
}

export default function AdminDashboard() {
  const [clients, setClients] = useState<SocietyAccount[]>([])
  const [stats, setStats] = useState<Stats>({
    totalClients: 0,
    activeClients: 0,
    trialClients: 0,
    expiredClients: 0,
    lockedClients: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients')
      if (response.ok) {
        const data = await response.json()
        setClients(data.clients)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Failed to fetch clients:', error)
      toast.error('Failed to fetch clients')
    } finally {
      setLoading(false)
    }
  }

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
        toast.error('Failed to update client')
      }
    } catch (error) {
      console.error('Failed to update client:', error)
      toast.error('Failed to update client')
    }
  }

  const handleDeleteClient = async (clientId: string) => {
    if (!confirm('Are you sure you want to delete this client? This action cannot be undone.')) {
      return
    }

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
      console.error('Failed to delete client:', error)
      toast.error('Failed to delete client')
    }
  }

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.adminEmail.toLowerCase().includes(searchTerm.toLowerCase())
  )

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

  const sidebarItems = [
    { icon: Building, label: 'Dashboard', active: true },
    { icon: Users, label: 'Clients', active: false },
    { icon: Settings, label: 'Settings', active: false },
  ]

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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Super Admin Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage all society accounts and clients
              </p>
            </div>
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Client
            </Button>
          </div>
        </div>

        <div className="p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { label: 'Total Clients', value: stats.totalClients, icon: Building, color: 'from-blue-600 to-cyan-600' },
              { label: 'Active', value: stats.activeClients, icon: TrendingUp, color: 'from-emerald-600 to-teal-600' },
              { label: 'Trial', value: stats.trialClients, icon: AlertCircle, color: 'from-amber-600 to-orange-600' },
              { label: 'Expired', value: stats.expiredClients, icon: Lock, color: 'from-red-600 to-pink-600' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          {stat.label}
                        </p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                          {stat.value}
                        </p>
                      </div>
                      <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center`}>
                        <stat.icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Clients Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Client Management</CardTitle>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search clients..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Society Name</TableHead>
                      <TableHead>Admin Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Subscription</TableHead>
                      <TableHead>Members</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClients.map((client, index) => (
                      <motion.tr
                        key={client.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-gray-200 dark:border-gray-700"
                      >
                        <TableCell className="font-medium">
                          {client.name}
                        </TableCell>
                        <TableCell>{client.adminEmail}</TableCell>
                        <TableCell>{client.adminPhone || '-'}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(client.status)}>
                            {client.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getPlanColor(client.subscriptionPlan)}>
                            {client.subscriptionPlan}
                          </Badge>
                        </TableCell>
                        <TableCell>{client.totalMembers}</TableCell>
                        <TableCell>
                          {client.city && client.state ? `${client.city}, ${client.state}` : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              {client.status === 'ACTIVE' ? (
                                <DropdownMenuItem onClick={() => handleClientAction('lock', client.id)}>
                                  <Lock className="w-4 h-4 mr-2" />
                                  Lock
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem onClick={() => handleClientAction('unlock', client.id)}>
                                  <Unlock className="w-4 h-4 mr-2" />
                                  Unlock
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem 
                                onClick={() => handleDeleteClient(client.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Client Modal */}
      <AddClientModal
        isOpen={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onClientAdded={fetchClients}
      />
    </div>
  )
}