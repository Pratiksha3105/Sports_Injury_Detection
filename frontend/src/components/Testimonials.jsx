import { motion } from 'framer-motion'
import { FaQuoteLeft, FaStar } from 'react-icons/fa'
import { DUMMY_TESTIMONIALS } from '../utils/constants'
import { fadeUp, staggerContainer } from '../animations/variants'
import GlassCard from './GlassCard'

export default function Testimonials() {
  return (
    <section className="section-container py-24">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={fadeUp}
        className="text-center mb-14"
      >
        <span className="text-pulse-400 font-mono text-sm tracking-widest uppercase">Trusted by athletes & coaches</span>
        <h2 className="text-3xl md:text-4xl font-bold mt-3">
          What early users are <span className="text-gradient">saying</span>
        </h2>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={staggerContainer}
        className="grid md:grid-cols-3 gap-6"
      >
        {DUMMY_TESTIMONIALS.map((t, i) => (
          <motion.div key={i} variants={fadeUp} custom={i * 0.1}>
            <GlassCard className="h-full flex flex-col">
              <FaQuoteLeft className="text-pulse-500/50 text-2xl mb-4" />
              <p className="text-slate-300 flex-1 leading-relaxed">{t.quote}</p>
              <div className="flex items-center gap-3 mt-6">
                <img src={t.avatar} alt={t.name} className="h-11 w-11 rounded-full object-cover border border-white/10" />
                <div>
                  <p className="font-semibold text-white text-sm">{t.name}</p>
                  <p className="text-xs text-slate-400">{t.role}</p>
                </div>
                <div className="ml-auto flex gap-0.5 text-amber-400 text-xs">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <FaStar key={idx} />
                  ))}
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
