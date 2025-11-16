'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Play, 
  Pause, 
  Settings, 
  Activity, 
  Database, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  RefreshCw,
  Upload,
  Download,
  Shield,
  Calendar
} from 'lucide-react'
import { toast } from 'sonner'

interface AutomationTask {
  id: string
  task_name: string
  schedule: string
  enabled: boolean
  last_run: string | null
  next_run: string | null
  created_at: string
  updated_at: string
  latest_run?: {
    status: string
    message: string
    run_time: string
    duration_ms?: number
  }
}

interface AutomationLog {
  id: string
  task_name: string
  status: string
  message: string
  details?: any
  duration_ms?: number
  run_time: string
  created_at: string
}

interface HealthStatus {
  overall_status: 'healthy' | 'warning' | 'error'
  checks: {
    database: { status: string; details: any }
    storage: { status: string; details: any }
    tables: { status: string; details: any }
    automation: { status: string; details: any }
  }
}

export default function AutomationDashboard() {
  const [tasks, setTasks] = useState<AutomationTask[]>([])
  const [logs, setLogs] = useState<AutomationLog[]>([])
  const [health, setHealth] = useState<HealthStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [runningTasks, setRunningTasks] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    try {
      const response = await fetch('/api/super-admin/automation/status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setTasks(data.tasks || [])
        setLogs(data.recent_logs || [])
        setHealth(data.health || null)
      }
    } catch (error) {
      console.error('Failed to fetch automation data:', error)
      toast.error('Failed to fetch automation data')
    } finally {
      setLoading(false)
    }
  }

  const runTask = async (taskName: string) => {
    if (runningTasks.has(taskName)) return

    setRunningTasks(prev => new Set(prev).add(taskName))
    
    try {
      const response = await fetch('/api/super-admin/automation/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        },
        body: JSON.stringify({ task: taskName })
      })

      if (response.ok) {
        const result = await response.json()
        toast.success(result.message)
        fetchData()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to run task')
      }
    } catch (error) {
      console.error('Failed to run task:', error)
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
    switch (status) {
      case 'success':
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'running':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      success: 'default',
      failed: 'destructive',
      running: 'secondary',
      warning: 'outline',
      healthy: 'default',
      error: 'destructive'
    }
    
    return (
      <Badge variant={variants[status] || 'secondary'}>
        {status}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* SuperAdmin Banner */}
      <Alert className="border-red-200 bg-red-50">
        <Shield className="h-4 w-4" />
        <AlertDescription className="font-semibold">
          SUPERADMIN ONLY - Automation Suite
        </AlertDescription>
      </Alert>

      {/* Health Overview */}
      {health && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                {getStatusIcon(health.checks.database.status)}
                <div>
                  <p className="font-medium">Database</p>
                  <p className="text-sm text-muted-foreground">{health.checks.database.status}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(health.checks.storage.status)}
                <div>
                  <p className="font-medium">Storage</p>
                  <p className="text-sm text-muted-foreground">{health.checks.storage.status}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(health.checks.tables.status)}
                <div>
                  <p className="font-medium">Tables</p>
                  <p className="text-sm text-muted-foreground">{health.checks.tables.status}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(health.checks.automation.status)}
                <div>
                  <p className="font-medium">Automation</p>
                  <p className="text-sm text-muted-foreground">{health.checks.automation.status}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="tasks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
        </TabsList>

        {/* Tasks Tab */}
        <TabsContent value="tasks">
          <div className="grid gap-4">
            {tasks.map((task) => (
              <Card key={task.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <h3 className="font-semibold">{task.task_name}</h3>
                        <p className="text-sm text-muted-foreground">{task.schedule}</p>
                        {task.last_run && (
                          <p className="text-xs text-muted-foreground">
                            Last run: {new Date(task.last_run).toLocaleString()}
                          </p>
                        )}
                      </div>
                      {task.latest_run && (
                        <div className="flex items-center gap-2">
                          {getStatusIcon(task.latest_run.status)}
                          {getStatusBadge(task.latest_run.status)}
                        </div>
                      )}
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

        {/* Logs Tab */}
        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Recent Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {logs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 p-3 border rounded">
                    <div className="mt-1">
                      {getStatusIcon(log.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{log.task_name}</span>
                        {getStatusBadge(log.status)}
                        <span className="text-sm text-muted-foreground">
                          {new Date(log.run_time).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm">{log.message}</p>
                      {log.duration_ms && (
                        <p className="text-xs text-muted-foreground">
                          Duration: {log.duration_ms}ms
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Actions Tab */}
        <TabsContent value="actions">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Database className="h-5 w-5" />
                  <h3 className="font-semibold">Schema Sync</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Synchronize database schema and validate structure
                </p>
                <Button 
                  className="w-full"
                  onClick={() => runTask('schema_sync')}
                  disabled={runningTasks.has('schema_sync')}
                >
                  {runningTasks.has('schema_sync') ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Database className="h-4 w-4 mr-2" />
                  )}
                  Sync Schema
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <RefreshCw className="h-5 w-5" />
                  <h3 className="font-semibold">Auto Sync</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Trigger automatic data synchronization
                </p>
                <Button 
                  className="w-full"
                  onClick={() => runTask('auto_sync_data')}
                  disabled={runningTasks.has('auto_sync_data')}
                >
                  {runningTasks.has('auto_sync_data') ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Sync Data
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Download className="h-5 w-5" />
                  <h3 className="font-semibold">Backup Now</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Create immediate backup of all data
                </p>
                <Button 
                  className="w-full"
                  onClick={() => runTask('backup')}
                  disabled={runningTasks.has('backup')}
                >
                  {runningTasks.has('backup') ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  Create Backup
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Upload className="h-5 w-5" />
                  <h3 className="font-semibold">Restore</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Restore from backup file
                </p>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => toast.info('Restore feature coming soon')}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Restore Backup
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="h-5 w-5" />
                  <h3 className="font-semibold">Health Check</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Run comprehensive system health check
                </p>
                <Button 
                  className="w-full"
                  onClick={() => runTask('health_check')}
                  disabled={runningTasks.has('health_check')}
                >
                  {runningTasks.has('health_check') ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Activity className="h-4 w-4 mr-2" />
                  )}
                  Check Health
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Settings className="h-5 w-5" />
                  <h3 className="font-semibold">Initialize</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Initialize automation system
                </p>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => toast.info('Initialize feature coming soon')}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Initialize
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}