import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaHeartbeat, FaArrowRight,
  FaRunning, FaChalkboardTeacher, FaUserShield,
} from 'react-icons/fa'
import { useAuth } from '../hooks/useAuth'
import GlassCard from '../components/GlassCard'
import { fadeUp } from '../animations/variants'

const ROLES = [
  { value: 'athlete', label: 'Athlete', desc: 'Upload videos & track my own risk history', icon: FaRunning },
  { value: 'coach', label: 'Coach', desc: 'Monitor athletes I manage', icon: FaChalkboardTeacher },
  { value: 'admin', label: 'Admin', desc: 'Manage users & platform settings', icon: FaUserShield },
]

export default function Register() {
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', password: '', confirmPassword: '', role: 'athlete' })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const { register } = useAuth()
  const navigate = useNavigate()

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const validate = () => {
    const next = {}
    if (!form.full_name.trim()) next.full_name = 'Full name is required'
    if (!form.email) next.email = 'Email is required'
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Enter a valid email address'
    if (!form.password) next.password = 'Password is required'
    else if (form.password.length < 8) next.password = 'Use at least 8 characters'
    if (form.password !== form.confirmPassword) next.confirmPassword = 'Passwords do not match'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setApiError('')
    if (!validate()) return

    setSubmitting(true)
    try {
      await register({
        full_name: form.full_name,
        email: form.email,
        phone: form.phone || undefined,
        password: form.password,
        role: form.role,
      })
      setSuccess(true)
      setTimeout(() => navigate('/login'), 1800)
    } catch (err) {
      setApiError(
        err.response?.data?.detail ||
          'Could not create account. Make sure the backend API is running and connected to MySQL.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-hero-gradient bg-midnight-900 px-6 py-12">
      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="w-full max-w-2xl">
        <GlassCard hover={false}>
          <div className="flex items-center gap-2 mb-8">
            <span className="h-9 w-9 rounded-xl bg-gradient-to-br from-pulse-500 to-neural-500 flex items-center justify-center">
              <FaHeartbeat className="text-white" />
            </span>
            <span className="font-display font-bold text-white">PulseGuard AI</span>
          </div>

          <h1 className="text-2xl font-bold text-white mb-1">Create your account</h1>
          <p className="text-sm text-slate-400 mb-8">Set up access in under a minute.</p>

          {success && (
            <div className="mb-6 px-4 py-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm">
              Account created! Redirecting to sign in…
            </div>
          )}
          {apiError && (
            <div className="mb-6 px-4 py-3 rounded-lg bg-alert-500/10 border border-alert-500/30 text-alert-400 text-sm">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            <div>
              <label className="label-text">I am a…</label>
              <div className="grid sm:grid-cols-3 gap-3">
                {ROLES.map(({ value, label, desc, icon: Icon }) => (
                  <button
                    type="button"
                    key={value}
                    onClick={() => setForm((f) => ({ ...f, role: value }))}
                    className={`text-left p-4 rounded-xl border transition-all ${
                      form.role === value
                        ? 'border-pulse-500/60 bg-pulse-500/10'
                        : 'border-white/10 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <Icon className={`mb-2 text-lg ${form.role === value ? 'text-pulse-400' : 'text-slate-400'}`} />
                    <p className="font-semibold text-sm text-white">{label}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="label-text" htmlFor="full_name">Full name</label>
                <div className="relative">
                  <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input id="full_name" value={form.full_name} onChange={update('full_name')} placeholder="Jane Doe" className="input-field pl-11" />
                </div>
                {errors.full_name && <p className="text-alert-400 text-xs mt-1.5">{errors.full_name}</p>}
              </div>

              <div>
                <label className="label-text" htmlFor="phone">Phone (optional)</label>
                <input id="phone" value={form.phone} onChange={update('phone')} placeholder="+91 98765 43210" className="input-field" />
              </div>
            </div>

            <div>
              <label className="label-text" htmlFor="email">Email address</label>
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input id="email" type="email" value={form.email} onChange={update('email')} placeholder="you@example.com" className="input-field pl-11" />
              </div>
              {errors.email && <p className="text-alert-400 text-xs mt-1.5">{errors.email}</p>}
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="label-text" htmlFor="password">Password</label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={update('password')}
                    placeholder="••••••••"
                    className="input-field pl-11 pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && <p className="text-alert-400 text-xs mt-1.5">{errors.password}</p>}
              </div>

              <div>
                <label className="label-text" htmlFor="confirmPassword">Confirm password</label>
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={update('confirmPassword')}
                  placeholder="••••••••"
                  className="input-field"
                />
                {errors.confirmPassword && <p className="text-alert-400 text-xs mt-1.5">{errors.confirmPassword}</p>}
              </div>
            </div>

            <button type="submit" disabled={submitting} className="btn-primary w-full disabled:opacity-60">
              {submitting ? 'Creating account…' : 'Create Account'}
              <FaArrowRight />
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-8">
            Already have an account?{' '}
            <Link to="/login" className="text-pulse-400 font-medium hover:text-pulse-300">
              Sign in
            </Link>
          </p>
        </GlassCard>
      </motion.div>
    </div>
  )
}
