'use client'

import { useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import Hero from '@/components/home/Hero'
import Counters from '@/components/home/Counters'
import Features from '@/components/home/Features'
import CoreTools from '@/components/home/CoreTools'
import Pricing from '@/components/home/Pricing'
import Testimonials from '@/components/home/Testimonials'
import Footer from '@/components/home/Footer'
import GitHubToggle from '@/components/github/GitHubToggle'
import LoginModal from '@/components/auth/LoginModal'

export default function Home() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Navbar />
      <Hero onOpenLoginModal={() => setIsLoginModalOpen(true)} />
      <Counters />
      <Features />
      <CoreTools />
      <Pricing />
      <Testimonials />
      <Footer />
      <GitHubToggle />
      <LoginModal isOpen={isLoginModalOpen} onOpenChange={setIsLoginModalOpen} />
    </div>
  )
}