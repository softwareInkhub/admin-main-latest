'use client';
import { motion } from 'framer-motion';

export default function OrderLoadingAnimation() {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center" style={{ zIndex: 9999 }}>
      <div className="text-center">
        <motion.div
          className="w-32 h-32 relative mx-auto mb-8"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Shopping bag animation */}
          <motion.div
            className="absolute inset-0"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <svg className="w-full h-full text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </motion.div>

          {/* Circular progress */}
          <motion.div
            className="absolute inset-0"
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <svg className="w-full h-full text-blue-500" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray="70 180"
              />
            </svg>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-3"
        >
          <h3 className="text-xl font-medium text-white">Creating Your Order</h3>
          <p className="text-gray-400">Please wait while we process your order...</p>
        </motion.div>
      </div>
    </div>
  );
} 