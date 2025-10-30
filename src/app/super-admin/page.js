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
  Zap
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
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from '@/hooks/use-toast'

// TODO: Replace with real Supabase fetch when backend ready
// const { data, error } = await supabase.from('clients').select('*');

// Dummy Data - Will be replaced with Supabase data later
const dummyClients = [
  { 
    id: 1, 
    name: "Green Valley Housing Society", 
    plan: "PRO", 
    status: "Active", 
    members: 240,
    joinDate: "2024-01-15",
    revenue: "$2,400",
    contact: "admin@greenvalley.com",
    address: "123 Green Valley, Mumbai"
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
    address: "456 Sunshine Road, Delhi"
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
    address: "789 Metro Avenue, Bangalore"
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
    address: "321 Riverside Path, Pune"
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
    address: "654 Oakwood Drive, Hyderabad"
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
    address: "987 Palm Street, Chennai"
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
    address: "147 Crystal Lane, Kolkata"
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
    address: "258 Golden Boulevard, Ahmedabad"
  }
]

const statusColors = {
  Active: "bg-green-500/20 text-green-300 border-green-500/30 hover:bg-green-500/30",
  Trial: "bg-blue-500/20 text-blue-300 border-blue-500/30 hover:bg-blue-500/30",
  Expired: "bg-red-500/20 text-red-300 border-red-500/30 hover:bg-red-500/30",
  Locked: "bg-gray-500/20 text-gray-300 border-gray-500/30 hover:bg-gray-500/30"
}

const planColors = {
  BASIC: "bg-gray-500/20 text-gray-300 border-gray-500/30",
  PRO: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  TRIAL: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  ENTERPRISE: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
}

const statusIcons = {
  Active: CheckCircle,
  Trial: Clock,
  Expired: XCircle,
  Locked: Lock
}

