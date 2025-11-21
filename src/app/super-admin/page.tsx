"use client";

import { SignedInUser } from "@/types/auth";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-client";

// Status Badge UI class
function getStatusBadgeClass(s: string) {
  if (!s) return "bg-gray-200 text-gray-600";
  const st = s.toLowerCase();
  switch (st) {
    case "active":
      return "bg-green-100 text-green-700";
    case "trial":
      return "bg-orange-100 text-orange-700";
    case "inactive":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-200 text-gray-600";
  }
}

export default function SuperAdminDashboard() {
  const [user, setUser] = useState<SignedInUser | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUser({
          id: data.user.id,
          email: data.user.email!,
          role: "SUPER_ADMIN",
        });
      }
    };
    fetchUser();
  }, []);

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-wide">
            System Overview
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Manage societies, automation, analytics and more
          </p>
        </div>

        <button className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium transition">
          + Add Society
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl p-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg">
          <span className="text-xl font-semibold">12</span>
          <p className="text-sm opacity-90">Registered Societies</p>
        </div>

        <div className="rounded-2xl p-6 bg-gradient-to-r from-blue-500 to-sky-500 text-white shadow-lg">
          <span className="text-xl font-semibold">$24,500</span>
          <p className="text-sm opacity-90">Total Revenue</p>
        </div>

        <div className="rounded-2xl p-6 bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg">
          <span className="text-xl font-semibold">4</span>
          <p className="text-sm opacity-90">Trial Running</p>
        </div>
      </div>

      {/* Table Header */}
      <div className="flex items-center justify-between mt-2">
        <h3 className="text-lg font-semibold text-gray-900">
          Registered Societies
        </h3>

        <input
          type="text"
          placeholder="Search..."
          className="border px-4 py-2 rounded-lg w-64 shadow-sm focus:ring-2 focus:ring-emerald-500 transition"
        />
      </div>

      {/* Table Box */}
      <div className="bg-white rounded-xl shadow p-4 border">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-600">
              <th className="py-3 px-3">Name</th>
              <th className="py-3 px-3">Plan</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3">Members</th>
              <th className="py-3 px-3">Revenue</th>
              <th className="py-3 px-3">Actions</th>
            </tr>
          </thead>

          <tbody className="text-gray-800">
            {/* Row 1 */}
            <tr className="border-t hover:bg-gray-50 transition">
              <td className="py-3 px-3 font-medium">Green Valley</td>
              <td className="px-3">PRO</td>
              <td className="px-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass("active")}`}>
                  Active
                </span>
              </td>
              <td className="px-3">240</td>
              <td className="px-3">$2,400</td>
              <td className="px-3">
                <button className="text-blue-600 hover:underline font-medium">
                  View
                </button>
              </td>
            </tr>

            {/* Row 2 */}
            <tr className="border-t hover:bg-gray-50 transition">
              <td className="py-3 px-3 font-medium">Sunshine Apts</td>
              <td className="px-3">TRIAL</td>
              <td className="px-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass("trial")}`}>
                  Trial
                </span>
              </td>
              <td className="px-3">120</td>
              <td className="px-3">$0</td>
              <td className="px-3">
                <button className="text-blue-600 hover:underline font-medium">
                  View
                </button>
              </td>
            </tr>

          </tbody>
        </table>
      </div>
    </div>
  );
}
