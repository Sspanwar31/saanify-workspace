'use client'

import { motion } from 'framer-motion'
import { 
  MoreHorizontal, 
  Eye, 
  Lock, 
  Unlock, 
  Trash2,
  Calendar,
  CreditCard
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

interface Client {
  id: string
  name: string
  adminName: string
  email: string
  phone: string
  status: 'TRIAL' | 'ACTIVE' | 'EXPIRED' | 'LOCKED'
  subscriptionPlan: 'TRIAL' | 'BASIC' | 'PRO' | 'ENTERPRISE'
  trialEndsAt?: string
  subscriptionEndsAt?: string
  createdAt: string
}

interface ClientsTableProps {
  clients: Client[]
  onAction: (action: string, clientId: string) => void
  onDelete: (clientId: string) => void
}

export function ClientsTable({ clients, onAction, onDelete }: ClientsTableProps) {
  const getStatusBadge = (status: string) => {
    const variants = {
      TRIAL: 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300',
      ACTIVE: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300',
      EXPIRED: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
      LOCKED: 'bg-slate-100 text-slate-800 dark:bg-slate-900/20 dark:text-slate-300'
    }
    
    return (
      <Badge className={variants[status as keyof typeof variants] || variants.TRIAL}>
        {status}
      </Badge>
    )
  }

  const getPlanBadge = (plan: string) => {
    const variants = {
      TRIAL: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
      BASIC: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
      PRO: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300',
      ENTERPRISE: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300'
    }
    
    return (
      <Badge className={variants[plan as keyof typeof variants] || variants.TRIAL}>
        {plan}
      </Badge>
    )
  }

  const getTrialDaysLeft = (trialEndsAt?: string) => {
    if (!trialEndsAt) return null
    
    const trialEnd = new Date(trialEndsAt)
    const today = new Date()
    const diffTime = trialEnd.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return null
    return `${diffDays} days left`
  }

  if (clients.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-slate-400 mb-2">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">No clients found</h3>
        <p className="text-slate-500 dark:text-slate-400">Get started by adding your first client.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Society Name</TableHead>
            <TableHead>Admin Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Subscription Plan</TableHead>
            <TableHead>Trial Info</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client, index) => (
            <motion.tr
              key={client.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50"
            >
              <TableCell>
                <div>
                  <div className="font-medium text-slate-900 dark:text-white">
                    {client.name}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    {client.adminName}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="text-slate-900 dark:text-white">{client.email}</div>
              </TableCell>
              <TableCell>
                <div className="text-slate-900 dark:text-white">{client.phone || '-'}</div>
              </TableCell>
              <TableCell>
                {getStatusBadge(client.status)}
              </TableCell>
              <TableCell>
                {getPlanBadge(client.subscriptionPlan)}
              </TableCell>
              <TableCell>
                {client.status === 'TRIAL' && client.trialEndsAt ? (
                  <div className="flex items-center gap-1 text-sm">
                    <Calendar className="h-3 w-3 text-amber-500" />
                    <span className="text-amber-600 dark:text-amber-400">
                      {getTrialDaysLeft(client.trialEndsAt)}
                    </span>
                  </div>
                ) : client.subscriptionEndsAt ? (
                  <div className="flex items-center gap-1 text-sm">
                    <CreditCard className="h-3 w-3 text-emerald-500" />
                    <span className="text-slate-600 dark:text-slate-400">
                      {new Date(client.subscriptionEndsAt).toLocaleDateString()}
                    </span>
                  </div>
                ) : (
                  <span className="text-slate-400">-</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    
                    {client.status === 'ACTIVE' ? (
                      <DropdownMenuItem onClick={() => onAction('lock', client.id)}>
                        <Lock className="mr-2 h-4 w-4" />
                        Lock Account
                      </DropdownMenuItem>
                    ) : client.status === 'LOCKED' ? (
                      <DropdownMenuItem onClick={() => onAction('unlock', client.id)}>
                        <Unlock className="mr-2 h-4 w-4" />
                        Unlock Account
                      </DropdownMenuItem>
                    ) : null}
                    
                    {client.status === 'TRIAL' && (
                      <DropdownMenuItem onClick={() => onAction('activate', client.id)}>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Activate Subscription
                      </DropdownMenuItem>
                    )}
                    
                    {client.status === 'ACTIVE' && (
                      <DropdownMenuItem onClick={() => onAction('expire', client.id)}>
                        <Calendar className="mr-2 h-4 w-4" />
                        Mark as Expired
                      </DropdownMenuItem>
                    )}
                    
                    <DropdownMenuItem 
                      onClick={() => onDelete(client.id)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Client
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </motion.tr>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}