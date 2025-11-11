'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Database, 
  Cloud, 
  Cpu, 
  Brain, 
  Upload, 
  FolderOpen, 
  FileText, 
  Image, 
  Download,
  Trash2,
  Plus,
  Play,
  Settings,
  BarChart3,
  TrendingUp,
  Zap,
  Shield,
  Globe,
  Code,
  RefreshCw,
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Eye,
  EyeOff,
  Users
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import StorageTab from './StorageTab'
import EdgeFunctionsTab from './EdgeFunctionsTab'
import AITab from './AITab'

interface CloudStats {
  storageUsed: number
  storageLimit: number
  functionsDeployed: number
  aiCalls: number
  aiCost: number
  aiTokens: number
}

interface CloudDashboardProps {
  onStatsUpdate: () => void
}

export default function CloudDashboard({ onStatsUpdate }: CloudDashboardProps) {
  const [activeTab, setActiveTab] = useState('storage')
  const [stats, setStats] = useState<CloudStats>({
    storageUsed: 0,
    storageLimit: 100,
    functionsDeployed: 0,
    aiCalls: 0,
    aiCost: 0,
    aiTokens: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchCloudStats()
  }, [])

  const fetchCloudStats = async () => {
    try {
      const response = await fetch('/api/cloud/stats')
      const data = await response.json()
      
      if (data.success) {
        setStats(data.stats)
      } else {
        // Use mock data
        const mockStats: CloudStats = {
          storageUsed: 45.2 + Math.random() * 5,
          storageLimit: 100,
          functionsDeployed: 12 + Math.floor(Math.random() * 5),
          aiCalls: 15420 + Math.floor(Math.random() * 1000),
          aiCost: 127.50 + Math.random() * 20,
          aiTokens: 2450000 + Math.floor(Math.random() * 100000)
        }
        setStats(mockStats)
      }
    } catch (error) {
      // Use mock data
      const mockStats: CloudStats = {
        storageUsed: 45.2,
        storageLimit: 100,
        functionsDeployed: 12,
        aiCalls: 15420,
        aiCost: 127.50,
        aiTokens: 2450000
      }
      setStats(mockStats)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Saanify Cloud Dashboard
          </h3>
          <p className="text-sm text-muted-foreground">
            Monitor and manage your cloud resources
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          whileHover={{ y: -5, scale: 1.02 }}
        >
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
            <CardContent className="p-6 text-center">
              <Database className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <h4 className="font-semibold text-foreground">45.2 GB</h4>
              <p className="text-sm text-muted-foreground">Storage Used</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          whileHover={{ y: -5, scale: 1.02 }}
        >
          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20">
            <CardContent className="p-6 text-center">
              <Cpu className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <h4 className="font-semibold text-foreground">12</h4>
              <p className="text-sm text-muted-foreground">Functions Deployed</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          whileHover={{ y: -5, scale: 1.02 }}
        >
          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
            <CardContent className="p-6 text-center">
              <Brain className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <h4 className="font-semibold text-foreground">15.4K</h4>
              <p className="text-sm text-muted-foreground">AI Calls Today</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          whileHover={{ y: -5, scale: 1.02 }}
        >
          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-500/20">
            <CardContent className="p-6 text-center">
              <BarChart3 className="h-8 w-8 mx-auto mb-2 text-orange-600" />
              <h4 className="font-semibold text-foreground">99.7%</h4>
              <p className="text-sm text-muted-foreground">Uptime</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Content */}
      <Card className="bg-gradient-to-br from-card to-muted/30 border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Cloud Management Dashboard
          </CardTitle>
          <CardDescription>
            Complete automation for Storage, Edge Functions, and AI services
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="storage" className="data-[state=activeTab === 'storage']">
                Database
              </TabsTrigger>
              <TabsTrigger value="functions" className="data-[state=activeTab === 'functions']">
                Cpu
              </TabsTrigger>
              <TabsTrigger value="ai" className="data-[state=activeTab === 'ai']">
                Brain
              </TabsTrigger>
            </TabsList>
            
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === 'storage' && (
                  <StorageTab onStatsUpdate={fetchCloudStats} />
                )}
                {activeTab === 'functions' && (
                  <EdgeFunctionsTab onStatsUpdate={fetchCloudStats} />
                )}
                {activeTab === 'ai' && (
                  <AITab onStatsUpdate={fetchCloudStats} />
                )}
              </motion.div>
            </AnimatePresence>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}