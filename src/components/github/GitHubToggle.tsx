'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Github } from 'lucide-react'
import { Button } from '@/components/ui/button'
import GitHubIntegration from './GitHubIntegration'

export default function GitHubToggle() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Fixed GitHub Button - Bottom Right */}
      <div className="fixed bottom-6 right-6 z-50">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={() => setIsOpen(true)}
            size="lg"
            className="bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3 border border-slate-700"
          >
            <Github className="h-5 w-5 mr-2" />
            GitHub
          </Button>
        </motion.div>
      </div>

      {/* GitHub Integration Dialog */}
      <GitHubIntegration isOpen={isOpen} onOpenChange={setIsOpen} />
    </>
  )
}
