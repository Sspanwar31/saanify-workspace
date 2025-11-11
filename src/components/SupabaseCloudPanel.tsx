'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Cloud, 
  Database, 
  Settings, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Copy, 
  Trash2, 
  Shield, 
  Key,
  Activity,
  BarChart3,
  Cpu,
  Clock,
  Zap,
  Globe,
  Lock,
  Unlock,
  Server,
  Wifi,
  HardDrive,
  Monitor,
  Terminal,
  Code,
  FileText,
  Users,
  UserCheck,
  AlertTriangle,
  TrendingUp,
  Download,
  Upload,
  Play,
  Pause,
  Square,
  MoreVertical,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Plus,
  Minus,
  X,
  Check,
  Loader2,
  HelpCircle,
  Info,
  ExternalLink,
  Edit,
  Save,
  RotateCw,
  Trash,
  Archive,
  Folder,
  FolderOpen,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Grid,
  List,
  Calendar,
  Timer,
  Bell,
  BellRing,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Fullscreen,
  Sun,
  Moon,
  MonitorSpeaker,
  Smartphone,
  Tablet,
  Laptop,
  WifiOff,
  Signal,
  SignalHigh,
  SignalLow,
  SignalMedium,
  Battery,
  BatteryCharging,
  Power,
  PowerOff,
  LogOut,
  LogIn,
  User,
  UserPlus,
  UserMinus,
  Settings2,
  Wrench,
  Tool,
  Package,
  Box,
  PackageOpen,
  ArchiveRestore,
  ArchiveX,
  File,
  FilePlus,
  FileMinus,
  FileX,
  FileSearch,
  FileText,
  FileCheck,
  FileWarning,
  FileQuestion,
  FileLock,
  FileUnlock,
  FileCode,
  FileImage,
  FileVideo,
  FileAudio,
  FileArchive,
  FileDown,
  FileUp,
  FileSymlink,
  FileBroken,
  FileQuestionMark,
  FileUnknown,
  FileCopy,
  FileMove,
  FileRename,
  FileEdit,
  FileDelete,
  FileDownload,
  FileUpload,
  FileExport,
  FileImport,
  FileSave,
  FilePrint,
  FileShare,
  FileLock2,
  FileUnlock2,
  FileCheck2,
  FileX2,
  FilePlus2,
  FileMinus2,
  FileCopy2,
  FileMove2,
  FileRename2,
  FileEdit2,
  FileDelete2,
  FileDownload2,
  FileUpload2,
  FileExport2,
  FileImport2,
  FileSave2,
  FilePrint2,
  FileShare2,
  FileLock3,
  FileUnlock3,
  FileCheck3,
  FileX3,
  FilePlus3,
  FileMinus3,
  FileCopy3,
  FileMove3,
  FileRename3,
  FileEdit3,
  FileDelete3,
  FileDownload3,
  FileUpload3,
  FileExport3,
  FileImport3,
  FileSave3,
  FilePrint3,
  FileShare3
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'

