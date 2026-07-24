import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export default function Button({
  children,
  to,
  onClick,
  type = 'button',
  variant = 'primary',
  className = '',
  icon: Icon,
}) {
  const classes = `${variant === 'primary' ? 'btn-primary' : 'btn-outline'} ${className}`

  const content = (
    <motion.span
      whileTap={{ scale: 0.97 }}
      className="inline-flex items-center gap-2"
    >
      {children}
      {Icon && <Icon className="h-4 w-4" />}
    </motion.span>
  )

  if (to) {
    return (
      <Link to={to} className={classes}>
        {content}
      </Link>
    )
  }

  return (
    <button type={type} onClick={onClick} className={classes}>
      {content}
    </button>
  )
}
