import { motion } from 'framer-motion'

/**
 * Reusable glassmorphism card used across the dashboard, profile and
 * marketing pages. `hover` enables a subtle lift + glow on hover.
 */
export default function GlassCard({ children, className = '', hover = true, as: Tag = 'div' }) {
  const MotionTag = motion(Tag)
  return (
    <MotionTag
      className={`glass-card p-6 ${className}`}
      whileHover={hover ? { y: -6, boxShadow: '0 12px 40px rgba(45,212,191,0.15)' } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {children}
    </MotionTag>
  )
}
