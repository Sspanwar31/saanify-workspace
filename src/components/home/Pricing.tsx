'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { Check, Star, ArrowRight, Zap, Shield, Crown, Sparkles, Rocket, Building } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'

interface PricingCardProps {
  title: string
  price: string
  period?: string
  description: string
  features: string[]
  highlighted?: boolean
  delay: number
  cta: string
  onSelectPlan: (plan: string) => void
}

function PricingCard({ title, price, period, description, features, highlighted, delay, cta, onSelectPlan }: PricingCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true }}
      whileHover={{ y: -10, scale: highlighted ? 1.02 : 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`relative ${highlighted ? 'scale-105' : ''}`}
    >
      {highlighted && (
        <motion.div 
          className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10"
          animate={{ scale: isHovered ? 1.1 : 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg">
            <Star className="h-4 w-4 fill-current" />
            Most Popular
          </div>
        </motion.div>
      )}
      
      <Card className={`h-full p-8 relative cursor-pointer transition-all duration-500 rounded-2xl ${
        highlighted 
          ? 'border-2 border-blue-500 shadow-2xl bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/50 dark:to-indigo-950/50' 
          : 'border-0 shadow-xl bg-white dark:bg-gray-900 hover:shadow-2xl hover:bg-gradient-to-br hover:from-white hover:to-blue-50/30 dark:hover:from-gray-900 dark:hover:to-blue-950/30'
      } ${isHovered ? 'transform -translate-y-2' : ''}`}>
        <CardContent className="p-0">
          <div className="text-center mb-8">
            <motion.div 
              className="mb-6 flex justify-center"
              animate={{ rotate: isHovered ? 360 : 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className={`p-4 rounded-2xl ${
                title === "Free Trial" ? 'bg-gradient-to-br from-green-500 to-emerald-600' :
                title === "Pro" ? 'bg-gradient-to-br from-blue-500 to-indigo-600' :
                'bg-gradient-to-br from-purple-500 to-pink-600'
              } text-white shadow-xl`}>
                {title === "Free Trial" && <Sparkles className="h-8 w-8" />}
                {title === "Pro" && <Rocket className="h-8 w-8" />}
                {title === "Enterprise" && <Building className="h-8 w-8" />}
              </div>
            </motion.div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{title}</h3>
            <div className="mb-4">
              <span className="text-5xl font-bold text-gray-900 dark:text-white">{price}</span>
              {period && <span className="text-gray-600 dark:text-gray-400 ml-2 text-lg">{period}</span>}
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">{description}</p>
          </div>

          <ul className="space-y-4 mb-8">
            {features.map((feature, index) => (
              <motion.li 
                key={index} 
                className="flex items-start"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: delay + index * 0.1 }}
              >
                <motion.div
                  animate={{ scale: isHovered ? 1.2 : 1 }}
                  transition={{ duration: 0.3 }}
                  className="flex-shrink-0 mt-0.5"
                >
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                </motion.div>
                <span className="text-gray-700 dark:text-gray-300 text-sm ml-3 leading-relaxed">{feature}</span>
              </motion.li>
            ))}
          </ul>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              onClick={() => onSelectPlan(title)}
              className={`w-full py-4 rounded-xl font-bold text-base transition-all duration-300 shadow-lg hover:shadow-xl ${
                highlighted
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'
                  : 'bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900'
              }`}
            >
              {cta}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function Pricing() {
  const handleSelectPlan = (planTitle: string) => {
    if (planTitle === "Free Trial") {
      toast.success("Free Trial Started!", {
        description: "Welcome to Saanify! Your 15-day free trial has begun.",
        duration: 5000,
      })
    } else if (planTitle === "Pro") {
      toast.success("Pro Plan Selected!", {
        description: "Redirecting to payment setup...",
        duration: 3000,
      })
    } else if (planTitle === "Enterprise") {
      toast.success("Enterprise Plan!", {
        description: "Our sales team will contact you within 24 hours.",
        duration: 3000,
      })
    }
  }

  const handleContactSales = () => {
    toast.info("Sales Team Contact", {
      description: "Please call +91-XXXXXXXXXX or email sales@saanify.com",
      duration: 5000,
    })
  }

  const pricingPlans = [
    {
      title: "Free Trial",
      price: "Free",
      period: "15 Days",
      description: "Perfect for exploring our platform",
      features: [
        "Up to 50 members",
        "Basic member management",
        "Standard support",
        "Limited analytics",
        "Mobile app access"
      ],
      highlighted: false,
      delay: 0.1,
      cta: "Start Free Trial"
    },
    {
      title: "Pro",
      price: "₹4,000",
      period: "/month",
      description: "Best for growing societies",
      features: [
        "Up to 500 members",
        "Advanced member management",
        "Priority support",
        "Advanced analytics & reports",
        "Custom branding",
        "API access",
        "Automated workflows"
      ],
      highlighted: true,
      delay: 0.2,
      cta: "Get Started Now"
    },
    {
      title: "Enterprise",
      price: "₹10,000",
      period: "/month",
      description: "For large communities",
      features: [
        "Unlimited members",
        "White-label solution",
        "Dedicated account manager",
        "Custom integrations",
        "Advanced security features",
        "Custom training sessions",
        "SLA guarantee"
      ],
      highlighted: false,
      delay: 0.3,
      cta: "Contact Sales"
    }
  ]

  return (
    <section id="pricing" className="py-24 bg-gradient-to-br from-gray-50/50 to-blue-50/30 dark:from-gray-900/50 dark:to-blue-950/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Plans & Pricing
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Choose the perfect plan for your society. Scale as you grow with our flexible pricing options.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <PricingCard
              key={index}
              title={plan.title}
              price={plan.price}
              period={plan.period}
              description={plan.description}
              features={plan.features}
              highlighted={plan.highlighted}
              delay={plan.delay}
              cta={plan.cta}
              onSelectPlan={handleSelectPlan}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">
            Need a custom solution? We offer tailored plans for specific requirements.
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              onClick={handleContactSales}
              variant="outline" 
              className="border-2 border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white font-bold px-8 py-4 rounded-xl transition-all duration-300 text-base shadow-lg hover:shadow-xl"
            >
              Talk to Sales Team
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}