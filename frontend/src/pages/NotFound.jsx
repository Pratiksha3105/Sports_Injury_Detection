import { motion } from 'framer-motion'
import MainLayout from '../layouts/MainLayout'
import Button from '../components/Button'
import { fadeUp } from '../animations/variants'

export default function NotFound() {
  return (
    <MainLayout>
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
        <motion.div initial="hidden" animate="visible" variants={fadeUp}>
          <p className="text-8xl font-display font-bold text-gradient mb-4">404</p>
          <h1 className="text-2xl font-bold text-white mb-2">Page not found</h1>
          <p className="text-slate-400 mb-8 max-w-md">
            The page you're looking for doesn't exist or has moved.
          </p>
          <Button to="/" variant="primary">Back to Home</Button>
        </motion.div>
      </div>
    </MainLayout>
  )
}
