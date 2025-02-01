'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { db } from '../../../../lib/firebase'; // Adjust the path as necessary
import { doc, getDoc, collection, query, where, getDocs, setDoc, onSnapshot, addDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid'; // Import UUID
import { FaPlus, FaLink, FaUser, FaClock, FaCheckDouble, FaSpinner } from 'react-icons/fa'; // Importing icons
import Modal from '@/components/Modal'; // Import the existing Modal component
import CreateMethodModal from '@/components/CreateMethodModal'; // Import the modal component

const ApiAccountsPage = () => {
    const { id } = useParams();
  const router = useRouter();

  console.log(id);
  

  // Fetch account details and declared APIs based on the id
  const [accountDetails, setAccountDetails] = useState(null);
  const [declaredApis, setDeclaredApis] = useState([]);

  // New state to hold all accounts
  const [allAccounts, setAllAccounts] = useState([]);

  // New state for modal visibility and form data
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAccount, setNewAccount] = useState({
    apiAccountName: '',
    apiName: '',
    apiNameId: '',
    createdBy: 'yourUserId', // Replace with actual user ID
    url: '', // New field for URL
    headers: [{ key: '', value: '' }], // New field for headers
    clientId: '', // New field for Client ID
    clientSecret: '', // New field for Client Secret
    redirectUrl: '', // New field for Redirect URL
  });

  const inputRef = useRef(null);

  const [loadingApi, setLoadingApi] = useState(null); // New state to track loading API
  const [testResults, setTestResults] = useState({}); // New state to track test results
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [selectedApi, setSelectedApi] = useState(null);
  const [createdAtMin, setCreatedAtMin] = useState('');
  const [createdAtMax, setCreatedAtMax] = useState('');
  const [apiNameId, setApiNameId ] = useState('');
  const [apiResponse, setApiResponse] = useState(null); // State to hold API response
  const [isMethodModalOpen, setIsMethodModalOpen] = useState(false); // State for method modal
  const [newMethod, setNewMethod] = useState({
    apiTitle: '',
    mainUrl: '',
    method: 'GET',
    queryParams: [],
    // headers: [],
    // clientId: '',
    // clientSecret: '',
    // redirectUrl: '',
    // apiAccountId: '',
    apiName:'',
    apiNameId: '',
    baseUrl: '',
    uuid: '',
  }); // State for new method


  console.log(allAccounts);
  

 
  useEffect(() => {
    const fetchData = () => {
      const accountsQuery = query(collection(db, 'api_accounts'), where('apiName', '==', id));
      const unsubscribeAccounts = onSnapshot(accountsQuery, (accountsSnapshot) => {
        if (!accountsSnapshot.empty) {
          const accountData = accountsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setAllAccounts(accountData); // Set all accounts

          // Fetch the first account's details
          const firstAccount = accountData[0];
          setAccountDetails(firstAccount);

          // Fetch declared APIs based on apiNameId
          const apiQuery = query(collection(db, 'declared_api'), where('apiName', '==', id));
          const unsubscribeApis = onSnapshot(apiQuery, (apiSnapshot) => {
            const apiData = apiSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setDeclaredApis(apiData);
          });

          // Cleanup subscription for APIs
          return () => {
            unsubscribeApis();
          };
        } else {
          console.error("No matching account found!");
          setAccountDetails(null); // Reset account details if no document found
        }
      });

      // Cleanup subscription on unmount
      return () => {
        unsubscribeAccounts();
      };
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    const fetchApiNameUuid = async () => {
      console.log("Fetching API Name UUID for ID:", id); // Log the ID to check its value
      const apiNameQuery = query(collection(db, 'api_names'), where('apiName', '==', id)); // Ensure 'apiName' matches the field in your collection
      const apiNameSnapshot = await getDocs(apiNameQuery);
      if (!apiNameSnapshot.empty) {
        const apiNameData = apiNameSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setApiNameId(apiNameData)
        console.log("API UUID:", apiNameData[0].uuid); // Log the UUID of the first matching API name
      } else {
        console.error("No matching API name found!");
      }
    };

    fetchApiNameUuid();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAccount((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddAccount = async () => {
    const accountId = uuidv4(); // Generate a unique ID
    const accountDocRef = doc(db, 'api_accounts', accountId); // Use UUID as the document ID

    // Save the new account with relevant data
    await setDoc(accountDocRef, {
      apiAccountName: newAccount.apiAccountName,
      apiName: id,
      apiNameId: apiNameId, // Ensure this is defined
      createdAt: new Date().toISOString(),
      createdBy: newAccount.createdBy,
      uuid: accountId, // Use accountId directly
      url: newAccount.url,
      headers: newAccount.headers,
      clientId: newAccount.clientId,
      clientSecret: newAccount.clientSecret,
      redirectUrl: newAccount.redirectUrl,
    });

    setIsModalOpen(false);
  };

  useEffect(() => {
    if (isModalOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isModalOpen]);

  // Check if accountDetails is null before rendering
 

  // Function to format Firestore timestamp
  const formatTimestamp = (timestamp) => {
    if (timestamp && timestamp.seconds) {
      const date = new Date(timestamp.seconds * 1000);
      return date.toLocaleString(); // Format as needed
    }
    return 'N/A'; // Fallback if timestamp is not valid
  };

  
  
 

  const handleCreateMethod = async (methodData) => {
    const methodId = uuidv4(); // Generate a unique ID for the method

    try {
      // Add the new method to the declared_api collection with the generated ID
      await setDoc(doc(db, 'declared_api', methodId), {
        apiTitle: methodData.apiTitle,
        mainUrl: methodData.mainUrl,
        method: methodData.method,
        apiName:id,   
        queryParams: methodData.queryParams,
        // headers: methodData.headers,
        // clientId: methodData.clientId,
        // clientSecret: methodData.clientSecret,
        // redirectUrl: methodData.redirectUrl,
        // apiAccountId: methodData.apiAccountId, // Ensure apiAccountId is included
        apiNameId: apiNameId[0].uuid, // Store the API name ID
        createdAt: new Date().toISOString(), // Optional: Add a timestamp
      });

      console.log("Document written with ID: ", methodId);
      // Reset newMethod state after submission
      setNewMethod({
        apiTitle: '',
        mainUrl: '',
        method: 'GET',
        queryParams: [],
        // headers: [],
        // clientId: '',
        // clientSecret: '',
        // redirectUrl: '',
        // apiAccountId: '', // Reset apiAccountId
        apiNameId: '',
        uuid: '',
      });
      setIsMethodModalOpen(false); // Close the modal
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  const addHeader = () => {
    setNewAccount((prev) => ({
        ...prev,
        headers: [...prev.headers, { key: '', value: '' }],
    }));
  };

  const removeHeader = (index) => {
    setNewAccount((prev) => ({
        ...prev,
        headers: prev.headers.filter((_, i) => i !== index),
    }));
  };

  const handleHeaderChange = (index, field, value) => {
    const updatedHeaders = [...newAccount.headers];
    updatedHeaders[index][field] = value;
    setNewAccount((prev) => ({
        ...prev,
        headers: updatedHeaders,
    }));
  };

  return (
    <div className=" bg-gray-900 min-h-screen w-full text-white">
      {/* Nav Bar Section */}
    

      {/* Modal for Adding New Account */}
      {isModalOpen && (
        <div className="fixed z-50 inset-0 flex items-center justify-center bg-black bg-opacity-70">
          <div className="bg-gray-800 p-8 rounded-lg shadow-lg transform transition-all duration-300 scale-100 max-w-md w-full">
            <h2 className="text-2xl font-bold text-center mb-6">Add New Account</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleAddAccount(); }} className="space-y-4">
              <input 
                ref={inputRef}
                type="text" 
                name="apiAccountName" 
                placeholder="Account Name" 
                value={newAccount.apiAccountName} 
                onChange={handleInputChange} 
                required 
                className="border border-gray-600 p-3 rounded-lg w-full bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {id.toLowerCase() === 'pinterest' ? ( // Conditional rendering for Pinterest
                <>
                  <input 
                    type="text" 
                    name="clientId" 
                    placeholder="Client ID" 
                    value={newAccount.clientId} 
                    onChange={handleInputChange} 
                    className="border border-gray-600 p-3 rounded-lg w-full bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input 
                    type="text" 
                    name="clientSecret" 
                    placeholder="Client Secret" 
                    value={newAccount.clientSecret} 
                    onChange={handleInputChange} 
                    className="border border-gray-600 p-3 rounded-lg w-full bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input 
                    type="text" 
                    name="redirectUrl" 
                    placeholder="Redirect URL" 
                    value={newAccount.redirectUrl} 
                    onChange={handleInputChange} 
                    className="border border-gray-600 p-3 rounded-lg w-full bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </>
              ) : (
                <>
                  <input 
                    type="text" 
                    name="url" 
                    placeholder="API URL" 
                    value={newAccount.url} 
                    onChange={handleInputChange} 
                    required 
                    className="border border-gray-600 p-3 rounded-lg w-full bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {newAccount.headers.map((header, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input 
                        type="text" 
                        placeholder="Header Key" 
                        value={header.key} 
                        onChange={(e) => handleHeaderChange(index, 'key', e.target.value)} 
                        className="border border-gray-600 p-3 rounded-lg w-1/2 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input 
                        type="text" 
                        placeholder="Header Value" 
                        value={header.value} 
                        onChange={(e) => handleHeaderChange(index, 'value', e.target.value)} 
                        className="border border-gray-600 p-3 rounded-lg w-1/2 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button type="button" onClick={() => removeHeader(index)} className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition duration-200">
                        <span className="text-lg">−</span>
                      </button>
                    </div>
                  ))}
                  <button type="button" onClick={addHeader} className="bg-blue-600 text-white p-2 rounded-lg flex items-center justify-center w-full hover:bg-blue-700 transition duration-200">
                    <span className="text-lg">+</span> Add Header
                  </button>
                </>
              )}
              <div className="flex justify-between">
                <button type="submit" className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition duration-200 w-full mr-2">
                  Save
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition duration-200 w-full ml-2"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Account Details Section */}
      <div className="mt-6 bg-gray-800 border rounded-lg p-4 shadow-md"

      >
        <h2 className="font-semibold text-lg">Account Information</h2>
        <p><strong>API Name:</strong> {id}</p> 
        <p><strong>Created At:</strong> {formatTimestamp(apiNameId.createdAt)}</p>
        <p><strong>Created By:</strong> {apiNameId.createdBy}</p>
      </div>

      {/* New Section for All Accounts */}
      <div className="mt-6 bg-gray-800 border rounded-lg p-4 shadow-md overflow-x-auto">
       <div className='flex justify-between items-center mb-4'>
       <h2 className="text-lg font-bold ">All Accounts for {id}</h2>
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="flex items-center bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition duration-200"
        >
          <FaPlus className="mr-2" /> Add Account
        </button>
       </div>
        <div className="flex space-x-4">
          {allAccounts.map((account) => (
            <div 
              key={account.id} 
              className="bg-gray-800 border rounded-lg p-4 shadow-lg transition-transform transform hover:scale-105 hover:shadow-xl cursor-pointer w-72"
              onClick={() => router.push(`/dashboard/account-details/${account.apiAccountName}`)}
            >
              <h3 className="font-semibold text-xl">{account.apiAccountName}</h3>
              <p className="flex items-center"><FaLink className="mr-2" /><strong>API Name:</strong> {id}</p>
              <p className="flex items-center"><FaClock className="mr-2" /><strong>Created At:</strong> {formatTimestamp(account.createdAt)}</p> 
              <p className="flex items-center"><FaUser className="mr-2" /><strong>Created By:</strong> {account.createdBy}</p>
            </div>
          ))}
        </div>
      </div>

       {/* Declared APIs Section  */}
      <div className="mt-6 bg-gray-800 border rounded-lg p-4 shadow-md">
       <div className="flex justify-between items-center">
       <h2 className="font-semibold text-lg mb-2">Methods</h2>
        <button 
          onClick={() => setIsMethodModalOpen(true)} 
          className="mb-4 flex items-center bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-200"
        >
         <FaPlus className="mr-2" /> Create Method
        </button>
       </div>
        {declaredApis.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {declaredApis.map((api) => (
              <div 
                key={api.id} 
                className="method-item cursor-pointer border rounded-lg bg-gray-800 mb-4 p-2 h-24 flex flex-col justify-between"
                onClick={() => router.push(`
                  /dashboard/api-methods/${api.id}`)}
              >
                <h3 className="font-bold">{api.apiTitle}</h3>
                <p className="text-sm">Main URL: {api.mainUrl}</p>
                {testResults[api.id] === true && (
                  <span className="text-green-500 flex items-center">
                    {[...Array(5)].map((_, index) => (
                      <FaCheckDouble key={index} className="text-green-500" />
                    ))}
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p>No declared APIs found for this account.</p>
        )}
      </div>

      {/* API Response Section  */}
  
      {/* Date Input Modal */}
    
      <CreateMethodModal
        isOpen={isMethodModalOpen}
        onClose={() => setIsMethodModalOpen(false)}
        onSubmit={handleCreateMethod}
        allAccounts={allAccounts} // Pass the correct accounts
        newMethod={newMethod}
        setNewMethod={setNewMethod}
      />
    </div>
  );
};

export default ApiAccountsPage;