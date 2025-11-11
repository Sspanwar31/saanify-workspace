'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Key, 
  Plus, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  Trash2, 
  Shield, 
  AlertCircle,
  CheckCircle,
  Copy,
  Edit2,
  Save,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

interface Secret {
  id: string
  name: string
  value: string
  description?: string
  lastRotated?: string
  isEditing?: boolean
}

export default function SecretsTab() {
  const [secrets, setSecrets] = useState<Secret[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showValues, setShowValues] = useState<{ [key: string]: boolean }>({})
  const [newSecret, setNewSecret] = useState({ name: '', value: '', description: '' })
  const [isAddingSecret, setIsAddingSecret] = useState(false)

  useEffect(() => {
    fetchSecrets()
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchSecrets, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchSecrets = async () => {
    try {
      const response = await fetch('/api/cloud/secrets')
      const data = await response.json()
      if (data.success) {
        setSecrets(data.secrets.map((s: any) => ({ ...s, isEditing: false })))
      }
    } catch (error) {
      console.error('Failed to fetch secrets:', error)
    }
  }

  const toggleSecretVisibility = (id: string) => {
    setShowValues(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const rotateSecret = async (id: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/cloud/secrets/${id}/rotate`, {
        method: 'POST'
      })
      const data = await response.json()
      
      if (data.success) {
        toast.success('🔄 Secret Rotated', {
          description: `Secret ${data.secret.name} has been rotated successfully`,
          duration: 3000,
        })
        fetchSecrets()
      } else {
        toast.error('❌ Rotation Failed', {
          description: data.error || 'Failed to rotate secret',
          duration: 3000,
        })
      }
    } catch (error) {
      toast.error('❌ Rotation Error', {
        description: 'Network error occurred while rotating secret',
        duration: 3000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const deleteSecret = async (id: string) => {
    if (!confirm('Are you sure you want to delete this secret? This action cannot be undone.')) {
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/cloud/secrets/${id}`, {
        method: 'DELETE'
      })
      const data = await response.json()
      
      if (data.success) {
        toast.success('🗑️ Secret Deleted', {
          description: 'Secret has been deleted successfully',
          duration: 3000,
        })
        fetchSecrets()
      } else {
        toast.error('❌ Deletion Failed', {
          description: data.error || 'Failed to delete secret',
          duration: 3000,
        })
      }
    } catch (error) {
      toast.error('❌ Deletion Error', {
        description: 'Network error occurred while deleting secret',
        duration: 3000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const addSecret = async () => {
    if (!newSecret.name || !newSecret.value) {
      toast.error('❌ Validation Error', {
        description: 'Name and value are required',
        duration: 3000,
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/cloud/secrets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newSecret)
      })
      const data = await response.json()
      
      if (data.success) {
        toast.success('🔑 Secret Added', {
          description: `Secret ${data.secret.name} has been added successfully`,
          duration: 3000,
        })
        setNewSecret({ name: '', value: '', description: '' })
        setIsAddingSecret(false)
        fetchSecrets()
      } else {
        toast.error('❌ Addition Failed', {
          description: data.error || 'Failed to add secret',
          duration: 3000,
        })
      }
    } catch (error) {
      toast.error('❌ Addition Error', {
        description: 'Network error occurred while adding secret',
        duration: 3000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updateSecret = async (id: string, updates: Partial<Secret>) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/cloud/secrets/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      })
      const data = await response.json()
      
      if (data.success) {
        toast.success('💾 Secret Updated', {
          description: `Secret ${data.secret.name} has been updated successfully`,
          duration: 3000,
        })
        fetchSecrets()
      } else {
        toast.error('❌ Update Failed', {
          description: data.error || 'Failed to update secret',
          duration: 3000,
        })
      }
    } catch (error) {
      toast.error('❌ Update Error', {
        description: 'Network error occurred while updating secret',
        duration: 3000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (value: string) => {
    navigator.clipboard.writeText(value)
    toast.success('📋 Copied to Clipboard', {
      description: 'Secret value has been copied',
      duration: 2000,
    })
  }

  const toggleEditMode = (id: string) => {
    setSecrets(prev => prev.map(secret => 
      secret.id === id ? { ...secret, isEditing: !secret.isEditing } : secret
    ))
  }

  const maskValue = (value: string) => {
    if (value.length <= 8) return '*'.repeat(value.length)
    return value.substring(0, 4) + '*'.repeat(value.length - 8) + value.substring(value.length - 4)
  }

  return (
    <div className="space-y-6">
      {/* Security Notice */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>🔒 Security First:</strong> All secrets are encrypted and stored securely. 
          Values are masked by default and never exposed in logs.
        </AlertDescription>
      </Alert>

      {/* Add Secret Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Environment Variables</h3>
        <Button
          onClick={() => setIsAddingSecret(!isAddingSecret)}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Secret
        </Button>
      </div>

      {/* Add Secret Form */}
      <AnimatePresence>
        {isAddingSecret && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Add New Secret</CardTitle>
                <CardDescription>
                  Create a new environment variable for your Supabase project
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="secret-name">Name</Label>
                  <Input
                    id="secret-name"
                    placeholder="DATABASE_URL"
                    value={newSecret.name}
                    onChange={(e) => setNewSecret(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="secret-value">Value</Label>
                  <Textarea
                    id="secret-value"
                    placeholder="https://your-project.supabase.co"
                    value={newSecret.value}
                    onChange={(e) => setNewSecret(prev => ({ ...prev, value: e.target.value }))}
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="secret-description">Description (Optional)</Label>
                  <Input
                    id="secret-description"
                    placeholder="Database connection URL"
                    value={newSecret.description}
                    onChange={(e) => setNewSecret(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={addSecret} disabled={isLoading}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Secret
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsAddingSecret(false)}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Secrets List */}
      <div className="grid gap-4">
        {secrets.map((secret, index) => (
          <motion.div
            key={secret.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Key className="h-4 w-4 text-primary" />
                      <h4 className="font-semibold">{secret.name}</h4>
                      {secret.lastRotated && (
                        <Badge variant="outline" className="text-xs">
                          Rotated: {new Date(secret.lastRotated).toLocaleDateString()}
                        </Badge>
                      )}
                    </div>
                    
                    {secret.description && (
                      <p className="text-sm text-muted-foreground mb-2">{secret.description}</p>
                    )}
                    
                    <div className="flex items-center gap-2">
                      {secret.isEditing ? (
                        <Textarea
                          value={secret.value}
                          onChange={(e) => {
                            const updatedSecrets = secrets.map(s => 
                              s.id === secret.id ? { ...s, value: e.target.value } : s
                            )
                            setSecrets(updatedSecrets)
                          }}
                          className="font-mono text-sm"
                          rows={2}
                        />
                      ) : (
                        <div className="flex-1 font-mono text-sm bg-muted p-2 rounded">
                          {showValues[secret.id] ? secret.value : maskValue(secret.value)}
                        </div>
                      )}
                      
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSecretVisibility(secret.id)}
                        >
                          {showValues[secret.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(secret.value)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        
                        {secret.isEditing ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateSecret(secret.id, { value: secret.value })}
                            disabled={isLoading}
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleEditMode(secret.id)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        )}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => rotateSecret(secret.id)}
                          disabled={isLoading}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteSecret(secret.id)}
                          disabled={isLoading}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {secrets.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Key className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Secrets Found</h3>
            <p className="text-muted-foreground mb-4">
              Get started by adding your first environment variable
            </p>
            <Button onClick={() => setIsAddingSecret(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Secret
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}