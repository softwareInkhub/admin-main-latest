import { useState } from 'react';
import CreateOrderModal from '@/components/ui/CreateOrderModal';

export default function InfluencerCard({ influencer }) {
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  return (
    <div>
      {/* Your existing card content */}
      <button
        onClick={() => setIsOrderModalOpen(true)}
        className="mt-4 inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
      >
        <ShoppingBagIcon className="h-5 w-5" />
        Create Order
      </button>

      <CreateOrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        influencer={influencer}
      />
    </div>
  );
} 