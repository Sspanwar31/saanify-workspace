'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  BookOpen, 
  Plus, 
  Search, 
  Download, 
  RefreshCw, 
  Filter,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  CreditCard,
  FileText
} from 'lucide-react'
import PassbookTable from '@/components/client/PassbookTable'
import AddTransactionModal from '@/components/client/AddTransactionModal'
import { transactionsData } from '@/data/transactionsData'
import { toast } from 'sonner'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function PassbookPage() {
  const [transactions, setTransactions] = useState(transactionsData)
  const [filteredTransactions, setFilteredTransactions] = useState(transactionsData)
  const [loading, setLoading] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState(null)
  
  // Filter states
  const [selectedMember, setSelectedMember] = useState<string>('all')
  const [dateRange, setDateRange] = useState<string>('all')
  const [paymentMode, setPaymentMode] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Get unique members for dropdown
  const uniqueMembers = Array.from(new Set(transactions.map(t => t.member))).sort()

  // Calculate summary statistics
  const summary = {
    totalDeposits: filteredTransactions.reduce((sum, t) => sum + t.depositAmount, 0),
    totalLoanInstallments: filteredTransactions.reduce((sum, t) => sum + t.loanInstallment, 0),
    totalInterest: filteredTransactions.reduce((sum, t) => sum + t.interest, 0),
    totalFines: filteredTransactions.reduce((sum, t) => sum + t.fine, 0),
    totalBalance: filteredTransactions.reduce((sum, t) => sum + t.balance, 0)
  }

  // Filter transactions
  useEffect(() => {
    let filtered = transactions

    // Filter by member
    if (selectedMember !== 'all') {
      filtered = filtered.filter(t => t.member === selectedMember)
    }

    // Filter by date range
    if (dateRange !== 'all') {
      const now = new Date()
      let startDate: Date | null = null

      switch (dateRange) {
        case '7days':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case '30days':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          break
        case '90days':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
          break
      }

      if (startDate) {
        filtered = filtered.filter(t => new Date(t.date) >= startDate)
      }
    }

    // Filter by payment mode
    if (paymentMode !== 'all') {
      filtered = filtered.filter(t => t.mode === paymentMode)
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.member.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredTransactions(filtered)
  }, [transactions, selectedMember, dateRange, paymentMode, searchTerm])

  const handleAddTransaction = (newTransaction: any) => {
    const transactionWithId = {
      ...newTransaction,
      id: `TXN${String(transactions.length + 1).padStart(4, '0')}`,
      date: newTransaction.date || new Date().toISOString().split('T')[0]
    }
    
    setTransactions([transactionWithId, ...transactions])
    toast.success('✅ Transaction Added', {
      description: `Transaction for ${newTransaction.member} has been added successfully`,
      duration: 3000
    })
  }

  const handleEditTransaction = (transaction: any) => {
    setEditingTransaction(transaction)
    setIsAddModalOpen(true)
  }

  const handleUpdateTransaction = (updatedTransaction: any) => {
    setTransactions(transactions.map(t => t.id === updatedTransaction.id ? updatedTransaction : t))
    toast.success('✅ Transaction Updated', {
      description: `Transaction for ${updatedTransaction.member} has been updated`,
      duration: 3000
    })
    setEditingTransaction(null)
    setIsAddModalOpen(false)
  }

  const handleDeleteTransaction = (transactionId: string) => {
    const transaction = transactions.find(t => t.id === transactionId)
    if (confirm(`Are you sure you want to delete this transaction for ${transaction?.member}?`)) {
      setTransactions(transactions.filter(t => t.id !== transactionId))
      toast.success('✅ Transaction Deleted', {
        description: `Transaction for ${transaction?.member} has been deleted`,
        duration: 3000
      })
    }
  }

  const handleRefresh = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      toast.success('🔄 Data Refreshed', {
        description: 'Transaction data has been refreshed',
        duration: 2000
      })
    }, 1000)
  }

  const handleExport = () => {
    toast.info('📊 Export Started', {
      description: 'Transaction data is being exported to CSV',
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
              📘 Passbook Transactions
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Manage member deposits, loan installments, and financial records
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
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700"
            >
              <Plus className="h-4 w-4" />
              Add Entry
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8"
      >
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Deposits</p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(summary.totalDeposits)}
                </p>
              </div>
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg">
                <TrendingUp className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Loan Installments</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(summary.totalLoanInstallments)}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Interest Earned</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {formatCurrency(summary.totalInterest)}
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Fines Collected</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {formatCurrency(summary.totalFines)}
                </p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
                <FileText className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Balance</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {formatCurrency(summary.totalBalance)}
                </p>
              </div>
              <div className="p-3 bg-slate-100 dark:bg-slate-900/20 rounded-lg">
                <BookOpen className="h-6 w-6 text-slate-600 dark:text-slate-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Summary Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 mb-6"
      >
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Income vs Expense Summary
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={[
              { name: 'Deposits', value: summary.totalDeposits, fill: '#10b981' },
              { name: 'Loan Installments', value: summary.totalLoanInstallments, fill: '#3b82f6' },
              { name: 'Interest', value: summary.totalInterest, fill: '#8b5cf6' },
              { name: 'Fines', value: summary.totalFines, fill: '#ef4444' }
            ]}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar dataKey="value" />
            </BarChart>
          </ResponsiveContainer>
        </div>
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
                placeholder="Search transactions by member or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={selectedMember} onValueChange={setSelectedMember}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="All Members" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Members</SelectItem>
              {uniqueMembers.map(member => (
                <SelectItem key={member} value={member}>{member}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
          <Select value={paymentMode} onValueChange={setPaymentMode}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Payment Mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Modes</SelectItem>
              <SelectItem value="Cash">Cash</SelectItem>
              <SelectItem value="Online">Online</SelectItem>
              <SelectItem value="Cheque">Cheque</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Transactions Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <PassbookTable
          transactions={filteredTransactions}
          onEdit={handleEditTransaction}
          onDelete={handleDeleteTransaction}
          formatCurrency={formatCurrency}
        />
      </motion.div>

      {/* Add Transaction Modal */}
      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false)
          setEditingTransaction(null)
        }}
        onSubmit={editingTransaction ? handleUpdateTransaction : handleAddTransaction}
        editingTransaction={editingTransaction}
        members={uniqueMembers}
      />
    </div>
  )
}