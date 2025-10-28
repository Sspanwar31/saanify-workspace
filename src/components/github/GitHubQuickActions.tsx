'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Github, Upload, Download, Shield, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import GitHubIntegration from './GitHubIntegration'

export default function GitHubQuickActions() {
  const [showIntegration, setShowIntegration] = useState(false)

  return (
    <>
      {/* Quick Actions Floating Widget */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="fixed top-20 right-4 z-40"
      >
        <Card className="bg-white/95 backdrop-blur-sm shadow-lg border border-gray-200 p-4 w-64">
          <CardContent className="p-0">
            <div className="flex items-center gap-2 mb-3">
              <Github className="h-5 w-5 text-gray-700" />
              <h3 className="font-semibold text-gray-900 text-sm">GitHub Backup</h3>
              <Shield className="h-4 w-4 text-green-500 ml-auto" />
            </div>
            
            <p className="text-xs text-gray-600 mb-4">
              Secure your project with automatic GitHub backups
            </p>

            <div className="space-y-2">
              <Button
                size="sm"
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                onClick={() => setShowIntegration(true)}
              >
                <Upload className="h-3 w-3 mr-2" />
                Quick Backup
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={() => setShowIntegration(true)}
              >
                <Download className="h-3 w-3 mr-2" />
                Restore Backup
              </Button>

              <div className="pt-2 border-t border-gray-200">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Zap className="h-3 w-3" />
                  <span>Auto-sync enabled</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Full Integration Modal */}
      {showIntegration && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">GitHub Integration</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowIntegration(false)}
                >
                  ×
                </Button>
              </div>
              <GitHubIntegration />
            </div>
          </motion.div>
        </div>
      )}
    </>
  )
}