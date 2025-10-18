import { Cloud, CloudRain, PiggyBank, Smile as SoilIcon, Thermometer as ThermometerIcon, Tractor } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '@/components/ui/carousel'; // Carousel components
import { Card, CardContent } from '@/components/ui/card'; // Card components
import { ProblemCard } from '@/components/ui/ProblemCard'; // Custom ProblemCard component
import { motion } from 'framer-motion'; // Animation library

export default function About() {

  // Image URLs for a potential slideshow or carousel
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

  // List of agricultural problems to display
  const problems = [
    {
      icon: <CloudRain className="w-5 h-5" />,
      title: "Unpredictable Climate",
      description: "Extreme weather events and shifting climate patterns make it harder to plan optimal planting strategies."
    },
    {
      icon: <SoilIcon className="w-5 h-5" />,
      title: "Soil Degradation",
      description: "Continuous farming depletes soil nutrients, reducing fertility and long-term yield potential."
    },
    {
      icon: <PiggyBank className="w-5 h-5" />,
      title: "Yield Uncertainty",
      description: "Without precise data, farmers struggle to determine what crops will thrive in specific soil conditions, leading to inefficient resource use."
    },
    {
      icon: <Cloud className="w-5 h-5" />,
      title: "Water and Resource Management",
      description: "Inefficient irrigation and fertilizer use lead to waste and environmental harm."
    },
    {
      icon: <ThermometerIcon className="w-5 h-5" />,
      title: "Limited Access to Data-Driven Insights",
      description: "Many farmers lack the tools to analyze soil conditions accurately, making decision-making guesswork rather than science."
    },
    {
      icon: <Tractor className="w-5 h-5" />,
      title: "Technology Adoption Barriers",
      description: "Traditional farming methods are resistant to technological innovations, slowing the transition to more efficient practices."
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
      {/* Hero Section with background image */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-neurocrop-green/20 to-background/5 z-10"></div>
          <img
            src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80"
            alt="Farming landscape"
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
              Addressing the <span className="text-primary">Challenges</span> of Modern Agriculture
            </h1>
            <p className="text-xl text-muted-foreground">
              Agriculture today faces unprecedented challenges, from climate change to resource depletion.
              NeuroCrop was built to provide solutions to these growing concerns.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Team Section */}
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
              Meet Our Team
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our diverse team of agricultural experts, data scientists, and technologists is dedicated to revolutionizing farming practices.
            </p>
          </motion.div>

          {/* Team member images */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex justify-center">
              <div className="aspect-square w-full max-w-[300px] bg-muted rounded-2xl animate-pulse-gentle">
                <img src="/.jpeg"></img>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="aspect-square w-full max-w-[300px] bg-muted rounded-2xl animate-pulse-gentle">
                <img src="/.jpeg"></img>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="aspect-square w-full max-w-[300px] bg-muted rounded-2xl animate-pulse-gentle">
                <img src="/.jpeg"></img>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="aspect-square w-full max-w-[300px] bg-muted rounded-2xl animate-pulse-gentle">
                <img src="/.jpeg"></img>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problems Section */}
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
              Many Challenges in Modern Agriculture
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The agricultural industry faces numerous obstacles that impact productivity, sustainability, and profitability.
            </p>
          </motion.div>

          {/* List of problems using ProblemCard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {problems.map((problem, index) => (
              <ProblemCard
                key={index}
                icon={problem.icon}
                title={problem.title}
                description={problem.description}
                delay={100 * index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-muted/30 border-y border-border/30">
        <div className="neurocrop-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              className="relative h-[400px] lg:h-full rounded-2xl overflow-hidden"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
            >
              <img
                src="https://images.unsplash.com/photo-1592982537447-7440770cbfc9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2069&q=80"
                alt="Sustainable farming"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold tracking-tight mb-6">
                Our Mission
              </h2>
              <div className="prose prose-lg">
                <p>
                  At NeuroCrop, we're on a mission to transform agriculture through the power of data and artificial intelligence. We believe that by providing farmers with precise, actionable insights, we can help increase yields, reduce environmental impact, and create a more sustainable food system.
                </p>
                <p>
                  Our platform combines cutting-edge AI technology with comprehensive agricultural data to provide recommendations that are tailored to each farmer's unique circumstances. By analyzing thousands of variables—from soil composition to climate patterns—we deliver insights that would be impossible to generate manually.
                </p>
                <p>
                  We're committed to supporting farmers in their transition to more sustainable and profitable practices. Our goal is to make precision agriculture accessible to everyone, regardless of farm size or technical expertise.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

    </div>
  )
}