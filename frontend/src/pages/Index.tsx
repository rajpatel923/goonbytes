import { motion, useInView } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  Shield, 
  ScanLine, 
  AlarmClock,
  AlertTriangle,
  Clock,
  Users,
  CheckCircle2,
  Zap,
  Eye,
  Bell,
  TrendingUp
} from 'lucide-react'
import GalaxyHeader from '@/components/GalaxyHeader'
import { useRef } from 'react'
import MagicBento from '@/components/MagicBento'

export default function Index() {
  const problemRef = useRef(null)
  const statsRef = useRef(null)
  const solutionRef = useRef(null)
  const howItWorksRef = useRef(null)
  
  const isProblemInView = useInView(problemRef, { once: true, amount: 0.3 })
  const isStatsInView = useInView(statsRef, { once: true, amount: 0.3 })
  const isSolutionInView = useInView(solutionRef, { once: true, amount: 0.3 })
  const isHowItWorksInView = useInView(howItWorksRef, { once: true, amount: 0.2 })

  const fadeInUpVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.5 }
    }
  }

  return (
    <main className="bg-black text-white">
      <GalaxyHeader />

      {/* Problem Statement */}
      <section 
        ref={problemRef}
        className="bg-gradient-to-b from-[#1f2022] to-[#171819] py-16 md:py-24 overflow-hidden"
      >
        <div className="mx-auto max-w-6xl px-6">
          <motion.div
            initial="hidden"
            animate={isProblemInView ? "visible" : "hidden"}
            variants={fadeInUpVariants}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-4 py-1.5 mb-6">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <span className="text-sm font-medium text-red-300">Critical Challenge</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              School Safety Can't Wait
            </h2>
            <p className="text-lg md:text-xl text-zinc-300 max-w-3xl mx-auto leading-relaxed">
              Every year, thousands of schools face security threats that could be prevented or 
              mitigated with faster detection and response times. Traditional security systems 
              can't keep pace with modern threats.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            animate={isProblemInView ? "visible" : "hidden"}
            variants={staggerContainer}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-12"
          >
            <motion.div 
              variants={cardVariants}
              className="group relative rounded-2xl border border-white/10 bg-zinc-900/40 p-6 backdrop-blur hover:border-red-500/30 transition-colors"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
              <Clock className="h-8 w-8 text-red-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Delayed Response</h3>
              <p className="text-zinc-400">
                Manual monitoring leads to critical delays in identifying and responding to threats,
                often missing early warning signs.
              </p>
            </motion.div>

            <motion.div 
              variants={cardVariants}
              className="group relative rounded-2xl border border-white/10 bg-zinc-900/40 p-6 backdrop-blur hover:border-red-500/30 transition-colors"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
              <Users className="h-8 w-8 text-red-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Human Limitations</h3>
              <p className="text-zinc-400">
                Security personnel can't monitor dozens of camera feeds 24/7, creating blind spots
                in coverage and reaction time.
              </p>
            </motion.div>

            <motion.div 
              variants={cardVariants}
              className="group relative rounded-2xl border border-white/10 bg-zinc-900/40 p-6 backdrop-blur hover:border-red-500/30 transition-colors"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
              <AlertTriangle className="h-8 w-8 text-red-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">False Alarms</h3>
              <p className="text-zinc-400">
                Legacy systems generate overwhelming false positives, causing alert fatigue
                and reducing trust in security infrastructure.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section 
        ref={statsRef}
        className="bg-[#171819] py-16 border-y border-white/5"
      >
        <div className="mx-auto max-w-6xl px-6">
          <motion.div
            initial="hidden"
            animate={isStatsInView ? "visible" : "hidden"}
            variants={staggerContainer}
            className="grid gap-8 md:grid-cols-3"
          >
            <motion.div 
              variants={cardVariants}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl font-bold text-blue-400 mb-2">
                <TrendingUp className="inline h-10 w-10 mb-2" />
                <div>98%</div>
              </div>
              <p className="text-lg text-zinc-300 font-medium">Detection Accuracy</p>
              <p className="text-sm text-zinc-500 mt-1">AI-powered threat identification</p>
            </motion.div>

            <motion.div 
              variants={cardVariants}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl font-bold text-blue-400 mb-2">
                <Zap className="inline h-10 w-10 mb-2" />
                <div>&lt;3s</div>
              </div>
              <p className="text-lg text-zinc-300 font-medium">Alert Response Time</p>
              <p className="text-sm text-zinc-500 mt-1">From detection to notification</p>
            </motion.div>

            <motion.div 
              variants={cardVariants}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl font-bold text-blue-400 mb-2">
                <CheckCircle2 className="inline h-10 w-10 mb-2" />
                <div>24/7</div>
              </div>
              <p className="text-lg text-zinc-300 font-medium">Continuous Monitoring</p>
              <p className="text-sm text-zinc-500 mt-1">Never-sleeping AI vigilance</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Solution Section */}
      <section 
        ref={solutionRef}
        className="bg-gradient-to-b from-[#171819] to-[#1f2022] py-16 md:py-24"
      >
        <div className="mx-auto max-w-6xl px-6">
          <motion.div
            initial="hidden"
            animate={isSolutionInView ? "visible" : "hidden"}
            variants={fadeInUpVariants}
            className="text-center "
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-1.5 mb-6">
              <CheckCircle2 className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-300">Our Solution</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              AI-Powered School Security
            </h2>
            <p className="text-lg md:text-xl text-zinc-300 max-w-3xl mx-auto leading-relaxed">
              Aegis transforms your existing security infrastructure into an intelligent threat 
              detection system that works around the clock to keep schools safe.
            </p>
            <MagicBento 
              textAutoHide={true}
              enableStars={true}
              enableSpotlight={true}
              enableBorderGlow={true}
              enableTilt={true}
              enableMagnetism={false}
              clickEffect={true}
              spotlightRadius={300}
              particleCount={12}
              glowColor="59, 130, 246"
              items={[
                {
                  color: '#1F2022',
                  title: 'Computer Vision AI',
                  description:
                    "Our advanced AI models analyze video feeds in real-time, detecting weapons, aggressive behavior, and suspicious activities with industry-leading accuracy. The system learns and adapts to your school's unique environment.",
                  icon: <Eye className="h-10 w-10 text-blue-400" />,
                  maxLines: 4,
                },
                {
                  color: '#1F2022',
                  title: 'Smart Audio Detection',
                  description:
                    'Audio analysis identifies gunshots, breaking glass, and distress calls. Our multi-modal approach combines visual and audio cues to provide comprehensive threat detection with minimal false positives.',
                  icon: <Bell className="h-10 w-10 text-blue-400" />,
                  maxLines: 4,
                },
                {
                  color: '#1F2022',
                  title: 'Human-in-the-Loop',
                  description:
                    'Security personnel verify AI detections through an intuitive dashboard before escalation. This approach eliminates false alarms while maintaining rapid response times and building trust in the system.',
                  icon: <Shield className="h-10 w-10 text-blue-400" />,
                  maxLines: 4,
                },
                {
                  color: '#1F2022',
                  title: 'Instant Escalation',
                  description:
                    'Once verified, threats are immediately escalated to school administration and law enforcement with precise location data, camera feeds, and threat details—enabling the fastest possible response.',
                  icon: <Zap className="h-10 w-10 text-blue-400" />,
                  maxLines: 4,
                },
              ]}
            />
          </motion.div>
        </div>
      </section>
            <section 
        ref={howItWorksRef}
        aria-labelledby="how-it-works" 
        className="bg-[#1f2022] py-16 md:py-24"
      >
        <div className="mx-auto max-w-6xl px-6">
          <motion.div
            initial="hidden"
            animate={isHowItWorksInView ? "visible" : "hidden"}
            variants={fadeInUpVariants}
            className="text-center mb-12"
          >
            
            <h2 id="how-it-works" className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              How It Works
            </h2>
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
              Three simple steps to transform your security infrastructure
            </p>
            {/* MagicBento for How It Works: Detect / Verify / Escalate */}
            <div className="mt-8">
            </div>
          </motion.div>
        </div>
      </section>
      <div className='bg-[#1f2022] mt-[-80px] pb-16 text-center'>
        <MagicBento
                textAutoHide={true}
                enableStars={true}
                enableSpotlight={true}
                enableBorderGlow={true}
                enableTilt={true}
                enableMagnetism={false}
                clickEffect={true}
                spotlightRadius={220}
                particleCount={8}
                glowColor="59, 130, 246"
                columns={3}

                items={[
                  {
                    color: '#1F2022',
                    title: 'Detect',
                    description:
                      'AI models continuously analyze incoming camera frames and optional audio streams to flag weapons, threats, or gunshots with precision.',
                    icon: <ScanLine className="h-10 w-10 text-blue-400" />,
                    maxLines: 3,
                  },
                  {
                    color: '#1F2022',
                    title: 'Verify',
                    description:
                      'Security personnel approve or reject each alert in the Events panel with a clear thumbnail, location data, and confidence score for informed decisions.',
                    icon: <Shield className="h-10 w-10 text-blue-400" />,
                    maxLines: 3,
                  },
                  {
                    color: '#1F2022',
                    title: 'Escalate',
                    description:
                      'On approval, the system instantly notifies school administration and contacts local law enforcement automatically—no delays, no missed alerts.',
                    icon: <AlarmClock className="h-10 w-10 text-blue-400" />,
                    maxLines: 3,
                  },
                ]}
              />
              </div>


      {/* CTA */}
      <section className="bg-gradient-to-b from-[#1f2022] to-black py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-blue-500/10 to-transparent p-12 text-center overflow-hidden backdrop-blur"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                Ready to See Aegis in Action?
              </h2>
              <p className="text-lg text-zinc-300 max-w-2xl mx-auto mb-8">
                Explore the dashboard, review live alerts, and experience rapid escalation flows 
                that can save lives.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link
                  to="/account"
                  className="group relative rounded-full border border-blue-500/30 bg-blue-500/20 px-8 py-3 text-base font-medium backdrop-blur hover:bg-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                >
                  <span className="relative z-10">Get Started Now</span>
                  <div className="absolute inset-0 rounded-full bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
                <Link
                  to="/contact"
                  className="rounded-full border border-white/20 px-8 py-3 text-base font-medium hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
                >
                  Request a Demo
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  )
}