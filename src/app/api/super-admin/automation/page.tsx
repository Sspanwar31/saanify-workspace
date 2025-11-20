'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function AutomationPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<{ tasks: any[], logs: any[] }>({
    tasks: [],
    logs: []
  })

  // Data Fetching Function
  const fetchData = async () => {
    try {
      const res = await fetch('/api/super-admin/automation/data')
      const json = await res.json()
      
      if (!res.ok) throw new Error(json.error || 'Failed to fetch data')
      
      setData({
        tasks: json.tasks || [],
        logs: json.logs || []
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

  // Manual Run Function
  const runTask = async (taskName: string) => {
    toast.info(`Starting task: ${taskName}...`)
    try {
      // Yahan hum future me task run karne ki API call karenge
      // Abhi ke liye bas UI feedback
      await new Promise(r => setTimeout(r, 1000)) 
      toast.success('Task triggered successfully')
      fetchData() // Refresh logs
    } catch (e) {
      toast.error('Failed to run task')
    }
  }

  if (isLoading) return <div className="p-10 text-center">Loading Automation Dashboard...</div>

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Automation Center</h1>
        <button 
          onClick={fetchData}
          className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 text-sm"
        >
          Refresh Data
        </button>
      </div>

      {/* --- TASKS LIST --- */}
      <div className="bg-white rounded-xl shadow border p-6">
        <h2 className="text-xl font-semibold mb-4">Available Tasks</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 uppercase">
              <tr>
                <th className="px-4 py-3">Task Name</th>
                <th className="px-4 py-3">Schedule</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {data.tasks.length === 0 ? (
                <tr><td colSpan={4} className="p-4 text-center">No tasks defined</td></tr>
              ) : (
                data.tasks.map((task: any, i) => (
                  <tr key={i} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{task.task_name}</td>
                    <td className="px-4 py-3 font-mono text-xs">{task.schedule || 'Manual'}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                        Active
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button 
                        onClick={() => runTask(task.task_name)}
                        className="text-blue-600 hover:underline"
                      >
                        Run Now
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- LOGS LIST --- */}
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
              {data.logs.length === 0 ? (
                <tr><td colSpan={4} className="p-4 text-center">No logs yet</td></tr>
              ) : (
                data.logs.map((log: any, i) => (
                  <tr key={i} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500">
                      {log.run_time ? new Date(log.run_time).toLocaleString() : '-'}
                    </td>
                    <td className="px-4 py-3 font-medium">{log.task_name}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        log.status === 'ERROR' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs font-mono max-w-xs truncate">
                      {/* ✅ SAFE JSON RENDERING */}
                      {typeof log.details === 'object' ? JSON.stringify(log.details) : String(log.details || '')}
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
