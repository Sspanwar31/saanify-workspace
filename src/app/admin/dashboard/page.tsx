'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
// SOLUTION #1: Duplicate 'Users' import hata diya gaya hai.
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
    // SOLUTION #3: 'ENTERPRISESE' typo theek kiya gaya hai.
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
        { /* ... (Header JSX is fine, no changes needed) ... */ }
      </div>

      {/* Main Content */}
      <div className="p-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          { /* ... (Stats Cards JSX is fine, no changes needed) ... */ }
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            { /* ... (TabsList JSX is fine, no changes needed) ... */ }
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activities */}
              <Card>
                <CardHeader><CardTitle>Recent Activities</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivities.map((activity) => {
                      // SOLUTION #2: Icon component ko ainvayi nahi call kiya ja sakta, use ek variable mein daalna zaroori hai.
                      const Icon = activity.icon;
                      return (
                        <div key={activity.id} className="flex items-center gap-3 p-3 border-b last:border-0">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                            <Icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
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
              {/* Quick Actions */}
              <Card>
                { /* ... (Quick Actions JSX is fine, no changes needed) ... */ }
              </Card>
            </div>
          </TabsContent>

          {/* Clients Tab */}
          <TabsContent value="clients" className="space-y-6">
            <Card>
              <CardHeader>
                { /* ... (Client Management Header is fine) ... */ }
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-6">
                    {/* ... (Search Input is fine) ... */}
                    {/* ... (Status select is fine) ... */}
                    {/* SOLUTION #3: 'ENTERPRISESE' typo theek kiya gaya hai. */}
                    <select
                        value={selectedPlan}
                        onChange={(e) => setSelectedPlan(e.target.value)}
                        className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800"
                    >
                        <option value="all">All Plans</option>
                        <option value="TRIAL">Trial</option>
                        <option value="BASIC">Basic</option>
                        <option value="PRO">Pro</option>
                        <option value="ENTERPRISE">Enterprise</option>
                    </select>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    {/* SOLUTION #4: Table header ko body ke columns se match kiya gaya hai. */}
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 text-sm font-medium">Client</th>
                        <th className="text-left py-3 px-4 text-sm font-medium">Status</th>
                        <th className="text-left py-3 px-4 text-sm font-medium">Plan</th>
                        <th className="text-left py-3 px-4 text-sm font-medium">Members</th>
                        <th className="text-left py-3 px-4 text-sm font-medium">Revenue</th>
                        <th className="text-left py-3 px-4 text-sm font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredClients.map((client) => (
                        <tr key={client.id} className="border-b">
                          <td className="py-3 px-4">
                            <div className="font-medium">{client.name}</div>
                            <div className="text-sm text-gray-600">{client.email}</div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={ /* ... (status badge logic is fine) ... */ }>{client.status}</Badge>
                          </td>
                          <td className="py-3 px-4">
                             <Badge className={
                              client.plan === 'PRO' ? 'bg-purple-100 text-purple-800' :
                              client.plan === 'ENTERPRISE' ? 'bg-orange-100 text-orange-800' : // Corrected typo
                              client.plan === 'BASIC' ? 'bg-gray-100 text-gray-800' :
                              'bg-blue-100 text-blue-800'
                            }>{client.plan}</Badge>
                          </td>
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
          <TabsContent value="analytics">{ /* ... (This tab's JSX is fine) ... */ }</TabsContent>
          <TabsContent value="activities">{ /* ... (This tab's JSX is fine, already fixed icon) ... */ }</TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
