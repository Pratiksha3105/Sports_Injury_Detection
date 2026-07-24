import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  FaVideo, FaExclamationTriangle, FaCheckCircle, FaClock,
  FaCloudUploadAlt, FaUserEdit, FaHistory, FaBell, FaArrowRight,
} from 'react-icons/fa'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts'
import DashboardLayout from '../layouts/DashboardLayout'
import GlassCard from '../components/GlassCard'
import StatCard from '../components/StatCard'
import { useAuth } from '../hooks/useAuth'
import { DUMMY_PREDICTIONS, RISK_BADGE_STYLES } from '../utils/constants'
import { fadeUp, staggerContainer } from '../animations/variants'

const CHART_DATA = [
  { session: 'S1', risk: 20 }, { session: 'S2', risk: 28 }, { session: 'S3', risk: 22 },
  { session: 'S4', risk: 41 }, { session: 'S5', risk: 54 }, { session: 'S6', risk: 47 },
  { session: 'S7', risk: 33 }, { session: 'S8', risk: 25 },
]

const QUICK_ACTIONS = [
  { to: '/dashboard/upload', label: 'Upload new video', icon: FaCloudUploadAlt, accent: 'pulse' },
  { to: '/dashboard/profile', label: 'Update profile', icon: FaUserEdit, accent: 'neural' },
  { to: '/dashboard/predictions', label: 'View full history', icon: FaHistory, accent: 'alert' },
]

export default function Dashboard() {
  const { user } = useAuth()
  const recent = DUMMY_PREDICTIONS.slice(-4).reverse()

  return (
    <DashboardLayout>
      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="mb-8">
        <GlassCard hover={false} className="bg-gradient-to-br from-pulse-500/10 to-neural-500/10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <p className="text-slate-400 text-sm mb-1">Welcome back,</p>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                {user?.full_name || 'Athlete'} 👋
              </h1>
              <p className="text-slate-400 mt-2 max-w-lg">
                Here&apos;s a snapshot of your recent uploads and risk trend. Real predictions
                will populate here once the AI pipeline (Milestone 3+) is connected.
              </p>
            </div>
            <Link to="/dashboard/upload" className="btn-primary whitespace-nowrap">
              <FaCloudUploadAlt /> Upload Video
            </Link>
          </div>
        </GlassCard>
      </motion.div>

      <motion.div
        initial="hidden" animate="visible" variants={staggerContainer}
        className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8"
      >
        <motion.div variants={fadeUp}><StatCard icon={FaVideo} label="Videos uploaded" value={18} accent="pulse" /></motion.div>
        <motion.div variants={fadeUp}><StatCard icon={FaCheckCircle} label="Low risk sessions" value={11} accent="pulse" /></motion.div>
        <motion.div variants={fadeUp}><StatCard icon={FaExclamationTriangle} label="High risk flags" value={3} accent="alert" /></motion.div>
        <motion.div variants={fadeUp}><StatCard icon={FaClock} label="Avg. review time" value={2} suffix=" min" accent="neural" /></motion.div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="lg:col-span-2">
          <GlassCard hover={false} className="h-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-white">Risk score trend</h3>
              <span className="text-xs font-mono text-slate-500">Last 8 sessions · dummy data</span>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={CHART_DATA}>
                <defs>
                  <linearGradient id="riskFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2DD4BF" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#2DD4BF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="session" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{ background: '#121B31', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff' }}
                />
                <Area type="monotone" dataKey="risk" stroke="#2DD4BF" strokeWidth={2} fill="url(#riskFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </GlassCard>
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={fadeUp}>
          <GlassCard hover={false} className="h-full">
            <div className="flex items-center gap-2 mb-6">
              <FaBell className="text-neural-400" />
              <h3 className="font-semibold text-white">Quick actions</h3>
            </div>
            <div className="space-y-3">
              {QUICK_ACTIONS.map(({ to, label, icon: Icon, accent }) => (
                <Link
                  key={to}
                  to={to}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <span className={`h-9 w-9 rounded-lg flex items-center justify-center ${
                      accent === 'pulse' ? 'bg-pulse-500/10 text-pulse-400' :
                      accent === 'neural' ? 'bg-neural-500/10 text-neural-400' :
                      'bg-alert-500/10 text-alert-400'
                    }`}>
                      <Icon />
                    </span>
                    <span className="text-sm text-slate-200">{label}</span>
                  </div>
                  <FaArrowRight className="text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </Link>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>

      <motion.div initial="hidden" animate="visible" variants={fadeUp}>
        <GlassCard hover={false}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-white">Recent activity</h3>
            <Link to="/dashboard/predictions" className="text-sm text-pulse-400 hover:text-pulse-300">View all</Link>
          </div>
          <div className="divide-y divide-white/5">
            {recent.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <span className="h-10 w-10 rounded-lg bg-white/5 flex items-center justify-center text-slate-400">
                    <FaVideo />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-slate-200">{p.video}</p>
                    <p className="text-xs text-slate-500">{p.sport} · {p.date}</p>
                  </div>
                </div>
                <span className={`text-xs font-medium px-3 py-1 rounded-full border capitalize ${RISK_BADGE_STYLES[p.risk]}`}>
                  {p.risk}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.div>
    </DashboardLayout>
  )
}
