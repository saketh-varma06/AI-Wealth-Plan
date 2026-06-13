import { motion, AnimatePresence } from 'framer-motion'
import { RiCloseLine } from 'react-icons/ri'

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  const sizes = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-xl' }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={e => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ scale: 0.92, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.92, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`card w-full ${sizes[size]} max-h-[90vh] overflow-y-auto`}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-lg font-bold text-white">{title}</h2>
              <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-surface-700 transition-all">
                <RiCloseLine className="text-xl" />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
