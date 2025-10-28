'use client'

import { motion, useState } from 'framer-motion'
import { Users, DollarSign, FileText, LayoutDashboard, ArrowRight, CheckCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface CoreFeatureProps {
  icon: React.ReactNode
  title: string
  description: string
  features: string[]
  delay: number
  onExplore?: (title: string) => void
}

function CoreFeature({ icon, title, description, features, delay, onExplore }: CoreFeatureProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [expandedFeature, setExpandedFeature] = useState<number | null>(null)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true }}
      whileHover={{ y: -10, scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card className="h-full p-8 hover:shadow-2xl transition-all duration-300 cursor-pointer border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 relative overflow-hidden group">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <CardContent className="p-0 relative z-10">
          <motion.div 
            className="mb-6"
            animate={{ rotate: isHovered ? 360 : 0, scale: isHovered ? 1.1 : 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-blue-600 text-white inline-block shadow-lg">
              {icon}
            </div>
          </motion.div>
          
          <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors duration-300">
            {title}
          </h3>
          
          <p className="text-gray-600 mb-6 leading-relaxed">{description}</p>
          
          <ul className="space-y-3 mb-6">
            {features.map((feature, index) => (
              <motion.li 
                key={index} 
                className="flex items-center text-sm text-gray-700 cursor-pointer hover:text-blue-600 transition-colors duration-200"
                onClick={() => setExpandedFeature(expandedFeature === index ? null : index)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: delay + index * 0.1 }}
                whileHover={{ x: 5 }}
              >
                <motion.div
                  animate={{ scale: expandedFeature === index ? 1.2 : 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <CheckCircle className="h-4 w-4 text-blue-500 mr-3" />
                </motion.div>
                <span className="flex-1">{feature}</span>
                {expandedFeature === index && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    className="text-xs text-blue-600 ml-2"
                  >
                    Click to learn more
                  </motion.span>
                )}
              </motion.li>
            ))}
          </ul>

          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: isHovered ? 1 : 0, height: isHovered ? 'auto' : 0 }}
            transition={{ duration: 0.3 }}
          >
            <Button 
              onClick={() => onExplore?.(title)}
              variant="outline" 
              className="w-full border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-300"
            >
              Explore Feature <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function CoreTools() {
  const handleExploreFeature = (featureTitle: string) => {
    toast.success(`🔍 ${featureTitle}`, {
      description: "Detailed feature view coming soon! This will open in your dashboard.",
      duration: 4000,
    })
  }

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
    <section id="about" className="py-20 bg-white">
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
              onExplore={handleExploreFeature}
            />
          ))}
        </div>
      </div>
    </section>
  )
}