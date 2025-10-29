'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useMotionValue, useTransform, useSpring, useInView } from 'framer-motion'
import { Play, ArrowRight, TrendingUp, Users, Shield, Activity, UserCheck, Lock, CreditCard, Zap, Globe, BarChart3, Building, Calendar } from 'lucide-react'
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
        relative rounded-2xl p-6 bg-gradient-to-br ${gradient} 
        shadow-xl ${shadowColor} 
        transition-all duration-500 cursor-pointer
        ${isHovered ? 'shadow-2xl' : ''}
        backdrop-blur-md border border-white/20
        min-h-[140px] flex flex-col justify-between
      `}>
        {/* Animated background pattern */}
        <div className="absolute inset-0 rounded-2xl opacity-10">
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent" />
        </div>
        
        {/* Glow effect on hover */}
        {isHovered && (
          <motion.div
            className="absolute inset-0 rounded-2xl opacity-40"
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
          <div className="flex items-center justify-between mb-4">
            <motion.div 
              className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30"
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6 }}
            >
              {icon}
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
            >
              <Zap className="h-4 w-4 text-white" />
            </motion.div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-white leading-tight">{title}</h3>
            <p className="text-white/90 text-sm leading-relaxed">{description}</p>
          </div>
          
          {children && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-4"
            >
              {children}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

interface HeroProps {
  onOpenLoginModal?: () => void
}

export default function Hero({ onOpenLoginModal }: HeroProps) {
  const handleStartTrial = () => {
    if (onOpenLoginModal) {
      onOpenLoginModal()
    } else {
      toast.success("🎉 Trial Started!", {
        description: "Welcome to Saanify! Your 15-day free trial has begun.",
        duration: 5000,
      })
    }
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
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white dark:bg-black">
      {/* Modern Blurred Light Orbs for Depth */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-br from-emerald-400/15 to-teal-300/15 rounded-full blur-3xl animate-pulse-slow dark:from-emerald-500/8 dark:to-teal-400/8" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-cyan-400/15 to-blue-300/15 rounded-full blur-3xl animate-pulse-slow dark:from-cyan-500/8 dark:to-blue-400/8" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-green-400/12 to-emerald-300/12 rounded-full blur-3xl animate-pulse-slow dark:from-green-500/6 dark:to-emerald-400/6" style={{ animationDelay: '4s' }} />
      
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
        className="absolute top-32 right-32 w-4 h-4 bg-emerald-400/30 rounded-full blur-sm dark:bg-emerald-500/15"
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
        className="absolute bottom-40 left-40 w-3 h-3 bg-teal-400/30 rounded-full blur-sm dark:bg-teal-500/15"
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
        className="absolute top-60 left-60 w-5 h-5 bg-cyan-400/30 rounded-full blur-sm dark:bg-cyan-500/15"
      />
      
      {/* Modern Gradient Mesh Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-emerald-50/40 to-cyan-50/30 dark:from-black dark:via-emerald-950/60 dark:to-cyan-950/60" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
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
              className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 border border-emerald-200/50 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300 text-sm font-semibold mb-6 backdrop-blur-sm"
            >
              <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse" />
              ⚡ AI-Powered Society Management
            </motion.div>
            
            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Effortless Society Management,
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400 animate-gradient bg-300">
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
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  onClick={handleStartTrial}
                  size="lg" 
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 dark:from-emerald-500 dark:to-teal-500 dark:hover:from-emerald-600 dark:hover:to-teal-600 text-white font-semibold px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 glow-primary"
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
                  className="border-2 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 font-semibold px-8 py-4 text-lg rounded-xl transition-all duration-300 backdrop-blur-sm hover:shadow-lg"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Watch Demo
                </Button>
              </motion.div>
            </motion.div>

            {/* Compact Stats Bar */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-500 dark:via-teal-500 dark:to-cyan-500 rounded-2xl p-6 shadow-2xl backdrop-blur-sm border border-emerald-500/20 dark:border-emerald-400/20"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <div className="w-8 h-8 bg-white/20 dark:bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm">
                      <Building className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-white">+12</div>
                  <div className="text-sm text-emerald-50 dark:text-emerald-100 font-medium">Total Societies</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <div className="w-8 h-8 bg-white/20 dark:bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm">
                      <Users className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-white">+45.2K</div>
                  <div className="text-sm text-emerald-50 dark:text-emerald-100 font-medium">Happy Members</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <div className="w-8 h-8 bg-white/20 dark:bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm">
                      <Calendar className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-white">+1247</div>
                  <div className="text-sm text-emerald-50 dark:text-emerald-100 font-medium">Events Managed</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <div className="w-8 h-8 bg-white/20 dark:bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm">
                      <TrendingUp className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-white">+2.4M</div>
                  <div className="text-sm text-emerald-50 dark:text-emerald-100 font-medium">Revenue Processed</div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Side - Compact 3D Floating Cards */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            <div className="grid grid-cols-1 gap-6">
              <FeatureCard
                icon={<UserCheck className="h-7 w-7 text-white" />}
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
                  className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                      <Globe className="h-3 w-3 text-white" />
                    </div>
                    <div>
                      <p className="text-white/80 text-xs">Total Members</p>
                      <p className="text-white font-bold text-sm">+45.2K</p>
                    </div>
                  </div>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-green-300"
                  >
                    <TrendingUp className="h-4 w-4" />
                  </motion.div>
                </motion.div>
              </FeatureCard>

              <FeatureCard
                icon={<Lock className="h-7 w-7 text-white" />}
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
                  className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                      <Shield className="h-3 w-3 text-white" />
                    </div>
                    <div>
                      <p className="text-white/80 text-xs">Security Level</p>
                      <p className="text-white font-bold text-sm">256-bit SSL</p>
                    </div>
                  </div>
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="text-yellow-300"
                  >
                    <Lock className="h-4 w-4" />
                  </motion.div>
                </motion.div>
              </FeatureCard>

              <FeatureCard
                icon={<CreditCard className="h-7 w-7 text-white" />}
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
                  className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                      <BarChart3 className="h-3 w-3 text-white" />
                    </div>
                    <div>
                      <p className="text-white/80 text-xs">Revenue Processed</p>
                      <p className="text-white font-bold text-sm">$2.4M+</p>
                    </div>
                  </div>
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-green-300"
                  >
                    <Activity className="h-4 w-4" />
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