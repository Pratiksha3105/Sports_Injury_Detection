import { motion } from 'framer-motion'

/**
 * Signature hero graphic: an abstract motion-capture / pose-estimation
 * skeleton, animated with pulsing joints and a scanning sweep line.
 * This stands in for the MediaPipe pose-landmark output that Milestone 3
 * will eventually generate from real video frames.
 */
export default function PoseIllustration({ className = '' }) {
  const joints = [
    [200, 60], // head
    [200, 110], // neck
    [160, 150], [240, 150], // shoulders
    [140, 220], [260, 220], // elbows
    [125, 285], [275, 285], // wrists
    [200, 170], // chest/spine
    [200, 230], // pelvis
    [170, 260], [230, 260], // hips
    [160, 340], [240, 340], // knees
    [155, 420], [245, 420], // ankles
  ]

  const bones = [
    [0, 1], [1, 2], [1, 3], [2, 4], [4, 6], [3, 5], [5, 7],
    [1, 8], [8, 9], [9, 10], [9, 11], [10, 12], [11, 13], [12, 14], [13, 15],
  ]

  return (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 400 460" className="w-full h-full">
        <defs>
          <linearGradient id="boneGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2DD4BF" />
            <stop offset="100%" stopColor="#818CF8" />
          </linearGradient>
        </defs>

        {bones.map(([a, b], i) => (
          <motion.line
            key={i}
            x1={joints[a][0]} y1={joints[a][1]}
            x2={joints[b][0]} y2={joints[b][1]}
            stroke="url(#boneGradient)"
            strokeWidth="2.5"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.8 }}
            transition={{ duration: 1.2, delay: i * 0.05, ease: 'easeOut' }}
          />
        ))}

        {joints.map(([x, y], i) => (
          <motion.circle
            key={i}
            cx={x} cy={y} r={i === 0 ? 22 : 6}
            fill={i === 6 || i === 12 ? '#FB7185' : '#2DD4BF'}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.4, delay: 0.3 + i * 0.05 }}
          >
            {(i === 6 || i === 12) && (
              <animate attributeName="r" values="6;10;6" dur="2s" repeatCount="indefinite" />
            )}
          </motion.circle>
        ))}

        {/* Scanning sweep line to suggest live video analysis */}
        <motion.rect
          x="60" width="280" height="3" fill="url(#boneGradient)" opacity="0.5"
          initial={{ y: 20 }}
          animate={{ y: 440 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />
      </svg>

      {/* Flagged risk badge near the highlighted joint */}
      <motion.div
        className="absolute top-[58%] left-[8%] bg-alert-500/15 border border-alert-500/40 rounded-lg px-3 py-1.5 text-xs font-mono text-alert-400"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.5, duration: 0.5 }}
      >
        ⚠ Elevated load: L. knee
      </motion.div>
    </div>
  )
}
