"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Filter, 
  Users, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Lock,
  Eye,
  Unlock,
  Trash2,
  RefreshCw,
  Building2,
  TrendingUp,
  AlertCircle,
  Shield,
  Settings,
  Database,
  Zap,
  Plus,
  Loader2,
  Activity,
  BarChart3,
  Calendar,
  DollarSign,
  Globe,
  Mail,
  Phone,
  MapPin,
  Edit,
  Copy,
  Download,
  Upload,
  UserCheck,
  Star,
  Award,
  Target,
  ArrowUpRight,
  ArrowDown,
  ChevronDown,
  MoreHorizontal,
  User,
  LogOut,
  Archive,
  ArchiveRestore,
  Sync,
  Play,
  Pause,
  HardDrive,
  Pulse,
  FileText,
  Bell,
  BellRing,
  MessageSquare,
  Send,
  Paperclip,
  Link,
  Unlink,
  Key,
  Fingerprint,
  ShieldCheck,
  ShieldAlert,
  Cpu,
  Brain,
  Heartbeat,
  Radio,
  Wifi,
  Router,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudDrizzle,
  Sun,
  Moon,
  MoreVertical,
  ChevronUp,
  ChevronRight,
  ChevronLeft,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  ArrowLeft,
  ArrowUpRight,
  ArrowDownRight,
  ArrowUpLeft,
  ArrowDownLeft,
  Move,
  Maximize2,
  Minimize2,
  Expand,
  Shrink,
  Fullscreen,
  Minimize,
  ZoomIn,
  ZoomOut,
  Timer,
  Stopwatch,
  Hourglass,
  AlarmClock,
  Watch,
  Clock1,
  Clock2,
  Clock3,
  Clock4,
  Clock5,
  Clock6,
  Clock7,
  Clock8,
  Clock9,
  Clock10,
  Clock11,
  Clock12
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

// Type definitions
interface Client {
  id: number
  name: string
  plan: "BASIC" | "PRO" | "TRIAL" | "ENTERPRISE"
  status: "Active" | "Trial" | "Expired" | "Locked"
  members: number
  joinDate: string
  revenue: string
  contact: string
  address: string
  website?: string
  phone?: string
  description?: string
  rating?: number
  lastActive?: string
}

interface AutomationTask {
  id: string
  name: string
  description: string
  enabled: boolean
  schedule: string
  lastRun: string | null
  nextRun: string | null
  status: 'ready' | 'running' | 'completed' | 'failed'
  duration: number
  successRate: number
  totalRuns: number
  logs?: string[]
}

interface BackupFile {
  id: string
  name: string
  size: string
  created: string
  type: 'manual' | 'scheduled'
  status: 'completed' | 'failed' | 'in_progress'
}

interface HealthCheck {
  id: string
  service: string
  status: 'healthy' | 'unhealthy' | 'warning'
  lastChecked: string
  responseTime: number
  details: string
}

