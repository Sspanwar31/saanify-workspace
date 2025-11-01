'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  HandCoins, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Download,
  FileText,
  BarChart3,
  PieChart,
  Filter,
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import ClientNavigation from '@/components/client/ClientNavigation'
import ReportsTable from '@/components/client/ReportsTable'
import { 
  ReportItem, 
  ReportSummary, 
  ChartData,
  mockReports, 
  mockReportSummary, 
  mockChartData,
  formatCurrency,
  formatDate
} from '@/data/reportsData'

export default function ReportsPage() {
  const [loading, setLoading] = useState(true)
  const [reports, setReports] = useState<ReportItem[]>([])
  const [summary, setSummary] = useState<ReportSummary | null>(null)
  const [chartData, setChartData] = useState<ChartData | null>(null)
  const [dateRange, setDateRange] = useState('3months')
  const [reportType, setReportType] = useState('all')
  const [generatingReport, setGeneratingReport] = useState(false)

  // Simulate data loading
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setReports(mockReports)
      setSummary(mockReportSummary)
      setChartData(mockChartData)
      setLoading(false)
    }

    loadData()
  }, [])

  const handleGenerateReport = async () => {
    setGeneratingReport(true)
    
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    toast.success('📊 Report Generated Successfully!', {
      description: `Report for ${dateRange} has been generated.`,
      duration: 3000,
    })
    
    setGeneratingReport(false)
  }

  const handleExport = (format: 'csv' | 'pdf') => {
    toast.info(`📥 Exporting ${format.toUpperCase()}`, {
      description: `Your report is being exported as ${format.toUpperCase()}.`,
      duration: 2000,
    })
    
    // Simulate export
    setTimeout(() => {
      toast.success('✅ Export Complete!', {
        description: `Report exported successfully as ${format.toUpperCase()}.`,
        duration: 3000,
      })
    }, 1500)
  }

  const handleViewReport = (report: ReportItem) => {
    toast.info('📄 Report Details', {
      description: `Viewing details for ${report.type} report.`,
      duration: 2000,
    })
  }

  const handleRefresh = () => {
    setLoading(true)
    toast.info('🔄 Refreshing Data', {
      description: 'Fetching latest reports data...',
      duration: 2000,
    })
    
    setTimeout(() => {
      setReports(mockReports)
      setSummary(mockReportSummary)
      setChartData(mockChartData)
      setLoading(false)
      toast.success('✅ Data Updated', {
        description: 'Reports data has been refreshed.',
        duration: 2000,
      })
    }, 1000)
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
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex-1 space-y-6"
          >
            {/* Header */}
            <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Reports Dashboard
                </h1>
                <p className="text-muted-foreground mt-2">
                  Comprehensive insights and analytics for your society
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="w-full sm:w-40 bg-white/80 dark:bg-black/40 backdrop-blur-xl border-white/20 dark:border-white/10">
                    <SelectValue placeholder="Date Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1month">Last Month</SelectItem>
                    <SelectItem value="3months">Last 3 Months</SelectItem>
                    <SelectItem value="6months">Last 6 Months</SelectItem>
                    <SelectItem value="1year">Last Year</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger className="w-full sm:w-40 bg-white/80 dark:bg-black/40 backdrop-blur-xl border-white/20 dark:border-white/10">
                    <SelectValue placeholder="Report Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Reports</SelectItem>
                    <SelectItem value="financial">Financial</SelectItem>
                    <SelectItem value="members">Members</SelectItem>
                    <SelectItem value="loans">Loans</SelectItem>
                    <SelectItem value="maturity">Maturity</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  onClick={handleGenerateReport}
                  disabled={generatingReport}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {generatingReport ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Generate Report
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={handleRefresh}
                  disabled={loading}
                  className="bg-white/80 dark:bg-black/40 backdrop-blur-xl border-white/20 dark:border-white/10 hover:bg-white/90 dark:hover:bg-black/60"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </motion.div>

            {/* Summary Cards */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <Card key={i} className="border-0 shadow-xl bg-white/80 dark:bg-black/40 backdrop-blur-xl">
                    <CardContent className="p-6">
                      <Skeleton className="h-8 w-8 mb-4" />
                      <Skeleton className="h-6 w-24 mb-2" />
                      <Skeleton className="h-4 w-16" />
                    </CardContent>
                  </Card>
                ))
              ) : summary ? (
                <>
                  <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <Users className="h-8 w-8 text-emerald-100" />
                        <Badge className="bg-emerald-400 text-emerald-900">
                          +12%
                        </Badge>
                      </div>
                      <div className="text-2xl font-bold mb-1">
                        {summary.totalMembers.toLocaleString()}
                      </div>
                      <div className="text-emerald-100 text-sm">
                        Total Members
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <HandCoins className="h-8 w-8 text-blue-100" />
                        <Badge className="bg-blue-400 text-blue-900">
                          +8%
                        </Badge>
                      </div>
                      <div className="text-2xl font-bold mb-1">
                        {formatCurrency(summary.totalLoans)}
                      </div>
                      <div className="text-blue-100 text-sm">
                        Total Loans
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-xl bg-gradient-to-br from-green-500 to-green-600 text-white">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <TrendingUp className="h-8 w-8 text-green-100" />
                        <Badge className="bg-green-400 text-green-900">
                          +15%
                        </Badge>
                      </div>
                      <div className="text-2xl font-bold mb-1">
                        {formatCurrency(summary.totalIncome)}
                      </div>
                      <div className="text-green-100 text-sm">
                        Total Income
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-xl bg-gradient-to-br from-red-500 to-red-600 text-white">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <TrendingDown className="h-8 w-8 text-red-100" />
                        <Badge className="bg-red-400 text-red-900">
                          -5%
                        </Badge>
                      </div>
                      <div className="text-2xl font-bold mb-1">
                        {formatCurrency(summary.totalExpenses)}
                      </div>
                      <div className="text-red-100 text-sm">
                        Total Expenses
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <Calendar className="h-8 w-8 text-amber-100" />
                        <Badge className="bg-amber-400 text-amber-900">
                          3 Due
                        </Badge>
                      </div>
                      <div className="text-2xl font-bold mb-1">
                        {formatCurrency(summary.totalMaturityDue)}
                      </div>
                      <div className="text-amber-100 text-sm">
                        Maturity Due
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : null}
            </motion.div>

            {/* Charts Section */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Income vs Expense Chart */}
              <Card className="border-0 shadow-xl bg-white/80 dark:bg-black/40 backdrop-blur-xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-emerald-600" />
                      Income vs Expenses
                    </CardTitle>
                    <Badge variant="outline" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                      {dateRange}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-64 w-full" />
                  ) : (
                    <div className="h-64 flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-lg border-2 border-dashed border-emerald-200 dark:border-emerald-700">
                      <div className="text-center">
                        <BarChart3 className="h-12 w-12 text-emerald-600 dark:text-emerald-400 mx-auto mb-4" />
                        <p className="text-sm text-muted-foreground">
                          Interactive chart visualization will be displayed here
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Showing income and expense trends over time
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Loan Distribution Chart */}
              <Card className="border-0 shadow-xl bg-white/80 dark:bg-black/40 backdrop-blur-xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <PieChart className="h-5 w-5 text-blue-600" />
                      Loan Distribution
                    </CardTitle>
                    <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                      By Type
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-64 w-full" />
                  ) : (
                    <div className="h-64 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border-2 border-dashed border-blue-200 dark:border-blue-700">
                      <div className="text-center">
                        <PieChart className="h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
                        <p className="text-sm text-muted-foreground">
                          Pie chart visualization will be displayed here
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Showing loan distribution by category
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Reports Table */}
            <motion.div variants={itemVariants}>
              <ReportsTable
                reports={reports}
                loading={loading}
                onExport={handleExport}
                onView={handleViewReport}
              />
            </motion.div>

            {/* Period Info */}
            {summary && !loading && (
              <motion.div variants={itemVariants} className="text-center text-sm text-muted-foreground">
                <p>
                  Showing reports for <span className="font-semibold">{summary.period}</span>
                </p>
                <p className="mt-1">
                  Last updated: {formatDate(new Date().toISOString())}
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}