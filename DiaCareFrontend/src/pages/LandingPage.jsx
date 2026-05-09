import Navbar from '../components/landing/Navbar'
import Hero from '../components/landing/Hero'
import Stats from '../components/landing/Stats'
import Welcome from '../components/landing/Welcome'
import HowItWorks from '../components/landing/HowItWorks'
import Features from '../components/landing/Features'
import Testimonials from '../components/landing/Testimonials'
import Contact from '../components/landing/Contact'
import Blog from '../components/landing/Blog'
import CTA from '../components/landing/CTA'
import Footer from '../components/landing/Footer'
import BackToTop from '../components/ui/BackToTop'

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <Hero />
      <Stats />
      <Welcome />
      <HowItWorks />
      <Features />
      <Testimonials />
      <Contact />
      <Blog />
      <CTA />
      <Footer />
      <BackToTop />
    </div>
  )
}
