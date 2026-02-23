import { motion } from 'framer-motion';
import { XIcon, ExternalLinkIcon } from 'lucide-react';
interface MockWishlistCardProps {
  title: string;
  size: string;
  condition: string;
  owner: string;
  available: boolean;
  imageUrl: string;
  onRemove?: () => void;
  showAnnotations?: boolean;
}
export function MockWishlistCard({
  title,
  size,
  condition,
  owner,
  available,
  imageUrl,
  onRemove,
  showAnnotations = false
}: MockWishlistCardProps) {
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
        x: -100
      }}
      className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow relative">

      {showAnnotations &&
      <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded z-10">
          Item Image
        </div>
      }

      <div className="relative aspect-square bg-gray-100">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover" />


        {showAnnotations &&
        <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
            Remove Button
          </div>
        }

        <button
          onClick={onRemove}
          className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
          aria-label="Remove from wishlist">

          <XIcon className="w-4 h-4 text-gray-700 hover:text-red-600" />
        </button>

        <div
          className={`absolute bottom-2 left-2 px-3 py-1 rounded-full text-xs font-semibold ${available ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-orange-100 text-orange-800 border border-orange-300'}`}>

          {available ? 'Available' : 'Not Available'}
        </div>
      </div>

      <div className="p-4">
        {showAnnotations &&
        <div className="absolute left-4 bg-blue-600 text-white text-xs px-2 py-1 rounded -ml-2">
            Item Details
          </div>
        }

        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
          {title}
        </h3>

        <div className="space-y-1 text-sm text-gray-600 mb-3">
          <p>
            Size: <span className="font-medium">{size}</span>
          </p>
          <p>
            Condition: <span className="font-medium">{condition}</span>
          </p>
          <p>
            Owner: <span className="font-medium">{owner}</span>
          </p>
        </div>

        <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500">
          View Item
          <ExternalLinkIcon className="w-4 h-4" />
        </button>
      </div>
    </motion.div>);

}
