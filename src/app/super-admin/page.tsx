// src/app/super-admin/page.tsx
"use client"

import { useEffect, useState } from "react"
import { Loader2, CheckCircle, XCircle, CircleDashed } from "lucide-react"

type Society = {
  id: string
  name: string
  status: string | null
  createdAt: string
}

export default function SuperAdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [societies, setSocieties] = useState<Society[]>([])

  useEffect(() => {
    fetch("/api/super-admin/societies")
      .then((res) => res.json())
      .then((data) => {
        setSocieties(data || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const getStatusBadgeClass = (s: string | null) => {
    if (!s) return "bg-gray-200 text-gray-600"
    const st = s.toLowerCase()
    if (st === "active") return "bg-green-100 text-green-700"
    if (st === "inactive") return "bg-red-100 text-red-700"
    return "bg-yellow-100 text-yellow-700"
  }

  const getStatusIcon = (s: string | null) => {
    if (!s) return <CircleDashed className="h-4 w-4 text-gray-600" />
    const st = s.toLowerCase()
    if (st === "active") return <CheckCircle className="h-4 w-4 text-green-600" />
    if (st === "inactive") return <XCircle className="h-4 w-4 text-red-600" />
    return <CircleDashed className="h-4 w-4 text-yellow-600" />
  }

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">
        Super Admin Dashboard
      </h1>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="animate-spin h-6 w-6 text-indigo-600" />
        </div>
      ) : societies.length === 0 ? (
        <p className="text-gray-500 text-center mt-10">No societies found.</p>
      ) : (
        <div className="bg-white shadow-lg rounded-xl p-4 border border-gray-200">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="p-3 text-left font-semibold text-gray-700">Name</th>
                <th className="p-3 text-left font-semibold text-gray-700">Status</th>
                <th className="p-3 text-left font-semibold text-gray-700">Created At</th>
              </tr>
            </thead>

            <tbody>
              {societies.map((soc) => (
                <tr key={soc.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{soc.name}</td>

                  <td className="p-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(soc.status)}`}>
                      {getStatusIcon(soc.status)}
                      {soc.status ?? "Unknown"}
                    </span>
                  </td>

                  <td classname="p-3 text-sm text-gray-600">
                    {new Date(soc.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
