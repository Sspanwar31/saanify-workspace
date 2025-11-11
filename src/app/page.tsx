import Navbar from '@/components/layout/Navbar'
import Hero from '@/components/home/Hero'
import Counters from '@/components/home/Counters'
import Features from '@/components/home/Features'
import CoreTools from '@/components/home/CoreTools'
import Pricing from '@/components/home/Pricing'
import Testimonials from '@/components/home/Testimonials'
import Footer from '@/components/home/Footer'
// SupabaseCloudPanel - Visible and functional (shows "Open Cloud Panel" button)
import SupabaseCloudPanel from '@/components/SupabaseCloudPanel'
// SupabaseAutoSync - Hidden from UI (Supabase Auto-Sync System section)
import SupabaseAutoSync from '@/components/SupabaseAutoSync'

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
      {/* ✅ "Open Cloud Panel" button - Visible and functional */}
      <SupabaseCloudPanel />
      
      {/* 🚫 "Supabase Auto-Sync System" section - Hidden from UI */}
      {/* {false && <SupabaseAutoSync />} */}
      
      {/* Backend automation remains active - component imported but not rendered */}
    </div>
  )
}