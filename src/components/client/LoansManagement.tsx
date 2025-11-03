'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calculator, 
  Calendar, 
  CreditCard, 
  TrendingUp, 
  AlertTriangle, 
  Edit, 
  RefreshCw,
  Building2,
  DollarSign,
  BarChart3,
  Activity,
  Target,
  ArrowUpRight,
  ChevronDown,
  Plus,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import AnimatedCounter from '@/components/ui/animated-counter'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Loan {
  id: string
  memberId: string
  memberName: string
  loanType: 'PERSONAL' | 'BUSINESS' | 'EMERGENCY' | 'HOUSING'
  principal: number
  interestRate: number
  amount: number
  tenure: number
  startDate: string
  endDate?: string
  status: 'ACTIVE' | 'PENDING' | 'OVERDUE' | 'PAID'
  emiAmount?: number
  nextPaymentDate?: string
  createdAt: string
  updatedAt: string
}

interface LoanFormData {
  loanType: 'PERSONAL' | 'BUSINESS' | 'EMERGENCY' | 'HOUSING'
  principal: number
  interestRate: number
  amount: number
  tenure: number
  startDate: string
  endDate?: string
  description: string
  memberId: string
  notes?: string
}

interface EMIInfo {
  monthlyPayment: number
  totalPayment: number
  remainingBalance: number
  nextPaymentDate: string
  daysLeft: number
  progress: number
  status: 'ON_TRACK' | 'PAID' | 'OVERDUE' | 'CRITICAL' | 'WARNING'
}

interface LoanManagementProps {
  societyInfo: any
}

const initialLoans: Loan[] = [
  { id: '1', memberId: '1', memberName: 'John Doe', loanType: 'PERSONAL', principal: 5000, interestRate: 12, amount: 5000, tenure: 12, startDate: '2024-01-15', endDate: '2025-01-15', status: 'ACTIVE', emiAmount: 480, nextPaymentDate: '2024-02-15', createdAt: '2024-01-15' },
  { id: '2', memberId: '2', memberName: 'Jane Smith', loanType: 'BUSINESS', principal: 2000, interestRate: 15, amount: 2000, tenure: 6, startDate: '2024-02-20', endDate: '2024-08-20', status: 'ACTIVE', emiAmount: 240, nextPaymentDate: '2024-08-20', createdAt: '2024-02-20' },
  { id: '3', memberId: '3', memberName: 'Mike Johnson', loanType: 'EMERGENCY', principal: 1500, interestRate: 18, amount: 1500, tenure: 3, startDate: '2024-03-10', endDate: '2024-06-10', status: 'ACTIVE', emiAmount: 540, nextPaymentDate: '2024-06-10', createdAt: '2024-03-10' },
  { id: '4', memberId: '4', memberName: 'Sarah Williams', loanType: 'PERSONAL', principal: 3000, interestRate: 10, amount: 3000, tenure: 24, startDate: '2024-04-05', endDate: '2024-04-05', status: 'OVERDUE', emiAmount: 0, nextPaymentDate: '2024-04-05', createdAt: '2024-04-05' }
]

const initialNewLoanState = {
    loanType: 'PERSONAL' as Loan['loanType'],
    principal: 1000,
    interestRate: 12,
    amount: 5000,
    tenure: 12,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    description: '',
    memberId: '',
    notes: ''
}

