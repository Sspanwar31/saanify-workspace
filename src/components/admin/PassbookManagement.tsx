'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  Calendar, 
  CreditCard, 
  DollarSign, 
  TrendingUp,
  FileText,
  Download,
  Upload,
  RefreshCw,
  BarChart3,
  PieChart,
  Activity,
  ArrowUpRight,
  Filter,
  Plus,
  Shield,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Transaction {
  id: string
  memberId: string
  type: 'CREDIT' | 'DEBIT' | 'INTEREST' | 'FINE' | 'MAINTENANCE'
  amount: number
  description: string
  date: string
  category: string
  reference?: string
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'DEFAULT'
  createdBy: string
  createdAt: string
}

interface MaturityRecord {
  id: string
  loanId: string
  maturityDate: string
  originalAmount: number
  currentBalance: number
  interestAccrued: number
  totalPayable: number
  status: 'PENDING' | 'COMPLETED' | 'PARTIAL'
  paidAmount: number
  remainingAmount: number
  notes?: string
}

interface FinancialStats {
  totalBalance: number
  monthlyIncome: number
  monthlyExpenses: number
  totalRevenue: number
  pendingTransactions: number
  completedTransactions: number
  failedTransactions: number
  totalDisbursed: number
  activeSubscriptions: number
  totalLoans: number
  activeLoans: number
  loanDisbursed: number
}

interface PassbookProps {
  transactions: Transaction[]
  stats: FinancialStats
  onAction: (action: string, transactionId: string) => void
  onEdit: (transaction: PassbookTransaction) => void
  onDelete: (transactionId: string) => void
  loading?: boolean
}

