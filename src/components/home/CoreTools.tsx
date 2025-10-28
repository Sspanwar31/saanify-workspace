'use client'

import { motion } from 'framer-motion'
import { Users, DollarSign, FileText, LayoutDashboard } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface CoreFeatureProps {
  icon: React.ReactNode
  title: string
  description: string
  features: string[]
  delay: number
}

function CoreFeature({ icon, title, description, features, delay }: CoreFeatureProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true }}
    >
      <Card className="h-full p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
        <CardContent className="p-0">
          <div className="mb-6">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-blue-600 text-white inline-block">
              {icon}
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">{title}</h3>
          <p className="text-gray-600 mb-6 leading-relaxed">{description}</p>
          <ul className="space-y-3">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center text-sm text-gray-700">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
                {feature}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function CoreTools() {
  const coreFeatures = [
    {
      icon: <Users className="h-8 w-8" />,
      title: "Centralized Member Management",
      description: "Comprehensive member database with advanced profiling and communication tools.",
      features: [
        "Digital member profiles with documents",
        "Family unit management",
        "Communication preferences",
        "Activity tracking"
      ],
      delay: 0.1
    },
    {
      icon: <DollarSign className="h-8 w-8" />,
      title: "Secure Deposit Tracking",
      description: "Transparent financial management with automated payment processing and reporting.",
      features: [
        "Automated payment reminders",
        "Multi-payment gateway support",
        "Real-time financial reports",
        "Audit trail maintenance"
      ],
      delay: 0.2
    },
    {
      icon: <FileText className="h-8 w-8" />,
      title: "Automated Reporting",
      description: "Generate comprehensive reports instantly with customizable templates and scheduling.",
      features: [
        "Monthly financial statements",
        "Compliance reports",
        "Custom report builder",
        "Scheduled delivery"
      ],
      delay: 0.3
    },
    {
      icon: <LayoutDashboard className="h-8 w-8" />,
      title: "Intuitive Dashboard",
      description: "Real-time insights and analytics with a user-friendly interface for quick decision making.",
      features: [
        "Real-time metrics display",
        "Interactive data visualization",
        "Quick action buttons",
        "Mobile-responsive design"
      ],
      delay: 0.4
    }
  ]

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Core Platform Features
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Discover the powerful tools that make society management simple, efficient, and enjoyable.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {coreFeatures.map((feature, index) => (
            <CoreFeature
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              features={feature.features}
              delay={feature.delay}
            />
          ))}
        </div>
      </div>
    </section>
  )
}