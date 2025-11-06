'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Github, 
  Upload, 
  Download, 
  Settings, 
  History, 
  Check, 
  X, 
  AlertCircle, 
  Loader2,
  RefreshCw,
  Clock,
  FileText,
  ExternalLink,
  RotateCcw,
  Shield,
  Zap,
  Database,
  Activity
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'

interface GitHubConfig {
  owner: string
  repo: string
  token: string
  branch: string
}

interface BackupHistory {
  sha: string
  message: string
  author: string
  date: string
  url: string
  timestamp: string
}

interface GitHubRepo {
  id: number
  name: string
  fullName: string
  private: boolean
  url: string
  description: string
  createdAt: string
  updatedAt: string
}

interface GitHubIntegrationProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export default function GitHubIntegration({ isOpen, onOpenChange }: GitHubIntegrationProps) {
  const [config, setConfig] = useState<GitHubConfig>({
    owner: '',
    repo: '',
    token: '',
    branch: 'main'
  })
  const [isConfigured, setIsConfigured] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [backupHistory, setBackupHistory] = useState<BackupHistory[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [repos, setRepos] = useState<GitHubRepo[]>([])
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [isValidatingConfig, setIsValidatingConfig] = useState(false)
  const [autoBackup, setAutoBackup] = useState(false)
  const [lastBackupTime, setLastBackupTime] = useState<string | null>(null)
  const [isRestoring, setIsRestoring] = useState(false)

  // Load config from localStorage
  useEffect(() => {
    const savedConfig = localStorage.getItem('github-config')
    if (savedConfig) {
      const parsed = JSON.parse(savedConfig)
      setConfig(parsed)
      setIsConfigured(true)
    }
    
    const savedAutoBackup = localStorage.getItem('github-auto-backup')
    if (savedAutoBackup) {
      setAutoBackup(JSON.parse(savedAutoBackup))
    }
    
    const savedLastBackup = localStorage.getItem('github-last-backup')
    if (savedLastBackup) {
      setLastBackupTime(savedLastBackup)
    }
  }, [])

  // Auto backup interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (autoBackup && isConfigured) {
      interval = setInterval(() => {
        createBackup(true) // silent backup
      }, 5 * 60 * 1000) // Every 5 minutes
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [autoBackup, isConfigured])

  // Reset configuration
  const resetConfig = () => {
    if (window.confirm('⚠️ Are you sure you want to reset all GitHub configuration?')) {
      setConfig({
        owner: '',
        repo: '',
        token: '',
        branch: 'main'
      })
      setIsConfigured(false)
      setShowSettings(false)
      setRepos([])
      setBackupHistory([])
      setShowHistory(false)
      setAutoBackup(false)
      setLastBackupTime(null)
      localStorage.removeItem('github-config')
      localStorage.removeItem('github-auto-backup')
      localStorage.removeItem('github-last-backup')
      setMessage({ type: 'info', text: '🔄 All configuration has been reset' })
      setTimeout(() => setMessage(null), 3000)
    }
  }

  // Validate configuration
  const validateConfig = async () => {
    if (!config.owner || !config.repo || !config.token) {
      setMessage({ type: 'error', text: '⚠️ Please fill all fields: Owner, Repo, and Token' })
      return
    }

    setIsValidatingConfig(true)
    try {
      // Determine token type and use appropriate auth method
      const isClassicToken = config.token.startsWith('ghp_')
      const isFineGrainedToken = config.token.startsWith('github_pat_')
      
      if (!isClassicToken && !isFineGrainedToken) {
        setMessage({ 
          type: 'error', 
          text: '❌ Invalid token format. Token should start with "ghp_" (classic) or "github_pat_" (fine-grained)' 
        })
        return
      }

      const repoResponse = await fetch(`https://api.github.com/repos/${config.owner}/${config.repo}`, {
        headers: {
          'Authorization': `${isClassicToken ? 'token' : 'Bearer'} ${config.token}`,
          'Accept': 'application/vnd.github.v3+json',
          'X-GitHub-Api-Version': '2022-11-28'
        }
      })

      if (repoResponse.ok) {
        const repoData = await repoResponse.json()
        setMessage({ 
          type: 'success', 
          text: `✅ Validation successful! Found "${repoData.full_name}" repository` 
        })
        localStorage.setItem('github-config', JSON.stringify(config))
        setIsConfigured(true)
      } else {
        const errorData = await repoResponse.json().catch(() => ({}))
        let errorMessage = errorData.message || 'Repository access denied'
        
        // Provide more specific error messages
        if (repoResponse.status === 401) {
          errorMessage = '❌ Invalid or expired token. Please check your GitHub personal access token'
        } else if (repoResponse.status === 403) {
          errorMessage = '❌ Token lacks required permissions. Please ensure the token has "repo" scope'
        } else if (repoResponse.status === 404) {
          errorMessage = `❌ Repository "${config.owner}/${config.repo}" not found or you don\'t have access`
        }
        
        setMessage({ 
          type: 'error', 
          text: `❌ Validation failed: ${errorMessage}` 
        })
      }
    } catch (error) {
      console.error('GitHub validation error:', error)
      setMessage({ type: 'error', text: '🌐 Network error - please check your internet connection' })
    } finally {
      setIsValidatingConfig(false)
    }
  }

