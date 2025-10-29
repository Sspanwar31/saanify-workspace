'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useMotionValue, useTransform, useSpring, useInView } from 'framer-motion'
import { Play, ArrowRight, TrendingUp, Users, Shield, Activity, UserCheck, Lock, CreditCard, Zap, Globe, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

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
        <TrendingUp className="h-4 w-4 text-blue-500" />
        <span className="text-2xl font-bold text-gray-900 dark:text-white">
          +{count}{suffix}
        </span>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
    </motion.div>
  )
}

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
  gradient: string
  shadowColor: string
  floatDuration: number
  floatDelay: number
  onClick?: () => void
  children?: React.ReactNode
}

function FeatureCard({ icon, title, description, gradient, shadowColor, floatDuration, floatDelay, onClick, children }: FeatureCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Motion values for 3D tilt effect
  const rotateX = useMotionValue(0)
  const rotateY = useMotionValue(0)
  
  // Spring physics for smooth tilt
  const springConfig = { damping: 25, stiffness: 300 }
  const rotateXSpring = useSpring(rotateX, springConfig)
  const rotateYSpring = useSpring(rotateY, springConfig)

  // Transform values for 3D effect
  const transformX = useTransform(rotateXSpring, (value) => `${value}deg`)
  const transformY = useTransform(rotateYSpring, (value) => `${value}deg`)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile) return
    
    const rect = event.currentTarget.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    const x = event.clientX - centerX
    const y = event.clientY - centerY
    
    const rotateXValue = (y / (rect.height / 2)) * -10
    const rotateYValue = (x / (rect.width / 2)) * 10
    
    rotateX.set(rotateXValue)
    rotateY.set(rotateYValue)
  }

  const handleMouseLeave = () => {
    rotateX.set(0)
    rotateY.set(0)
    setIsHovered(false)
  }

  return (
    <motion.div
      className="relative"
      animate={{ 
        y: [0, -8, 0],
      }}
      transition={{ 
        duration: floatDuration, 
        repeat: Infinity, 
        repeatType: "reverse", 
        ease: "easeInOut", 
        delay: floatDelay 
      }}
      whileHover={!isMobile ? {
        scale: 1.02,
        z: 50,
      } : {}}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        transform: !isMobile ? `perspective(1000px) rotateX(${transformX}) rotateY(${transformY})` : 'none',
        transformStyle: 'preserve-3d',
      }}
    >
      <div className={`
        relative rounded-3xl p-8 bg-gradient-to-br ${gradient} 
        shadow-2xl ${shadowColor} 
        transition-all duration-500 cursor-pointer
        ${isHovered ? 'shadow-3xl' : ''}
        backdrop-blur-md border border-white/20
        min-h-[180px] flex flex-col justify-between
      `}>
        {/* Animated background pattern */}
        <div className="absolute inset-0 rounded-3xl opacity-10">
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent" />
        </div>
        
        {/* Glow effect on hover */}
        {isHovered && (
          <motion.div
            className="absolute inset-0 rounded-3xl opacity-40"
            style={{
              background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.6), transparent 70%)`,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ duration: 0.3 }}
          />
        )}
        
        <div className="relative z-10">
          {/* Modern Icon Container */}
          <div className="flex items-center justify-between mb-6">
            <motion.div 
              className="flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30"
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6 }}
            >
              {icon}
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
            >
              <Zap className="h-5 w-5 text-white" />
            </motion.div>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-2xl font-bold text-white leading-tight">{title}</h3>
            <p className="text-white/90 text-base leading-relaxed">{description}</p>
          </div>
          
          {children && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-6"
            >
              {children}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default function Hero() {
  const handleStartTrial = () => {
    toast.success("🎉 Trial Started!", {
      description: "Welcome to Saanify! Your 15-day free trial has begun.",
      duration: 5000,
    })
  }

  const handleWatchDemo = () => {
    toast.info("🎥 Demo Video", {
      description: "Demo video will start playing in a new window.",
      duration: 3000,
    })
    // In a real app, this would open a modal or navigate to demo page
    setTimeout(() => {
      window.open('#demo', '_blank')
    }, 1000)
  }

  const handleFeatureClick = (featureName: string) => {
    toast.success(`✨ ${featureName}`, {
      description: "Learn more about this feature in our dashboard.",
      duration: 3000,
    })
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white dark:bg-gray-950">
      {/* Modern Blurred Light Orbs for Depth */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-br from-blue-400/20 to-cyan-300/20 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-300/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-indigo-400/15 to-blue-300/15 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '4s' }} />
      
      {/* Floating Elements */}
      <motion.div
        animate={{ 
          y: [0, -20, 0],
          x: [0, 10, 0],
        }}
        transition={{ 
          duration: 6, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        className="absolute top-32 right-32 w-4 h-4 bg-blue-400/60 rounded-full blur-sm"
      />
      <motion.div
        animate={{ 
          y: [0, -15, 0],
          x: [0, -10, 0],
        }}
        transition={{ 
          duration: 5, 
          repeat: Infinity, 
          ease: "easeInOut",
          delay: 1
        }}
        className="absolute bottom-40 left-40 w-3 h-3 bg-purple-400/60 rounded-full blur-sm"
      />
      <motion.div
        animate={{ 
          y: [0, -25, 0],
          x: [0, 15, 0],
        }}
        transition={{ 
          duration: 7, 
          repeat: Infinity, 
          ease: "easeInOut",
          delay: 2
        }}
        className="absolute top-60 left-60 w-5 h-5 bg-pink-400/60 rounded-full blur-sm"
      />
      
      {/* Modern Gradient Mesh Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20 dark:from-gray-950 dark:via-blue-950/30 dark:to-purple-950/20" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            {/* Tagline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border border-blue-200/50 dark:border-blue-800/50 text-blue-700 dark:text-blue-300 text-sm font-semibold mb-6 backdrop-blur-sm"
            >
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse" />
              ⚡ AI-Powered Society Management
            </motion.div>
            
            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Effortless Society Management,
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 animate-gradient bg-300">
                Guaranteed Growth.
              </span>
            </h1>
            
            {/* Subtext */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl leading-relaxed"
            >
              Experience complete transparency in deposits, member management, and financial operations. 
              All-in-one platform designed for modern societies.
            </motion.p>

            {/* Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  onClick={handleStartTrial}
                  size="lg" 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:to-indigo-600 text-white font-semibold px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 glow-primary"
                >
                  Start Your 15-Day Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  onClick={handleWatchDemo}
                  variant="outline" 
                  size="lg" 
                  className="border-2 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 font-semibold px-8 py-4 text-lg rounded-xl transition-all duration-300 backdrop-blur-sm hover:shadow-lg"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Watch Demo
                </Button>
              </motion.div>
            </motion.div>

            {/* Counters */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8"
            >
              <Counter value={12} suffix="+" label="Total Societies" delay={1000} />
              <Counter value={45.2} suffix="K" label="Happy Members" delay={1200} />
              <Counter value={1247} suffix="" label="Events Managed" delay={1400} />
              <Counter value={2.4} suffix="M" label="Revenue Processed" delay={1600} />
            </motion.div>
          </motion.div>

          {/* Right Side - 3D Floating Cards */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            <div className="grid grid-cols-1 gap-8">
              <FeatureCard
                icon={<UserCheck className="h-8 w-8 text-white" />}
                title="Active Members"
                description="Connect with 45,000+ happy members across 12+ societies seamlessly."
                gradient="from-blue-600 via-blue-500 to-indigo-600"
                shadowColor="shadow-[0_20px_40px_rgba(59,130,246,0.4)]"
                floatDuration={5}
                floatDelay={0}
                onClick={() => handleFeatureClick("Active Members")}
              >
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 }}
                  className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <Globe className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-white/80 text-sm">Total Members</p>
                      <p className="text-white font-bold text-xl">+45.2K</p>
                    </div>
                  </div>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-green-300"
                  >
                    <TrendingUp className="h-5 w-5" />
                  </motion.div>
                </motion.div>
              </FeatureCard>

              <FeatureCard
                icon={<Lock className="h-8 w-8 text-white" />}
                title="Secure & Protected"
                description="Bank-level security with encrypted transactions and data protection."
                gradient="from-emerald-600 via-green-500 to-teal-600"
                shadowColor="shadow-[0_20px_40px_rgba(16,185,129,0.4)]"
                floatDuration={4.5}
                floatDelay={0.5}
                onClick={() => handleFeatureClick("Security")}
              >
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2 }}
                  className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <Shield className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-white/80 text-sm">Security Level</p>
                      <p className="text-white font-bold text-xl">256-bit SSL</p>
                    </div>
                  </div>
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="text-yellow-300"
                  >
                    <Lock className="h-5 w-5" />
                  </motion.div>
                </motion.div>
              </FeatureCard>

              <FeatureCard
                icon={<CreditCard className="h-8 w-8 text-white" />}
                title="Transaction Flow"
                description="Process $2.4M+ revenue with real-time tracking and analytics."
                gradient="from-purple-600 via-pink-500 to-indigo-600"
                shadowColor="shadow-[0_20px_40px_rgba(168,85,247,0.4)]"
                floatDuration={6}
                floatDelay={1}
                onClick={() => handleFeatureClick("Transactions")}
              >
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.4 }}
                  className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <BarChart3 className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-white/80 text-sm">Revenue Processed</p>
                      <p className="text-white font-bold text-xl">$2.4M+</p>
                    </div>
                  </div>
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-green-300"
                  >
                    <Activity className="h-5 w-5" />
                  </motion.div>
                </motion.div>
              </FeatureCard>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}