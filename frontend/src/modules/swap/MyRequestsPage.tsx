import React from 'react';
import { SwapRequest } from '../../types';
import { SwapRequestCard } from '../../components/SwapRequestCard';
import { Send } from 'lucide-react';
const MOCK_OUTGOING: SwapRequest[] = [
{
  id: 'r3',
  requesterId: 'me',
  requesterName: 'Me',
  ownerId: 'u2',
  requestedItemId: '1',
  requestedItemName: 'Vintage Denim Jacket',
  offeredItemId: 'm1',
  offeredItemName: 'Striped Cotton Shirt',
  status: 'pending',
  createdAt: '2023-10-26T09:00:00Z'
},
{
  id: 'r4',
  requesterId: 'me',
  requesterName: 'Me',
  ownerId: 'u4',
  requestedItemId: '3',
  requestedItemName: 'Leather Boots',
  offeredItemId: 'm2',
  offeredItemName: 'Black Denim Jeans',
  status: 'rejected',
  createdAt: '2023-10-20T11:20:00Z'
}];

export function MyRequestsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <Send className="h-8 w-8 text-brand-600 mr-3" />
        <h1 className="text-3xl font-bold text-gray-900">My Requests</h1>
      </div>

      <div className="space-y-4">
        {MOCK_OUTGOING.map((req) =>
        <SwapRequestCard key={req.id} request={req} type="outgoing" />
        )}
      </div>
    </div>);

}