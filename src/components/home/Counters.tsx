'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { TrendingUp } from 'lucide-react'

interface CounterProps {
  value: number
  suffix?: string
  label: string
  delay: number
}

function Counter({ value, suffix = '', label, delay }: CounterProps) {
  const [count, setCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => setIsVisible(true), delay)
      return () => clearTimeout(timer)
    }
  }, [isInView, delay])

  useEffect(() => {
    if (!isVisible) return

    let start = 0
    const end = value
    const duration = 2000
    const increment = end / (duration / 16)

    const timer = setInterval(() => {
      start += increment
      if (start >= end) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)

    return () => clearInterval(timer)
  }, [isVisible, value])

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
      transition={{ duration: 0.6, delay: delay / 1000 }}
      className="text-center"
    >
      <div className="flex items-center justify-center gap-1 mb-2">
        <TrendingUp className="h-4 w-4 text-sky-600" />
        <span className="text-2xl font-bold text-gray-900">
          +{count}{suffix}
        </span>
      </div>
      <p className="text-sm text-gray-600">{label}</p>
    </motion.div>
  )
}

export default function Counters() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Trusted by Leading Societies
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join thousands of societies already experiencing the future of community management
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          <Counter value={12} suffix="+" label="Total Societies" delay={200} />
          <Counter value={45.2} suffix="K" label="Happy Members" delay={400} />
          <Counter value={1247} suffix="" label="Events Managed" delay={600} />
          <Counter value={2.4} suffix="M" label="Revenue Processed" delay={800} />
        </motion.div>
      </div>
    </section>
  )
}