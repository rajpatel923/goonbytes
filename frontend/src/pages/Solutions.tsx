import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '@/components/ui/carousel'; // Carousel UI components
import { Card, CardContent } from '@/components/ui/card'; // Card UI components
import { motion } from 'framer-motion'; // Animation library
import { 
  DropletIcon, 
  LineChart, 
  Map, 
  Sprout, 
  ScanLine, 
  CloudSun 
} from 'lucide-react'; // Icon set
import { SolutionCard } from '@/components/ui/SolutionCard'; // Custom solution card

export default function Solutions() {

  // Image URLs for the carousel slideshow
  const imageUrls = [
    "/slideshow/1.png",
    "/slideshow/2.png",
    "/slideshow/3.png",
    "/slideshow/4.png",
    "/slideshow/5.png",
    "/slideshow/6.png",
    "/slideshow/7.png",
    "/slideshow/8.png",
    "/slideshow/9.png",
    "/slideshow/10.png",
  ];

  // List of solution features to display
  const solutions = [
    {
      icon: <Map className="w-5 h-5" />,
      title: "Global Soil Analysis",
      description: "Uses real-time global soil data to adapt planting strategies to changing conditions."
    },
    {
      icon: <DropletIcon className="w-5 h-5" />,
      title: "Resource Optimization",
      description: "Optimizes water and fertilizer application, reducing waste and environmental impact."
    },
    {
      icon: <Sprout className="w-5 h-5" />,
      title: "Fertility Management",
      description: "Predicts nutrient deficiencies and recommends eco-friendly fertilization to maintain fertility."
    },
    {
      icon: <LineChart className="w-5 h-5" />,
      title: "Yield Maximization",
      description: "Identifies the best crops and planting locations to enhance productivity and yield."
    },
    {
      icon: <ScanLine className="w-5 h-5" />,
      title: "Data-Driven Decision Making",
      description: "Transforms complex agricultural data into clear, actionable insights for farmers of all technical abilities."
    },
    {
      icon: <CloudSun className="w-5 h-5" />,
      title: "Climate Adaptation",
      description: "Projects climate changes and helps farms adapt with tailored recommendations for future conditions."
    }
  ];

  // Animation variants for fade-in effect
  const fadeInUpVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        {/* Background image with overlay */}
        <div className="absolute inset-0 opacity-10 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-neurocrop-green/20 to-background/5 z-10"></div>
          <img 
            src="https://images.unsplash.com/photo-1473448912268-2022ce9509d8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2340&q=80" 
            alt="Farm technology" 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="neurocrop-container relative z-10">
          <motion.div 
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              NeuroCrop <span className="text-primary">Solutions</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Our AI-powered platform provides innovative solutions to the most pressing challenges in modern agriculture.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Approach Section with Carousel */}
      <section className="py-16 bg-muted/30 border-y border-border/30">
        <div className="neurocrop-container">
          <motion.div
            className="text-center mb-12"
            variants={fadeInUpVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Our Approach
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See how we're reinventing agricultural planning through technology and data science.
            </p>
          </motion.div>

          {/* Image carousel */}
          <div className="aspect-video bg-card rounded-2xl border border-border/50 overflow-hidden flex items-center justify-center">
            <Carousel className="w-full max-w-4xl mx-auto">
              <CarouselContent>
                {imageUrls.map((url, index) => (
                  <CarouselItem key={index}>
                    <div className="p-1">
                      <Card className="border-none">
                        <CardContent className="flex aspect-video items-center justify-center p-0 relative overflow-hidden rounded-xl">
                          <img
                            src={url}
                            alt={`Slide ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </CardContent>
                      </Card>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="flex justify-center mt-4">
                <CarouselPrevious className="relative static" />
                <CarouselNext className="relative static ml-4" />
              </div>
            </Carousel>
          </div>
        </div>
      </section>

      {/* Solutions Grid Section */}
      <section className="py-20">
        <div className="neurocrop-container">
          <motion.div 
            className="text-center mb-16"
            variants={fadeInUpVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Our Innovative Solutions
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              NeuroCrop addresses agricultural challenges through cutting-edge technology and data-driven insights.
            </p>
          </motion.div>
          
          {/* Solution cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {solutions.map((solution, index) => (
              <SolutionCard
                key={index}
                icon={solution.icon}
                title={solution.title}
                description={solution.description}
                delay={100 * index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-20 bg-muted/30 border-y border-border/30">
        <div className="neurocrop-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold tracking-tight mb-6">
                Our Technology
              </h2>
              <div className="prose prose-lg">
                <p>
                  NeuroCrop's platform combines multiple advanced technologies to deliver powerful agricultural insights:
                </p>
                <ul>
                  <li><strong>Advanced Machine Learning</strong> - Our AI models continuously learn from global agricultural data to improve recommendations.</li>
                  <li><strong>Satellite Imagery Analysis</strong> - Real-time visualization of land conditions across different geographies.</li>
                  <li><strong>Climate Prediction</strong> - Sophisticated climate modeling to forecast conditions that affect crop growth.</li>
                  <li><strong>Soil Analysis</strong> - Comprehensive assessment of soil health indicators to optimize crop selection.</li>
                  <li><strong>Resource Management</strong> - Precision tools for managing water, fertilizer, and other critical resources.</li>
                </ul>
                <p>
                  This technological ecosystem works together to transform complex data into simple, actionable recommendations for farmers.
                </p>
              </div>
            </motion.div>
            
            {/* Technology image */}
            <motion.div
              className="relative h-[400px] lg:h-full rounded-2xl overflow-hidden"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
            >
              <img 
                src="https://th.bing.com/th/id/R.762b06c683e0bcb8f307d338633be92c?rik=OQ4ZUXgqif01%2fw&riu=http%3a%2f%2fsydney.edu.au%2fcontent%2fdam%2fcorporate%2fimages%2fnews-and-opinion%2fnews%2f2016%2fseptember%2fRIPPA-Nov-2015.jpg&ehk=JHbcGnjr5y2i5xgQooDMdlIR1ww2mN7Y%2b6uWhBy0gb0%3d&risl=&pid=ImgRaw&r=0" 
                alt="Agricultural technology" 
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}