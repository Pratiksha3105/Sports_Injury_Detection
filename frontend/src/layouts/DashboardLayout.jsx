import { useState } from 'react'
import { FaBars } from 'react-icons/fa'
import Sidebar from '../components/Sidebar'

export default function DashboardLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen flex bg-midnight-900 bg-grid-pattern bg-[length:40px_40px]">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="flex-1 min-w-0">
        <div className="md:hidden flex items-center justify-between p-4 border-b border-white/5">
          <span className="font-display font-bold text-white">PulseGuard</span>
          <button onClick={() => setMobileOpen(true)} className="text-slate-200 text-xl">
            <FaBars />
          </button>
        </div>
        <div className="p-6 md:p-10 max-w-6xl mx-auto">{children}</div>
      </div>
    </div>
  )
}
