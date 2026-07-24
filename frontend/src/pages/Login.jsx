import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaHeartbeat, FaArrowRight } from 'react-icons/fa'
import { useAuth } from '../hooks/useAuth'
import GlassCard from '../components/GlassCard'
import Button from '../components/Button'
import PoseIllustration from '../components/PoseIllustration'
import { fadeUp } from '../animations/variants'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/dashboard'

  const validate = () => {
    const next = {}
    if (!email) next.email = 'Email is required'
    else if (!/^\S+@\S+\.\S+$/.test(email)) next.email = 'Enter a valid email address'
    if (!password) next.password = 'Password is required'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setApiError('')
    if (!validate()) return

    setSubmitting(true)
    try {
      await login(email, password)
      navigate(from, { replace: true })
    } catch (err) {
      setApiError(
        err.response?.data?.detail ||
          'Could not sign in. Make sure the backend API is running and connected to MySQL.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-hero-gradient bg-midnight-900 px-6 py-12">
      <div className="grid lg:grid-cols-2 gap-16 max-w-5xl w-full items-center">
        <motion.div
          initial="hidden" animate="visible" variants={fadeUp}
          className="hidden lg:flex flex-col items-center justify-center"
        >
          <div className="w-full max-w-xs mb-8">
            <PoseIllustration />
          </div>
          <h2 className="text-2xl font-bold text-center mb-2">Welcome back to <span className="text-gradient">PulseGuard</span></h2>
          <p className="text-slate-400 text-center max-w-xs">
            Your training footage and risk history are exactly where you left them.
          </p>
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={fadeUp}>
          <GlassCard hover={false} className="w-full max-w-md mx-auto">
            <div className="flex items-center gap-2 mb-8 lg:hidden">
              <span className="h-9 w-9 rounded-xl bg-gradient-to-br from-pulse-500 to-neural-500 flex items-center justify-center">
                <FaHeartbeat className="text-white" />
              </span>
              <span className="font-display font-bold text-white">PulseGuard AI</span>
            </div>

            <h1 className="text-2xl font-bold text-white mb-1">Sign in</h1>
            <p className="text-sm text-slate-400 mb-8">Enter your credentials to access your dashboard.</p>

            {apiError && (
              <div className="mb-6 px-4 py-3 rounded-lg bg-alert-500/10 border border-alert-500/30 text-alert-400 text-sm">
                {apiError}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <div>
                <label className="label-text" htmlFor="email">Email address</label>
                <div className="relative">
                  <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="input-field pl-11"
                  />
                </div>
                {errors.email && <p className="text-alert-400 text-xs mt-1.5">{errors.email}</p>}
              </div>

              <div>
                <label className="label-text" htmlFor="password">Password</label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input-field pl-11 pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && <p className="text-alert-400 text-xs mt-1.5">{errors.password}</p>}
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-white/20 bg-white/5 text-pulse-500 focus:ring-pulse-500/50"
                  />
                  Remember me
                </label>
                <Link to="/forgot-password" className="text-pulse-400 hover:text-pulse-300">
                  Forgot password?
                </Link>
              </div>

              <button type="submit" disabled={submitting} className="btn-primary w-full disabled:opacity-60">
                {submitting ? 'Signing in…' : 'Sign In'}
                <FaArrowRight />
              </button>
            </form>

            <p className="text-center text-sm text-slate-400 mt-8">
              Don&apos;t have an account?{' '}
              <Link to="/register" className="text-pulse-400 font-medium hover:text-pulse-300">
                Create one
              </Link>
            </p>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  )
}
