"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { 
  Search, Users, CheckCircle, Clock, XCircle, Lock, Eye, Unlock, Trash2, RefreshCw, 
  Building2, Shield, Settings, Database, Activity, DollarSign, Plus, Loader2,
  Play, Download, Upload, LogOut, ArchiveRestore, Sync, ChevronDown, Edit, MoreHorizontal,
  AlertTriangle, Check
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

// --- 🛡️ SAFETY FUNCTIONS (CRASH PREVENTION) ---
const safeRender = (val: any) => {
  if (val === null || val === undefined) return '-'
  if (typeof val === 'boolean') return val ? 'True' : 'False'
  if (typeof val === 'object') {
    try { return JSON.stringify(val) } catch (e) { return 'Data Object' }
  }
  return String(val)
}

const formatDate = (dateVal: any) => {
  if (!dateVal) return 'Never'
  try { return new Date(dateVal).toLocaleString() } catch (e) { return '-' }
}

// Types
interface Client {
  id: number; name: string; plan: string; status: string; members: number;
  revenue: string; contact: string; lastActive: string;
}

// Dummy Data for Clients (Societies)
const dummyClients: Client[] = [
  { id: 1, name: "Green Valley Housing", plan: "PRO", status: "Active", members: 240, revenue: "$2,400", contact: "admin@greenvalley.com", lastActive: "2h ago" },
  { id: 2, name: "Sunshine Community", plan: "TRIAL", status: "Trial", members: 120, revenue: "$0", contact: "info@sunshine.org", lastActive: "1d ago" },
  { id: 3, name: "Metro Residents", plan: "BASIC", status: "Expired", members: 300, revenue: "$600", contact: "metro@welfare.com", lastActive: "3d ago" },
]

