'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  MoreHorizontal,
  Lock,
  Unlock,
  Trash2,
  Eye,
  Edit
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface SocietyAccount {
  id: string
  name: string
  adminEmail: string
  adminPhone: string | null
  status: 'TRIAL' | 'ACTIVE' | 'EXPIRED' | 'LOCKED'
  subscriptionPlan: 'TRIAL' | 'BASIC' | 'PRO' | 'ENTERPRISE'
  trialEndsAt: string | null
  subscriptionEndsAt: string | null
  totalMembers: number
  createdAt: string
  city: string | null
  state: string | null
}

interface ClientsTableProps {
  clients: SocietyAccount[]
  onAction: (action: string, clientId: string) => void
  onDelete: (clientId: string) => void
}

export default function ClientsTable({ clients, onAction, onDelete }: ClientsTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400'
      case 'TRIAL': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case 'EXPIRED': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      case 'LOCKED': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'ENTERPRISE': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
      case 'PRO': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400'
      case 'BASIC': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case 'TRIAL': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  const getTrialDaysLeft = (trialEndsAt: string | null) => {
    if (!trialEndsAt) return null
    const trialEnd = new Date(trialEndsAt)
    const now = new Date()
    const diffTime = trialEnd.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Society Name</TableHead>
          <TableHead>Admin Email</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Subscription</TableHead>
          <TableHead>Members</TableHead>
          <TableHead>Location</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {clients.map((client, index) => (
          <motion.tr
            key={client.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50"
          >
            <TableCell className="font-medium">
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {client.name}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  ID: {client.id.slice(0, 8)}...
                </div>
              </div>
            </TableCell>
            <TableCell>
              <div>
                <div className="font-medium">{client.adminEmail}</div>
                {client.status === 'TRIAL' && client.trialEndsAt && (
                  <div className="text-sm text-blue-600 dark:text-blue-400">
                    {getTrialDaysLeft(client.trialEndsAt)} days left
                  </div>
                )}
              </div>
            </TableCell>
            <TableCell>{client.adminPhone || '-'}</TableCell>
            <TableCell>
              <Badge className={getStatusColor(client.status)}>
                {client.status}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge className={getPlanColor(client.subscriptionPlan)}>
                {client.subscriptionPlan}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex items-center space-x-2">
                <span className="font-medium">{client.totalMembers}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">members</span>
              </div>
            </TableCell>
            <TableCell>
              {client.city && client.state ? (
                <div className="text-sm">
                  <div className="font-medium">{client.city}</div>
                  <div className="text-gray-500 dark:text-gray-400">{client.state}</div>
                </div>
              ) : (
                <span className="text-gray-400">-</span>
              )}
            </TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Client
                  </DropdownMenuItem>
                  {client.status === 'ACTIVE' ? (
                    <DropdownMenuItem onClick={() => onAction('lock', client.id)}>
                      <Lock className="w-4 h-4 mr-2" />
                      Lock
                    </DropdownMenuItem>
                  ) : client.status === 'LOCKED' ? (
                    <DropdownMenuItem onClick={() => onAction('unlock', client.id)}>
                      <Unlock className="w-4 h-4 mr-2" />
                      Unlock
                    </DropdownMenuItem>
                  ) : null}
                  <DropdownMenuItem 
                    onClick={() => onDelete(client.id)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </motion.tr>
        ))}
      </TableBody>
    </Table>
  )
}