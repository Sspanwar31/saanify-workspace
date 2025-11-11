'use client'

import { motion } from 'framer-motion'
import { Cloud, Database, Cpu, Brain, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function CloudPage() {
  const features = [
    {
      icon: Database,
      title: 'Storage Management',
      description: 'Upload, organize, and manage files with automatic public bucket creation',
      href: '/cloud',
      color: 'from-blue-500 to-blue-600',
      delay: 0.1
    },
    {
      icon: Cpu,
      title: 'Edge Functions',
      description: 'Deploy serverless functions with auto-deployment and demo functions included',
      href: '/cloud',
      color: 'from-purple-500 to-purple-600',
      delay: 0.2
    },
    {
      icon: Brain,
      title: 'AI Services',
      description: 'Monitor AI usage, optimize costs, and track performance across models',
      href: '/cloud',
      color: 'from-green-500 to-green-600',
      delay: 0.3
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-sky-50/10 to-sky-100/10 dark:from-background dark:via-sky-950/50 dark:to-sky-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <motion.div 
              className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg"
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8 }}
            >
              <Cloud className="h-12 w-12 text-white" />
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              Saanify Cloud Panel
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Complete automation for Storage, Edge Functions, and AI services
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: feature.delay }}
              whileHover={{ y: -10, scale: 1.02 }}
            >
              <Card className="h-full p-6 bg-gradient-to-br from-card to-muted/30 border hover:shadow-xl transition-all duration-300 cursor-pointer">
                <CardContent className="p-0 text-center">
                  <motion.div 
                    className="p-4 rounded-2xl bg-gradient-to-br ${feature.color} mb-4"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <feature.icon className="h-8 w-8 text-white mx-auto" />
                  </motion.div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                    {feature.description}
                  </p>
                  <Button asChild className="w-full">
                    <Link href={feature.href} className="flex items-center justify-center">
                      Access Panel
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
            <CardContent className="p-6 text-center">
              <Database className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <h4 className="font-semibold text-foreground">45.2 GB</h4>
              <p className="text-sm text-muted-foreground">Storage Used</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20">
            <CardContent className="p-6 text-center">
              <Cpu className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <h4 className="font-semibold text-foreground">12</h4>
              <p className="text-sm text-muted-foreground">Functions Deployed</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
            <CardContent className="p-6 text-center">
              <Brain className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <h4 className="font-semibold text-foreground">15.4K</h4>
              <p className="text-sm text-muted-foreground">AI Calls Today</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-500/20">
            <CardContent className="p-6 text-center">
              <Cloud className="h-8 w-8 mx-auto mb-2 text-orange-600" />
              <h4 className="font-semibold text-foreground">99.7%</h4>
              <p className="text-sm text-muted-foreground">Uptime</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center"
        >
          <Button 
            asChild
            size="lg"
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-lg px-8 py-4"
          >
            <Link href="/cloud" className="flex items-center">
              Launch Cloud Dashboard
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </div>
  )
}