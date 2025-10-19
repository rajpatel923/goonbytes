import { motion } from 'framer-motion';

export default function About() {
  
  const fadeInUpVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  return (
    <div className="min-h-screen pt-20 bg-[#1f2022]">
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-neurocrop-green/20 to-background/5 z-10"></div>
          <img
            src="https://i.pinimg.com/originals/15/09/96/150996d5036e9230edc3fc48decaecd4.jpg"
            alt="Security camera overlooking a school hallway"
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
            <h1 className="text-4xl md:text-5xl font-bold text-blue-200 tracking-tight mb-6">
              Safer Schools with <span className="text-blue-500">AI Vision</span> and Audio Detection
            </h1>
            <p className="text-xl text-muted-foreground text-blue-100">
              We integrate AI-powered vision and audio detection into existing security cameras to identify threats
              like weapons, aggressive actions, and gunshots in real time—helping staff respond faster and keep
              students and educators safe.
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
            <h2 className="text-3xl font-bold tracking-tight mb-4 text-blue-200">Who We Are</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-blue-100">
              We are computer vision engineers, ML researchers, and campus safety advocates building privacy-first
              detection that runs at the edge, minimizes false alarms, and alerts the right people in seconds.
            </p>
          </motion.div>

          {/* Team member images */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex justify-center">
              <div className="aspect-square w-full max-w-[300px] bg-muted rounded-2xl animate-pulse-gentle">
                <img src="/placeholder.svg" alt="Team member" className="w-full h-full object-cover rounded-2xl" />
              </div>
            </div>
            <div className="flex justify-center">
              <div className="aspect-square w-full max-w-[300px] bg-muted rounded-2xl animate-pulse-gentle">
                <img src="/placeholder.svg" alt="Team member" className="w-full h-full object-cover rounded-2xl" />
              </div>
            </div>
            <div className="flex justify-center">
              <div className="aspect-square w-full max-w-[300px] bg-muted rounded-2xl animate-pulse-gentle">
                <img src="/placeholder.svg" alt="Team member" className="w-full h-full object-cover rounded-2xl" />
              </div>
            </div>
            <div className="flex justify-center">
              <div className="aspect-square w-full max-w-[300px] bg-muted rounded-2xl animate-pulse-gentle">
                <img src="/placeholder.svg" alt="Team member" className="w-full h-full object-cover rounded-2xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}