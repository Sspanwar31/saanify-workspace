'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Calculator, 
  Calendar, 
  CreditCard, 
  TrendingUp, 
  AlertTriangle, 
  Edit, 
  RefreshCw,
  Download,
  Upload,
  FileText,
  Shield,
  Clock,
  CheckCircle,
  DollarSign,
  BarChart3,
  Activity,
  Target,
  ArrowUpRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useClientApi } from '@/lib/useClientApi'

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

interface LoanManagementProps {
  societyInfo: any
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
  status: 'ON_TRACK' | 'PAID' | 'OVERDUE'
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

interface LoanManagementProps {
  societyInfo: any
}

export function LoanManagement({ societyInfo }: LoanManagementProps) {
  const [loans, setLoans] = useState<Loan[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLoanType, setSelectedLoanType] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null)
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; loan: Loan | null }>({ open: false, loan: null })
  
  const [addForm, setAddForm] = useState<LoanFormData>({
    loanType: 'PERSONAL',
    principal: 1000,
    interestRate: 12,
    amount: 5000,
    tenure: 12,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    description: '',
    memberId: '',
    notes: ''
  })

  // Mock data
  const mockLoans: Loan[] = [
    {
      id: '1',
      memberId: '1',
      memberName: 'John Doe',
      loanType: 'PERSONAL',
      principal: 5000,
      interestRate: 12,
      amount: 5000,
      tenure: 12,
      startDate: '2024-01-15',
      endDate: '2025-01-15',
      status: 'ACTIVE',
      emiAmount: 480,
      nextPaymentDate: '2024-02-15',
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15'
    },
    {
      id: '2',
      memberId: '2',
      memberName: 'Jane Smith',
      loanType: 'BUSINESS',
      principal: 2000,
      interestRate: 15,
      amount: 2000,
      tenure: 6,
      startDate: '2024-02-20',
      endDate: '2024-08-20',
      status: 'ACTIVE',
      emiAmount: 240,
      nextPaymentDate: '2024-08-20',
      createdAt: '2024-02-20',
      updatedAt: '2024-02-20'
    },
    {
      id: '3',
      memberId: '3',
      memberName: 'Mike Johnson',
      loanType: 'EMERGENCY',
      principal: 1500,
      interestRate: 18,
      amount: 1500,
      tenure: 3,
      startDate: '2024-03-10',
      endDate: '2024-06-10',
      status: 'ACTIVE',
      emiAmount: 540,
      nextPaymentDate: '2024-06-10',
      createdAt: '2024-03-10',
      updatedAt: '2024-03-10'
    },
    {
      id: '4',
      memberId: '4',
      memberName: 'Sarah Williams',
      loanType: 'PERSONAL',
      principal: 300,
      interestRate: 10,
      amount: 300,
      tenure: 24,
      startDate: '2024-04-05',
      endDate: '2024-04-05',
      status: 'OVERDUE',
      emiAmount: 0,
      nextPaymentDate: '2024-04-05',
      createdAt: '2024-04-05',
      updatedAt: '2024-04-05'
    }
  ]

  // Mock API call
  const fetchLoans = async () => {
    setLoading(true)
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800))
      setLoans(mockLoans)
    } catch (error) {
      console.error('Failed to fetch loans:', error)
      toast.error('Failed to fetch loans')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLoans()
  }, [])

  const filteredLoans = loans.filter(loan => {
    const matchesSearch = loan.memberName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                     loan.loanType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                     loan.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedLoanType === 'all' || loan.loanType === selectedLoanType
    const matchesStatus = selectedStatus === 'all' || loan.status === selectedStatus
    return matchesSearch && matchesType && matchesStatus
  })

  const getEMIInfo = (loan: Loan): EMIInfo | null => {
    if (!loan.endDate || !loan.startDate) return null
    
    const now = new Date()
    const endDate = new Date(loan.endDate)
    const startDate = new Date(loan.startDate)
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const daysLeft = Math.max(0, totalDays)
    
    const monthlyPayment = loan.amount / loan.tenure
    const remainingBalance = loan.principal - (monthlyPayment * daysLeft)
    
    return {
      monthlyPayment,
      remainingBalance,
      daysLeft,
      progress: totalDays > 0 ? Math.max(0, Math.min(100, ((totalDays - daysLeft) / totalDays) * 100)) : 0,
      status: daysLeft <= 7 ? 'CRITICAL' : daysLeft <= 30 ? 'WARNING' : 'ON_TRACK',
      nextPaymentDate: daysLeft > 0 ? new Date(endDate.getTime() + (30 * 24 * 60 * 1000)).toISOString().split('T')[0] : 'Not set'
    }
  }

  const getProgressColor = (status: string, daysLeft: number | null) => {
    if (status === 'OVERDUE' || daysLeft === null) return 'bg-slate-300'
    if (daysLeft !== null && daysLeft <= 30) return 'bg-red-500'
    if (daysLeft <= 90) return 'bg-amber-500'
    return 'bg-emerald-500'
  }

  const getPlanPrice = (plan: string) => {
    const prices = {
      TRIAL: 0,
      BASIC: 99,
      PRO: 299,
      ENTERPRISE: 999
    }
    return prices[plan as keyof typeof prices] || 0
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-2 border-blue-600 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Loans Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ y: -5, scale: 1.01 }}
      >
        <Card className="border-2 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              Loans Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: 'Total Loans',
                  value: loans.length,
                  change: '+15%',
                  icon: CreditCard,
                  gradient: 'from-orange-500 to-orange-600',
                  bgGradient: 'from-orange-500/10 to-orange-600/10',
                  borderColor: 'border-orange-200/50',
                  description: 'All active loans'
                },
                {
                  title: 'Active Loans',
                  value: loans.filter(l => l.status === 'ACTIVE').length,
                  change: '+8%',
                  icon: TrendingUp,
                  gradient: 'from-emerald-500 to-emerald-600',
                  bgGradient: 'from-emerald-500/10 to-emerald-600/10',
                  borderColor: 'border-emerald-200/50',
                  description: 'Currently active loans'
                },
                {
                  title: 'EMI Amount',
                  value: loans.reduce((sum, l) => sum + (l.emiAmount || 0), 0),
                  change: '+22%',
                  icon: DollarSign,
                  gradient: 'from-purple-500 to-purple-600',
                  bgGradient: 'from-purple-500/10 to-purple-600/10',
                  borderColor: 'border-purple-200/50',
                  description: 'Total EMI amount',
                  visible: loans.some(l => l.status === 'ACTIVE'),
                  prefix: '$'
                },
                {
                  title: 'Pending Loans',
                  value: loans.filter(l => l.status === 'PENDING').length,
                  change: '+3',
                  icon: AlertTriangle,
                  gradient: 'from-red-500 to-red-600',
                  bgGradient: 'from-red-500/10 to-red-600/10',
                  borderColor: 'border-red-200/50',
                  description: 'Pending approval'
                },
                {
                  title: 'Overdue Loans',
                  value: loans.filter(l => l.status === 'OVERDUE').length,
                  change: '-5',
                  icon: AlertTriangle,
                  gradient: 'from-red-500 to-red-600',
                  bgGradient: 'from-red-500/10 to-red-600/10',
                  borderColor: 'border-red-200/50',
                  description: 'Overdue loans'
                }
              ].map((stat, index) => (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ 
                    duration: 0.5, 
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 100
                  }}
                  whileHover={{ 
                    y: -5, 
                    scale: 1.02,
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.04)"
                  }}
                  className="group"
                  style={{ perspective: '1000px' }}
                >
                  <Card className={cn(
                    "relative overflow-hidden border-2 transition-all duration-300 hover:shadow-xl",
                    stat.bgGradient,
                    stat.borderColor
                  )}>
                    {/* Background gradient overlay */}
                    <div className={cn(
                      "absolute inset-0 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity",
                      stat.gradient
                    )} />
                    
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">
                        {stat.title}
                      </CardTitle>
                      <motion.div
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.5 }}
                        className={cn(
                          "p-2 rounded-full bg-gradient-to-r",
                          stat.gradient,
                          "text-white shadow-lg"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </motion.div>
                    </CardHeader>
                    
                    <CardContent>
                      <motion.div 
                        className="text-2xl font-bold text-slate-900 dark:text-white"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.1 + 0.3 }}
                      >
                        <AnimatedCounter 
                          value={stat.value} 
                          prefix={stat.prefix || ''}
                          suffix={stat.suffix || ''}
                        />
                      </motion.div>
                      
                      <div className="flex items-center justify-between mt-2">
                        <motion.span
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 + 0.5 }}
                          className={cn(
                            "text-xs font-medium px-2 py-1 rounded-full",
                            stat.change.startsWith('+') 
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300" 
                              : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
                          )}
                          )}
                        >
                          {stat.change}
                        </motion.span>
                      </div>
                      
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                        {stat.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              whileHover={{ y: -3, scale: 1.01 }}
            >
              <Card className="border-2 border-slate-200 dark:border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                    Quick Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      {
                        title: 'Total EMI Amount',
                        value: loans.reduce((sum, l) => sum + (l.emiAmount || 0), 0),
                        change: '+22%',
                        icon: Calculator,
                        gradient: 'from-purple-500 to-purple-600',
                        bgGradient: 'from-purple-500/10 to-purple-600/10',
                        borderColor: 'border-purple-200/50',
                        prefix: '$',
                        description: 'Total EMI per month'
                      },
                      {
                        title: 'Active EMI',
                        value: loans.filter(l => l.status === 'ACTIVE').length,
                        change: '+12%',
                        icon: Activity,
                        gradient: 'from-emerald-500 to-emerald-600',
                        bgGradient: 'from-emerald-500/10 to-emerald-600/10',
                        borderColor: 'border-emerald-200/50',
                        description: 'Monthly EMI payments'
                      },
                      {
                        title: 'Overdue Amount',
                        value: loans.filter(l => l.status === 'OVERDUE').reduce((sum, l) => sum + (l.emiAmount || 0), 0),
                        change: '-5%',
                        icon: AlertTriangle,
                        gradient: 'from-red-500 to-red-600',
                        bgGradient: 'from-red-500/10 to-red-600/10',
                        borderColor: 'border-red-200/50',
                        prefix: '$',
                        description: 'Total overdue amount'
                      }
                    ].map((stat, index) => (
                      <motion.div
                        key={stat.title}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ 
                          duration: 0.5, 
                          delay: index * 0.1,
                          type: "spring",
                          stiffness: 100
                        }}
                        whileHover={{ 
                          y: -5, 
                          scale: 1.02,
                          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.04)"
                        }}
                        className="group"
                        style={{ perspective: '1000px' }}
                      >
                        <Card className={cn(
                          "relative overflow-hidden border-2 transition-all duration-300 hover:shadow-xl",
                          stat.bgGradient,
                          stat.borderColor
                        )}>
                          {/* Background gradient overlay */}
                          <div className={cn(
                            "absolute inset-0 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity",
                            stat.gradient
                          )} />
                          
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">
                              {stat.title}
                            </CardTitle>
                            <motion.div
                              whileHover={{ rotate: 360, scale: 1.1 }}
                              transition={{ duration: 0.5 }}
                              className={cn(
                                "p-2 rounded-full bg-gradient-to-r",
                                stat.gradient,
                                "text-white shadow-lg"
                              )}
                            >
                              <Icon className="h-4 w-4" />
                            </motion.div>
                          </CardHeader>
                          
                          <CardContent>
                            <motion.div 
                              className="text-2xl font-bold text-slate-900 dark:text-white"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: index * 0.1 + 0.3 }}
                            >
                              <AnimatedCounter 
                                value={stat.value} 
                                prefix={stat.prefix || ''}
                                suffix={stat.suffix || ''}
                              />
                            </motion.div>
                            
                            <div className="flex items-center justify-between mt-2">
                              <motion.span
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 + 0.5 }}
                                className={cn(
                                  "text-xs font-medium px-2 py-1 rounded-full",
                                  stat.change.startsWith('+') 
                                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300" 
                                    : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
                                )}
                              )}
                              </motion.span>
                              
                              <div className="text-right">
                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                  {stat.change}
                                </span>
                              </div>
                            </div>
                            
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                              {stat.description}
                            </p>
                          </CardContent>
                        </Card>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* EMI Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              whileHover={{ y: -3, scale: 1.01 }}
            >
              <Card className="border-2 border-slate-200 dark:border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Calculator className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                    EMI Calculator
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Current EMI</Label>
                        <Input
                          type="number"
                          value={loans.reduce((sum, l) => sum + (l.emiAmount || 0), 0), 0)}
                          className="w-full"
                          placeholder="0.00"
                          readOnly
                          className="font-mono text-slate-900 dark:text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Monthly Payment</Label>
                        <Select
                          value={loans.reduce((sum, l) => sum + (l.emiAmount || 0), 0), 0)}
                          className="w-full"
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select payment method" />
                          <SelectContent>
                            <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                            <SelectItem value="DEBIT_CARD">Debit Card</SelectItem>
                            <SelectItem value="CASH">Cash</SelectItem>
                            <SelectItem value="SUBSCRIPTION">Subscription</SelectItem>
                          </SelectContent>
                        </Select>
                      </Select>
                      
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Remaining Balance</Label>
                        <span className="text-2xl font-bold text-slate-900 dark:text-white">
                          ${loans.reduce((sum, l) => sum + (l.emiAmount || 0), 0), 0)} / 
                          ${loans.reduce((sum, l) => sum + (l.emiAmount || 0), 0) / 
                          ${loans.reduce((sum, l) => sum + (l.emiAmount || 0), 0) / 
                          ${loans.reduce((sum, l) => sum + (l.emiAmount || 0), 0) / 
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            Balance: ${loans.reduce((sum, l) => sum + (l.emiAmount || 0), 0)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          <Progress 
                          value={getEMIInfo(loans)} 
                          className="h-2"
                          indicatorClassName={getProgressColor(getEMIInfo(loans))}
                        />
                        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {getEMIInfo(loans)?.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )
      )
    )
  )
}