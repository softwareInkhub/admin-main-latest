'use client'    

import React, { useState, useEffect } from 'react'
import Modal from '../../../components/Modal'; // Adjust the import based on your folder structure
import { HiOutlinePlusCircle, HiOutlineSave } from 'react-icons/hi'; // New icons for buttons
import { db } from '../../../lib/firebase'; // Adjust the import based on your folder structure
import { collection, addDoc, onSnapshot } from 'firebase/firestore';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Link from 'next/link'; // Ensure Link is imported


const Page = () => {
  const [apiName, setApiName] = useState('');
  const [apiNames, setApiNames] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false); // Loading state

  // Load API names from Firestore in real-time
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'api_names'), (querySnapshot) => {
      const names = querySnapshot.docs.map(doc => ({ id: doc.id, apiName: doc.data().apiName }));
      setApiNames(names);
    }, (error) => {
      console.error('Error fetching API names: ', error);
      toast.error('Error fetching API names!');
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const handleSave = async () => {
    if (apiName) {
      setLoading(true); // Start loading
      const apiData = {
        apiName: apiName,
        createdAt: new Date().toISOString(),
        createdBy: 'yourUserId', // Replace with actual user ID
        uuid: crypto.randomUUID(),
      };

      // Save to Firestore
      try {
        await addDoc(collection(db, 'api_names'), apiData);
        toast.success('API data saved successfully!'); // Success toast
      } catch (error) {
        console.error('Error saving API data: ', error);
        toast.error('Error saving API data!'); // Error toast
      } finally {
        setLoading(false); // Stop loading
        setApiName(''); // Clear input field
        setModalOpen(false); // Close modal
      }
    }
  };

 

  return (
    <div className="relative p-6 bg-gray-900 min-h-screen">
      <ToastContainer />
      <button 
        onClick={() => setModalOpen(true)} 
        className="absolute top-4 right-4 flex items-center bg-green-600 text-white px-4 py-2 rounded-full shadow-lg transition-transform transform hover:scale-105"
      >
        <HiOutlinePlusCircle className="mr-2" /> Add API Name
      </button>

      {isModalOpen && (
        <Modal onClose={() => setModalOpen(false)}>
          <div className="flex flex-col">
            <input 
              type="text" 
              value={apiName} 
              onChange={(e) => setApiName(e.target.value)} 
              placeholder="Enter API Name" 
              className="border-gray-300 rounded-lg p-3 text-gray-900 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button 
              onClick={handleSave} 
              className={`bg-blue-600 text-white px-4 py-2 rounded-full flex items-center transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-500'}`}
              disabled={loading} // Disable button while loading
            >
              {loading ? 'Saving...' : <><HiOutlineSave className="mr-2" /> Save</>}
            </button>
          </div>
        </Modal>
      )}

      <h1 className="text-2xl font-semibold mb-4">API Names</h1>

      <div className="mt-16 flex flex-wrap gap-6">
        {apiNames.map((name, index) => (
          <Link href={`/dashboard/api-accounts/${name.id}`} key={index}>
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg cursor-pointer shadow-md p-4 flex items-center justify-center h-32 w-32 transition-transform transform hover:scale-105 hover:shadow-xl relative"
            >
              <span className="text-lg font-bold text-white">{name.apiName}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default Page