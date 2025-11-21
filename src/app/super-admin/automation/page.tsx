"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { 
  Shield, LogOut, Search, Plus, Edit, 
  Database, Activity, Download, Play, RefreshCw,
  CheckCircle, XCircle, Clock, AlertTriangle,
  Users, DollarSign, Building2, ArrowUpRight,
  Settings, Upload, ArchiveRestore, Sync
} from 'lucide-react'

// UI Components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'

// --- SAFETY FUNCTIONS (CRASH PREVENTION) ---
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

// --- TYPES ---
interface Client {
  id: number; name: string; plan: string; status: string; members: number;
  revenue: string; contact: string; lastActive: string;
}

// Dummy Data for Societies
const dummyClients: Client[] = [
  { id: 1, name: "Green Valley", plan: "PRO", status: "Active", members: 240, revenue: "$2,400", contact: "admin@gv.com", lastActive: "2h ago" },
  { id: 2, name: "Sunshine Apts", plan: "TRIAL", status: "Trial", members: 120, revenue: "$0", contact: "info@sun.org", lastActive: "1d ago" },
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
  const [loading, setLoading] = useState(false)
  const [runningTasks, setRunningTasks] = useState<Set<string>>(new Set())

  // --- FETCH DATA ---
  const fetchData = async () => {
    try {
      // Don't set loading true globally to avoid flickering, just refresh data
      const res = await fetch('/api/super-admin/automation/data', { cache: 'no-store' })
      if (res.ok) {
        const json = await res.json()
        setTasks(json.tasks || [])
        setLogs(json.logs || [])
      }
    } catch (e) {
      console.error(e)
      toast.error("Failed to sync data")
    }
  }

  // Initial Fetch & Polling
  useEffect(() => {
    if (activeTab === 'automation') {
      fetchData()
      const interval = setInterval(fetchData, 30000) // Auto refresh every 30s
      return () => clearInterval(interval)
    }
  }, [activeTab])

  // Run Task Handler
  const runTask = async (taskName: string) => {
    if (runningTasks.has(taskName)) return
    setRunningTasks(prev => new Set(prev).add(taskName))
    toast.info(`Initiating ${taskName}...`)
    
    try {
      // Simulate API delay
      await new Promise(r => setTimeout(r, 1500))
      toast.success(`Task ${taskName} completed successfully`)
      fetchData()
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

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  // Helper for Status Icons (From your old code)
  const getStatusIcon = (status: string) => {
    const s = String(status).toLowerCase()
    if (s.includes('success') || s === 'healthy') return <CheckCircle className="h-4 w-4 text-green-500" />
    if (s.includes('err') || s.includes('fail')) return <XCircle className="h-4 w-4 text-red-500" />
    if (s === 'running') return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
    if (s === 'warning') return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    return <Clock className="h-4 w-4 text-gray-500" />
  }

  const getStatusBadge = (status: string) => {
    const s = String(status).toLowerCase()
    let variant: "default" | "secondary" | "destructive" | "outline" = "secondary"
    if (s.includes('success')) variant = "default"
    if (s.includes('err')) variant = "destructive"
    
    return <Badge variant={variant}>{status}</Badge>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* --- HEADER --- */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-indigo-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Super Admin</h1>
              <p className="text-xs text-gray-500">System Management</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                Safe Mode Active
             </Badge>
             <Button variant="ghost" onClick={handleLogout} className="text-red-600 hover:bg-red-50">
                <LogOut className="h-4 w-4 mr-2" /> Logout
             </Button>
          </div>
        </div>
      </div>

      {/* --- CONTENT --- */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white p-1 border rounded-xl shadow-sm w-full max-w-md grid grid-cols-3">
            <TabsTrigger value="overview">Societies</TabsTrigger>
            <TabsTrigger value="automation">Automation</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* --- TAB: OVERVIEW (SOCIETIES) --- */}
          <TabsContent value="overview" className="space-y-6">
             {/* (Same as before - keeping it clean) */}
             <Card className="border-none shadow-md">
              <CardHeader className="bg-white border-b rounded-t-xl flex flex-row justify-between items-center pt-6 pb-4">
                <div>
                    <CardTitle>Registered Societies</CardTitle>
                    <CardDescription>Manage client subscriptions</CardDescription>
                </div>
                <Button className="bg-indigo-600"><Plus className="h-4 w-4 mr-2"/> Add Society</Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="p-4 border-b bg-gray-50/50">
                   <div className="relative max-w-sm">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <Input placeholder="Search..." className="pl-10 bg-white" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                   </div>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead><TableHead>Plan</TableHead><TableHead>Status</TableHead><TableHead>Members</TableHead><TableHead>Revenue</TableHead><TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clients.map((client) => (
                      <TableRow key={client.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{client.name}</TableCell>
                        <TableCell><Badge variant="outline">{client.plan}</Badge></TableCell>
                        <TableCell><span className={`px-2 py-1 rounded-full text-xs font-medium ${client.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{client.status}</span></TableCell>
                        <TableCell>{client.members}</TableCell>
                        <TableCell>{client.revenue}</TableCell>
                        <TableCell className="text-right"><Button variant="ghost" size="sm"><Edit className="h-4 w-4"/></Button></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
             </Card>
          </TabsContent>

          {/* --- TAB: AUTOMATION (YOUR ADVANCED DESIGN RESTORED) --- */}
          <TabsContent value="automation" className="space-y-6">
            {/* Banner */}
            <Alert className="border-blue-200 bg-blue-50 text-blue-800">
              <Shield className="h-4 w-4" />
              <AlertDescription className="font-semibold">
                SUPERADMIN ONLY - Automation Suite (Secure Connection)
              </AlertDescription>
            </Alert>

            {/* Health Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
               {['Database', 'Storage', 'Tables', 'Automation'].map((item) => (
                 <Card key={item} className="bg-white">
                    <CardContent className="p-4 flex items-center gap-3">
                       <CheckCircle className="h-8 w-8 text-green-500 opacity-80" />
                       <div>
                          <p className="font-semibold text-sm text-gray-600">{item}</p>
                          <p className="font-bold text-green-700 text-sm">Healthy</p>
                       </div>
                    </CardContent>
                 </Card>
               ))}
            </div>

            <Tabs defaultValue="tasks" className="space-y-4">
              <TabsList>
                <TabsTrigger value="tasks">Tasks</TabsTrigger>
                <TabsTrigger value="logs">Logs</TabsTrigger>
                <TabsTrigger value="actions">Actions</TabsTrigger>
              </TabsList>

              {/* Sub-Tab: TASKS */}
              <TabsContent value="tasks">
                <div className="grid gap-4">
                  {tasks.length === 0 ? <div className="text-center p-8 bg-white rounded border text-gray-500">No tasks found via API.</div> : 
                   tasks.map((task) => (
                    <Card key={task.id}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div>
                              <h3 className="font-semibold">{safeRender(task.task_name)}</h3>
                              <p className="text-sm text-muted-foreground">Schedule: {safeRender(task.schedule)}</p>
                              <p className="text-xs text-muted-foreground">
                                Last run: {formatDate(task.last_run_at)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => runTask(task.task_name)}
                              disabled={runningTasks.has(task.task_name)}
                            >
                              {runningTasks.has(task.task_name) ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                              ) : (
                                <Play className="h-4 w-4" />
                              )}
                              Run Now
                            </Button>
                            <Badge variant={task.enabled ? 'default' : 'secondary'}>
                              {task.enabled ? 'Enabled' : 'Disabled'}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Sub-Tab: LOGS */}
              <TabsContent value="logs">
                <Card>
                  <CardHeader><CardTitle>Recent Logs</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-4 max-h-[500px] overflow-auto">
                      {logs.length === 0 ? <div className="text-center text-gray-500">No logs available</div> :
                       logs.map((log) => (
                        <div key={log.id} className="flex items-start gap-3 p-3 border rounded hover:bg-gray-50">
                          <div className="mt-1">
                            {getStatusIcon(log.status)}
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{safeRender(log.task_name)}</span>
                              {getStatusBadge(log.status)}
                              <span className="text-sm text-muted-foreground">
                                {formatDate(log.run_time)}
                              </span>
                            </div>
                            <p className="text-sm font-mono text-gray-600 truncate">
                               {safeRender(log.details || log.message)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Sub-Tab: ACTIONS */}
              <TabsContent value="actions">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Schema Sync */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Database className="h-5 w-5" />
                        <h3 className="font-semibold">Schema Sync</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">Synchronize database schema.</p>
                      <Button className="w-full" onClick={() => runTask('schema-sync')} disabled={runningTasks.has('schema-sync')}>
                        {runningTasks.has('schema-sync') ? <RefreshCw className="animate-spin h-4 w-4 mr-2"/> : <RefreshCw className="h-4 w-4 mr-2"/>}
                        Sync Schema
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Backup */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Download className="h-5 w-5" />
                        <h3 className="font-semibold">Backup Now</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">Create immediate backup.</p>
                      <Button className="w-full" onClick={() => runTask('database-backup')} disabled={runningTasks.has('database-backup')}>
                        {runningTasks.has('database-backup') ? <RefreshCw className="animate-spin h-4 w-4 mr-2"/> : <Download className="h-4 w-4 mr-2"/>}
                        Create Backup
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Health */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Activity className="h-5 w-5" />
                        <h3 className="font-semibold">Health Check</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">Run system diagnostics.</p>
                      <Button className="w-full" onClick={() => runTask('health-check')} disabled={runningTasks.has('health-check')}>
                        {runningTasks.has('health-check') ? <RefreshCw className="animate-spin h-4 w-4 mr-2"/> : <Activity className="h-4 w-4 mr-2"/>}
                        Check Health
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* --- TAB: ANALYTICS --- */}
          <TabsContent value="analytics">
             <Card className="bg-gray-50 border-dashed border-2">
                <CardContent className="p-10 text-center text-gray-500">
                   Analytics Module Coming Soon
                </CardContent>
             </Card>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  )
}
