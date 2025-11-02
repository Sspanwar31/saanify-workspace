'use client'

import { motion } from 'framer-motion'

export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative">
        <motion.div
          className="w-16 h-16 border-4 border-emerald-200 dark:border-emerald-800 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-emerald-500 dark:border-t-emerald-400 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center"
      >
        <h3 className="text-lg font-semibold text-foreground mb-1">
          Loading Saanify Portal
        </h3>
        <p className="text-sm text-muted-foreground">
          Please wait while we prepare your dashboard...
        </p>
      </motion.div>
    </div>
  )
}