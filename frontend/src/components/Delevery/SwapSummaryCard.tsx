import React from 'react';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
interface SwapItem {
  name: string;
  owner: string;
  image: string;
}
interface SwapSummaryCardProps {
  itemA: SwapItem;
  itemB: SwapItem;
  status: 'ACCEPTED' | 'PENDING' | 'COMPLETED' | 'REJECTED' | 'CANCELLED';
}
export function SwapSummaryCard({
  itemA,
  itemB,
  status
}: SwapSummaryCardProps) {
  const badgeVariant =
    status === 'ACCEPTED' ? 'accepted' :
    status === 'COMPLETED' ? 'done' :
    status === 'PENDING' ? 'pending' :
    'pending';

  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Swap Summary</h2>
        <Badge variant={badgeVariant}>{status}</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Item A */}
        <div className="flex items-start space-x-4">
          <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
            <img
              src={itemA.image}
              alt={itemA.name}
              className="w-full h-full object-cover" />

          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              Your Item
            </p>
            <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
              {itemA.name}
            </h3>
            <p className="text-sm text-gray-600">@{itemA.owner}</p>
          </div>
        </div>

        {/* Swap Arrow */}
        <div className="hidden md:flex items-center justify-center absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
          <div className="bg-green-50 border border-green-200 rounded-full p-3">
            <svg
              className="w-6 h-6 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">

              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />

            </svg>
          </div>
        </div>

        {/* Item B */}
        <div className="flex items-start space-x-4">
          <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
            <img
              src={itemB.image}
              alt={itemB.name}
              className="w-full h-full object-cover" />

          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              Their Item
            </p>
            <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
              {itemB.name}
            </h3>
            <p className="text-sm text-gray-600">@{itemB.owner}</p>
          </div>
        </div>
      </div>
    </Card>);

}
