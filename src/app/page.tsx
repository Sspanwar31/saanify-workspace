import Navbar from '@/components/layout/Navbar'
import Hero from '@/components/home/Hero'
import Counters from '@/components/home/Counters'
import Features from '@/components/home/Features'
import CoreTools from '@/components/home/CoreTools'
import Pricing from '@/components/home/Pricing'
import Testimonials from '@/components/home/Testimonials'
import Footer from '@/components/home/Footer'
import GitHubToggle from '@/components/github/GitHubToggle'
import AIAssistant from '@/components/ai/AIAssistant'
import SupabaseOAuth from '@/components/supabase/SupabaseOAuth'

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <Counters />
      <Features />
      <CoreTools />
      <Pricing />
      <Testimonials />
      <Footer />
      <AIAssistant />
      <SupabaseOAuth />
    </div>
  )
}