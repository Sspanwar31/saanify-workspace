'use client'

import { motion, useState } from 'framer-motion'
import { Check, Star, ArrowRight, Zap, Shield, Crown } from 'lucide-react'
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
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
            <Star className="h-4 w-4 fill-current" />
            Most Popular
          </div>
        </motion.div>
      )}
      
      <Card className={`h-full p-8 relative cursor-pointer transition-all duration-300 ${
        highlighted 
          ? 'border-2 border-indigo-500 shadow-2xl bg-gradient-to-br from-indigo-50 to-blue-50' 
          : 'border-0 shadow-lg bg-white hover:shadow-xl'
      } ${isHovered ? 'transform -translate-y-2' : ''}`}>
        <CardContent className="p-0">
          <div className="text-center mb-8">
            <motion.div 
              className="mb-4 flex justify-center"
              animate={{ rotate: isHovered ? 360 : 0 }}
              transition={{ duration: 0.6 }}
            >
              {title === "Free Trial" && <Zap className="h-8 w-8 text-green-500" />}
              {title === "Pro" && <Shield className="h-8 w-8 text-blue-500" />}
              {title === "Enterprise" && <Crown className="h-8 w-8 text-purple-500" />}
            </motion.div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
            <div className="mb-4">
              <span className="text-4xl font-bold text-gray-900">{price}</span>
              {period && <span className="text-gray-600 ml-2">{period}</span>}
            </div>
            <p className="text-gray-600 text-sm">{description}</p>
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
                >
                  <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                </motion.div>
                <span className="text-gray-700 text-sm">{feature}</span>
              </motion.li>
            ))}
          </ul>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              onClick={() => onSelectPlan(title)}
              className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 ${
                highlighted
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl'
                  : 'bg-gray-900 hover:bg-gray-800 text-white'
              }`}
            >
              {cta}
              <ArrowRight className="ml-2 h-4 w-4" />
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
    <section id="pricing" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Plans & Pricing
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
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
          className="text-center mt-12"
        >
          <p className="text-gray-600 mb-4">
            Need a custom solution? We offer tailored plans for specific requirements.
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              onClick={handleContactSales}
              variant="outline" 
              className="border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white font-semibold px-8 py-3 rounded-lg transition-all duration-300"
            >
              Talk to Sales Team
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}