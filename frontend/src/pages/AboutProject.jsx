import { motion } from 'framer-motion'
import {
  FaBullseye, FaLayerGroup, FaCode, FaRocket, FaUsers,
  FaReact, FaPython, FaDatabase, FaLock,
} from 'react-icons/fa'
import { SiFastapi, SiTailwindcss, SiMysql } from 'react-icons/si'
import MainLayout from '../layouts/MainLayout'
import GlassCard from '../components/GlassCard'
import { fadeUp, staggerContainer } from '../animations/variants'

const OBJECTIVES = [
  'Build a full-stack foundation that later milestones can plug an AI model into without rework.',
  'Design an authentication and role system that separates athletes, coaches, and admins from day one.',
  'Model the database so video and prediction history scale cleanly as usage grows.',
  'Ship a UI that a coach or athlete could realistically use daily, not just a demo screen.',
]

const TECH_STACK = [
  { icon: FaReact, label: 'React (Vite)', group: 'Frontend' },
  { icon: SiTailwindcss, label: 'Tailwind CSS', group: 'Frontend' },
  { icon: FaLayerGroup, label: 'Framer Motion', group: 'Frontend' },
  { icon: SiFastapi, label: 'FastAPI', group: 'Backend' },
  { icon: FaPython, label: 'SQLAlchemy + Pydantic', group: 'Backend' },
  { icon: FaLock, label: 'JWT Auth', group: 'Backend' },
  { icon: SiMysql, label: 'MySQL', group: 'Database' },
  { icon: FaDatabase, label: 'Normalized 3NF schema', group: 'Database' },
]

const FUTURE_MILESTONES = [
  { m: 'Milestone 2', title: 'Video pipeline', desc: 'Real upload storage, OpenCV frame extraction, thumbnailing.' },
  { m: 'Milestone 3', title: 'Pose estimation', desc: 'MediaPipe landmark extraction from extracted frames.' },
  { m: 'Milestone 4', title: 'Risk classification', desc: 'LSTM model trained on landmark sequences to output a risk score.' },
  { m: 'Milestone 5', title: 'Deployment & analytics', desc: 'Production deployment, coach dashboards, monitoring.' },
]

const TEAM = [
  { name: 'Your Name', role: 'Full Stack Developer', img: 'https://randomuser.me/api/portraits/men/75.jpg' },
  { name: 'Teammate Name', role: 'ML Engineer', img: 'https://randomuser.me/api/portraits/women/65.jpg' },
  { name: 'Teammate Name', role: 'UI/UX Designer', img: 'https://randomuser.me/api/portraits/men/22.jpg' },
]

export default function AboutProject() {
  return (
    <MainLayout>
      <section className="section-container pt-16 pb-20">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-pulse-400 font-mono text-sm tracking-widest uppercase">About the project</span>
          <h1 className="text-3xl md:text-5xl font-bold mt-3 mb-5">
            Sports Injury Risk Detection <span className="text-gradient">from Video using AI</span>
          </h1>
          <p className="text-slate-400 leading-relaxed">
            A final-year B.Tech Computer Science project exploring whether standard
            training footage — no special sensors required — can be turned into an
            early-warning signal for movement-related injury risk.
          </p>
        </motion.div>

        {/* Objectives */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={fadeUp} className="mb-20">
          <div className="flex items-center gap-3 mb-6">
            <FaBullseye className="text-pulse-400 text-xl" />
            <h2 className="text-2xl font-bold text-white">Objectives</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {OBJECTIVES.map((o, i) => (
              <GlassCard key={i}>
                <p className="text-sm text-slate-300 leading-relaxed">{o}</p>
              </GlassCard>
            ))}
          </div>
        </motion.div>

        {/* Tech stack */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={fadeUp} className="mb-20">
          <div className="flex items-center gap-3 mb-6">
            <FaCode className="text-neural-400 text-xl" />
            <h2 className="text-2xl font-bold text-white">Technology stack</h2>
          </div>
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TECH_STACK.map(({ icon: Icon, label, group }, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="text-center">
                  <Icon className="text-3xl text-pulse-400 mx-auto mb-3" />
                  <p className="font-medium text-white text-sm">{label}</p>
                  <p className="text-xs text-slate-500 mt-1">{group}</p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Future scope */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={fadeUp} className="mb-20">
          <div className="flex items-center gap-3 mb-6">
            <FaRocket className="text-alert-400 text-xl" />
            <h2 className="text-2xl font-bold text-white">Future scope &amp; milestones</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FUTURE_MILESTONES.map(({ m, title, desc }, i) => (
              <GlassCard key={i}>
                <span className="text-xs font-mono text-pulse-400">{m}</span>
                <h3 className="font-semibold text-white mt-2 mb-1.5">{title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
              </GlassCard>
            ))}
          </div>
        </motion.div>

        {/* Team */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={fadeUp}>
          <div className="flex items-center gap-3 mb-6">
            <FaUsers className="text-pulse-400 text-xl" />
            <h2 className="text-2xl font-bold text-white">Team</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {TEAM.map((member, i) => (
              <GlassCard key={i} className="text-center">
                <img src={member.img} alt={member.name} className="h-20 w-20 rounded-full object-cover mx-auto mb-4 border border-white/10" />
                <p className="font-semibold text-white">{member.name}</p>
                <p className="text-xs text-slate-400">{member.role}</p>
              </GlassCard>
            ))}
          </div>
        </motion.div>
      </section>
    </MainLayout>
  )
}