// Enhanced dummy data with more realistic information
const dummyClients: Client[] = [
  { 
    id: 1, 
    name: "Green Valley Housing Society", 
    plan: "PRO", 
    status: "Active", 
    members: 240,
    joinDate: "2024-01-15",
    revenue: "$2,400",
    contact: "admin@greenvalley.com",
    phone: "+91-98765-43210",
    address: "123 Green Valley Road, Mumbai, Maharashtra 400001",
    website: "www.greenvalley.in",
    description: "Premium residential society with modern amenities",
    rating: 4.5,
    lastActive: "2 hours ago"
  },
  { 
    id: 2, 
    name: "Sunshine Community Association", 
    plan: "TRIAL", 
    status: "Trial", 
    members: 120,
    joinDate: "2024-03-10",
    revenue: "$0",
    contact: "info@sunshine.org",
    phone: "+91-98765-43211",
    address: "456 Sunshine Road, Delhi, Delhi 110001",
    website: "www.sunshine.org.in",
    description: "Emerging community with focus on sustainable living",
    rating: 4.2,
    lastActive: "1 day ago"
  },
  { 
    id: 3, 
    name: "Metro Residents Welfare Society", 
    plan: "BASIC", 
    status: "Expired", 
    members: 300,
    joinDate: "2023-12-01",
    revenue: "$600",
    contact: "metro@welfare.com",
    phone: "+91-98765-43212",
    address: "789 Metro Avenue, Bangalore, Karnataka 560001",
    website: "www.metroresidents.in",
    description: "Well-established society with 10+ years of service",
    rating: 4.0,
    lastActive: "3 days ago"
  },
  { 
    id: 4, 
    name: "Riverside Gardens", 
    plan: "PRO", 
    status: "Active", 
    members: 180,
    joinDate: "2024-02-20",
    revenue: "$2,400",
    contact: "riverside@gardens.in",
    phone: "+91-98765-43213",
    address: "321 Riverside Path, Pune, Maharashtra 411001",
    website: "www.riversidegardens.in",
    description: "Luxury apartments with river view and modern facilities",
    rating: 4.7,
    lastActive: "30 minutes ago"
  },
  { 
    id: 5, 
    name: "Oakwood Community", 
    plan: "ENTERPRISE", 
    status: "Locked", 
    members: 90,
    joinDate: "2024-01-05",
    revenue: "$4,800",
    contact: "oakwood@community.com",
    phone: "+91-98765-43214",
    address: "654 Oakwood Drive, Hyderabad, Telangana 500001",
    website: "www.oakwoodcommunity.in",
    description: "Premium gated community with high-end amenities",
    rating: 4.8,
    lastActive: "1 week ago"
  }
]

const statusColors = {
  Active: "bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200",
  Trial: "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200",
  Expired: "bg-red-100 text-red-800 border-red-200 hover:bg-red-200",
  Locked: "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200"
}

const planColors = {
  BASIC: "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200",
  PRO: "bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200",
  TRIAL: "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200",
  ENTERPRISE: "bg-cyan-100 text-cyan-800 border-cyan-200 hover:bg-cyan-200"
}

const statusIcons = {
  Active: CheckCircle,
  Trial: Clock,
  Expired: XCircle,
  Locked: Lock
}

const planIcons = {
  BASIC: Star,
  PRO: Award,
  TRIAL: Target,
  ENTERPRISE: Shield
}

// Naye client ke form ke liye initial state
const initialNewClientState = {
    name: "",
    contact: "",
    phone: "",
    address: "",
    website: "",
    description: "",
    plan: "TRIAL" as Client["plan"]
}

