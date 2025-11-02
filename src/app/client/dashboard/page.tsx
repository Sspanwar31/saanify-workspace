'use client'

import { motion } from 'framer-motion'
import DashboardCards from '@/components/client/DashboardCards'
import IncomeExpenseChart from '@/components/client/IncomeExpenseChart'
import LoanPieChart from '@/components/client/LoanPieChart'
import RecentActivity from '@/components/client/RecentActivity'

export default function DashboardPage() {
  const clientName = "Society Admin"

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
          Client Dashboard – Welcome back, {clientName}
        </h1>
        <p className="text-muted-foreground mt-2">
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