'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { db } from '../../../../lib/firebase'; // Adjust the path as necessary
import { doc, getDoc, collection, query, where, getDocs, setDoc, onSnapshot } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid'; // Import UUID
import { FaPlus, FaLink, FaUser, FaClock, FaCheckDouble, FaSpinner } from 'react-icons/fa'; // Importing icons
import Modal from '@/components/Modal'; // Import the existing Modal component

const ApiAccountsPage = () => {
    const { id } = useParams();
  const router = useRouter();

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
  });

  const inputRef = useRef(null);

  const [loadingApi, setLoadingApi] = useState(null); // New state to track loading API
  const [testResults, setTestResults] = useState({}); // New state to track test results
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [selectedApi, setSelectedApi] = useState(null);
  const [createdAtMin, setCreatedAtMin] = useState('');
  const [createdAtMax, setCreatedAtMax] = useState('');
  const [apiResponse, setApiResponse] = useState(null); // State to hold API response
  const [isMethodModalOpen, setIsMethodModalOpen] = useState(false); // State for method modal
  const [newMethod, setNewMethod] = useState({ 
    apiTitle: '', 
    mainUrl: '', 
    method: '', 
    queryParams: [], 
    headers: [],
    clientId: '',
    clientSecret: '',
    redirectUrl: '',
    apiAccountId: '' // New field for selected API account ID
  }); // State for new method

  const handleOAuthRedirect = useCallback((api) => {
    const scopes = ['boards:read', 'boards:write', 'pins:read', 'pins:write'];
    const authUrl = new URL('https://www.pinterest.com/oauth/');
    
    // Use the client ID and redirect URL from the API data
    authUrl.searchParams.append('client_id', api.clientId);
    authUrl.searchParams.append('redirect_uri', api.redirectUrl);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('scope', scopes.join(','));

    // Redirect to Pinterest OAuth
    window.location.href = authUrl.toString();
  }, []);

  useEffect(() => {
    const fetchData = () => {
      // Fetch account details
      const accountDoc = doc(db, 'api_accounts', id);
      const unsubscribeAccount = onSnapshot(accountDoc, (accountSnapshot) => {
        if (accountSnapshot.exists()) {
          const accountData = accountSnapshot.data();
          setAccountDetails(accountData);

          // Fetch all accounts for the specified API name
          const accountsQuery = query(collection(db, 'api_accounts'), where('apiNameId', '==', id));
          const unsubscribeAccounts = onSnapshot(accountsQuery, (accountsSnapshot) => {
            const accountsData = accountsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            console.log("Fetched Accounts:", accountsData); // Debugging line
            setAllAccounts(accountsData); // Ensure all accounts are set
          });

          // Cleanup subscription for accounts
          return () => {
            unsubscribeAccounts();
          };
        } else {
          console.error("No such document!");
          return; // Exit if no document found
        }
      });

      // Fetch declared APIs
      const apiQuery = query(collection(db, 'declared_api'), where('apiAccountId', '==', id));
      const unsubscribeApis = onSnapshot(apiQuery, (apiSnapshot) => {
        const apiData = apiSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setDeclaredApis(apiData);
      });

      // Cleanup subscriptions on unmount
      return () => {
        unsubscribeAccount();
        unsubscribeApis();
      };
    };

    fetchData();
  }, [id]); // Only depend on 'id' for the initial fetch

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
      apiNameId: id, // Set to empty or default value if not needed
      createdAt: new Date().toISOString(),
      createdBy: newAccount.createdBy,
      uuid: accountId,
    });

    setIsModalOpen(false);
  };

  useEffect(() => {
    if (isModalOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isModalOpen]);

  if (!accountDetails) return <div className="text-center text-white">Loading...</div>; // Loading state

  // Function to format Firestore timestamp
  const formatTimestamp = (timestamp) => {
    if (timestamp && timestamp.seconds) {
      const date = new Date(timestamp.seconds * 1000);
      return date.toLocaleString(); // Format as needed
    }
    return 'N/A'; // Fallback if timestamp is not valid
  };

  


  

  const handleCreateMethod = async () => {
    const methodId = uuidv4();
    const methodDocRef = doc(db, 'declared_api', methodId);

    await setDoc(methodDocRef, {
      apiTitle: newMethod.apiTitle,
      mainUrl: newMethod.mainUrl,
      method: newMethod.method,
      queryParams: newMethod.queryParams,
      headers: newMethod.headers,
      clientId: newMethod.clientId,
      clientSecret: newMethod.clientSecret,
      redirectUrl: newMethod.redirectUrl,
      apiAccountId: newMethod.apiAccountId, // Save selected API account ID
      createdAt: new Date().toISOString(),
      createdBy: 'yourUserId', // Replace with actual user ID
      uuid: methodId,
      apiNameId: id,
    });

    setIsMethodModalOpen(false); // Close the method modal
    setNewMethod({ 
      apiTitle: '', 
      mainUrl: '', 
      method: '', 
      queryParams: [], 
      headers: [],
      clientId: '',
      clientSecret: '',
      redirectUrl: '',
      apiAccountId: '' // Reset selected API account ID
    }); // Reset new method state
  };

  const handleAddHeader = () => {
    setNewMethod((prev) => ({
      ...prev,
      headers: [...prev.headers, { key: '', value: '' }]
    }));
  };

  const handleHeaderChange = (index, field, value) => {
    const updatedHeaders = [...newMethod.headers];
    updatedHeaders[index][field] = value;
    setNewMethod((prev) => ({ ...prev, headers: updatedHeaders }));
  };

  const handleAddQueryParam = () => {
    setNewMethod((prev) => ({
      ...prev,
      queryParams: [...prev.queryParams, { key: '', value: '' }]
    }));
  };

  const handleQueryParamChange = (index, field, value) => {
    const updatedQueryParams = [...newMethod.queryParams];
    updatedQueryParams[index][field] = value;
    setNewMethod((prev) => ({ ...prev, queryParams: updatedQueryParams }));
  };

  return (
    <div className=" bg-gray-900 min-h-screen w-full text-white">
      {/* Nav Bar Section */}
      <div className="flex justify-between items-center p-4 bg-gray-800 shadow-md rounded-lg">
        <h1 className="text-2xl font-bold">Account Details for {accountDetails.apiName}</h1>
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="flex items-center bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition duration-200"
        >
          <FaPlus className="mr-2" /> Add Account
        </button>
      </div>

      {/* Modal for Adding New Account */}
      {isModalOpen && (
        <div className="fixed z-50 inset-0 flex items-center justify-center bg-black bg-opacity-70">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg transform transition-all duration-300 scale-100">
            <h2 className="text-lg font-bold">Add New Account</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleAddAccount(); }}>
              <input 
                ref={inputRef}
                type="text" 
                name="apiAccountName" 
                placeholder="Account Name" 
                value={newAccount.apiAccountName} 
                onChange={handleInputChange} 
                required 
                className="border border-gray-600 p-2 mb-4 w-full rounded bg-gray-700 text-white"
              />
              <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-200">
                Save
              </button>
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)} 
                className="bg-red-600 text-white py-2 px-4 rounded ml-2 hover:bg-red-700 transition duration-200"
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Account Details Section */}
      <div className="mt-6 bg-gray-800 border rounded-lg p-4 shadow-md">
        <h2 className="font-semibold text-lg">Account Information</h2>
        <p><strong>API Name:</strong> {accountDetails.apiName}</p>
        <p><strong>Created At:</strong> {formatTimestamp(accountDetails.createdAt)}</p>
        <p><strong>Created By:</strong> {accountDetails.createdBy}</p>
      </div>

      {/* New Section for All Accounts */}
      <div className="mt-6">
        <h2 className="text-lg font-bold">All Accounts for {accountDetails.apiName}</h2>
        <div className="grid grid-cols-3 gap-4">
          {allAccounts.map(account => (
            <div 
              key={account.id} 
              className="bg-gray-800 p-4 rounded-lg cursor-pointer" 
              onClick={() => router.push(`/dashboard/account-details/${account.id}`)} // Navigate to account details
            >
              <h3 className="text-lg font-bold">{account.apiAccountName}</h3>
              <p><strong>API Name:</strong> {account.apiName}</p>
              <p><strong>Created At:</strong> {formatTimestamp(account.createdAt)}</p>
              <p><strong>Created By:</strong> {account.createdBy}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Declared APIs Section */}
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
          declaredApis.map((api) => (
            <div 
              key={api.id} 
              className="method-item cursor-pointer p-4 border rounded-lg bg-gray-800 mb-4" 
              onClick={() => router.push(`/dashboard/api-methods/${api.id}`)} // Navigate to method details
            >
              <h3 className="text-lg font-bold">{api.apiTitle}</h3>
              <p>Main URL: {api.mainUrl}</p>
              {testResults[api.id] === true && (
                <span className="text-green-500 flex items-center">
                  {[...Array(5)].map((_, index) => (
                    <FaCheckDouble key={index} className="text-green-500" />
                  ))}
                </span>
              )}
             
            </div>
          ))
        ) : (
          <p>No declared APIs found for this account.</p>
        )}
      </div>

      {/* API Response Section */}
      {apiResponse && (
        <div className="mt-6 bg-gray-800 border rounded-lg p-4 shadow-md max-h-60 overflow-y-auto">
          <h2 className="font-semibold text-lg mb-2">API Response</h2>
          <p className="text-white">Count: {Array.isArray(apiResponse) ? apiResponse.length : 0}</p>
          <pre className="whitespace-pre-wrap text-sm text-gray-300">{JSON.stringify(apiResponse, null, 2)}</pre>
        </div>
      )}

      {/* Date Input Modal */}
      {isDateModalOpen && (
        <Modal onClose={() => setIsDateModalOpen(false)}>
          <h2 className="text-lg font-bold">Select Date Range</h2>
          <div className="mt-4">
            <label className="block text-white">Created At Min:</label>
            <input
              type="date"
              value={createdAtMin}
              onChange={(e) => setCreatedAtMin(e.target.value)}
              className="border border-gray-600 p-2 mb-4 w-full rounded bg-gray-700 text-white"
            />
            <label className="block text-white">Created At Max:</label>
            <input
              type="date"
              value={createdAtMax}
              onChange={(e) => setCreatedAtMax(e.target.value)}
              className="border border-gray-600 p-2 mb-4 w-full rounded bg-gray-700 text-white"
            />
          </div>
          <button
            onClick={handleDateSubmit}
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-200"
          >
            Submit
          </button>
        </Modal>
      )}

      {/* Method Creation Modal */}
      {isMethodModalOpen && (
        <Modal onClose={() => setIsMethodModalOpen(false)}>
          <h2 className="text-lg font-bold">Create New Method</h2>
          <div className="mt-4">
            <label className="block text-white">API Title:</label>
            <input
              type="text"
              value={newMethod.apiTitle}
              onChange={(e) => setNewMethod({ ...newMethod, apiTitle: e.target.value })}
              className="border border-gray-600 p-2 mb-4 w-full rounded bg-gray-700 text-white"
            />
            <label className="block text-white">Main URL:</label>
            <input
              type="text"
              value={newMethod.mainUrl}
              onChange={(e) => setNewMethod({ ...newMethod, mainUrl: e.target.value })}
              className="border border-gray-600 p-2 mb-4 w-full rounded bg-gray-700 text-white"
            />
            <label className="block text-white">Method:</label>
            <input
              type="text"
              value={newMethod.method}
              onChange={(e) => setNewMethod({ ...newMethod, method: e.target.value })}
              className="border border-gray-600 p-2 mb-4 w-full rounded bg-gray-700 text-white"
            />
            <label className="block text-white">Client ID:</label>
            <input
              type="text"
              value={newMethod.clientId}
              onChange={(e) => setNewMethod({ ...newMethod, clientId: e.target.value })}
              className="border border-gray-600 p-2 mb-4 w-full rounded bg-gray-700 text-white"
            />
            <label className="block text-white">Client Secret:</label>
            <input
              type="text"
              value={newMethod.clientSecret}
              onChange={(e) => setNewMethod({ ...newMethod, clientSecret: e.target.value })}
              className="border border-gray-600 p-2 mb-4 w-full rounded bg-gray-700 text-white"
            />
            <label className="block text-white">Redirect URL:</label>
            <input
              type="text"
              value={newMethod.redirectUrl}
              onChange={(e) => setNewMethod({ ...newMethod, redirectUrl: e.target.value })}
              className="border border-gray-600 p-2 mb-4 w-full rounded bg-gray-700 text-white"
            />
            <label className="block text-white">Select API Account:</label>
            <select
              value={newMethod.apiAccountId}
              onChange={(e) => setNewMethod({ ...newMethod, apiAccountId: e.target.value })}
              className="border border-gray-600 p-2 mb-4 w-full rounded bg-gray-700 text-white"
            >
              <option value="">Select an account</option>
              {allAccounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.apiAccountName}
                </option>
              ))}
            </select>
            <h3 className="text-white">Headers:</h3>
            {newMethod.headers.map((header, index) => (
              <div key={index} className="flex mb-2">
                <input
                  type="text"
                  placeholder="Header Key"
                  value={header.key}
                  onChange={(e) => handleHeaderChange(index, 'key', e.target.value)}
                  className="border border-gray-600 p-2 rounded bg-gray-700 text-white mr-2"
                />
                <input
                  type="text"
                  placeholder="Header Value"
                  value={header.value}
                  onChange={(e) => handleHeaderChange(index, 'value', e.target.value)}
                  className="border border-gray-600 p-2 rounded bg-gray-700 text-white"
                />
              </div>
            ))}
            <button 
              onClick={handleAddHeader} 
              className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition duration-200 mb-4"
            >
              Add Header
            </button>
            <h3 className="text-white">Query Parameters:</h3>
            {newMethod.queryParams.map((param, index) => (
              <div key={index} className="flex mb-2">
                <input
                  type="text"
                  placeholder="Param Key"
                  value={param.key}
                  onChange={(e) => handleQueryParamChange(index, 'key', e.target.value)}
                  className="border border-gray-600 p-2 rounded bg-gray-700 text-white mr-2"
                />
                <input
                  type="text"
                  placeholder="Param Value"
                  value={param.value}
                  onChange={(e) => handleQueryParamChange(index, 'value', e.target.value)}
                  className="border border-gray-600 p-2 rounded bg-gray-700 text-white"
                />
              </div>
            ))}
            <button 
              onClick={handleAddQueryParam} 
              className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition duration-200 mb-4"
            >
              Add Query Parameter
            </button>
          </div>
          <button
            onClick={handleCreateMethod}
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-200"
          >
            Create Method
          </button>
        </Modal>
      )}
    </div>
  );
};

export default ApiAccountsPage;