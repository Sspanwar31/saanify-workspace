'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ArrowRight, Github, LogIn, User, Zap, Plus, Settings, Database, Shield, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import GitHubIntegration from '@/components/github/GitHubIntegration'
import SupabaseToggle from '@/components/SupabaseToggle'
import { ThemeToggle } from '@/components/theme-toggle'
import { toast } from 'sonner'

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isGitHubOpen, setIsGitHubOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('')

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
      
      // Update active section based on scroll position
      const sections = ['features', 'pricing', 'testimonials', 'about']
      const scrollPosition = window.scrollY + 100

      for (const section of sections) {
        const element = document.getElementById(section)
        if (element) {
          const { offsetTop, offsetHeight } = element
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNavClick = (href: string, label: string) => {
    if (href.startsWith('/')) {
      // It's a page navigation
      window.location.href = href
      setIsMobileMenuOpen(false)
      setIsDropdownOpen(false)
      toast.success(`📍 ${label}`, {
        description: `Navigated to ${label} page`,
        duration: 2000,
      })
    } else {
      // It's a section navigation
      const element = document.getElementById(href.replace('#', ''))
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
        setIsMobileMenuOpen(false)
        setIsDropdownOpen(false)
        toast.success(`📍 ${label}`, {
          description: `Navigated to ${label} section`,
          duration: 2000,
        })
      }
    }
  }

  const handleSignIn = () => {
    window.location.href = '/login'
  }

  const handleGetStarted = () => {
    toast.success("🚀 Welcome!", {
      description: "Starting your 15-day free trial...",
      duration: 3000,
    })
    setTimeout(() => {
      window.location.href = '/signup'
    }, 1000)
  }

  const handleDropdownAction = (action: string) => {
    setIsDropdownOpen(false)
    setIsMobileMenuOpen(false)
    
    switch (action) {
      case 'github':
        setIsGitHubOpen(true)
        break
      case 'supabase':
        toast.info("🔗 Supabase Cloud", {
          description: "Opening Supabase control panel...",
          duration: 3000,
        })
        break
      case 'security':
        toast.info("🔒 Security Center", {
          description: "Opening security settings...",
          duration: 3000,
        })
        break
      case 'analytics':
        handleNavClick('/analytics', 'Analytics')
        break
    }
  }

  const navItems = [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'About', href: '#about' },
    { label: 'Testimonials', href: '#testimonials' },
    { label: 'Support', href: '/support' },
  ]

  const dropdownItems = [
    {
      icon: <Github className="h-4 w-4" />,
      label: 'GitHub Integration',
      description: 'Connect and sync with GitHub',
      action: 'github'
    },
    {
      icon: <Database className="h-4 w-4" />,
      label: 'Supabase Cloud',
      description: 'Database configuration',
      action: 'supabase'
    },
    {
      icon: <Shield className="h-4 w-4" />,
      label: 'Security Center',
      description: 'Security and privacy settings',
      action: 'security'
    },
    {
      icon: <BarChart3 className="h-4 w-4" />,
      label: 'Analytics',
      description: 'View detailed analytics',
      action: 'analytics'
    }
  ]

  return (
    <>
      <motion.nav
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'backdrop-blur-md shadow-sm bg-background/70 border-b border-border' 
            : 'bg-transparent'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <motion.div 
              className="flex items-center cursor-pointer"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              whileHover={{ scale: 1.05 }}
            >
              <div className="flex items-center space-x-2">
                <motion.div 
                  className="w-8 h-8 bg-gradient-to-br from-sky-500 to-teal-600 rounded-lg flex items-center justify-center"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <span className="text-white font-bold text-sm">S</span>
                </motion.div>
                <span className={`text-lg font-bold ${
                  isScrolled ? 'text-foreground' : 'text-foreground'
                }`}>
                  Saanify
                </span>
                <motion.span 
                  className="text-primary font-bold"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  ⚡
                </motion.span>
              </div>
            </motion.div>

            {/* Desktop Navigation */}
            <motion.div 
              className="hidden lg:flex items-center space-x-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              {navItems.map((item, index) => (
                <motion.button
                  key={item.label}
                  onClick={() => handleNavClick(item.href, item.label)}
                  className={`text-sm font-medium transition-all duration-300 hover:text-primary relative ${
                    isScrolled ? 'text-foreground' : 'text-foreground'
                  } ${
                    activeSection === item.href.replace('#', '') 
                      ? 'text-primary' 
                      : ''
                  }`}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {item.label}
                  {activeSection === item.href.replace('#', '') && (
                    <motion.div
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary"
                      layoutId="activeSection"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </motion.button>
              ))}
            </motion.div>

            {/* Right Side Actions */}
            <motion.div 
              className="hidden lg:flex items-center space-x-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <ThemeToggle />
              
              {/* Sign In Button */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleSignIn}
                  className={`font-medium ${
                    isScrolled ? 'text-foreground hover:text-foreground' : 'text-foreground hover:text-foreground'
                  }`}
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              </motion.div>

              {/* Get Started Button */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  onClick={handleGetStarted}
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>

              {/* Dropdown Menu with + Icon */}
              <div className="relative">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={`font-medium ${
                      isScrolled ? 'text-foreground hover:text-foreground' : 'text-foreground hover:text-foreground'
                    } ${isDropdownOpen ? 'bg-accent' : ''}`}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </motion.div>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full right-0 mt-2 w-64"
                    >
                      <Card className="bg-background/95 backdrop-blur-sm border-2 shadow-xl">
                        <CardContent className="p-2">
                          {dropdownItems.map((item, index) => (
                            <motion.button
                              key={item.action}
                              onClick={() => handleDropdownAction(item.action)}
                              className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-accent transition-colors text-left"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.2, delay: index * 0.05 }}
                              whileHover={{ x: 5 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <div className="flex-shrink-0 text-primary">
                                {item.icon}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-foreground">
                                  {item.label}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {item.description}
                                </div>
                              </div>
                            </motion.button>
                          ))}
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Mobile Menu Button */}
            <motion.button
              className="lg:hidden p-2 rounded-lg hover:bg-accent transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6 text-foreground" />
              ) : (
                <Menu className="h-6 w-6 text-foreground" />
              )}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden bg-background border-t border-border"
            >
              <div className="px-4 py-6 space-y-4">
                {navItems.map((item) => (
                  <motion.button
                    key={item.label}
                    onClick={() => handleNavClick(item.href, item.label)}
                    className={`block w-full text-left text-base font-medium transition-colors py-2 ${
                      activeSection === item.href.replace('#', '')
                        ? 'text-primary'
                        : 'text-foreground hover:text-primary'
                    }`}
                    whileHover={{ x: 10 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {item.label}
                  </motion.button>
                ))}

                <div className="pt-4 border-t border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">Theme</span>
                    <ThemeToggle />
                  </div>

                  {/* Mobile Dropdown Options */}
                  <div className="space-y-2">
                    {dropdownItems.map((item, index) => (
                      <motion.button
                        key={item.action}
                        onClick={() => handleDropdownAction(item.action)}
                        className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-accent transition-colors text-left"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                        whileHover={{ x: 5 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div className="flex-shrink-0 text-primary">
                          {item.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-foreground">
                            {item.label}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {item.description}
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start font-medium text-foreground hover:text-foreground"
                      onClick={() => {
                        handleSignIn()
                        setIsMobileMenuOpen(false)
                      }}
                    >
                      <LogIn className="h-4 w-4 mr-2" />
                      Sign In
                    </Button>
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button 
                      onClick={() => {
                        handleGetStarted()
                        setIsMobileMenuOpen(false)
                      }}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* GitHub Integration Dialog */}
      <GitHubIntegration isOpen={isGitHubOpen} onOpenChange={setIsGitHubOpen} />
      
      {/* Supabase Toggle */}
      <SupabaseToggle />
    </>
  )
}