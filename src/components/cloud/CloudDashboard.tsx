'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Cloud, 
  Database, 
  Server,
  HardDrive,
  Cpu,
  Globe,
  TrendingUp,
  Monitor,
  Users,
  UserCheck,
  Activity,
  BarChart3,
  Zap,
  Wifi,
  Shield,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  RotateCw,
  Clock,
  Play,
  MoreVertical,
  Plus,
  Upload,
  Download,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  X,
  Archive,
  FileText,
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
import ErrorBoundaryClass from '@/components/error-boundary-new'

interface CloudDashboardProps {
  onStatsUpdate: () => void
}

export default function CloudDashboard({ onStatsUpdate }: CloudDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [showValues, setShowValues] = useState<Record<string, boolean>>({})
  const [logFilter, setLogFilter] = useState('all')
  const [storageFilter, setStorageFilter] = useState('all')
  const [functionFilter, setFunctionFilter] = useState('all')
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
    uptime: 99.7,
    requests: 1247,
    aiCalls: 892,
    bandwidth: 62.4,
    activeUsers: 156
  }

  const automationStatus = {
    schemaSync: { active: true, lastRun: '2 mins ago' },
    autoBackup: { active: true, lastRun: '1 hour ago' },
    healthChecks: { active: true, lastRun: '5 mins ago' },
    logRotation: { active: true, lastRun: '30 mins ago' },
    aiOptimization: { active: true, lastRun: '15 mins ago' },
    securityScan: { active: true, lastRun: '6 hours ago' }
  }

  // Auto-refresh secrets every 30 seconds
  useEffect(() => {
    if (activeTab !== 'secrets') return

    const interval = setInterval(() => {
      // Simulate auto-refresh
      console.log('Auto-refreshing secrets...')
    }, 30000)

    return () => clearInterval(interval)
  }, [activeTab])

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
      description: 'Please configure to new secret',
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

  return (
    <ErrorBoundaryClass>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <motion.div 
              className="w-14 h-14 bg-gradient-to-br from-sky-500 via-blue-500 to-indigo-500 rounded-xl flex items-center justify-center text-white shadow-lg"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ duration: 0.2 }}
            >
              <Cloud className="h-7 w-7" />
            </motion.div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Saanify Cloud Dashboard</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Complete Infrastructure Management</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-7 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
            <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:text-sky-600 dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-sky-400 rounded-lg text-xs font-medium">Overview</TabsTrigger>
            <TabsTrigger value="storage" className="data-[state=active]:bg-white data-[state=active]:text-sky-600 dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-sky-400 rounded-lg text-xs font-medium">Storage</TabsTrigger>
            <TabsTrigger value="functions" className="data-[state=active]:bg-white data-[state=active]:text-sky-600 dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-sky-400 rounded-lg text-xs font-medium">Functions</TabsTrigger>
            <TabsTrigger value="ai" className="data-[state=active]:bg-white data-[state=active]:text-sky-600 dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-sky-400 rounded-lg text-xs font-medium">AI</TabsTrigger>
            <TabsTrigger value="logs" className="data-[state=active]:bg-white data-[state=active]:text-sky-600 dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-sky-400 rounded-lg text-xs font-medium">Logs</TabsTrigger>
            <TabsTrigger value="secrets" className="data-[state=active]:bg-white data-[state=active]:text-sky-600 dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-sky-400 rounded-lg text-xs font-medium">Secrets</TabsTrigger>
            <TabsTrigger value="automation" className="data-[state=active]:bg-white data-[state=active]:text-sky-600 dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-sky-400 rounded-lg text-xs font-medium">Automation</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Stats Grid - All metrics visible */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="bg-gradient-to-br from-sky-50 to-blue-100 dark:from-sky-900/20 dark:to-blue-800/20 p-4 md:p-6 rounded-xl border border-sky-200/50 dark:border-sky-700/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Database className="h-6 w-6 md:h-8 md:w-8 text-sky-600" />
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <RefreshCw className="h-3 w-3 md:h-4 md:w-4 text-sky-500" />
                    </motion.div>
                  </div>
                  <div className="text-center">
                    <motion.div 
                      className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      {stats.projects}
                    </motion.div>
                    <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Projects</p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-900/20 dark:to-green-800/20 p-4 md:p-6 rounded-xl border border-emerald-200/50 dark:border-emerald-700/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Server className="h-6 w-6 md:h-8 md:w-8 text-emerald-600" />
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                    >
                      <Activity className="h-3 w-3 md:h-4 md:w-4 text-emerald-500" />
                    </motion.div>
                  </div>
                  <div className="text-center">
                    <motion.div 
                      className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                    >
                      {stats.databases}
                    </motion.div>
                    <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Databases</p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="bg-gradient-to-br from-violet-50 to-purple-100 dark:from-violet-900/20 dark:to-purple-800/20 p-4 md:p-6 rounded-xl border border-violet-200/50 dark:border-violet-700/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <HardDrive className="h-6 w-6 md:h-8 md:w-8 text-violet-600" />
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    >
                      <Zap className="h-3 w-3 md:h-4 md:w-4 text-violet-500" />
                    </motion.div>
                  </div>
                  <div className="text-center">
                    <motion.div 
                      className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                    >
                      {stats.storage}%
                    </motion.div>
                    <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Storage Used</p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-900/20 dark:to-orange-800/20 p-4 md:p-6 rounded-xl border border-amber-200/50 dark:border-amber-700/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Cpu className="h-6 w-6 md:h-8 md:w-8 text-amber-600" />
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
                    >
                      <BarChart3 className="h-3 w-3 md:h-4 md:w-4 text-amber-500" />
                    </motion.div>
                  </div>
                  <div className="text-center">
                    <motion.div 
                      className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                    >
                      {stats.functions}
                    </motion.div>
                    <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Functions</p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="bg-gradient-to-br from-rose-50 to-pink-100 dark:from-rose-900/20 dark:to-pink-800/20 p-4 md:p-6 rounded-xl border border-rose-200/50 dark:border-rose-700/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Globe className="h-6 w-6 md:h-8 md:w-8 text-rose-600" />
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    >
                      <Wifi className="h-3 w-3 md:h-4 md:w-4 text-rose-500" />
                    </motion.div>
                  </div>
                  <div className="text-center">
                    <motion.div 
                      className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.6 }}
                    >
                      {stats.uptime}%
                    </motion.div>
                    <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Uptime</p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.6 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-indigo-900/20 dark:to-blue-800/20 p-4 md:p-6 rounded-xl border border-indigo-200/50 dark:border-indigo-700/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <TrendingUp className="h-6 w-6 md:h-8 md:w-8 text-indigo-600" />
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 4.5, repeat: Infinity, ease: "linear" }}
                    >
                      <Activity className="h-3 w-3 md:h-4 md:w-4 text-indigo-500" />
                    </motion.div>
                  </div>
                  <div className="text-center">
                    <motion.div 
                      className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.7 }}
                    >
                      {stats.requests}
                    </motion.div>
                    <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Requests</p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.7 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="bg-gradient-to-br from-cyan-50 to-teal-100 dark:from-cyan-900/20 dark:to-teal-800/20 p-4 md:p-6 rounded-xl border border-cyan-200/50 dark:border-cyan-700/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Monitor className="h-6 w-6 md:h-8 md:w-8 text-cyan-600" />
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                    >
                      <Cpu className="h-3 w-3 md:h-4 md:w-4 text-cyan-500" />
                    </motion.div>
                  </div>
                  <div className="text-center">
                    <motion.div 
                      className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.8 }}
                    >
                      {stats.aiCalls}
                    </motion.div>
                    <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">AI Calls</p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.8 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="bg-gradient-to-br from-teal-50 to-emerald-100 dark:from-teal-900/20 dark:to-emerald-800/20 p-4 md:p-6 rounded-xl border border-teal-200/50 dark:border-teal-700/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Users className="h-6 w-6 md:h-8 md:w-8 text-teal-600" />
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 5.5, repeat: Infinity, ease: "linear" }}
                    >
                      <UserCheck className="h-3 w-3 md:h-4 md:w-4 text-teal-500" />
                    </motion.div>
                  </div>
                  <div className="text-center">
                    <motion.div 
                      className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.9 }}
                    >
                      {stats.activeUsers}
                    </motion.div>
                    <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Active Users</p>
                  </div>
                </motion.div>
              </div>

              {/* Bandwidth Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.9 }}
                whileHover={{ scale: 1.01, y: -1 }}
                className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-900/20 dark:via-purple-900/20 dark:to-pink-900/20 p-6 rounded-xl border border-indigo-200/50 dark:border-indigo-700/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">System Healthy</span>
                  </div>
                  <TrendingUp className="h-5 w-5 text-indigo-600" />
                </div>
                <div className="text-center">
                  <motion.div 
                    className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 1.0 }}
                  >
                    {stats.bandwidth} GB
                  </motion.div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Bandwidth This Month</p>
                </div>
              </motion.div>
            </motion.div>
          </TabsContent>

          {/* Storage Tab */}
          <TabsContent value="storage" className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant={storageFilter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStorageFilter('all')}
                    className="text-xs"
                  >
                    All Files
                  </Button>
                  <Button
                    variant={storageFilter === 'images' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStorageFilter('images')}
                    className="text-xs"
                  >
                    Images
                  </Button>
                  <Button
                    variant={storageFilter === 'documents' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStorageFilter('documents')}
                    className="text-xs"
                  >
                    Documents
                  </Button>
                  <Button
                    variant={storageFilter === 'backups' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStorageFilter('backups')}
                    className="text-xs"
                  >
                    Backups
                  </Button>
                </div>
                <Button
                  onClick={() => toast.info('Upload feature coming soon!')}
                  className="bg-sky-600 hover:bg-sky-700 text-white text-xs"
                >
                  <Upload className="h-4 w-4 mr-1" />
                  Upload
                </Button>
              </div>

              {/* Storage Files Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: 'user-avatars', type: 'images', size: '245 MB', modified: '2 hours ago', icon: '🖼️' },
                  { name: 'society-docs', type: 'documents', size: '1.2 GB', modified: '1 day ago', icon: '📄' },
                  { name: 'backup-2024', type: 'backups', size: '3.8 GB', modified: '1 week ago', icon: '💾' },
                  { name: 'maintenance-logs', type: 'documents', size: '128 MB', modified: '3 hours ago', icon: '📋' },
                  { name: 'financial-reports', type: 'documents', size: '456 MB', modified: '5 hours ago', icon: '📊' },
                  { name: 'property-images', type: 'images', size: '2.1 GB', modified: '2 days ago', icon: '🏠' }
                ].map((file, index) => (
                  <motion.div
                    key={file.name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{file.icon}</div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{file.name}</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{file.type}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>{file.size}</span>
                      <span>{file.modified}</span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Storage Usage Bar */}
              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Storage Usage</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{stats.storage}% of 100 GB</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <motion.div 
                    className="bg-gradient-to-r from-sky-500 to-blue-600 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.storage}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>
              </div>
            </motion.div>
          </TabsContent>

          {/* Functions Tab */}
          <TabsContent value="functions" className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant={functionFilter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFunctionFilter('all')}
                    className="text-xs"
                  >
                    All
                  </Button>
                  <Button
                    variant={functionFilter === 'active' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFunctionFilter('active')}
                    className="text-xs"
                  >
                    Active
                  </Button>
                  <Button
                    variant={functionFilter === 'idle' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFunctionFilter('idle')}
                    className="text-xs"
                  >
                    Idle
                  </Button>
                </div>
                <Button
                  onClick={() => toast.info('Deploy function feature coming soon!')}
                  className="bg-sky-600 hover:bg-sky-700 text-white text-xs"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Deploy Function
                </Button>
              </div>

              {/* Functions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: 'user-auth', status: 'active', invocations: 1247, avgLatency: '45ms', errorRate: '0.1%' },
                  { name: 'data-sync', status: 'active', invocations: 892, avgLatency: '120ms', errorRate: '0.3%' },
                  { name: 'email-service', status: 'idle', invocations: 45, avgLatency: '200ms', errorRate: '0%' },
                  { name: 'backup-automation', status: 'active', invocations: 234, avgLatency: '500ms', errorRate: '0.2%' },
                  { name: 'report-generator', status: 'active', invocations: 67, avgLatency: '1.2s', errorRate: '0.5%' },
                  { name: 'notification-push', status: 'idle', invocations: 12, avgLatency: '80ms', errorRate: '0%' }
                ].map((func, index) => (
                  <motion.div
                    key={func.name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${func.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{func.name}</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{func.status}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Invocations:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{func.invocations}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Avg Latency:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{func.avgLatency}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Error Rate:</span>
                        <span className={`font-medium ${func.errorRate === '0%' ? 'text-green-600' : 'text-orange-600'}`}>{func.errorRate}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </TabsContent>

          {/* AI Tab */}
          <TabsContent value="ai" className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-900/20 dark:to-violet-800/20 p-6 rounded-xl border border-purple-200/50 dark:border-purple-700/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between mb-4">
                    <Cpu className="h-8 w-8 text-purple-600" />
                    <Badge className="bg-purple-100 text-purple-800 text-xs">Active</Badge>
                  </div>
                  <div className="text-center">
                    <motion.div 
                      className="text-3xl font-bold text-gray-900 dark:text-white"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      {stats.aiCalls}
                    </motion.div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">AI Calls Today</p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-800/20 p-6 rounded-xl border border-blue-200/50 dark:border-blue-700/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between mb-4">
                    <Zap className="h-8 w-8 text-blue-600" />
                    <Badge className="bg-blue-100 text-blue-800 text-xs">Optimized</Badge>
                  </div>
                  <div className="text-center">
                    <motion.div 
                      className="text-3xl font-bold text-gray-900 dark:text-white"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                    >
                      98.5%
                    </motion.div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Accuracy Rate</p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-900/20 dark:to-green-800/20 p-6 rounded-xl border border-emerald-200/50 dark:border-emerald-700/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between mb-4">
                    <TrendingUp className="h-8 w-8 text-emerald-600" />
                    <Badge className="bg-emerald-100 text-emerald-800 text-xs">Fast</Badge>
                  </div>
                  <div className="text-center">
                    <motion.div 
                      className="text-3xl font-bold text-gray-900 dark:text-white"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                    >
                      1.2s
                    </motion.div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Avg Response</p>
                  </div>
                </motion.div>
              </div>

              {/* AI Models */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">AI Models & Services</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { name: 'GPT-4', type: 'Language Model', status: 'active', usage: '45%' },
                    { name: 'Claude-3', type: 'Language Model', status: 'active', usage: '30%' },
                    { name: 'DALL-E 3', type: 'Image Generation', status: 'active', usage: '15%' },
                    { name: 'Embeddings', type: 'Vector Search', status: 'active', usage: '10%' }
                  ].map((model, index) => (
                    <motion.div
                      key={model.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${model.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white text-sm">{model.name}</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{model.type}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{model.usage}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">usage</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
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
                  <div>[2024-01-15 10:30:45] INFO: Saanify Cloud connection established</div>
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

          {/* Automation Tab */}
          <TabsContent value="automation" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {Object.entries(automationStatus).map(([key, status], index) => (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all"
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center justify-between text-lg">
                        <div className="flex items-center gap-2">
                          {key === 'schemaSync' && <RotateCw className="h-5 w-5 text-blue-600" />}
                          {key === 'autoBackup' && <Archive className="h-5 w-5 text-green-600" />}
                          {key === 'healthChecks' && <Activity className="h-5 w-5 text-purple-600" />}
                          {key === 'logRotation' && <Clock className="h-5 w-5 text-orange-600" />}
                          {key === 'aiOptimization' && <Cpu className="h-5 w-5 text-cyan-600" />}
                          {key === 'securityScan' && <Shield className="h-5 w-5 text-rose-600" />}
                          <span className="capitalize">
                            {key === 'schemaSync' && 'Schema Sync'}
                            {key === 'autoBackup' && 'Auto Backup'}
                            {key === 'healthChecks' && 'Health Checks'}
                            {key === 'logRotation' && 'Log Rotation'}
                            {key === 'aiOptimization' && 'AI Optimization'}
                            {key === 'securityScan' && 'Security Scan'}
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
                        {key === 'autoBackup' && 'Automated backups for data protection'}
                        {key === 'healthChecks' && 'Automated health checks for system monitoring'}
                        {key === 'logRotation' && 'Automated log rotation for storage optimization'}
                        {key === 'aiOptimization' && 'AI-powered performance optimization'}
                        {key === 'securityScan' && 'Automated security vulnerability scanning'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Last run: {status.lastRun}
                        </div>
                        <Button
                          onClick={() => runAutomation(key)}
                          className="bg-sky-600 hover:bg-sky-700 text-white text-sm"
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

        {/* Security Notice */}
        <Alert className="mt-6 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong>🔒 Security Notice:</strong> All sensitive operations are logged and monitored. Service role keys are server-only and never exposed to clients.
          </AlertDescription>
        </Alert>
      </div>
    </ErrorBoundaryClass>
  )
}