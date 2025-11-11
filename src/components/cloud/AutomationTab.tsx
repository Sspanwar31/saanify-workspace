'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Zap, 
  RefreshCw, 
  Database, 
  GitBranch, 
  Shield, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Play, 
  Pause,
  Settings,
  FileText,
  Activity,
  Upload,
  Download
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'

interface AutomationTask {
  id: string
  name: string
  description: string
  status: 'idle' | 'running' | 'completed' | 'error'
  lastRun?: string
  nextRun?: string
  progress?: number
  enabled: boolean
  icon: React.ReactNode
  logs?: string[]
}

interface AutomationStatus {
  enabled: boolean
  lastSync?: string
  lastBackup?: string
  errorCount: number
  tasks: AutomationTask[]
}

export default function AutomationTab() {
  const [status, setStatus] = useState<AutomationStatus>({
    enabled: false,
    errorCount: 0,
    tasks: []
  })
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTask, setSelectedTask] = useState<string | null>(null)

  useEffect(() => {
    fetchAutomationStatus()
    const interval = setInterval(fetchAutomationStatus, 10000) // Check every 10 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchAutomationStatus = async () => {
    try {
      const response = await fetch('/api/cloud/automation/status')
      const data = await response.json()
      if (data.success) {
        setStatus(data.status)
      }
    } catch (error) {
      console.error('Failed to fetch automation status:', error)
    }
  }

  const toggleAutomation = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/cloud/automation/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ enabled: !status.enabled })
      })
      const data = await response.json()
      
      if (data.success) {
        toast.success(`🤖 Automation ${status.enabled ? 'Disabled' : 'Enabled'}`, {
          description: `Automation system has been ${status.enabled ? 'disabled' : 'enabled'}`,
          duration: 3000,
        })
        fetchAutomationStatus()
      } else {
        toast.error('❌ Toggle Failed', {
          description: data.error || 'Failed to toggle automation',
          duration: 3000,
        })
      }
    } catch (error) {
      toast.error('❌ Toggle Error', {
        description: 'Network error occurred while toggling automation',
        duration: 3000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const runTask = async (taskId: string) => {
    setIsLoading(true)
    setSelectedTask(taskId)
    try {
      const response = await fetch(`/api/cloud/automation/run/${taskId}`, {
        method: 'POST'
      })
      const data = await response.json()
      
      if (data.success) {
        toast.success('🚀 Task Started', {
          description: `Task ${data.task.name} has been started`,
          duration: 3000,
        })
        fetchAutomationStatus()
      } else {
        toast.error('❌ Task Failed', {
          description: data.error || 'Failed to start task',
          duration: 3000,
        })
      }
    } catch (error) {
      toast.error('❌ Task Error', {
        description: 'Network error occurred while starting task',
        duration: 3000,
      })
    } finally {
      setIsLoading(false)
      setSelectedTask(null)
    }
  }

  const getStatusColor = (taskStatus: string) => {
    switch (taskStatus) {
      case 'running': return 'text-blue-500'
      case 'completed': return 'text-green-500'
      case 'error': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  const getStatusIcon = (taskStatus: string) => {
    switch (taskStatus) {
      case 'running': return <RefreshCw className="h-4 w-4 animate-spin" />
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'error': return <AlertCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const getStatusBadge = (taskStatus: string) => {
    switch (taskStatus) {
      case 'running': return <Badge className="bg-blue-100 text-blue-800">Running</Badge>
      case 'completed': return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case 'error': return <Badge className="bg-red-100 text-red-800">Error</Badge>
      default: return <Badge variant="outline">Idle</Badge>
    }
  }

  const automationTasks: AutomationTask[] = [
    {
      id: 'schema-sync',
      name: 'Auto Schema Sync',
      description: 'Detects new Prisma models and syncs with Supabase schema',
      status: status.tasks.find(t => t.id === 'schema-sync')?.status || 'idle',
      lastRun: status.tasks.find(t => t.id === 'schema-sync')?.lastRun,
      nextRun: status.tasks.find(t => t.id === 'schema-sync')?.nextRun,
      enabled: status.tasks.find(t => t.id === 'schema-sync')?.enabled || false,
      icon: <Database className="h-5 w-5" />
    },
    {
      id: 'logic-deploy',
      name: 'Auto Logic Deploy',
      description: 'Updates triggers and functions based on code changes',
      status: status.tasks.find(t => t.id === 'logic-deploy')?.status || 'idle',
      lastRun: status.tasks.find(t => t.id === 'logic-deploy')?.lastRun,
      nextRun: status.tasks.find(t => t.id === 'logic-deploy')?.nextRun,
      enabled: status.tasks.find(t => t.id === 'logic-deploy')?.enabled || false,
      icon: <FileText className="h-5 w-5" />
    },
    {
      id: 'github-backup',
      name: 'Auto GitHub Backup',
      description: 'Backs up database to GitHub if integration is active',
      status: status.tasks.find(t => t.id === 'github-backup')?.status || 'idle',
      lastRun: status.tasks.find(t => t.id === 'github-backup')?.lastRun,
      nextRun: status.tasks.find(t => t.id === 'github-backup')?.nextRun,
      enabled: status.tasks.find(t => t.id === 'github-backup')?.enabled || false,
      icon: <GitBranch className="h-5 w-5" />
    },
    {
      id: 'health-check',
      name: 'Health Check',
      description: 'Monitors system health and performance metrics',
      status: status.tasks.find(t => t.id === 'health-check')?.status || 'idle',
      lastRun: status.tasks.find(t => t.id === 'health-check')?.lastRun,
      nextRun: status.tasks.find(t => t.id === 'health-check')?.nextRun,
      enabled: status.tasks.find(t => t.id === 'health-check')?.enabled || false,
      icon: <Activity className="h-5 w-5" />
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Automation System</h3>
          <p className="text-sm text-muted-foreground">
            Smart automation with error recovery and status monitoring
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Master Switch</span>
            <Switch
              checked={status.enabled}
              onCheckedChange={toggleAutomation}
              disabled={isLoading}
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAutomationStatus}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Security Notice */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>🔒 Security First:</strong> All automation runs server-side with service role authentication. 
          No sensitive data is exposed to the frontend.
        </AlertDescription>
      </Alert>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded ${status.enabled ? 'bg-green-100' : 'bg-gray-100'}`}>
                <Zap className={`h-4 w-4 ${status.enabled ? 'text-green-500' : 'text-gray-500'}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {status.tasks.filter(t => t.enabled).length}
                </p>
                <p className="text-sm text-muted-foreground">Active Tasks</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded">
                <RefreshCw className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-500">
                  {status.tasks.filter(t => t.status === 'running').length}
                </p>
                <p className="text-sm text-muted-foreground">Running</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-100 rounded">
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-500">
                  {status.tasks.filter(t => t.status === 'completed').length}
                </p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-red-100 rounded">
                <AlertCircle className="h-4 w-4 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-500">
                  {status.errorCount}
                </p>
                <p className="text-sm text-muted-foreground">Errors</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Automation Tasks */}
      <div className="grid gap-4">
        {automationTasks.map((task, index) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className={`transition-all duration-300 ${
              task.status === 'running' ? 'border-blue-200 bg-blue-50/50' : 
              task.status === 'error' ? 'border-red-200 bg-red-50/50' : ''
            }`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${
                      task.status === 'running' ? 'bg-blue-100' :
                      task.status === 'error' ? 'bg-red-100' :
                      task.enabled ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      <div className={getStatusColor(task.status)}>
                        {task.icon}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{task.name}</h4>
                        {getStatusBadge(task.status)}
                        {task.enabled && (
                          <Badge variant="outline" className="text-xs">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-1" />
                            Enabled
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {task.lastRun && (
                          <span>Last run: {new Date(task.lastRun).toLocaleString()}</span>
                        )}
                        {task.nextRun && (
                          <span>Next run: {new Date(task.nextRun).toLocaleString()}</span>
                        )}
                      </div>
                      
                      {task.status === 'running' && task.progress && (
                        <div className="mt-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progress</span>
                            <span>{task.progress}%</span>
                          </div>
                          <Progress value={task.progress} className="h-2" />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => runTask(task.id)}
                      disabled={isLoading || task.status === 'running' || !status.enabled}
                    >
                      {selectedTask === task.id ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {status.tasks.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Clock className="h-12 w-12 mx-auto mb-4" />
                <p>No recent activity</p>
                <p className="text-sm">Enable automation to see activity here</p>
              </div>
            ) : (
              status.tasks
                .filter(task => task.lastRun)
                .sort((a, b) => new Date(b.lastRun!).getTime() - new Date(a.lastRun!).getTime())
                .slice(0, 5)
                .map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded"
                  >
                    <div className="flex items-center gap-3">
                      <div className={getStatusColor(task.status)}>
                        {getStatusIcon(task.status)}
                      </div>
                      <div>
                        <p className="font-medium">{task.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(task.lastRun!).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(task.status)}
                  </motion.div>
                ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}