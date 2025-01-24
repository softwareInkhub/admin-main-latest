'use client';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { FiPackage, FiTruck, FiMapPin, FiClock, FiCheck } from 'react-icons/fi';
import TrackOrderModal from '@/components/ui/TrackOrderModal';

const SHIPPING_STEPS = [
  { status: 'pending', label: 'Order Placed', icon: FiPackage },
  { status: 'confirmed', label: 'Order Confirmed', icon: FiCheck },
  { status: 'in_transit', label: 'In Transit', icon: FiTruck },
  { status: 'out_for_delivery', label: 'Out for Delivery', icon: FiTruck },
  { status: 'delivered', label: 'Delivered', icon: FiCheck }
];

const getStepStatus = (currentStatus, stepStatus) => {
  const statusOrder = {
    'pending': 0,
    'confirmed': 1,
    'in_transit': 2,
    'out_for_delivery': 3,
    'delivered': 4
  };

  const currentStep = statusOrder[currentStatus] || 0;
  const step = statusOrder[stepStatus] || 0;

  if (currentStep > step) return 'completed';
  if (currentStep === step) return 'current';
  return 'upcoming';
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    delivered: 0,
    inTransit: 0,
    pending: 0
  });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Calculate stats
      const stats = ordersData.reduce((acc, order) => {
        acc.total++;
        if (order.status === 'delivered') acc.delivered++;
        else if (order.status === 'in_transit') acc.inTransit++;
        else acc.pending++;
        return acc;
      }, { total: 0, delivered: 0, inTransit: 0, pending: 0 });

      setOrders(ordersData);
      setStats(stats);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return 'bg-green-500/20 text-green-400';
      case 'in_transit': return 'bg-blue-500/20 text-blue-400';
      case 'out_for_delivery': return 'bg-purple-500/20 text-purple-400';
      case 'failure': return 'bg-red-500/20 text-red-400';
      default: return 'bg-yellow-500/20 text-yellow-400';
    }
  };

  return (
    <div className="p-6">
      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1e2532] p-4 rounded-xl"
        >
          <div className="flex items-center gap-3">
            <FiPackage className="text-2xl text-blue-400" />
            <div>
              <p className="text-sm text-gray-400">Total Orders</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          delay={0.1}
          className="bg-[#1e2532] p-4 rounded-xl"
        >
          <div className="flex items-center gap-3">
            <FiCheck className="text-2xl text-green-400" />
            <div>
              <p className="text-sm text-gray-400">Delivered</p>
              <p className="text-2xl font-bold text-white">{stats.delivered}</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          delay={0.2}
          className="bg-[#1e2532] p-4 rounded-xl"
        >
          <div className="flex items-center gap-3">
            <FiTruck className="text-2xl text-yellow-400" />
            <div>
              <p className="text-sm text-gray-400">In Transit</p>
              <p className="text-2xl font-bold text-white">{stats.inTransit}</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          delay={0.3}
          className="bg-[#1e2532] p-4 rounded-xl"
        >
          <div className="flex items-center gap-3">
            <FiClock className="text-2xl text-purple-400" />
            <div>
              <p className="text-sm text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-white">{stats.pending}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Orders Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {orders.map((order) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#1e2532] rounded-xl p-5 shadow-lg"
          >
            {/* Order Header */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm text-gray-400 mb-1">
                  {new Date(order.createdAt?.seconds * 1000).toLocaleString()}
                </p>
                <h3 className="text-lg font-semibold text-white">
                  Order {order.fulfillmentName?.split('.')[0]}
                </h3>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
            </div>

            {/* Shipping Steps Timeline */}
            <div className="mt-4 p-4 bg-[#262f3d] rounded-lg">
              <div className="relative">
                {SHIPPING_STEPS.map((step, index) => {
                  const stepStatus = getStepStatus(order.shipmentStatus, step.status);
                  const Icon = step.icon;
                  
                  return (
                    <div key={step.status} className="flex items-start gap-3 mb-4">
                      <div className="relative">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          stepStatus === 'completed' ? 'bg-green-500 text-white' :
                          stepStatus === 'current' ? 'bg-blue-500 text-white' :
                          'bg-gray-700 text-gray-400'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        {index !== SHIPPING_STEPS.length - 1 && (
                          <div className={`absolute left-4 top-8 w-0.5 h-8 ${
                            stepStatus === 'completed' ? 'bg-green-500' : 'bg-gray-700'
                          }`} />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${
                          stepStatus === 'completed' ? 'text-green-400' :
                          stepStatus === 'current' ? 'text-blue-400' :
                          'text-gray-400'
                        }`}>
                          {step.label}
                        </p>
                        {stepStatus === 'current' && order.shippingUpdates?.[0] && (
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(order.shippingUpdates[0].timestamp?.seconds * 1000).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Tracking Info */}
              {order.trackingNumber && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">
                        {order.trackingCompany}
                      </p>
                      <p className="text-xs text-gray-400">
                        Tracking #: {order.trackingNumber}
                      </p>
                    </div>
                    <a
                      onClick={(e) => {
                        e.preventDefault();
                        setSelectedOrder(order);
                        setIsTrackingModalOpen(true);
                      }}
                      className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors cursor-pointer"
                    >
                      Track Order
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Shipping Address */}
            {order.shippingAddress && (
              <div className="mt-4 p-4 bg-[#262f3d] rounded-lg">
                <div className="flex items-start gap-2">
                  <FiMapPin className="text-gray-400 mt-1" />
                  <div className="text-sm">
                    <p className="text-white font-medium">Shipping Address</p>
                    <p className="text-gray-400">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                    <p className="text-gray-400">{order.shippingAddress.address1}</p>
                    <p className="text-gray-400">
                      {order.shippingAddress.city}, {order.shippingAddress.province} {order.shippingAddress.zip}
                    </p>
                    <p className="text-gray-400">{order.shippingAddress.country}</p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Add the modal */}
      {selectedOrder && (
        <TrackOrderModal
          isOpen={isTrackingModalOpen}
          onClose={() => {
            setIsTrackingModalOpen(false);
            setSelectedOrder(null);
          }}
          order={selectedOrder}
        />
      )}
    </div>
  );
} 