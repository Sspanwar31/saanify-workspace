'use client'

import { useState, useEffect } from 'react'
// UI Components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Play, 
  RefreshCw, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Shield,
  Database,
  Activity,
  Download
} from 'lucide-react'
import { toast } from 'sonner'

// --- HELPER FUNCTIONS ---
const safeRender = (val: any) => {
  if (val === null || val === undefined) return '-'
  if (typeof val === 'object') {
    try { return JSON.stringify(val) } catch (e) { return 'Error' }
  }
  return String(val)
}

const formatDate = (dateVal: string | null) => {
  if (!dateVal) return 'Never'
  try { return new Date(dateVal).toLocaleString() } catch (e) { return '-' }
}

export default function AutomationDashboard() {
  const [tasks, setTasks] = useState<any[]>([])
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [runningTasks, setRunningTasks] = useState<Set<string>>(new Set())

  const fetchData = async () => {
    try {
      const response = await fetch('/api/super-admin/automation/data', {
        method: 'GET',
        cache: 'no-store'
      })
      
      if (response.ok) {
        const data = await response.json()
        setTasks(data.tasks || [])
        setLogs(data.logs || [])
      } else {
        console.error("API Error")
      }
    } catch (error) {
      console.error('Failed to fetch automation data:', error)
      toast.error('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  const runTask = async (taskName: string) => {
    if (runningTasks.has(taskName)) return

    setRunningTasks(prev => new Set(prev).add(taskName))
    toast.info(`Initiating task: ${taskName}...`)
    
    try {
      // Simulate API Call
      await new Promise(r => setTimeout(r, 1500))
      toast.success(`Task ${taskName} completed`)
      fetchData()
    } catch (error) {
      toast.error('Failed to run task')
    } finally {
      setRunningTasks(prev => {
        const newSet = new Set(prev)
        newSet.delete(taskName)
        return newSet
      })
    }
  }

  const getStatusIcon = (status: string) => {
    const s = (status || '').toLowerCase()
    if (s.includes('success') || s === 'healthy') return <CheckCircle className="h-4 w-4 text-green-500" />
    if (s.includes('err') || s.includes('fail')) return <XCircle className="h-4 w-4 text-red-500" />
    if (s === 'running') return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
    return <Clock className="h-4 w-4 text-gray-500" />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Alert className="border-blue-200 bg-blue-50 text-blue-800">
        <Shield className="h-4 w-4" />
        <AlertDescription className="font-semibold">
          SUPER ADMIN AUTOMATION CENTER
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="tasks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tasks">Scheduled Tasks</TabsTrigger>
          <TabsTrigger value="logs">Execution Logs</TabsTrigger>
          <TabsTrigger value="actions">Manual Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks">
          <div className="grid gap-4">
            {tasks.length === 0 ? (
              <div className="p-8 text-center border rounded bg-white text-gray-500">No tasks found.</div>
            ) : (
              tasks.map((task: any) => (
                <Card key={task.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full ${task.enabled ? 'bg-green-100' : 'bg-gray-100'}`}>
                           <Clock className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{task.task_name}</h3>
                          <div className="flex gap-2 text-sm text-muted-foreground">
                             <span>Schedule: <span className="font-mono bg-gray-100 px-1 rounded">{task.schedule || 'Manual'}</span></span>
                             <span>•</span>
                             <span>Last run: {formatDate(task.last_run_at)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={task.enabled ? 'default' : 'secondary'}>
                          {task.enabled ? 'Active' : 'Inactive'}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => runTask(task.task_name)}
                          disabled={runningTasks.has(task.task_name)}
                        >
                          {runningTasks.has(task.task_name) ? (
                            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <Play className="h-4 w-4 mr-2" />
                          )}
                          Run
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>System Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {logs.length === 0 ? (
                   <div className="text-center p-4 text-gray-500">No logs available.</div>
                ) : (
                  logs.map((log: any) => (
                    <div key={log.id} className="flex items-start gap-3 p-3 border-b last:border-0 hover:bg-gray-50">
                      <div className="mt-1">
                        {getStatusIcon(log.status)}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-gray-900">{log.task_name}</span>
                          <span className="text-xs text-gray-500">{formatDate(log.run_time)}</span>
                        </div>
                        <p className="text-sm text-gray-600 font-mono truncate">
                           {safeRender(log.details || log.message)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6 flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold">Schema Sync</h3>
                </div>
                <p className="text-sm text-gray-500">Force sync Prisma schema.</p>
                <Button onClick={() => runTask('schema_sync')} disabled={runningTasks.has('schema_sync')}>
                   Sync Schema
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <Download className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold">Backup Database</h3>
                </div>
                <p className="text-sm text-gray-500">Create immediate backup.</p>
                <Button onClick={() => runTask('database-backup')} disabled={runningTasks.has('database-backup')}>
                   Backup Now
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-red-600" />
                  <h3 className="font-semibold">System Health</h3>
                </div>
                <p className="text-sm text-gray-500">Check services status.</p>
                <Button onClick={() => runTask('health-check')} disabled={runningTasks.has('health-check')}>
                   Check Health
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
