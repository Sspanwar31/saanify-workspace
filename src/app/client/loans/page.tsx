'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  BookOpen, 
  Plus, 
  Download, 
  RefreshCw, 
  Filter,
  DollarSign,
  CreditCard,
  FileText,
  TrendingUp,
  TrendingDown
} from 'lucide-react'
import LoansTable from '@/components/client/LoansTable'
import AddLoanModal from '@/components/client/AddLoanModal'
import { loansData } from '@/data/loansData'
import { toast } from 'sonner'

export default function LoansPage() {
  const [loans, setLoans] = useState(loansData)
  const [filteredLoans, setFilteredLoans] = useState(loansData)
  const [loading, setLoading] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingLoan, setEditingLoan] = useState(null)

  // Calculate summary statistics
  const summary = {
    totalLoans: loans.length,
    totalLoanAmount: loans.reduce((sum, loan) => sum + loan.loanAmount, 0),
    totalInterest: loans.reduce((sum, loan) => sum + (loan.loanAmount * loan.interestRate / 100), 0),
    totalInstallments: loans.reduce((sum, loan) => sum + loan.totalInstallments, 0),
    paidInstallments: loans.reduce((sum, loan) => sum + loan.paidInstallments, 0),
    pendingLoans: loans.filter(loan => loan.status === 'PENDING').length,
    approvedLoans: loans.filter(loan => loan.status === 'APPROVED').length
  }

  // Filter loans based on search
  const filteredLoans = loans.filter(loan => {
    const matchesSearch = loan.member.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         loan.id.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const handleAddLoan = (newLoan: any) => {
    const loanWithId = {
      ...newLoan,
      id: `L${String(loans.length + 1).padStart(4, '0')}`,
      status: 'PENDING',
      paidInstallments: 0,
      totalInstallments: Math.floor(newLoan.totalInstallments),
      joinDate: new Date().toISOString().split('T')[0]
    }
    
    setLoans([loanWithId, ...loans])
    toast.success('✅ Loan Application Added', {
      description: `Loan application for ${newLoan.member} has been submitted for review`,
      duration: 3000
    })
  }

  const handleEditLoan = (loan: any) => {
    setEditingLoan(loan)
    setIsAddModalOpen(true)
  }

  const handleUpdateLoan = (updatedLoan: any) => {
    setLoans(loans.map(l => l.id === updatedLoan.id ? updatedLoan : l))
    toast.success('✅ Loan Updated', {
      description: `Loan for ${updatedLoan.member} has been updated`,
      duration: 3000
    })
    setEditingLoan(null)
    setIsAddModalOpen(false)
  }

  const handleDeleteLoan = (loanId: string) => {
    const loan = loans.find(l => l.id === loanId)
    if (confirm(`Are you sure you want to delete loan ${loan?.id} for ${loan?.member}?`)) {
      setLoans(loans.filter(l => l.id !== loanId))
      toast.success('✅ Loan Deleted', {
        description: `Loan ${loan?.id} has been deleted`,
        duration: 3000
      })
    }
  }

  const handleRefresh = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      toast.success('🔄 Data Refreshed', {
        description: 'Loan data has been refreshed',
        duration: 2000
      })
    }, 1000)
  }

  const handleExport = () => {
    toast.info('📊 Export Started', {
      description: 'Loan data is being exported to CSV',
      duration: 3000
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      PENDING: 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300',
      APPROVED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300',
      ACTIVE: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
    }
    return (
      <Badge className={variants[status as keyof typeof variants] || variants.PENDING}>
        {status}
      </Badge>
    )
  }

  const getInterestRateBadge = (rate: number) => {
    if (rate <= 10) {
      return <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300">
        {rate}%
      </Badge>
    } else if (rate <= 15) {
      return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
        {rate}%
      </Badge>
    } else {
      return <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300">
        {rate}%
      </Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 md:p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-emerald-600" />
              📘 Loan Management
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Manage member loans, installments, and financial operations
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="outline"
              onClick={handleExport}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-6 py-3 rounded-lg"
            >
              <Plus className="h-4 w-4" />
              Add New Loan
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Loans</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {summary.totalLoans}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-100 dark:bg-emerald-900/20 rounded-lg">
                <TrendingUp className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Approved Loans</p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {summary.approvedLoans}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Pending Loans</p>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {summary.pendingLoans}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-amber-100 dark:bg-amber-900/20 rounded-lg">
                <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Inactive Loans</p>
                <p className="text-2xl font-bold text-slate-600 dark:text-white">
                  {summary.inactiveLoans}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-900/20 rounded-lg">
                <AlertCircle className="h-6 w-6 text-slate-600 dark:text-slate-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Balance</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {formatCurrency(summary.totalBalance)}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${
                summary.totalBalance >= 0 
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20' 
                  : 'bg-red-100 text-red-800 dark:bg-red-900/20'
                } rounded-lg`}>
                  {summary.totalBalance >= 0 ? (
                    <TrendingUp className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 mb-6"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search loans by member or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedMember} onValueChange={setSelectedMember}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All Members" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Members</SelectItem>
                {Array.from(new Set(loans.map(loan => loan.member)).sort().map(member => (
                  <SelectItem key={member}>{member}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </motion.div>

      {/* Transactions Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <LoansTable
          loans={filteredLoans}
          onEdit={handleEditLoan}
          onDelete={handleDeleteLoan}
          formatCurrency={formatCurrency}
          getStatusBadge={getStatusBadge}
          getInterestRateBadge={getInterestRateBadge}
        />
      </motion.div>

      {/* Add Loan Modal */}
      <AddLoanModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false)
          setEditingLoan(null)
        }}
        onSubmit={editingLoan ? handleUpdateLoan : handleAddLoan}
        editingLoan={editingLoan}
        members={Array.from(new Set(loans.map(loan => loan.member)).sort())}
      />
    </div>
  )
}