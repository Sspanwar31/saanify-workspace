'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Database, 
  Settings, 
  Check, 
  X, 
  AlertCircle, 
  Loader2, 
  Eye, 
  EyeOff, 
  Copy, 
  ExternalLink,
  Save,
  RefreshCw,
  Shield,
  Key,
  Globe
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface SupabaseConfig {
  url: string
  anonKey: string
  serviceRoleKey: string
  isEnabled: boolean
  isValid: boolean
  lastValidated?: string
}

export default function SupabaseToggle() {
  const [isOpen, setIsOpen] = useState(false)
  const [config, setConfig] = useState<SupabaseConfig>({
    url: '',
    anonKey: '',
    serviceRoleKey: '',
    isEnabled: false,
    isValid: false
  })
  const [showKeys, setShowKeys] = useState({
    anonKey: false,
    serviceRoleKey: false
  })
  const [isValidating, setIsValidating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [validationResult, setValidationResult] = useState<{
    status: 'idle' | 'validating' | 'success' | 'error'
    message?: string
    details?: any
  }>({ status: 'idle' })

  // Load saved config on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('supabase-config')
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig)
        setConfig(parsed)
      } catch (error) {
        console.error('Failed to load Supabase config:', error)
      }
    }
  }, [])

  const validateConfig = async () => {
    if (!config.url || !config.anonKey) {
      setValidationResult({
        status: 'error',
        message: 'URL and Anonymous Key are required for validation'
      })
      return
    }

    setIsValidating(true)
    setValidationResult({ status: 'validating' })

    try {
      // Test the Supabase connection
      const response = await fetch(`${config.url}/rest/v1/`, {
        headers: {
          'apikey': config.anonKey,
          'Authorization': `Bearer ${config.anonKey}`
        }
      })

      if (response.ok) {
        const result = {
          status: 'success' as const,
          message: 'Supabase connection validated successfully!',
          details: {
            url: config.url,
            status: response.status,
            timestamp: new Date().toISOString()
          }
        }
        setValidationResult(result)
        setConfig(prev => ({ ...prev, isValid: true, lastValidated: new Date().toISOString() }))
        
        toast.success('✅ Validation Successful', {
          description: 'Your Supabase configuration is working correctly.',
          duration: 3000,
        })
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
    } catch (error) {
      const result = {
        status: 'error' as const,
        message: error instanceof Error ? error.message : 'Validation failed',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      }
      setValidationResult(result)
      setConfig(prev => ({ ...prev, isValid: false }))
      
      toast.error('❌ Validation Failed', {
        description: result.message,
        duration: 5000,
      })
    } finally {
      setIsValidating(false)
    }
  }

  const saveConfig = async () => {
    if (!config.url || !config.anonKey) {
      toast.error('❌ Required Fields Missing', {
        description: 'Please fill in URL and Anonymous Key.',
        duration: 3000,
      })
      return
    }

    setIsSaving(true)

    try {
      // Save to localStorage
      localStorage.setItem('supabase-config', JSON.stringify(config))
      
      // Update environment variables
      if (config.isEnabled && config.isValid) {
        const response = await fetch('/api/integrations/supabase/update-env', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: config.url,
            anonKey: config.anonKey,
            serviceRoleKey: config.serviceRoleKey,
            isEnabled: config.isEnabled
          }),
        })

        const result = await response.json()
        
        if (result.success) {
          console.log('Environment variables updated successfully')
          // Force reload to pick up new environment variables
          setTimeout(() => {
            window.location.reload()
          }, 1000)
        } else {
          console.error('Failed to update environment variables:', result.error)
        }
      }

      toast.success('✅ Configuration Saved', {
        description: config.isEnabled 
          ? 'Supabase integration is now active. Reloading...' 
          : 'Configuration saved but integration is disabled.',
        duration: 3000,
      })

      // Close the modal after successful save
      setTimeout(() => setIsOpen(false), 1500)
    } catch (error) {
      toast.error('❌ Save Failed', {
        description: 'Failed to save configuration. Please try again.',
        duration: 3000,
      })
    } finally {
      setIsSaving(false)
    }
  }

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`📋 ${type} Copied`, {
      description: 'Copied to clipboard successfully.',
      duration: 2000,
    })
  }

  const resetConfig = () => {
    setConfig({
      url: '',
      anonKey: '',
      serviceRoleKey: '',
      isEnabled: false,
      isValid: false
    })
    setValidationResult({ status: 'idle' })
    localStorage.removeItem('supabase-config')
    
    toast.info('🔄 Configuration Reset', {
      description: 'All Supabase settings have been cleared.',
      duration: 3000,
    })
  }

  const setupDatabase = async () => {
    if (!config.url || !config.serviceRoleKey) {
      toast.error('❌ Configuration Required', {
        description: 'Please configure URL and Service Role Key first.',
        duration: 3000,
      })
      return
    }

    try {
      const response = await fetch('/api/integrations/supabase/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()

      if (result.success) {
        toast.success('🎉 Database Setup Complete!', {
          description: `Created ${result.usersCreated} demo users successfully.`,
          duration: 5000,
        })

        if (result.users && result.users.length > 0) {
          console.log('Demo users created:', result.users)
        }

        // Revalidate connection after setup
        setTimeout(() => {
          validateConfig()
        }, 2000)
      } else {
        toast.error('❌ Setup Failed', {
          description: result.error || 'Failed to setup database.',
          duration: 5000,
        })
      }
    } catch (error) {
      toast.error('❌ Setup Error', {
        description: 'Failed to setup database. Please try again.',
        duration: 3000,
      })
    }
  }

  const getStatusBadge = () => {
    if (!config.isEnabled) {
      return <Badge variant="secondary">Disabled</Badge>
    }
    if (config.isValid) {
      return <Badge variant="default" className="bg-green-500">Connected</Badge>
    }
    return <Badge variant="destructive">Error</Badge>
  }

  return (
    <>
      {/* Floating Toggle Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Button
            onClick={() => setIsOpen(true)}
            size="lg"
            className={`rounded-full w-14 h-14 shadow-lg ${
              config.isEnabled && config.isValid 
                ? 'bg-green-500 hover:bg-green-600' 
                : 'bg-primary hover:bg-primary/90'
            }`}
          >
            <Database className="h-6 w-6" />
          </Button>
        </motion.div>
        
        {/* Status Badge */}
        <div className="absolute -top-2 -right-2">
          {getStatusBadge()}
        </div>
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-4xl md:max-h-[90vh] bg-background border rounded-lg shadow-2xl z-50 overflow-hidden"
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Database className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">Supabase Integration</h2>
                      <p className="text-sm text-muted-foreground">
                        Configure your Supabase database connection
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge()}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsOpen(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  <Tabs defaultValue="config" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="config">Configuration</TabsTrigger>
                      <TabsTrigger value="validate">Validation</TabsTrigger>
                      <TabsTrigger value="help">Help & Guide</TabsTrigger>
                    </TabsList>

                    <TabsContent value="config" className="space-y-6">
                      {/* Enable/Disable Toggle */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Settings className="h-5 w-5" />
                            Integration Status
                          </CardTitle>
                          <CardDescription>
                            Enable or disable Supabase integration for your application
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor="enable-supabase">Enable Supabase</Label>
                              <p className="text-sm text-muted-foreground">
                                Connect your application to Supabase backend
                              </p>
                            </div>
                            <Switch
                              id="enable-supabase"
                              checked={config.isEnabled}
                              onCheckedChange={(checked) => 
                                setConfig(prev => ({ ...prev, isEnabled: checked }))
                              }
                            />
                          </div>
                        </CardContent>
                      </Card>

                      {/* Configuration Fields */}
                      <div className="grid gap-4">
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Globe className="h-5 w-5" />
                              Project URL
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <Label htmlFor="supabase-url">Supabase Project URL</Label>
                            <div className="relative">
                              <Input
                                id="supabase-url"
                                type="url"
                                placeholder="https://your-project.supabase.co"
                                value={config.url}
                                onChange={(e) => setConfig(prev => ({ ...prev, url: e.target.value }))}
                                className="pr-10"
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                                onClick={() => config.url && copyToClipboard(config.url, 'URL')}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Key className="h-5 w-5" />
                              API Keys
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div>
                              <Label htmlFor="anon-key">Anonymous Key</Label>
                              <div className="relative">
                                <Input
                                  id="anon-key"
                                  type={showKeys.anonKey ? "text" : "password"}
                                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                                  value={config.anonKey}
                                  onChange={(e) => setConfig(prev => ({ ...prev, anonKey: e.target.value }))}
                                  className="pr-20"
                                />
                                <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => setShowKeys(prev => ({ ...prev, anonKey: !prev.anonKey }))}
                                  >
                                    {showKeys.anonKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => config.anonKey && copyToClipboard(config.anonKey, 'Anonymous Key')}
                                  >
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>

                            <div>
                              <Label htmlFor="service-role-key">Service Role Key</Label>
                              <div className="relative">
                                <Input
                                  id="service-role-key"
                                  type={showKeys.serviceRoleKey ? "text" : "password"}
                                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                                  value={config.serviceRoleKey}
                                  onChange={(e) => setConfig(prev => ({ ...prev, serviceRoleKey: e.target.value }))}
                                  className="pr-20"
                                />
                                <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => setShowKeys(prev => ({ ...prev, serviceRoleKey: !prev.serviceRoleKey }))}
                                  >
                                    {showKeys.serviceRoleKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => config.serviceRoleKey && copyToClipboard(config.serviceRoleKey, 'Service Role Key')}
                                  >
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                Keep this key secure and never expose it in client-side code
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>

                    <TabsContent value="validate" className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Connection Validation
                          </CardTitle>
                          <CardDescription>
                            Test your Supabase configuration to ensure it's working correctly
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Connection Status</p>
                              <p className="text-sm text-muted-foreground">
                                {config.lastValidated 
                                  ? `Last validated: ${new Date(config.lastValidated).toLocaleString()}`
                                  : 'Not yet validated'
                                }
                              </p>
                            </div>
                            <Button
                              onClick={validateConfig}
                              disabled={isValidating || !config.url || !config.anonKey}
                              className="flex items-center gap-2"
                            >
                              {isValidating ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  Validating...
                                </>
                              ) : (
                                <>
                                  <RefreshCw className="h-4 w-4" />
                                  Validate Connection
                                </>
                              )}
                            </Button>
                          </div>

                          {validationResult.status !== 'idle' && (
                            <Alert className={validationResult.status === 'success' ? 'border-green-500' : 'border-red-500'}>
                              <div className="flex items-start gap-2">
                                {validationResult.status === 'success' ? (
                                  <Check className="h-4 w-4 text-green-500 mt-0.5" />
                                ) : validationResult.status === 'error' ? (
                                  <X className="h-4 w-4 text-red-500 mt-0.5" />
                                ) : (
                                  <Loader2 className="h-4 w-4 animate-spin mt-0.5" />
                                )}
                                <div className="flex-1">
                                  <AlertDescription>
                                    {validationResult.message}
                                  </AlertDescription>
                                  {validationResult.details && (
                                    <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-x-auto">
                                      {JSON.stringify(validationResult.details, null, 2)}
                                    </pre>
                                  )}
                                </div>
                              </div>
                            </Alert>
                          )}

                          {/* Database Setup Button */}
                          <div className="mt-6">
                            <Button
                              onClick={setupDatabase}
                              disabled={!config.url || !config.serviceRoleKey}
                              className="w-full flex items-center gap-2"
                              variant="outline"
                            >
                              <Database className="h-4 w-4" />
                              Setup Database & Create Demo Users
                            </Button>
                            <p className="text-xs text-muted-foreground mt-2 text-center">
                              This will create the database schema and demo users for testing
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="help" className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Setup Guide</CardTitle>
                          <CardDescription>
                            Follow these steps to configure your Supabase integration
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid gap-4">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                                1
                              </div>
                              <div>
                                <p className="font-medium">Create a Supabase Project</p>
                                <p className="text-sm text-muted-foreground">
                                  Go to{' '}
                                  <Button
                                    variant="link"
                                    className="p-0 h-auto text-primary"
                                    onClick={() => window.open('https://supabase.com', '_blank')}
                                  >
                                    supabase.com
                                    <ExternalLink className="h-3 w-3 ml-1" />
                                  </Button>
                                  {' '}and create a new project.
                                </p>
                              </div>
                            </div>

                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                                2
                              </div>
                              <div>
                                <p className="font-medium">Get Your Credentials</p>
                                <p className="text-sm text-muted-foreground">
                                  Navigate to Settings {'>'} API in your Supabase dashboard to find your Project URL and API keys.
                                </p>
                              </div>
                            </div>

                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                                3
                              </div>
                              <div>
                                <p className="font-medium">Configure Here</p>
                                <p className="text-sm text-muted-foreground">
                                  Copy your Project URL and Anonymous Key to the configuration tab above.
                                </p>
                              </div>
                            </div>

                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                                4
                              </div>
                              <div>
                                <p className="font-medium">Validate & Save</p>
                                <p className="text-sm text-muted-foreground">
                                  Test your connection and save the configuration to enable the integration.
                                </p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Security Notes</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                              <ul className="list-disc list-inside space-y-1 text-sm">
                                <li>Never share your Service Role Key publicly</li>
                                <li>Use Row Level Security (RLS) in your Supabase tables</li>
                                <li>Regularly rotate your API keys</li>
                                <li>Use environment variables in production</li>
                              </ul>
                            </AlertDescription>
                          </Alert>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between p-6 border-t bg-muted/30">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={resetConfig}
                      className="flex items-center gap-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Reset
                    </Button>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={saveConfig}
                      disabled={isSaving}
                      className="flex items-center gap-2"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Save & Setup
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}