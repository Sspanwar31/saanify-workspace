'use client'

import { motion, useState } from 'framer-motion'
import { Lock, Zap, BarChart, Headphones, Users, Plug, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
  delay: number
  onLearnMore?: (title: string) => void
}

function FeatureCard({ icon, title, description, delay, onLearnMore }: FeatureCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true }}
      whileHover={{ y: -10, scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={() => onLearnMore?.(title)}
    >
      <Card className="h-full p-6 hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-md bg-white hover:bg-gradient-to-br hover:from-white hover:to-blue-50 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <CardContent className="p-0 text-center relative z-10">
          <div className="mb-4 flex justify-center">
            <motion.div 
              className="p-3 rounded-full bg-gradient-to-r from-indigo-500 to-blue-600 text-white"
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6 }}
            >
              {icon}
            </motion.div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">
            {title}
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed mb-4">{description}</p>
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: isHovered ? 1 : 0, height: isHovered ? 'auto' : 0 }}
            transition={{ duration: 0.3 }}
          >
            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
              Learn More <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function Features() {
  const handleLearnMore = (featureTitle: string) => {
    toast.success(`Learn more about ${featureTitle}`, {
      description: "Feature details coming soon!",
      duration: 3000,
    })
  }

  const features = [
    {
      icon: <Lock className="h-6 w-6" />,
      title: "Bank-Grade Security",
      description: "Your society's data is protected with enterprise-level encryption and security protocols.",
      delay: 0.1
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Lightning Fast",
      description: "Experience blazing-fast performance with our optimized infrastructure and caching.",
      delay: 0.2
    },
    {
      icon: <BarChart className="h-6 w-6" />,
      title: "Smart Analytics",
      description: "Get actionable insights with AI-powered analytics and comprehensive reporting.",
      delay: 0.3
    },
    {
      icon: <Headphones className="h-6 w-6" />,
      title: "24/7 Support",
      description: "Round-the-clock assistance from our dedicated team of society management experts.",
      delay: 0.4
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Member Engagement",
      description: "Build stronger communities with tools designed to increase member participation.",
      delay: 0.5
    },
    {
      icon: <Plug className="h-6 w-6" />,
      title: "Easy Integration",
      description: "Seamlessly connect with your existing tools and third-party services.",
      delay: 0.6
    }
  ]

  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Choose Saanify?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover the features that make us the trusted choice for modern society management
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              delay={feature.delay}
              onLearnMore={handleLearnMore}
            />
          ))}
        </div>
      </div>
    </section>
  )
}