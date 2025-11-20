"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { 
  Search, Users, CheckCircle, Clock, XCircle, Lock, Eye, Unlock, Trash2, RefreshCw, 
  Building2, Shield, Settings, Database, Activity, DollarSign, Plus,
  Play, Download, Upload, LogOut, User, ChevronDown, Edit, MoreHorizontal
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
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

// --- HELPER FUNCTIONS (CRASH PREVENTION) ---
const safeRender = (val: any) => {
  if (val === null || val === undefined) return '-'
  if (typeof val === 'object') {
    try { return JSON.stringify(val) } catch (e) { return 'Data Object' }
  }
  return String(val)
}

const formatDate = (dateVal: any) => {
  if (!dateVal) return 'Never'
  try { return new Date(dateVal).toLocaleString() } catch (e) { return '-' }
}

// Types (Simplified)
interface Client {
  id: number; name: string; plan: string; status: string; members: number;
  revenue: string; contact: string; lastActive: string;
}

// Dummy Data for Clients (Isse aap baad me API se replace kar sakte hain)
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
  const [autoLoading, setAutoLoading] = useState(false)
  const [runningTasks, setRunningTasks] = useState<Set<string>>(new Set())

  // --- FETCH AUTOMATION DATA ---
  const fetchAutomationData = async () => {
    try {
      setAutoLoading(true)
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

  // Fetch on Tab Change
  useEffect(() => {
    if (activeTab === 'automation') {
      fetchAutomationData()
    }
  }, [activeTab])

  // Run Task
  const runTask = async (taskName: string) => {
    if (runningTasks.has(taskName)) return
    setRunningTasks(prev => new Set(prev).add(taskName))
    toast.info(`Starting ${taskName}...`)
    
    try {
      await new Promise(r => setTimeout(r, 1500)) // Fake delay for effect
      toast.success(`Task ${taskName} executed`)
      fetchAutomationData()
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-indigo-600" />
          <div>
            <h1 className="text-xl font-bold text-gray-900">Super Admin Dashboard</h1>
            <p className="text-sm text-gray-500">System Overview</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => router.push('/login')}>
                <LogOut className="h-4 w-4 mr-2" /> Logout
            </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Societies</TabsTrigger>
            <TabsTrigger value="automation">Automation</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* --- TAB: OVERVIEW (CLIENTS) --- */}
          <TabsContent value="overview">
             <Card>
              <CardHeader>
                <CardTitle>Registered Societies</CardTitle>
                <CardDescription>Manage client subscriptions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-6">
                   <div className="relative flex-1">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input 
                        placeholder="Search..." 
                        className="pl-10" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                   </div>
                   <Button className="bg-indigo-600"><Plus className="h-4 w-4 mr-2"/> Add Society</Button>
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
                      <TableRow key={client.id}>
                        <TableCell className="font-medium">{client.name}</TableCell>
                        <TableCell><Badge variant="outline">{client.plan}</Badge></TableCell>
                        <TableCell><Badge className="bg-green-100 text-green-800">{client.status}</Badge></TableCell>
                        <TableCell>{client.members}</TableCell>
                        <TableCell>{client.revenue}</TableCell>
                        <TableCell className="text-right">
                           <Button variant="ghost" size="sm"><Edit className="h-4 w-4"/></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
             </Card>
          </TabsContent>

          {/* --- TAB: AUTOMATION (REAL DATA) --- */}
          <TabsContent value="automation" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Quick Actions */}
                <Card>
                   <CardHeader><CardTitle className="text-base">Database Backup</CardTitle></CardHeader>
                   <CardContent>
                      <Button className="w-full" onClick={() => runTask('database-backup')} disabled={runningTasks.has('database-backup')}>
                         {runningTasks.has('database-backup') ? <RefreshCw className="animate-spin h-4 w-4"/> : <Download className="h-4 w-4 mr-2"/>}
                         Backup Now
                      </Button>
                   </CardContent>
                </Card>
                <Card>
                   <CardHeader><CardTitle className="text-base">Schema Sync</CardTitle></CardHeader>
                   <CardContent>
                      <Button className="w-full" variant="outline" onClick={() => runTask('schema-sync')} disabled={runningTasks.has('schema-sync')}>
                         <Database className="h-4 w-4 mr-2"/> Sync Schema
                      </Button>
                   </CardContent>
                </Card>
                <Card>
                   <CardHeader><CardTitle className="text-base">System Health</CardTitle></CardHeader>
                   <CardContent>
                      <Button className="w-full" variant="secondary" onClick={() => runTask('health-check')} disabled={runningTasks.has('health-check')}>
                         <Activity className="h-4 w-4 mr-2"/> Check Health
                      </Button>
                   </CardContent>
                </Card>
            </div>

            {/* Tasks Table */}
            <Card>
              <CardHeader>
                 <div className="flex justify-between">
                    <CardTitle>Scheduled Tasks</CardTitle>
                    <Button size="sm" variant="ghost" onClick={fetchAutomationData}><RefreshCw className="h-4 w-4"/></Button>
                 </div>
              </CardHeader>
              <CardContent>
                 {autoLoading ? <div className="p-4 text-center">Loading...</div> : (
                   <Table>
                     <TableHeader>
                       <TableRow><TableHead>Task</TableHead><TableHead>Schedule</TableHead><TableHead>Status</TableHead><TableHead>Last Run</TableHead><TableHead>Action</TableHead></TableRow>
                     </TableHeader>
                     <TableBody>
                       {tasks.length === 0 ? <TableRow><TableCell colSpan={5} className="text-center">No tasks found</TableCell></TableRow> :
                         tasks.map((task: any, i) => (
                           <TableRow key={i}>
                             <TableCell className="font-medium">{safeRender(task.task_name)}</TableCell>
                             <TableCell className="font-mono text-xs">{safeRender(task.schedule || 'Manual')}</TableCell>
                             <TableCell><Badge variant={task.enabled ? 'default' : 'secondary'}>{task.enabled ? 'Active' : 'Inactive'}</Badge></TableCell>
                             <TableCell className="text-gray-500 text-xs">{formatDate(task.last_run_at)}</TableCell>
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
                 )}
              </CardContent>
            </Card>

            {/* Logs Table */}
            <Card>
              <CardHeader><CardTitle>System Logs</CardTitle></CardHeader>
              <CardContent>
                 <div className="max-h-60 overflow-auto">
                   <Table>
                     <TableHeader>
                       <TableRow><TableHead>Time</TableHead><TableHead>Task</TableHead><TableHead>Status</TableHead><TableHead>Details</TableHead></TableRow>
                     </TableHeader>
                     <TableBody>
                        {logs.length === 0 ? <TableRow><TableCell colSpan={4} className="text-center">No logs available</TableCell></TableRow> :
                          logs.map((log: any, i) => (
                            <TableRow key={i}>
                              <TableCell className="text-xs text-gray-500">{formatDate(log.run_time)}</TableCell>
                              <TableCell className="font-medium">{safeRender(log.task_name)}</TableCell>
                              <TableCell>
                                <span className={`text-xs font-bold ${log.status === 'ERROR' ? 'text-red-600' : 'text-green-600'}`}>
                                  {safeRender(log.status)}
                                </span>
                              </TableCell>
                              <TableCell className="text-xs font-mono max-w-xs truncate" title={safeRender(log.details)}>
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
          </TabsContent>

          {/* --- TAB: ANALYTICS (Placeholder) --- */}
          <TabsContent value="analytics">
             <Card><CardContent className="p-10 text-center text-gray-500">Analytics Coming Soon</CardContent></Card>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  )
}
