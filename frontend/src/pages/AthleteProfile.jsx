import { useState } from 'react'
import { motion } from 'framer-motion'
import { FaCamera, FaSave, FaRunning } from 'react-icons/fa'
import DashboardLayout from '../layouts/DashboardLayout'
import GlassCard from '../components/GlassCard'
import { useAuth } from '../hooks/useAuth'
import { fadeUp } from '../animations/variants'

const SPORTS_OPTIONS = ['Running', 'Basketball', 'Football', 'Weightlifting', 'Swimming', 'Cricket', 'Tennis', 'Other']
const GENDER_OPTIONS = ['male', 'female', 'other']

export default function AthleteProfile() {
  const { user } = useAuth()
  const [form, setForm] = useState({
    height_cm: '', weight_kg: '', age: '', gender: '',
    sport: '', experience_years: '', medical_history: '',
  })
  const [saved, setSaved] = useState(false)

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    // Milestone 1: wire this to PUT /api/v1/athletes/me once the backend
    // is connected to a live MySQL instance.
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <DashboardLayout>
      <motion.div initial="hidden" animate="visible" variants={fadeUp}>
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">Athlete Profile</h1>
        <p className="text-slate-400 mb-8">Keep this information current — it helps calibrate future risk analysis.</p>

        <div className="grid lg:grid-cols-3 gap-6">
          <GlassCard hover={false} className="lg:col-span-1 text-center h-fit">
            <div className="relative w-28 h-28 mx-auto mb-4">
              <img
                src={user?.profile_image || 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=300&q=80&auto=format&fit=crop'}
                alt="Profile"
                className="w-28 h-28 rounded-full object-cover border-2 border-pulse-500/40"
              />
              <button className="absolute bottom-0 right-0 h-9 w-9 rounded-full bg-pulse-500 flex items-center justify-center text-white shadow-glow">
                <FaCamera className="text-sm" />
              </button>
            </div>
            <h3 className="font-semibold text-white text-lg">{user?.full_name || 'Athlete Name'}</h3>
            <p className="text-sm text-slate-400 mb-4">{user?.email || 'athlete@example.com'}</p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-pulse-500/10 text-pulse-400 text-xs font-medium">
              <FaRunning /> {form.sport || 'Sport not set'}
            </div>
          </GlassCard>

          <GlassCard hover={false} className="lg:col-span-2">
            {saved && (
              <div className="mb-6 px-4 py-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm">
                Profile saved locally. Connect the backend to persist this to MySQL.
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="label-text">Height (cm)</label>
                  <input type="number" value={form.height_cm} onChange={update('height_cm')} placeholder="175" className="input-field" />
                </div>
                <div>
                  <label className="label-text">Weight (kg)</label>
                  <input type="number" value={form.weight_kg} onChange={update('weight_kg')} placeholder="70" className="input-field" />
                </div>
                <div>
                  <label className="label-text">Age</label>
                  <input type="number" value={form.age} onChange={update('age')} placeholder="22" className="input-field" />
                </div>
                <div>
                  <label className="label-text">Gender</label>
                  <select value={form.gender} onChange={update('gender')} className="input-field">
                    <option value="">Select gender</option>
                    {GENDER_OPTIONS.map((g) => (
                      <option key={g} value={g} className="bg-midnight-800">{g[0].toUpperCase() + g.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label-text">Primary sport</label>
                  <select value={form.sport} onChange={update('sport')} className="input-field">
                    <option value="">Select sport</option>
                    {SPORTS_OPTIONS.map((s) => (
                      <option key={s} value={s} className="bg-midnight-800">{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label-text">Experience (years)</label>
                  <input type="number" step="0.5" value={form.experience_years} onChange={update('experience_years')} placeholder="3.5" className="input-field" />
                </div>
              </div>

              <div>
                <label className="label-text">Medical history (optional)</label>
                <textarea
                  rows={4}
                  value={form.medical_history}
                  onChange={update('medical_history')}
                  placeholder="Past injuries, surgeries, or conditions relevant to movement analysis…"
                  className="input-field resize-none"
                />
              </div>

              <button type="submit" className="btn-primary">
                <FaSave /> Save Changes
              </button>
            </form>
          </GlassCard>
        </div>
      </motion.div>
    </DashboardLayout>
  )
}
