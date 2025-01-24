'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase'; // Import Firestore database
import { collection, getDocs, addDoc } from 'firebase/firestore'; // Import Firestore functions
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid'; // Import icons
import { v4 as uuidv4 } from 'uuid'; // Import UUID generator
import Modal from '@/components/ui/ApiModal'; // Import the Modal component

export default function ConnectAPI() {
  const [apis, setApis] = useState([]); // State to hold API data
  const [loading, setLoading] = useState(true); // Loading state
  const [expandedApiId, setExpandedApiId] = useState(null); // State to track which API is expanded
  const [apiResponse, setApiResponse] = useState(null); // State to hold API response
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [createdAtMin, setCreatedAtMin] = useState('');
  const [createdAtMax, setCreatedAtMax] = useState('');
  const [api, setApi] = useState(null); // Store the selected API

  console.log(apis);
  useEffect(() => {
    const fetchAPIs = async () => {
      setLoading(true); // Set loading state to true
      try {
        const querySnapshot = await getDocs(collection(db, 'declared_api'));
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

    fetchAPIs(); // Call the fetch function
  }, []); // Empty dependency array to run only on mount

  const toggleExpand = (id) => {
    setExpandedApiId(expandedApiId === id ? null : id); // Toggle the expanded state
  };

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms)); // Sleep function
  
  const handleConnect = async (api) => {
    // Check if params is an array and if created_at_min or created_at_max exist
    const params = Array.isArray(api.queryParams
    ) ? api.queryParams
    : [];
    if (params.some(param => param.key === 'created_at_min' || param.key === 'created_at_max')) {
        setApi(api); // Store the selected API
        setIsModalOpen(true); // Open the modal to get date values
    } else {
        // Proceed with the connection without date range
        await connectToApi(api);
    }
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
    // Call the connect function with the API details
    connectToApi(api); // Pass the selected API object
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Connect API</h1>
      {loading ? (
        <div className="text-white">Loading APIs...</div> // Loading message
      ) : (
        <ul className="mt-4">
          {apis.length === 0 ? (
            <p className="text-white">No APIs found.</p>
          ) : (
            apis.map(api => (
              <li key={api.id} className="mb-4 p-4 bg-gray-700 rounded-md relative">
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
                  <div className="mt-2">
                    <p className="text-white">Main URL: {api.mainUrl}</p>
                    <p className="text-white">Method: {api.method}</p>
                    <div>
                      <h3 className="text-white">Headers:</h3>
                      <ul>
                        {api.headers && api.headers.length > 0 ? (
                          api.headers.map((header, index) => (
                            <li key={index} className="text-white">
                              {header.key}: {header.value}
                            </li>
                          ))
                        ) : (
                          <li className="text-white">No headers defined.</li>
                        )}
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-white">Query Parameters:</h3>
                      <ul>
                        {api.queryParams && api.queryParams.length > 0 ? (
                          api.queryParams.map((param, index) => (
                            <li key={index} className="text-white">
                              {param.key}: {param.value}
                            </li>
                          ))
                        ) : (
                          <li className="text-white">No query parameters defined.</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleConnect(api)}
                  className="absolute top-4 right-16 p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
                >
                  Connect
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
              className="ml-4 p-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-200"
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