'use client';
import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import Image from 'next/image';
import { db } from '@/lib/firebase';
import { addDoc, collection, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import OrderLoadingAnimation from './OrderLoadingAnimation';
import toast from 'react-hot-toast';

export default function CreateOrderModal({ isOpen, onClose, influencer, onOrderSuccess }) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [orderDetails, setOrderDetails] = useState({
    firstName: influencer?.firstName || '',
    lastName: influencer?.lastName || '',
    email: influencer?.emailId || '',
    phone: influencer?.phoneNumber || '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India'
    }
  });
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchShopifyProducts();
    }
  }, [isOpen]);

  // Add search filter effect
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredProducts(products);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = products.filter(product => 
        product.title.toLowerCase().includes(query) ||
        product.price.toString().includes(query)
      );
      setFilteredProducts(filtered);
    }
  }, [searchQuery, products]);

  const fetchShopifyProducts = async () => {
    try {
      const response = await fetch('/api/shopify/products');
      const data = await response.json();
      
      // Transform the data safely without assuming images array exists
      const formattedProducts = data.products.map(product => ({
        id: product.id,
        title: product.title,
        image: product.image || '/placeholder-product.png', // Image is already processed in the API
        price: product.price || '0.00',
        compareAtPrice: product.compareAtPrice,
        variantId: product.variantId
      }));

      console.log('Formatted products:', formattedProducts);
      setProducts(formattedProducts);
      setFilteredProducts(formattedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const toggleProductSelection = (product) => {
    setSelectedProducts(prev => {
      const exists = prev.find(p => p.id === product.id);
      if (exists) {
        return prev.filter(p => p.id !== product.id);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const calculateTotal = () => {
    return selectedProducts.reduce((total, product) => {
      const price = parseFloat(product.price) || 0;
      return total + (price * (product.quantity || 1));
    }, 0);
  };

  const handleDetailsSubmit = async () => {
    try {
      setIsCreatingOrder(true);

      // Validate required fields
      if (!orderDetails.firstName || !orderDetails.lastName || !orderDetails.email || 
          !orderDetails.phone || !orderDetails.address.street || !orderDetails.address.city || 
          !orderDetails.address.state || !orderDetails.address.pincode) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Create order in Shopify
      const shopifyOrderResponse = await fetch('/api/shopify/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer: {
            firstName: orderDetails.firstName,
            lastName: orderDetails.lastName,
            email: orderDetails.email,
            phone: orderDetails.phone,
          },
          shippingAddress: {
            address1: orderDetails.address.street,
            city: orderDetails.address.city,
            province: orderDetails.address.state,
            zip: orderDetails.address.pincode,
            country: orderDetails.address.country || 'IN',
          },
          lineItems: selectedProducts.map(product => ({
            variantId: product.variantId,
            quantity: product.quantity
          }))
        }),
      });

      const shopifyOrder = await shopifyOrderResponse.json();

      if (!shopifyOrderResponse.ok) {
        throw new Error(shopifyOrder.message || shopifyOrder.error || 'Failed to create order');
      }

      // Create order in Firestore with Shopify's order number
      const orderData = {
        shopifyOrderId: shopifyOrder.id.toString(),
        orderNumber: `#${shopifyOrder.order_number}`, // Format the order number
        influencerId: influencer.id,
        influencerDetails: orderDetails,
        products: selectedProducts.map(product => ({
          id: product.id,
          title: product.title,
          variantId: product.variantId,
          price: parseFloat(product.price),
          quantity: product.quantity,
          image: product.image
        })),
        totalAmount: calculateTotal(),
        status: 'pending',
        createdBy: {
          uid: user?.uid || '',
          email: user?.email || ''
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        trackingStatus: 'order_placed'
      };

      // Update influencer with the same order number
      await updateDoc(doc(db, 'influencers', influencer.id), {
        orderCreated: true,
        orderDate: new Date(),
        orderNumber: `#${shopifyOrder.order_number}`, // Use the same format
        status: 'order_placed'
      });

      await addDoc(collection(db, 'orders'), orderData);

      toast.success('Order created successfully!');
      onOrderSuccess?.();
      onClose();

    } catch (error) {
      console.error('Error creating order:', error);
      toast.error(error.message || 'Failed to create order. Please try again.');
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const steps = [
    { id: 1, name: 'Products', description: 'Select products' },
    { id: 2, name: 'Details', description: 'Shipping information' },
    { id: 3, name: 'Review', description: 'Order summary' }
  ];

  return (
    <>
      <Dialog open={isOpen} onClose={onClose} className="relative z-50">
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" aria-hidden="true" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-4xl w-full rounded-2xl bg-[#1e2532] shadow-xl">
            {/* Header */}
            <div className="border-b border-gray-700">
              <div className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <Dialog.Title className="text-xl font-semibold text-white">
                    Create New Order
                  </Dialog.Title>
                  <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                {/* Progress Steps */}
                <div className="mt-4">
                  <div className="flex items-center justify-between relative">
                    {/* Progress Line */}
                    <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-700" style={{ zIndex: 0 }} />
                    
                    {steps.map((stepItem, index) => (
                      <div key={stepItem.id} className="flex-1 relative" style={{ zIndex: 1 }}>
                        <div className="flex flex-col items-center">
                          <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center bg-[#1e2532]
                            ${step === stepItem.id ? 'border-blue-500 bg-blue-500/20 text-blue-500' : 
                              step > stepItem.id ? 'border-green-500 bg-green-500 text-white' : 
                              'border-gray-700 bg-gray-800 text-gray-500'}`}
                          >
                            {step > stepItem.id ? (
                              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              stepItem.id
                            )}
                          </div>
                          <div className="mt-2 text-center">
                            <div className={`text-sm font-medium ${step >= stepItem.id ? 'text-white' : 'text-gray-500'}`}>
                              {stepItem.name}
                            </div>
                            <div className={`text-xs ${step >= stepItem.id ? 'text-gray-400' : 'text-gray-600'}`}>
                              {stepItem.description}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
              {step === 1 && (
                <div className="space-y-4">
                  {/* Search */}
                  <div className="relative">
                    <svg 
                      className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-800/50 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all border border-gray-700 hover:border-gray-600"
                    />
                  </div>

                  {/* Products Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {filteredProducts.map((product) => (
                      <div
                        key={product.id}
                        onClick={() => toggleProductSelection(product)}
                        className={`relative bg-gray-800/50 rounded-lg p-4 cursor-pointer transition-all hover:bg-gray-800 
                          ${selectedProducts.find(p => p.id === product.id) ? 'ring-2 ring-blue-500' : 'border border-gray-700'}`}
                      >
                        <div className="aspect-square relative rounded-lg overflow-hidden mb-3">
                          <Image
                            src={product.image}
                            alt={product.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <h3 className="text-white font-medium truncate">{product.title}</h3>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-gray-400">₹{parseFloat(product.price).toLocaleString('en-IN')}</p>
                          {selectedProducts.find(p => p.id === product.id) && (
                            <div className="flex items-center gap-2 bg-gray-900/80 rounded-lg p-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateQuantity(product, 'decrease');
                                }}
                                className="w-6 h-6 flex items-center justify-center text-white hover:bg-gray-700 rounded"
                              >
                                -
                              </button>
                              <span className="text-white min-w-[20px] text-center">
                                {selectedProducts.find(p => p.id === product.id)?.quantity || 1}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateQuantity(product, 'increase');
                                }}
                                className="w-6 h-6 flex items-center justify-center text-white hover:bg-gray-700 rounded"
                              >
                                +
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">First Name</label>
                        <input
                          type="text"
                          value={orderDetails.firstName}
                          onChange={(e) => setOrderDetails(prev => ({
                            ...prev,
                            firstName: e.target.value
                          }))}
                          className="w-full bg-gray-800/50 text-white rounded-lg p-3 border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Email</label>
                        <input
                          type="email"
                          value={orderDetails.email}
                          onChange={(e) => setOrderDetails(prev => ({
                            ...prev,
                            email: e.target.value
                          }))}
                          className="w-full bg-gray-800/50 text-white rounded-lg p-3 border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Last Name</label>
                        <input
                          type="text"
                          value={orderDetails.lastName}
                          onChange={(e) => setOrderDetails(prev => ({
                            ...prev,
                            lastName: e.target.value
                          }))}
                          className="w-full bg-gray-800/50 text-white rounded-lg p-3 border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Phone</label>
                        <input
                          type="tel"
                          value={orderDetails.phone}
                          onChange={(e) => setOrderDetails(prev => ({
                            ...prev,
                            phone: e.target.value
                          }))}
                          className="w-full bg-gray-800/50 text-white rounded-lg p-3 border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Street Address</label>
                      <input
                        type="text"
                        value={orderDetails.address.street}
                        onChange={(e) => setOrderDetails(prev => ({
                          ...prev,
                          address: { ...prev.address, street: e.target.value }
                        }))}
                        className="w-full bg-gray-800/50 text-white rounded-lg p-3 border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">City</label>
                        <input
                          type="text"
                          value={orderDetails.address.city}
                          onChange={(e) => setOrderDetails(prev => ({
                            ...prev,
                            address: { ...prev.address, city: e.target.value }
                          }))}
                          className="w-full bg-gray-800/50 text-white rounded-lg p-3 border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">State</label>
                        <input
                          type="text"
                          value={orderDetails.address.state}
                          onChange={(e) => setOrderDetails(prev => ({
                            ...prev,
                            address: { ...prev.address, state: e.target.value }
                          }))}
                          className="w-full bg-gray-800/50 text-white rounded-lg p-3 border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">PIN Code</label>
                        <input
                          type="text"
                          value={orderDetails.address.pincode}
                          onChange={(e) => setOrderDetails(prev => ({
                            ...prev,
                            address: { ...prev.address, pincode: e.target.value }
                          }))}
                          className="w-full bg-gray-800/50 text-white rounded-lg p-3 border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Country</label>
                        <input
                          type="text"
                          value={orderDetails.address.country}
                          disabled
                          className="w-full bg-gray-800/50 text-white rounded-lg p-3 border border-gray-700 cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                    <h3 className="text-lg font-medium text-white mb-4">Order Summary</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm text-gray-400 mb-2">Shipping To:</h4>
                        <div className="text-white">
                          {orderDetails.firstName} {orderDetails.lastName}
                          <br />
                          {orderDetails.address.street}
                          <br />
                          {orderDetails.address.city}, {orderDetails.address.state} {orderDetails.address.pincode}
                          <br />
                          {orderDetails.address.country}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm text-gray-400 mb-2">Products:</h4>
                        <div className="space-y-2">
                          {selectedProducts.map(product => (
                            <div key={product.id} className="flex justify-between text-white">
                              <span>{product.title} × {product.quantity}</span>
                              <span>₹{(product.price * product.quantity).toLocaleString('en-IN')}</span>
                            </div>
                          ))}
                          <div className="border-t border-gray-700 pt-2 mt-2">
                            <div className="flex justify-between text-lg font-medium text-white">
                              <span>Total</span>
                              <span>₹{calculateTotal().toLocaleString('en-IN')}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-700 px-6 py-4">
              <div className="flex justify-between items-center">
                {step > 1 && (
                  <button
                    onClick={() => setStep(prev => prev - 1)}
                    className="flex items-center gap-2 px-4 py-2 text-white hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                  </button>
                )}
                <div className="flex-1 flex justify-end">
                  <button
                    onClick={() => {
                      if (step === 3) {
                        handleDetailsSubmit();
                      } else {
                        setStep(prev => prev + 1);
                      }
                    }}
                    disabled={step === 1 && selectedProducts.length === 0}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {step === 3 ? (
                      <>
                        Place Order
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </>
                    ) : (
                      <>
                        Continue
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {isCreatingOrder && <OrderLoadingAnimation />}
    </>
  );
} 