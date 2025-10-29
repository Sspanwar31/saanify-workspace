'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Building, Mail, Phone, Calendar, MapPin, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

interface AddClientModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onClientAdded: () => void
}

interface NewClient {
  societyName: string
  adminName: string
  adminEmail: string
  adminPhone: string
  subscriptionType: 'TRIAL' | 'BASIC' | 'PRO' | 'ENTERPRISE'
  trialPeriod: number
  address: string
  city: string
  state: string
  postalCode: string
  totalMembers: string
}

export default function AddClientModal({ isOpen, onOpenChange, onClientAdded }: AddClientModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<NewClient>({
    societyName: '',
    adminName: '',
    adminEmail: '',
    adminPhone: '',
    subscriptionType: 'TRIAL',
    trialPeriod: 15,
    address: '',
    city: '',
    state: '',
    postalCode: '',
    totalMembers: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast.success('Client added successfully!')
        setFormData({
          societyName: '',
          adminName: '',
          adminEmail: '',
          adminPhone: '',
          subscriptionType: 'TRIAL',
          trialPeriod: 15,
          address: '',
          city: '',
          state: '',
          postalCode: '',
          totalMembers: ''
        })
        onOpenChange(false)
        onClientAdded()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to add client')
      }
    } catch (error) {
      console.error('Failed to add client:', error)
      toast.error('Failed to add client')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof NewClient, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => onOpenChange(false)}
          />
          
          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ 
                duration: 0.3,
                type: "spring",
                stiffness: 300,
                damping: 30
              }}
              className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="relative bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-6 text-white">
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-4 top-4 text-white/80 hover:text-white hover:bg-white/20"
                  onClick={() => onOpenChange(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
                
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <Building className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Add New Client</h2>
                    <p className="text-white/90 text-sm">Create a new society account</p>
                  </div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Society Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <Building className="h-5 w-5 mr-2 text-emerald-600" />
                    Society Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="societyName">Society Name *</Label>
                      <Input
                        id="societyName"
                        value={formData.societyName}
                        onChange={(e) => handleInputChange('societyName', e.target.value)}
                        placeholder="Enter society name"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="totalMembers">Total Members *</Label>
                      <Input
                        id="totalMembers"
                        type="number"
                        value={formData.totalMembers}
                        onChange={(e) => handleInputChange('totalMembers', e.target.value)}
                        placeholder="Number of members"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="Enter society address"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        placeholder="City"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        placeholder="State"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input
                        id="postalCode"
                        value={formData.postalCode}
                        onChange={(e) => handleInputChange('postalCode', e.target.value)}
                        placeholder="Postal code"
                      />
                    </div>
                  </div>
                </div>

                {/* Admin Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <Users className="h-5 w-5 mr-2 text-emerald-600" />
                    Admin Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="adminName">Admin Name *</Label>
                      <Input
                        id="adminName"
                        value={formData.adminName}
                        onChange={(e) => handleInputChange('adminName', e.target.value)}
                        placeholder="Enter admin name"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="adminEmail">Admin Email *</Label>
                      <Input
                        id="adminEmail"
                        type="email"
                        value={formData.adminEmail}
                        onChange={(e) => handleInputChange('adminEmail', e.target.value)}
                        placeholder="Enter admin email"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="adminPhone">Admin Phone</Label>
                    <Input
                      id="adminPhone"
                      value={formData.adminPhone}
                      onChange={(e) => handleInputChange('adminPhone', e.target.value)}
                      placeholder="Enter admin phone number"
                    />
                  </div>
                </div>

                {/* Subscription Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-emerald-600" />
                    Subscription Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="subscriptionType">Subscription Type *</Label>
                      <Select
                        value={formData.subscriptionType}
                        onValueChange={(value: any) => handleInputChange('subscriptionType', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select subscription type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="TRIAL">Trial</SelectItem>
                          <SelectItem value="BASIC">Basic</SelectItem>
                          <SelectItem value="PRO">Pro</SelectItem>
                          <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {formData.subscriptionType === 'TRIAL' && (
                      <div className="space-y-2">
                        <Label htmlFor="trialPeriod">Trial Period (days) *</Label>
                        <Input
                          id="trialPeriod"
                          type="number"
                          value={formData.trialPeriod}
                          onChange={(e) => handleInputChange('trialPeriod', parseInt(e.target.value))}
                          placeholder="Trial period in days"
                          min="1"
                          max="90"
                          required
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Creating Client...
                      </div>
                    ) : (
                      'Create Client'
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}