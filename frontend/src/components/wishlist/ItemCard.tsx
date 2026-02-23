import React from 'react';
import { motion } from 'framer-motion';
import { HeartIcon, UserIcon } from 'lucide-react';
import { Item } from '../../types/marketplace';
interface ItemCardProps {
  item: Item;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  showPrice?: boolean;
}
export function ItemCard({ item, isSaved, onToggleSave, showPrice = true }: ItemCardProps) {
  const handleHeartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Allow unsave from wishlist even if item later becomes own.
    if (!item.isOwn || isSaved) {
      onToggleSave(item.id);
    }
  };
  return (
    <motion.div
      layout
      initial={{
        opacity: 0,
        y: 20
      }}
      animate={{
        opacity: 1,
        y: 0
      }}
      exit={{
        opacity: 0,
        scale: 0.9
      }}
      whileHover={{
        y: -4
      }}
      className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">

      <div className="relative aspect-square bg-gray-100">
        <img
          src={item.imageUrl}
          alt={item.title}
          className="w-full h-full object-cover" />

        {item.isCompleted &&
        <div className="absolute top-3 left-3 px-3 py-1 bg-emerald-600 text-white text-xs font-semibold rounded-full">
            COMPLETED
          </div>
        }


        {(!item.isOwn || isSaved) &&
        <motion.button
          onClick={handleHeartClick}
          whileTap={{
            scale: 0.9
          }}
          className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
          aria-label={isSaved ? 'Remove from wishlist' : 'Add to wishlist'}>

            <motion.div
            animate={{
              scale: isSaved ? [1, 1.2, 1] : 1
            }}
            transition={{
              duration: 0.3
            }}>

              <HeartIcon
              className={`w-5 h-5 transition-colors ${isSaved ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />

            </motion.div>
          </motion.button>
        }

        {item.isOwn && !isSaved &&
        <div className="absolute top-3 right-3 px-3 py-1 bg-green-600 text-white text-xs font-semibold rounded-full">
            Your Item
          </div>
        }
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
          {item.title}
        </h3>

        <div className="flex items-center justify-between mb-3">
          {showPrice ? (
            <span className="text-2xl font-bold text-gray-900">${item.price}</span>
          ) : (
            <span />
          )}
          <span className="text-sm text-gray-500 capitalize">{item.condition}</span>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Size: {item.size}</span>
          <div className="flex items-center gap-1">
            <UserIcon className="w-4 h-4" />
            <span>{item.owner}</span>
          </div>
        </div>
      </div>
    </motion.div>);

}
