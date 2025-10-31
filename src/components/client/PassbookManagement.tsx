'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Calendar, 
  CreditCard, 
  Download, 
  Upload,
  RefreshCw,
  TrendingUp,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Activity,
  DollarSign,
  Edit,
  RefreshCw,
  Lock,
  Unlock,
  Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Loan {
  id: string
  memberId: string
  loanType: 'PERSONAL' | 'HOME' | 'BUSINESS' | 'EMERGENCY' | 'FIXED'
  amount: number
  interestRate: number
  tenure: number
  startDate: string
  endDate: string
  status: 'PENDING' | 'ACTIVE' | 'EXPIRED' | 'FIXED'
  dueDate?: string
  createdAt: string
  totalPaid?: number
  remainingBalance?: number
  lastPaymentDate?: string
  tags: string[]
  notes?: string
}

interface LoansManagementProps {
  societyInfo: {
    id: string
    name: string
    status: 'TRIAL' | 'ACTIVE' | 'EXPIRED' | 'LOCKED'
    subscriptionPlan: 'TRIAL' | 'BASIC' | 'PRO' | 'ENTERPRISE'
    adminName: string
    adminEmail: string
    adminPhone: string
    address?: string
    totalMembers?: number
    totalLoans?: number
    totalSavings?: number
  }
}

interface LoanModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onClose: () => void
  loan?: Loan | null
  type?: 'PERSONAL' | 'HOME' | 'BUSINESS' | 'EMERGENCY' | 'FIXED'
  memberId?: string
  societyId: string
}

interface EnhancedActionsDropdownProps {
  client: Loan
  onAction: (action: string, clientId: string) => void
  onDelete: (clientId: string) => void
  onRenew: (clientId: string, plan: string) => void
}

interface EnhancedActionsDropdownProps {
  client: Loan
  onAction: (action: string, clientId: string) => void
  onDelete: (clientId: string) => void
  onRenew: (clientId: string, plan: string) => void
}

