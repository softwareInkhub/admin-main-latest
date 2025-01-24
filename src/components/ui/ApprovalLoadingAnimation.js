'use client';
import { motion } from 'framer-motion';

export default function ApprovalLoadingAnimation() {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center" style={{ zIndex: 9999 }}>
      <div className="text-center">
        <motion.div
          className="w-32 h-32 relative mx-auto mb-8"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Checkmark animation */}
          <motion.div
            className="absolute inset-0"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <svg 
              className="w-full h-full text-green-500" 
              viewBox="0 0 100 100"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
            >
              <motion.circle
                cx="50"
                cy="50"
                r="45"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1 }}
              />
              <motion.path
                d="M30 50L45 65L70 35"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: 1 }}
              />
            </svg>
          </motion.div>

          {/* Rotating particles */}
          <motion.div
            className="absolute inset-0"
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-green-500 rounded-full"
                style={{
                  top: '50%',
                  left: '50%',
                  transform: `rotate(${i * 45}deg) translateY(-40px)`,
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-3"
        >
          <h3 className="text-xl font-medium text-white">Approving Influencer</h3>
          <p className="text-gray-400">Please wait while we process the approval...</p>
        </motion.div>
      </div>
    </div>
  );
} 