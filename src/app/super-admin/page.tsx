"use client"

import React, { useEffect, useMemo, useState } from "react"
import {
  Shield, LogOut, Plus, RefreshCw, Database, Activity, Download, Play,
  MoreHorizontal, CheckCircle, XCircle, Clock, Loader2, Trash2, Edit
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

// --- Types
interface Client {
  id: string | number
  name: string
  plan?: string
  status?: string
  members?: number
  revenue?: string
  contact?: string
  last_active_at?: string
  join_date?: string
  phone?: string
  address?: string
  website?: string
  description?: string
  rating?: number
}

// --- Safe helpers
const safe = (v: any) => (v === null || v === undefined ? "-" : String(v))
const formatDate = (d?: string) => {
  if (!d) return "Never"
  try {
    return new Date(d).toLocaleString()
  } catch {
    return d
  }
}

export default function SuperAdminDashboard() {
  const router = useRouter()

  // UI state
  const [activeTab, setActiveTab] = useState<string>("overview")

  // Clients state
  const [clients, setClients] = useState<Client[]>([])
  const [loadingClients, setLoadingClients] = useState<boolean>(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)

  // Stats
  const [stats, setStats] = useState<any>({
    total: 0,
    active: 0,
    totalRevenue: 0,
    totalMembers: 0,
    avgRating: 0
  })
  const [loadingStats, setLoadingStats] = useState<boolean>(false)

  // Filters / search
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [planFilter, setPlanFilter] = useState<string>("All")
  const [statusFilter, setStatusFilter] = useState<string>("All")

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [newClientData, setNewClientData] = useState<Partial<Client>>({
    name: "",
    contact: "",
    plan: "TRIAL"
  })
  const [editingClient, setEditingClient] = useState<Partial<Client> | null>(null)

  // Running task indicators
  const [runningTasks, setRunningTasks] = useState<Set<string>>(new Set())
  const [globalLoading, setGlobalLoading] = useState<boolean>(false)

  // --- Data fetching functions (talk to /api/super-admin/*)
  const fetchClients = async () => {
    setLoadingClients(true)
    try {
      const res = await fetch("/api/super-admin/clients/list", { cache: "no-store" })
      if (!res.ok) throw new Error("Failed to fetch clients")
      const json = await res.json()
      setClients(json.clients || [])
    } catch (e: any) {
      console.error(e)
      toast.error("Could not load clients")
    } finally {
      setLoadingClients(false)
    }
  }

  const fetchStats = async () => {
    setLoadingStats(true)
    try {
      const res = await fetch("/api/super-admin/clients/stats", { cache: "no-store" })
      if (!res.ok) throw new Error("Failed to fetch stats")
      const json = await res.json()
      setStats(json.stats || {})
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingStats(false)
    }
  }

  // initial load & when tab changes to automation/overview
  useEffect(() => {
    fetchClients()
    fetchStats()
  }, [])

  // Derived filtered clients
  const filteredClients = useMemo(() => {
    return clients.filter(c => {
      if (searchTerm && !c.name.toLowerCase().includes(searchTerm.toLowerCase())) return false
      if (planFilter !== "All" && c.plan !== planFilter) return false
      if (statusFilter !== "All" && c.status !== statusFilter) return false
      return true
    })
  }, [clients, searchTerm, planFilter, statusFilter])

  // --- Actions: Add / Update / Delete / Lock / Unlock
  const handleAddClient = async () => {
    if (!newClientData.name || !newClientData.contact) {
      toast.error("Name and contact required")
      return
    }
    setGlobalLoading(true)
    try {
      const res = await fetch("/api/super-admin/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newClientData)
      })
      if (!res.ok) throw new Error("Add failed")
      const json = await res.json()
      // Insert returned server client at top
      setClients(prev => [json.client, ...prev])
      setIsAddOpen(false)
      setNewClientData({ name: "", contact: "", plan: "TRIAL" })
      toast.success("Client added")
      fetchStats()
    } catch (e) {
      console.error(e)
      toast.error("Failed to add client")
    } finally {
      setGlobalLoading(false)
    }
  }

  const handleStartTask = async (taskName: string) => {
    if (runningTasks.has(taskName)) return
    setRunningTasks(prev => new Set(prev).add(taskName))
    toast.info(`Starting ${taskName}...`)
    try {
      // call task endpoint - implement backend to run task
      await fetch(`/api/super-admin/tasks/run?task=${encodeURIComponent(taskName)}`, { method: "POST" })
      toast.success(`${taskName} executed`)
      // refresh logs/stats/clients if needed
      fetchStats()
      fetchClients()
    } catch (e) {
      console.error(e)
      toast.error(`Task ${taskName} failed`)
    } finally {
      setRunningTasks(prev => {
        const newSet = new Set(prev)
        newSet.delete(taskName)
        return newSet
      })
    }
  }

  const handleDelete = async (c: Client) => {
    if (!confirm(`Delete ${c.name}? This action cannot be undone.`)) return
    try {
      const res = await fetch(`/api/super-admin/clients/${c.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Delete failed")
      setClients(prev => prev.filter(x => x.id !== c.id))
      toast.success("Client deleted")
      fetchStats()
    } catch (e) {
      console.error(e)
      toast.error("Delete failed")
    }
  }

  const handleLockUnlock = async (c: Client, lock = true) => {
    try {
      const path = lock ? "lock" : "unlock"
      const res = await fetch(`/api/super-admin/clients/${c.id}/${path}`, { method: "PATCH" })
      if (!res.ok) throw new Error("Failed")
      // update local list (server returns updated client ideally)
      const json = await res.json()
      const updated = json.client
      setClients(prev => prev.map(p => (p.id === updated.id ? updated : p)))
      toast.success(lock ? "Client locked" : "Client unlocked")
      fetchStats()
    } catch (e) {
      console.error(e)
      toast.error("Operation failed")
    }
  }

  const handleOpenEdit = (c: Client) => {
    setEditingClient(c)
    setIsEditOpen(true)
  }

  const handleUpdateClient = async () => {
    if (!editingClient?.id) return
    try {
      const res = await fetch(`/api/super-admin/clients/${editingClient.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingClient)
      })
      if (!res.ok) throw new Error("Update failed")
      const json = await res.json()
      setClients(prev => prev.map(p => (p.id === json.client.id ? json.client : p)))
      setIsEditOpen(false)
      setEditingClient(null)
      toast.success("Updated")
      fetchStats()
    } catch (e) {
      console.error(e)
      toast.error("Update failed")
    }
  }

  // Logout
  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/login")
  }

  // Small UI helpers
  const getStatusBadgeClass = (s?: string) => {
    if (!s) return ""
    const st = s.toLowerCase()
    if (st === "active") return "bg-green-100 text-green-800"
    if (st === "trial") return "bg-blue-100 text-blue-800"
    if (st === "expired") return "bg-red-100 text-red-800"
    return "bg-gray-100 text-gray-800"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-indigo-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Super Admin Dashboard</h1>
                <p className="text-sm text-gray-500">Manage societies & automation</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-indigo-100 text-indigo-800 px-3 py-1">Safe Mode Active</Badge>
              <Button variant="ghost" onClick={handleLogout} className="text-red-600 hover:bg-red-50">
                <LogOut className="h-4 w-4 mr-2" /> Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md bg-white border shadow-sm rounded-lg p-1">
            <TabsTrigger value="overview">Societies</TabsTrigger>
            <TabsTrigger value="automation">Automation</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">Total</CardTitle></CardHeader>
                <CardContent><div className="text-2xl font-bold">{loadingStats ? <Loader2 className="inline animate-spin" /> : stats.total}</div></CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">Active</CardTitle></CardHeader>
                <CardContent><div className="text-2xl font-bold text-green-600">{loadingStats ? "-" : stats.active}</div></CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">Revenue</CardTitle></CardHeader>
                <CardContent><div className="text-2xl font-bold">${loadingStats ? "-" : Number(stats.totalRevenue || 0).toLocaleString()}</div></CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">Members</CardTitle></CardHeader>
                <CardContent><div className="text-2xl font-bold text-blue-600">{loadingStats ? "-" : stats.totalMembers}</div></CardContent>
              </Card>
            </div>

            {/* Clients table header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Registered Societies</h2>
                <p className="text-sm text-gray-500">Manage clients and subscriptions</p>
              </div>
              <div className="flex items-center gap-3">
                <Input placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-36"><SelectValue placeholder="All Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Trial">Trial</SelectItem>
                    <SelectItem value="Expired">Expired</SelectItem>
                    <SelectItem value="Locked">Locked</SelectItem>
                  </SelectContent>
                </Select>
                <Button className="bg-indigo-600" onClick={() => setIsAddOpen(true)}><Plus className="h-4 w-4 mr-2" /> Add</Button>
              </div>
            </div>

            <Card className="border-none shadow-md">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Members</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingClients ? (
                      <TableRow><TableCell colSpan={5} className="text-center p-8"><Loader2 className="animate-spin inline mr-2" /> Loading...</TableCell></TableRow>
                    ) : filteredClients.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="text-center p-8 text-gray-500">No societies found</TableCell></TableRow>
                    ) : (
                      filteredClients.map(c => (
                        <TableRow key={c.id} className="hover:bg-gray-50">
                          <TableCell className="font-medium">{c.name}<div className="text-xs text-gray-500">{c.contact}</div></TableCell>
                          <TableCell><Badge className="bg-indigo-50 text-indigo-800">{safe(c.plan)}</Badge></TableCell>
                          <TableCell><span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(c.status)}`}>{safe(c.status)}</span></TableCell>
                          <TableCell>{safe(c.members)}</TableCell>
                          <TableCell className="text-right">
                            <div className="inline-flex items-center gap-2">
                              <Button variant="ghost" size="sm" onClick={() => { setSelectedClient(c); setActiveTab("automation") }}>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(c)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDelete(c)}>
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Automation Tab */}
          <TabsContent value="automation" className="space-y-6">
            <Card>
              <CardHeader><CardTitle>System Automation Center (Live)</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardContent className="p-6 flex flex-col gap-4">
                      <div className="flex items-center gap-2 mb-2"><Download className="h-5 w-5 text-blue-600" /><h3 className="font-bold">Backup</h3></div>
                      <Button onClick={() => handleStartTask("database-backup")} disabled={runningTasks.has("database-backup")}>
                        {runningTasks.has("database-backup") ? <RefreshCw className="animate-spin h-4 w-4" /> : "Run Backup"}
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6 flex flex-col gap-4">
                      <div className="flex items-center gap-2 mb-2"><Database className="h-5 w-5 text-indigo-600" /><h3 className="font-bold">Schema</h3></div>
                      <Button variant="outline" onClick={() => handleStartTask("schema-sync")} disabled={runningTasks.has("schema-sync")}>
                        Sync Schema
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6 flex flex-col gap-4">
                      <div className="flex items-center gap-2 mb-2"><Activity className="h-5 w-5 text-green-600" /><h3 className="font-bold">Health</h3></div>
                      <Button variant="secondary" onClick={() => handleStartTask("health-check")} disabled={runningTasks.has("health-check")}>
                        Check System
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <Card className="bg-gray-50 border-dashed border-2">
              <CardContent className="p-12 text-center">
                <Activity className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">Analytics Coming Soon</h3>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Society</DialogTitle>
            <DialogDescription>Register a new society</DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 py-4">
            <label className="text-sm font-medium">Name</label>
            <Input value={newClientData.name || ""} onChange={(e) => setNewClientData(prev => ({ ...prev, name: e.target.value }))} />
            <label className="text-sm font-medium">Contact Email</label>
            <Input value={newClientData.contact || ""} onChange={(e) => setNewClientData(prev => ({ ...prev, contact: e.target.value }))} />
            <label className="text-sm font-medium">Initial Plan</label>
            <Select value={String(newClientData.plan || "TRIAL")} onValueChange={(v) => setNewClientData(prev => ({ ...prev, plan: v }))}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="TRIAL">Trial</SelectItem>
                <SelectItem value="BASIC">Basic</SelectItem>
                <SelectItem value="PRO">Pro</SelectItem>
                <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button className="bg-indigo-600" onClick={handleAddClient} disabled={globalLoading}>
              {globalLoading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />} Add Society
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Society</DialogTitle>
            <DialogDescription>Update society information</DialogDescription>
          </DialogHeader>

          {editingClient && (
            <div className="grid gap-3 py-4">
              <label className="text-sm font-medium">Name</label>
              <Input value={editingClient.name || ""} onChange={(e) => setEditingClient(prev => ({ ...(prev || {}), name: e.target.value }))} />
              <label className="text-sm font-medium">Contact Email</label>
              <Input value={editingClient.contact || ""} onChange={(e) => setEditingClient(prev => ({ ...(prev || {}), contact: e.target.value }))} />
              <label className="text-sm font-medium">Plan</label>
              <Select value={String(editingClient.plan || "TRIAL")} onValueChange={(v) => setEditingClient(prev => ({ ...(prev || {}), plan: v }))}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="TRIAL">Trial</SelectItem>
                  <SelectItem value="BASIC">Basic</SelectItem>
                  <SelectItem value="PRO">Pro</SelectItem>
                  <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsEditOpen(false); setEditingClient(null) }}>Cancel</Button>
            <Button className="bg-indigo-600" onClick={handleUpdateClient}><Edit className="h-4 w-4 mr-2" /> Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )

  // helper inside component
  function getStatusBadgeClass(s?: string) {
    if (!s) return "bg-gray-100 text-gray-800"
    const st = s.toLowerCase()
    if (st === "active") return "bg-green-100 text-green-800"
    if (st === "trial") return "bg-blue-100 text-blue-800"
    if (st === "expired") return "bg-red-100 text-red-800"
    return "bg-gray-100 text-gray-800"
  }
}
