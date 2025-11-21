"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Filter, 
  Users, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Lock,
  Eye,
  Unlock,
  Trash2,
  RefreshCw,
  Building2,
  TrendingUp,
  AlertCircle,
  Shield,
  Settings,
  Database,
  Zap,
  Plus,
  Loader2,
  Activity,
  BarChart3,
  Calendar,
  DollarSign,
  Globe,
  Mail,
  Phone,
  MapPin,
  Edit,
  Copy,
  Download,
  Upload,
  UserCheck,
  Star,
  Award,
  Target,
  ArrowUpRight,
  ArrowDown,
  ChevronDown,
  MoreHorizontal,
  User,
  LogOut
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Type definitions
interface Client {
  id: number
  name: string
  plan: "BASIC" | "PRO" | "TRIAL" | "ENTERPRISE"
  status: "Active" | "Trial" | "Expired" | "Locked"
  members: number
  joinDate: string
  revenue: string
  contact: string
  address: string
  website?: string
  phone?: string
  description?: string
  rating?: number
  lastActive?: string
}

// Enhanced dummy data with more realistic information
const dummyClients: Client[] = [
  { 
    id: 1, 
    name: "Green Valley Housing Society", 
    plan: "PRO", 
    status: "Active", 
    members: 240,
    joinDate: "2024-01-15",
    revenue: "$2,400",
    contact: "admin@greenvalley.com",
    phone: "+91-98765-43210",
    address: "123 Green Valley Road, Mumbai, Maharashtra 400001",
    website: "www.greenvalley.in",
    description: "Premium residential society with modern amenities",
    rating: 4.5,
    lastActive: "2 hours ago"
  },
  { 
    id: 2, 
    name: "Sunshine Community Association", 
    plan: "TRIAL", 
    status: "Trial", 
    members: 120,
    joinDate: "2024-03-10",
    revenue: "$0",
    contact: "info@sunshine.org",
    phone: "+91-98765-43211",
    address: "456 Sunshine Road, Delhi, Delhi 110001",
    website: "www.sunshine.org.in",
    description: "Emerging community with focus on sustainable living",
    rating: 4.2,
    lastActive: "1 day ago"
  },
  { 
    id: 3, 
    name: "Metro Residents Welfare Society", 
    plan: "BASIC", 
    status: "Expired", 
    members: 300,
    joinDate: "2023-12-01",
    revenue: "$600",
    contact: "metro@welfare.com",
    phone: "+91-98765-43212",
    address: "789 Metro Avenue, Bangalore, Karnataka 560001",
    website: "www.metroresidents.in",
    description: "Well-established society with 10+ years of service",
    rating: 4.0,
    lastActive: "3 days ago"
  },
  { 
    id: 4, 
    name: "Riverside Gardens", 
    plan: "PRO", 
    status: "Active", 
    members: 180,
    joinDate: "2024-02-20",
    revenue: "$2,400",
    contact: "riverside@gardens.in",
    phone: "+91-98765-43213",
    address: "321 Riverside Path, Pune, Maharashtra 411001",
    website: "www.riversidegardens.in",
    description: "Luxury apartments with river view and modern facilities",
    rating: 4.7,
    lastActive: "30 minutes ago"
  },
  { 
    id: 5, 
    name: "Oakwood Community", 
    plan: "ENTERPRISE", 
    status: "Locked", 
    members: 90,
    joinDate: "2024-01-05",
    revenue: "$4,800",
    contact: "oakwood@community.com",
    phone: "+91-98765-43214",
    address: "654 Oakwood Drive, Hyderabad, Telangana 500001",
    website: "www.oakwoodcommunity.in",
    description: "Premium gated community with high-end amenities",
    rating: 4.8,
    lastActive: "1 week ago"
  },
  { 
    id: 6, 
    name: "Palm Springs Society", 
    plan: "BASIC", 
    status: "Active", 
    members: 150,
    joinDate: "2024-03-01",
    revenue: "$600",
    contact: "palmsprings@society.org",
    phone: "+91-98765-43215",
    address: "987 Palm Street, Chennai, Tamil Nadu 600001",
    website: "www.palmsprings.in",
    description: "Affordable housing society with basic amenities",
    rating: 3.8,
    lastActive: "5 hours ago"
  },
  { 
    id: 7, 
    name: "Crystal Heights", 
    plan: "TRIAL", 
    status: "Trial", 
    members: 75,
    joinDate: "2024-03-25",
    revenue: "$0",
    contact: "crystal@heights.com",
    phone: "+91-98765-43216",
    address: "147 Crystal Lane, Kolkata, West Bengal 700001",
    website: "www.crystalheights.in",
    description: "Modern society with smart home features",
    rating: 4.1,
    lastActive: "2 days ago"
  },
  { 
    id: 8, 
    name: "Golden Gate Community", 
    plan: "PRO", 
    status: "Active", 
    members: 220,
    joinDate: "2024-01-20",
    revenue: "$2,400",
    contact: "golden@gate.in",
    phone: "+91-98765-43217",
    address: "258 Golden Boulevard, Ahmedabad, Gujarat 380001",
    website: "www.goldengate.in",
    description: "Premium society with commercial spaces",
    rating: 4.6,
    lastActive: "1 hour ago"
  }
]

