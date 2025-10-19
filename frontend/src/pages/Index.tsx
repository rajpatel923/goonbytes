import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  Shield, 
  ScanLine, 
  AlarmClock
} from 'lucide-react'
import GalaxyHeader from '@/components/GalaxyHeader'

export default function Index() {
  return (
    <main className="bg-black text-white">
      {/* HEADER (Hero) — your nav already renders above; we just make room below it */}
      <GalaxyHeader />

      {/* How It Works */}
      <section aria-labelledby="how-it-works" className="bg-zinc-900/40 border-y border-white/5">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
          <h2 id="how-it-works" className="text-2xl md:text-3xl font-semibold tracking-tight">
            How it works
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-zinc-900/30 p-6 backdrop-blur">
              <ScanLine className="h-6 w-6" aria-hidden />
              <h3 className="mt-4 text-lg font-medium">1) Detect</h3>
              <p className="mt-2 text-zinc-300">
                AI models continuously analyze incoming camera frames (and optional
                audio) to flag weapons or gunshots.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-zinc-900/30 p-6 backdrop-blur">
              <Shield className="h-6 w-6" aria-hidden />
              <h3 className="mt-4 text-lg font-medium">2) Verify</h3>
              <p className="mt-2 text-zinc-300">
                Security approves or rejects each alert in the Events panel with a clear
                thumbnail, location, and confidence score.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-zinc-900/30 p-6 backdrop-blur">
              <AlarmClock className="h-6 w-6" aria-hidden />
              <h3 className="mt-4 text-lg font-medium">3) Escalate</h3>
              <p className="mt-2 text-zinc-300">
                On approval, the system notifies the principal and contacts the respective
                police department—automatically.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/5 bg-zinc-900/40">
        <div className="mx-auto max-w-6xl px-6 py-12 md:py-16 flex flex-col items-center text-center">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
            Ready to see Aegis in action?
          </h2>
          <p className="mt-3 max-w-2xl text-zinc-300">
            Explore the dashboard, review live alerts, and experience rapid escalation flows.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              to="/account"
              className="rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-medium backdrop-blur hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/40"
            >
              Log in / Create account
            </Link>
            <Link
              to="/contact"
              className="rounded-full border border-white/20 px-5 py-2.5 text-sm font-medium hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/40"
            >
              Request a demo
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}