'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Database, RefreshCw, CheckCircle, AlertCircle, Settings, Loader2, Shield, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

interface SyncStep {
  name: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  message?: string;
}

interface SyncResponse {
  success: boolean;
  steps: SyncStep[];
  error?: string;
  message?: string;
  summary?: {
    tablesCreated: number;
    rlsEnabled: number;
    functionsCreated: number;
    triggersCreated: number;
  };
}

interface TestResult {
  name: string;
  success: boolean;
  message: string;
  details?: any;
}

interface TestResponse {
  success: boolean;
  message: string;
  testResults: TestResult[];
  summary?: {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    successRate: number;
  };
}

export default function SupabaseAutoSync() {
  const [isOpen, setIsOpen] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [showKeys, setShowKeys] = useState(false)
  const [syncResult, setSyncResult] = useState<SyncResponse | null>(null)
  const [testResult, setTestResult] = useState<TestResponse | null>(null)
  const [config, setConfig] = useState({
    supabaseUrl: '',
    serviceRoleKey: ''
  })

  const handleTest = async () => {
    setIsTesting(true)
    setTestResult(null)

    try {
      toast.loading('Running system tests...', { id: 'supabase-test' })

      const response = await fetch('/api/supabase/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const result: TestResponse = await response.json()

      if (result.success) {
        toast.success('✅ Tests Complete!', {
          id: 'supabase-test',
          description: result.message || 'All tests passed successfully',
          duration: 5000
        })
      } else {
        toast.warn('⚠️ Some Tests Failed', {
          id: 'supabase-test',
          description: result.message || 'Some tests failed, please review results',
          duration: 5000
        })
      }

      setTestResult(result)

    } catch (error: any) {
      toast.error('❌ Test Error', {
        id: 'supabase-test',
        description: error.message || 'Network error occurred',
        duration: 5000
      })
    } finally {
      setIsTesting(false)
    }
  }

  const handleSync = async () => {
    setIsSyncing(true)
    setSyncResult(null)

    try {
      toast.loading('Starting Supabase sync...', { id: 'supabase-sync' })

      const response = await fetch('/api/supabase/auto-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const result: SyncResponse = await response.json()

      if (result.success) {
        toast.success('✅ Supabase Sync Complete!', {
          id: 'supabase-sync',
          description: result.message || 'Schema synchronized successfully',
          duration: 5000
        })
      } else {
        toast.error('❌ Sync Failed', {
          id: 'supabase-sync',
          description: result.error || 'Unknown error occurred',
          duration: 5000
        })
      }

      setSyncResult(result)

    } catch (error: any) {
      toast.error('❌ Sync Error', {
        id: 'supabase-sync',
        description: error.message || 'Network error occurred',
        duration: 5000
      })
    } finally {
      setIsSyncing(false)
    }
  }

  const handleSaveConfig = async () => {
    try {
      toast.loading('Saving configuration...', { id: 'save-config' })

      const response = await fetch('/api/supabase/configure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(config)
      })

      const result = await response.json()

      if (result.success) {
        toast.success('✅ Configuration Saved', {
          id: 'save-config',
          description: 'Supabase configuration updated successfully',
          duration: 3000
        })
      } else {
        toast.error('❌ Configuration Failed', {
          id: 'save-config',
          description: result.error || 'Failed to save configuration',
          duration: 3000
        })
      }

    } catch (error: any) {
      toast.error('❌ Configuration Error', {
        id: 'save-config',
        description: error.message || 'Network error occurred',
        duration: 3000
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-500'
      case 'running': return 'text-blue-500'
      case 'error': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'running': return <Loader2 className="h-4 w-4 animate-spin" />
      case 'error': return <AlertCircle className="h-4 w-4" />
      default: return <div className="h-4 w-4 rounded-full bg-gray-300" />
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          variant="outline"
          className="bg-background/95 backdrop-blur-sm border-2 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Database className="h-4 w-4 mr-2" />
          <span className="text-sm font-medium">Supabase Sync</span>
          <RefreshCw className="h-4 w-4 ml-2" />
        </Button>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 right-0 w-96 max-h-[80vh] overflow-y-auto"
          >
            <Card className="bg-background/95 backdrop-blur-sm border-2 shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Supabase Auto-Sync System
                </CardTitle>
                <CardDescription>
                  Secure schema synchronization with Row Level Security
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Security Notice */}
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    <strong>🔒 Security First:</strong> Service role keys are server-only and never exposed to clients.
                  </AlertDescription>
                </Alert>

                {/* Configuration Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Configuration</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowKeys(!showKeys)}
                    >
                      {showKeys ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="supabase-url" className="text-xs">Supabase URL</Label>
                      <Input
                        id="supabase-url"
                        type={showKeys ? 'text' : 'password'}
                        placeholder="https://your-project.supabase.co"
                        value={config.supabaseUrl}
                        onChange={(e) => setConfig(prev => ({ ...prev, supabaseUrl: e.target.value }))}
                        className="text-xs"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="service-role-key" className="text-xs">Service Role Key</Label>
                      <Input
                        id="service-role-key"
                        type={showKeys ? 'text' : 'password'}
                        placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                        value={config.serviceRoleKey}
                        onChange={(e) => setConfig(prev => ({ ...prev, serviceRoleKey: e.target.value }))}
                        className="text-xs"
                      />
                    </div>
                    
                    <Button
                      onClick={handleSaveConfig}
                      variant="outline"
                      size="sm"
                      className="w-full"
                      disabled={!config.supabaseUrl || !config.serviceRoleKey}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Save Configuration
                    </Button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button
                    onClick={handleSync}
                    disabled={isSyncing}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  >
                    {isSyncing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Syncing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        🔁 Auto Sync Supabase
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={handleTest}
                    disabled={isTesting}
                    variant="outline"
                    className="w-full"
                  >
                    {isTesting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        🧪 Run System Tests
                      </>
                    )}
                  </Button>
                </div>

                {/* Test Results */}
                {testResult && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">System Test Results</span>
                      <Badge variant={testResult.success ? "default" : "destructive"}>
                        {testResult.success ? '✅ Passed' : '⚠️ Issues Found'}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      {testResult.testResults.map((test, index) => (
                        <motion.div
                          key={test.name}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-2 rounded-md bg-muted/50"
                        >
                          <div className="flex items-center gap-2">
                            <div className={test.success ? 'text-green-500' : 'text-red-500'}>
                              {test.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                            </div>
                            <div>
                              <span className="text-sm font-medium">{test.name}</span>
                              <p className="text-xs text-muted-foreground">{test.message}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {testResult.summary && (
                      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                        <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                          📊 Test Summary
                        </h4>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>Total Tests: {testResult.summary.totalTests}</div>
                          <div>Passed: {testResult.summary.passedTests}</div>
                          <div>Failed: {testResult.summary.failedTests}</div>
                          <div>Success Rate: {testResult.summary.successRate}%</div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Sync Progress */}
                {syncResult && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Sync Progress</span>
                      <Badge variant={syncResult.success ? "default" : "destructive"}>
                        {syncResult.success ? '✅ Success' : '❌ Failed'}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      {syncResult.steps.map((step, index) => (
                        <motion.div
                          key={step.name}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-2 rounded-md bg-muted/50"
                        >
                          <div className="flex items-center gap-2">
                            <div className={getStatusColor(step.status)}>
                              {getStatusIcon(step.status)}
                            </div>
                            <span className="text-sm">{step.name}</span>
                          </div>
                          {step.status === 'error' && (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          )}
                        </motion.div>
                      ))}
                    </div>

                    {syncResult.summary && (
                      <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
                        <h4 className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">
                          📊 Sync Summary
                        </h4>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>Tables Created: {syncResult.summary.tablesCreated}</div>
                          <div>RLS Enabled: {syncResult.summary.rlsEnabled}</div>
                          <div>Functions: {syncResult.summary.functionsCreated}</div>
                          <div>Triggers: {syncResult.summary.triggersCreated}</div>
                        </div>
                      </div>
                    )}

                    {syncResult.error && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                          {syncResult.error}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}

                {/* Features */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">🚀 Features</h4>
                  <div className="grid grid-cols-1 gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      Automatic table creation
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      Row Level Security (RLS) policies
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      Database functions and triggers
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      Schema validation
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      Secure service role authentication
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}