import { motion } from 'framer-motion';

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <motion.div
      className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-500 rounded-full"
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
  </div>
);

export default LoadingSpinner;
