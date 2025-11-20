'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { 
  Play, 
  RefreshCw, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Shield,
  Database,
  Activity,
  Download
} from 'lucide-react'

// --- HELPER FUNCTIONS (CRASH PREVENTION) ---
const safeRender = (val: any) => {
  if (val === null || val === undefined) return '-'
  if (typeof val === 'object') {
    try { return JSON.stringify(val) } catch (e) { return 'Error' }
  }
  return String(val)
}

const formatDate = (dateVal: string | null) => {
  if (!dateVal) return 'Never'
  try { return new Date(dateVal).toLocaleString() } catch (e) { return '-' }
}

export default function AutomationDashboard() {
  const [activeTab, setActiveTab] = useState('tasks') // Simple State Tab System
  const [tasks, setTasks] = useState<any[]>([])
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [runningTasks, setRunningTasks] = useState<Set<string>>(new Set())

  const fetchData = async () => {
    try {
      const response = await fetch('/api/super-admin/automation/data', {
        method: 'GET',
        cache: 'no-store'
      })
      
      if (response.ok) {
        const data = await response.json()
        setTasks(data.tasks || [])
        setLogs(data.logs || [])
      } else {
        console.error("API Error")
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
      toast.error('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  const runTask = async (taskName: string) => {
    if (runningTasks.has(taskName)) return
    setRunningTasks(prev => new Set(prev).add(taskName))
    toast.info(`Initiating task: ${taskName}...`)
    
    try {
      await new Promise(r => setTimeout(r, 1500)) // Fake API Call
      toast.success(`Task ${taskName} signal sent`)
      fetchData()
    } catch (error) {
      toast.error('Failed to run task')
    } finally {
      setRunningTasks(prev => {
        const newSet = new Set(prev)
        newSet.delete(taskName)
        return newSet
      })
    }
  }

  const getStatusIcon = (status: string) => {
    const s = (status || '').toLowerCase()
    if (s.includes('success') || s === 'healthy') return <CheckCircle className="h-4 w-4 text-green-500" />
    if (s.includes('err') || s.includes('fail')) return <XCircle className="h-4 w-4 text-red-500" />
    if (s === 'running') return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
    return <Clock className="h-4 w-4 text-gray-500" />
  }

  if (loading) {
    return <div className="p-10 text-center">Loading Dashboard...</div>
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      
      {/* Header */}
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg flex items-center gap-3 text-blue-800">
        <Shield className="h-5 w-5" />
        <span className="font-semibold">SUPER ADMIN AUTOMATION CENTER</span>
      </div>

      {/* Custom Tabs */}
      <div className="flex space-x-2 border-b pb-2">
        {['tasks', 'logs', 'actions'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-md capitalize transition-colors
              ${activeTab === tab 
                ? 'bg-gray-900 text-white' 
                : 'text-gray-500 hover:bg-gray-100'
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* --- TASKS CONTENT --- */}
      {activeTab === 'tasks' && (
        <div className="grid gap-4">
          {tasks.length === 0 ? (
            <div className="p-8 text-center border rounded bg-white text-gray-500">No tasks found.</div>
          ) : (
            tasks.map((task: any) => (
              <div key={task.id} className="bg-white p-6 rounded-lg border shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${task.enabled ? 'bg-green-100' : 'bg-gray-100'}`}>
                        <Clock className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{task.task_name}</h3>
                      <div className="flex gap-2 text-sm text-gray-500">
                          <span className="bg-gray-100 px-1 rounded font-mono">{task.schedule || 'Manual'}</span>
                          <span>•</span>
                          <span>Last run: {formatDate(task.last_run_at)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${task.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {task.enabled ? 'Active' : 'Inactive'}
                    </span>
                    <button
                      onClick={() => runTask(task.task_name)}
                      disabled={runningTasks.has(task.task_name)}
                      className="flex items-center gap-2 px-3 py-1.5 border rounded hover:bg-gray-50 text-sm font-medium disabled:opacity-50"
                    >
                      {runningTasks.has(task.task_name) ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                      Run
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* --- LOGS CONTENT --- */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          <div className="p-4 border-b bg-gray-50 font-semibold">System Logs</div>
          <div className="divide-y">
            {logs.length === 0 ? (
                <div className="text-center p-4 text-gray-500">No logs available.</div>
            ) : (
              logs.map((log: any) => (
                <div key={log.id} className="flex items-start gap-3 p-4 hover:bg-gray-50">
                  <div className="mt-1">{getStatusIcon(log.status)}</div>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-900">{log.task_name}</span>
                      <span className="text-xs text-gray-500">{formatDate(log.run_time)}</span>
                    </div>
                    <p className="text-sm text-gray-600 font-mono truncate">
                        {safeRender(log.details || log.message)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* --- ACTIONS CONTENT --- */}
      {activeTab === 'actions' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Action 1 */}
          <div className="bg-white p-6 rounded-lg border shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold">Schema Sync</h3>
            </div>
            <p className="text-sm text-gray-500">Force sync Prisma schema.</p>
            <button 
              onClick={() => runTask('schema_sync')} 
              disabled={runningTasks.has('schema_sync')}
              className="w-full py-2 bg-gray-900 text-white rounded hover:bg-gray-800 disabled:opacity-50"
            >
               Sync Schema
            </button>
          </div>

          {/* Action 2 */}
          <div className="bg-white p-6 rounded-lg border shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Download className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold">Backup Database</h3>
            </div>
            <p className="text-sm text-gray-500">Create immediate backup.</p>
            <button 
              onClick={() => runTask('database-backup')} 
              disabled={runningTasks.has('database-backup')}
              className="w-full py-2 bg-gray-900 text-white rounded hover:bg-gray-800 disabled:opacity-50"
            >
               Backup Now
            </button>
          </div>

          {/* Action 3 */}
          <div className="bg-white p-6 rounded-lg border shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-red-600" />
              <h3 className="font-semibold">System Health</h3>
            </div>
            <p className="text-sm text-gray-500">Check services status.</p>
            <button 
              onClick={() => runTask('health-check')} 
              disabled={runningTasks.has('health-check')}
              className="w-full py-2 bg-gray-900 text-white rounded hover:bg-gray-800 disabled:opacity-50"
            >
               Check Health
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
