'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar,
  DollarSign,
  CreditCard,
  FileText,
  TrendingUp,
  TrendingDown,
  Shield,
  AlertCircle
} from 'lucide-react'

interface Loan {
  id: string
  member: string
  loanType: string
  amount: number
  interestRate: number
  tenure: number
  startDate: string
  endDate: string
  status: 'ACTIVE' | 'PAID' | 'CLOSED' | 'OVERDUE'
  dueDate: string
  paidAmount: number
  remainingBalance: number
  tags: string[]
  avatar?: string
  description?: string
}

interface LoansTableProps {
  loans: Loan[]
  onEdit: (loan: Loan) => void
  onDelete: (loanId: string) => void
  formatCurrency: (amount: number) => string
}

const LoansTable = ({ 
  loans, 
  onEdit, 
  onDelete, 
  formatCurrency 
}: LoansTableProps) => {
  const [sortField, setSortField] = useState<keyof Loan>('startDate')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')>

  const handleSort = (field: keyof Loan) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortedLoans = [...loans].sort((a, b) => {
    const aValue = a[sortField]
    const bValue = b[sortField]
    
    let comparison = 0
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      comparison = aValue.localeCompare(bValue)
    } else if (typeof aValue === 'number' && typeof bValue === 'number') {
      comparison = aValue - bValue
    }
    
    return sortDirection === 'asc' ? comparison : -comparison
  })

  const getStatusBadge = (status: string) => {
    const variants = {
      ACTIVE: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300',
      PAID: 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300',
      CLOSED: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
      OVERDUE: 'bg-slate-100 text-slate-800 dark:bg-slate-900/20 dark:text-slate-300'
    }
    return (
      <Badge className={variants[status as keyof typeof variants] || variants.ACTIVE}>
        {status}
      </Badge>
    )
  }

  const getLoanTypeBadge = (loanType: string) => {
    const variants = {
      'Personal Loan': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
      'Business Loan': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
      'Education Loan': 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300',
      'Home Loan': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
    }
    return (
      <Badge className={variants[loanType as keyof typeof variants] || variants['Personal Loan']}>
        {loanType}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getPaymentStatus = (paidAmount: number, totalAmount: number) => {
    const percentage = (paidAmount / totalAmount) * 100
    if (percentage >= 100) {
      return 'text-emerald-600 dark:text-emerald-400'
    } else if (percentage >= 75) {
      return 'text-emerald-600 dark:text-emerald-400'
    } else if (percentage >= 50) {
      return 'text-amber-600 dark:text-amber-400'
    } else if (percentage >= 25) {
      return 'text-yellow-600 dark:text-yellow-400'
    } else {
      return 'text-red-600 dark:text-red-400'
    }
  }

  return 'text-slate-600 dark:text-slate-400'
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-slate-200 dark:border-slate-700">
                <TableHead 
                  className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  onClick={() => handleSort('startDate')}
                >
                  <div className="flex items-center gap-2">
                    <span>Loan ID</span>
                    {sortField === 'startDate' && (
                      <span className="text-xs text-slate-400">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  onClick={() => handleSort('member')}
                >
                  <div className="flex items-center gap-2">
                    <span>Member</span>
                    {sortField === 'member' && (
                      <span className="text-xs text-slate-400">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  onClick={() => handleSort('loanType')}
                >
                  <div className="flex items-center gap-2">
                    <span>Loan Type</span>
                    {sortField === 'loanType' && (
                      <span className="text-xs text-slate-400">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center gap-2">
                    <span>Status</span>
                    {sortField === 'status' && (
                      <span className="text-xs text-slate-400">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  onClick={() => handleSort('dueDate')}
                >
                  <div className="flex items-center gap-2">
                    <span>Due Date</span>
                    {sortField === 'dueDate' && (
                      <span className="text-xs text-slate-400">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedLoans.map((loan, index) => (
                <motion.tr
                  key={loan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        {loan.avatar ? (
                          <img 
                            src={loan.avatar} 
                            alt={loan.name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {loan.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                        )}
                        {loan.status === 'ACTIVE' && (
                          <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-800" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-slate-900 dark:text-white">
                        {loan.name}
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        ID: {loan.id}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getLoanTypeBadge(loan.loanType)}
                  </TableCell>
                  <TableCell>
                    <div className="text-center">
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        {formatDate(loan.startDate)}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-500">
                        to {formatDate(loan.endDate)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-right">
                      <div className="text-sm font-medium text-slate-900 dark:text-white">
                        {formatCurrency(loan.amount)}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        / {formatCurrency(loan.remainingBalance)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-center">
                      {getPaymentStatus(loan.paidAmount, loan.amount)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-center">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        getPaymentStatus(loan.paidAmount, loan.amount)
                      }`}>
                        {Math.round((loan.paidAmount / loan.amount * 100)}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => onEdit(loan)}
                          className="flex items-center gap-2"
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="flex items-center gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDelete(loan.id)}
                          className="flex items-center gap-2 text-red-600 dark:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {loans.length === 0 && (
          <div className="text-center py-12">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full">
                <FileText className="h-8 w-8 text-slate-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                  No loans found
                </h3>
                <p className="text-slate-500 dark:text-slate-400">
                  Try adjusting your filters or add a new loan to get started.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default LoansTable