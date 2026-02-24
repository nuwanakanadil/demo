import React, { useState } from 'react';
import { CheckCircleIcon } from 'lucide-react';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
interface CompletionButtonProps {
  onComplete: () => Promise<void> | void;
}
export function CompletionButton({ onComplete }: CompletionButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const handleConfirm = async () => {
    setLoading(true);
    await Promise.resolve(onComplete());
    setLoading(false);
    setIsModalOpen(false);
  };
  return (
    <>
      <Button
        variant="primary"
        size="lg"
        className="w-full"
        onClick={() => setIsModalOpen(true)}>

        <CheckCircleIcon className="h-5 w-5 mr-2" />
        Mark as Completed
      </Button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Complete Swap">

        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure the exchange is finished? This action will mark the
            swap as completed and close the logistics.
          </p>

          <div className="flex space-x-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setIsModalOpen(false)}
              disabled={loading}>

              Cancel
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              onClick={handleConfirm}
              loading={loading}>

              Confirm
            </Button>
          </div>
        </div>
      </Modal>
    </>);

}
