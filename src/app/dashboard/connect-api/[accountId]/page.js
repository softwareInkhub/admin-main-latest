'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase'; // Import Firestore database
import { collection, getDocs, query, where, addDoc } from 'firebase/firestore'; // Import Firestore functions
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid'; // Import icons
import { v4 as uuidv4 } from 'uuid'; // Import UUID generator
import Modal from '@/components/ui/ApiModal'; // Import the Modal component
import { useParams } from 'next/navigation'; // Use the correct import for App Router

export default function ConnectAPI() {
  const { accountId } = useParams(); // Get accountId from URL parameters
  const [apis, setApis] = useState([]); // State to hold API data
  const [loading, setLoading] = useState(true); // Loading state
  const [expandedApiId, setExpandedApiId] = useState(null); // State to track which API is expanded
  const [apiResponse, setApiResponse] = useState(null); // State to hold API response
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [createdAtMin, setCreatedAtMin] = useState('');
  const [createdAtMax, setCreatedAtMax] = useState('');
  const [api, setApi] = useState(null); // Store the selected API
  const [loadingApiId, setLoadingApiId] = useState(null); // State to track which API is currently loading

  console.log(apis);
  useEffect(() => {
    const fetchAPIs = async () => {
      setLoading(true); // Set loading state to true
      try {
        // Fetch APIs based on accountId
        const declaredApiQuery = query(collection(db, 'declared_api'), where('apiAccountId', '==', accountId));
        const querySnapshot = await getDocs(declaredApiQuery);
        const apiList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setApis(apiList);
      } catch (error) {
        console.error('Error fetching APIs:', error);
      } finally {
        setLoading(false); // Set loading state to false
      }
    };

    if (accountId) {
      fetchAPIs(); // Call the fetch function if accountId is available
    }
  }, [accountId]); // Ensure accountId is in the dependency array

  const toggleExpand = (id) => {
    setExpandedApiId(expandedApiId === id ? null : id); // Toggle the expanded state
  };

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms)); // Sleep function
  
  const handleConnect = async (api) => {
    setLoadingApiId(api.id); // Set the loading state for the specific API
    // Check if params is an array and if created_at_min or created_at_max exist
    const params = Array.isArray(api.queryParams) ? api.queryParams : [];
    if (params.some(param => param.key === 'created_at_min' || param.key === 'created_at_max')) {
        setApi(api); // Store the selected API
        setIsModalOpen(true); // Open the modal to get date values
    } else {
        // Proceed with the connection without date range
        await connectToApi(api);
    }
    setLoadingApiId(null); // Reset loading state after connection attempt
  };

  const connectToApi = async (api) => {
    const { mainUrl, method, headers } = api;

    // Log the main URL
    console.log('Main URL:', mainUrl);

    // Prepare the base URL
    let requestUrl = mainUrl;

    // Check if created_at_min and created_at_max exist in params
    const params = Array.isArray(api.queryParams) ? api.queryParams : [];
    console.log('Query Parameters:', params); // Log the query parameters

    const createdAtMinParam = params.find(param => param.key === 'created_at_min');
    const createdAtMaxParam = params.find(param => param.key === 'created_at_max');

    // Log the parameters
    console.log('Created At Max Param:', createdAtMax);
    console.log('Created At Min Param:', createdAtMin);

    // Append created_at_min and created_at_max to the URL if they exist
    if (createdAtMinParam && createdAtMinParam) {
        requestUrl += `&created_at_min=${encodeURIComponent(createdAtMin)}`;
    }
    if (createdAtMaxParam && createdAtMaxParam) {
        requestUrl += requestUrl.includes('?') ? '&' : '?';
        requestUrl += `created_at_max=${encodeURIComponent(createdAtMax)}`;
    }

    // Log the final request URL
    console.log('Request URL:', requestUrl);

    // Prepare the request body
    const body = {
        url: requestUrl,
        method: method,
        headers: headers.reduce((acc, header) => {
            acc[header.key] = header.value; // Convert headers to an object
            return acc;
        }, {}),
    };

    // Log the API Request Body
    console.log('API Request Body:', JSON.stringify(body, null, 2));

    const proxyUrl = `/api/apiCall`;
  
    try {
        const response = await fetch(proxyUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body), // Use the constructed body
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            throw new Error(`HTTP error! status: ${response.status}, details: ${errorText}`);
        }

        const data = await response.json();
        console.log('API Response:', data); // Log the entire response for debugging

        if (data && data.data && data.data.length === 0) {
            console.warn('No data returned from API.');
        }

        setApiResponse(data); // Set the API response to state for UI display

        // Log the API call in Firestore
        const userEmail = "user@example.com"; // Replace with actual user email from your auth system
        const logEntry = {
            uuid: uuidv4(), // Generate a unique ID
            apiName: api.apiName,
            apiTitle: api.apiTitle,
            apiStatus: 'Success',
            mainUrl: mainUrl,
            userEmail: userEmail,
            createdAt: new Date().toISOString(), // Current timestamp
        };

        // Add the log entry to the apiLog collection
        await addDoc(collection(db, 'apiLog'), logEntry);
        console.log('API log entry created:', logEntry);

    } catch (error) {
        console.error('Error connecting to API:', error);
        setApiResponse(null); // Clear the response on error
    }
  };
  
  // Function to extract the next page URL from the link header
  

  const clearResponse = () => {
    setApiResponse(null); // Clear the API response
  };

  const handleModalSubmit = (dates) => {
    setCreatedAtMin(dates.created_at_min);
    setCreatedAtMax(dates.created_at_max);
    
    // Call the connect function with the API details immediately after setting the dates
    connectToApi(api); // Pass the selected API object
    setIsModalOpen(false); // Close the modal after submission
  };

  return (
    <div className="p-6 bg-gray-800 rounded-lg">
      <h1 className="text-3xl font-bold text-white mb-4">Connect API</h1>
      {loading ? (
        <div className="text-white">Loading APIs...</div> // Loading message
      ) : (
        <ul className="mt-4 space-y-4">
          {apis.length === 0 ? (
            <p className="text-white">No APIs found.</p>
          ) : (
            apis.map(api => (
              <li key={api.id} className="p-4 bg-gray-700 rounded-md shadow-md transition-transform transform hover:scale-[1.01] ">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-blue-400">{api.apiTitle}</h2>
                  <button onClick={() => toggleExpand(api.id)} className="focus:outline-none">
                    {expandedApiId === api.id ? (
                      <ChevronUpIcon className="h-6 w-6 text-white" />
                    ) : (
                      <ChevronDownIcon className="h-6 w-6 text-white" />
                    )}
                  </button>
                </div>
                <div
                  className={`mt-2 overflow-hidden transition-all duration-300 ease-in-out ${
                    expandedApiId === api.id ? 'max-h-screen' : 'max-h-0'
                  }`}
                >
                  <div className="mt-2 space-y-2">
                    {api.mainUrl && <p className="text-white"><strong>Main URL:</strong> {api.mainUrl}</p>}
                    {api.method && <p className="text-white"><strong>Method:</strong> {api.method}</p>}
                    {api.callbackUrl && <p className="text-white"><strong>Callback URL:</strong> {api.callbackUrl}</p>}
                    
                    {api.headers && api.headers.length > 0 && (
                      <div>
                        <h3 className="text-white font-semibold">Headers:</h3>
                        <ul className="list-disc pl-5">
                          {api.headers.map((header, index) => (
                            <li key={index} className="text-white">
                              <strong>{header.key}:</strong> {header.value}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {api.queryParams && api.queryParams.length > 0 && (
                      <div>
                        <h3 className="text-white font-semibold">Query Parameters:</h3>
                        <ul className="list-disc pl-5">
                          {api.queryParams.map((param, index) => (
                            <li key={index} className="text-white">
                              <strong>{param.key}:</strong> {param.value}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleConnect(api)}
                  className="mt-4 w-full p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200 flex items-center justify-center"
                  disabled={loadingApiId === api.id} // Disable button while connecting
                >
                  {loadingApiId === api.id ? (
                    <>
                      <div className="spinner mr-2"></div> {/* Spinner */}
                      Connecting...
                    </>
                  ) : (
                    'Connect'
                  )}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
      {/* Scrollable box for API response */}
      {apiResponse && (
        <div className="mt-4 p-4 bg-gray-800 rounded-md overflow-y-auto max-h-60">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-white">API Response:</h2>
            <button
              onClick={clearResponse}
              className="ml-4 p-1  bg-red-600  text-white rounded-md hover:bg-red-700 transition duration-200"
            >
              Clear Response
            </button>
          </div>
          <pre className="text-white">{JSON.stringify(apiResponse, null, 2)}</pre>
        </div>
      )}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
      />
    </div>
  );
} 