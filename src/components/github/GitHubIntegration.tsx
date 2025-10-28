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
  FileText
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import GitHubSetupGuide from './GitHubSetupGuide'

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

export default function GitHubIntegration() {
  const [isOpen, setIsOpen] = useState(false)
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
  const [showSetupGuide, setShowSetupGuide] = useState(false)

  // Load config from localStorage
  useEffect(() => {
    const savedConfig = localStorage.getItem('github-config')
    if (savedConfig) {
      const parsed = JSON.parse(savedConfig)
      setConfig(parsed)
      setIsConfigured(true)
    }
  }, [])

  // Save config to localStorage
  const saveConfig = () => {
    localStorage.setItem('github-config', JSON.stringify(config))
    setIsConfigured(true)
    setShowSettings(false)
    setMessage({ type: 'success', text: 'GitHub configuration saved successfully!' })
    setTimeout(() => setMessage(null), 3000)
  }

  // Test GitHub connection
  const testConnection = async () => {
    if (!config.token) {
      setMessage({ type: 'error', text: 'Please enter a GitHub token' })
      return
    }

    setIsTestingConnection(true)
    try {
      const response = await fetch('/api/github/repos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: config.token })
      })

      const data = await response.json()
      
      if (data.success) {
        setRepos(data.repositories)
        setMessage({ type: 'success', text: `Connected to GitHub! Found ${data.repositories.length} repositories` })
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to connect to GitHub' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to test connection' })
    } finally {
      setIsTestingConnection(false)
    }
  }

  // Create backup
  const createBackup = async () => {
    if (!isConfigured) {
      setMessage({ type: 'error', text: 'Please configure GitHub settings first' })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/github/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'backup', config })
      })

      const data = await response.json()
      
      if (data.success) {
        setMessage({ 
          type: 'success', 
          text: `Backup completed! ${data.filesCount} files uploaded to GitHub` 
        })
        // Refresh history
        if (showHistory) {
          loadBackupHistory()
        }
      } else {
        setMessage({ type: 'error', text: data.error || 'Backup failed' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to create backup' })
    } finally {
      setIsLoading(false)
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

  // Restore from backup
  const restoreFromBackup = async (commitSha: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/github/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'restore', 
          config, 
          commitSha 
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setMessage({ 
          type: 'info', 
          text: 'Restore information retrieved. Please review before proceeding.' 
        })
      } else {
        setMessage({ type: 'error', text: data.error || 'Restore failed' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to restore from backup' })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (showHistory && isConfigured) {
      loadBackupHistory()
    }
  }, [showHistory, isConfigured])

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mb-4"
          >
            <Alert className={`w-80 ${
              message.type === 'success' ? 'border-green-500 bg-green-50' :
              message.type === 'error' ? 'border-red-500 bg-red-50' :
              'border-blue-500 bg-blue-50'
            }`}>
              <AlertCircle className={`h-4 w-4 ${
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

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              size="lg"
              className="bg-gray-900 hover:bg-gray-800 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3"
            >
              <Github className="h-5 w-5 mr-2" />
              GitHub
            </Button>
          </motion.div>
        </DialogTrigger>

        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Github className="h-6 w-6" />
              GitHub Backup & Restore
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Status Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Connection Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isConfigured ? (
                      <>
                        <Check className="h-5 w-5 text-green-500" />
                        <span className="text-green-700 font-medium">Connected to GitHub</span>
                        <Badge variant="outline" className="text-xs">
                          {config.owner}/{config.repo}
                        </Badge>
                      </>
                    ) : (
                      <>
                        <X className="h-5 w-5 text-red-500" />
                        <span className="text-red-700 font-medium">Not configured</span>
                      </>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSettings(!showSettings)}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    {showSettings ? 'Hide' : 'Show'} Settings
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Settings Panel */}
            {showSettings && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">GitHub Configuration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="owner">Repository Owner</Label>
                        <Input
                          id="owner"
                          value={config.owner}
                          onChange={(e) => setConfig({ ...config, owner: e.target.value })}
                          placeholder="username"
                        />
                      </div>
                      <div>
                        <Label htmlFor="repo">Repository Name</Label>
                        <Input
                          id="repo"
                          value={config.repo}
                          onChange={(e) => setConfig({ ...config, repo: e.target.value })}
                          placeholder="repository-name"
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
                        placeholder="ghp_xxxxxxxxxxxx"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Token needs 'repo' permissions to access and modify repositories
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="branch">Branch</Label>
                      <Select value={config.branch} onValueChange={(value) => setConfig({ ...config, branch: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="main">main</SelectItem>
                          <SelectItem value="master">master</SelectItem>
                          <SelectItem value="develop">develop</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={saveConfig} className="flex-1">
                        <Check className="h-4 w-4 mr-2" />
                        Save Configuration
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={testConnection}
                        disabled={isTestingConnection}
                      >
                        {isTestingConnection ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4 mr-2" />
                        )}
                        Test Connection
                      </Button>
                    </div>

                    <Button
                      variant="outline"
                      onClick={() => setShowSetupGuide(true)}
                      className="w-full"
                    >
                      <Github className="h-4 w-4 mr-2" />
                      View Setup Guide
                    </Button>

                    {repos.length > 0 && (
                      <div>
                        <Label>Your Repositories</Label>
                        <div className="mt-2 max-h-32 overflow-y-auto space-y-1">
                          {repos.slice(0, 5).map((repo) => (
                            <div 
                              key={repo.id}
                              className="flex items-center justify-between p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100"
                              onClick={() => setConfig({ 
                                ...config, 
                                owner: repo.fullName.split('/')[0], 
                                repo: repo.fullName.split('/')[1] 
                              })}
                            >
                              <span className="text-sm font-medium">{repo.fullName}</span>
                              <Badge variant={repo.private ? "destructive" : "secondary"} className="text-xs">
                                {repo.private ? 'Private' : 'Public'}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                onClick={createBackup}
                disabled={!isConfigured || isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                Create Backup
              </Button>

              <Button
                variant="outline"
                onClick={() => setShowHistory(!showHistory)}
                disabled={!isConfigured}
              >
                <History className="h-4 w-4 mr-2" />
                {showHistory ? 'Hide' : 'Show'} History
              </Button>

              <Button
                variant="outline"
                onClick={() => window.open(`https://github.com/${config.owner}/${config.repo}`, '_blank')}
                disabled={!isConfigured}
              >
                <Github className="h-4 w-4 mr-2" />
                Open Repository
              </Button>
            </div>

            {/* Backup History */}
            {showHistory && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Backup History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {backupHistory.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">No backup history found</p>
                    ) : (
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {backupHistory.map((backup) => (
                          <div
                            key={backup.sha}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <FileText className="h-4 w-4 text-gray-500" />
                              <div>
                                <p className="font-medium text-sm">{backup.timestamp}</p>
                                <p className="text-xs text-gray-500">
                                  {backup.author} • {new Date(backup.date).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(backup.url, '_blank')}
                              >
                                <Github className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => restoreFromBackup(backup.sha)}
                                disabled={isLoading}
                              >
                                <Download className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </DialogContent>

        {/* Setup Guide Modal */}
        {showSetupGuide && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">GitHub Setup Guide</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSetupGuide(false)}
                  >
                    ×
                  </Button>
                </div>
                <GitHubSetupGuide />
              </div>
            </motion.div>
          </div>
        )}
      </Dialog>
    </div>
  )
}