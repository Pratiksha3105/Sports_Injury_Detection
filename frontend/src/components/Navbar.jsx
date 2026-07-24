import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FaBars, FaTimes, FaMoon, FaSun, FaHeartbeat } from 'react-icons/fa'
import { NAV_LINKS } from '../utils/constants'
import { useAuth } from '../hooks/useAuth'
import Button from './Button'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isDark, setIsDark] = useState(true)
  const [scrolled, setScrolled] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev
      document.documentElement.classList.toggle('light', !next)
      return next
    })
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header
      className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${
        scrolled ? 'bg-midnight-900/80 backdrop-blur-lg border-b border-white/5' : 'bg-transparent'
      }`}
    >
      <nav className="section-container flex items-center justify-between h-20">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="h-9 w-9 rounded-xl bg-gradient-to-br from-pulse-500 to-neural-500 flex items-center justify-center shadow-glow">
            <FaHeartbeat className="text-white text-lg" />
          </span>
          <span className="font-display font-bold text-lg tracking-tight text-white">
            PulseGuard <span className="text-gradient">AI</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive ? 'text-pulse-400' : 'text-slate-300 hover:text-white'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="h-10 w-10 rounded-full flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            {isDark ? <FaSun /> : <FaMoon />}
          </button>

          {user ? (
            <>
              <Button to="/dashboard" variant="outline">Dashboard</Button>
              <Button onClick={handleLogout} variant="primary">Logout</Button>
            </>
          ) : (
            <>
              <Button to="/login" variant="outline">Login</Button>
              <Button to="/register" variant="primary">Register</Button>
            </>
          )}
        </div>

        <button
          className="md:hidden text-slate-200 text-2xl"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>
      </nav>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-midnight-900/95 backdrop-blur-lg border-b border-white/5 overflow-hidden"
          >
            <div className="section-container py-6 flex flex-col gap-4">
              {NAV_LINKS.map((link) => (
                <Link key={link.to} to={link.to} onClick={() => setIsOpen(false)} className="text-slate-200 font-medium">
                  {link.label}
                </Link>
              ))}
              <div className="flex flex-col gap-3 pt-4 border-t border-white/10">
                {user ? (
                  <>
                    <Button to="/dashboard" variant="outline">Dashboard</Button>
                    <Button onClick={handleLogout} variant="primary">Logout</Button>
                  </>
                ) : (
                  <>
                    <Button to="/login" variant="outline">Login</Button>
                    <Button to="/register" variant="primary">Register</Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
