import { useState } from 'react';
import { motion } from 'framer-motion';
import { HeartIcon } from 'lucide-react';
interface InteractiveHeartProps {
  initialSaved?: boolean;
  showLabel?: boolean;
}
export function InteractiveHeart({
  initialSaved = false,
  showLabel = true
}: InteractiveHeartProps) {
  const [isSaved, setIsSaved] = useState(initialSaved);
  return (
    <div className="flex flex-col items-center gap-4">
      <motion.button
        onClick={() => setIsSaved(!isSaved)}
        className="relative p-4 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        whileTap={{
          scale: 0.9
        }}
        aria-label={isSaved ? 'Remove from wishlist' : 'Add to wishlist'}>

        <motion.div
          animate={{
            scale: isSaved ? [1, 1.3, 1] : 1
          }}
          transition={{
            duration: 0.3
          }}>

          <HeartIcon
            className={`w-12 h-12 transition-colors ${isSaved ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />

        </motion.div>
      </motion.button>

      {showLabel &&
      <div className="text-center">
          <p className="text-sm font-medium text-gray-900">
            {isSaved ? 'Saved to Wishlist' : 'Not Saved'}
          </p>
          <p className="text-xs text-gray-500 mt-1">Click to toggle</p>
        </div>
      }
    </div>);

}
