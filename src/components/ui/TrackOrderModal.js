'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPackage, FiTruck, FiX, FiMapPin, FiClock, FiCheck } from 'react-icons/fi';

export default function TrackOrderModal({ isOpen, onClose, order }) {
  const [loading, setLoading] = useState(true);
  const [fulfillmentDetails, setFulfillmentDetails] = useState(null);

  useEffect(() => {
    if (isOpen && order) {
      fetchFulfillmentDetails();
    }
  }, [isOpen, order]);

  const fetchFulfillmentDetails = async () => {
    try {
      setLoading(true);
      // Use the existing shipping updates from the order
      setFulfillmentDetails({
        tracking_company: order.trackingCompany,
        tracking_number: order.trackingNumber,
        tracking_url: order.trackingUrl,
        events: order.shippingUpdates || [],
        shipment_status: order.shipmentStatus,
        estimated_delivery_at: order.estimatedDeliveryAt
      });
    } catch (error) {
      console.error('Error loading fulfillment details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const isCurrentStatus = (eventStatus, currentStatus) => {
    const normalizedEvent = eventStatus?.toLowerCase().replace(/[^a-z]/g, '');
    const normalizedCurrent = currentStatus?.toLowerCase().replace(/[^a-z]/g, '');
    return normalizedEvent === normalizedCurrent;
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#1e2532] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-[#1e2532] border-b border-gray-700 p-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-white">Track Order</h2>
            <p className="text-sm text-gray-400">{order.fulfillmentName}</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full" />
            </div>
          ) : fulfillmentDetails ? (
            <div className="space-y-8">
              {/* Tracking Timeline */}
              <div className="relative space-y-6">
                {fulfillmentDetails.events.map((event, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                        isCurrentStatus(event.status, fulfillmentDetails.shipment_status)
                          ? 'bg-blue-500'
                          : 'bg-gray-700'
                      }`}>
                        <FiCheck className="w-3 h-3 text-white" />
                      </div>
                      {index !== fulfillmentDetails.events.length - 1 && (
                        <div className={`w-0.5 h-16 ${
                          isCurrentStatus(event.status, fulfillmentDetails.shipment_status)
                            ? 'bg-blue-500'
                            : 'bg-gray-700'
                        }`} />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-white">{event.status}</p>
                      <p className="text-sm text-gray-400">
                        {new Date(event.timestamp?.seconds * 1000).toLocaleString()}
                      </p>
                      {event.location && (
                        <p className="text-sm text-gray-400 mt-1">{event.location}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Tracking Info Card */}
              <div className="bg-[#262f3d] rounded-xl p-4 space-y-4">
                <div className="space-y-1">
                  <p className="text-sm text-gray-400">Tracking Number</p>
                  <p className="font-medium text-white">{fulfillmentDetails.tracking_number}</p>
                </div>
                
                {fulfillmentDetails.tracking_company && (
                  <div className="space-y-1">
                    <p className="text-sm text-gray-400">Carrier</p>
                    <p className="font-medium text-white">{fulfillmentDetails.tracking_company}</p>
                  </div>
                )}

                {fulfillmentDetails.estimated_delivery_at && (
                  <div className="space-y-1">
                    <p className="text-sm text-gray-400">Estimated Delivery</p>
                    <p className="font-medium text-white">
                      {new Date(fulfillmentDetails.estimated_delivery_at).toLocaleDateString()}
                    </p>
                  </div>
                )}

                {fulfillmentDetails.tracking_url && (
                  <a
                    href={fulfillmentDetails.tracking_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full mt-4 text-center py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Track Package →
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <FiPackage className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No tracking information yet</h3>
              <p className="text-gray-400">We'll update this once your order ships</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
} 