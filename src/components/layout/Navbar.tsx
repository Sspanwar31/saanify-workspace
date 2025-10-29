'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ArrowRight, Github, LogIn, User, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import GitHubIntegration from '@/components/github/GitHubIntegration'
import { ThemeToggle } from '@/components/theme-toggle'
import { toast } from 'sonner'

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isGitHubOpen, setIsGitHubOpen] = useState(false)
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
    const element = document.getElementById(href.replace('#', ''))
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      setIsMobileMenuOpen(false)
      toast.success(`📍 ${label}`, {
        description: `Navigated to ${label} section`,
        duration: 2000,
      })
    }
  }

  const handleSignIn = () => {
    toast.info("🔐 Sign In", {
      description: "Sign in functionality coming soon!",
      duration: 3000,
    })
  }

  const handleGetStarted = () => {
    toast.success("🚀 Welcome!", {
      description: "Starting your 15-day free trial...",
      duration: 3000,
    })
    setTimeout(() => {
      document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
    }, 1000)
  }

  const navItems = [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Testimonials', href: '#testimonials' },
    { label: 'About', href: '#about' },
  ]

  return (
    <>
      <motion.nav
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'backdrop-blur-md shadow-sm bg-white/70 dark:bg-gray-950/70 border-b border-gray-200/50 dark:border-gray-800/50' 
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
                  className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <span className="text-white font-bold text-sm">S</span>
                </motion.div>
                <span className={`text-xl font-bold ${
                  isScrolled ? 'text-gray-900 dark:text-white' : 'text-gray-900 dark:text-white'
                }`}>
                  Saanify
                </span>
              </div>
            </motion.div>

            {/* Desktop Navigation */}
            <motion.div 
              className="hidden md:flex items-center space-x-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              {navItems.map((item, index) => (
                <motion.button
                  key={item.label}
                  onClick={() => handleNavClick(item.href, item.label)}
                  className={`text-sm font-medium transition-all duration-300 hover:text-blue-600 dark:hover:text-blue-400 relative ${
                    isScrolled ? 'text-gray-700 dark:text-gray-300' : 'text-gray-700 dark:text-gray-300'
                  } ${
                    activeSection === item.href.replace('#', '') 
                      ? 'text-blue-600 dark:text-blue-400' 
                      : ''
                  }`}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {item.label}
                  {activeSection === item.href.replace('#', '') && (
                    <motion.div
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"
                      layoutId="activeSection"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </motion.button>
              ))}
            </motion.div>

            {/* CTA Button */}
            <motion.div 
              className="hidden md:flex items-center space-x-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <ThemeToggle />
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setIsGitHubOpen(true)}
                  className={`font-medium border border-transparent hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 ${
                    isScrolled ? 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white' : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Github className="h-4 w-4 mr-2" />
                  GitHub
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleSignIn}
                  className={`font-medium ${
                    isScrolled ? 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white' : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  onClick={handleGetStarted}
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:to-indigo-600 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            </motion.div>

            {/* Mobile Menu Button */}
            <motion.button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6 text-gray-900 dark:text-white" />
              ) : (
                <Menu className="h-6 w-6 text-gray-900 dark:text-white" />
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
              className="md:hidden bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800"
            >
              <div className="px-4 py-6 space-y-4">
                {navItems.map((item) => (
                  <motion.button
                    key={item.label}
                    onClick={() => handleNavClick(item.href, item.label)}
                    className={`block w-full text-left text-base font-medium transition-colors py-2 ${
                      activeSection === item.href.replace('#', '')
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                    }`}
                    whileHover={{ x: 10 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {item.label}
                  </motion.button>
                ))}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Theme</span>
                    <ThemeToggle />
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 border border-transparent hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200"
                      onClick={() => {
                        setIsGitHubOpen(true)
                        setIsMobileMenuOpen(false)
                      }}
                    >
                      <Github className="h-4 w-4 mr-2" />
                      GitHub
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
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
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:to-indigo-600 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300"
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
    </>
  )
}