export default function LoanManagement({ societyInfo }: LoanManagementProps) {
  const [loans, setLoans] = useState<Loan[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLoanType, setSelectedLoanType] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null)
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; loan: Loan | null }>({ open: false, loan: null })
  const [paymentMethod, setPaymentMethod] = useState<string>('CREDIT_CARD')
  const [newLoanData, setNewLoanData] = useState(initialNewLoanState)

  // Fetch loans from API
  const fetchLoans = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800))
      setLoans(mockLoans)
    } catch (error) {
      console.error('Failed to fetch loans:', error)
      toast.error('Failed to fetch loans')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchLoans() }, [])

  // Filter loans based on search, type, and status
  const filteredLoans = loans.filter(loan => {
    const matchesSearch = loan.memberName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                     loan.loanType.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedLoanType === 'all' || loan.loanType === selectedLoanType
    const matchesStatus = selectedStatus === 'all' || loan.status === selectedStatus
    return matchesSearch && matchesType && matchesStatus
  })

  // Calculate EMI information for all loans
  const emiInfo = useMemo(() => {
    const emiInfos = loans.map(loan => getEMIInfo(loan))
    const totalEMI = emiInfos.reduce((sum, info) => sum + info.monthlyPayment, 0)
    const totalRemainingBalance = emiInfos.reduce((sum, info) => sum + info.remainingBalance, 0)
    
    return {
      totalEMI,
      totalRemainingBalance,
      avgMonthlyPayment: loans.length > 0 ? totalEMI / loans.length : 0,
      nextPaymentDate: emiInfos.length > 0 ? emiInfos[0].nextPaymentDate : 'Not set'
    }
  }, [loans, searchTerm, selectedLoanType, selectedStatus])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    if (editingLoan) {
      setEditingLoan(prev => ({ ...prev, [name]: value }))
    } else {
      setNewLoanData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handlePlanChange = (value: Loan['loanType']) => {
    if (editingLoan) {
      setEditingLoan(prev => ({ ...prev, plan: value }))
    } else {
      setNewLoanData(prev => ({ ...prev, plan: value }))
    }
  }

  const handleAddLoan = () => {
    if (!newLoanData.memberName || !newLoanData.amount || !newLoanData.tenure) {
      toast({
        title: "Validation Error",
        description: "Please fill all required fields",
        variant: "destructive"
      })
      return
    }

    const newLoan: Loan = {
      id: Date.now().toString(),
      ...newLoanData,
      status: 'PENDING',
      members: 0,
      joinDate: new Date().toISOString().split('T')[0],
      revenue: 0,
      rating: 4.0,
      lastActive: 'Just now'
    }

    setLoans(prev => [newLoan, ...prev])
    setIsAddModalOpen(false)
    setNewLoanData(initialNewLoanState)
    toast({
      title: "Loan Added Successfully",
      description: `New loan for ${newLoan.memberName} has been added`,
    })
  }

  const handleEditLoan = () => {
    if (!editingLoan) return
    
    const updatedLoan = { ...editingLoan }
    
    setLoans(prev => prev => prev.map(loan => 
      loan.id === editingLoan.id ? updatedLoan : loan
    ))
    
    setIsEditModalOpen(false)
    setEditingLoan(null)
    toast({
      title: "Loan Updated",
      description: `Loan for ${updatedLoan.memberName} has been updated`,
    })
  }

  const handleDeleteLoan = (loan: Loan) => {
    if (!loan) return
    
    setLoans(prev => prev.filter(l => l.id !== loan.id))
    toast({
      title: "Loan Deleted",
      description: `Loan for ${loan.memberName} has been deleted`,
      variant: "destructive"
    })
  }

  const handleDeleteLoan = (loan: Loan) => {
    if (!loan) return
    
    setLoans(prev => prev.filter(l => l.id !== loan.id))
    toast({
      title: "Loan Deleted",
      description: `Loan for ${loan.memberName} has been deleted`,
      variant: "destructive"
    })
  }

  const handleDeleteLoan = (loan: Loan) => {
    if (!loan) return
    
    setLoans(prev => prev.filter(l => l.id !== loan.id))
    toast({
      title: "Loan Deleted",
      description: `Loan for ${loan.memberName} has been deleted`,
      variant: "destructive"
    })
  }

  const handleExportData = (format: 'csv' | 'pdf') => {
    console.log(`Exporting data as ${format.toUpperCase()}`)
    toast.success(`Exporting data as ${format.toUpperCase()}`)
  }

  const handleRefreshData = () => {
    console.log('Refreshing data...')
    toast.success('Data refreshed successfully')
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 shadow-sm">
        <div className="flex justify-between items-center h-16 px-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Super Admin Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400">Manage your entire platform</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 px-3 py-2 text-sm">
              🧩 Demo Mode
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white border-gray-200 shadow-lg">
                <DropdownMenuItem onClick={() => handleExportData('csv')}>
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportData('pdf')}>
                  Export as PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button 
              onClick={() => window.location.href = '/login'}
              variant="outline"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Total Loans</CardTitle>
                <CreditCard className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{loans.length}</div>
                <p className="text-xs text-blue-100">All active loans</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="border-0 shadow-xl bg-gradient-to-br from-green-500 to-green-600 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Active Loans</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-400">{loans.filter(l => l.status === 'ACTIVE').length}</div>
                <p className="text-xs text-green-100">Currently active</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">₹{(stats.totalRevenue / 100000).toFixed(1)}L</div>
                <p className="text-xs text-purple-100">All time revenue</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="border-0 shadow-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Monthly Revenue</CardTitle>
                <BarChart3 className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">₹{(stats.monthlyRevenue / 100000).toFixed(1)}L</div>
                <p className="text-xs text-orange-100">This month</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Search and Filter Bar */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search loans..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  <SelectItem value="All">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Trial">Trial</SelectItem>
                  <SelectItem value="Expired">Expired</SelectItem>
                  <SelectItem value="Locked">Locked</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Plans" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  <SelectItem value="All">All Plans</SelectItem>
                  <SelectItem value="BASIC">Basic</SelectItem>
                  <SelectItem value="PRO">Pro</SelectItem>
                  <SelectItem value="TRIAL">Trial</SelectItem>
                  <SelectItem value="ENTERPRISESE">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Main Table */}
        <Card className="border-2 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Database className="h-5 w-5 text-cyan-400" />
              Society Management
            </CardTitle>
            <CardDescription className="text-gray-400">
              Manage all registered societies and their subscriptions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700/50">
                    <TableHead className="text-gray-300">Name</TableHead>
                    <TableHead className="text-gray-300">Type</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300">Members</TableHead>
                    <TableHead className="text-gray-300">Revenue</TableHead>
                    <TableHead className="text-gray-300 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {filteredLoans.map((loan, index) => {
                      return (
                        <motion.tr
                          key={loan.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-slate-700/30 hover:bg-slate-700/30 transition-colors"
                        >
                          <TableCell className="text-white font-medium">
                            <div>
                              <div className="text-white">{loan.memberName}</div>
                              <div className="text-xs text-gray-400">{loan.contact}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={planColors[loan.loanType]}>
                              {loan.loan}
                            </TableCell>
                          <TableCell>
                            <Badge className={`flex items-center gap-1 w-fit ${statusColors[loan.status]}`}>
                              <StatusIcon className="h-3 w-3" />
                              {loan.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-900">{loan.members}</TableCell>
                          <TableCell className="text-gray-900">{loan.revenue}</TableCell>
                          <TableCell className="text-gray-900">{loan.emiAmount}</TableCell>
                          <TableCell className="text-gray-900">{loan.interestRate}%</TableCell>
                          <TableCell className="text-gray-900">{loan.startDate}</TableCell>
                          <TableCell className="text-gray-900">{loan.endDate || 'Not set'}</TableCell>
                          <TableCell className="text-gray-900">{loan.daysLeft || 'N/A'}</TableCell>
                          <TableCell className="text-gray-900">{getEMIInfo(loan)?.progress}%}</TableCell>
                          <TableCell className="text-gray-900">{getEMIInfo(loan)?.nextPaymentDate || 'Not set'}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm">View</Button>
                              <Button variant="ghost" size="sm">Edit</Button>
                            </div>
                          </TableCell>
                        </motion.tr>
                      )
                    )}
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}