export function PassbookManagement({ transactions, stats, onAction, onEdit, onDelete, loading = false }: PassbookProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('date')
  const [renewDialog, setRenewDialog] = useState(false)
  const [editDialog, setEditDialog] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; transaction: PassbookTransaction | null }>({ open: false, transaction: null })
  const [filterDialog, setFilterDialog] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<PassbookTransaction | null>(null)

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(transaction => {
        const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.category.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesType = selectedType === 'all' || transaction.type === selectedType
        const matchesStatus = selectedStatus === 'all' || transaction.status === selectedStatus
        return matchesSearch && matchesType && matchesStatus
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'date':
            return new Date(b.date).getTime() - new Date(a.date).getTime()
          case 'amount':
            return b.amount - a.amount
          case 'type':
            return a.type.localeCompare(b.type)
          default:
            return 0
        }
      })
  }, [transactions, searchTerm, selectedType, selectedStatus, sortBy])

  const getTransactionType = (type: string) => {
    const types = {
      CREDIT: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 border-blue-200',
      DEBIT: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300 border-red-200',
      INTEREST: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300 border-purple-200',
      FINE: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300 border-orange-200',
      MAINTENANCE: 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300 border-amber-200'
    }
    
    return (
      <Badge className={cn(types[type as keyof typeof types] || types.CREDIT, 'font-medium')}>
        {type}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: {
        currency: 'INR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }
    }).format(amount)
  }

  const getDaysRemaining = (endDate?: string) => {
    if (!endDate) return null
    
    const today = new Date()
    const diffTime = new Date(endDate).getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 24))
    
    if (diffDays < 0) return 'Expired'
    return `${diffDays} days left`
  }

  const getProgressColor = (percentage: number, status: string) => {
    if (status === 'FAILED' || percentage === 0) return 'bg-slate-300'
    if (percentage > 60) return 'bg-emerald-500'
    if (percentage > 30) return 'bg-amber-500'
    return 'bg-red-500'
  }

  return (
    <Progress 
      value={percentage} 
      className="h-2"
      indicatorClassName={getProgressColor(percentage, status)}
    />
  )

  const handleQuickAction = (action: string, transactionId: string) => {
    switch (action) {
      case 'view':
        toast.info('Transaction Details', {
          description: 'Opening transaction details...',
          duration: 2000,
        })
        break
      case 'edit':
        handleEdit(transactions.find(t => t.id === transactionId)!)
        break
      case 'delete':
        setDeleteDialog({ open: true, transaction: transactions.find(t => t.id === transactionId) })
        break
      case 'settle':
        handleStatusChange(transactionId, 'SETTLED')
        break
      case 'refund':
        handleStatusChange(transactionId, 'REFUNDED')
        break
      default:
        break
    }
  }

  const confirmDelete = async () => {
    if (deleteDialog.transaction) {
      try {
        // Mock API call to delete transaction
        toast.success('Transaction deleted successfully', {
          description: `${deleteDialog.transaction.description} has been removed.`,
          duration: 3000,
        })
        
        // Update local state
        setTransactions(prev => 
          prev.filter(t => t.id !== deleteDialog.transaction.id)
        )
        
        setDeleteDialog({ open: false, transaction: null })
      } catch (error) {
      toast.error('Failed to delete transaction', {
        description: 'Please try again.',
        duration: 3000,
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <Input
                    placeholder="Search transactions by description, amount, or reference..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-3">
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="CREDIT">Credit</SelectItem>
                    <SelectItem value="DEBIT">Debit</SelectItem>
                    <SelectItem value="INTEREST">Interest</SelectItem>
                    <SelectItem value="FINE">Fine</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={selectedStatus} onValueChange={setSelectedStatus}}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="EXPIRED">EXPIRED</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={sortBy} onValueChange={setSortBy}}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="role">Role</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                    <SelectItem value="joinedAt">Joined Date</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={applyFilter}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Reset
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Transactions Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-2 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Financial Overview
                </h2>
                <Badge variant="outline" className="text-sm">
                  {filteredTransactions.length} transactions
                </Badge>
              </CardHeader>
          </CardHeader>
          <CardContent className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"
                />
              </div>
            ) : filteredTransactions.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="text-center py-12"
              >
                <div className="text-slate-400 mb-4">
                  <FileText className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No transactions found</h3>
                <p className="text-slate-500 dark:text-slate-400">Get started by adding your first transaction.</p>
              </motion.div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                      <TableHead className="font-semibold">Date</TableHead>
                      <TableHead className="font-semibold">Description</TableHead>
                      <TableHead className="font-semibold">Category</TableHead>
                      <TableHead className="font-semibold">Amount</TableHead>
                      <TableHead className="font-semibold">Type</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((transaction, index) => (
                      <motion.tr
                        key={transaction.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className={cn(
                          "border-b border-slate-200 dark:border-slate-700 transition-all duration-200",
                          index % 2 === 0 ? "bg-white dark:bg-slate-900" : "bg-slate-50/50 dark:bg-slate-800/70",
                          "hover:bg-slate-100 dark:hover:bg-slate-800/70"
                        )}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                              <CreditCard className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <div className="font-medium text-slate-900 dark:text-white">
                                {transaction.description}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-slate-900 dark:text-white">
                            {formatDate(transaction.date)}
                          </TableCell>
                        <TableCell>
                          <div className="text-right">
                            <div className="flex items-center gap-2">
                              <span className={cn(
                                "text-xs font-medium px-2 py-1 rounded-full",
                                getAmountColor(transaction.type, transaction.status)
                              )}>
                                {getTransactionType(transaction.type)}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleQuickAction('view', transaction.id)}
                              className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/20"
                            >
                              <Eye className="h-4 w-4 text-blue-600" />
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleQuickAction('edit', transaction.id)}
                              className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                              <Edit className="h-4 w-4 text-slate-600" />
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleQuickAction('settle', transaction.id)}
                              className="h-8 w-8 p-0 hover:bg-amber-100 dark:hover:bg-amber-900/20"
                            >
                              <AlertTriangle className="h-4 w-4 text-amber-600" />
                              Settle
                            </Button>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-800"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleQuickAction('view', transaction.id)}>
                                    <Eye className="mr-2 h-4 w-4 text-blue-600" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleQuickAction('edit', transaction.id)}>
                                    <Edit className="mr-2 h-4 w-4 text-slate-600" />
                                    Edit Transaction
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleQuickAction('settle', transaction.id)}>
                                    <AlertTriangle className="mr-2 h-4 w-4 text-amber-600" />
                                    Settle
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleQuickAction('expire', transaction.id)}>
                                    <Calendar className="mr-2 h-4 w-4 text-red-600" />
                                    Expire
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => handleQuickAction('refund', transaction.id)} 
                                    className="text-red-600 focus:text-red-600"
                                  >
                                    Refund
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </div>
          </motion.div>
      </div>
    </div>
  )
}