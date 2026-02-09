import React, { useState } from 'react';
import { SwapRequest } from '../../types';
import { SwapRequestCard } from '../../components/SwapRequestCard';
import { Inbox } from 'lucide-react';
const MOCK_INCOMING: SwapRequest[] = [
{
  id: 'r1',
  requesterId: 'u5',
  requesterName: 'Alex W.',
  ownerId: 'me',
  requestedItemId: 'm1',
  requestedItemName: 'Striped Cotton Shirt',
  offeredItemId: '5',
  offeredItemName: 'Classic Chinos',
  status: 'pending',
  message:
  'These chinos are brand new, wrong size for me. Would love your shirt!',
  createdAt: '2023-10-25T10:30:00Z'
},
{
  id: 'r2',
  requesterId: 'u3',
  requesterName: 'Emily R.',
  ownerId: 'me',
  requestedItemId: 'm2',
  requestedItemName: 'Black Denim Jeans',
  offeredItemId: '6',
  offeredItemName: 'Silk Scarf',
  status: 'pending',
  createdAt: '2023-10-24T14:15:00Z'
}];

export function IncomingRequestsPage() {
  const [requests, setRequests] = useState<SwapRequest[]>(MOCK_INCOMING);
  const handleAccept = (id: string) => {
    setRequests((prev) =>
    prev.map((req) =>
    req.id === id ?
    {
      ...req,
      status: 'accepted'
    } :
    req
    )
    );
  };
  const handleReject = (id: string) => {
    setRequests((prev) =>
    prev.map((req) =>
    req.id === id ?
    {
      ...req,
      status: 'rejected'
    } :
    req
    )
    );
  };
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <Inbox className="h-8 w-8 text-brand-600 mr-3" />
        <h1 className="text-3xl font-bold text-gray-900">Incoming Requests</h1>
      </div>

      {requests.length === 0 ?
      <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No incoming requests yet.</p>
        </div> :

      <div className="space-y-4">
          {requests.map((req) =>
        <SwapRequestCard
          key={req.id}
          request={req}
          type="incoming"
          onAccept={handleAccept}
          onReject={handleReject} />

        )}
        </div>
      }
    </div>);

}