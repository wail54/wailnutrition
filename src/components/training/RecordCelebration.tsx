'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface RecordCelebrationProps {
  exerciseName: string
}

export function RecordCelebration({ exerciseName }: RecordCelebrationProps) {
  const [show, setShow] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setShow(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: -50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -30 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
        >
          {/* Backdrop blur */}
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

          {/* Card */}
          <div className="relative bg-bg-card border-2 border-accent-yellow rounded-3xl p-8 text-center mx-6 shadow-2xl"
            style={{ boxShadow: '0 0 60px rgba(234,179,8,0.4), 0 0 120px rgba(234,179,8,0.2)' }}
          >
            {/* Trophy animation */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1, 1.15, 1],
                rotate: [-5, 5, -5, 5, 0],
              }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-7xl mb-4"
            >
              🏆
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <p className="text-accent-yellow font-black text-2xl mb-1">NOUVEAU RECORD !</p>
              <p className="text-text-primary font-semibold text-lg">{exerciseName}</p>
              <p className="text-text-muted text-sm mt-2">Tu t'es surpassé(e) 🔥</p>
            </motion.div>

            {/* Sparkles */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-xl"
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1.5, 0],
                  x: Math.cos((i * Math.PI * 2) / 6) * 100,
                  y: Math.sin((i * Math.PI * 2) / 6) * 80,
                }}
                transition={{ delay: 0.3 + i * 0.1, duration: 1 }}
                style={{ left: '50%', top: '50%', marginLeft: -12, marginTop: -12 }}
              >
                ✨
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
