'use client'

import { motion } from 'framer-motion'
import DashboardCards from '@/components/client/DashboardCards'
import IncomeExpenseChart from '@/components/client/IncomeExpenseChart'
import LoanPieChart from '@/components/client/LoanPieChart'
import RecentActivity from '@/components/client/RecentActivity'

export default function DashboardPage() {
  const clientName = "Society Admin"

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 md:p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
          Client Dashboard – Welcome back, {clientName}
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Here's what's happening with your society today.
        </p>
      </motion.div>

      {/* Dashboard Content */}
      <div className="space-y-8">
        {/* Cards Grid */}
        <DashboardCards />

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <IncomeExpenseChart />
          <LoanPieChart />
        </div>

        {/* Recent Activity */}
        <RecentActivity />
      </div>
    </div>
  )
}