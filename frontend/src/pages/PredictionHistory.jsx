import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { FaSearch, FaFilter, FaChevronLeft, FaChevronRight, FaVideo } from 'react-icons/fa'
import DashboardLayout from '../layouts/DashboardLayout'
import GlassCard from '../components/GlassCard'
import { DUMMY_PREDICTIONS, RISK_BADGE_STYLES } from '../utils/constants'
import { fadeUp } from '../animations/variants'

const PAGE_SIZE = 5

export default function PredictionHistory() {
  const [search, setSearch] = useState('')
  const [riskFilter, setRiskFilter] = useState('all')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    return DUMMY_PREDICTIONS.filter((p) => {
      const matchesSearch =
        p.video.toLowerCase().includes(search.toLowerCase()) ||
        p.sport.toLowerCase().includes(search.toLowerCase())
      const matchesRisk = riskFilter === 'all' || p.risk === riskFilter
      return matchesSearch && matchesRisk
    })
  }, [search, riskFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <DashboardLayout>
      <motion.div initial="hidden" animate="visible" variants={fadeUp}>
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">Prediction History</h1>
        <p className="text-slate-400 mb-8">
          Sample data shown below. Live rows will appear here once the inference
          pipeline (Milestone 3+) starts writing to the <code className="font-mono text-pulse-400">predictions</code> table.
        </p>

        <GlassCard hover={false}>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                placeholder="Search by video name or sport…"
                className="input-field pl-11"
              />
            </div>
            <div className="relative">
              <FaFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <select
                value={riskFilter}
                onChange={(e) => { setRiskFilter(e.target.value); setPage(1) }}
                className="input-field pl-11 sm:w-48"
              >
                <option value="all" className="bg-midnight-800">All risk levels</option>
                <option value="low" className="bg-midnight-800">Low</option>
                <option value="moderate" className="bg-midnight-800">Moderate</option>
                <option value="high" className="bg-midnight-800">High</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-white/5">
                  <th className="pb-3 font-medium">Video</th>
                  <th className="pb-3 font-medium">Sport</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Risk score</th>
                  <th className="pb-3 font-medium">Body part</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {paginated.map((p) => (
                  <tr key={p.id} className="text-slate-300">
                    <td className="py-4 flex items-center gap-2">
                      <FaVideo className="text-slate-500" /> {p.video}
                    </td>
                    <td className="py-4">{p.sport}</td>
                    <td className="py-4 font-mono text-xs">{p.date}</td>
                    <td className="py-4 font-mono">{p.score}%</td>
                    <td className="py-4">{p.bodyPart}</td>
                    <td className="py-4">
                      <span className={`text-xs font-medium px-3 py-1 rounded-full border capitalize ${RISK_BADGE_STYLES[p.risk]}`}>
                        {p.risk}
                      </span>
                    </td>
                  </tr>
                ))}
                {paginated.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-500">
                      No results match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/5">
            <p className="text-xs text-slate-500">
              Showing {paginated.length ? (page - 1) * PAGE_SIZE + 1 : 0}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-9 w-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 disabled:opacity-30"
              >
                <FaChevronLeft className="text-xs" />
              </button>
              <span className="text-xs text-slate-400 font-mono">{page} / {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="h-9 w-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 disabled:opacity-30"
              >
                <FaChevronRight className="text-xs" />
              </button>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </DashboardLayout>
  )
}
