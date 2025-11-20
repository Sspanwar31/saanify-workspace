'use client'

import { useEffect, useState } from 'react'

export default function AutomationPage() {
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const debugFetch = async () => {
      try {
        console.log("Fetching Automation Data...")
        const res = await fetch('/api/super-admin/automation/data')
        const json = await res.json()
        
        // Console me data print karein taaki inspect karke dekh sakein
        console.log("✅ API DATA RECEIVED:", json)
        
        if (!res.ok) throw new Error(json.error || 'API Failed')
        
        setData(json)
      } catch (err: any) {
        console.error("❌ FETCH ERROR:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    debugFetch()
  }, [])

  if (loading) return <div className="p-10 text-blue-600">Loading Debug Data...</div>
  if (error) return <div className="p-10 text-red-600 font-bold">Error: {error}</div>

  return (
    <div className="p-6 font-mono text-sm">
      <h1 className="text-2xl font-bold mb-4 text-red-600">🛠️ Debug Mode</h1>
      <p className="mb-4">
        अगर आपको यह पेज दिख रहा है, तो इसका मतलब <strong>API सही चल रही है</strong>।
        <br />
        नीचे दिए गए Data में चेक करें कि क्या किसी Column में अजीब डेटा आ रहा है।
      </p>

      <div className="grid gap-6">
        {/* TASKS SECTION */}
        <section className="border p-4 rounded bg-gray-50">
          <h2 className="font-bold text-lg mb-2">Tasks Data (Raw JSON)</h2>
          <pre className="bg-black text-green-400 p-4 rounded overflow-auto max-h-60">
            {JSON.stringify(data.tasks, null, 2)}
          </pre>
        </section>

        {/* LOGS SECTION */}
        <section className="border p-4 rounded bg-gray-50">
          <h2 className="font-bold text-lg mb-2">Logs Data (Raw JSON)</h2>
          <pre className="bg-black text-green-400 p-4 rounded overflow-auto max-h-60">
            {JSON.stringify(data.logs, null, 2)}
          </pre>
        </section>
      </div>
    </div>
  )
}
