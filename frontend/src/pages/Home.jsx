import { motion } from 'framer-motion'
import {
  FaPlay, FaChartLine, FaVideo, FaBrain, FaShieldAlt, FaUserMd,
  FaRunning, FaBasketballBall, FaFutbol, FaDumbbell, FaArrowRight,
} from 'react-icons/fa'
import MainLayout from '../layouts/MainLayout'
import Button from '../components/Button'
import GlassCard from '../components/GlassCard'
import StatCard from '../components/StatCard'
import PoseIllustration from '../components/PoseIllustration'
import Testimonials from '../components/Testimonials'
import FAQAccordion from '../components/FAQAccordion'
import { fadeUp, staggerContainer, slideInLeft, slideInRight } from '../animations/variants'

const FEATURES = [
  {
    icon: FaVideo,
    title: 'Upload any training video',
    desc: 'Drag and drop footage from a phone, action cam, or team recording — no special equipment required.',
  },
  {
    icon: FaBrain,
    title: 'Movement pattern analysis',
    desc: 'Frame-by-frame breakdown of joint angles and load distribution across a rep, sprint, or landing.',
  },
  {
    icon: FaChartLine,
    title: 'Risk trend over time',
    desc: 'Track how risk scores shift across a season, not just a single upload, so drift shows up early.',
  },
  {
    icon: FaShieldAlt,
    title: 'Private by default',
    desc: 'Videos and predictions stay tied to your account unless you explicitly share them with a coach.',
  },
]

const HOW_IT_WORKS = [
  { title: 'Upload', desc: 'Add a training or match clip in MP4, MOV or AVI.' },
  { title: 'Process', desc: 'The pipeline extracts frames and tracks body movement.' },
  { title: 'Review', desc: 'See a risk level, flagged body part, and a plain-language note.' },
  { title: 'Act', desc: 'Share the result with your coach or physio and adjust training load.' },
]

const SPORTS = [
  { icon: FaRunning, label: 'Running & Sprinting' },
  { icon: FaBasketballBall, label: 'Basketball' },
  { icon: FaFutbol, label: 'Football' },
  { icon: FaDumbbell, label: 'Weightlifting' },
]

