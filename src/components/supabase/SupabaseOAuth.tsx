'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Database, 
  Settings,
  X,
  ChevronRight,
  Shield,
  Lock,
  Zap,
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Link,
  LogOut
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'

interface SupabaseOAuthProps {
  className?: string
}

export default function SupabaseOAuth({ className = "" }: SupabaseOAuthProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [status, setStatus] = useState<'Not Connected' | 'Connecting' | 'Connected' | 'Error'>('Not Connected')
  const [isLoading, setIsLoading] = useState(false)
  const [config, setConfig] = useState<any>(null)

  // Check current Supabase status
  useEffect(() => {
    const checkSupabaseStatus = async () => {
      try {
        const res = await fetch('/api/integrations/supabase/status')
        if (res.ok) {
          const data = await res.json()
          setConfig(data.config)
          if (data.configured && data.status === 'connected') {
            setStatus('Connected')
          }
        }
      } catch (error) {
        console.log('Supabase status check failed:', error)
      }
    }
    
    checkSupabaseStatus()
  }, [])

  const handleConnect = async () => {
    setIsLoading(true)
    setStatus('Connecting')

    try {
      const res = await fetch('/api/integrations/supabase/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'connect' })
      })

      const result = await res.json()

      if (result.redirect) {
        // Redirect to Supabase OAuth
        window.location.href = result.authUrl
      } else {
        setStatus('Error')
        toast.error("❌ Connection Failed", {
          description: result.error || "Failed to connect to Supabase",
          duration: 5000,
        })
      }
    } catch (err: any) {
      setStatus('Error')
      toast.error("❌ Connection Error", {
        description: err.message || "Failed to connect to Supabase",
        duration: 5000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDisconnect = async () => {
    setIsLoading(true)
    setStatus('Connecting')

    try {
      const res = await fetch('/api/integrations/supabase/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      const result = await res.json()

      if (result.success) {
        setStatus('Not Connected')
        setConfig(null)
        toast.success("🔌 Disconnected from Supabase", {
          description: "Successfully disconnected from Supabase",
          duration: 3000,
        })
      } else {
        setStatus('Error')
        toast.error("❌ Disconnect Failed", {
          description: result.error || "Failed to disconnect",
          duration: 5000,
        })
      }
    } catch (err: any) {
      setStatus('Error')
      toast.error("❌ Disconnect Error", {
        description: err.message || "Failed to disconnect",
        duration: 5000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = async () => {
    setIsLoading(true)
    setStatus('Connecting')

    try {
      const res = await fetch('/api/integrations/supabase/status')
      const data = await res.json()
      
      if (data.configured) {
        setConfig(data.config)
        if (data.status === 'connected') {
          setStatus('Connected')
          toast.success("✅ Connection Refreshed", {
            description: "Supabase connection verified",
            duration: 3000,
          })
        } else {
          setStatus('Error')
          toast.error("❌ Connection Lost", {
            description: "Please reconnect to Supabase",
            duration: 3000,
          })
        }
      } else {
        setStatus('Not Connected')
        toast.info("🔗 Not Connected", {
          description: "Connect to Supabase to get started",
          duration: 3000,
        })
      }
    } catch (err: any) {
      setStatus('Error')
      toast.error("❌ Refresh Failed", {
        description: "Failed to check status",
        duration: 3000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'Connecting':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
      case 'Connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'Error':
        <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        <Database className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'Connected':
        return 'text-green-600'
      case 'Error':
        return 'text-red-600'
      case 'Connecting':
        return 'text-blue-600'
      default:
        return 'text-gray-600'
    }
  }

  // Minimized state - just a small toggle button
  if (isMinimized && !isOpen) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed bottom-6 right-6 z-40"
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsMinimized(false)}
          className="bg-background/95 backdrop-blur-sm border-2 shadow-lg hover:shadow-xl transition-all duration-300 rounded-full"
        >
          <Database className="h-4 w-4 mr-2" />
          Supabase
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </motion.div>
    )
  }

  // Expanded toggle panel
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      <Card className="bg-background/95 backdrop-blur-sm border-2 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b bg-gradient-to-r from-green-500/10 to-emerald-600/10">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white">
              <Database className="h-4 w-4" />
            </div>
            <div>
              <h4 className="font-semibold text-sm">Supabase Integration</h4>
              <div className="flex items-center gap-1">
                {getStatusIcon()}
                <span className={`text-xs font-medium ${getStatusColor()}`}>
                  {status === 'Not Connected' && 'Not Connected'}
                  {status === 'Connecting' && 'Connecting...'}
                  {status === 'Connected' && 'Connected'}
                  {status === 'Error' && 'Error'}
                </span>
              </div>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(true)}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="p-4 space-y-4">
                {/* Quick Status */}
                <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                  <span className="text-sm font-medium">Enable Supabase</span>
                  <Switch
                    checked={status === 'Connected'}
                    onCheckedChange={(checked) => {
                      if (checked && status !== 'Connected') {
                        handleConnect()
                      } else if (!checked && status === 'Connected') {
                        handleDisconnect()
                      }
                    }}
                  />
                </div>

                {/* OAuth Connection Button */}
                <div className="space-y-3">
                  <div className="text-center space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Connect your Supabase project with one-click OAuth authentication
                    </p>
                    <p className="text-xs text-muted-foreground">
                      No manual keys required - secure OAuth flow
                    </p>
                  </div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      onClick={handleConnect}
                      disabled={isLoading || status === 'Connecting'}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <Database className="h-4 w-4 mr-2" />
                          🔗 Connect Supabase
                        </>
                      )}
                    </Button>
                  </motion.div>

                  {/* Alternative Connection Options */}
                  <div className="pt-2 border-t">
                    <div className="flex gap-2">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleRefresh}
                          disabled={isLoading}
                          className="flex-1 border-2 border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700"
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Refresh
                        </Button>
                      </motion.div>
                      
                      {config?.enabled && (
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDisconnect}
                            disabled={isLoading}
                            className="flex-1 border-2 border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700"
                          >
                            <LogOut className="h-4 w-4 mr-2" />
                            Disconnect
                          </Button>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status Display */}
                {status === 'Connected' && config && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="pt-2 border-t space-y-2"
                  >
                    <div className="text-center space-y-2">
                      <div className="inline-flex items-center justify-center p-2 bg-green-50 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                        <span className="text-sm font-medium text-green-700">Connected Successfully</span>
                      </div>
                      
                      <div className="text-center text-xs text-muted-foreground space-y-1">
                        <p><strong>Organization:</strong> {config.supabase.organization?.name}</p>
                        <p><strong>Project:</strong> {config.supabase.project?.name}</p>
                        <p><strong>Region:</strong> {config.supabase.project?.database_region}</p>
                      </div>

                      <div className="flex items-center justify-center">
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          <Link 
                            href={config.supabase.project?.database_url} 
                            target="_blank"
                            className="text-green-700 hover:text-green-900 underline"
                          >
                            📊 Database Dashboard
                          </Link>
                        </Badge>
                      </div>
                    </div>
                    </motion.div>
                )}

                {/* Security Notice */}
                <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
                  <div className="flex items-center gap-0.5 mb-1">
                    <Shield className="h-2.5 w-2.5" />
                    <span className="font-medium">Security:</span>
                  </div>
                  <ul className="space-y-0.5 ml-3 text-xs">
                    <li>• OAuth authentication (no keys stored)</li>
                    <li> Encrypted token storage</li>
                    <li> Automatic token refresh</li>
                    <li> Enterprise-grade security</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toggle Button */}
        <div className="p-2 border-t">
          <Button
            variant="outline"
            className="w-full h-7 text-xs"
            onClick={() => setIsOpen(!isOpen)}
            size="sm"
          >
            <Settings className="h-3 w-3 mr-1" />
            {isOpen ? 'Hide Configuration' : 'Show Configuration'}
          </Button>
        </div>
      </Card>
    </motion.div>
  )
}