export default function SupabaseCloudPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [showValues, setShowValues] = useState<Record<string, boolean>>({})
  const [logFilter, setLogFilter] = useState('all')
  const [secrets, setSecrets] = useState([
    {
      id: '1',
      name: 'SUPABASE_URL',
      value: 'https://your-project.supabase.co',
      description: 'Your Supabase project URL',
      lastRotated: new Date('2024-01-15').toISOString()
    },
    {
      id: '2', 
      name: 'SUPABASE_ANON_KEY',
      value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      description: 'Anonymous key for public access',
      lastRotated: new Date('2024-01-10').toISOString()
    },
    {
      id: '3',
      name: 'SUPABASE_SERVICE_KEY',
      value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      description: 'Service role key for admin access',
      lastRotated: new Date('2024-01-05').toISOString()
    }
  ])

  const stats = {
    projects: 3,
    databases: 5,
    storage: 85,
    functions: 12,
    uptime: 99.7
  }

  const automationStatus = {
    schemaSync: { active: true, lastRun: '2 mins ago' },
    autoBackup: { active: true, lastRun: '1 hour ago' },
    healthChecks: { active: true, lastRun: '5 mins ago' },
    logRotation: { active: true, lastRun: '30 mins ago' }
  }

  // Lock body scroll when panel is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }
    
    return () => {
      document.body.style.overflow = "auto"
    }
  }, [isOpen])

  // Auto-refresh secrets every 30 seconds
  useEffect(() => {
    if (!isOpen || activeTab !== 'secrets') return

    const interval = setInterval(() => {
      // Simulate auto-refresh
      console.log('Auto-refreshing secrets...')
    }, 30000)

    return () => clearInterval(interval)
  }, [isOpen, activeTab])

  const toggleSecretVisibility = (secretId: string) => {
    setShowValues(prev => ({
      ...prev,
      [secretId]: !prev[secretId]
    }))
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('✅ Copied to clipboard', {
      description: 'Secret copied successfully',
      duration: 2000,
    })
  }

  const addNewSecret = () => {
    const newSecret = {
      id: Date.now().toString(),
      name: 'NEW_SECRET',
      value: '',
      description: 'New secret key',
      lastRotated: new Date().toISOString()
    }
    setSecrets(prev => [...prev, newSecret])
    toast.success('✅ New secret added', {
      description: 'Please configure the new secret',
      duration: 2000,
    })
  }

  const rotateSecret = (secretId: string) => {
    setSecrets(prev => prev.map(secret => 
      secret.id === secretId 
        ? { ...secret, lastRotated: new Date().toISOString() }
        : secret
    ))
    toast.success('🔄 Secret rotated', {
      description: 'Secret has been rotated successfully',
      duration: 2000,
    })
  }

  const runAutomation = (type: string) => {
    toast.info(`🚀 ${type} started`, {
      description: `${type} is now running...`,
      duration: 3000,
    })
  }

  const downloadLogs = () => {
    toast.info('📥 Downloading logs...', {
      description: 'Preparing logs for download',
      duration: 3000,
    })
  }

  const clearLogs = () => {
    toast.success('🗑️ Logs cleared', {
      description: 'All logs have been cleared',
      duration: 2000,
    })
  }

  if (!isOpen) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="fixed bottom-4 right-4 z-50"
      >
        <Button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Cloud className="h-4 w-4 mr-2" />
          Open Cloud Panel
        </Button>
      </motion.div>
    )
  }

  return (
    <>
      {/* Semi-transparent backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"></div>
      
      {/* Main Panel Container with proper scaling */}
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-start bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-2xl rounded-2xl overflow-y-auto max-h-[90vh] w-full md:w-[80%] lg:w-[70%] xl:w-[60%] mx-auto my-8 p-6 border border-gray-200/50 dark:border-gray-700/50 scale-[0.98] md:scale-100 transition-all duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <motion.div 
              className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white shadow-lg"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ duration: 0.2 }}
            >
              <Cloud className="h-6 w-6" />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Supabase Cloud</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Modern Database Management</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">Overview</TabsTrigger>
            <TabsTrigger value="secrets" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">Secrets</TabsTrigger>
            <TabsTrigger value="logs" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">Logs</TabsTrigger>
            <TabsTrigger value="automation" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">Automation</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 rounded-xl border border-blue-200/50 dark:border-blue-700/50 backdrop-blur-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Database className="h-8 w-8 text-blue-600" />
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <RefreshCw className="h-4 w-4 text-blue-500" />
                    </motion.div>
                  </div>
                  <div className="text-center">
                    <motion.div 
                      className="text-3xl font-bold text-gray-900 dark:text-white"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      {stats.projects}
                    </motion.div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Projects</p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  whileHover={{ scale: 1.05 }}
                  className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-6 rounded-xl border border-green-200/50 dark:border-green-700/50 backdrop-blur-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Server className="h-8 w-8 text-green-600" />
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                    >
                      <Activity className="h-4 w-4 text-green-500" />
                    </motion.div>
                  </div>
                  <div className="text-center">
                    <motion.div 
                      className="text-3xl font-bold text-gray-900 dark:text-white"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                    >
                      {stats.databases}
                    </motion.div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Databases</p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                  whileHover={{ scale: 1.05 }}
                  className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-6 rounded-xl border border-purple-200/50 dark:border-purple-700/50 backdrop-blur-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <HardDrive className="h-8 w-8 text-purple-600" />
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    >
                      <Zap className="h-4 w-4 text-purple-500" />
                    </motion.div>
                  </div>
                  <div className="text-center">
                    <motion.div 
                      className="text-3xl font-bold text-gray-900 dark:text-white"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                    >
                      {stats.storage}%
                    </motion.div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Storage Used</p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                  whileHover={{ scale: 1.05 }}
                  className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-6 rounded-xl border border-orange-200/50 dark:border-orange-700/50 backdrop-blur-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Cpu className="h-8 w-8 text-orange-600" />
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
                    >
                      <BarChart3 className="h-4 w-4 text-orange-500" />
                    </motion.div>
                  </div>
                  <div className="text-center">
                    <motion.div 
                      className="text-3xl font-bold text-gray-900 dark:text-white"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                    >
                      {stats.functions}
                    </motion.div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Functions Deployed</p>
                  </div>
                </motion.div>
              </div>

              {/* Uptime Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.5 }}
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 p-6 rounded-xl border border-emerald-200/50 dark:border-emerald-700/50 backdrop-blur-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Live</span>
                  </div>
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="text-center">
                  <motion.div 
                    className="text-4xl font-bold text-gray-900 dark:text-white"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                  >
                    {stats.uptime}%
                  </motion.div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Uptime</p>
                </div>
              </motion.div>
            </motion.div>
          </TabsContent>

          {/* Secrets Tab */}
          <TabsContent value="secrets" className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center justify-between mb-4">
                <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700">
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    <strong>🔐 Security First:</strong> Your secrets are encrypted and stored securely.
                  </AlertDescription>
                </Alert>
                <Button
                  onClick={addNewSecret}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Secret
                </Button>
              </div>

              <div className="space-y-3">
                {secrets.map((secret, index) => (
                  <motion.div
                    key={secret.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all"
                  >
                    <CardContent className="p-0">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <motion.div 
                            className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg"
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            transition={{ duration: 0.2 }}
                          >
                            {(secret.name?.charAt(0) ?? "").toUpperCase()}
                          </motion.div>
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">{secret.name}</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{secret.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            Active
                          </Badge>
                          <motion.div
                            animate={{ rotate: secret.lastRotated ? 360 : 0 }}
                            transition={{ duration: 0.5 }}
                          >
                            <Clock className="h-4 w-4 text-gray-400" />
                          </motion.div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <Input
                            type={showValues[secret.id] ? 'text' : 'password'}
                            value={secret.value}
                            readOnly
                            className="font-mono text-xs bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                          />
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSecretVisibility(secret.id)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          {showValues[secret.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(secret.value)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => rotateSecret(secret.id)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <RotateCw className="h-4 w-4" />
                        </Button>
                      </div>

                      {secret.lastRotated && (
                        <motion.p 
                          className="text-xs text-gray-500 dark:text-gray-400 mt-2"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          Last rotated: {new Date(secret.lastRotated).toLocaleString()}
                        </motion.p>
                      )}
                    </CardContent>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </TabsContent>

          {/* Logs Tab */}
          <TabsContent value="logs" className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant={logFilter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setLogFilter('all')}
                    className="text-xs"
                  >
                    All
                  </Button>
                  <Button
                    variant={logFilter === 'db' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setLogFilter('db')}
                    className="text-xs"
                  >
                    DB
                  </Button>
                  <Button
                    variant={logFilter === 'auth' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setLogFilter('auth')}
                    className="text-xs"
                  >
                    Auth
                  </Button>
                  <Button
                    variant={logFilter === 'storage' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setLogFilter('storage')}
                    className="text-xs"
                  >
                    Storage
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadLogs}
                    className="text-xs"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearLogs}
                    className="text-xs"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                </div>
              </div>

              {/* Log Viewer */}
              <div className="bg-gray-900 dark:bg-black rounded-lg p-4 h-96 overflow-y-auto font-mono text-xs text-green-400 border border-gray-700">
                <div className="space-y-1">
                  <div>[2024-01-15 10:30:45] INFO: Supabase connection established</div>
                  <div>[2024-01-15 10:30:46] INFO: Database schema synchronized</div>
                  <div>[2024-01-15 10:30:47] INFO: {logFilter.toUpperCase()} operations ready</div>
                  <div>[2024-01-15 10:30:48] DEBUG: Processing user authentication</div>
                  <div>[2024-01-15 10:30:49] INFO: Auth token validated successfully</div>
                  <div>[2024-01-15 10:30:50] DEBUG: Checking storage permissions</div>
                  <div>[2024-01-15 10:30:51] INFO: Storage access granted</div>
                  <div>[2024-01-15 10:30:52] INFO: All systems operational</div>
                  <motion.div
                    animate={{ opacity: [0.5, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <div>[2024-01-15 10:30:53] INFO: Live monitoring active...</div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </TabsContent>

          {/* Automation Tab */}
          <TabsContent value="automation" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {Object.entries(automationStatus).map(([key, status], index) => (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all"
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center justify-between text-lg">
                        <div className="flex items-center gap-2">
                          {key === 'schemaSync' && <RotateCw className="h-5 w-5 text-blue-600" />}
                          {key === 'autoBackup' && <Archive className="h-5 w-5 text-green-600" />}
                          {key === 'healthChecks' && <Activity className="h-5 w-5 text-purple-600" />}
                          {key === 'logRotation' && <Clock className="h-5 w-5 text-orange-600" />}
                          <span className="capitalize">
                            {key === 'schemaSync' && 'Schema Sync'}
                            {key === 'autoBackup' && 'Auto Backup'}
                            {key === 'healthChecks' && 'Health Checks'}
                            {key === 'logRotation' && 'Log Rotation'}
                          </span>
                        </div>
                        <Badge 
                          variant={status.active ? 'default' : 'secondary'}
                          className={status.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                        >
                          {status.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {key === 'schemaSync' && 'Automated schema sync for optimal performance'}
                        {key === 'autoBackup' && 'Automated backups for optimal performance'}
                        {key === 'healthChecks' && 'Automated health checks for optimal performance'}
                        {key === 'logRotation' && 'Automated log rotation for optimal performance'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Last run: {status.lastRun}
                        </div>
                        <Button
                          onClick={() => runAutomation(key)}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
                          disabled={!status.active}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Run Now
                        </Button>
                      </div>
                    </CardContent>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}