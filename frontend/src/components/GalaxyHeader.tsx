import { motion } from "framer-motion";
import Galaxy from "./Galaxy";
import TextType from "./TextType";

export default function GalaxyHeader() {
  return (
    <header
      className="relative isolate overflow-hidden min-h-screen"
      aria-label="Constellation header"
    >
      {/* Space for floating island nav above */}
      <div className="pt-28 md:pt-36" />

      {/* Canvas background (your effect lives only here) */}
      <div className="absolute inset-0">
        <Galaxy 
          mouseRepulsion={true}
          mouseInteraction={true}
          density={1.5}
          glowIntensity={0.35}
          saturation={0.0}
          hueShift={0}
        />
        {/* gradient fade into the next section's gray */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-[#1f2022] pointer-events-none" />
      </div>

      {/* Content overlay */}
      <div className="relative mx-auto max-w-6xl px-6 pb-20 md:pb-28 flex flex-col justify-center min-h-screen pointer-events-none">
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 18 }}
          className="text-6xl md:text-8xl font-bold tracking-tight text-blue-200"
        >
          Aegis
        </motion.h1>
        
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 100, damping: 18 }}
          className="mt-6 text-2xl md:text-3xl min-h-[3rem]"
        >
          <TextType 
            text={[
              "AI vigilance for safer schools",
              "Continuous threat monitoring", 
              "Human-verified security alerts"
            ]}
            typingSpeed={75}
            pauseDuration={1500}
            showCursor={true}
            cursorCharacter="|"
            loop={true}
            className="text-blue-400"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, type: "spring", stiffness: 100, damping: 18 }}
          className="mt-8 flex flex-wrap items-center gap-3"
        >
          <a
            href="/account"
            className="rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-m font-medium backdrop-blur hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/40 pointer-events-auto w-40 text-center"
          >
            Get started
          </a>
          <a
            href="#how-it-works"
            className="rounded-full border border-white/20 px-5 py-2.5 text-m font-medium hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/40 pointer-events-auto w-40 text-center"
          >
            How it works
          </a>
        </motion.div>
      </div>
    </header>
  );
}
