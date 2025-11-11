'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Activity, Cloud, CheckCircle, AlertCircle, RefreshCw, Zap, Shield, Clock, ToggleLeft, ToggleRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'

interface OverviewTabProps {
  connectionStatus: 'connected' | 'disconnected' | 'checking'
  onRefresh: () => void
}

export default function OverviewTab({ connectionStatus, onRefresh }: OverviewTabProps) {
  const [isSyncing, setIsSyncing] = useState(false)
  const [autoSync, setAutoSync] = useState(true)
  const [lastSynced, setLastSynced] = useState<Date | null>(null)
  const [healthStatus, setHealthStatus] = useState<'healthy' | 'warning' | 'error'>('healthy')
  const [syncProgress, setSyncProgress] = useState(0)

  useEffect(() => {
    // Load saved settings
    const savedAutoSync = localStorage.getItem('saanify-auto-sync')
    if (savedAutoSync !== null) {
      setAutoSync(JSON.parse(savedAutoSync))
    }

    const savedLastSynced = localStorage.getItem('saanify-last-synced')
    if (savedLastSynced) {
      setLastSynced(new Date(savedLastSynced))
    }

    // Run health check
    runHealthCheck()
  }, [])

  useEffect(() => {
    // Save auto-sync setting
    localStorage.setItem('saanify-auto-sync', JSON.stringify(autoSync))
    
    // Set up auto-sync if enabled
    if (autoSync) {
      const interval = setInterval(() => {
        handleAutoSync()
      }, 5 * 60 * 1000) // 5 minutes
      return () => clearInterval(interval)
    }
  }, [autoSync])

  const runHealthCheck = async () => {
    try {
      const response = await fetch('/api/health')
      const data = await response.json()
      
      if (data.status === 'ok') {
        setHealthStatus('healthy')
      } else {
        setHealthStatus('warning')
      }
    } catch (error) {
      setHealthStatus('error')
    }
  }

  const handleSync = async () => {
    setIsSyncing(true)
    setSyncProgress(0)

    try {
      toast.loading('Starting sync...', { id: 'sync-progress' })

      // Simulate sync progress
      const progressInterval = setInterval(() => {
        setSyncProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 200)

      const response = await fetch('/api/supabase/auto-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      clearInterval(progressInterval)
      setSyncProgress(100)

      const result = await response.json()

      if (result.success) {
        setLastSynced(new Date())
        localStorage.setItem('saanify-last-synced', new Date().toISOString())
        
        toast.success('✅ Sync Complete!', {
          id: 'sync-progress',
          description: result.message || 'Database synchronized successfully',
          duration: 3000,
        })
      } else {
        toast.error('❌ Sync Failed', {
          id: 'sync-progress',
          description: result.error || 'Unknown error occurred',
          duration: 3000,
        })
      }
    } catch (error: any) {
      toast.error('❌ Sync Error', {
        id: 'sync-progress',
        description: error.message || 'Network error occurred',
        duration: 3000,
      })
    } finally {
      setIsSyncing(false)
      setTimeout(() => setSyncProgress(0), 1000)
    }
  }

  const handleAutoSync = async () => {
    try {
      const response = await fetch('/api/supabase/auto-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const result = await response.json()
      if (result.success) {
        setLastSynced(new Date())
        localStorage.setItem('saanify-last-synced', new Date().toISOString())
      }
    } catch (error) {
      console.error('Auto-sync failed:', error)
    }
  }

  const formatLastSynced = () => {
    if (!lastSynced) return 'Never'
    
    const now = new Date()
    const diff = now.getTime() - lastSynced.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes} minutes ago`
    
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} hours ago`
    
    const days = Math.floor(hours / 24)
    return `${days} days ago`
  }

  const getHealthColor = () => {
    switch (healthStatus) {
      case 'healthy': return 'text-green-500'
      case 'warning': return 'text-yellow-500'
      case 'error': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  const getHealthBadge = () => {
    switch (healthStatus) {
      case 'healthy': return 'bg-green-500'
      case 'warning': return 'bg-yellow-500'
      case 'error': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="space-y-6">
      {/* Connection Status Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-muted/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Cloud className="h-6 w-6 text-primary" />
              Connection Status
            </CardTitle>
            <CardDescription>
              Real-time connection and synchronization status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' : connectionStatus === 'disconnected' ? 'bg-red-500' : 'bg-yellow-500 animate-pulse'}`} />
                <span className="font-medium capitalize">{connectionStatus}</span>
              </div>
              <Badge variant={connectionStatus === 'connected' ? 'default' : 'destructive'}>
                {connectionStatus === 'connected' ? 'Connected' : connectionStatus === 'disconnected' ? 'Disconnected' : 'Checking...'}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Auto Sync</span>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={autoSync}
                  onCheckedChange={setAutoSync}
                  disabled={isSyncing}
                />
                <span className="text-sm font-medium">{autoSync ? 'ON' : 'OFF'}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Last Synced</span>
              <span className="text-sm font-medium">{formatLastSynced()}</span>
            </div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={handleSync}
                disabled={isSyncing || connectionStatus !== 'connected'}
                className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              >
                {isSyncing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Syncing... {syncProgress}%
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Sync Now
                  </>
                )}
              </Button>
            </motion.div>

            {/* Progress Bar */}
            {isSyncing && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full bg-muted rounded-full h-2"
              >
                <motion.div
                  className="bg-primary h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${syncProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Health Check Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-primary" />
              Health Check
            </CardTitle>
            <CardDescription>
              System health and performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Activity className={`h-4 w-4 ${getHealthColor()}`} />
                <span className="font-medium">System Status</span>
              </div>
              <Badge variant={healthStatus === 'healthy' ? 'default' : healthStatus === 'warning' ? 'secondary' : 'destructive'}>
                {healthStatus === 'healthy' ? 'Healthy' : healthStatus === 'warning' ? 'Warning' : 'Error'}
              </Badge>
            </div>

            <Alert>
              <Zap className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <span>
                    {healthStatus === 'healthy' 
                      ? 'All systems operational and performing normally'
                      : healthStatus === 'warning'
                      ? 'Some systems require attention'
                      : 'Critical issues detected'
                    }
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={runHealthCheck}
                    className="ml-4"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-2 mb-1">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Uptime</span>
                </div>
                <p className="text-2xl font-bold text-foreground">99.9%</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-2 mb-1">
                  <Activity className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Response Time</span>
                </div>
                <p className="text-2xl font-bold text-foreground">120ms</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Zap className="h-6 w-6 text-primary" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Common management tasks and utilities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="outline"
                  className="w-full h-auto p-4 flex flex-col items-center space-y-2"
                  onClick={() => window.location.href = '/analytics'}
                >
                  <Activity className="h-6 w-6" />
                  <span>View Analytics</span>
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="outline"
                  className="w-full h-auto p-4 flex flex-col items-center space-y-2"
                  onClick={() => window.location.href = '/login'}
                >
                  <Shield className="h-6 w-6" />
                  <span>Auth Settings</span>
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="outline"
                  className="w-full h-auto p-4 flex flex-col items-center space-y-2"
                  onClick={onRefresh}
                >
                  <RefreshCw className="h-6 w-6" />
                  <span>Refresh Status</span>
                </Button>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}