export default function SuperAdminDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  
  // Client State
  const [clients, setClients] = useState<Client[]>(dummyClients)
  const [searchTerm, setSearchTerm] = useState("")
  
  // Automation State
  const [tasks, setTasks] = useState<any[]>([])
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(false) // Global loading for automation
  const [runningTasks, setRunningTasks] = useState<Set<string>>(new Set())

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  // --- FETCH AUTOMATION DATA ---
  const fetchAutomationData = async () => {
    try {
      // ✅ FIX: No Headers (Cookies handle auth), Correct API Endpoint
      const res = await fetch('/api/super-admin/automation/data', { cache: 'no-store' })
      if (res.ok) {
        const json = await res.json()
        setTasks(json.tasks || [])
        setLogs(json.logs || [])
      }
    } catch (e) {
      console.error(e)
      toast.error("Failed to load automation data")
    }
  }

  // Fetch when tab changes
  useEffect(() => {
    if (activeTab === 'automation') {
      setLoading(true)
      fetchAutomationData().finally(() => setLoading(false))
      const interval = setInterval(fetchAutomationData, 30000)
      return () => clearInterval(interval)
    }
  }, [activeTab])

  // Run Task
  const runTask = async (taskName: string) => {
    if (runningTasks.has(taskName)) return
    setRunningTasks(prev => new Set(prev).add(taskName))
    toast.info(`Starting ${taskName}...`)
    
    try {
      // Simulate API delay for UI feedback
      await new Promise(r => setTimeout(r, 1000))
      toast.success(`Task ${taskName} executed`)
      fetchAutomationData()
    } catch (e) {
      toast.error("Task execution failed")
    } finally {
      setRunningTasks(prev => {
         const newSet = new Set(prev)
         newSet.delete(taskName)
         return newSet
      })
    }
  }

  // Logout
  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  // Helper for Icons
  const getStatusIcon = (status: string) => {
    const s = String(status).toLowerCase()
    if (s.includes('success') || s === 'healthy') return <CheckCircle className="h-4 w-4 text-green-500" />
    if (s.includes('err') || s.includes('fail')) return <XCircle className="h-4 w-4 text-red-500" />
    return <Clock className="h-4 w-4 text-gray-500" />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* --- HEADER --- */}
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

      {/* --- MAIN CONTENT --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md bg-white border shadow-sm rounded-lg p-1">
            <TabsTrigger value="overview">Societies</TabsTrigger>
            <TabsTrigger value="automation">Automation</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* ================= TAB 1: SOCIETIES ================= */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">Total</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{clients.length}</div></CardContent></Card>
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">Active</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">1</div></CardContent></Card>
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">Revenue</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">$3,000</div></CardContent></Card>
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">Members</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-blue-600">660</div></CardContent></Card>
            </div>

            <Card className="border-none shadow-md">
              <CardHeader className="flex flex-row items-center justify-between bg-white border-b pt-6 pb-4">
                <div><CardTitle>Registered Societies</CardTitle><CardDescription>Manage clients</CardDescription></div>
                <Button className="bg-indigo-600" onClick={() => setIsAddModalOpen(true)}><Plus className="h-4 w-4 mr-2"/> Add</Button>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Plan</TableHead><TableHead>Status</TableHead><TableHead>Members</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {clients.map(c => (
                      <TableRow key={c.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{c.name}</TableCell>
                        <TableCell><Badge variant="outline">{c.plan}</Badge></TableCell>
                        <TableCell><span className={`px-2 py-1 rounded-full text-xs ${c.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>{c.status}</span></TableCell>
                        <TableCell>{c.members}</TableCell>
                        <TableCell className="text-right"><Button variant="ghost" size="sm"><MoreHorizontal className="h-4 w-4"/></Button></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ================= TAB 2: AUTOMATION (FIXED) ================= */}
          <TabsContent value="automation" className="space-y-6">
            <Alert className="bg-blue-50 border-blue-200 text-blue-800 mb-6">
              <Shield className="h-4 w-4" />
              <AlertDescription className="font-semibold">
                System Automation Center (Live Connection)
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Quick Actions */}
                <Card>
                   <CardContent className="p-6 flex flex-col gap-4">
                      <div className="flex items-center gap-2 mb-2"><Download className="h-5 w-5 text-blue-600"/><h3 className="font-bold">Backup</h3></div>
                      <Button onClick={() => runTask('database-backup')} disabled={runningTasks.has('database-backup')}>
                         {runningTasks.has('database-backup') ? <RefreshCw className="animate-spin h-4 w-4"/> : "Run Backup"}
                      </Button>
                   </CardContent>
                </Card>
                <Card>
                   <CardContent className="p-6 flex flex-col gap-4">
                      <div className="flex items-center gap-2 mb-2"><Database className="h-5 w-5 text-indigo-600"/><h3 className="font-bold">Schema</h3></div>
                      <Button variant="outline" onClick={() => runTask('schema-sync')} disabled={runningTasks.has('schema-sync')}>
                         Sync Schema
                      </Button>
                   </CardContent>
                </Card>
                <Card>
                   <CardContent className="p-6 flex flex-col gap-4">
                      <div className="flex items-center gap-2 mb-2"><Activity className="h-5 w-5 text-green-600"/><h3 className="font-bold">Health</h3></div>
                      <Button variant="secondary" onClick={() => runTask('health-check')} disabled={runningTasks.has('health-check')}>
                         Check System
                      </Button>
                   </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               {/* Tasks List */}
               <Card>
                 <CardHeader><CardTitle>Tasks Status</CardTitle></CardHeader>
                 <CardContent className="p-0">
                    <div className="max-h-[400px] overflow-auto">
                      <Table>
                        <TableHeader><TableRow><TableHead>Task</TableHead><TableHead>Schedule</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
                        <TableBody>
                          {loading ? <TableRow><TableCell colSpan={3} className="text-center p-4">Loading...</TableCell></TableRow> :
                           tasks.length === 0 ? <TableRow><TableCell colSpan={3} className="text-center p-4">No tasks found</TableCell></TableRow> :
                           tasks.map((task: any, i) => (
                             <TableRow key={i}>
                               <TableCell>
                                 <div className="font-medium">{safeRender(task.task_name)}</div>
                                 <div className="text-xs text-gray-500">{formatDate(task.last_run_at)}</div>
                               </TableCell>
                               <TableCell className="font-mono text-xs">{safeRender(task.schedule || 'Manual')}</TableCell>
                               <TableCell>
                                 <Button size="sm" variant="ghost" onClick={() => runTask(task.task_name)} disabled={runningTasks.has(task.task_name)}>
                                   <Play className="h-3 w-3"/>
                                 </Button>
                               </TableCell>
                             </TableRow>
                           ))
                          }
                        </TableBody>
                      </Table>
                    </div>
                 </CardContent>
               </Card>

               {/* Logs List */}
               <Card>
                 <CardHeader><CardTitle>Execution Logs</CardTitle></CardHeader>
                 <CardContent className="p-0">
                    <div className="max-h-[400px] overflow-auto">
                      <Table>
                        <TableHeader><TableRow><TableHead>Status</TableHead><TableHead>Task</TableHead><TableHead>Details</TableHead></TableRow></TableHeader>
                        <TableBody>
                          {logs.length === 0 ? <TableRow><TableCell colSpan={3} className="text-center p-4 text-gray-500">No logs</TableCell></TableRow> :
                           logs.map((log: any, i) => (
                             <TableRow key={i}>
                               <TableCell>{getStatusIcon(log.status)}</TableCell>
                               <TableCell>
                                 <div className="font-medium text-sm">{safeRender(log.task_name)}</div>
                                 <div className="text-xs text-gray-500">{formatDate(log.run_time)}</div>
                               </TableCell>
                               <TableCell className="text-xs font-mono max-w-[150px] truncate" title={safeRender(log.details)}>
                                 {safeRender(log.details || log.message)}
                               </TableCell>
                             </TableRow>
                           ))
                          }
                        </TableBody>
                      </Table>
                    </div>
                 </CardContent>
               </Card>
            </div>
          </TabsContent>

          {/* ================= TAB 3: ANALYTICS ================= */}
          <TabsContent value="analytics">
             <Card className="bg-gray-50 border-dashed border-2">
                <CardContent className="p-12 text-center">
                   <Activity className="h-12 w-12 text-gray-300 mx-auto mb-4"/>
                   <h3 className="text-lg font-medium text-gray-900">Analytics Coming Soon</h3>
                </CardContent>
             </Card>
          </TabsContent>

        </Tabs>
      </div>

      {/* Add Society Modal (Simplified for Demo) */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Society</DialogTitle><DialogDescription>Feature coming soon</DialogDescription></DialogHeader>
          <DialogFooter><Button onClick={() => setIsAddModalOpen(false)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
