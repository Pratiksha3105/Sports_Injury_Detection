import { Link } from 'react-router-dom'
import { FaHeartbeat, FaGithub, FaLinkedin, FaTwitter, FaEnvelope } from 'react-icons/fa'
import { NAV_LINKS } from '../utils/constants'

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-midnight-950">
      <div className="section-container py-16 grid md:grid-cols-4 gap-10">
        <div>
          <Link to="/" className="flex items-center gap-2 mb-4">
            <span className="h-9 w-9 rounded-xl bg-gradient-to-br from-pulse-500 to-neural-500 flex items-center justify-center">
              <FaHeartbeat className="text-white text-lg" />
            </span>
            <span className="font-display font-bold text-lg text-white">PulseGuard AI</span>
          </Link>
          <p className="text-sm text-slate-400 leading-relaxed">
            AI-assisted movement analysis that helps athletes and coaches spot injury
            risk patterns before they become injuries.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-4">Navigation</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="hover:text-pulse-400 transition-colors">
                  {link.label}
                </Link>
              </li>
            ))}
            <li><Link to="/login" className="hover:text-pulse-400 transition-colors">Login</Link></li>
            <li><Link to="/register" className="hover:text-pulse-400 transition-colors">Register</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-4">Project</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li>B.Tech Final Year Project</li>
            <li>Milestone 1 — Foundation</li>
            <li>Department of Computer Science</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-4">Get in touch</h4>
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
            <FaEnvelope className="text-pulse-400" />
            <span>contact@pulseguard.ai</span>
          </div>
          <div className="flex gap-3">
            {[FaGithub, FaLinkedin, FaTwitter].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-pulse-500/20 transition-colors"
              >
                <Icon />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-white/5 py-6">
        <p className="text-center text-xs text-slate-500">
          © {new Date().getFullYear()} PulseGuard AI. Built for academic purposes — Milestone 1 of 5.
        </p>
      </div>
    </footer>
  )
}
