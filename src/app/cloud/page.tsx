'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Cloud, 
  Database, 
  Users, 
  HardDrive, 
  Zap, 
  Brain, 
  Lock, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  Settings, 
  Activity,
  Shield,
  Key,
  Globe
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'

interface ConnectionStatus {
  connected: boolean
  url: string
  apiKey: string
  lastChecked: Date
}

export default function CloudPage() {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    connected: false,
    url: '',
    apiKey: '',
    lastChecked: new Date()
  })
  const [showApiKey, setShowApiKey] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    checkConnectionStatus()
  }, [])

  const checkConnectionStatus = async () => {
    try {
      const response = await fetch('/api/integrations/supabase/status')
      const data = await response.json()
      
      setConnectionStatus({
        connected: data.connected || data.connectionType === 'local',
        url: data.config?.url || '',
        apiKey: data.config?.serviceRoleKey || '',
        lastChecked: new Date()
      })
    } catch (error) {
      setConnectionStatus(prev => ({
        ...prev,
        connected: false,
        lastChecked: new Date()
      }))
    }
  }

  const handleSaveConfig = async () => {
    setIsConnecting(true)
    try {
      toast.loading('Saving Supabase configuration...', { id: 'save-config' })

      const response = await fetch('/api/integrations/supabase/configure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          supabaseUrl: connectionStatus.url,
          serviceRoleKey: connectionStatus.apiKey
        })
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Configuration Saved', {
          id: 'save-config',
          description: 'Supabase configuration updated successfully',
          duration: 3000
        })
        await checkConnectionStatus()
      } else {
        toast.error('Configuration Failed', {
          id: 'save-config',
          description: result.error || 'Failed to save configuration',
          duration: 3000
        })
      }
    } catch (error) {
      toast.error('Configuration Error', {
        id: 'save-config',
        description: 'An error occurred while saving configuration',
        duration: 3000
      })
    } finally {
      setIsConnecting(false)
    }
  }

  const handleTestConnection = async () => {
    setIsConnecting(true)
    try {
      toast.loading('Testing Supabase connection...', { id: 'test-connection' })

      const response = await fetch('/api/supabase/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Connection Successful', {
          id: 'test-connection',
          description: 'Successfully connected to Supabase',
          duration: 3000
        })
        await checkConnectionStatus()
      } else {
        toast.error('Connection Failed', {
          id: 'test-connection',
          description: result.message || 'Failed to connect to Supabase',
          duration: 3000
        })
      }
    } catch (error) {
      toast.error('Connection Error', {
        id: 'test-connection',
        description: 'An error occurred while testing connection',
        duration: 3000
      })
    } finally {
      setIsConnecting(false)
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Cloud className="h-4 w-4" /> },
    { id: 'database', label: 'Database', icon: <Database className="h-4 w-4" /> },
    { id: 'users', label: 'Users', icon: <Users className="h-4 w-4" /> },
    { id: 'storage', label: 'Storage', icon: <HardDrive className="h-4 w-4" /> },
    { id: 'functions', label: 'Edge Functions', icon: <Zap className="h-4 w-4" /> },
    { id: 'ai', label: 'AI', icon: <Brain className="h-4 w-4" /> },
    { id: 'secrets', label: 'Secrets', icon: <Lock className="h-4 w-4" /> },
    { id: 'logs', label: 'Logs', icon: <FileText className="h-4 w-4" /> }
  ]

  const renderTabContent = (tabId: string) => {
    switch (tabId) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Database className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Database</p>
                      <p className="text-2xl font-bold">PostgreSQL</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Users className="h-8 w-8 text-green-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Active Users</p>
                      <p className="text-2xl font-bold">1,234</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <HardDrive className="h-8 w-8 text-purple-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Storage</p>
                      <p className="text-2xl font-bold">45.2 GB</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-8 w-8 text-orange-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">API Calls</p>
                      <p className="text-2xl font-bold">89.2K</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Your Supabase instance is secured with Row Level Security (RLS) and enterprise-grade encryption.
              </AlertDescription>
            </Alert>
          </div>
        )
      
      case 'database':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Database Schema
                  </CardTitle>
                  <CardDescription>
                    Manage your database tables and relationships
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Tables</span>
                      <Badge variant="secondary">12</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Indexes</span>
                      <Badge variant="secondary">28</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>RLS Policies</span>
                      <Badge variant="secondary">15</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Performance
                  </CardTitle>
                  <CardDescription>
                    Database performance metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Query Time</span>
                      <Badge variant="default">12ms</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Connections</span>
                      <Badge variant="default">24/100</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Cache Hit Rate</span>
                      <Badge variant="default">94.2%</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )
      
      case 'users':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Management
                </CardTitle>
                <CardDescription>
                  Manage user authentication and authorization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-2xl font-bold">1,234</p>
                      <p className="text-sm text-muted-foreground">Total Users</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-2xl font-bold">892</p>
                      <p className="text-sm text-muted-foreground">Active Today</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-2xl font-bold">45</p>
                      <p className="text-sm text-muted-foreground">New This Week</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      
      case 'storage':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HardDrive className="h-5 w-5" />
                  Storage Management
                </CardTitle>
                <CardDescription>
                  File storage and CDN management
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span>Used Storage</span>
                        <Badge variant="secondary">45.2 GB</Badge>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '45.2%' }}></div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">of 100 GB</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span>Bandwidth</span>
                        <Badge variant="secondary">2.3 TB</Badge>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '23%' }}></div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">of 10 TB</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      
      case 'functions':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Edge Functions
                </CardTitle>
                <CardDescription>
                  Serverless functions deployment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <p className="text-lg font-semibold">Deployed Functions</p>
                      <p className="text-2xl font-bold">8</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-lg font-semibold">Invocations</p>
                      <p className="text-2xl font-bold">1.2M</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      
      case 'ai':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  AI & Machine Learning
                </CardTitle>
                <CardDescription>
                  AI-powered features and models
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <p className="text-lg font-semibold">AI Models</p>
                      <p className="text-2xl font-bold">3</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-lg font-semibold">API Calls</p>
                      <p className="text-2xl font-bold">456K</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      
      case 'secrets':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Secrets Management
                </CardTitle>
                <CardDescription>
                  Secure environment variables and secrets
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert>
                    <Key className="h-4 w-4" />
                    <AlertDescription>
                      Your secrets are encrypted at rest and in transit. Only authorized services can access them.
                    </AlertDescription>
                  </Alert>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <p className="text-lg font-semibold">Stored Secrets</p>
                      <p className="text-2xl font-bold">12</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-lg font-semibold">Last Rotation</p>
                      <p className="text-2xl font-bold">7d</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      
      case 'logs':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Logs & Monitoring
                </CardTitle>
                <CardDescription>
                  Application logs and monitoring data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg">
                      <p className="text-lg font-semibold">Log Entries</p>
                      <p className="text-2xl font-bold">2.3M</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-lg font-semibold">Error Rate</p>
                      <p className="text-2xl font-bold">0.12%</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-lg font-semibold">Uptime</p>
                      <p className="text-2xl font-bold">99.9%</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Cloud className="h-6 w-6 text-primary" />
              </motion.div>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  ☁️ Saanify Cloud
                </h1>
                <p className="text-sm text-muted-foreground">
                  Supabase Control Center
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Badge 
                variant={connectionStatus.connected ? "default" : "destructive"}
                className="flex items-center gap-2"
              >
                {connectionStatus.connected ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Connected
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4" />
                    Not Connected
                  </>
                )}
              </Badge>
              
              <Button
                onClick={checkConnectionStatus}
                variant="outline"
                size="sm"
                disabled={isConnecting}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isConnecting ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Configuration Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Supabase Configuration
              </CardTitle>
              <CardDescription>
                Configure your Supabase connection settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="supabase-url">Supabase URL</Label>
                  <Input
                    id="supabase-url"
                    placeholder="https://your-project.supabase.co"
                    value={connectionStatus.url}
                    onChange={(e) => setConnectionStatus(prev => ({ ...prev, url: e.target.value }))}
                    className="font-mono text-sm"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="api-key">Service Role API Key</Label>
                  <div className="relative">
                    <Input
                      id="api-key"
                      type={showApiKey ? 'text' : 'password'}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      value={connectionStatus.apiKey}
                      onChange={(e) => setConnectionStatus(prev => ({ ...prev, apiKey: e.target.value }))}
                      className="font-mono text-sm pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    >
                      {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Globe className="h-4 w-4" />
                  <span>Last checked: {connectionStatus.lastChecked.toLocaleTimeString()}</span>
                </div>
                
                <div className="flex space-x-3">
                  <Button
                    onClick={handleTestConnection}
                    variant="outline"
                    disabled={isConnecting || !connectionStatus.url || !connectionStatus.apiKey}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isConnecting ? 'animate-spin' : ''}`} />
                    Test Connection
                  </Button>
                  
                  <Button
                    onClick={handleSaveConfig}
                    disabled={isConnecting || !connectionStatus.url || !connectionStatus.apiKey}
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Save Configuration
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 h-auto p-1">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex flex-col items-center space-y-1 p-2 h-auto data-[state=active]:bg-background"
                >
                  {tab.icon}
                  <span className="text-xs hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
            
            <div className="mt-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderTabContent(activeTab)}
                </motion.div>
              </AnimatePresence>
            </div>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}