import { useCountUp } from '../hooks/useCountUp'
import GlassCard from './GlassCard'

export default function StatCard({ icon: Icon, label, value, suffix = '', accent = 'pulse' }) {
  const { ref, value: animated } = useCountUp(value)

  const accentClasses = {
    pulse: 'text-pulse-400 bg-pulse-500/10',
    neural: 'text-neural-400 bg-neural-500/10',
    alert: 'text-alert-400 bg-alert-500/10',
  }

  return (
    <GlassCard className="flex items-center gap-4" as="div">
      <div ref={ref} className={`h-12 w-12 rounded-xl flex items-center justify-center ${accentClasses[accent]}`}>
        {Icon && <Icon className="h-6 w-6" />}
      </div>
      <div>
        <p className="text-2xl font-display font-bold text-white">
          {animated}
          {suffix}
        </p>
        <p className="text-sm text-slate-400">{label}</p>
      </div>
    </GlassCard>
  )
}
