'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
// SOLUTION: Duplicate 'Users' import hata diya gaya hai.
import { 
  Users, Building2, TrendingUp, Plus, Search, Filter, Settings, LogOut, Home,
  BarChart3, DollarSign, Shield, Eye, Edit, Trash2, Download, RefreshCw, UserCheck,
  Calendar, FileText, Lock, Unlock, Crown, CreditCard, Activity, Phone, MapPin,
  Globe, Mail, Star, ArrowUpRight, ChevronDown
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'

export default function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedPlan, setSelectedPlan] = useState('all')
  const [activeTab, setActiveTab] = useState('overview')

  const stats = {
    totalClients: 156, activeClients: 89, totalRevenue: 4520000, monthlyRevenue: 450000,
    totalMembers: 2456, activeMembers: 2100, totalSocieties: 89, pendingRequests: 12,
    totalExpenses: 125000, totalLoans: 890000, totalPassbooks: 56
  }

  const clients = [
    { id: 1, name: 'Green Valley Society', email: 'admin@greenvalley.com', phone: '+91 98765 43210', address: '123 Green Valley Road, Bangalore, Karnataka', status: 'ACTIVE', plan: 'PRO', members: 245, revenue: 125000, expenses: 45000, loans: 89000, passbooks: 12, joinDate: '2024-01-15', lastLogin: '2024-01-30', subscriptionEndsAt: '2024-12-31', created: '2024-01-15' },
    { id: 2, name: 'Sunset Apartments', email: 'admin@sunsetapartments.com', phone: '+91 98765 43211', address: '456 Sunset Boulevard, Mumbai, Maharashtra', status: 'TRIAL', plan: 'TRIAL', members: 156, revenue: 0, expenses: 12000, loans: 0, passbooks: 8, joinDate: '2024-01-20', subscriptionEndsAt: '2024-02-20', created: '2024-01-20' },
    { id: 3, name: 'Royal Residency', email: 'admin@royalresidency.com', phone: '+91 98765 43212', address: '789 Royal Street, Delhi', status: 'EXPIRED', plan: 'BASIC', members: 89, revenue: 45000, expenses: 35000, loans: 15000, passbooks: 5, joinDate: '2023-12-01', subscriptionEndsAt: '2024-01-31', created: '2023-12-01' },
    { id: 4, name: 'Blue Sky Heights', email: 'admin@blueskyheights.com', phone: '+91 98765 43213', address: '321 Blue Sky Avenue, Pune', status: 'LOCKED', plan: 'ENTERPRISE', members: 312, revenue: 280000, expenses: 95000, loans: 200000, passbooks: 15, joinDate: '2024-01-10', subscriptionEndsAt: '2024-06-30', created: '2024-01-10' }
  ]

  const recentActivities = [
    { id: 1, type: 'client_registered', client: 'Green Valley Society', time: '2 hours ago', icon: Users },
    { id: 2, type: 'payment_received', client: 'Sunset Apartments', time: '4 hours ago', icon: DollarSign },
    { id: 3, type: 'client_upgraded', client: 'Royal Residency', time: '6 hours ago', icon: TrendingUp },
    { id: 4, type: 'new_member', client: 'Blue Sky Heights', time: '8 hours ago', icon: UserCheck },
    { id: 5, type: 'expense_added', client: 'Green Valley Society', time: '10 hours ago', icon: FileText },
    { id: 6, type: 'loan_approved', client: 'Sunset Apartments', time: '12 hours ago', icon: CreditCard }
  ]

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) || client.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || client.status === selectedStatus;
    const matchesPlan = selectedPlan === 'all' || client.plan === selectedPlan;
    return matchesSearch && matchesStatus && matchesPlan;
  });

  const handleViewClient = (clientId: number) => toast.success(`Opening details for ${clients.find(c => c.id === clientId)?.name}`);
  const handleEditClient = (clientId: number) => toast.info(`Editing client ${clients.find(c => c.id === clientId)?.name}`);
  const handleDeleteClient = (clientId: number) => toast.error(`Deleted client ${clients.find(c => c.id === clientId)?.name}`);
  const handleRefreshData = () => toast.success('Data refreshed successfully');
  const handleExportData = (format: 'csv' | 'pdf') => toast.success(`Exporting data as ${format.toUpperCase()}`);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Super Admin Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400">Manage your entire platform</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={handleRefreshData}><RefreshCw className="h-4 w-4 mr-2" />Refresh</Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2" />Export</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleExportData('csv')}>Export as CSV</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportData('pdf')}>Export as PDF</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={() => window.location.href = '/login'}><LogOut className="h-4 w-4 mr-2" />Logout</Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Stats Cards JSX */}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            {/* Tabs Trigger JSX */}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle>Recent Activities</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivities.map((activity) => {
                      const Icon = activity.icon;
                      return (
                        <div key={activity.id} className="flex items-center gap-3 p-3 border-b last:border-0">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center"><Icon className="h-4 w-4 text-blue-600" /></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{activity.type.replace(/_/g, ' ')}</p>
                            <p className="text-xs text-gray-600">{activity.client} • {activity.time}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
              <Card>
                {/* Quick Actions JSX */}
              </Card>
            </div>
          </TabsContent>

          {/* Clients Tab */}
          <TabsContent value="clients" className="space-y-6">
            <Card>
              <CardHeader>{/* Header JSX */}</CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-6">
                  {/* Filter JSX */}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Client</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Plan</th>
                        <th className="text-left py-3 px-4">Members</th>
                        <th className="text-left py-3 px-4">Revenue</th>
                        <th className="text-left py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredClients.map((client) => (
                        <tr key={client.id} className="border-b">
                          <td className="py-3 px-4">
                            <div>{client.name}</div>
                            <div className="text-sm text-gray-600">{client.email}</div>
                          </td>
                          <td className="py-3 px-4"><Badge>{client.status}</Badge></td>
                          <td className="py-3 px-4"><Badge>{client.plan}</Badge></td>
                          <td className="py-3 px-4">{client.members}</td>
                          <td className="py-3 px-4">₹{client.revenue.toLocaleString()}</td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" onClick={() => handleViewClient(client.id)}><Eye className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="sm" onClick={() => handleEditClient(client.id)}><Edit className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDeleteClient(client.id)}><Trash2 className="h-4 w-4" /></Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Analytics and Activities Tabs */}
          <TabsContent value="analytics">{/* Analytics Content */}</TabsContent>
          <TabsContent value="activities">{/* Activities Content */}</TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