const statusColors = {
  Active: "bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200",
  Trial: "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200",
  Expired: "bg-red-100 text-red-800 border-red-200 hover:bg-red-200",
  Locked: "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200"
}

const planColors = {
  BASIC: "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200",
  PRO: "bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200",
  TRIAL: "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200",
  ENTERPRISE: "bg-cyan-100 text-cyan-800 border-cyan-200 hover:bg-cyan-200"
}

const statusIcons = {
  Active: CheckCircle,
  Trial: Clock,
  Expired: XCircle,
  Locked: Lock
}

const planIcons = {
  BASIC: Star,
  PRO: Award,
  TRIAL: Target,
  ENTERPRISE: Shield
}

// Naye client ke form ke liye initial state
const initialNewClientState = {
    name: "",
    contact: "",
    phone: "",
    address: "",
    website: "",
    description: "",
    plan: "TRIAL" as Client["plan"]
}

export default function SuperAdminDashboard() {
  const { toast } = useToast()
  const [clients, setClients] = useState<Client[]>([])
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [statusFilter, setStatusFilter] = useState<string>("All")
  const [planFilter, setPlanFilter] = useState<string>("All")
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [newClientData, setNewClientData] = useState(initialNewClientState)
  const [editingClient, setEditingClient] = useState<Client | null>(null)

  // Initial data load with loading effect
  useEffect(() => {
    setIsLoading(true)
    setTimeout(() => {
      setClients(dummyClients)
      setIsLoading(false)
    }, 1500)
  }, [])

  // Filter and search clients
  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "All" || client.status === statusFilter
      const matchesPlan = planFilter === "All" || client.plan === planFilter
      return matchesSearch && matchesStatus && matchesPlan
    })
  }, [clients, searchTerm, statusFilter, planFilter])

  // Statistics
  const stats = useMemo(() => {
    return {
      total: clients.length,
      active: clients.filter(c => c.status === "Active").length,
      trial: clients.filter(c => c.status === "Trial").length,
      expired: clients.filter(c => c.status === "Expired").length,
      locked: clients.filter(c => c.status === "Locked").length,
      totalRevenue: clients.reduce((sum, c) => sum + parseInt(c.revenue.replace(/[$,]/g, '')), 0),
      totalMembers: clients.reduce((sum, c) => sum + c.members, 0),
      avgRating: clients.length > 0 ? (clients.reduce((sum, c) => sum + (c.rating || 0), 0) / clients.length).toFixed(1) : 0
    }
  }, [clients])

  // Action handlers
  const handleView = (client: Client) => {
    setSelectedClient(client)
    setIsViewModalOpen(true)
  }

  const handleEdit = (client: Client) => {
    setEditingClient(client)
    setIsEditModalOpen(true)
  }

  const handleLock = (client: Client) => {
    setClients(prev => prev.map(c => 
      c.id === client.id ? { ...c, status: "Locked" as const } : c
    ))
    toast({
      title: "Client Locked",
      description: `${client.name} has been locked`,
    })
  }

  const handleUnlock = (client: Client) => {
    setClients(prev => prev.map(c => 
      c.id === client.id ? { ...c, status: "Active" as const } : c
    ))
    toast({
      title: "Client Unlocked",
      description: `${client.name} has been unlocked`,
    })
  }

  const handleDelete = (client: Client) => {
    setClients(prev => prev.filter(c => c.id !== client.id))
    toast({
      title: "Client Deleted",
      description: `${client.name} has been removed`,
      variant: "destructive"
    })
  }

  const handleRenew = (client: Client) => {
    const newPlan: Client["plan"] = client.plan === "BASIC" ? "PRO" : "ENTERPRISE"
    setClients(prev => prev.map(c => 
      c.id === client.id ? { ...c, status: "Active" as const, plan: newPlan } : c
    ))
    toast({
      title: "Subscription Renewed",
      description: `${client.name} subscription renewed to ${newPlan}`,
    })
  }

  const handleRefresh = () => {
    setIsLoading(true)
    setTimeout(() => {
      setClients(dummyClients)
      setIsLoading(false)
      toast({
        title: "Data Refreshed",
        description: "Client data has been refreshed",
      })
    }, 1000)
  }

  // Form handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (editingClient) {
      setEditingClient(prev => ({ ...prev, [name]: value }))
    } else {
      setNewClientData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handlePlanChange = (value: Client["plan"]) => {
    if (editingClient) {
      setEditingClient(prev => ({ ...prev, plan: value }))
    } else {
      setNewClientData(prev => ({ ...prev, plan: value }))
    }
  }

  const handleAddClient = () => {
    if (!newClientData.name || !newClientData.contact) {
      toast({
        title: "Validation Error",
        description: "Society name and contact are required.",
        variant: "destructive",
      })
      return
    }

    const newClient: Client = {
      id: Date.now(),
      ...newClientData,
      status: "Trial",
      members: 0,
      joinDate: new Date().toISOString().split("T")[0],
      revenue: "$0",
      rating: 4.0,
      lastActive: "Just now"
    }

    setClients(prevClients => [newClient, ...prevClients])
    setIsAddModalOpen(false)
    setNewClientData(initialNewClientState)
    toast({
      title: "Society Added",
      description: `${newClient.name} has been successfully added.`,
    })
  }

  const handleUpdateClient = () => {
    if (!editingClient) return

    setClients(prev => prev.map(c => 
      c.id === editingClient.id ? editingClient : c
    ))
    setIsEditModalOpen(false)
    setEditingClient(null)
    toast({
      title: "Society Updated",
      description: `${editingClient.name} has been successfully updated.`,
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-indigo-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Super Admin Dashboard</h1>
                <p className="text-sm text-gray-500">Manage all societies and clients</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-indigo-100 text-indigo-800 px-3 py-1 text-sm">
                🧩 Demo Mode
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                    <User className="h-4 w-4 mr-2" />
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem className="cursor-pointer">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">Profile</p>
                        <p className="text-xs text-gray-500">superadmin@saanify.com</p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">Settings</p>
                        <p className="text-xs text-gray-500">System settings</p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => {
                      // Handle logout
                      toast({
                        title: "Logged Out",
                        description: "You have been successfully logged out.",
                      })
                      window.location.href = '/login'
                    }}
                    className="cursor-pointer text-red-600 hover:bg-red-50"
                  >
                    <div className="flex items-center gap-2">
                      <LogOut className="h-4 w-4" />
                      <div>
                        <p className="text-sm font-medium">Logout</p>
                        <p className="text-xs text-gray-500">Sign out of account</p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button 
                onClick={() => setIsAddModalOpen(true)}
                className="bg-indigo-600 text-white hover:bg-indigo-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Society
              </Button>
              <Button 
                onClick={handleRefresh}
                disabled={isLoading}
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:border-indigo-600">
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="societies" className="data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:border-indigo-600">
              <Building2 className="h-4 w-4 mr-2" />
              Societies
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:border-indigo-600">
              <TrendingUp className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:border-indigo-600">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Societies</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                  <p className="text-xs text-gray-500">Registered societies</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Active</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats.active}</div>
                  <p className="text-xs text-gray-500">Currently active</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toLocaleString()}</div>
                  <p className="text-xs text-gray-500">Monthly recurring</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Avg Rating</CardTitle>
                  <Star className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{stats.avgRating}</div>
                  <p className="text-xs text-gray-500">Average rating</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Society
                  </Button>
                  <Button 
                    onClick={handleRefresh}
                    disabled={isLoading}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh Data
                  </Button>
                  <Button 
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {clients.slice(0, 3).map((client) => (
                      <div key={client.id} className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{client.name}</p>
                          <p className="text-xs text-gray-500">{client.lastActive}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">System Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Database</span>
                      <Badge className="bg-green-100 text-green-800">Connected</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">API Server</span>
                      <Badge className="bg-green-100 text-green-800">Running</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Last Sync</span>
                      <span className="text-sm text-gray-500">2 mins ago</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Societies Tab */}
          <TabsContent value="societies" className="space-y-6">
            {/* Search and Filter */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search societies..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Status</SelectItem>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Trial">Trial</SelectItem>
                      <SelectItem value="Expired">Expired</SelectItem>
                      <SelectItem value="Locked">Locked</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={planFilter} onValueChange={setPlanFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="All Plans" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Plans</SelectItem>
                      <SelectItem value="BASIC">Basic</SelectItem>
                      <SelectItem value="PRO">Pro</SelectItem>
                      <SelectItem value="TRIAL">Trial</SelectItem>
                      <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Societies Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Societies Management</CardTitle>
                <CardDescription>
                  Manage all registered societies and their subscriptions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Society</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Members</TableHead>
                        <TableHead>Revenue</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-12">
                            <div className="flex justify-center items-center gap-2">
                              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                              <p className="text-lg text-gray-600">Loading societies...</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : filteredClients.length > 0 ? (
                        <AnimatePresence>
                          {filteredClients.map((client, index) => {
                            const StatusIcon = statusIcons[client.status]
                            const PlanIcon = planIcons[client.plan]
                            return (
                              <motion.tr
                                key={client.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ delay: index * 0.05 }}
                                className="border-b hover:bg-gray-50"
                              >
                                <TableCell>
                                  <div>
                                    <div className="font-medium text-gray-900">{client.name}</div>
                                    <div className="text-sm text-gray-500">{client.contact}</div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <PlanIcon className="h-4 w-4 text-gray-500" />
                                    <Badge className={planColors[client.plan]}>
                                      {client.plan}
                                    </Badge>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <StatusIcon className="h-4 w-4 text-gray-500" />
                                    <Badge className={statusColors[client.status]}>
                                      {client.status}
                                    </Badge>
                                  </div>
                                </TableCell>
                                <TableCell className="text-gray-900">{client.members}</TableCell>
                                <TableCell className="text-gray-900">{client.revenue}</TableCell>
                                <TableCell>
                                  <div className="flex items-center">
                                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                    <span className="text-sm text-gray-600 ml-1">{client.rating}</span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => handleView(client)}>
                                        <Eye className="h-4 w-4 mr-2" />
                                        View Details
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleEdit(client)}>
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      {client.status !== "Locked" ? (
                                        <DropdownMenuItem onClick={() => handleLock(client)}>
                                          <Lock className="h-4 w-4 mr-2" />
                                          Lock
                                        </DropdownMenuItem>
                                      ) : (
                                        <DropdownMenuItem onClick={() => handleUnlock(client)}>
                                          <Unlock className="h-4 w-4 mr-2" />
                                          Unlock
                                        </DropdownMenuItem>
                                      )}
                                      <DropdownMenuItem onClick={() => handleRenew(client)}>
                                        <RefreshCw className="h-4 w-4 mr-2" />
                                        Renew
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem onClick={() => handleDelete(client)} className="text-red-600">
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </motion.tr>
                            )
                          })}
                        </AnimatePresence>
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-12">
                            <div className="text-center">
                              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                              <p className="text-gray-500">No societies found matching your criteria</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Revenue Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Revenue</span>
                      <span className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Monthly Average</span>
                      <span className="text-xl font-semibold text-gray-900">${Math.round(stats.totalRevenue / stats.total || 0)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Membership Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Members</span>
                      <span className="text-2xl font-bold text-gray-900">{stats.totalMembers.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Average per Society</span>
                      <span className="text-xl font-semibold text-gray-900">{Math.round(stats.totalMembers / stats.total || 0)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">System Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-medium">Auto-refresh</h3>
                      <p className="text-sm text-gray-500">Automatically refresh data every 5 minutes</p>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-medium">Email Notifications</h3>
                      <p className="text-sm text-gray-500">Send email alerts for important events</p>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-medium">Data Export</h3>
                      <p className="text-gray-500">Export data in CSV or Excel format</p>
                    </div>
                    <Button variant="outline" size="sm">Export</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* View Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-indigo-600" />
              Society Details
            </DialogTitle>
            <DialogDescription>
              Complete information about the society
            </DialogDescription>
          </DialogHeader>
          {selectedClient && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Society Name</Label>
                  <p className="text-base text-gray-900">{selectedClient.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Status</Label>
                  <Badge className={statusColors[selectedClient.status]}>
                    {selectedClient.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Subscription Plan</Label>
                  <Badge className={planColors[selectedClient.plan]}>
                    {selectedClient.plan}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Members</Label>
                  <p className="text-base text-gray-900">{selectedClient.members}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Monthly Revenue</Label>
                  <p className="text-base text-gray-900">{selectedClient.revenue}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Rating</Label>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="ml-1 text-base text-gray-900">{selectedClient.rating}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Join Date</Label>
                  <p className="text-base text-gray-900">{selectedClient.joinDate}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Last Active</Label>
                  <p className="text-base text-gray-900">{selectedClient.lastActive}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Contact Information</Label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{selectedClient.contact}</span>
                    </div>
                    {selectedClient.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{selectedClient.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Address</Label>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                    <span className="text-sm text-gray-900">{selectedClient.address}</span>
                  </div>
                </div>
                {selectedClient.website && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Website</Label>
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer">
                        {selectedClient.website}
                      </span>
                    </div>
                  </div>
                )}
                {selectedClient.description && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Description</Label>
                    <p className="text-sm text-gray-600 mt-1">{selectedClient.description}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add/Edit Modal */}
      <Dialog open={isAddModalOpen || isEditModalOpen} onOpenChange={(open) => {
        if (!open) {
          setIsAddModalOpen(false)
          setIsEditModalOpen(false)
          setEditingClient(null)
        }
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-indigo-600" />
              {isEditModalOpen ? "Edit Society" : "Add New Society"}
            </DialogTitle>
            <DialogDescription>
              {isEditModalOpen ? "Update society information" : "Enter the details of the new society to register them."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right font-medium">
                Society Name
              </Label>
              <Input
                id="name"
                name="name"
                value={editingClient ? editingClient.name : newClientData.name}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="e.g., Green Valley Apartments"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="contact" className="text-right font-medium">
                Contact Email
              </Label>
              <Input
                id="contact"
                name="contact"
                type="email"
                value={editingClient ? editingClient.contact : newClientData.contact}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="e.g., admin@greenvalley.com"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right font-medium">
                Phone
              </Label>
              <Input
                id="phone"
                name="phone"
                value={editingClient ? editingClient.phone : newClientData.phone}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="e.g., +91-98765-43210"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right font-medium">
                Address
              </Label>
              <Input
                id="address"
                name="address"
                value={editingClient ? editingClient.address : newClientData.address}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="e.g., 123 Green Valley, Mumbai"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="website" className="text-right font-medium">
                Website
              </Label>
              <Input
                id="website"
                name="website"
                value={editingClient ? editingClient.website : newClientData.website}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="e.g., www.greenvalley.in"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="plan" className="text-right font-medium">
                Initial Plan
              </Label>
              <Select 
                value={editingClient ? editingClient.plan : newClientData.plan} 
                onValueChange={handlePlanChange}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TRIAL">Trial</SelectItem>
                  <SelectItem value="BASIC">Basic</SelectItem>
                  <SelectItem value="PRO">Pro</SelectItem>
                  <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(editingClient || newClientData.description) && (
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="description" className="text-right font-medium">
                  Description
                </Label>
                <textarea
                  id="description"
                  name="description"
                  value={editingClient ? editingClient.description : newClientData.description}
                  onChange={(e) => {
                    const name = e.target.name
                    const value = e.target.value
                    if (editingClient) {
                      setEditingClient(prev => ({ ...prev, [name]: value }))
                    } else {
                      setNewClientData(prev => ({ ...prev, [name]: value }))
                    }
                  }}
                  className="col-span-3 min-h-[80px] resize-none"
                  placeholder="Brief description about the society"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddModalOpen(false)
              setIsEditModalOpen(false)
              setEditingClient(null)
            }}>
              Cancel
            </Button>
            <Button 
              onClick={isEditModalOpen ? handleUpdateClient : handleAddClient}
              className="bg-indigo-600 text-white hover:bg-indigo-700"
            >
              {isEditModalOpen ? "Update Society" : "Add Society"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