export default function SuperAdminDashboard() {
  const { toast } = useToast()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const [clients, setClients] = useState<Client[]>([])
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [statusFilter, setStatusFilter] = useState<string>("All")
  const [planFilter, setPlanFilter] = useState<string>("All")
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [newClientData, setNewClientData] = useState(initialNewClientState)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const [selectedBackupFile, setSelectedBackupFile] = useState<File | null>(null)
  const [showRestoreDialog, setShowRestoreDialog] = useState(false)
  
  // Automation states
  const [automationTasks, setAutomationTasks] = useState<AutomationTask[]>([
    {
      id: 'database-backup',
      name: 'Database Backup',
      description: 'Create secure database backups to Supabase Storage',
      enabled: true,
      schedule: 'manual',
      lastRun: null,
      nextRun: null,
      status: 'ready',
      duration: 0,
      successRate: 0,
      totalRuns: 0
    },
    {
      id: 'database-restore',
      name: 'Database Restore',
      description: 'Restore database from backup files',
      enabled: true,
      schedule: 'manual',
      lastRun: null,
      nextRun: null,
      status: 'ready',
      duration: 0,
      successRate: 0,
      totalRuns: 0
    },
    {
      id: 'schema-sync',
      name: 'Schema Sync',
      description: 'Sync database schema changes automatically',
      enabled: true,
      schedule: '0 */6 * * *',
      lastRun: null,
      nextRun: null,
      status: 'ready',
      duration: 0,
      successRate: 0,
      totalRuns: 0
    },
    {
      id: 'auto-sync',
      name: 'Auto Sync',
      description: 'Scheduled data synchronization',
      enabled: true,
      schedule: '0 */2 * * *',
      lastRun: null,
      nextRun: null,
      status: 'ready',
      duration: 0,
      successRate: 0,
      totalRuns: 0
    },
    {
      id: 'health-check',
      name: 'Health Check',
      description: 'Monitor system health and Supabase connectivity',
      enabled: true,
      schedule: '*/5 * * * *',
      lastRun: null,
      nextRun: null,
      status: 'ready',
      duration: 0,
      successRate: 0,
      totalRuns: 0
    }
  ])
  
  const [backupFiles, setBackupFiles] = useState<BackupFile[]>([
    {
      id: '1',
      name: 'backup_2024_01_15_02_00.sql',
      size: '45.2 MB',
      created: '2024-01-15 02:00:00',
      type: 'scheduled',
      status: 'completed'
    },
    {
      id: '2',
      name: 'backup_2024_01_14_14_30.sql',
      size: '44.8 MB',
      created: '2024-01-14 14:30:00',
      type: 'manual',
      status: 'completed'
    }
  ])
  
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([
    {
      id: '1',
      service: 'Supabase Database',
      status: 'healthy',
      lastChecked: '2024-01-15 10:30:00',
      responseTime: 45,
      details: 'All connections working properly'
    },
    {
      id: '2',
      service: 'Supabase Storage',
      status: 'healthy',
      lastChecked: '2024-01-15 10:30:00',
      responseTime: 32,
      details: 'Storage bucket accessible'
    },
    {
      id: '3',
      service: 'Sessions Table',
      status: 'healthy',
      lastChecked: '2024-01-15 10:30:00',
      responseTime: 28,
      details: '150 active sessions'
    }
  ])

  // Initial data load with loading effect
  useEffect(() => {
    setIsLoading(true)
    setTimeout(() => {
      setClients(dummyClients)
      setIsLoading(false)
    }, 1500)
  }, [])

  // Filter and search clients
  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "All" || client.status === statusFilter
      const matchesPlan = planFilter === "All" || client.plan === planFilter
      return matchesSearch && matchesStatus && matchesPlan
    })
  }, [clients, searchTerm, statusFilter, planFilter])

  // Statistics
  const stats = useMemo(() => {
    return {
      total: clients.length,
      active: clients.filter(c => c.status === "Active").length,
      trial: clients.filter(c => c.status === "Trial").length,
      expired: clients.filter(c => c.status === "Expired").length,
      locked: clients.filter(c => c.status === "Locked").length,
      totalRevenue: clients.reduce((sum, c) => sum + parseInt(c.revenue.replace(/[$,]/g, '')), 0),
      totalMembers: clients.reduce((sum, c) => sum + c.members, 0),
      avgRating: clients.length > 0 ? (clients.reduce((sum, c) => sum + (c.rating || 0), 0) / clients.length).toFixed(1) : 0
    }
  }, [clients])

  // Helper function to get auth headers
  const getAuthHeaders = () => {
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('auth-token='))
      ?.split('=')[1]
    
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  }

  // Run automation task
  const runTask = async (taskId: string) => {
    setLoading({ ...loading, [taskId]: true })
    
    try {
      const response = await fetch(`/api/super-admin/automation/${taskId}/run`, {
        method: 'POST',
        headers: getAuthHeaders()
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast.success(`✅ ${taskId} completed successfully`, {
          description: result.message || 'Task completed successfully'
        })
        
        // Update task status
        setAutomationTasks(prev => prev.map(task => 
          task.id === taskId 
            ? { 
                ...task, 
                status: 'completed',
                lastRun: new Date().toISOString(),
                totalRuns: task.totalRuns + 1,
                successRate: task.totalRuns > 0 ? ((task.successRate * task.totalRuns + 100) / (task.totalRuns + 1)) : 100
              }
            : task
        ))
      } else {
        toast.error(`❌ ${taskId} failed`, {
          description: result.error || 'Task failed to complete'
        })
        
        setAutomationTasks(prev => prev.map(task => 
          task.id === taskId 
            ? { 
                ...task, 
                status: 'failed',
                lastRun: new Date().toISOString(),
                totalRuns: task.totalRuns + 1,
                successRate: task.totalRuns > 0 ? ((task.successRate * task.totalRuns) / (task.totalRuns + 1)) : 0
              }
            : task
        ))
      }
    } catch (error) {
      toast.error(`❌ ${taskId} failed`, {
        description: 'Network error occurred'
      })
      
      setAutomationTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { 
              ...task, 
              status: 'failed',
              lastRun: new Date().toISOString(),
              totalRuns: task.totalRuns + 1,
              successRate: task.totalRuns > 0 ? ((task.successRate * task.totalRuns) / (task.totalRuns + 1)) : 0
            }
          : task
      ))
    } finally {
      setLoading({ ...loading, [taskId]: false })
    }
  }

  // Toggle task enabled/disabled
  const toggleTask = async (taskId: string) => {
    const task = automationTasks.find(t => t.id === taskId)
    if (!task) return
    
    setLoading({ ...loading, [taskId]: true })
    
    try {
      const response = await fetch(`/api/super-admin/automation/${taskId}/toggle`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ enabled: !task.enabled })
      })
      
      const result = await response.json()
      
      if (result.success) {
        setAutomationTasks(prev => prev.map(t => 
          t.id === taskId ? { ...t, enabled: !t.enabled } : t
        ))
        toast.success(`✅ Task ${!task.enabled ? 'enabled' : 'disabled'}`)
      } else {
        toast.error(result.error || 'Failed to toggle task')
      }
    } catch (error) {
      toast.error('Failed to toggle task')
    } finally {
      setLoading({ ...loading, [taskId]: false })
    }
  }

  // Handle database backup
  const handleDatabaseBackup = async () => {
    await runTask('database-backup')
  }

  // Handle database restore
  const handleDatabaseRestore = async () => {
    if (!selectedBackupFile) {
      toast.error('Please select a backup file first')
      return
    }
    
    setLoading({ ...loading, restore: true })
    
    try {
      const formData = new FormData()
      formData.append('backupFile', selectedBackupFile)
      
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth-token='))
        ?.split('=')[1]
      
      const response = await fetch('/api/super-admin/automation/database-restore', {
        method: 'POST',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: formData
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast.success('✅ Database restored successfully')
        setShowRestoreDialog(false)
        setSelectedBackupFile(null)
      } else {
        toast.error(result.error || 'Failed to restore database')
      }
    } catch (error) {
      toast.error('Failed to restore database')
    } finally {
      setLoading({ ...loading, restore: false })
    }
  }

  // Handle schema sync
  const handleSchemaSync = async () => {
    await runTask('schema-sync')
  }

  // Handle auto sync
  const handleAutoSync = async () => {
    await runTask('auto-sync')
  }

  // Handle health check
  const handleHealthCheck = async () => {
    await runTask('health-check')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'unhealthy':
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'warning':
      case 'running':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'completed':
        return CheckCircle
      case 'unhealthy':
      case 'failed':
        return AlertCircle
      case 'warning':
      case 'running':
        return Activity
      default:
        return Clock
    }
  }

  // Action handlers
  const handleView = (client: Client) => {
    setSelectedClient(client)
    setIsViewModalOpen(true)
  }

  const handleEdit = (client: Client) => {
    setEditingClient(client)
    setIsEditModalOpen(true)
  }

  const handleLock = (client: Client) => {
    setClients(prev => prev.map(c => 
      c.id === client.id ? { ...c, status: "Locked" as const } : c
    ))
    toast({
      title: "Client Locked",
      description: `${client.name} has been locked`,
    })
  }

  const handleUnlock = (client: Client) => {
    setClients(prev => prev.map(c => 
      c.id === client.id ? { ...c, status: "Active" as const } : c
    ))
    toast({
      title: "Client Unlocked",
      description: `${client.name} has been unlocked`,
    })
  }

  const handleDelete = (client: Client) => {
    setClients(prev => prev.filter(c => c.id !== client.id))
    toast({
      title: "Client Deleted",
      description: `${client.name} has been removed`,
      variant: "destructive"
    })
  }

  const handleRenew = (client: Client) => {
    const newPlan: Client["plan"] = client.plan === "BASIC" ? "PRO" : "ENTERPRISE"
    setClients(prev => prev.map(c => 
      c.id === client.id ? { ...c, status: "Active" as const, plan: newPlan } : c
    ))
    toast({
      title: "Subscription Renewed",
      description: `${client.name} subscription renewed to ${newPlan}`,
    })
  }

  const handleRefresh = () => {
    setIsLoading(true)
    setTimeout(() => {
      setClients(dummyClients)
      setIsLoading(false)
      toast({
        title: "Data Refreshed",
        description: "Client data has been refreshed",
      })
    }, 1000)
  }

  // Form handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (editingClient) {
      setEditingClient(prev => ({ ...prev, [name]: value }))
    } else {
      setNewClientData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handlePlanChange = (value: Client["plan"]) => {
    if (editingClient) {
      setEditingClient(prev => ({ ...prev, plan: value }))
    } else {
      setNewClientData(prev => ({ ...prev, plan: value }))
    }
  }

  const handleAddClient = () => {
    if (!newClientData.name || !newClientData.contact) {
      toast({
        title: "Validation Error",
        description: "Society name and contact are required.",
        variant: "destructive",
      })
      return
    }

    const newClient: Client = {
      id: Date.now(),
      ...newClientData,
      status: "Trial",
      members: 0,
      joinDate: new Date().toISOString().split("T")[0],
      revenue: "$0",
      rating: 4.0,
      lastActive: "Just now"
    }

    setClients(prevClients => [newClient, ...prevClients])
    setIsAddModalOpen(false)
    setNewClientData(initialNewClientState)
    toast({
      title: "Society Added",
      description: `${newClient.name} has been successfully added.`,
    })
  }

  const handleUpdateClient = () => {
    if (!editingClient) return

    setClients(prev => prev.map(c => 
      c.id === editingClient.id ? editingClient : c
    ))
    setIsEditModalOpen(false)
    setEditingClient(null)
    toast({
      title: "Society Updated",
      description: `${editingClient.name} has been successfully updated.`,
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-indigo-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Super Admin Dashboard</h1>
                <p className="text-sm text-gray-500">Manage all societies and automation</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-indigo-100 text-indigo-800 px-3 py-1 text-sm">
                🧩 Demo Mode
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                    <User className="h-4 w-4 mr-2" />
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem className="cursor-pointer">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">Profile</p>
                        <p className="text-xs text-gray-500">superadmin@saanify.com</p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">Settings</p>
                        <p className="text-xs text-gray-500">System settings</p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => {
                      toast({
                        title: "Logged Out",
                        description: "You have been successfully logged out.",
                      })
                      router.push('/login')
                    }}
                    className="cursor-pointer text-red-600 hover:bg-red-50"
                  >
                    <div className="flex items-center gap-2">
                      <LogOut className="h-4 w-4" />
                      <div>
                        <p className="text-sm font-medium">Logout</p>
                        <p className="text-xs text-gray-500">Sign out of account</p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button 
                onClick={() => setIsAddModalOpen(true)}
                className="bg-indigo-600 text-white hover:bg-indigo-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Society
              </Button>
              <Button 
                onClick={handleRefresh}
                disabled={isLoading}
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Societies</TabsTrigger>
            <TabsTrigger value="automation">Automation</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab - Societies Management */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Societies</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <p className="text-xs text-muted-foreground">
                    +2 from last month
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Societies</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.active}</div>
                  <p className="text-xs text-muted-foreground">
                    {((stats.active / stats.total) * 100).toFixed(1)}% of total
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    +12% from last month
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Members</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalMembers.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    +8% from last month
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Filters and Search */}
            <Card>
              <CardHeader>
                <CardTitle>Society Management</CardTitle>
                <CardDescription>Manage all registered societies and their subscriptions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search societies..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Status</SelectItem>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Trial">Trial</SelectItem>
                      <SelectItem value="Expired">Expired</SelectItem>
                      <SelectItem value="Locked">Locked</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={planFilter} onValueChange={setPlanFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Filter by plan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Plans</SelectItem>
                      <SelectItem value="BASIC">Basic</SelectItem>
                      <SelectItem value="PRO">Pro</SelectItem>
                      <SelectItem value="TRIAL">Trial</SelectItem>
                      <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Clients Table */}
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Society</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Members</TableHead>
                        <TableHead>Revenue</TableHead>
                        <TableHead>Last Active</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            <div className="flex items-center justify-center">
                              <Loader2 className="h-6 w-6 animate-spin mr-2" />
                              Loading societies...
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : filteredClients.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            <div className="text-gray-500">
                              {searchTerm || statusFilter !== "All" || planFilter !== "All" 
                                ? "No societies found matching your criteria" 
                                : "No societies registered yet"}
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredClients.map((client) => (
                          <TableRow key={client.id} className="hover:bg-gray-50">
                            <TableCell>
                              <div>
                                <div className="font-medium text-gray-900">{client.name}</div>
                                <div className="text-sm text-gray-500">{client.contact}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={planColors[client.plan]}>
                                {(() => {
                                  const IconComponent = planIcons[client.plan]
                                  return <IconComponent className="h-3 w-3 mr-1" />
                                })()}
                                {client.plan}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={statusColors[client.status]}>
                                {(() => {
                                  const IconComponent = statusIcons[client.status]
                                  return <IconComponent className="h-3 w-3 mr-1" />
                                })()}
                                {client.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Users className="h-4 w-4 mr-1 text-gray-400" />
                                {client.members}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{client.revenue}</div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm text-gray-500">{client.lastActive}</div>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleView(client)}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleEdit(client)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Society
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  {client.status === "Active" ? (
                                    <DropdownMenuItem onClick={() => handleLock(client)}>
                                      <Lock className="h-4 w-4 mr-2" />
                                      Lock Society
                                    </DropdownMenuItem>
                                  ) : (
                                    <DropdownMenuItem onClick={() => handleUnlock(client)}>
                                      <Unlock className="h-4 w-4 mr-2" />
                                      Unlock Society
                                    </DropdownMenuItem>
                                  )}
                                  {client.status === "Expired" && (
                                    <DropdownMenuItem onClick={() => handleRenew(client)}>
                                      <RefreshCw className="h-4 w-4 mr-2" />
                                      Renew Subscription
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => handleDelete(client)}
                                    className="text-red-600 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Society
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Automation Tab */}
          <TabsContent value="automation" className="space-y-6">
            <div className="mb-6">
              <Badge className="bg-red-100 text-red-800 border-red-200 px-3 py-1">
                <Shield className="h-4 w-4 mr-2" />
                SUPERADMIN ONLY
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Database Backup
                  </CardTitle>
                  <CardDescription>
                    Manual database backup to Supabase Storage
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={handleDatabaseBackup}
                    disabled={loading['database-backup']}
                    className="w-full"
                  >
                    {loading['database-backup'] ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    Backup Now
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ArchiveRestore className="h-5 w-5" />
                    Database Restore
                  </CardTitle>
                  <CardDescription>
                    Restore database from backup files
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => setShowRestoreDialog(true)}
                    variant="outline"
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Restore Database
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sync className="h-5 w-5" />
                    Schema Sync
                  </CardTitle>
                  <CardDescription>
                    Sync database schema changes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={handleSchemaSync}
                    disabled={loading['schema-sync']}
                    className="w-full"
                  >
                    {loading['schema-sync'] ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4 mr-2" />
                    )}
                    Sync Now
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Auto Sync
                  </CardTitle>
                  <CardDescription>
                    Scheduled data synchronization
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={handleAutoSync}
                    disabled={loading['auto-sync']}
                    className="w-full"
                  >
                    {loading['auto-sync'] ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4 mr-2" />
                    )}
                    Sync Now
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Health Check
                  </CardTitle>
                  <CardDescription>
                    Monitor system health status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={handleHealthCheck}
                    disabled={loading['health-check']}
                    className="w-full"
                  >
                    {loading['health-check'] ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Pulse className="h-4 w-4 mr-2" />
                    )}
                    Check Health
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Automation Tasks */}
            <Card>
              <CardHeader>
                <CardTitle>Automation Tasks</CardTitle>
                <CardDescription>
                  Manage and monitor automated tasks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {automationTasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold">{task.name}</h3>
                          <Badge className={getStatusColor(task.status)}>
                            {(() => {
                              const IconComponent = getStatusIcon(task.status)
                              return IconComponent ? <IconComponent className="h-3 w-3 mr-1" /> : null
                            })()}
                            {task.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          {task.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>Schedule: {task.schedule}</span>
                          <span>Runs: {task.totalRuns}</span>
                          <span>Success Rate: {task.successRate.toFixed(1)}%</span>
                          {task.lastRun && (
                            <span>Last Run: {new Date(task.lastRun).toLocaleString()}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={task.enabled}
                          onCheckedChange={() => toggleTask(task.id)}
                          disabled={loading[task.id]}
                        />
                        <Button
                          onClick={() => runTask(task.id)}
                          disabled={loading[task.id] || !task.enabled}
                          size="sm"
                        >
                          {loading[task.id] ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Health Checks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  System Health
                </CardTitle>
                <CardDescription>
                  Monitor system health and connectivity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {healthChecks.map((check) => (
                    <div key={check.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold">{check.service}</h3>
                          <Badge className={getStatusColor(check.status)}>
                            {(() => {
                              const IconComponent = getStatusIcon(check.status)
                              return IconComponent ? <IconComponent className="h-3 w-3 mr-1" /> : null
                            })()}
                            {check.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          {check.details}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>Response Time: {check.responseTime}ms</span>
                          <span>Last Checked: {check.lastChecked}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Societies</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <p className="text-xs text-muted-foreground">
                    +2 from last month
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalMembers.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    +8% from last month
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    +12% from last month
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.avgRating}</div>
                  <p className="text-xs text-muted-foreground">
                    +0.2 from last month
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue by Plan</CardTitle>
                  <CardDescription>Monthly revenue breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {['BASIC', 'PRO', 'TRIAL', 'ENTERPRISE'].map((plan) => {
                      const planClients = clients.filter(c => c.plan === plan)
                      const planRevenue = planClients.reduce((sum, c) => sum + parseInt(c.revenue.replace(/[$,]/g, '')), 0)
                      const percentage = stats.totalRevenue > 0 ? (planRevenue / stats.totalRevenue * 100).toFixed(1) : '0'
                      
                      return (
                        <div key={plan} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge className={planColors[plan as keyof typeof planColors]}>
                              {plan}
                            </Badge>
                            <span className="text-sm">{planClients.length} societies</span>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">${planRevenue.toLocaleString()}</div>
                            <div className="text-xs text-gray-500">{percentage}%</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Status Distribution</CardTitle>
                  <CardDescription>Society status overview</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {['Active', 'Trial', 'Expired', 'Locked'].map((status) => {
                      const statusCount = clients.filter(c => c.status === status).length
                      const percentage = stats.total > 0 ? (statusCount / stats.total * 100).toFixed(1) : '0'
                      
                      return (
                        <div key={status} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge className={statusColors[status as keyof typeof statusColors]}>
                              {(() => {
                                const IconComponent = statusIcons[status as keyof typeof statusIcons]
                                return <IconComponent className="h-3 w-3 mr-1" />
                              })()}
                              {status}
                            </Badge>
                            <span className="text-sm">{statusCount} societies</span>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{percentage}%</div>
                            <div className="text-xs text-gray-500">of total</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* View Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Society Details</DialogTitle>
            <DialogDescription>
              Complete information about {selectedClient?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedClient && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Society Name</Label>
                <p className="text-sm text-gray-600">{selectedClient.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Contact</Label>
                <p className="text-sm text-gray-600">{selectedClient.contact}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Phone</Label>
                <p className="text-sm text-gray-600">{selectedClient.phone}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Website</Label>
                <p className="text-sm text-gray-600">{selectedClient.website}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Plan</Label>
                <Badge className={planColors[selectedClient.plan]}>
                  {selectedClient.plan}
                </Badge>
              </div>
              <div>
                <Label className="text-sm font-medium">Status</Label>
                <Badge className={statusColors[selectedClient.status]}>
                  {(() => {
                    const IconComponent = statusIcons[selectedClient.status]
                    return <IconComponent className="h-3 w-3 mr-1" />
                  })()}
                  {selectedClient.status}
                </Badge>
              </div>
              <div>
                <Label className="text-sm font-medium">Members</Label>
                <p className="text-sm text-gray-600">{selectedClient.members}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Revenue</Label>
                <p className="text-sm text-gray-600">{selectedClient.revenue}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Join Date</Label>
                <p className="text-sm text-gray-600">{selectedClient.joinDate}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Last Active</Label>
                <p className="text-sm text-gray-600">{selectedClient.lastActive}</p>
              </div>
              <div className="md:col-span-2">
                <Label className="text-sm font-medium">Address</Label>
                <p className="text-sm text-gray-600">{selectedClient.address}</p>
              </div>
              <div className="md:col-span-2">
                <Label className="text-sm font-medium">Description</Label>
                <p className="text-sm text-gray-600">{selectedClient.description}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Modal */}
      <Dialog open={isAddModalOpen || isEditModalOpen} onOpenChange={(open) => {
        if (!open) {
          setIsAddModalOpen(false)
          setIsEditModalOpen(false)
          setEditingClient(null)
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditModalOpen ? 'Edit Society' : 'Add New Society'}</DialogTitle>
            <DialogDescription>
              {isEditModalOpen ? 'Update society information' : 'Register a new society'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Society Name</Label>
              <Input
                id="name"
                name="name"
                value={isEditModalOpen ? editingClient?.name : newClientData.name}
                onChange={handleInputChange}
                placeholder="Enter society name"
              />
            </div>
            <div>
              <Label htmlFor="contact">Contact Email</Label>
              <Input
                id="contact"
                name="contact"
                type="email"
                value={isEditModalOpen ? editingClient?.contact : newClientData.contact}
                onChange={handleInputChange}
                placeholder="admin@society.com"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                value={isEditModalOpen ? editingClient?.phone : newClientData.phone}
                onChange={handleInputChange}
                placeholder="+91-98765-43210"
              />
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                name="website"
                value={isEditModalOpen ? editingClient?.website : newClientData.website}
                onChange={handleInputChange}
                placeholder="www.society.com"
              />
            </div>
            <div>
              <Label htmlFor="plan">Subscription Plan</Label>
              <Select 
                value={isEditModalOpen ? editingClient?.plan : newClientData.plan}
                onValueChange={handlePlanChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TRIAL">Trial</SelectItem>
                  <SelectItem value="BASIC">Basic</SelectItem>
                  <SelectItem value="PRO">Pro</SelectItem>
                  <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                value={isEditModalOpen ? editingClient?.address : newClientData.address}
                onChange={handleInputChange}
                placeholder="123 Society Road, City, State 123456"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={isEditModalOpen ? editingClient?.description : newClientData.description}
                onChange={handleInputChange}
                placeholder="Brief description about the society..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddModalOpen(false)
              setIsEditModalOpen(false)
              setEditingClient(null)
            }}>
              Cancel
            </Button>
            <Button onClick={isEditModalOpen ? handleUpdateClient : handleAddClient}>
              {isEditModalOpen ? 'Update Society' : 'Add Society'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restore Dialog */}
      <Dialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restore Database</DialogTitle>
            <DialogDescription>
              Select a backup file to restore to database. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="restore-file">Backup File</Label>
              <Input
                id="restore-file"
                type="file"
                accept=".sql"
                onChange={(e) => setSelectedBackupFile(e.target.files?.[0] || null)}
                className="mt-1"
              />
            </div>
            {selectedBackupFile && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  You are about to restore the database using <strong>{selectedBackupFile.name}</strong>. 
                  This will overwrite all current data.
                </AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRestoreDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleDatabaseRestore}
              disabled={!selectedBackupFile || loading.restore}
            >
              {loading.restore ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <ArchiveRestore className="h-4 w-4 mr-2" />
              )}
              Restore Database
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}