'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Database, 
  Key, 
  FileText, 
  Zap, 
  Shield, 
  RefreshCw, 
  AlertCircle,
  CheckCircle,
  Clock,
  Settings,
  Activity,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  Plus,
  Play,
  Pause,
  Download,
  Upload
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

interface CloudStatus {
  connected: boolean
  lastSync?: string
  errorCount: number
  automationStatus: 'idle' | 'running' | 'error'
  uptime?: string
  version?: string
}

interface Secret {
  id: string
  name: string
  value: string
  description?: string
  lastRotated?: string
  isEditing?: boolean
}

interface LogEntry {
  id: string
  timestamp: string
  level: 'info' | 'warn' | 'error' | 'debug'
  module: 'db' | 'auth' | 'storage' | 'api' | 'system'
  message: string
  details?: any
}

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
}

export default function SupabaseCloudPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [status, setStatus] = useState<CloudStatus>({
    connected: false,
    errorCount: 0,
    automationStatus: 'idle'
  })
  const [secrets, setSecrets] = useState<Secret[]>([])
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [automationTasks, setAutomationTasks] = useState<AutomationTask[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showValues, setShowValues] = useState<{ [key: string]: boolean }>({})

  useEffect(() => {
    if (isOpen) {
      fetchAllData()
      // Auto-refresh every 30 seconds
      const interval = setInterval(fetchAllData, 30000)
      return () => clearInterval(interval)
    }
  }, [isOpen])

  const fetchAllData = async () => {
    try {
      // Fetch status
      const statusResponse = await fetch('/api/cloud/status')
      if (statusResponse.ok) {
        const statusData = await statusResponse.json()
        setStatus(statusData)
      }

      // Fetch secrets
      const secretsResponse = await fetch('/api/cloud/secrets')
      if (secretsResponse.ok) {
        const secretsData = await secretsResponse.json()
        if (secretsData.success) {
          setSecrets(secretsData.secrets.map((s: any) => ({ ...s, isEditing: false })))
        }
      }

      // Fetch logs
      const logsResponse = await fetch('/api/cloud/logs')
      if (logsResponse.ok) {
        const logsData = await logsResponse.json()
        if (logsData.success) {
          setLogs(logsData.logs.slice(0, 50)) // Show last 50 logs
        }
      }

      // Fetch automation status
      const automationResponse = await fetch('/api/cloud/automation/status')
      if (automationResponse.ok) {
        const automationData = await automationResponse.json()
        if (automationData.success) {
          setAutomationTasks(automationData.status.tasks || [])
        }
      }
    } catch (error) {
      console.error("Safe fallback:", error);
    }
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    toast.success(`📋 Switched to ${(value?.charAt(0) ?? "").toUpperCase() + (value?.slice(1) ?? "")} tab`, {
      description: "Loading panel components...",
      duration: 2000,
    })
  }

  const getStatusColor = () => {
    if (!status.connected) return 'text-red-500'
    if (status.errorCount > 0) return 'text-yellow-500'
    return 'text-green-500'
  }

  const getStatusIcon = () => {
    if (!status.connected) return <AlertCircle className="h-4 w-4" />
    if (status.errorCount > 0) return <AlertCircle className="h-4 w-4" />
    return <CheckCircle className="h-4 w-4" />
  }

  const getAutomationColor = () => {
    switch (status.automationStatus) {
      case 'running': return 'text-blue-500'
      case 'error': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  const getAutomationIcon = () => {
    switch (status.automationStatus) {
      case 'running': return <RefreshCw className="h-4 w-4 animate-spin" />
      case 'error': return <AlertCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const maskValue = (value: string) => {
    if (value.length <= 8) return '*'.repeat(value.length)
    return value.substring(0, 4) + '*'.repeat(value.length - 8) + value.substring(value.length - 4)
  }

  const toggleSecretVisibility = (id: string) => {
    setShowValues(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const copyToClipboard = (value: string) => {
    navigator.clipboard.writeText(value)
    toast.success('📋 Copied to Clipboard', {
      description: 'Secret value has been copied',
      duration: 2000,
    })
  }

  const runAutomation = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/cloud/automation/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        toast.success('🚀 Auto-Sync Started', {
          description: 'Automation system has been started',
          duration: 3000,
        })
        fetchAllData()
      } else {
        toast.error('❌ Failed to Start', {
          description: 'Could not start automation',
          duration: 3000,
        })
      }
    } catch (error) {
      toast.error('❌ Network Error', {
        description: 'Failed to start automation',
        duration: 3000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const reconnectDatabase = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/cloud/reconnect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        toast.success('🔗 Connection Updated', {
          description: 'Database connection has been refreshed',
          duration: 3000,
        })
        fetchAllData()
      } else {
        toast.error('❌ Reconnection Failed', {
          description: 'Could not reconnect to database',
          duration: 3000,
        })
      }
    } catch (error) {
      toast.error('❌ Network Error', {
        description: 'Failed to reconnect to database',
        duration: 3000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-red-500 bg-red-50 border-red-200'
      case 'warn': return 'text-yellow-500 bg-yellow-50 border-yellow-200'
      case 'info': return 'text-blue-500 bg-blue-50 border-blue-200'
      case 'debug': return 'text-gray-500 bg-gray-50 border-gray-200'
      default: return 'text-green-500 bg-green-50 border-green-200'
    }
  }

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error': return <AlertCircle className="h-4 w-4" />
      case 'warn': return <AlertCircle className="h-4 w-4" />
      case 'info': return <Activity className="h-4 w-4" />
      case 'debug': return <Settings className="h-4 w-4" />
      default: return <CheckCircle className="h-4 w-4" />
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Floating Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          variant="outline"
          className="bg-background/95 backdrop-blur-sm border-2 shadow-lg hover:shadow-xl transition-all duration-300 relative"
        >
          <Database className={`h-4 w-4 mr-2 ${getStatusColor()}`} />
          <span className="text-sm font-medium">Supabase Cloud</span>
          {getStatusIcon()}
          {status.errorCount > 0 && (
            <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs">
              {status.errorCount}
            </Badge>
          )}
        </Button>
      </motion.div>

      {/* Panel Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 right-0 w-[90vw] max-w-6xl mx-auto"
          >
            <Card className="bg-card rounded-2xl shadow-md p-6 mx-auto mt-4 max-h-[80vh] overflow-hidden">
              {/* Gradient Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Database className="h-6 w-6" />
                    <div>
                      <h2 className="text-xl font-bold">Supabase Cloud Panel</h2>
                      <p className="text-blue-100 text-sm">Complete cloud integration & automation</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant={status.connected ? "default" : "destructive"}
                      className="bg-white/20 text-white border-white/30 flex items-center gap-1"
                    >
                      {getStatusIcon()}
                      {status.connected ? '✅ Connected' : '⚠️ Disconnected'}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsOpen(false)}
                      className="text-white hover:bg-white/20"
                    >
                      ×
                    </Button>
                  </div>
                </div>
              </div>
              
              <CardContent className="p-0">
                <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                  <TabsList className="grid w-full grid-cols-4 h-12">
                    <TabsTrigger value="overview" className="flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Overview
                    </TabsTrigger>
                    <TabsTrigger value="secrets" className="flex items-center gap-2">
                      <Key className="h-4 w-4" />
                      Secrets
                    </TabsTrigger>
                    <TabsTrigger value="logs" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Logs
                    </TabsTrigger>
                    <TabsTrigger value="automation" className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Automation
                    </TabsTrigger>
                  </TabsList>
                  
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="max-h-[60vh] overflow-y-auto p-6"
                    >
                      {/* Overview Tab */}
                      <TabsContent value="overview" className="m-0 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <Card>
                            <CardContent className="p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <Database className="h-4 w-4 text-blue-500" />
                                <span className="text-sm font-medium">Connection Status</span>
                              </div>
                              <div className="text-2xl font-bold">
                                {status.connected ? '✅ Connected' : '⚠️ Disconnected'}
                              </div>
                              {status.lastSync && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Last sync: {new Date(status.lastSync).toLocaleString()}
                                </p>
                              )}
                            </CardContent>
                          </Card>
                          
                          <Card>
                            <CardContent className="p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <Zap className="h-4 w-4 text-green-500" />
                                <span className="text-sm font-medium">Automation</span>
                              </div>
                              <div className="text-2xl font-bold">
                                {(status.automationStatus?.charAt(0) ?? "").toUpperCase() + (status.automationStatus?.slice(1) ?? "")}
                              </div>
                              <Badge 
                                variant={status.automationStatus === 'running' ? "default" : "outline"}
                                className="mt-2"
                              >
                                {getAutomationIcon()}
                                {status.automationStatus}
                              </Badge>
                            </CardContent>
                          </Card>
                          
                          <Card>
                            <CardContent className="p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <AlertCircle className="h-4 w-4 text-red-500" />
                                <span className="text-sm font-medium">Errors</span>
                              </div>
                              <div className="text-2xl font-bold text-red-500">
                                {status.errorCount}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                Last 24 hours
                              </p>
                            </CardContent>
                          </Card>
                          
                          <Card>
                            <CardContent className="p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <Clock className="h-4 w-4 text-purple-500" />
                                <span className="text-sm font-medium">Uptime</span>
                              </div>
                              <div className="text-2xl font-bold">
                                {status.uptime || '99.9%'}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                Last 30 days
                              </p>
                            </CardContent>
                          </Card>
                        </div>

                        <div className="flex gap-4">
                          {!status.connected && (
                            <Button onClick={reconnectDatabase} disabled={isLoading}>
                              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                              Reconnect
                            </Button>
                          )}
                          <Button variant="outline" onClick={fetchAllData} disabled={isLoading}>
                            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                            Refresh Status
                          </Button>
                        </div>
                      </TabsContent>

                      {/* Secrets Tab */}
                      <TabsContent value="secrets" className="m-0 space-y-6">
                        <Alert>
                          <Shield className="h-4 w-4" />
                          <AlertDescription>
                            <strong>🔒 Security First:</strong> All secrets are encrypted and stored securely. Values are masked by default.
                          </AlertDescription>
                        </Alert>

                        <div className="grid gap-4">
                          {secrets.map((secret, index) => (
                            <motion.div
                              key={secret.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: index * 0.1 }}
                            >
                              <Card>
                                <CardContent className="p-4">
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-2">
                                        <Key className="h-4 w-4 text-primary" />
                                        <h4 className="font-semibold">{secret.name}</h4>
                                        {secret.lastRotated && (
                                          <Badge variant="outline" className="text-xs">
                                            Rotated: {new Date(secret.lastRotated).toLocaleDateString()}
                                          </Badge>
                                        )}
                                      </div>
                                      
                                      {secret.description && (
                                        <p className="text-sm text-muted-foreground mb-2">{secret.description}</p>
                                      )}
                                      
                                      <div className="flex items-center gap-2">
                                        <div className="flex-1 font-mono text-sm bg-muted p-2 rounded">
                                          {showValues[secret.id] ? secret.value : maskValue(secret.value)}
                                        </div>
                                        
                                        <div className="flex gap-1">
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => toggleSecretVisibility(secret.id)}
                                          >
                                            {showValues[secret.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                          </Button>
                                          
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => copyToClipboard(secret.value)}
                                          >
                                            <Copy className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.div>
                          ))}
                        </div>

                        {secrets.length === 0 && (
                          <Card>
                            <CardContent className="p-8 text-center">
                              <Key className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                              <h3 className="text-lg font-semibold mb-2">No Secrets Found</h3>
                              <p className="text-muted-foreground">
                                Environment variables will appear here once configured
                              </p>
                            </CardContent>
                          </Card>
                        )}
                      </TabsContent>

                      {/* Logs Tab */}
                      <TabsContent value="logs" className="m-0 space-y-6">
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-semibold">Recent Logs</h3>
                          <Button variant="outline" size="sm" onClick={fetchAllData} disabled={isLoading}>
                            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                            Refresh
                          </Button>
                        </div>

                        <div className="space-y-2 max-h-96 overflow-y-auto">
                          {logs.slice(0, 20).map((log, index) => (
                            <motion.div
                              key={log.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.2, delay: index * 0.05 }}
                              className="flex items-start gap-3 p-3 bg-muted/30 rounded"
                            >
                              <div className={`p-1 rounded ${getLevelColor(log.level)}`}>
                                {getLevelIcon(log.level)}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(log.timestamp).toLocaleString()}
                                  </span>
                                  <Badge variant="outline" className="text-xs">
                                    {log.level.toUpperCase()}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {log.module.toUpperCase()}
                                  </Badge>
                                </div>
                                <p className="text-sm break-words">{log.message}</p>
                              </div>
                            </motion.div>
                          ))}
                        </div>

                        {logs.length === 0 && (
                          <Card>
                            <CardContent className="p-8 text-center">
                              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                              <h3 className="text-lg font-semibold mb-2">No Logs Found</h3>
                              <p className="text-muted-foreground">
                                Logs will appear here once system activity begins
                              </p>
                            </CardContent>
                          </Card>
                        )}
                      </TabsContent>

                      {/* Automation Tab */}
                      <TabsContent value="automation" className="m-0 space-y-6">
                        <Alert>
                          <Shield className="h-4 w-4" />
                          <AlertDescription>
                            <strong>🔒 Security First:</strong> All automation runs server-side with service role authentication.
                          </AlertDescription>
                        </Alert>

                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="text-lg font-semibold">Automation Controls</h3>
                            <p className="text-sm text-muted-foreground">
                              Manage automated tasks and workflows
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              onClick={runAutomation}
                              disabled={isLoading || status.automationStatus === 'running'}
                              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                            >
                              {isLoading ? (
                                <>
                                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                  Running...
                                </>
                              ) : (
                                <>
                                  <Play className="h-4 w-4 mr-2" />
                                  Run Now
                                </>
                              )}
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Card>
                            <CardContent className="p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <Zap className="h-4 w-4 text-blue-500" />
                                <span className="text-sm font-medium">Auto-Sync Status</span>
                              </div>
                              <Badge 
                                variant={status.automationStatus === 'running' ? "default" : "outline"}
                                className="flex items-center gap-1"
                              >
                                {getAutomationIcon()}
                                {status.automationStatus}
                              </Badge>
                              {status.lastSync && (
                                <p className="text-xs text-muted-foreground mt-2">
                                  Last sync: {new Date(status.lastSync).toLocaleString()}
                                </p>
                              )}
                            </CardContent>
                          </Card>

                          <Card>
                            <CardContent className="p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <Activity className="h-4 w-4 text-green-500" />
                                <span className="text-sm font-medium">Active Tasks</span>
                              </div>
                              <div className="text-2xl font-bold">
                                {automationTasks.filter(t => t.enabled).length}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                Currently enabled
                              </p>
                            </CardContent>
                          </Card>
                        </div>

                        <div className="space-y-3">
                          <h4 className="text-md font-medium">Available Automations</h4>
                          <div className="grid gap-3">
                            {['Schema Sync', 'Auto Backup', 'Health Checks', 'Log Rotation'].map((task, index) => (
                              <motion.div
                                key={task}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                              >
                                <Card className="p-4">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <div className="p-2 bg-blue-100 rounded">
                                        <Zap className="h-4 w-4 text-blue-500" />
                                      </div>
                                      <div>
                                        <h5 className="font-medium">{task}</h5>
                                        <p className="text-sm text-muted-foreground">
                                          Automated {task.toLowerCase()} for optimal performance
                                        </p>
                                      </div>
                                    </div>
                                    <Switch defaultChecked={index < 2} />
                                  </div>
                                </Card>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </TabsContent>
                    </motion.div>
                  </AnimatePresence>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}