  // Save config to localStorage
  const saveConfig = () => {
    if (!config.owner || !config.repo || !config.token) {
      setMessage({ type: 'error', text: '⚠️ Please fill all fields: Owner, Repo, and Token' })
      return
    }
    
    localStorage.setItem('github-config', JSON.stringify(config))
    setIsConfigured(true)
    setShowSettings(false)
    setMessage({ type: 'success', text: '💾 Configuration saved successfully!' })
    setTimeout(() => setMessage(null), 3000)
  }

  // Create backup
  const createBackup = async (silent = false) => {
    if (!isConfigured) {
      if (!silent) setMessage({ type: 'error', text: '⚠️ Please configure GitHub settings first' })
      return
    }

    if (!silent) setIsLoading(true)
    try {
      const response = await fetch('/api/github/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'backup', 
          config,
          message: `🚀 Auto Backup: ${new Date().toISOString().slice(0, 19).replace(/[:-]/g, '')}`
        })
      })

      const data = await response.json()
      
      if (data.success) {
        const now = new Date().toISOString()
        setLastBackupTime(now)
        localStorage.setItem('github-last-backup', now)
        
        if (!silent) {
          setMessage({ 
            type: 'success', 
            text: `✅ Backup complete! ${data.filesCount || 0} files uploaded to GitHub` 
          })
        }
        if (showHistory) {
          loadBackupHistory()
        }
      } else {
        if (!silent) setMessage({ type: 'error', text: data.error || '❌ Backup failed' })
      }
    } catch (error) {
      if (!silent) setMessage({ type: 'error', text: '❌ Error creating backup' })
    } finally {
      if (!silent) setIsLoading(false)
    }
  }

  // Restore from backup
  const restoreFromBackup = async () => {
    if (!isConfigured) {
      setMessage({ type: 'error', text: '⚠️ Please configure GitHub settings first' })
      return
    }

    if (!window.confirm('⚠️ This will restore your project from the latest GitHub backup. Any unsaved changes will be lost. Continue?')) {
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
        setMessage({ 
          type: 'success', 
          text: '🔄 Project restored successfully! Reloading page...' 
        })
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        setMessage({ type: 'error', text: data.error || '❌ Restore failed' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: '❌ Error restoring from backup' })
    } finally {
      setIsRestoring(false)
    }
  }

  // Load backup history
  const loadBackupHistory = async () => {
    if (!isConfigured) return

    try {
      const response = await fetch('/api/github/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner: config.owner,
          repo: config.repo,
          token: config.token,
          branch: config.branch
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setBackupHistory(data.commits)
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to load history' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load backup history' })
    }
  }

  // Toggle auto backup
  const toggleAutoBackup = (enabled: boolean) => {
    setAutoBackup(enabled)
    localStorage.setItem('github-auto-backup', JSON.stringify(enabled))
    
    if (enabled) {
      setMessage({ type: 'success', text: '🟢 Auto backup enabled - every 5 minutes' })
      // Create initial backup
      createBackup(true)
    } else {
      setMessage({ type: 'info', text: '🔴 Auto backup disabled' })
    }
    setTimeout(() => setMessage(null), 3000)
  }

  // Format last backup time
  const formatLastBackupTime = () => {
    if (!lastBackupTime) return 'Never'
    
    try {
      const date = new Date(lastBackupTime)
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffMins = Math.floor(diffMs / 60000)
      
      if (diffMins < 1) return 'Just now'
      if (diffMins < 60) return `${diffMins} min ago`
      
      const diffHours = Math.floor(diffMins / 60)
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
      
      return date.toLocaleDateString()
    } catch {
      return 'Unknown'
    }
  }

  useEffect(() => {
    if (showHistory && isConfigured) {
      loadBackupHistory()
    }
  }, [showHistory, isConfigured])

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="flex items-center gap-3 text-xl font-bold text-gray-900">
            <Github className="h-6 w-6 text-gray-700" />
            GitHub Integration
            <Badge className="ml-auto" variant={isConfigured ? "default" : "secondary"}>
              {isConfigured ? 'Connected' : 'Not Connected'}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Left Column - Status & Quick Actions */}
          <div className="space-y-4">
            {/* Connection Status */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  Connection Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isConfigured ? (
                      <>
                        <Check className="h-5 w-5 text-green-500" />
                        <span className="text-green-700 font-medium">Connected</span>
                      </>
                    ) : (
                      <>
                        <X className="h-5 w-5 text-red-500" />
                        <span className="text-red-700 font-medium">Not Configured</span>
                      </>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSettings(!showSettings)}
                    className="shrink-0"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    {showSettings ? 'Hide' : 'Settings'}
                  </Button>
                </div>

                {isConfigured && (
                  <div className="text-sm">
                    <Badge variant="outline" className="text-xs">
                      {config.owner}/{config.repo}
                    </Badge>
                  </div>
                )}

                {/* Auto Backup Toggle */}
                {isConfigured && (
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-blue-900">Auto Backup</p>
                        <p className="text-xs text-blue-600">Every 5 minutes</p>
                      </div>
                    </div>
                    <Switch
                      checked={autoBackup}
                      onCheckedChange={toggleAutoBackup}
                      className="shrink-0"
                    />
                  </div>
                )}

                {/* Last Backup Info */}
                {isConfigured && (
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-green-900">Last Backup</p>
                        <p className="text-xs text-green-600">{formatLastBackupTime()}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            {isConfigured && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Zap className="h-5 w-5 text-purple-600" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={() => createBackup(false)}
                    disabled={isLoading}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    Create Backup
                  </Button>

                  <Button
                    onClick={restoreFromBackup}
                    disabled={isRestoring}
                    variant="outline"
                    className="w-full"
                  >
                    {isRestoring ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    Restore Project
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => window.open(`https://github.com/${config.owner}/${config.repo}`, '_blank')}
                    className="w-full"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Repository
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Settings & History */}
          <div className="space-y-4">
            {/* Settings Panel */}
            {showSettings && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <Settings className="h-5 w-5 text-slate-600" />
                      GitHub Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="owner">Repository Owner</Label>
                        <Input
                          id="owner"
                          value={config.owner}
                          onChange={(e) => setConfig({ ...config, owner: e.target.value })}
                          placeholder="GitHub username"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="repo">Repository Name</Label>
                        <Input
                          id="repo"
                          value={config.repo}
                          onChange={(e) => setConfig({ ...config, repo: e.target.value })}
                          placeholder="repository-name"
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="token">GitHub Personal Access Token</Label>
                      <Input
                        id="token"
                        type="password"
                        value={config.token}
                        onChange={(e) => setConfig({ ...config, token: e.target.value })}
                        placeholder="ghp_xxxxxxxxxxxx or github_pat_xxxxxxxxxxxx"
                        className="mt-1"
                      />
                      <div className="mt-2 text-xs text-gray-500">
                        <p className="font-medium mb-1">📝 Token Format:</p>
                        <ul className="space-y-1 ml-4">
                          <li>• Classic: <code className="bg-gray-100 px-1 rounded">ghp_</code>xxxxxxxxxxxx</li>
                          <li>• Fine-grained: <code className="bg-gray-100 px-1 rounded">github_pat_</code>xxxxxxxxxxxx</li>
                        </ul>
                        <p className="mt-2 text-blue-600">
                          🔑 Need a token? 
                          <a 
                            href="https://github.com/settings/tokens" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="underline ml-1"
                          >
                            Create one here
                          </a>
                        </p>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="branch">Branch</Label>
                      <Select value={config.branch} onValueChange={(value) => setConfig({ ...config, branch: value })}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="main">main</SelectItem>
                          <SelectItem value="master">master</SelectItem>
                          <SelectItem value="develop">develop</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button
                        onClick={validateConfig}
                        disabled={isValidatingConfig}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        {isValidatingConfig ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Shield className="h-4 w-4 mr-2" />
                        )}
                        Validate
                      </Button>
                      <Button
                        onClick={saveConfig}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                      <Button
                        onClick={resetConfig}
                        variant="outline"
                        className="border-red-200 text-red-600 hover:bg-red-50"
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Reset
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Backup History */}
            {isConfigured && (
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <History className="h-5 w-5 text-indigo-600" />
                      Backup History
                    </CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowHistory(!showHistory)}
                    >
                      {showHistory ? 'Hide' : 'Show'}
                    </Button>
                  </div>
                </CardHeader>
                {showHistory && (
                  <CardContent>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {backupHistory.length > 0 ? (
                        backupHistory.map((commit) => (
                          <div
                            key={commit.sha}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <FileText className="h-4 w-4 text-gray-500" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">{commit.message}</p>
                                <p className="text-xs text-gray-500">
                                  {commit.author} • {new Date(commit.date).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(commit.url, '_blank')}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <Database className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                          <p className="text-sm">No backup history found</p>
                          <p className="text-xs mt-1">Create your first backup to see history here</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            )}
          </div>
        </div>

        {/* Messages */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-6 right-6 z-50"
            >
              <Alert className={`shadow-lg ${
                message.type === 'success' ? 'border-green-500 bg-green-50 text-green-800' :
                message.type === 'error' ? 'border-red-500 bg-red-50 text-red-800' :
                'border-blue-500 bg-blue-50 text-blue-800'
              }`}>
                <AlertCircle className={`h-4 w-4 ${
                  message.type === 'success' ? 'text-green-600' :
                  message.type === 'error' ? 'text-red-600' :
                  'text-blue-600'
                }`} />
                <AlertDescription className="font-medium">
                  {message.text}
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}