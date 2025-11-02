'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Plus, 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  CreditCard, 
  Building2, 
  RefreshCw,
  FileText,
  BarChart3
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import ExpensesTable from '@/components/client/ExpensesTable'
import AddExpenseModal from '@/components/client/AddExpenseModal'
import { 
  Expense, 
  ExpenseStats, 
  expensesData as initialExpenses, 
  getExpenseStats,
  formatCurrency
} from '@/data/expensesData'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [stats, setStats] = useState<ExpenseStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setExpenses(initialExpenses)
      setStats(getExpenseStats(initialExpenses))
      setLoading(false)
    }

    loadData()
  }, [])

  const handleAddExpense = () => {
    setEditingExpense(null)
    setIsModalOpen(true)
  }

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense)
    setIsModalOpen(true)
  }

  const handleSaveExpense = (savedExpense: Expense) => {
    if (editingExpense) {
      // Update existing expense
      setExpenses(prev => prev.map(expense => 
        expense.id === savedExpense.id ? savedExpense : expense
      ))
      toast.success('✅ Expense Updated Successfully!', {
        description: `${savedExpense.category} expense of ${formatCurrency(savedExpense.amount)} has been updated.`,
        duration: 3000,
      })
    } else {
      // Add new expense
      setExpenses(prev => [...prev, savedExpense])
      toast.success('✅ Expense Added Successfully!', {
        description: `${savedExpense.category} expense of ${formatCurrency(savedExpense.amount)} has been added.`,
        duration: 3000,
      })
    }
    
    // Update stats
    const updatedExpenses = editingExpense 
      ? expenses.map(expense => expense.id === savedExpense.id ? savedExpense : expense)
      : [...expenses, savedExpense]
    setStats(getExpenseStats(updatedExpenses))
    
    setIsModalOpen(false)
    setEditingExpense(null)
  }

  const handleDeleteExpense = (expenseId: string) => {
    const expenseToDelete = expenses.find(expense => expense.id === expenseId)
    if (!expenseToDelete) return

    // Delete expense
    setExpenses(prev => prev.filter(expense => expense.id !== expenseId))
    setStats(getExpenseStats(expenses.filter(expense => expense.id !== expenseId)))
    
    toast.success('✅ Expense Deleted Successfully!', {
      description: `${expenseToDelete.category} expense of ${formatCurrency(expenseToDelete.amount)} has been removed.`,
      duration: 3000,
    })
  }

  const handleExport = (format: 'csv' | 'pdf') => {
    toast.info(`📥 Exporting ${format.toUpperCase()}`, {
      description: `Expense data is being exported as ${format.toUpperCase()}.`,
      duration: 2000,
    })
    
    setTimeout(() => {
      toast.success('✅ Export Complete!', {
        description: `Expense data exported successfully as ${format.toUpperCase()}.`,
        duration: 3000,
      })
    }, 1500)
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    toast.info('🔄 Refreshing Data', {
      description: 'Fetching latest expense data...',
      duration: 2000,
    })
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setExpenses(initialExpenses)
    setStats(getExpenseStats(initialExpenses))
    setRefreshing(false)
    
    toast.success('✅ Data Updated', {
      description: 'Expense data has been refreshed.',
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

  // Prepare chart data
  const categoryChartData = stats ? Object.entries(stats.categoryBreakdown).map(([category, amount]) => ({
    category,
    amount
  })) : []

  const pieChartData = stats ? Object.entries(stats.categoryBreakdown).map(([category, amount]) => ({
    name: category,
    value
  })) : []

  const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#6b7280']

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Expense Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Track and manage all society expenses efficiently
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            className="bg-white/80 dark:bg-black/40 backdrop-blur-xl border-white/20 dark:border-white/10 hover:bg-white/90 dark:hover:bg-black/60"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>

          <Button
            onClick={handleAddExpense}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Expense
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
                  <DollarSign className="h-8 w-8 text-emerald-100" />
                  <Badge className="bg-emerald-400 text-emerald-900">
                    Total
                  </Badge>
                </div>
                <div className="text-2xl font-bold mb-1">
                  {formatCurrency(stats.totalExpenses)}
                </div>
                <div className="text-emerald-100 text-sm">
                  Total Expenses
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Calendar className="h-8 w-8 text-blue-100" />
                  <Badge className="bg-blue-400 text-blue-900">
                    This Month
                  </Badge>
                </div>
                <div className="text-2xl font-bold mb-1">
                  {formatCurrency(stats.thisMonthExpenses)}
                </div>
                <div className="text-blue-100 text-sm">
                  This Month's Expenses
                </div>
                {stats.lastMonthExpenses > 0 && (
                  <div className="text-xs text-blue-200 mt-2">
                    {stats.thisMonthExpenses > stats.lastMonthExpenses ? '+' : ''}
                    {Math.round(((stats.thisMonthExpenses - stats.lastMonthExpenses) / stats.lastMonthExpenses) * 100)}% from last month
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Building2 className="h-8 w-8 text-purple-100" />
                  <Badge className="bg-purple-400 text-purple-900">
                    Top Category
                  </Badge>
                </div>
                <div className="text-2xl font-bold mb-1">
                  {stats.topCategory}
                </div>
                <div className="text-purple-100 text-sm">
                  {formatCurrency(stats.topCategoryAmount)}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <TrendingUp className="h-8 w-8 text-amber-100" />
                  <Badge className="bg-amber-400 text-amber-900">
                    Average
                  </Badge>
                </div>
                <div className="text-2xl font-bold mb-1">
                  {formatCurrency(stats.averageExpense)}
                </div>
                <div className="text-amber-100 text-sm">
                  Average Expense
                </div>
              </CardContent>
            </Card>
          </>
        ) : null}
      </motion.div>

      {/* Add/Edit Expense Modal */}
      <AddExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveExpense}
        editingExpense={editingExpense}
      />
    </motion.div>
  )
}