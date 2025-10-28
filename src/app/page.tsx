import Hero from '@/components/home/Hero'
import Features from '@/components/home/Features'
import CoreTools from '@/components/home/CoreTools'
import Demo from '@/components/home/Demo'
import Pricing from '@/components/home/Pricing'
import Testimonials from '@/components/home/Testimonials'
import Footer from '@/components/home/Footer'
import GitHubToggle from '@/components/github/GitHubToggle'

export default function Home() {
  return (
    <div className="min-h-screen">
      <Hero />
      <Features />
      <CoreTools />
      <Demo />
      <Pricing />
      <Testimonials />
      <Footer />
      <GitHubToggle />
    </div>
  )
}