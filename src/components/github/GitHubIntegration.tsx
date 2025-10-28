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
  Shield
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
  const [isValidatingConfig, setIsValidatingConfig] = useState(false)

  // Load config from localStorage
  useEffect(() => {
    const savedConfig = localStorage.getItem('github-config')
    if (savedConfig) {
      const parsed = JSON.parse(savedConfig)
      setConfig(parsed)
      setIsConfigured(true)
    }
  }, [])

  // Reset configuration
  const resetConfig = () => {
    // Ask for confirmation
    if (window.confirm('⚠️ क्या आप वाकई सभी GitHub कॉन्फिगरेशन को रीसेट करना चाहते हैं?')) {
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
      localStorage.removeItem('github-config')
      setMessage({ type: 'info', text: '🔄 सभी कॉन्फिगरेशन रीसेट हो गई हैं' })
      setTimeout(() => setMessage(null), 3000)
    }
  }

  // Validate configuration
  const validateConfig = async () => {
    if (!config.owner || !config.repo || !config.token) {
      setMessage({ type: 'error', text: '⚠️ सभी फ़ील्ड भरें: Owner, Repo, और Token' })
      return
    }

    setIsValidatingConfig(true)
    try {
      // Test repository access
      const repoResponse = await fetch(`https://api.github.com/repos/${config.owner}/${config.repo}`, {
        headers: {
          'Authorization': `token ${config.token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      })

      if (repoResponse.ok) {
        const repoData = await repoResponse.json()
        setMessage({ 
          type: 'success', 
          text: `✅ वैलिडेशन सफल! "${repoData.full_name}" रिपॉजिटरी मिल गई` 
        })
        // Auto-save config after successful validation
        localStorage.setItem('github-config', JSON.stringify(config))
        setIsConfigured(true)
      } else {
        const errorData = await repoResponse.json()
        setMessage({ 
          type: 'error', 
          text: `❌ वैलिडेशन फेल: ${errorData.message || 'रिपॉजिटरी एक्सेस नहीं है'}` 
        })
      }
    } catch (error) {
      setMessage({ type: 'error', text: '🌐 नेटवर्क एरर - इंटरनेट कनेक्शन चेक करें' })
    } finally {
      setIsValidatingConfig(false)
    }
  }

  // Save config to localStorage
  const saveConfig = () => {
    if (!config.owner || !config.repo || !config.token) {
      setMessage({ type: 'error', text: '⚠️ कृपया सभी फ़ील्ड भरें: Owner, Repo, और Token' })
      return
    }
    
    localStorage.setItem('github-config', JSON.stringify(config))
    setIsConfigured(true)
    setShowSettings(false)
    setMessage({ type: 'success', text: '💾 कॉन्फिगरेशन सफलतापूर्वक सेव हो गया!' })
    setTimeout(() => setMessage(null), 3000)
  }

  // Test GitHub connection
  const testConnection = async () => {
    if (!config.token) {
      setMessage({ type: 'error', text: '⚠️ कृपया GitHub टोकन डालें' })
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
        setMessage({ type: 'success', text: `🔗 GitHub से कनेक्टेड! ${data.repositories.length} रिपॉजिटरी मिलीं` })
      } else {
        setMessage({ type: 'error', text: data.error || '❌ GitHub से कनेक्ट नहीं हो सका' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: '❌ कनेक्शन टेस्ट फेल' })
    } finally {
      setIsTestingConnection(false)
    }
  }

  // Create backup
  const createBackup = async () => {
    if (!isConfigured) {
      setMessage({ type: 'error', text: '⚠️ पहले GitHub सेटिंग्स कॉन्फिगर करें' })
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
          text: `✅ बैकअप पूर्ण! ${data.filesCount} फाइलें GitHub पर अपलोड हुईं` 
        })
        // Refresh history
        if (showHistory) {
          loadBackupHistory()
        }
      } else {
        setMessage({ type: 'error', text: data.error || '❌ बैकअप फेल हो गया' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: '❌ बैकअप बनाने में त्रुटि' })
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

        <DialogContent className="max-w-2xl w-[90vw] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Github className="h-6 w-6" />
              GitHub बैकअप और रिस्टोर
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Status and Settings */}
            <div className="space-y-6">
              {/* Status Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">कनेक्शन स्थिति</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isConfigured ? (
                        <>
                          <Check className="h-5 w-5 text-green-500" />
                          <span className="text-green-700 font-medium">GitHub से कनेक्टेड</span>
                          <Badge variant="outline" className="text-xs">
                            {config.owner}/{config.repo}
                          </Badge>
                        </>
                      ) : (
                        <>
                          <X className="h-5 w-5 text-red-500" />
                          <span className="text-red-700 font-medium">कॉन्फिगर नहीं है</span>
                        </>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowSettings(!showSettings)}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      {showSettings ? 'सेटिंग्स छुपाएं' : 'सेटिंग्स दिखाएं'}
                    </Button>
                  </div>
                  
                  {/* Validation Status */}
                  {config.owner && config.repo && config.token && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-blue-600" />
                          <span className="text-sm text-blue-700 font-medium">कॉन्फिगरेशन तैयार</span>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={validateConfig}
                          disabled={isValidatingConfig}
                          className="h-7 px-2 text-xs bg-blue-100 hover:bg-blue-200 border-blue-300"
                        >
                          {isValidatingConfig ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            'वैलिडेट करें'
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-blue-600 mt-1">
                        वैलिडेट करें बटन दबाकर GitHub एक्सेस की पुष्टि करें
                      </p>
                    </div>
                  )}

                  {/* Quick Actions */}
                  {isConfigured && (
                    <div className="mt-3 flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => window.open(`https://github.com/${config.owner}/${config.repo}`, '_blank')}
                        className="flex-1 h-8 text-xs"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        रिपॉजिटरी
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={createBackup}
                        disabled={isLoading}
                        className="flex-1 h-8 text-xs bg-green-50 hover:bg-green-100 border-green-200"
                      >
                        {isLoading ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Upload className="h-3 w-3 mr-1" />
                        )}
                        क्विक बैकअप
                      </Button>
                    </div>
                  )}
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
                      <CardTitle className="text-lg">GitHub कॉन्फिगरेशन</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="owner">रिपॉजिटरी मालिक</Label>
                          <Input
                            id="owner"
                            value={config.owner}
                            onChange={(e) => setConfig({ ...config, owner: e.target.value })}
                            placeholder="यूज़रनेम"
                          />
                        </div>
                        <div>
                          <Label htmlFor="repo">रिपॉजिटरी नाम</Label>
                          <Input
                            id="repo"
                            value={config.repo}
                            onChange={(e) => setConfig({ ...config, repo: e.target.value })}
                            placeholder="रिपॉजिटरी-नाम"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="token">GitHub पर्सनल एक्सेस टोकन</Label>
                        <Input
                          id="token"
                          type="password"
                          value={config.token}
                          onChange={(e) => setConfig({ ...config, token: e.target.value })}
                          placeholder="ghp_xxxxxxxxxxxx"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          टोकन को 'repo' परमिशन की जरूरत है रिपॉजिटरी एक्सेस और मॉडिफिकेशन के लिए
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="branch">ब्रांच</Label>
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

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <Button onClick={validateConfig} variant="outline" disabled={isValidatingConfig} className="bg-blue-50 hover:bg-blue-100 border-blue-200">
                          {isValidatingConfig ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin text-blue-600" />
                          ) : (
                            <Shield className="h-4 w-4 mr-2 text-blue-600" />
                          )}
                          <span className="text-blue-700">वैलिडेट करें</span>
                        </Button>
                        <Button onClick={saveConfig} className="flex-1 bg-green-600 hover:bg-green-700">
                          <Check className="h-4 w-4 mr-2" />
                          सेव करें
                        </Button>
                        <Button 
                          variant="destructive" 
                          onClick={resetConfig}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          <RotateCcw className="h-4 w-4 mr-2" />
                          रीसेट करें
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Button 
                          variant="outline" 
                          onClick={testConnection}
                          disabled={isTestingConnection}
                          className="border-purple-200 hover:bg-purple-50"
                        >
                          {isTestingConnection ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin text-purple-600" />
                          ) : (
                            <RefreshCw className="h-4 w-4 mr-2 text-purple-600" />
                          )}
                          <span className="text-purple-700">कनेक्शन टेस्ट</span>
                        </Button>

                        <Button
                          variant="outline"
                          onClick={() => setShowSetupGuide(true)}
                          className="w-full border-gray-300 hover:bg-gray-50"
                        >
                          <Github className="h-4 w-4 mr-2 text-gray-600" />
                          <span className="text-gray-700">सेटअप गाइड</span>
                        </Button>
                      </div>

                      {repos.length > 0 && (
                        <div>
                          <Label>आपकी रिपॉजिटरीज़</Label>
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
            </div>

            {/* Right Column - Actions and History */}
            <div className="space-y-6">
              {/* Action Buttons */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">क्रियाएं</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <Button
                      onClick={createBackup}
                      disabled={!isConfigured || isLoading}
                      className="bg-green-600 hover:bg-green-700 w-full"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4 mr-2" />
                      )}
                      बैकअप बनाएं
                    </Button>

                    <div className="grid grid-cols-2 gap-4">
                      <Button
                        variant="outline"
                        onClick={() => setShowHistory(!showHistory)}
                        disabled={!isConfigured}
                        className="w-full"
                      >
                        <History className="h-4 w-4 mr-2" />
                        {showHistory ? 'इतिहास छुपाएं' : 'इतिहास देखें'}
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => window.open(`https://github.com/${config.owner}/${config.repo}`, '_blank')}
                        disabled={!isConfigured}
                        className="w-full"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        रिपॉजिटरी देखें
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

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
                        बैकअप इतिहास
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {backupHistory.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">कोई बैकअप इतिहास नहीं मिला</p>
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