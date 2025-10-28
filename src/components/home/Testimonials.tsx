'use client'

import { motion } from 'framer-motion'
import { Star, Quote } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface TestimonialProps {
  name: string
  role: string
  society: string
  content: string
  rating: number
  delay: number
}

function TestimonialCard({ name, role, society, content, rating, delay }: TestimonialProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true }}
    >
      <Card className="h-full p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-white">
        <CardContent className="p-0">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
              {name.charAt(0)}
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">{name}</h4>
              <p className="text-sm text-gray-600">{role}</p>
              <p className="text-xs text-indigo-600 font-medium">{society}</p>
            </div>
          </div>
          
          <div className="flex mb-3">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                }`}
              />
            ))}
          </div>

          <div className="relative">
            <Quote className="absolute -top-2 -left-2 h-8 w-8 text-indigo-100" />
            <p className="text-gray-700 text-sm leading-relaxed pl-6 italic">
              {content}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function Testimonials() {
  const testimonials = [
    {
      name: "Rajesh Kumar",
      role: "Society Secretary",
      society: "Green Valley Gardens",
      content: "Saanify has transformed how we manage our society. The automated features have saved us countless hours, and members love the transparency.",
      rating: 5,
      delay: 0.1
    },
    {
      name: "Priya Sharma",
      role: "Treasurer",
      society: "Sunset Apartments",
      content: "The financial tracking and reporting features are exceptional. We've improved our collection rate by 40% since implementing Saanify.",
      rating: 5,
      delay: 0.2
    },
    {
      name: "Amit Patel",
      role: "Managing Committee",
      society: "Ocean View Residency",
      content: "Best decision we made for our society management. The support team is amazing, and the platform keeps getting better with new features.",
      rating: 5,
      delay: 0.3
    }
  ]

  const trustedSocieties = [
    "Green Valley Gardens",
    "Sunset Apartments",
    "Ocean View Residency",
    "Maple Heights",
    "Royal Palm Estates",
    "Blue Haven Society",
    "Golden Gate Community",
    "Silver Oak Residency"
  ]

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Testimonials Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            What Our Customers Say
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Hear from society managers who have transformed their operations with Saanify
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={index}
              name={testimonial.name}
              role={testimonial.role}
              society={testimonial.society}
              content={testimonial.content}
              rating={testimonial.rating}
              delay={testimonial.delay}
            />
          ))}
        </div>

        {/* Trusted By Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Trusted by 500+ Societies Worldwide
            </h3>
            <p className="text-gray-600">
              Join thousands of satisfied communities using Saanify
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {trustedSocieties.map((society, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                viewport={{ once: true }}
                className="flex items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-300"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xs mx-auto mb-2">
                    {society.substring(0, 2).toUpperCase()}
                  </div>
                  <p className="text-sm font-medium text-gray-700">{society}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}