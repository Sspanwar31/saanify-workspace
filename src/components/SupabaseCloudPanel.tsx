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
  Download,
  Trash2,
  Plus,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Clock,
  Settings,
  Activity
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import SecretsTab from './cloud/SecretsTab'
import LogsTab from './cloud/LogsTab'
import AutomationTab from './cloud/AutomationTab'

interface CloudStatus {
  connected: boolean
  lastSync?: string
  errorCount: number
  automationStatus: 'idle' | 'running' | 'error'
}

export default function SupabaseCloudPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('secrets')
  const [status, setStatus] = useState<CloudStatus>({
    connected: false,
    errorCount: 0,
    automationStatus: 'idle'
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      checkCloudStatus()
      // Auto-refresh every 30 seconds
      const interval = setInterval(checkCloudStatus, 30000)
      return () => clearInterval(interval)
    }
  }, [isOpen])

  const checkCloudStatus = async () => {
    try {
      const response = await fetch('/api/cloud/status')
      const data = await response.json()
      setStatus(data)
    } catch (error) {
      console.error('Failed to check cloud status:', error)
    }
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    toast.success(`📋 Switched to ${value.charAt(0).toUpperCase() + value.slice(1)} tab`, {
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

  return (
    <div className="fixed bottom-4 left-4 z-50">
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
            className="absolute bottom-16 left-0 w-[90vw] max-w-6xl"
          >
            <Card className="bg-background/95 backdrop-blur-sm border-2 shadow-xl">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Database className="h-6 w-6" />
                      Supabase Cloud Panel
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={status.connected ? "default" : "destructive"}
                        className="flex items-center gap-1"
                      >
                        {getStatusIcon()}
                        {status.connected ? 'Connected' : 'Disconnected'}
                      </Badge>
                      <Badge 
                        variant="outline"
                        className={`flex items-center gap-1 ${getAutomationColor()}`}
                      >
                        {getAutomationIcon()}
                        Automation: {status.automationStatus}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                  >
                    ×
                  </Button>
                </div>
                <CardDescription>
                  Complete automation, secrets, and logs integration for Supabase Cloud
                </CardDescription>
              </CardHeader>
              
              <CardContent className="p-0">
                <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
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
                      className="mt-6"
                    >
                      <TabsContent value="secrets" className="m-0">
                        <SecretsTab />
                      </TabsContent>
                      <TabsContent value="logs" className="m-0">
                        <LogsTab />
                      </TabsContent>
                      <TabsContent value="automation" className="m-0">
                        <AutomationTab />
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