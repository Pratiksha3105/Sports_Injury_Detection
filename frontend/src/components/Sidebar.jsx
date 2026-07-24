import { NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FaHeartbeat,
  FaTachometerAlt,
  FaUserCircle,
  FaCloudUploadAlt,
  FaHistory,
  FaSignOutAlt,
} from 'react-icons/fa'
import { useAuth } from '../hooks/useAuth'

const LINKS = [
  { to: '/dashboard', label: 'Dashboard', icon: FaTachometerAlt },
  { to: '/dashboard/profile', label: 'Athlete Profile', icon: FaUserCircle },
  { to: '/dashboard/upload', label: 'Upload Video', icon: FaCloudUploadAlt },
  { to: '/dashboard/predictions', label: 'Prediction History', icon: FaHistory },
]

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <motion.aside
        initial={false}
        animate={{ x: 0 }}
        className={`fixed md:sticky top-0 h-screen w-64 bg-midnight-950 border-r border-white/5 z-40
        transform transition-transform duration-300 md:translate-x-0
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-6 flex items-center gap-2 border-b border-white/5">
          <span className="h-9 w-9 rounded-xl bg-gradient-to-br from-pulse-500 to-neural-500 flex items-center justify-center">
            <FaHeartbeat className="text-white text-lg" />
          </span>
          <span className="font-display font-bold text-white">PulseGuard</span>
        </div>

        <nav className="p-4 flex flex-col gap-1">
          {LINKS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/dashboard'}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-gradient-to-r from-pulse-500/20 to-neural-500/20 text-pulse-400 border border-pulse-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 inset-x-0 p-4 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-alert-400 hover:bg-alert-500/10 transition-colors"
          >
            <FaSignOutAlt className="h-4 w-4" />
            Logout
          </button>
        </div>
      </motion.aside>
    </>
  )
}
