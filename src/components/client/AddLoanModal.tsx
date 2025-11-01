'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  DollarSign, 
  CreditCard, 
  FileText,
  AlertCircle 
} from 'lucide-react'

interface Loan {
  id?: string
  member: string
  loanType: 'Personal Loan' | 'Business Loan' | 'Education Loan' | 'Home Loan'
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

interface AddLoanModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (loan: Loan) => void
  editingLoan?: Loan | null
  members: string[]
}

export default function AddLoanModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  editingLoan,
  members 
}: AddLoanModalProps) {
  const [formData, setFormData] = useState<Loan>({
    member: '',
    loanType: 'Personal Loan',
    amount: 0,
    interestRate: 0,
    tenure: 12, // months
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    status: 'ACTIVE',
    dueDate: '',
    paidAmount: 0,
    remainingBalance: 0,
    tags: [],
    description: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (editingLoan) {
      setFormData({
        ...editingLoan
      })
    } else {
      setFormData({
        member: '',
        loanType: 'Personal Loan',
        amount: 0,
        interestRate: 0,
        tenure: 12,
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        status: 'ACTIVE',
        dueDate: '',
        paidAmount: 0,
        remainingBalance: 0,
        tags: [],
        description: ''
      })
    }
    setErrors({})
  }, [editingLoan, isOpen])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.member.trim()) {
      newErrors.member = 'Member selection is required'
    }

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Loan amount must be greater than 0'
    }

    if (formData.interestRate < 0) {
      newErrors.interestRate = 'Interest rate must be 0 or greater'
    }

    if (formData.tenure < 1) {
      newErrors.tenure = 'Tenure must be at least 1 month'
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required'
    }

    if (!formData.endDate || (formData.endDate && new Date(formData.endDate) < new Date(formData.startDate)) {
      newErrors.endDate = 'End date must be after start date'
    }

    // Check if at least one field has a value
    const hasValidAmount = formData.amount > 0 || 
                          formData.interestRate > 0 || 
                          formData.fine > 0

    if (!hasValidAmount) {
      newErrors.amount = 'At least one amount field must be greater than 0'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('⚠️ Validation Error', {
        description: 'Please fix the errors in the form',
        duration: 3000
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Calculate end date based on tenure
      const startDate = new Date(formData.startDate)
      const endDate = new Date(startDate)
      endDate.setMonth(startDate.getMonth() + formData.tenure)
      
      const transactionData = {
        ...formData,
        endDate: endDate.toISOString().split('T')[0],
        balance: formData.amount - formData.paidAmount - formData.interest - formData.fine,
        id: editingLoan?.id || `L${String(members.length + 1).padStart(4, '0')}`
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      onSubmit(transactionData)
      onClose()
      
      toast.success('✅ Loan ' + (editingLoan ? 'Updated' : 'Added'), {
        description: `Loan for ${formData.member} has been ${editingLoan ? 'updated' : 'added'} successfully`,
        duration: 3000
      })
    } catch (error) {
      toast.error('❌ Error', {
        description: 'Failed to save loan. Please try again.',
        duration: 3000
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof Loan, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const calculateEndDate = () => {
    const startDate = new Date(formData.startDate)
    const endDate = new Date(startDate)
    endDate.setMonth(startDate.getMonth() + formData.tenure)
    return endDate.toISOString().split('T')[0]
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const calculateEMI = (principal: number, rate: number, tenure: number) => {
    const emi = rate / 100
    const monthlyRate = (1 + emi) ** 12 / 12
    return principal * Math.pow(monthlyRate, tenure)
  }

  const calculateMonthlyPayment = (principal: number, rate: number, tenure: number) => {
    const emi = rate / 100
    const monthlyRate = (1 + emi) ** 12 / 12
    return principal * monthlyRate
  }

  return {
    emi: calculateEMI(principal, rate, tenure),
    monthlyPayment: calculateMonthlyPayment(principal, rate, tenure),
    totalPayment: calculateMonthlyPayment(principal, rate, tenure) * tenure
  }
  }

  const getLoanSummary = () => {
    const loan = formData
    const emi = calculateEMI(loan.amount, loan.interestRate, loan.tenure)
    const monthlyPayment = calculateMonthlyPayment(loan.amount, loan.interestRate, loan.tenure)
    const totalPayment = monthlyPayment * loan.tenure
    const totalInterest = emi * loan.tenure
    const totalBalance = loan.amount - loan.paidAmount - loan.interest - loan.fine

    return {
      principal: loan.amount,
      interest: totalInterest,
      monthlyPayment,
      totalPayment,
      totalBalance,
      emi: `${(emi * 100).toFixed(2)}%`,
      tenure: `${loan.tenure} months`,
      rate: `${(rate * 100).toFixed(2)}%`
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                {editingLoan ? 'Edit Loan' : 'Add New Loan'}
              </DialogTitle>
              <DialogDescription>
                {editingLoan ? 'Update loan details below' : 'Fill in the details to add a new loan'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Member Selection */}
                <div className="space-y-2">
                  <Label htmlFor="member" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Member <span className="text-red-500">*</span>
                  </Label>
                  <Select 
                    value={formData.member} 
                    onValueChange={(value) => handleInputChange('member', value)}
                  >
                    <SelectTrigger className={errors.member ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select member" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Members</SelectItem>
                      {members.map(member => (
                        <SelectItem key={member}>{member}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.member && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.member}
                    </p>
                  )}
                </div>

                {/* Loan Details */}
                <div className="space-y-2">
                  <div className="space-y-2">
                    <Label htmlFor="loanType" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Loan Type <span className="text-red-500">*</span>
                    </Label>
                    <Select 
                      value={formData.loanType} 
                      onValueChange={(value: 'Personal Loan' | 'Business Loan' | 'Education Loan' | 'Home Loan'}
                    >
                      <SelectTrigger className={errors.loanType ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select loan type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Personal Loan">Personal Loan</SelectItem>
                        <SelectItem value="Business Loan">Business Loan</SelectItem>
                        <SelectItem value="Education Loan">Education Loan</SelectItem>
                        <SelectItem value="Home Loan">Home Loan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Amount and Interest */}
                <div className="space-y-2">
                  <div className="space-y-2">
                    <Label htmlFor="amount" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Loan Amount (₹) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0"
                      value={formData.amount || ''}
                      onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                      className={errors.amount ? 'border-red-500' : ''}
                    />
                    {errors.amount && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.amount}
                      </p>
                    )}
                  </div>
                </div>

                {/* Interest Rate */}
                <div className="space-y-2">
                  <div className="space-y-2">
                    <Label htmlFor="interestRate" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Interest Rate (% per annum) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="interestRate"
                      type="number"
                      placeholder="10"
                      value={formData.interestRate || ''}
                      onChange={(e) => handleInputChange('interestRate', parseFloat(e.target.value) || 0)}
                      className={errors.interestRate ? 'border-red-500' : ''}
                    />
                    {errors.interestRate && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.interestRate}
                      </p>
                    )}
                  </div>
                </div>

                {/* Tenure */}
                <div className="space-y-2">
                  <div className="space-y-2">
                    <Label htmlFor="tenure" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Tenure (months) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="tenure"
                      type="number"
                      min="1"
                      max="360"
                      value={formData.tenure || 12}
                      onChange={(e) => handleInputChange('tenure', parseInt(e.target.value) || 12)}
                      className={errors.tenure ? 'border-red-500' : ''}
                    />
                    {errors.tenure && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.tenure}
                      </p>
                    )}
                  </div>
                </div>

                {/* End Date */}
                <div className="space-y-2">
                  <div className="space-y-2">
                    <Label htmlFor="endDate" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      End Date <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate || ''}
                      onChange={(e) => {
                        handleInputChange('endDate', e.target.value)
                        calculateEndDate()
                      }}
                      className={errors.endDate ? 'border-red-500' : ''}
                    />
                    {errors.endDate && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.endDate}
                      </p>
                    )}
                  </div>
                </div>

                {/* Mode */}
                <div className="space-y-2">
                  <div className="space-y-2">
                    <Label htmlFor="mode" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Payment Mode <span className="text-red-500">*</span>
                    </Label>
                    <Select 
                      value={formData.mode} 
                      onValueChange={(value: 'Cash' | 'Online' | 'Cheque'}
                    >
                      <SelectTrigger className={errors.mode ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select payment mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cash">Cash</SelectItem>
                        <SelectItem value="Online">Online</SelectItem>
                        <SelectItem value="Cheque">Cheque</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Description <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Monthly fee, loan payment, etc."
                    value={formData.description || ''}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className={errors.description ? 'border-red-500' : ''}
                    rows={3}
                    className={errors.description ? 'border-red-500' : ''}
                  />
                </div>

                {/* Current Balance Preview */}
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                    Balance Preview
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">Deposit:</span>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {formatCurrency(formData.depositAmount)}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">Deductions:</span>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {formatCurrency(formData.loanInstallment + formData.interest + formData.fine)}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">Balance:</span>
                      <p className={`font-medium ${
                        formData.balance >= 0 
                          ? 'text-emerald-600 dark:text-emerald-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {formatCurrency(formData.balance)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-b-2 border-white border-transparent bg-emerald-600/20 border-emerald-600/20 border-emerald-600/40 border-emerald-600/60 border-emerald-600/80" text-white" />
                      <span className="ml-2">Processing...</span>
                    </>
                  ) : (
                    <>
                      {editingTransaction ? 'Update Loan' : 'Add Loan'}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </AnimatePresence>
  )
}

export default AddTransactionModal