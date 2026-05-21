import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2 } from 'lucide-react'

export default function LoadingOverlay({ message = 'Loading content…' }) {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="w-full max-w-md rounded-[28px] border border-white/10 bg-slate-900/95 p-8 text-center shadow-2xl shadow-slate-950/40"
          initial={{ scale: 0.96, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0 }}
        >
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg shadow-emerald-500/30">
            <Loader2 className="h-10 w-10 animate-spin" />
          </div>
          <p className="mt-6 text-lg font-semibold text-white">{message}</p>
          <div className="mt-5 flex items-center justify-center gap-2">
            <span
              className="h-3 w-3 rounded-full bg-emerald-300 animate-bounce"
              style={{ animationDelay: '0ms' }}
            />
            <span
              className="h-3 w-3 rounded-full bg-teal-300 animate-bounce"
              style={{ animationDelay: '120ms' }}
            />
            <span
              className="h-3 w-3 rounded-full bg-cyan-300 animate-bounce"
              style={{ animationDelay: '240ms' }}
            />
          </div>
          <p className="mt-4 text-sm text-slate-300">
            Fetching the latest content. This should be quick.
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
