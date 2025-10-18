import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { FeatureCard } from '@/components/ui/FeatureCard'
import { 
  BarChart3, 
  Leaf, 
  Map, 
  DropletIcon, 
  CloudRain, 
  Sprout as Seedling,
  CloudSun
} from 'lucide-react'
import { AuthModal } from '@/components/auth/AuthModal'
import { useAuth } from '@/hooks/useAuth'

// Animation variants for features grid
const staggerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
}

export default function Index() {
  // Modal state for authentication
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authModalView, setAuthModalView] = useState<'login' | 'signup'>('signup')
  const featuresRef = useRef(null)
  const isInView = useInView(featuresRef, { once: true, margin: "-100px 0px" })
  const navigate = useNavigate()
  const { user } = useAuth()

  // Parallax scroll effect for hero section
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      const heroImage = document.querySelector('.hero-image') as HTMLElement
      const heroContent = document.querySelector('.hero-content') as HTMLElement
      
      if (heroImage && heroContent) {
        heroImage.style.transform = `translateY(${scrollY * 0.2}px)`
        heroContent.style.transform = `translateY(${scrollY * 0.1}px)`
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Handle "Get Started" button click
  const handleGetStarted = () => {
    if (user) {
      navigate('/map-tool')
    } else {
      setAuthModalView('signup')
      setAuthModalOpen(true)
    }
  }

  // Feature cards data
  const features = [
    {
      title: "AI-Powered Recommendations",
      description: "Our advanced AI analyzes thousands of data points to recommend the best crops for your specific location.",
      icon: <BarChart3 className="w-6 h-6" />
    },
    {
      title: "Interactive Map Analysis",
      description: "Explore soil conditions, climate patterns, and agricultural potential anywhere in the world with our interactive map.",
      icon: <Map className="w-6 h-6" />
    },
    {
      title: "Resource Optimization",
      description: "Make the most of your water, fertilizer, and other resources with precision agriculture insights.",
      icon: <DropletIcon className="w-6 h-6" />
    },
    {
      title: "Climate Intelligence",
      description: "Stay ahead of changing weather patterns with our climate analysis and predictive tools.",
      icon: <CloudRain className="w-6 h-6" />
    },
    {
      title: "Crop Planning",
      description: "Plan your planting schedule and rotations for maximum yield and sustainability.",
      icon: <Seedling className="w-6 h-6" />
    },
    {
      title: "Seasonal Forecasting",
      description: "Get ahead of seasonal changes with long-term forecasting and trend analysis.",
      icon: <CloudSun className="w-6 h-6" />
    }
  ]

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative pt-20 overflow-hidden">
        <div className="hero-image absolute w-full h-full top-0 left-0 opacity-50 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-neurocrop-green/20 to-background/5 z-10"></div>
          <img 
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=3540&q=80" 
            alt="Agriculture background" 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="neurocrop-container relative z-10 pt-20 pb-24 md:pt-32 md:pb-40">
          <motion.div 
            className="hero-content max-w-4xl mx-auto text-center space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center justify-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
            >
              <Leaf className="w-4 h-4" />
              <span>AI-Powered Precision Agriculture</span>
            </motion.div>
            
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Grow Smarter with <span className="text-primary">NeuroCrop</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              The future of agriculture at your fingertips. Make data-driven decisions about what to plant, where to plant, and how to optimize resources.
            </p>

            <p className="text-xl max-w-2xl mx-auto">
            Team #1602-1
            </p>
            
            <div className="flex flex-wrap gap-4 justify-center pt-8">
              <Button size="lg" className="button-animated" onClick={handleGetStarted}>
                Get Started
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/map-tool">
                  Explore Map Tool
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
        
        <div className="absolute bottom-0 w-full h-24 bg-gradient-to-t from-background to-transparent"></div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative" ref={featuresRef}>
        <div className="absolute inset-0 bg-gradient-to-b from-neurocrop-green/5 to-background/0 z-0"></div>
        <div className="neurocrop-container relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <motion.h2 
              className="text-3xl md:text-4xl font-bold tracking-tight mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5 }}
            >
              A Complete Agricultural Intelligence Platform
            </motion.h2>
            <motion.p 
              className="text-lg text-muted-foreground"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Everything you need to make informed agricultural decisions based on data, not guesswork.
            </motion.p>
          </div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={staggerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
          >
            {/* Render feature cards */}
            {features.map((feature, index) => (
              <motion.div key={index} variants={itemVariants}>
                <FeatureCard
                  title={feature.title}
                  description={feature.description}
                  icon={feature.icon}
                  className="h-full"
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Call-to-action Section */}
      <section className="py-20 bg-muted/50">
        <div className="neurocrop-container">
          <div className="bg-card rounded-3xl overflow-hidden border border-border/50 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-5">
              <div className="col-span-3 p-8 md:p-12">
                <motion.div 
                  className="max-w-lg"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                    Ready to transform your agricultural approach?
                  </h2>
                  <p className="text-lg text-muted-foreground mb-8">
                    Join thousands of farmers and agricultural organizations using NeuroCrop to optimize crop selection, resource usage, and yield potential.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Button size="lg" className="button-animated" onClick={() => setAuthModalOpen(true)}>
                      Create Free Account
                    </Button>
                    <Button size="lg" variant="outline" asChild>
                      <Link to="/solutions">
                        Learn More
                      </Link>
                    </Button>
                  </div>
                </motion.div>
              </div>
              <div className="col-span-2 relative min-h-[300px] lg:min-h-0">
                <img 
                  src="https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80" 
                  alt="Farming with technology" 
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-card to-transparent lg:from-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Auth Modal */}
      <AuthModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        defaultView={authModalView}
      />
    </div>
  )
}