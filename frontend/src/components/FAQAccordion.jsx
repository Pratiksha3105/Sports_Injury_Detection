import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaChevronDown } from 'react-icons/fa'
import { DUMMY_FAQS } from '../utils/constants'
import { fadeUp } from '../animations/variants'

export default function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <section className="section-container py-24">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={fadeUp}
        className="text-center mb-12"
      >
        <span className="text-neural-400 font-mono text-sm tracking-widest uppercase">FAQ</span>
        <h2 className="text-3xl md:text-4xl font-bold mt-3">
          Frequently asked <span className="text-gradient">questions</span>
        </h2>
      </motion.div>

      <div className="max-w-3xl mx-auto space-y-4">
        {DUMMY_FAQS.map((item, index) => {
          const isOpen = openIndex === index
          return (
            <div key={index} className="glass-card overflow-hidden">
              <button
                onClick={() => setOpenIndex(isOpen ? -1 : index)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <span className="font-semibold text-slate-100">{item.q}</span>
                <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <FaChevronDown className="text-pulse-400 flex-shrink-0" />
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <p className="px-5 pb-5 text-slate-400 leading-relaxed">{item.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </section>
  )
}
