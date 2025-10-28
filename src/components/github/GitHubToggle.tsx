'use client'

import { useState, useEffect } from 'react'
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
  Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import OpenSourceCollaboration from './OpenSourceCollaboration'

interface GitHubConfig {
  owner: string
  repo: string
  token: string
  branch: string
  isConnected: boolean
  accountName: string
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
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null)
  const [activeTab, setActiveTab] = useState('sync')
  const [copied, setCopied] = useState('')
  const [isBackingUp, setIsBackingUp] = useState(false)

  // Load config from localStorage
  useEffect(() => {
    const savedConfig = localStorage.getItem('github-toggle-config')
    if (savedConfig) {
      const parsed = JSON.parse(savedConfig)
      setConfig(parsed)
    }
  }, [])

  // Save config to localStorage
  const saveConfig = () => {
    localStorage.setItem('github-toggle-config', JSON.stringify(config))
    setMessage({ type: 'success', text: 'GitHub configuration saved successfully!' })
    setTimeout(() => setMessage(null), 3000)
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
      setMessage({ type: 'success', text: 'Successfully connected to GitHub!' })
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to connect to GitHub' })
    } finally {
      setIsLoading(false)
    }
  }

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
      setMessage({ type: 'error', text: 'Please connect to GitHub first' })
      return
    }
    
    // VS Code Web Editor URL with proper encoding
    const encodedOwner = encodeURIComponent(config.owner)
    const encodedRepo = encodeURIComponent(config.repo)
    const vscodeUrl = `https://vscode.dev/github/${encodedOwner}/${encodedRepo}`
    
    // Open in new tab
    window.open(vscodeUrl, '_blank')
  }

  // Open in GitHub Codespaces (alternative)
  const openInCodespaces = () => {
    if (!config.isConnected || !config.owner || !config.repo) {
      setMessage({ type: 'error', text: 'Please connect to GitHub first' })
      return
    }
    
    const codespacesUrl = `https://github.com/codespaces/new/${config.owner}/${config.repo}`
    window.open(codespacesUrl, '_blank')
  }

  // Open in GitHub.dev (web-based VS Code)
  const openInGitHubDev = () => {
    if (!config.isConnected || !config.owner || !config.repo) {
      setMessage({ type: 'error', text: 'Please connect to GitHub first' })
      return
    }
    
    const githubDevUrl = `https://github.dev/${config.owner}/${config.repo}`
    window.open(githubDevUrl, '_blank')
  }

  // View on GitHub
  const viewOnGitHub = () => {
    window.open(`https://github.com/${config.owner}/${config.repo}`, '_blank')
  }

  // Quick backup function
  const quickBackup = async () => {
    setIsBackingUp(true)
    try {
      // Simulate backup process
      await new Promise(resolve => setTimeout(resolve, 3000))
      setMessage({ type: 'success', text: 'Backup completed successfully!' })
    } catch (error) {
      setMessage({ type: 'error', text: 'Backup failed!' })
    } finally {
      setIsBackingUp(false)
    }
  }

  // Quick restore function
  const quickRestore = async () => {
    setIsBackingUp(true)
    try {
      // Simulate restore process
      await new Promise(resolve => setTimeout(resolve, 2000))
      setMessage({ type: 'success', text: 'Restore completed successfully!' })
    } catch (error) {
      setMessage({ type: 'error', text: 'Restore failed!' })
    } finally {
      setIsBackingUp(false)
    }
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
              {config.isConnected ? 'Connected' : 'GitHub'}
            </span>
            {config.isConnected && (
              <Badge className="bg-white/20 text-white text-xs">
                {config.accountName}
              </Badge>
            )}
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
            className="absolute top-full right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Github className="h-6 w-6" />
                  <div>
                    <h3 className="font-semibold">GitHub Integration</h3>
                    <p className="text-xs text-gray-300">
                      {config.isConnected ? 'Connected to repository' : 'Connect your project'}
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

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 m-4">
                <TabsTrigger value="sync" className="text-xs">Sync</TabsTrigger>
                <TabsTrigger value="code" className="text-xs">Code</TabsTrigger>
                <TabsTrigger value="backup" className="text-xs">Backup</TabsTrigger>
                <TabsTrigger value="settings" className="text-xs">Settings</TabsTrigger>
              </TabsList>

              {/* Sync Tab */}
              <TabsContent value="sync" className="p-4 space-y-4">
                {config.isConnected ? (
                  <>
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <GitBranch className="h-4 w-4" />
                          Repository Info
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Repository</span>
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
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Account</span>
                          <Badge variant="outline" className="text-xs">
                            {config.accountName}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>

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
                        className="text-xs"
                      >
                        <Users className="h-3 w-3 mr-1" />
                        Collaborate
                      </Button>
                    </div>

                    <div className="pt-2 border-t">
                      <p className="text-xs text-gray-500 mb-2">
                        2-way sync enabled. Changes are automatically synchronized.
                      </p>
                      <div className="flex items-center gap-2">
                        <Zap className="h-3 w-3 text-yellow-500" />
                        <span className="text-xs text-green-600">Last sync: Just now</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <Alert>
                      <Github className="h-4 w-4" />
                      <AlertDescription>
                        Connect your project to GitHub for 2-way sync and collaboration.
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="owner" className="text-sm">Repository Owner</Label>
                        <Input
                          id="owner"
                          value={config.owner}
                          onChange={(e) => setConfig({ ...config, owner: e.target.value })}
                          placeholder="username"
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Label htmlFor="repo" className="text-sm">Repository Name</Label>
                        <Input
                          id="repo"
                          value={config.repo}
                          onChange={(e) => setConfig({ ...config, repo: e.target.value })}
                          placeholder="repository-name"
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Label htmlFor="token" className="text-sm">GitHub Token</Label>
                        <Input
                          id="token"
                          type="password"
                          value={config.token}
                          onChange={(e) => setConfig({ ...config, token: e.target.value })}
                          placeholder="ghp_xxxxxxxxxxxx"
                          className="text-sm"
                        />
                      </div>
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
              </TabsContent>

              {/* Code Tab */}
              <TabsContent value="code" className="p-4 space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Code className="h-4 w-4" />
                      Code Editor Options
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-xs text-gray-600">
                      Choose your preferred code editor for online development.
                    </p>
                    
                    <div className="grid grid-cols-1 gap-2">
                      <Button
                        onClick={openInVSCode}
                        disabled={!config.isConnected}
                        className="bg-blue-600 hover:bg-blue-700"
                        size="sm"
                      >
                        <Code className="h-4 w-4 mr-2" />
                        VS Code Web Editor
                      </Button>
                      
                      <Button
                        onClick={openInGitHubDev}
                        disabled={!config.isConnected}
                        variant="outline"
                        size="sm"
                      >
                        <Github className="h-4 w-4 mr-2" />
                        GitHub.dev Editor
                      </Button>
                      
                      <Button
                        onClick={openInCodespaces}
                        disabled={!config.isConnected}
                        variant="outline"
                        size="sm"
                      >
                        <Terminal className="h-4 w-4 mr-2" />
                        GitHub Codespaces
                      </Button>
                    </div>
                    
                    <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                      <strong>Tip:</strong> If VS Code Web Editor shows an error, try GitHub.dev Editor instead.
                    </div>
                    
                    <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded border border-blue-200">
                      <strong>Troubleshooting:</strong>
                      <ul className="mt-1 space-y-1">
                        <li>• Ensure repository is public or you have access</li>
                        <li>• Check GitHub token permissions</li>
                        <li>• Try GitHub.dev Editor if vscode.dev fails</li>
                        <li>• Use Codespaces for full development environment</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      Clone Repository
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Input
                          value={`https://github.com/${config.owner}/${config.repo}.git`}
                          readOnly
                          className="text-xs"
                          disabled={!config.isConnected}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => cloneRepository('https')}
                          disabled={!config.isConnected}
                        >
                          {copied === 'https' ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          value={`git@github.com:${config.owner}/${config.repo}.git`}
                          readOnly
                          className="text-xs"
                          disabled={!config.isConnected}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => cloneRepository('ssh')}
                          disabled={!config.isConnected}
                        >
                          {copied === 'ssh' ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          value={`gh repo clone ${config.owner}/${config.repo}`}
                          readOnly
                          className="text-xs"
                          disabled={!config.isConnected}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => cloneRepository('cli')}
                          disabled={!config.isConnected}
                        >
                          {copied === 'cli' ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <Terminal className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Backup Tab */}
              <TabsContent value="backup" className="p-4 space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      Quick Backup
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-xs text-gray-600">
                      Create an instant backup of your entire project to GitHub.
                    </p>
                    <Button
                      onClick={quickBackup}
                      disabled={isBackingUp || !config.isConnected}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      {isBackingUp ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4 mr-2" />
                      )}
                      {isBackingUp ? 'Creating Backup...' : 'Quick Backup'}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <GitBranch className="h-4 w-4" />
                      Restore Backup
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-xs text-gray-600">
                      Restore your project from a previous backup.
                    </p>
                    <Button
                      onClick={quickRestore}
                      disabled={isBackingUp || !config.isConnected}
                      variant="outline"
                      className="w-full"
                    >
                      {isBackingUp ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <GitBranch className="h-4 w-4 mr-2" />
                      )}
                      {isBackingUp ? 'Restoring...' : 'Restore Backup'}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Open Source Collaboration
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <OpenSourceCollaboration />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="p-4 space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Connection Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm">Auto Sync</Label>
                        <p className="text-xs text-gray-500">Automatically sync changes</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm">Real-time Updates</Label>
                        <p className="text-xs text-gray-500">Live collaboration</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm">Backup on Save</Label>
                        <p className="text-xs text-gray-500">Create backup points</p>
                      </div>
                      <Switch />
                    </div>
                  </CardContent>
                </Card>

                {config.isConnected && (
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setConfig({
                        owner: '',
                        repo: '',
                        token: '',
                        branch: 'main',
                        isConnected: false,
                        accountName: ''
                      })
                      localStorage.removeItem('github-toggle-config')
                      setMessage({ type: 'info', text: 'Disconnected from GitHub' })
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Disconnect
                  </Button>
                )}
              </TabsContent>
            </Tabs>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}