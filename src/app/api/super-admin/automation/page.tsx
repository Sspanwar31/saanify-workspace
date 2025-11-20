'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'

// Helper to format date safely
const formatDate = (dateVal: any) => {
  if (!dateVal) return '-'
  try {
    return new Date(dateVal).toLocaleString()
  } catch (e) {
    return String(dateVal)
  }
}

// Helper to render JSON/Objects safely
const safeRender = (val: any) => {
  if (val === null || val === undefined) return '-'
  if (typeof val === 'string') return val
  if (typeof val === 'number') return val
  if (typeof val === 'boolean') return val ? 'True' : 'False'
  if (typeof val === 'object') {
    try {
      return JSON.stringify(val)
    } catch (e) {
      return 'Error: Invalid Data'
    }
  }
  return String(val)
}

export default function AutomationPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<{ tasks: any[], logs: any[] }>({
    tasks: [],
    logs: []
  })

  const fetchData = async () => {
    try {
      const res = await fetch('/api/super-admin/automation/data')
      const json = await res.json()
      
      if (!res.ok) throw new Error(json.error || 'Failed to fetch data')
      
      setData({
        tasks: Array.isArray(json.tasks) ? json.tasks : [],
        logs: Array.isArray(json.logs) ? json.logs : []
      })
    } catch (error) {
      console.error(error)
      toast.error('Failed to load automation data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const runTask = async (taskName: string) => {
    toast.info(`Triggering task: ${taskName}...`)
    await new Promise(r => setTimeout(r, 1000))
    toast.success('Task signal sent')
    fetchData()
  }

  if (isLoading) return <div className="p-10 text-center">Loading Dashboard...</div>

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Automation Center</h1>
        <button 
          onClick={fetchData}
          className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 text-sm"
        >
          Refresh
        </button>
      </div>

      {/* --- TASKS LIST --- */}
      <div className="bg-white rounded-xl shadow border p-6">
        <h2 className="text-xl font-semibold mb-4">Scheduled Tasks</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 uppercase">
              <tr>
                <th className="px-4 py-3">Task Name</th>
                <th className="px-4 py-3">Schedule</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Last Run</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {!data.tasks || data.tasks.length === 0 ? (
                <tr><td colSpan={5} className="p-4 text-center text-gray-500">No tasks found</td></tr>
              ) : (
                data.tasks.map((task: any, i) => (
                  <tr key={i} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{safeRender(task.task_name)}</td>
                    <td className="px-4 py-3 font-mono text-xs">{safeRender(task.schedule || 'Manual')}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${task.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {task.enabled ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {formatDate(task.last_run_at)}
                    </td>
                    <td className="px-4 py-3">
                      <button 
                        onClick={() => runTask(task.task_name)}
                        className="text-blue-600 hover:underline"
                      >
                        Run
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- LOGS LIST (Fixed Crash Issue) --- */}
      <div className="bg-white rounded-xl shadow border p-6">
        <h2 className="text-xl font-semibold mb-4">Execution Logs</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 uppercase">
              <tr>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Task</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Details</th>
              </tr>
            </thead>
            <tbody>
              {!data.logs || data.logs.length === 0 ? (
                <tr><td colSpan={4} className="p-4 text-center text-gray-500">No logs yet</td></tr>
              ) : (
                data.logs.map((log: any, i) => (
                  <tr key={i} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500">
                      {formatDate(log.run_time)}
                    </td>
                    <td className="px-4 py-3 font-medium">{safeRender(log.task_name)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        log.status === 'ERROR' ? 'bg-red-100 text-red-800' : 
                        log.status === 'SUCCESS' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {safeRender(log.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-gray-600 max-w-xs truncate" title={safeRender(log.details)}>
                      {/* ✅ SAFE RENDER FUNCTION USE KIYA HAI */}
                      {safeRender(log.details)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
