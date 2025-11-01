'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Plus, 
  Users, 
  Shield, 
  UserCheck, 
  UserX, 
  RefreshCw,
  Search,
  Crown,
  TrendingUp,
  Mail,
  Key
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import ClientNavigation from '@/components/client/ClientNavigation'
import UserTable from '@/components/client/UserTable'
import AddUserModal from '@/components/client/AddUserModal'
import { 
  User, 
  UserStats, 
  usersData as initialUsers, 
  getUserStats 
} from '@/data/usersData'

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setUsers(initialUsers)
      setFilteredUsers(initialUsers)
      setStats(getUserStats(initialUsers))
      setLoading(false)
    }

    loadData()
  }, [])

  // Filter users based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone?.includes(searchTerm)
      )
      setFilteredUsers(filtered)
    } else {
      setFilteredUsers(users)
    }
  }, [searchTerm, users])

  const handleAddUser = () => {
    setEditingUser(null)
    setIsModalOpen(true)
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setIsModalOpen(true)
  }

  const handleSaveUser = (savedUser: User) => {
    if (editingUser) {
      // Update existing user
      setUsers(prev => prev.map(user => 
        user.id === savedUser.id ? savedUser : user
      ))
      toast.success('✅ User Updated Successfully!', {
        description: `${savedUser.name} has been updated.`,
        duration: 3000,
      })
    } else {
      // Add new user
      setUsers(prev => [...prev, savedUser])
      toast.success('✅ User Added Successfully!', {
        description: `${savedUser.name} has been added as ${savedUser.role}.`,
        duration: 3000,
      })
    }
    
    // Update stats
    const updatedUsers = editingUser 
      ? users.map(user => user.id === savedUser.id ? savedUser : user)
      : [...users, savedUser]
    setStats(getUserStats(updatedUsers))
    
    setIsModalOpen(false)
    setEditingUser(null)
  }

  const handleDeleteUser = (userId: string) => {
    const userToDelete = users.find(user => user.id === userId)
    if (!userToDelete) return

    // Delete user
    setUsers(prev => prev.filter(user => user.id !== userId))
    setStats(getUserStats(users.filter(user => user.id !== userId)))
    
    toast.success('✅ User Deleted Successfully!', {
      description: `${userToDelete.name} has been removed from the system.`,
      duration: 3000,
    })
  }

  const handleBulkAction = (action: string, userIds: string[]) => {
    if (action === 'delete') {
      const usersToDelete = userIds.map(id => users.find(u => u.id === id))
      if (usersToDelete.length > 0) {
        const userNames = usersToDelete.map(u => u.name).join(', ')
        if (confirm(`Are you sure you want to delete these users?\n\n${userNames}\n\nThis action cannot be undone.`)) {
          // Delete users
          setUsers(prev => prev.filter(user => !userId.includes(user.id)))
          setStats(getUserStats(prev.filter(user => !userId.includes(user.id)))
          
          toast.success('✅ Users Deleted Successfully!', {
            description: `${usersToDelete.length} users have been deleted.`,
            duration: 3000,
          })
        }
      }
    } else if (action === 'activate') {
      const usersToActivate = userIds.map(id => users.find(u => u.id === id))
      if (usersToActivate.length > 0) {
        // Update users to active status
        setUsers(prev => prev.map(user => 
          userIds.includes(user.id) 
            ? { ...user, status: 'Active' }
            : user
        ))
        setStats(getUserStats(users))
        
        toast.success('✅ Users Activated Successfully!', {
          description: `${usersToActivate.length} users have been activated.`,
          duration: 3000,
        })
      }
    } else if (action === 'deactivate') {
      const usersToDeactivate = userIds.map(id => users.find(u => u.id === id))
      if (usersToDeactivate.length > 0) {
        // Update users to inactive status
        setUsers(prev => prev.map(user => 
          userIds.includes(user.id) 
            ? { ...user, status: 'Inactive' }
            : user
        ))
        setStats(getUserStats(users))
        
        toast.success('✅ Users Deactivated Successfully!', {
          description: `${usersToDeactivate.length} users have been deactivated.`,
          duration: 3000,
        })
      }
    }
  }

  const handleExport = (format: 'csv' | 'pdf') => {
    toast.info(`📥 Exporting ${format.toUpperCase()}`, {
      description: `User data is being exported as ${format.toUpperCase()}.`,
      duration: 2000,
    })
    
    setTimeout(() => {
      toast.success('✅ Export Complete!', {
        description: `User data exported successfully as ${format.toUpperCase()}.`,
        duration: 3000,
      })
    }, 1500)
  }

  const handleResetPassword = (user: User) => {
    toast.info('🔑 Password Reset', {
      description: `Password reset link has been sent to ${user.email}.`,
      duration: 3000,
    })
  }

  const handleInviteUser = (user: User) => {
    toast.info('📧 Invitation Sent', {
      description: `Invitation has been sent to ${user.email}.`,
      duration: 3000,
    })
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    toast.info('🔄 Refreshing Data', {
      description: 'Fetching latest user data...',
      duration: 2000,
    })
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setUsers(initialUsers)
    setFilteredUsers(initialUsers)
    setStats(getUserStats(initialUsers))
    setRefreshing(false)
    
    toast.success('✅ Data Updated', {
      description: 'User data has been refreshed.',
      duration: 2000,
    })
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
                  User Management
                </h1>
                <p className="text-muted-foreground mt-2">
                  Manage Admins, Treasurers, and Members efficiently
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full sm:w-64 bg-white/80 dark:bg-black/40 backdrop-blur-xl border-white/20 dark:border-white/10"
                  />
                </div>
                
                <Button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  variant="outline"
                  className="bg-white/80 dark:bg-black/40 backdrop-blur-xl border-white/20 dark:border-white/10 hover:bg-white/90 dark:hover:bg-black/60"
                >
                  <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                </Button>

                <Button
                  onClick={handleAddUser}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </div>
            </motion.div>

            {/* Stats Cards */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <Card key={i} className="border-0 shadow-xl bg-white/80 dark:bg-black/40 backdrop-blur-xl">
                    <CardContent className="p-6">
                      <Skeleton className="h-8 w-8 mb-4" />
                      <Skeleton className="h-6 w-24 mb-2" />
                      <Skeleton className="h-4 w-16" />
                    </CardContent>
                  </Card>
                ))
              ) : stats ? (
                <>
                  <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <Users className="h-8 w-8 text-emerald-100" />
                        <Badge className="bg-emerald-400 text-emerald-900">
                          Total
                        </Badge>
                      </div>
                      <div className="text-2xl font-bold mb-1">
                        {stats.totalUsers}
                      </div>
                      <div className="text-emerald-100 text-sm">
                        Total Users
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <UserCheck className="h-8 w-8 text-blue-100" />
                        <Badge className="bg-blue-400 text-blue-900">
                          Active
                        </Badge>
                      </div>
                      <div className="text-2xl font-bold mb-1">
                        {stats.activeUsers}
                      </div>
                      <div className="text-blue-100 text-sm">
                        Active Users
                      </div>
                      <div className="text-xs text-blue-200 mt-2">
                        {stats.totalUsers > 0 ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}% active
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <Crown className="h-8 w-8 text-purple-100" />
                        <Badge className="bg-purple-400 text-purple-900">
                          Admins
                        </Badge>
                      </div>
                      <div className="text-2xl font-bold mb-1">
                        {stats.admins}
                      </div>
                      <div className="text-purple-100 text-sm">
                        Administrators
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <TrendingUp className="h-8 w-8 text-amber-100" />
                        <Badge className="bg-amber-400 text-amber-900">
                          Finance
                        </Badge>
                      </div>
                      <div className="text-2xl font-bold mb-1">
                        {stats.treasurers}
                      </div>
                      <div className="text-amber-100 text-sm">
                        Treasurers
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-xl bg-gradient-to-br from-teal-500 to-teal-600 text-white">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <Shield className="h-8 w-8 text-teal-100" />
                        <Badge className="bg-teal-400 text-teal-900">
                          Members
                        </Badge>
                      </div>
                      <div className="text-2xl font-bold mb-1">
                        {stats.members}
                      </div>
                      <div className="text-teal-100 text-sm">
                        Society Members
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-xl bg-gradient-to-br from-green-500 to-green-600 text-white">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <Mail className="h-8 w-8 text-green-100" />
                        <Badge className="bg-green-400 text-green-900">
                          New
                        </Badge>
                      </div>
                      <div className="text-2xl font-bold mb-1">
                        {stats.newUsersThisMonth}
                      </div>
                      <div className="text-green-100 text-sm">
                        This Month
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-xl bg-gradient-to-br from-red-500 to-red-600 text-white">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <UserX className="h-8 w-8 text-red-100" />
                        <Badge className="bg-red-400 text-red-900">
                          Inactive
                        </Badge>
                      </div>
                      <div className="text-2xl font-bold mb-1">
                        {stats.inactiveUsers}
                      </div>
                      <div className="text-red-100 text-sm">
                        Inactive Users
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <RefreshCw className="h-8 w-8 text-orange-100" />
                        <Badge className="bg-orange-400 text-orange-900">
                          Pending
                        </Badge>
                      </div>
                      <div className="text-2xl font-bold mb-1">
                        {stats.usersWithPendingTasks}
                      </div>
                      <div className="text-orange-100 text-sm">
                        Need Attention
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : null}
            </motion.div>

            {/* Users Table */}
            <motion.div variants={itemVariants}>
              <UserTable
                users={filteredUsers}
                loading={loading}
                onEdit={handleEditUser}
                onDelete={handleDeleteUser}
                onResetPassword={handleResetPassword}
                onInviteUser={handleInviteUser}
                onExport={handleExport}
                onBulkAction={handleBulkAction}
              />
            </motion.div>

            {/* Summary Info */}
            {!loading && stats && (
              <motion.div variants={itemVariants} className="text-center text-sm text-muted-foreground">
                <p>
                  Showing {filteredUsers.length} of {stats.totalUsers} total users
                </p>
                <p className="mt-1">
                  {stats.activeUsers} active, {stats.inactiveUsers} inactive
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Add/Edit User Modal */}
      <AddUserModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingUser(null)
        }}
        onSave={handleSaveUser}
        editingUser={editingUser}
        existingUsers={users}
      />
    </div>
  )
}