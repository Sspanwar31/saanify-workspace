"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { 
  Shield, LogOut, Search, Plus, Edit, 
  Database, Activity, Download, Play, RefreshCw,
  CheckCircle, XCircle, Clock, AlertTriangle,
  Users, DollarSign, Building2, ArrowUpRight
} from 'lucide-react'

// UI Components (ShadCN / Custom)
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

// --- SAFETY FUNCTIONS (CRASH PREVENTION) ---
// Ye function JSON object ko string me badal deta hai taaki page crash na ho
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

// Dummy Data for Societies (Tab 1)
const dummyClients: Client[] = [
  { id: 1, name: "Green Valley", plan: "PRO", status: "Active", members: 240, revenue: "$2,400", contact: "admin@gv.com", lastActive: "2h ago" },
  { id: 2, name: "Sunshine Apts", plan: "TRIAL", status: "Trial", members: 120, revenue: "$0", contact: "info@sun.org", lastActive: "1d ago" },
  { id: 3, name: "Royal Heights", plan: "BASIC", status: "Expired", members: 85, revenue: "$500", contact: "contact@royal.com", lastActive: "5d ago" },
]

export default function SuperAdminDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  
  // State
  const [clients, setClients] = useState<Client[]>(dummyClients)
  const [searchTerm, setSearchTerm] = useState("")
  const [tasks, setTasks] = useState<any[]>([])
  const [logs, setLogs] = useState<any[]>([])
  const [autoLoading, setAutoLoading] = useState(false)
  const [runningTasks, setRunningTasks] = useState<Set<string>>(new Set())

  // --- FETCH AUTOMATION DATA (Tab 2) ---
  const fetchAutomationData = async () => {
    try {
      setAutoLoading(true)
      // Real API Call
      const res = await fetch('/api/super-admin/automation/data', { cache: 'no-store' })
      if (res.ok) {
        const json = await res.json()
        setTasks(json.tasks || [])
        setLogs(json.logs || [])
      }
    } catch (e) {
      console.error(e)
      toast.error("Failed to load automation data")
    } finally {
      setAutoLoading(false)
    }
  }

  // Fetch data when Automation tab is clicked
  useEffect(() => {
    if (activeTab === 'automation') {
      fetchAutomationData()
    }
  }, [activeTab])

  // Run Task Handler
  const runTask = async (taskName: string) => {
    if (runningTasks.has(taskName)) return
    setRunningTasks(prev => new Set(prev).add(taskName))
    toast.info(`Starting ${taskName}...`)
    
    try {
      await new Promise(r => setTimeout(r, 1500)) // Fake loading effect
      toast.success(`Task ${taskName} executed successfully`)
      fetchAutomationData() // Refresh logs
    } catch (e) {
      toast.error("Task failed")
    } finally {
      setRunningTasks(prev => {
         const newSet = new Set(prev)
         newSet.delete(taskName)
         return newSet
      })
    }
  }

  // Logout Handler
  const handleLogout = async () => {
    try {
        await fetch('/api/auth/logout', { method: 'POST' })
        router.push('/login')
        router.refresh()
    } catch (error) {
        console.error(error)
    }
  }

  // Status Icons Helper
  const getStatusIcon = (status: string) => {
    const s = String(status).toLowerCase()
    if (s.includes('success') || s === 'healthy') return <CheckCircle className="h-4 w-4 text-green-500" />
    if (s.includes('err') || s.includes('fail')) return <XCircle className="h-4 w-4 text-red-500" />
    return <Clock className="h-4 w-4 text-gray-500" />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* --- HEADER --- */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 p-2 rounded-lg">
                <Shield className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">Super Admin</h1>
              <p className="text-xs text-gray-500">System Overview</p>
            </div>
          </div>
          <Button variant="ghost" onClick={handleLogout} className="text-red-600 hover:bg-red-50 hover:text-red-700">
              <LogOut className="h-4 w-4 mr-2" /> Logout
          </Button>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white p-1 border rounded-xl shadow-sm">
            <TabsTrigger value="overview" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
                <Building2 className="h-4 w-4 mr-2"/> Societies
            </TabsTrigger>
            <TabsTrigger value="automation" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
                <Activity className="h-4 w-4 mr-2"/> Automation
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
                <ArrowUpRight className="h-4 w-4 mr-2"/> Analytics
            </TabsTrigger>
          </TabsList>

          {/* ================= TAB 1: SOCIETIES ================= */}
          <TabsContent value="overview" className="space-y-6">
             {/* Stats Cards */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">Total Societies</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{clients.length}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">Active Revenue</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-green-600">$2,900</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">Total Members</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-blue-600">445</div></CardContent>
                </Card>
             </div>

             {/* Main Table */}
             <Card className="border-none shadow-md">
              <CardHeader className="flex flex-row items-center justify-between bg-white border-b rounded-t-xl pt-6 pb-4">
                <div>
                    <CardTitle>Registered Societies</CardTitle>
                    <CardDescription>Manage client subscriptions and status</CardDescription>
                </div>
                <Button className="bg-indigo-600 hover:bg-indigo-700"><Plus className="h-4 w-4 mr-2"/> Add Society</Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="p-4 border-b bg-gray-50/50">
                   <div className="relative max-w-sm">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <Input 
                        placeholder="Search societies..." 
                        className="pl-10 bg-white" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                   </div>
                </div>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Members</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clients.map((client) => (
                      <TableRow key={client.id} className="hover:bg-gray-50 transition-colors">
                        <TableCell>
                            <div className="font-medium text-gray-900">{client.name}</div>
                            <div className="text-xs text-gray-500">{client.contact}</div>
                        </TableCell>
                        <TableCell><Badge variant="outline" className="font-mono">{client.plan}</Badge></TableCell>
                        <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium 
                                ${client.status === 'Active' ? 'bg-green-100 text-green-700' : 
                                  client.status === 'Expired' ? 'bg-red-100 text-red-700' : 
                                  'bg-blue-100 text-blue-700'}`}>
                                {client.status}
                            </span>
                        </TableCell>
                        <TableCell className="text-gray-600"><Users className="inline h-3 w-3 mr-1"/>{client.members}</TableCell>
                        <TableCell className="font-medium">{client.revenue}</TableCell>
                        <TableCell className="text-right">
                           <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><Edit className="h-4 w-4 text-gray-500"/></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
             </Card>
          </TabsContent>

          {/* ================= TAB 2: AUTOMATION ================= */}
          <TabsContent value="automation" className="space-y-6">
            {/* Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
                   <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Download className="h-4 w-4"/> Database Backup</CardTitle></CardHeader>
                   <CardContent>
                      <p className="text-xs text-gray-500 mb-4">Create a snapshot of current data.</p>
                      <Button className="w-full bg-white text-black border hover:bg-gray-50" onClick={() => runTask('database-backup')} disabled={runningTasks.has('database-backup')}>
                         {runningTasks.has('database-backup') ? <RefreshCw className="animate-spin h-4 w-4"/> : "Run Backup"}
                      </Button>
                   </CardContent>
                </Card>
                <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-indigo-500">
                   <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Database className="h-4 w-4"/> Schema Sync</CardTitle></CardHeader>
                   <CardContent>
                      <p className="text-xs text-gray-500 mb-4">Sync Prisma with Database.</p>
                      <Button className="w-full bg-white text-black border hover:bg-gray-50" onClick={() => runTask('schema-sync')} disabled={runningTasks.has('schema-sync')}>
                         {runningTasks.has('schema-sync') ? <RefreshCw className="animate-spin h-4 w-4"/> : "Sync Now"}
                      </Button>
                   </CardContent>
                </Card>
                <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-green-500">
                   <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Activity className="h-4 w-4"/> Health Check</CardTitle></CardHeader>
                   <CardContent>
                      <p className="text-xs text-gray-500 mb-4">Monitor system connectivity.</p>
                      <Button className="w-full bg-white text-black border hover:bg-gray-50" onClick={() => runTask('health-check')} disabled={runningTasks.has('health-check')}>
                         {runningTasks.has('health-check') ? <RefreshCw className="animate-spin h-4 w-4"/> : "Check Status"}
                      </Button>
                   </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Tasks Table */}
                <Card className="border-none shadow-md">
                  <CardHeader className="bg-gray-50/50 border-b pt-6 pb-4 flex flex-row justify-between items-center">
                     <CardTitle className="text-lg">Scheduled Tasks</CardTitle>
                     <Button size="sm" variant="ghost" onClick={fetchAutomationData}><RefreshCw className={`h-4 w-4 ${autoLoading ? 'animate-spin' : ''}`}/></Button>
                  </CardHeader>
                  <CardContent className="p-0">
                     <div className="max-h-[400px] overflow-auto">
                       <Table>
                         <TableHeader>
                           <TableRow><TableHead>Task</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Action</TableHead></TableRow>
                         </TableHeader>
                         <TableBody>
                           {tasks.length === 0 ? <TableRow><TableCell colSpan={3} className="text-center py-8 text-gray-500">No tasks found</TableCell></TableRow> :
                             tasks.map((task: any, i) => (
                               <TableRow key={i}>
                                 <TableCell>
                                    <div className="font-medium">{safeRender(task.task_name)}</div>
                                    <div className="text-xs text-gray-500 font-mono">{safeRender(task.schedule || 'Manual')}</div>
                                 </TableCell>
                                 <TableCell>
                                    <Badge variant={task.enabled ? 'default' : 'secondary'} className="text-[10px]">
                                        {task.enabled ? 'Active' : 'Inactive'}
                                    </Badge>
                                 </TableCell>
                                 <TableCell className="text-right">
                                   <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => runTask(task.task_name)} disabled={runningTasks.has(task.task_name)}>
                                     <Play className="h-3 w-3 text-indigo-600"/>
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

                {/* Logs Table */}
                <Card className="border-none shadow-md">
                  <CardHeader className="bg-gray-50/50 border-b pt-6 pb-4">
                     <CardTitle className="text-lg">System Logs</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                     <div className="max-h-[400px] overflow-auto">
                       <Table>
                         <TableHeader>
                           <TableRow><TableHead>Status</TableHead><TableHead>Task</TableHead><TableHead>Time</TableHead></TableRow>
                         </TableHeader>
                         <TableBody>
                            {logs.length === 0 ? <TableRow><TableCell colSpan={3} className="text-center py-8 text-gray-500">No logs available</TableCell></TableRow> :
                              logs.map((log: any, i) => (
                                <TableRow key={i}>
                                  <TableCell>
                                    {getStatusIcon(log.status)}
                                  </TableCell>
                                  <TableCell>
                                      <div className="font-medium text-sm">{safeRender(log.task_name)}</div>
                                      <div className="text-xs text-gray-500 truncate max-w-[150px]">{safeRender(log.details || log.message)}</div>
                                  </TableCell>
                                  <TableCell className="text-xs text-gray-500 font-mono">
                                    {formatDate(log.run_time)}
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
             <Card className="border-dashed border-2 shadow-none bg-gray-50">
                <CardContent className="p-16 text-center">
                    <Activity className="h-12 w-12 text-gray-300 mx-auto mb-4"/>
                    <h3 className="text-lg font-medium text-gray-900">Analytics Module</h3>
                    <p className="text-gray-500">Advanced reports and graphs coming in next update.</p>
                </CardContent>
             </Card>
          </TabsContent>

        </Tabs>
      </main>
    </div>
  )
}
