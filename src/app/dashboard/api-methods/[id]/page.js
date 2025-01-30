"use client"

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase'; // Adjust the import based on your project structure
import { FaLink, FaKey, FaClipboardList, FaSpinner } from 'react-icons/fa';
import Modal from '@/components/Modal'; // Import the Modal component

const MethodDetails = () => {
  const router = useRouter();
  const { id } = useParams(); // Get the ID from the URL
  const [methodDetails, setMethodDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiResponse, setApiResponse] = useState(null);
  const [loadingApi, setLoadingApi] = useState(false);
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [createdAtMin, setCreatedAtMin] = useState('');
  const [createdAtMax, setCreatedAtMax] = useState('');

  useEffect(() => {
    const fetchMethodDetails = async () => {
      if (!id) return; // Exit if ID is not available

      const docRef = doc(db, 'declared_api', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setMethodDetails(docSnap.data());
      } else {
        console.error("No such document!");
      }
      setLoading(false);
    };

    fetchMethodDetails();
  }, [id]);

  // New useEffect to handle OAuth redirect and token exchange
  useEffect(() => {
    const handleOAuthRedirect = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code'); // Get the authorization code from the URL

      if (code) {
        // Prepare the request body for token exchange
        const requestBody = {
          url: 'pinterest/token', // The URL for your API route
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          params: {
            code: code, // Include the authorization code
          },
          clientId: methodDetails?.clientId, // Use the client ID from method details
          clientSecret: methodDetails?.clientSecret, // Use the client secret from method details
          redirectUrl: methodDetails?.redirectUrl, // Use the redirect URL from method details
        };

        try {
          // Send the request to your API route for token exchange
          const response = await fetch('/api/apiCall', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            throw new Error(`HTTP error! status: ${response.status}, details: ${errorText}`);
          }

          const data = await response.json();
          console.log('Token Response:', data); // Log the token response
          setApiResponse(data); // Set the API response to state for display
        } catch (error) {
          console.error('Error fetching token:', error);
        }
      }
    };

    handleOAuthRedirect(); // Call the function to handle OAuth redirect
  }, [methodDetails]); // Dependency on methodDetails to ensure it has the necessary data

  const performApiTest = async () => {
    setLoadingApi(true);
    const { mainUrl, method, headers } = methodDetails;

    // Prepare the request body
    const body = {
      url: mainUrl,
      method: method,
      headers: headers.reduce((acc, header) => {
        acc[header.key] = header.value; // Convert headers to an object
        return acc;
      }, {}),
    };

    // Append created_at_min and created_at_max if they exist
    if (createdAtMin) {
      body.url += `&created_at_min=${encodeURIComponent(createdAtMin)}`;
    }
    if (createdAtMax) {
      body.url += `&created_at_max=${encodeURIComponent(createdAtMax)}`;
    }

    try {
      const response = await fetch('/api/apiCall', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, details: ${errorText}`);
      }

      const data = await response.json();
      console.log('API Test Response:', data); // Log the response for debugging
      setApiResponse(data); // Set the API response to state for display
    } catch (error) {
      console.error('Error testing API:', error);
    } finally {
      setLoadingApi(false); // Reset loading state after response
    }
  };

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

  const handleTest = () => {
    const { clientId, clientSecret } = methodDetails;

    if (clientId !== "" && clientSecret !== "") {
      handleOAuthRedirect(methodDetails); // Call OAuth redirect if credentials are present
    } else {
      performApiTest(); // Otherwise, perform the API test
    }
  };

  if (loading) return <div className="text-center text-white">Loading...</div>;

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-4">{methodDetails.apiTitle}</h1>
      <div className="bg-gray-800 p-4 rounded-lg shadow-md">
        <p className="flex items-center mb-2">
          <FaLink className="mr-2" /> <strong>Main URL:</strong> {methodDetails.mainUrl}
        </p>
        <p className="flex items-center mb-2">
          <FaKey className="mr-2" /> <strong>Client ID:</strong> {methodDetails.clientId}
        </p>
        <p className="flex items-center mb-2">
          <FaKey className="mr-2" /> <strong>Client Secret:</strong> {methodDetails.clientSecret}
        </p>
        <p className="flex items-center mb-2">
          <FaLink className="mr-2" /> <strong>Redirect URL:</strong> {methodDetails.redirectUrl}
        </p>
        <h2 className="text-xl font-semibold mt-4">Headers:</h2>
        <ul className="list-disc ml-6">
          {methodDetails.headers.map((header, index) => (
            <li key={index}>
              <strong>{header.key}:</strong> {header.value}
            </li>
          ))}
        </ul>
        <h2 className="text-xl font-semibold mt-4">Query Parameters:</h2>
        <ul className="list-disc ml-6">
          {methodDetails.queryParams.map((param, index) => (
            <li key={index}>
              <strong>{param.key}:</strong> {param.value}
            </li>
          ))}
        </ul>
      </div>

      {/* Test Button */}
      <button
        onClick={handleTest}
        className="mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-200"
        disabled={loadingApi}
      >
        {loadingApi ? <FaSpinner className="animate-spin mr-2" /> : 'Test API'}
      </button>

      {/* API Response Section */}
      {apiResponse && (
        <div className="mt-6 bg-gray-800 border rounded-lg p-4 shadow-md max-h-60 overflow-y-auto">
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
            onClick={() => {
              performApiTest(); // Call the test function with the selected dates
              setIsDateModalOpen(false); // Close the modal
            }}
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-200"
          >
            Submit
          </button>
        </Modal>
      )}
    </div>
  );
};

export default MethodDetails;