import React from 'react';
import { SwapRequest } from '../../types';
import { SwapRequestCard } from '../../components/SwapRequestCard';
import { History } from 'lucide-react';
const MOCK_HISTORY: SwapRequest[] = [
{
  id: 'r5',
  requesterId: 'me',
  requesterName: 'Me',
  ownerId: 'u5',
  requestedItemId: '4',
  requestedItemName: 'Wool Sweater',
  offeredItemId: 'm3',
  offeredItemName: 'Graphic Tee',
  status: 'accepted',
  createdAt: '2023-09-15T14:30:00Z'
}];

export function HistoryPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <History className="h-8 w-8 text-brand-600 mr-3" />
        <h1 className="text-3xl font-bold text-gray-900">Swap History</h1>
      </div>

      <div className="space-y-4">
        {MOCK_HISTORY.map((req) =>
        <SwapRequestCard key={req.id} request={req} type="outgoing" />
        )}
      </div>
    </div>);

}