export function LoansManagement({ societyInfo }: LoansManagementProps) {
  const [loans, setLoans] = useState<Loan[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('date-desc')
  const [isRenewDialog, setRenewDialog] = useState(false)
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null)
  const [editDialog, setEditDialog] = useState<{
    open: boolean
    loan: Loan | null
    type?: 'PERSONAL' | 'HOME' | 'BUSINESS' | 'EMERGENCY' | 'FIXED'
    memberId?: string
    societyId: string
  }>({ open: isRenewDialog, onOpenChange: setRenewDialog(false), loan, type, societyId })
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    action: string
    title: string
    description: string
    icon: React.ReactNode
    variant: 'default' | 'destructive'
  } | null>(null)

  const fetchLoans = async () => {
    try {
      setLoading(true)
      // In a real app, this would fetch from the API
      // For now, use mock data
      setTimeout(() => {
        const mockLoans: Loan[] = [
          {
            id: '1',
            memberId: '1',
            name: 'John Doe',
            email: 'john.doe@example.com',
            phone: '+1 (555) 123-4567',
            loanType: 'PERSONAL',
            amount: 5000,
            interestRate: 12,
            tenure: 24, // months
            startDate: '2024-01-15',
            endDate: '2024-12-31',
            status: 'ACTIVE',
            dueDate: '2024-12-31',
            totalPaid: 4500,
            remainingBalance: 500,
            tags: ['education', 'home loan'],
            notes: 'Monthly payment received'
          },
          {
            id: '2',
            memberId: '2',
            name: 'Jane Smith',
            email: 'jane.smith@example.com',
            phone: '+1 (555) 987-6543',
            loanType: 'HOME',
            amount: 15000,
            interestRate: 8,
            tenure: 12, // months
            startDate: '2024-02-01',
            endDate: '2025-02-01',
            status: 'ACTIVE',
            dueDate: '2025-02-01',
            totalPaid: 14000,
            remainingBalance: 1000,
            tags: ['business loan', 'equipment'],
            notes: 'Equipment purchase'
          },
          {
            id: '3',
            memberId: '3',
            name: 'Bob Johnson',
            email: 'bob.johnson@example.com',
            phone: '+1 (555) 234-678',
            loanType: 'BUSINESS',
            amount: 25000,
            interestRate: 15,
            tenure: 36, // months
            startDate: '2024-03-15',
            endDate: '2025-03-15',
            status: 'ACTIVE',
            dueDate: '2025-03-15',
            totalPaid: 22000,
            remainingBalance: 3000,
            tags: ['expansion', 'working capital']
          },
          {
            id: '4',
            memberId: '4',
            name: 'Mary Williams',
            email: 'mary.williams@example.com',
            phone: '+1 (555) 345-678',
            loanType: 'PERSONAL',
            amount: 8000,
            interestRate: 10,
            tenure: 24, // months
            startDate: '2024-04-01',
            endDate: '2024-04-01',
            status: 'ACTIVE',
            dueDate: '2024-04-01',
            totalPaid: 7200,
            remainingBalance: 2800,
            tags: ['education', 'home improvement']
          }
        ]
      ]
      
      setLoans(mockLoans)
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch loans:', error)
      toast.error('Failed to load loans')
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      ACTIVE: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300 border-emerald-200',
      TRIAL: 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300 border-amber-200',
      EXPIRED: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300 border-red-200',
      LOCKED: 'bg-slate-100 text-slate-800 dark:bg-slate-900/20 dark:text-slate-300 border-slate-200'
    }
    
    return (
      <Badge className={cn(variants[status as keyof typeof variants] || variants.ACTIVE, 'font-medium')}>
        {status}
      </Badge>
    )
  }

  const getPlanBadge = (plan: string) => {
    const variants = {
      TRIAL: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 border-blue-200',
      BASIC: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300 border-purple-200',
      PRO: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300 border-indigo-200',
      ENTERPRISE: 'bg-teal-100 text-teal-800 dark:bg-teal-900/20 dark:text-teal-300 border-teal-200'
    }
    
    return (
      <Badge className={cn(variants[plan as keyof typeof variants] || variants.TRIAL, 'font-medium')}>
        {plan}
      </Badge>
    )
  }

  const getDaysLeft = (endDate?: string) => {
    if (!endDate) return null
    
    const now = new Date()
    const diffTime = endDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 24))
    
    if (diffDays < 0) return null
    return { daysLeft, percentage: Math.max(0, Math.min(100, (diffDays / 365) * 100)) }
  }

  const getProgressColor = (status: string, daysLeft: number | null) => {
    if (status === 'EXPIRED' || daysLeft === null) return 'bg-slate-300'
    if (daysLeft !== null && daysLeft <= 30) return 'bg-red-500'
    if (daysLeft <= 90) return 'bg-amber-500'
    return 'bg-emerald-500'
  }

  const getMaturityStatus = (loan: Loan) => {
    if (!loan.endDate) return { status: 'NO_END_DATE', color: 'bg-slate-300' }
    
    const now = new Date()
    const diffTime = loan.endDate.getTime() - now.getTime()
    const daysLeft = Math.ceil(diffTime / (1000 * 60 * 24))
    
    if (daysLeft < 0) return { status: 'EXPIRED', color: 'bg-red-500' }
    if (daysLeft <= 30) return { status: 'DUE_SOON', color: 'bg-orange-500' }
    if (daysLeft <= 90) return { status: 'ACTIVE', color: 'bg-emerald-500' }
    return { status: 'HEALTHY', color: 'bg-teal-500' }
  }

  const getInterestColor = (rate: number) => {
    if (rate <= 5) return 'bg-red-500'
    if (rate <= 10) return 'bg-amber-500'
    if (rate <= 15) return 'bg-yellow-500'
    return 'bg-emerald-500'
  }

  return getRemainingDaysDisplay = (daysLeft: number | null) => {
    if (!daysLeft) return <span className="text-slate-400">No end date</span>
    
    if (daysLeft <= 7) {
      return (
        <span className="text-sm font-medium px-2 py-1 rounded-full bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300">
          {daysLeft} days left
        </span>
      )
    }
    
    if (daysLeft <= 30) {
      return (
        <span className="text-sm font-medium px-2 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
          {daysLeft} days left
        </span>
      )
    }
    
    return (
      <span className="text-sm font-medium px-2 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300">
        {daysLeft} days left
      </span>
    )
  }

  return (
    <span className="text-sm text-slate-400">
      {daysLeft} days left
    </span>
  )
}

  const getPlanDuration = (plan: string) => {
    const durations = {
      TRIAL: '30 days',
      BASIC: '1 month',
      PRO: '3 months',
      ENTERPRISE: '12 months'
    }
    return durations[plan as keyof typeof durations] || '1 month'
  }

  return (
    <span className="text-xs text-slate-500">
      {getPlanDuration(plan)}
    </span>
  )

  return (
    <span className="text-xs text-slate-400">
      Created: {new Date(societyInfo?.createdAt).toLocaleDateString()}
    </span>
  )

  const handleQuickActions = (loan: Loan, action: string) => {
    const actions = {
      view: () => window.open(`/admin/clients/${loan.id}`),
      edit: () => handleEditLoan(loan),
      lock: () => handleLockLoan(loan.id),
      unlock: () => handleUnlockLoan(loan.id),
      delete: () => handleDeleteLoan(loan.id),
      renew: () => handleRenewLoan(loan)
    }
    
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          
          <DropdownMenuContent align="end" className="w-56">
            {actions.map((action) => (
              <DropdownMenuItem
                onClick={() => action.action()}
                className={cn(
                  action.variant === 'delete' ? 'text-red-600 focus:text-red-600' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                )}
                className="cursor-pointer"
              >
                {action.icon}
                <span>{action.label}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    </DropdownMenu>
  )
}

export function TransactionModal({ open, onOpenChange, onClose, onClose, transaction, type, memberId, societyId }: TransactionModalProps) {
  const [formData, setFormData] = useState({
    amount: transaction?.amount || 0,
    description: transaction?.description || '',
    type: type || 'credit',
    memberId: memberId || '',
    societyId: societyId
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Amount must be greater than 0')
      return
    }

    if (!formData.description) {
      toast.error('Description is required')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          societyId,
          type: type.toUpperCase(),
          status: 'PENDING'
        })
      })

      if (response.ok) {
        toast.success('Transaction created successfully')
        onOpenChange(false)
        onClose()
        setFormData({
          amount: '',
          description: '',
          type: 'credit',
          memberId: '',
          societyId: ''
        })
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to create transaction')
      }
    } catch (error) {
      console.error('Error creating transaction:', error)
      toast.error('Failed to create transaction')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
    <AddTransactionModal
      open={open}
      onOpenChange={onOpenChange}
      onClose={onClose}
      transaction={transaction}
      type={type}
      memberId={memberId}
      societyId={societyId}
    />
    
    <EnhancedActionsDropdown
      actions={[
        {
          label: 'View Details',
          icon: <Eye className="h-4 w-4" />,
          action: 'view',
          onClick: () => handleQuickActions(loan)
        },
        {
          label: 'Edit Loan',
          icon: <Edit className="h-4 w-4" />,
          action: 'edit',
          onClick: () => handleEditLoan(loan)
        },
        {
          label: loan.status === 'ACTIVE' ? 'Lock Account' : 'Unlock Account',
          icon: loan.status === 'ACTIVE' ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />,
          action: loan.status === 'ACTIVE' ? 'lock' : 'unlock',
          onClick: () => handleLockLoan(loan.id)
        },
        {
          label: loan.status === 'PENDING' ? 'Activate' : 'Mark as Expired',
          icon: <Calendar className="h-4 w-4" />,
          action: loan.status === 'PENDING' ? 'activate' : 'expire',
          onClick: () => handleActivateLoan(loan.id)
        },
        {
          label: 'Delete',
          icon: <Trash2 className="h-4 w-4 text-red-600" />,
          action: 'delete',
          onClick: () => handleDeleteLoan(loan.id)
        }
      ]}
      onBulkAction={handleBulkAction}
    />
    
    <EnhancedActionsDropdown
      actions={[
        {
          label: 'View Details',
          icon: <Eye className="h-4 w-4" />,
          action: 'view',
          onClick: () => handleQuickActions(loan)
        },
        {
          label: loan.status === 'ACTIVE' ? 'Lock Account' : 'Unlock Account',
          icon: loan.status === 'ACTIVE' ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />,
          action: loan.status === 'ACTIVE' ? 'lock' : 'unlock',
          onClick: () => handleLockLoan(loan.id)
        },
        {
          label: loan.status === 'EXPIRED' ? 'Reactivate' : 'Mark as Expired',
          icon: <Calendar className="h-4 w-4" />,
          action: loan.status === 'EXPIRED' ? 'reactivate' : 'expire',
          onClick: () => handleReactivateLoan(loan.id)
        },
        {
          label: 'Delete',
          icon: <Trash2 className="h-4 w-4 text-red-600" />,
          action: 'delete',
          onClick: () => handleDeleteLoan(loan.id)
        }
      ]}
      onBulkAction={handleBulkAction}
    />
    </>
  )
}