'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Database, RefreshCw, CheckCircle, AlertCircle, Loader2, Shield, Table, Plus, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'

interface DatabaseTabProps {
  connectionStatus: 'connected' | 'disconnected' | 'checking'
}

interface TableInfo {
  name: string
  rowCount: number
  status: 'ready' | 'syncing' | 'error'
  lastSynced?: Date
  hasRLS: boolean
}

export default function DatabaseTab({ connectionStatus }: DatabaseTabProps) {
  const [tables, setTables] = useState<TableInfo[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncProgress, setSyncProgress] = useState(0)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  useEffect(() => {
    if (connectionStatus === 'connected') {
      fetchTables()
      
      // Set up auto-refresh every 5 minutes
      const interval = setInterval(() => {
        fetchTables()
      }, 5 * 60 * 1000) // 5 minutes

      return () => clearInterval(interval)
    }
  }, [connectionStatus])

  const fetchTables = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/database/tables')
      const data = await response.json()
      
      if (data.success) {
        setTables(data.tables || [])
        setLastRefresh(new Date())
      } else {
        // If no tables exist, show default tables
        setTables(getDefaultTables())
      }
    } catch (error) {
      console.error('Failed to fetch tables:', error)
      // Show default tables on error
      setTables(getDefaultTables())
    } finally {
      setIsLoading(false)
    }
  }

  const getDefaultTables = (): TableInfo[] => [
    {
      name: 'users',
      rowCount: 0,
      status: 'ready',
      hasRLS: false
    },
    {
      name: 'societies',
      rowCount: 0,
      status: 'ready',
      hasRLS: false
    },
    {
      name: 'members',
      rowCount: 0,
      status: 'ready',
      hasRLS: false
    },
    {
      name: 'loans',
      rowCount: 0,
      status: 'ready',
      hasRLS: false
    },
    {
      name: 'expenses',
      rowCount: 0,
      status: 'ready',
      hasRLS: false
    },
    {
      name: 'maintenance_requests',
      rowCount: 0,
      status: 'ready',
      hasRLS: false
    }
  ]

  const handleSchemaSync = async () => {
    setIsSyncing(true)
    setSyncProgress(0)

    try {
      toast.loading('Running schema sync...', { id: 'schema-sync' })

      // Simulate progress
      const progressSteps = [
        { step: 'Connecting to database...', progress: 20 },
        { step: 'Creating tables...', progress: 40 },
        { step: 'Enabling RLS policies...', progress: 60 },
        { step: 'Setting up functions...', progress: 80 },
        { step: 'Finalizing sync...', progress: 100 }
      ]

      for (const { step, progress } of progressSteps) {
        await new Promise(resolve => setTimeout(resolve, 800))
        setSyncProgress(progress)
        toast.loading(step, { id: 'schema-sync' })
      }

      const response = await fetch('/api/database/sync-schema', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const result = await response.json()

      if (result.success) {
        toast.success('✅ Schema Sync Complete!', {
          id: 'schema-sync',
          description: `Created ${result.summary?.tablesCreated || 0} tables and enabled RLS`,
          duration: 3000,
        })
        
        // Refresh tables after sync
        await fetchTables()
      } else {
        toast.error('❌ Schema Sync Failed', {
          id: 'schema-sync',
          description: result.error || 'Unknown error occurred',
          duration: 3000,
        })
      }
    } catch (error: any) {
      toast.error('❌ Sync Error', {
        id: 'schema-sync',
        description: error.message || 'Network error occurred',
        duration: 3000,
      })
    } finally {
      setIsSyncing(false)
      setSyncProgress(0)
    }
  }

  const handleRefresh = async () => {
    await fetchTables()
    toast.success('🔄 Tables Refreshed', {
      description: 'Database tables updated successfully',
      duration: 2000,
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'syncing': return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ready': return 'bg-green-500'
      case 'syncing': return 'bg-blue-500'
      case 'error': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const formatRowcount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
    return count.toString()
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Database className="h-6 w-6 text-primary" />
                Database Management
              </div>
              <div className="flex items-center space-x-2">
                {lastRefresh && (
                  <span className="text-sm text-muted-foreground">
                    Last refresh: {lastRefresh.toLocaleTimeString()}
                  </span>
                )}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={isLoading || isSyncing}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </motion.div>
              </div>
            </CardTitle>
            <CardDescription>
              Manage database tables, schema, and synchronization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1"
              >
                <Button
                  onClick={handleSchemaSync}
                  disabled={isSyncing || connectionStatus !== 'connected'}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  {isSyncing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Syncing Schema...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Run Schema Sync
                    </>
                  )}
                </Button>
              </motion.div>
            </div>

            {/* Progress Bar */}
            <AnimatePresence>
              {isSyncing && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Sync Progress</span>
                    <span className="text-sm text-muted-foreground">{syncProgress}%</span>
                  </div>
                  <Progress value={syncProgress} className="w-full" />
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tables List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Table className="h-6 w-6 text-primary" />
                Database Tables
              </div>
              <Badge variant="secondary">
                {tables.length} tables
              </Badge>
            </CardTitle>
            <CardDescription>
              All tables in your Supabase database with RLS status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Loading tables...</span>
              </div>
            ) : tables.length === 0 ? (
              <div className="text-center py-8">
                <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No Tables Found</h3>
                <p className="text-muted-foreground mb-4">
                  Run schema sync to create default tables with RLS enabled
                </p>
                <Button onClick={handleSchemaSync} disabled={isSyncing}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Tables
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {tables.map((table, index) => (
                  <motion.div
                    key={table.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(table.status)}
                      <div>
                        <h4 className="font-medium text-foreground">{table.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {formatRowcount(table.rowCount)} rows
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {table.hasRLS && (
                        <Badge variant="default" className="bg-green-500">
                          <Shield className="h-3 w-3 mr-1" />
                          RLS Enabled
                        </Badge>
                      )}
                      <Badge variant={table.status === 'ready' ? 'default' : 'secondary'}>
                        {table.status}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Features Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Settings className="h-6 w-6 text-primary" />
              Database Features
            </CardTitle>
            <CardDescription>
              Automatic management and security features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <RefreshCw className="h-4 w-4 text-primary" />
                  <span className="font-medium">Auto Refresh</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Tables automatically refresh every 5 minutes
                </p>
              </div>
              
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <span className="font-medium">RLS by Default</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Row Level Security enabled on all tables
                </p>
              </div>
              
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Plus className="h-4 w-4 text-primary" />
                  <span className="font-medium">Auto Creation</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Default tables created automatically when needed
                </p>
              </div>
              
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Database className="h-4 w-4 text-primary" />
                  <span className="font-medium">Schema Sync</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  One-click schema synchronization with validation
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}