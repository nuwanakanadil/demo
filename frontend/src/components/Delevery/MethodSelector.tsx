import React from 'react';
import { motion } from 'framer-motion';
import { MapPinIcon, TruckIcon } from 'lucide-react';
interface MethodSelectorProps {
  selected: 'MEETUP' | 'DELIVERY';
  onChange: (method: 'MEETUP' | 'DELIVERY') => void;
  disabled?: boolean;
}
export function MethodSelector({ selected, onChange, disabled = false }: MethodSelectorProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-2 inline-flex space-x-2 shadow-sm">
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange('MEETUP')}
        className={`relative px-6 py-3 rounded-lg font-medium transition-colors ${selected === 'MEETUP' ? 'text-white' : 'text-gray-600 hover:text-gray-900'} ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}>

        {selected === 'MEETUP' &&
        <motion.div
          layoutId="activeTab"
          className="absolute inset-0 bg-green-700 rounded-lg shadow-md"
          transition={{
            type: 'spring',
            bounce: 0.2,
            duration: 0.6
          }} />

        }
        <span className="relative z-10 flex items-center space-x-2">
          <MapPinIcon className="h-5 w-5" />
          <span>MEETUP</span>
        </span>
      </button>

      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange('DELIVERY')}
        className={`relative px-6 py-3 rounded-lg font-medium transition-colors ${selected === 'DELIVERY' ? 'text-white' : 'text-gray-600 hover:text-gray-900'} ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}>

        {selected === 'DELIVERY' &&
        <motion.div
          layoutId="activeTab"
          className="absolute inset-0 bg-green-700 rounded-lg shadow-md"
          transition={{
            type: 'spring',
            bounce: 0.2,
            duration: 0.6
          }} />

        }
        <span className="relative z-10 flex items-center space-x-2">
          <TruckIcon className="h-5 w-5" />
          <span>DELIVERY</span>
        </span>
      </button>
    </div>);

}
