'use client'

import { motion } from 'framer-motion'
import { Lock, Zap, BarChart, Headphones, Users, Plug } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
  delay: number
}

function FeatureCard({ icon, title, description, delay }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true }}
    >
      <Card className="h-full p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-md bg-white/80 backdrop-blur-sm">
        <CardContent className="p-0 text-center">
          <div className="mb-4 flex justify-center">
            <div className="p-3 rounded-full bg-gradient-to-r from-indigo-500 to-blue-600 text-white">
              {icon}
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function Features() {
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
    <section className="py-20 bg-gray-50">
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
            />
          ))}
        </div>
      </div>
    </section>
  )
}