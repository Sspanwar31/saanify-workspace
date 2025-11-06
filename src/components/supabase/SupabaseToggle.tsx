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
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

interface SupabaseToggleProps {
  className?: string
}

export default function SupabaseToggle({ className = "" }: SupabaseToggleProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [status, setStatus] = useState<'Not Connected' | 'Connecting' | 'Connected' | 'Error'>('Not Connected')
  const [supabaseUrl, setSupabaseUrl] = useState('')
  const [anonKey, setAnonKey] = useState('')
  const [serviceRoleKey, setServiceRoleKey] = useState('')
  const [showServiceKey, setShowServiceKey] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Position toggle in footer area instead of fixed
  const getPositionClasses = () => {
    if (isMinimized && !isOpen) {
      return "fixed bottom-6 right-6 z-40" // Minimized state - fixed position
    }
    return "relative" // Normal state - relative positioning
  }

  // Check if Supabase is already configured
  useEffect(() => {
    const checkSupabaseStatus = async () => {
      try {
        const res = await fetch('/api/integrations/supabase/status')
        if (res.ok) {
          const data = await res.json()
          if (data.configured && data.status === 'Connected') {
            setStatus('Connected')
          }
        }
      } catch (error) {
        console.log('Supabase status check failed:', error)
      }
    }
    
    checkSupabaseStatus()
  }, [])

  const handleValidate = async () => {
    if (!supabaseUrl || !anonKey) {
      toast.error("Missing Credentials", {
        description: "Please provide Supabase URL and Anon Key",
        duration: 3000,
      })
      return
    }

    setIsLoading(true)
    setStatus('Connecting')

    try {
      const res = await fetch('/api/integrations/supabase/validate', {
        method: 'POST',
        body: JSON.stringify({ supabaseUrl, anonKey }),
        headers: { 'Content-Type': 'application/json' },
      })

      if (res.ok) {
        const result = await res.json()
        setStatus('Connected')
        toast.success("✅ Validation Successful!", {
          description: result.message || "Supabase credentials are valid",
          duration: 4000,
        })
      } else {
        const error = await res.json()
        setStatus('Error')
        toast.error("❌ Validation Failed", {
          description: error.error || "Invalid Supabase credentials",
          duration: 5000,
        })
      }
    } catch (err: any) {
      setStatus('Error')
      toast.error("❌ Connection Error", {
        description: err.message || "Failed to validate credentials",
        duration: 5000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      toast.error("Missing Credentials", {
        description: "Please provide all required fields",
        duration: 3000,
      })
      return
    }

    setIsLoading(true)
    setStatus('Connecting')

    try {
      const res = await fetch('/api/integrations/supabase/save', {
        method: 'POST',
        body: JSON.stringify({ supabaseUrl, anonKey, serviceRoleKey }),
        headers: { 'Content-Type': 'application/json' },
      })

      if (res.ok) {
        const result = await res.json()
        setStatus('Connected')
        setIsOpen(false)
        setIsMinimized(false)
        toast.success("🎉 Supabase Connected!", {
          description: result.message || "Database tables and RLS policies created successfully",
          duration: 5000,
        })
      } else {
        const error = await res.json()
        setStatus('Error')
        toast.error("❌ Setup Failed", {
          description: error.error || "Failed to setup Supabase",
          duration: 5000,
        })
      }
    } catch (err: any) {
      setStatus('Error')
      toast.error("❌ Setup Error", {
        description: err.message || "Failed to save configuration",
        duration: 5000,
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
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Database className="h-4 w-4 text-gray-500" />
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
        className={getPositionClasses()}
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
      className={getPositionClasses()}
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
              <div className="p-4 space-y-3">
                {/* Quick Status */}
                <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                  <span className="text-sm font-medium">Enable Supabase</span>
                  <Switch
                    checked={status === 'Connected'}
                    onCheckedChange={(checked) => {
                      if (checked && status !== 'Connected') {
                        setIsOpen(true)
                      }
                    }}
                  />
                </div>

                {/* Configuration Panel */}
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="supabase-url" className="text-xs font-medium">Supabase URL</Label>
                    <Input
                      id="supabase-url"
                      type="text"
                      value={supabaseUrl}
                      onChange={(e) => setSupabaseUrl(e.target.value)}
                      placeholder="https://your-project-id.supabase.co"
                      className="w-full font-mono text-xs h-8"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="anon-key" className="text-xs font-medium">Anon Key</Label>
                    <Input
                      id="anon-key"
                      type="text"
                      value={anonKey}
                      onChange={(e) => setAnonKey(e.target.value)}
                      placeholder="Public anon key"
                      className="w-full font-mono text-xs h-8"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="service-key" className="text-xs font-medium">Service Role Key</Label>
                    <div className="relative">
                      <Input
                        id="service-key"
                        type={showServiceKey ? "text" : "password"}
                        value={serviceRoleKey}
                        onChange={(e) => setServiceRoleKey(e.target.value)}
                        placeholder="Private key (server-only)"
                        className="w-full font-mono text-xs h-8 pr-8"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-2 hover:bg-transparent"
                        onClick={() => setShowServiceKey(!showServiceKey)}
                      >
                        {showServiceKey ? (
                          <AlertCircle className="h-3 w-3" />
                        ) : (
                          <CheckCircle className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-1">
                    <Button
                      variant="outline"
                      className="flex-1 h-8 text-xs"
                      onClick={handleValidate}
                      disabled={isLoading || status === 'Connecting'}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          Validating...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Validate
                        </>
                      )}
                    </Button>
                    <Button
                      className="flex-1 h-8 text-xs"
                      onClick={handleSave}
                      disabled={isLoading || status === 'Connecting'}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          Setting up...
                        </>
                      ) : (
                        <>
                          <Database className="h-3 w-3 mr-1" />
                          Save & Setup
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Status Features */}
                {status === 'Connected' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="pt-2 border-t space-y-1.5"
                  >
                    <div className="flex items-center gap-1.5 text-xs text-green-600">
                      <Shield className="h-3 w-3" />
                      <span>RLS Policies Active</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-green-600">
                      <Lock className="h-3 w-3" />
                      <span>Secure Authentication</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-green-600">
                      <Zap className="h-3 w-3" />
                      <span>Real-time Sync</span>
                    </div>
                  </motion.div>
                )}

                {/* Security Notice */}
                <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
                  <div className="flex items-center gap-0.5 mb-1">
                    <Lock className="h-2.5 w-2.5" />
                    <span className="font-medium">Security:</span>
                  </div>
                  <ul className="space-y-0.5 ml-3">
                    <li>• Service role key secured server-side</li>
                    <li>• RLS policies ensure data isolation</li>
                    <li>• Only anon key used client-side</li>
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