export default function Home() {
  return (
    <MainLayout>
      {/* ---------------- HERO ---------------- */}
      <section className="relative overflow-hidden bg-hero-gradient">
        <div className="section-container grid lg:grid-cols-2 gap-12 items-center py-20 lg:py-28">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
            <motion.span
              variants={fadeUp}
              className="inline-block px-4 py-1.5 rounded-full border border-pulse-500/30 bg-pulse-500/10 text-pulse-400 text-xs font-mono tracking-wide mb-6"
            >
              FINAL YEAR PROJECT · MILESTONE 1 OF 5
            </motion.span>

            <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] mb-6">
              Catch injury risk <span className="text-gradient">before</span> it becomes an injury
            </motion.h1>

            <motion.p variants={fadeUp} className="text-lg text-slate-400 leading-relaxed mb-8 max-w-xl">
              PulseGuard AI analyzes training and match footage to flag movement
              patterns linked to elevated injury risk — giving athletes and
              coaches a visual, evidence-based reason to adjust before an injury happens.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap gap-4 mb-10">
              <Button to="/register" variant="primary" icon={FaArrowRight}>Get Started Free</Button>
              <Button to="/about" variant="outline" icon={FaPlay}>See How It Works</Button>
            </motion.div>

            <motion.div variants={fadeUp} className="grid grid-cols-3 gap-4 max-w-md">
              <StatCard label="Videos analyzed" value={12480} suffix="+" accent="pulse" />
              <StatCard label="Athletes onboard" value={3200} suffix="+" accent="neural" />
              <StatCard label="Risk flags raised" value={956} suffix="" accent="alert" />
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative flex justify-center"
          >
            <div className="absolute -inset-10 bg-pulse-500/10 blur-3xl rounded-full animate-pulse-slow" />
            <div className="relative w-full max-w-sm animate-float">
              <PoseIllustration />
            </div>
          </motion.div>
        </div>

        {/* Sports strip */}
        <div className="border-y border-white/5 bg-midnight-950/40 backdrop-blur-sm">
          <div className="section-container py-6 flex flex-wrap justify-center gap-x-10 gap-y-4">
            {SPORTS.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-slate-400 text-sm">
                <Icon className="text-pulse-400" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- FEATURES ---------------- */}
      <section className="section-container py-24">
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }}
          variants={fadeUp} className="text-center mb-16"
        >
          <span className="text-pulse-400 font-mono text-sm tracking-widest uppercase">Features</span>
          <h2 className="text-3xl md:text-4xl font-bold mt-3">
            Built for how athletes actually <span className="text-gradient">train</span>
          </h2>
        </motion.div>

        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }}
          variants={staggerContainer} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {FEATURES.map(({ icon: Icon, title, desc }, i) => (
            <motion.div key={i} variants={fadeUp} custom={i * 0.1}>
              <GlassCard className="h-full">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-pulse-500/20 to-neural-500/20 flex items-center justify-center mb-4">
                  <Icon className="text-pulse-400 text-xl" />
                </div>
                <h3 className="font-semibold text-white mb-2">{title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ---------------- BENEFITS ---------------- */}
      <section className="section-container py-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }}
            variants={slideInLeft}
          >
            <img
              src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=900&q=80&auto=format&fit=crop"
              alt="Athlete undergoing biomechanical movement analysis"
              className="rounded-2xl w-full h-[420px] object-cover shadow-glass border border-white/10"
              loading="lazy"
            />
          </motion.div>

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }}
            variants={slideInRight}
          >
            <span className="text-neural-400 font-mono text-sm tracking-widest uppercase">Why it matters</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-3 mb-6">
              Most injuries build up <span className="text-gradient">quietly</span>
            </h2>
            <div className="space-y-5">
              {[
                { icon: FaUserMd, title: 'Objective, not anecdotal', desc: 'Replaces "it just felt off" with a specific joint, angle, and frame.' },
                { icon: FaChartLine, title: 'Trend, not a single snapshot', desc: 'Risk is tracked across sessions so gradual overload is visible early.' },
                { icon: FaShieldAlt, title: 'A second pair of eyes', desc: 'Supports the coach and physio — it never replaces their judgment.' },
              ].map(({ icon: Icon, title, desc }, i) => (
                <div key={i} className="flex gap-4">
                  <div className="h-10 w-10 rounded-lg bg-pulse-500/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="text-pulse-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">{title}</h4>
                    <p className="text-sm text-slate-400">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ---------------- HOW IT WORKS ---------------- */}
      <section className="section-container py-24">
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }}
          variants={fadeUp} className="text-center mb-16"
        >
          <span className="text-pulse-400 font-mono text-sm tracking-widest uppercase">How it works</span>
          <h2 className="text-3xl md:text-4xl font-bold mt-3">
            From footage to feedback in <span className="text-gradient">four steps</span>
          </h2>
        </motion.div>

        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }}
          variants={staggerContainer} className="grid md:grid-cols-4 gap-6"
        >
          {HOW_IT_WORKS.map((step, i) => (
            <motion.div key={i} variants={fadeUp} custom={i * 0.1} className="relative">
              <GlassCard className="h-full">
                <span className="font-mono text-4xl font-bold text-pulse-500/30">{`0${i + 1}`}</span>
                <h3 className="font-semibold text-white mt-3 mb-2">{step.title}</h3>
                <p className="text-sm text-slate-400">{step.desc}</p>
              </GlassCard>
              {i < HOW_IT_WORKS.length - 1 && (
                <FaArrowRight className="hidden md:block absolute top-1/2 -right-4 -translate-y-1/2 text-pulse-500/30 z-10" />
              )}
            </motion.div>
          ))}
        </motion.div>
      </section>

      <Testimonials />
      <FAQAccordion />

      {/* ---------------- FINAL CTA ---------------- */}
      <section className="section-container pb-24">
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }}
          variants={fadeUp}
        >
          <GlassCard className="text-center py-16 bg-gradient-to-br from-pulse-500/10 to-neural-500/10" hover={false}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to see your movement data?
            </h2>
            <p className="text-slate-400 mb-8 max-w-xl mx-auto">
              Create a free account and upload your first training clip. Milestone 1 sets
              up the full experience — real predictions ship in later milestones.
            </p>
            <Button to="/register" variant="primary" icon={FaArrowRight}>Create Free Account</Button>
          </GlassCard>
        </motion.div>
      </section>
    </MainLayout>
  )
}
