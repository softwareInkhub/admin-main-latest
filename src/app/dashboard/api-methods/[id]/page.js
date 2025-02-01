"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase'; // Adjust the import based on your project structure
import { FaLink, FaEdit } from 'react-icons/fa';
import Modal from '@/components/Modal'; // Import the Modal component
import { toast } from 'react-toastify'; // Import toast for notifications

const MethodDetails = () => {
  const router = useRouter();
  const { id } = useParams(); // Get the ID from the URL
  const [methodDetails, setMethodDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiResponse, setApiResponse] = useState(null);
  const [isEditing, setIsEditing] = useState(false); // State for edit mode
  const [accounts, setAccounts] = useState([]); // State for accounts
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false); // State for account selection modal
  const [selectedAccount, setSelectedAccount] = useState(null); // State for selected account
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [createdAtMin, setCreatedAtMin] = useState('');
  const [createdAtMax, setCreatedAtMax] = useState('');
  const [queryParams, setQueryParams] = useState([]); // State for query parameters

  useEffect(() => {
    const fetchMethodDetails = async () => {
      if (!id) return; // Exit if ID is not available

      try {
        const docRef = doc(db, 'declared_api', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setMethodDetails(data);
          setQueryParams(data.queryParams || []); // Initialize queryParams from methodDetails
        } else {
          console.error("No such document!");
        }
      } catch (error) {
        console.error("Error fetching method details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMethodDetails();
  }, [id]);

  console.log(methodDetails);
  

  const handleEditToggle = () => {
    setIsEditing(!isEditing); // Toggle edit mode
  };

  const handleAddQueryParam = () => {
    setQueryParams([...queryParams, { key: '', value: '' }]); // Add a new empty query param
  };

  const handleRemoveQueryParam = (index) => {
    const newQueryParams = queryParams.filter((_, i) => i !== index); // Remove the query param at the specified index
    setQueryParams(newQueryParams);
  };

  const handleQueryParamChange = (index, field, value) => {
    const newQueryParams = [...queryParams];
    newQueryParams[index][field] = value; // Update the specific field of the query param
    setQueryParams(newQueryParams);
  };

  const handleSaveChanges = async () => {
    if (!methodDetails) return;

    try {
      const docRef = doc(db, 'declared_api', id);
      await updateDoc(docRef, { ...methodDetails, queryParams }); // Save changes to Firebase
      toast.success("Changes saved successfully!");
    } catch (error) {
      console.error("Error saving changes:", error);
      toast.error("Failed to save changes.");
    } finally {
      setIsEditing(false); // Exit edit mode after saving
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false); // Exit edit mode without saving
  };

  const fetchAccounts = async () => {
    if (!methodDetails) return;

    try {
      console.log("Fetching accounts for API Name:", methodDetails.apiName); // Debugging log
      const accountQuery = query(collection(db, 'api_accounts'), where('apiName', '==', methodDetails.apiName));
      const accountSnapshot = await getDocs(accountQuery);
      const accountData = accountSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log("Fetched accounts:", accountData); // Debugging log
      setAccounts(accountData); // Update state with fetched accounts
    } catch (error) {
      console.error("Error fetching accounts:", error);
    }
  };

  const handleSelectAccount = async () => {
    await fetchAccounts(); // Fetch accounts when selecting
    if (accounts.length === 0) {
      alert("No accounts available for selection.");
      return;
    }
    setIsAccountModalOpen(true); // Open the modal to select an account
  };

  const handleAccountSelect = (account) => {
    console.log('Selected Account:', account); // Log the selected account
    setSelectedAccount(account);
    setIsAccountModalOpen(false);
  };

  const performApiTest = async (account) => {
    if (!account) {
      toast.error("Please select an account to test the API."); // Show toast message
      return;
    }

    // Construct the URL
    let url = account.url || '';
    if (methodDetails.mainUrl) {
      url += url.endsWith('/') ? methodDetails.mainUrl.replace(/^\//, '') : `/${methodDetails.mainUrl.replace(/^\//, '')}`;
    }

    // Prepare the request body
    const requestBody = {
      url: url, // Use the constructed URL
      method: 'GET', // or the method you want to use
      headers: {}, // Initialize headers as an object
      params: (queryParams || []).reduce((acc, param) => {
        acc[param.key] = param.value;
        return acc;
      }, {}),
    };

    // Populate headers correctly
    if (account.headers) {
      account.headers.forEach(header => {
        requestBody.headers[header.key] = header.value; // Add each header to the request body
      });
    }

    try {
      const response = await fetch('/api/apiCall', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody), // Send the request body
      });

      console.log("request body", requestBody);
      

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const apiResponseData = await response.json();
      console.log('API Response:', apiResponseData);
      setApiResponse(apiResponseData); // Update state with API response

    } catch (error) {
      console.error('Error connecting to API:', error);
      toast.error("Error connecting to API: " + error.message);
    }
  };

  const handleTestApi = () => {
    performApiTest(selectedAccount);
  };

  const handleDateSubmit = () => {
    if (createdAtMin && createdAtMax) {
      performApiTest(selectedAccount); // Call the test function with the selected dates
      setIsDateModalOpen(false); // Close the modal
    } else {
      alert("Please select both dates."); // Alert if dates are not selected
    }
  };

  if (loading) return <div className="text-center text-white">Loading...</div>;

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <div className="flex justify-between mb-4">
        <h1 className="text-3xl font-bold">{methodDetails.apiTitle}</h1>
        <div className="flex items-center">
          <button onClick={handleEditToggle} className="bg-yellow-600 font-bold text-white py-2 px-4 rounded hover:bg-yellow-700 transition duration-200 mr-2">
            <FaEdit className="inline mr-1" /> Edit
          </button>
          <button onClick={handleSelectAccount} className="bg-blue-600 font-bold text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-200">
            Select Account
          </button>
        </div>
      </div>
      
      <div className="bg-gray-800 p-4 rounded-lg shadow-md">
        {isEditing ? (
          <>
            <label className="block text-white mb-2">Main URL:</label>
            <input type="text" value={methodDetails.mainUrl} onChange={(e) => setMethodDetails({ ...methodDetails, mainUrl: e.target.value })} className="border border-gray-600 p-2 mb-4 w-full rounded bg-gray-700" />
            
            <h2 className="text-xl font-semibold mt-4">Query Parameters:</h2>
            {queryParams.map((param, index) => (
              <div key={index} className="flex mb-2">
                <input
                  type="text"
                  placeholder="Key"
                  value={param.key}
                  onChange={(e) => handleQueryParamChange(index, 'key', e.target.value)}
                  className="border border-gray-600 p-2 rounded bg-gray-700 mr-2"
                />
                <input
                  type="text"
                  placeholder="Value"
                  value={param.value}
                  onChange={(e) => handleQueryParamChange(index, 'value', e.target.value)}
                  className="border border-gray-600 p-2 rounded bg-gray-700 mr-2"
                />
                <button onClick={() => handleRemoveQueryParam(index)} className="bg-red-600 text-white py-1 px-2 rounded hover:bg-red-700">Remove</button>
              </div>
            ))}
            <button onClick={handleAddQueryParam} className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">Add Query Parameter</button>

            <div className="flex justify-end">
              <button onClick={handleSaveChanges} className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition duration-200 mr-2">
                Save Changes
              </button>
              <button onClick={handleCancelEdit} className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 font-bold transition duration-200">
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="flex items-center mb-2"><FaLink className="mr-2" /> <strong>Api Name:</strong> {methodDetails.apiName}</p>
            <p className="flex items-center mb-2"><FaLink className="mr-2" /> <strong>Main URL:</strong> {methodDetails.mainUrl}</p>
            <h2 className="text-xl font-semibold mt-4">Query Parameters:</h2>
            {methodDetails.queryParams && methodDetails.queryParams.length > 0 ? (
              <ul className="list-disc ml-6">
                {methodDetails.queryParams.map((param, index) => (
                  <li key={index}><strong>{param.key}:</strong> {param.value}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No query parameters available.</p>
            )}
            {methodDetails.headers && (
              <>
                <h3 className="text-lg font-semibold mt-4">Headers:</h3>
                <ul className="list-disc ml-6">
                  {methodDetails.headers.map((header, index) => (
                    <li key={index}><strong>{header.key}:</strong> {header.value}</li>
                  ))}
                </ul>
              </>
            )}
          </>
        )}
      </div>

      {/* Account Selection Modal */}
      {isAccountModalOpen && (
        <Modal onClose={() => setIsAccountModalOpen(false)}>
          <h2 className="text-lg font-bold">Select Account to Test API</h2>
          <ul className="mt-4">
            {accounts.length > 0 ? (
              accounts.map((account) => (
                <li key={account.id} className="flex justify-between items-center p-2 border-b border-gray-600">
                  <span>{account.apiAccountName}</span>
                  <button onClick={() => handleAccountSelect(account)} className="bg-blue-600 font-bold text-white py-1 px-2 rounded hover:bg-blue-700 transition duration-200">Select</button>
                </li>
              ))
            ) : (
              <li className="p-2">No accounts available.</li>
            )}
          </ul>
        </Modal>
      )}

     {/* Display Selected Account Details */}
     {selectedAccount && (
       <div className="mt-6 bg-gray-800 p-4 rounded-lg shadow-md flex flex-col gap-2">
         <h2 className="text-lg font-bold">Selected Account:</h2>
         {selectedAccount.url && <p className="flex items-center"><FaLink className="mr-2" /><strong>URL:</strong> {selectedAccount.url}</p>}
         {selectedAccount.apiAccountName && <p><strong>Account Name:</strong> {selectedAccount.apiAccountName}</p>}
         {selectedAccount.apiName && <p><strong>API Name:</strong> {selectedAccount.apiName}</p>}
         {selectedAccount.clientId && <p><strong>Client ID:</strong> {selectedAccount.clientId}</p>}
         {selectedAccount.clientSecret && <p><strong>Client Secret:</strong> {selectedAccount.clientSecret}</p>}
         
         {/* Display Headers if they exist */}
         {selectedAccount.headers && selectedAccount.headers.length > 0 && (
           <>
             <h3 className="text-lg font-semibold mt-4">Headers:</h3>
             <ul className="list-disc ml-6">
               {selectedAccount.headers.map((header, index) => (
                 <li key={index}><strong>{header.key}:</strong> {header.value}</li>
               ))}
             </ul>
           </>
         )}

         {/* Test API Button */}
         <button onClick={handleTestApi} className="mt-4 bg-green-600 text-white w-[200px] font-bold py-2 px-4 rounded hover:bg-green-700 transition duration=200">Test API</button>
       </div>
     )}

     {/* API Response Section */}
     {apiResponse && (
       <div className="mt-6 bg-gray-800 border rounded-lg p-4 shadow-md max-h-[300px] overflow-y-auto">
         <h2 className="font-semibold text-lg mb-2">API Response</h2>
         <pre className="whitespace-pre-wrap text-sm text-gray-300">{JSON.stringify(apiResponse, null, 2)}</pre>
       </div>
     )}

     {/* Date Input Modal */}
     {isDateModalOpen && (
       <Modal onClose={() => setIsDateModalOpen(false)}>
         <h2 className="text-lg font-bold">Select Date Range</h2>
         <div className="mt-4">
           <label className="block text-white">Created At Min:</label>
           <input type="date" value={createdAtMin} onChange={(e) => setCreatedAtMin(e.target.value)} className="border border-gray-600 p-2 mb-4 w-full rounded bg-gray-700 text-white" />
           <label className="block text-white">Created At Max:</label>
           <input type="date" value={createdAtMax} onChange={(e) => setCreatedAtMax(e.target.value)} className="border border-gray-600 p=2 mb=4 w-full rounded bg-gray=700 text-white" />
         </div>
         {/* Submit button for date range */}
         <button onClick={handleDateSubmit} className="bg-blue=600 text-white py=2 px=4 rounded hover:bg-blue=700 transition duration=200">Submit</button>
       </Modal>
     )}
   </div>
 );
};

export default MethodDetails;
