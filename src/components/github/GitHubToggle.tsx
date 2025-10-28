'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Github, 
  Download, 
  Code, 
  ChevronDown, 
  ExternalLink, 
  Copy, 
  Terminal,
  GitBranch,
  Users,
  Settings,
  Check,
  X,
  Loader2,
  Shield,
  Zap,
  Upload,
  RefreshCw,
  Clock,
  Usb,
  Play,
  Pause
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface GitHubConfig {
  owner: string
  repo: string
  token: string
  branch: string
  isConnected: boolean
  accountName: string
}

interface BackupStatus {
  isAutoBackupEnabled: boolean
  isDongleModeEnabled: boolean
  lastBackupTime: string | null
  autoBackupStatus: 'active' | 'paused' | 'error'
  dongleConnected: boolean
}

export default function GitHubToggle() {
  const [isOpen, setIsOpen] = useState(false)
  const [config, setConfig] = useState<GitHubConfig>({
    owner: '',
    repo: '',
    token: '',
    branch: 'main',
    isConnected: false,
    accountName: ''
  })
  const [backupStatus, setBackupStatus] = useState<BackupStatus>({
    isAutoBackupEnabled: false,
    isDongleModeEnabled: false,
    lastBackupTime: null,
    autoBackupStatus: 'paused',
    dongleConnected: true
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isBackingUp, setIsBackingUp] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null)
  const [activeTab, setActiveTab] = useState('sync')
  const [copied, setCopied] = useState('')
  const autoBackupInterval = useRef<NodeJS.Timeout | null>(null)

  // Load config from localStorage
  useEffect(() => {
    const savedConfig = localStorage.getItem('github-toggle-config')
    if (savedConfig) {
      const parsed = JSON.parse(savedConfig)
      setConfig(parsed)
    }

    const savedBackupStatus = localStorage.getItem('backup-status')
    if (savedBackupStatus) {
      const parsed = JSON.parse(savedBackupStatus)
      setBackupStatus(parsed)
    }
  }, [])

  // Save config to localStorage
  const saveConfig = () => {
    localStorage.setItem('github-toggle-config', JSON.stringify(config))
    setMessage({ type: 'success', text: 'GitHub configuration saved successfully!' })
    setTimeout(() => setMessage(null), 3000)
  }

  // Save backup status to localStorage
  const saveBackupStatus = (status: Partial<BackupStatus>) => {
    const newStatus = { ...backupStatus, ...status }
    setBackupStatus(newStatus)
    localStorage.setItem('backup-status', JSON.stringify(newStatus))
  }

  // Show notification
  const showNotification = (type: 'success' | 'error' | 'info', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 3000)
    console.log(`[${type.toUpperCase()}] ${text}`)
  }

  // Copy to clipboard
  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(''), 2000)
  }

  // Connect to GitHub
  const connectToGitHub = async () => {
    setIsLoading(true)
    try {
      // Simulate GitHub connection
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setConfig({
        ...config,
        isConnected: true,
        accountName: config.owner || 'admin'
      })
      
      saveConfig()
      showNotification('success', `✅ Connected to ${config.owner}/${config.repo}`)
    } catch (error) {
      showNotification('error', 'Failed to connect to GitHub')
    } finally {
      setIsLoading(false)
    }
  }

  // Quick Backup with GitHub Push
  const quickBackup = async () => {
    if (!config.isConnected) {
      showNotification('error', 'Please connect to GitHub first')
      return
    }

    setIsBackingUp(true)
    try {
      const response = await fetch('/api/github/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'github-push-backup',
          config,
          pushToGitHub: true
        })
      })

      const data = await response.json()
      
      if (data.success) {
        showNotification('success', '✅ Backup pushed to GitHub successfully')
        saveBackupStatus({ lastBackupTime: new Date().toISOString() })
      } else {
        showNotification('error', data.error || 'Backup failed')
      }
    } catch (error) {
      showNotification('error', 'Failed to create backup')
    } finally {
      setIsBackingUp(false)
    }
  }

  // Auto Backup Toggle
  const toggleAutoBackup = (enabled: boolean) => {
    if (enabled && !config.isConnected) {
      showNotification('error', 'Please connect to GitHub first')
      return
    }

    saveBackupStatus({ 
      isAutoBackupEnabled: enabled,
      autoBackupStatus: enabled ? 'active' : 'paused'
    })

    if (enabled) {
      startAutoBackup()
      showNotification('success', 'Auto Backup enabled')
    } else {
      stopAutoBackup()
      showNotification('info', 'Auto Backup paused')
    }
  }

  // Start Auto Backup
  const startAutoBackup = () => {
    if (autoBackupInterval.current) {
      clearInterval(autoBackupInterval.current)
    }

    autoBackupInterval.current = setInterval(async () => {
      if (backupStatus.isDongleModeEnabled && !backupStatus.dongleConnected) {
        saveBackupStatus({ autoBackupStatus: 'paused' })
        showNotification('error', 'Dongle not detected — Auto Backup paused')
        return
      }

      try {
        const response = await fetch('/api/github/backup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            action: 'auto-backup',
            config,
            pushToGitHub: true
          })
        })

        const data = await response.json()
        
        if (data.success) {
          saveBackupStatus({ lastBackupTime: new Date().toISOString() })
          console.log('🧩 Auto backup completed successfully')
        } else {
          console.error('Auto backup failed:', data.error)
        }
      } catch (error) {
        console.error('Auto backup error:', error)
      }
    }, 2 * 60 * 1000) // 2 minutes
  }

  // Stop Auto Backup
  const stopAutoBackup = () => {
    if (autoBackupInterval.current) {
      clearInterval(autoBackupInterval.current)
      autoBackupInterval.current = null
    }
  }

  // Restore Latest Backup
  const restoreLatest = async () => {
    if (!config.isConnected) {
      showNotification('error', 'Please connect to GitHub first')
      return
    }

    setIsRestoring(true)
    try {
      const response = await fetch('/api/github/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'restore',
          config
        })
      })

      const data = await response.json()
      
      if (data.success) {
        showNotification('success', '✅ Project restored from latest commit')
      } else {
        showNotification('error', data.error || 'Restore failed')
      }
    } catch (error) {
      showNotification('error', 'Failed to restore backup')
    } finally {
      setIsRestoring(false)
    }
  }

  // Toggle Dongle Mode
  const toggleDongleMode = (enabled: boolean) => {
    saveBackupStatus({ isDongleModeEnabled: enabled })
    
    if (enabled) {
      // Simulate dongle detection
      const dongleDetected = Math.random() > 0.3 // 70% chance of detection
      saveBackupStatus({ dongleConnected: dongleDetected })
      
      if (dongleDetected) {
        showNotification('success', 'Dongle detected and enabled')
      } else {
        showNotification('error', 'Dongle not detected — Auto Backup paused')
        saveBackupStatus({ autoBackupStatus: 'paused' })
      }
    } else {
      showNotification('info', 'Dongle mode disabled')
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAutoBackup()
    }
  }, [])

  // Clone repository
  const cloneRepository = (method: 'https' | 'ssh' | 'cli') => {
    const url = method === 'https' 
      ? `https://github.com/${config.owner}/${config.repo}.git`
      : method === 'ssh'
      ? `git@github.com:${config.owner}/${config.repo}.git`
      : `gh repo clone ${config.owner}/${config.repo}`
    
    copyToClipboard(url, method)
  }

  // Open in VS Code
  const openInVSCode = () => {
    if (!config.isConnected || !config.owner || !config.repo) {
      showNotification('error', 'Please connect to GitHub first')
      return
    }
    
    const encodedOwner = encodeURIComponent(config.owner)
    const encodedRepo = encodeURIComponent(config.repo)
    const vscodeUrl = `https://vscode.dev/github/${encodedOwner}/${encodedRepo}`
    window.open(vscodeUrl, '_blank')
  }

  // Open in GitHub.dev
  const openInGitHubDev = () => {
    if (!config.isConnected || !config.owner || !config.repo) {
      showNotification('error', 'Please connect to GitHub first')
      return
    }
    
    const githubDevUrl = `https://github.dev/${config.owner}/${config.repo}`
    window.open(githubDevUrl, '_blank')
  }

  // View on GitHub
  const viewOnGitHub = () => {
    window.open(`https://github.com/${config.owner}/${config.repo}`, '_blank')
  }

  return (
    <div className="fixed top-6 right-6 z-50">
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-4"
          >
            <Alert className={`w-80 ${
              message.type === 'success' ? 'border-green-500 bg-green-50' :
              message.type === 'error' ? 'border-red-500 bg-red-50' :
              'border-blue-500 bg-blue-50'
            }`}>
              <Check className={`h-4 w-4 ${
                message.type === 'success' ? 'text-green-600' :
                message.type === 'error' ? 'text-red-600' :
                'text-blue-600'
              }`} />
              <AlertDescription className={`text-sm ${
                message.type === 'success' ? 'text-green-800' :
                message.type === 'error' ? 'text-red-800' :
                'text-blue-800'
              }`}>
                {message.text}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className={`relative overflow-hidden group ${
            config.isConnected 
              ? 'bg-green-600 hover:bg-green-700' 
              : 'bg-gray-900 hover:bg-gray-800'
          } text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3`}
        >
          <div className="flex items-center gap-3">
            <Github className="h-5 w-5" />
            <span className="font-medium">
              {config.isConnected ? `✅ ${config.owner}/${config.repo}` : 'GitHub'}
            </span>
            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`} />
          </div>
          
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        </Button>
      </motion.div>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full right-0 mt-2 w-[420px] bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Github className="h-6 w-6" />
                  <div>
                    <h3 className="font-semibold">GitHub Integration</h3>
                    <p className="text-xs text-gray-300">
                      Connect your project to GitHub for 2-way sync and collaboration.
                    </p>
                  </div>
                </div>
                {config.isConnected && (
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-400" />
                    <span className="text-xs text-green-400">Secure</span>
                  </div>
                )}
              </div>
            </div>

            {/* Connection Section */}
            <div className="p-4 border-b">
              {config.isConnected ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">✅ Connected to</span>
                    <Badge variant="outline" className="text-xs">
                      {config.owner}/{config.repo}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Branch</span>
                    <Badge variant="outline" className="text-xs">
                      {config.branch}
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="owner" className="text-sm">Repository Owner</Label>
                    <Input
                      id="owner"
                      value={config.owner}
                      onChange={(e) => setConfig({ ...config, owner: e.target.value })}
                      placeholder="username"
                      className="text-sm mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="repo" className="text-sm">Repository Name</Label>
                    <Input
                      id="repo"
                      value={config.repo}
                      onChange={(e) => setConfig({ ...config, repo: e.target.value })}
                      placeholder="repository-name"
                      className="text-sm mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="token" className="text-sm">Access Token</Label>
                    <Input
                      id="token"
                      type="password"
                      value={config.token}
                      onChange={(e) => setConfig({ ...config, token: e.target.value })}
                      placeholder="ghp_xxxxxxxxxxxx"
                      className="text-sm mt-1"
                    />
                  </div>
                  <Button
                    onClick={connectToGitHub}
                    disabled={isLoading || !config.owner || !config.repo || !config.token}
                    className="w-full"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Github className="h-4 w-4 mr-2" />
                    )}
                    Connect to GitHub
                  </Button>
                </div>
              )}
            </div>

            {/* Backup Management Sections */}
            {config.isConnected && (
              <div className="p-4 space-y-4">
                {/* Quick Backup Section */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      Quick Backup
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-xs text-gray-600">
                      Create an instant backup and push to GitHub
                    </p>
                    <Button
                      onClick={quickBackup}
                      disabled={isBackingUp}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      {isBackingUp ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4 mr-2" />
                      )}
                      {isBackingUp ? 'Creating Backup...' : 'Quick Backup'}
                    </Button>
                    {backupStatus.lastBackupTime && (
                      <p className="text-xs text-gray-500">
                        Last backup: {new Date(backupStatus.lastBackupTime).toLocaleTimeString()}
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Auto Backup Section */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Auto Backup
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm">Auto Backup</Label>
                        <p className="text-xs text-gray-500">
                          {backupStatus.isAutoBackupEnabled ? 'Auto Backup Active' : 'Paused'}
                        </p>
                      </div>
                      <Switch
                        checked={backupStatus.isAutoBackupEnabled}
                        onCheckedChange={toggleAutoBackup}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm">Dongle Mode</Label>
                        <p className="text-xs text-gray-500">
                          {backupStatus.isDongleModeEnabled 
                            ? backupStatus.dongleConnected 
                              ? 'Dongle connected' 
                              : 'Dongle not detected'
                            : 'Disabled'
                          }
                        </p>
                      </div>
                      <Switch
                        checked={backupStatus.isDongleModeEnabled}
                        onCheckedChange={toggleDongleMode}
                      />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      {backupStatus.autoBackupStatus === 'active' ? (
                        <>
                          <Play className="h-3 w-3 text-green-500" />
                          <span className="text-green-600">Watching for changes (2 min interval)</span>
                        </>
                      ) : (
                        <>
                          <Pause className="h-3 w-3 text-gray-400" />
                          <span>Auto backup paused</span>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Restore Section */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <RefreshCw className="h-4 w-4" />
                      Restore / Dongle
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      onClick={restoreLatest}
                      disabled={isRestoring}
                      variant="outline"
                      className="w-full"
                    >
                      {isRestoring ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4 mr-2" />
                      )}
                      {isRestoring ? 'Restoring...' : 'Restore Latest'}
                    </Button>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Usb className="h-3 w-3" />
                      <span>Dongle protection: {backupStatus.isDongleModeEnabled ? 'Enabled' : 'Disabled'}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={viewOnGitHub}
                    className="text-xs"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    View on GitHub
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={openInGitHubDev}
                    className="text-xs"
                  >
                    <Code className="h-3 w-3 mr-1" />
                    Open in Editor
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}