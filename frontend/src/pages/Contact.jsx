import { useState } from 'react'
import { motion } from 'framer-motion'
import { FaMapMarkerAlt, FaEnvelope, FaPhone, FaGithub, FaLinkedin, FaTwitter, FaPaperPlane } from 'react-icons/fa'
import MainLayout from '../layouts/MainLayout'
import GlassCard from '../components/GlassCard'
import { fadeUp, slideInLeft, slideInRight } from '../animations/variants'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    // Milestone 1: no backend contact endpoint yet — this is a UI-only form.
    setSent(true)
    setForm({ name: '', email: '', subject: '', message: '' })
    setTimeout(() => setSent(false), 3000)
  }

  return (
    <MainLayout>
      <section className="section-container pt-16 pb-24">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-pulse-400 font-mono text-sm tracking-widest uppercase">Contact</span>
          <h1 className="text-3xl md:text-5xl font-bold mt-3 mb-5">
            Questions about the <span className="text-gradient">project?</span>
          </h1>
          <p className="text-slate-400">
            Reach out about the project scope, methodology, or a demo walkthrough.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={slideInLeft} className="lg:col-span-2 space-y-5">
            <GlassCard>
              <FaMapMarkerAlt className="text-pulse-400 text-xl mb-3" />
              <h3 className="font-semibold text-white mb-1">Location</h3>
              <p className="text-sm text-slate-400">Department of Computer Science, Your University, City, India</p>
            </GlassCard>
            <GlassCard>
              <FaEnvelope className="text-neural-400 text-xl mb-3" />
              <h3 className="font-semibold text-white mb-1">Email</h3>
              <p className="text-sm text-slate-400">contact@pulseguard.ai</p>
            </GlassCard>
            <GlassCard>
              <FaPhone className="text-alert-400 text-xl mb-3" />
              <h3 className="font-semibold text-white mb-1">Phone</h3>
              <p className="text-sm text-slate-400">+91 00000 00000</p>
            </GlassCard>
            <GlassCard>
              <h3 className="font-semibold text-white mb-3">Follow the project</h3>
              <div className="flex gap-3">
                {[FaGithub, FaLinkedin, FaTwitter].map((Icon, i) => (
                  <a key={i} href="#" className="h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-pulse-500/20 transition-colors">
                    <Icon />
                  </a>
                ))}
              </div>
            </GlassCard>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={slideInRight} className="lg:col-span-3">
            <GlassCard hover={false}>
              {sent && (
                <div className="mb-6 px-4 py-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm">
                  Message captured locally — connect a backend endpoint to send this for real.
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="label-text">Your name</label>
                    <input required value={form.name} onChange={update('name')} placeholder="Jane Doe" className="input-field" />
                  </div>
                  <div>
                    <label className="label-text">Email</label>
                    <input required type="email" value={form.email} onChange={update('email')} placeholder="you@example.com" className="input-field" />
                  </div>
                </div>
                <div>
                  <label className="label-text">Subject</label>
                  <input required value={form.subject} onChange={update('subject')} placeholder="Question about the risk model" className="input-field" />
                </div>
                <div>
                  <label className="label-text">Message</label>
                  <textarea required rows={5} value={form.message} onChange={update('message')} placeholder="Tell us more…" className="input-field resize-none" />
                </div>
                <button type="submit" className="btn-primary w-full">
                  <FaPaperPlane /> Send Message
                </button>
              </form>
            </GlassCard>
          </motion.div>
        </div>
      </section>
    </MainLayout>
  )
}