export default function SuperAdminDashboard() {
  const [clients, setClients] = useState(dummyClients)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [selectedClient, setSelectedClient] = useState(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Filter and search clients
  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "All" || client.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [clients, searchTerm, statusFilter])

  // Statistics
  const stats = useMemo(() => {
    return {
      total: clients.length,
      active: clients.filter(c => c.status === "Active").length,
      trial: clients.filter(c => c.status === "Trial").length,
      expired: clients.filter(c => c.status === "Expired").length,
      totalRevenue: clients.reduce((sum, c) => sum + parseInt(c.revenue.replace(/[$,]/g, '')), 0),
      totalMembers: clients.reduce((sum, c) => sum + c.members, 0)
    }
  }, [clients])

  // Action handlers
  const handleView = (client) => {
    setSelectedClient(client)
    setIsViewModalOpen(true)
    toast({
      title: "Viewing Details",
      description: `Viewing details for ${client.name}`,
    })
  }

  const handleLock = (client) => {
    setClients(prev => prev.map(c => 
      c.id === client.id ? { ...c, status: "Locked" } : c
    ))
    toast({
      title: "Client Locked",
      description: `${client.name} has been locked`,
      variant: "default"
    })
  }

  const handleUnlock = (client) => {
    setClients(prev => prev.map(c => 
      c.id === client.id ? { ...c, status: "Active" } : c
    ))
    toast({
      title: "Client Unlocked",
      description: `${client.name} has been unlocked`,
      variant: "default"
    })
  }

  const handleDelete = (client) => {
    setClients(prev => prev.filter(c => c.id !== client.id))
    toast({
      title: "Client Deleted",
      description: `${client.name} has been removed`,
      variant: "destructive"
    })
  }

  const handleRenew = (client) => {
    const newPlan = client.plan === "BASIC" ? "PRO" : "ENTERPRISE"
    setClients(prev => prev.map(c => 
      c.id === client.id ? { ...c, status: "Active", plan: newPlan } : c
    ))
    toast({
      title: "Subscription Renewed",
      description: `${client.name} subscription renewed to ${newPlan}`,
      variant: "default"
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <Shield className="h-10 w-10 text-cyan-400" />
              Super Admin Dashboard
            </h1>
            <p className="text-gray-300">Manage all societies and clients</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 px-3 py-2 text-sm">
              🧩 Dummy Mode Active
            </Badge>
            <Button 
              onClick={handleRefresh}
              disabled={isLoading}
              variant="outline"
              className="border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/70 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Total Clients</CardTitle>
                <Building2 className="h-4 w-4 text-cyan-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.total}</div>
                <p className="text-xs text-gray-400">Registered societies</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/70 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Active</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-400">{stats.active}</div>
                <p className="text-xs text-gray-400">Currently active</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/70 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Trial</CardTitle>
                <Clock className="h-4 w-4 text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-400">{stats.trial}</div>
                <p className="text-xs text-gray-400">In trial period</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/70 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Expired</CardTitle>
                <XCircle className="h-4 w-4 text-red-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-400">{stats.expired}</div>
                <p className="text-xs text-gray-400">Need renewal</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/70 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Total Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-400">${stats.totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-gray-400">Monthly recurring</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search societies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-800/50 border-slate-700/50 text-white placeholder-gray-400 focus:border-cyan-500/50"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-slate-700/50 text-gray-300 hover:bg-slate-800/50">
                <Filter className="h-4 w-4 mr-2" />
                {statusFilter === "All" ? "All Status" : statusFilter}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-slate-800 border-slate-700">
              <DropdownMenuItem onClick={() => setStatusFilter("All")} className="text-gray-300 hover:bg-slate-700">
                All Status
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("Active")} className="text-gray-300 hover:bg-slate-700">
                Active
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("Trial")} className="text-gray-300 hover:bg-slate-700">
                Trial
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("Expired")} className="text-gray-300 hover:bg-slate-700">
                Expired
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("Locked")} className="text-gray-300 hover:bg-slate-700">
                Locked
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Table */}
      <div className="max-w-7xl mx-auto">
        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Database className="h-5 w-5 text-cyan-400" />
              Society Management
            </CardTitle>
            <CardDescription className="text-gray-400">
              Manage all registered societies and their subscriptions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700/50">
                    <TableHead className="text-gray-300">Name</TableHead>
                    <TableHead className="text-gray-300">Plan</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300">Members</TableHead>
                    <TableHead className="text-gray-300">Revenue</TableHead>
                    <TableHead className="text-gray-300 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {filteredClients.map((client, index) => {
                      const StatusIcon = statusIcons[client.status]
                      return (
                        <motion.tr
                          key={client.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-slate-700/30 hover:bg-slate-700/30 transition-colors"
                        >
                          <TableCell className="text-white font-medium">
                            <div>
                              <div className="text-white">{client.name}</div>
                              <div className="text-xs text-gray-400">{client.contact}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={planColors[client.plan]}>
                              {client.plan}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={`flex items-center gap-1 w-fit ${statusColors[client.status]}`}>
                              <StatusIcon className="h-3 w-3" />
                              {client.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-300">{client.members}</TableCell>
                          <TableCell className="text-gray-300">{client.revenue}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-slate-700/50">
                                  <Settings className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="bg-slate-800 border-slate-700" align="end">
                                <DropdownMenuItem 
                                  onClick={() => handleView(client)}
                                  className="text-gray-300 hover:bg-slate-700 flex items-center gap-2"
                                >
                                  <Eye className="h-4 w-4" />
                                  View
                                </DropdownMenuItem>
                                {client.status !== "Locked" && (
                                  <DropdownMenuItem 
                                    onClick={() => handleLock(client)}
                                    className="text-gray-300 hover:bg-slate-700 flex items-center gap-2"
                                  >
                                    <Lock className="h-4 w-4" />
                                    Lock
                                  </DropdownMenuItem>
                                )}
                                {client.status === "Locked" && (
                                  <DropdownMenuItem 
                                    onClick={() => handleUnlock(client)}
                                    className="text-gray-300 hover:bg-slate-700 flex items-center gap-2"
                                  >
                                    <Unlock className="h-4 w-4" />
                                    Unlock
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem 
                                  onClick={() => handleRenew(client)}
                                  className="text-gray-300 hover:bg-slate-700 flex items-center gap-2"
                                >
                                  <RefreshCw className="h-4 w-4" />
                                  Renew
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleDelete(client)}
                                  className="text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </motion.tr>
                      )
                    })}
                  </AnimatePresence>
                </TableBody>
              </Table>
              
              {filteredClients.length === 0 && (
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">No societies found matching your criteria</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* View Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-cyan-400" />
              Society Details
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Complete information about the society
            </DialogDescription>
          </DialogHeader>
          {selectedClient && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400">Name</label>
                  <p className="text-white font-medium">{selectedClient.name}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Status</label>
                  <Badge className={statusColors[selectedClient.status]}>
                    {selectedClient.status}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Plan</label>
                  <Badge className={planColors[selectedClient.plan]}>
                    {selectedClient.plan}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Members</label>
                  <p className="text-white font-medium">{selectedClient.members}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Revenue</label>
                  <p className="text-white font-medium">{selectedClient.revenue}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Join Date</label>
                  <p className="text-white font-medium">{selectedClient.joinDate}</p>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-400">Contact</label>
                <p className="text-white font-medium">{selectedClient.contact}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Address</label>
                <p className="text-white font-medium">{selectedClient.address}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}