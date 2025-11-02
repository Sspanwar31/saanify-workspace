'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Plus, 
  CreditCard, 
  Users, 
  Clock, 
  CheckCircle, 
  RefreshCw,
  Search,
  TrendingUp
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import LoansTable from '@/components/client/LoansTable'
import AddLoanModal from '@/components/client/AddLoanModal'
import { 
  Loan, 
  LoanStats, 
  loansData as initialLoans, 
  getLoanStats, 
  formatCurrency 
} from '@/data/loansData'

export default function LoansPage() {
  const [loans, setLoans] = useState<Loan[]>([])
  const [filteredLoans, setFilteredLoans] = useState<Loan[]>([])
  const [stats, setStats] = useState<LoanStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setLoans(initialLoans)
      setFilteredLoans(initialLoans)
      setStats(getLoanStats(initialLoans))
      setLoading(false)
    }

    loadData()
  }, [])

  // Filter loans based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = loans.filter(loan =>
        loan.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.member.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.status.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredLoans(filtered)
    } else {
      setFilteredLoans(loans)
    }
  }, [searchTerm, loans])

  const handleAddLoan = () => {
    setEditingLoan(null)
    setIsModalOpen(true)
  }

  const handleEditLoan = (loan: Loan) => {
    setEditingLoan(loan)
    setIsModalOpen(true)
  }

  const handleSaveLoan = (savedLoan: Loan) => {
    if (editingLoan) {
      // Update existing loan
      setLoans(prev => prev.map(loan => 
        loan.id === savedLoan.id ? savedLoan : loan
      ))
      toast.success('✅ Loan Updated Successfully!', {
        description: `Loan for ${savedLoan.member} has been updated.`,
        duration: 3000,
      })
    } else {
      // Add new loan
      setLoans(prev => [...prev, savedLoan])
      toast.success('✅ Loan Added Successfully!', {
        description: `New loan for ${savedLoan.member} has been created.`,
        duration: 3000,
      })
    }
    
    // Update stats
    const updatedLoans = editingLoan 
      ? loans.map(loan => loan.id === savedLoan.id ? savedLoan : loan)
      : [...loans, savedLoan]
    setStats(getLoanStats(updatedLoans))
    
    setIsModalOpen(false)
    setEditingLoan(null)
  }

  const handleDeleteLoan = (loanId: string) => {
    const loanToDelete = loans.find(loan => loan.id === loanId)
    if (!loanToDelete) return

    // Delete loan
    setLoans(prev => prev.filter(loan => loan.id !== loanId))
    setStats(getLoanStats(loans.filter(loan => loan.id !== loanId)))
    
    toast.success('✅ Loan Deleted Successfully!', {
      description: `Loan for ${loanToDelete.member} has been deleted.`,
      duration: 3000,
    })
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    toast.info('🔄 Refreshing Data', {
      description: 'Fetching latest loans data...',
      duration: 2000,
    })
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setLoans(initialLoans)
    setFilteredLoans(initialLoans)
    setStats(getLoanStats(initialLoans))
    setRefreshing(false)
    
    toast.success('✅ Data Updated', {
      description: 'Loans data has been refreshed.',
      duration: 2000,
    })
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/50 via-teal-50/30 to-cyan-50/50 dark:from-emerald-950/20 dark:via-teal-950/10 dark:to-cyan-950/20 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:w-64 flex-shrink-0">
            <ClientNavigation />
          </div>

        {/* Main Content */}
        <motion.div
          >
            {/* Header */}
            <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Loans Management
                </h1>
                <p className="text-muted-foreground mt-2">
                  Manage and track all society loans efficiently
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search loans..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full sm:w-64 bg-white/80 dark:bg-black/40 backdrop-blur-xl border-white/20 dark:border-white/10"
                  />
                </div>
                
                <Button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  variant="outline"
                  className="bg-white/80 dark:bg-black/40 backdrop-blur-xl border-white/20 dark:border-white/10 hover:bg-white/90 dark:hover:bg-black/60"
                >
                  <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                </Button>

                <Button
                  onClick={handleAddLoan}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Loan
                </Button>
              </div>
            </motion.div>

            {/* Stats Cards */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <Card key={i} className="border-0 shadow-xl bg-white/80 dark:bg-black/40 backdrop-blur-xl">
                    <CardContent className="p-6">
                      <Skeleton className="h-8 w-8 mb-4" />
                      <Skeleton className="h-6 w-24 mb-2" />
                      <Skeleton className="h-4 w-16" />
                    </CardContent>
                  </Card>
                ))
              ) : stats ? (
                <>
                  <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <HandCoins className="h-8 w-8 text-emerald-100" />
                        <Badge className="bg-emerald-400 text-emerald-900">
                          Total
                        </Badge>
                      </div>
                      <div className="text-2xl font-bold mb-1">
                        {stats.totalLoans}
                      </div>
                      <div className="text-emerald-100 text-sm">
                        Total Loans
                      </div>
                      <div className="text-xs text-emerald-200 mt-2">
                        {formatCurrency(stats.totalAmount)}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <CheckCircle className="h-8 w-8 text-blue-100" />
                        <Badge className="bg-blue-400 text-blue-900">
                          Active
                        </Badge>
                      </div>
                      <div className="text-2xl font-bold mb-1">
                        {stats.activeLoans}
                      </div>
                      <div className="text-blue-100 text-sm">
                        Active Loans
                      </div>
                      <div className="text-xs text-blue-200 mt-2">
                        {stats.totalLoans > 0 ? Math.round((stats.activeLoans / stats.totalLoans) * 100) : 0}% of total
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <Clock className="h-8 w-8 text-amber-100" />
                        <Badge className="bg-amber-400 text-amber-900">
                          Pending
                        </Badge>
                      </div>
                      <div className="text-2xl font-bold mb-1">
                        {stats.pendingApprovals}
                      </div>
                      <div className="text-amber-100 text-sm">
                        Pending Approvals
                      </div>
                      <div className="text-xs text-amber-200 mt-2">
                        Require attention
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-xl bg-gradient-to-br from-gray-500 to-gray-600 text-white">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <TrendingUp className="h-8 w-8 text-gray-100" />
                        <Badge className="bg-gray-400 text-gray-900">
                          Closed
                        </Badge>
                      </div>
                      <div className="text-2xl font-bold mb-1">
                        {stats.closedLoans}
                      </div>
                      <div className="text-gray-100 text-sm">
                        Closed Loans
                      </div>
                      <div className="text-xs text-gray-200 mt-2">
                        Completed successfully
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : null}
            </motion.div>

            {/* Loans Table */}
            <motion.div variants={itemVariants}>
              <LoansTable
                loans={filteredLoans}
                loading={loading}
                onEdit={handleEditLoan}
                onDelete={handleDeleteLoan}
              />
            </motion.div>

            {/* Summary Info */}
            {!loading && stats && (
              <motion.div variants={itemVariants} className="text-center text-sm text-muted-foreground">
                <p>
                  Showing {filteredLoans.length} of {stats.totalLoans} total loans
                </p>
                <p className="mt-1">
                  Total value: {formatCurrency(stats.totalAmount)}
                </p>
              </motion.div>
            )
            )}
          </motion.div>
        </div>
      </div>

      {/* Add/Edit Loan Modal */}
      <AddLoanModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingLoan(null)
        }}
        onSave={handleSaveLoan}
        editingLoan={editingLoan}
      />
    </div>
  )
}