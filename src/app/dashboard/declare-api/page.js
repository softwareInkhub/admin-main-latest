'use client';
import { useState, useEffect } from 'react';
import { PlusIcon, MinusIcon, ChevronDownIcon } from '@heroicons/react/24/solid';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/lib/firebase';
import { collection, getDocs, setDoc, doc } from 'firebase/firestore';
import { toast, Toaster } from 'react-hot-toast';

export default function DeclareAPI() {
  const [apiName, setApiName] = useState('');
  const [apiUrl, setApiUrl] = useState('');
  const [method, setMethod] = useState('GET');
  const [variables, setVariables] = useState([{ key: '', value: '' }]);
  const [queryParams, setQueryParams] = useState([{ key: '', value: '' }]);
  const [headers, setHeaders] = useState([{ key: '', value: '' }]);
  const [loading, setLoading] = useState(false);
  const [apiAccount, setApiAccount] = useState('');
  const [apiTitle, setApiTitle] = useState('');
  
  // New state for dropdowns
  const [apiNames, setApiNames] = useState([]);
  const [apiAccounts, setApiAccounts] = useState([]);
  const [showApiNames, setShowApiNames] = useState(false);
  const [showApiAccounts, setShowApiAccounts] = useState(false);

  const [apiId, setApiId] = useState('');
  const [apiAccountId, setApiAccountId] = useState('');

  const [callbackUrl, setCallbackUrl] = useState('');

  useEffect(() => {
    const fetchApiData = async () => {
      try {
        const apiNamesCollection = collection(db, 'api_names');
        const apiAccountsCollection = collection(db, 'api_accounts');

        const apiNamesSnapshot = await getDocs(apiNamesCollection);
        const apiAccountsSnapshot = await getDocs(apiAccountsCollection);

        setApiNames(apiNamesSnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().apiName })));
        setApiAccounts(apiAccountsSnapshot.docs.map(doc => ({ id: doc.id, account: doc.data().apiAccountName })));
      } catch (error) {
        console.error("Error fetching API data:", error);
      }
    };

    fetchApiData();
  }, []);

  const handleSelectApiName = (api) => {
    setApiName(api.name);
    setApiId(api.id);
    setShowApiNames(false);
  };

  const handleSelectApiAccount = (account) => {
    setApiAccount(account.account);
    setApiAccountId(account.id);
    setShowApiAccounts(false);
  };

  const toggleApiNamesDropdown = () => {
    setShowApiNames(prev => !prev);
    setShowApiAccounts(false); // Close the other dropdown if open
  };

  const toggleApiAccountsDropdown = () => {
    setShowApiAccounts(prev => !prev);
    setShowApiNames(false); // Close the other dropdown if open
  };

  const handleAddVariable = () => {
    setVariables([...variables, { key: '', value: '' }]);
  };

  const handleAddQueryParam = () => {
    setQueryParams([...queryParams, { key: '', value: '' }]);
  };

  const handleAddHeader = () => {
    setHeaders([...headers, { key: '', value: '' }]);
  };

  const handleVariableChange = (index, event) => {
    const newVariables = [...variables];
    newVariables[index][event.target.name] = event.target.value;
    setVariables(newVariables);
  };

  const handleQueryParamChange = (index, event) => {
    const newQueryParams = [...queryParams];
    newQueryParams[index][event.target.name] = event.target.value;
    setQueryParams(newQueryParams);
  };

  const handleHeaderChange = (index, event) => {
    const newHeaders = [...headers];
    newHeaders[index][event.target.name] = event.target.value;
    setHeaders(newHeaders);
  };

  const handleRemoveVariable = (index) => {
    const newVariables = variables.filter((_, i) => i !== index);
    setVariables(newVariables);
  };

  const handleRemoveQueryParam = (index) => {
    const newQueryParams = queryParams.filter((_, i) => i !== index);
    setQueryParams(newQueryParams);
  };

  const handleRemoveHeader = (index) => {
    const newHeaders = headers.filter((_, i) => i !== index);
    setHeaders(newHeaders);
  };

  const handleDeclareVariables = async () => {
    const mainUrl = constructMainUrl(apiUrl, queryParams);
    const docId = uuidv4();

    // Create or get API Name ID
    let apiNameId;
    if (apiName) { // Check if API name is provided
      if (!apiId) { // Only create if no existing ID is selected
        const apiNameDoc = doc(db, 'api_names', docId);
        await setDoc(apiNameDoc, {
          apiName,
          createdAt: new Date(),
          createdBy: 'yourUserId', // Replace with actual user ID
          uuid: docId,
        });
        apiNameId = docId; // Use the new ID
      } else {
        apiNameId = apiId; // Use the selected API ID
      }
    }

    // Create or get API Account ID
    let apiAccId;
    if (apiAccount) { // Check if API account is provided
      if (!apiAccountId) { // Only create if no existing ID is selected
        const apiAccountDoc = doc(db, 'api_accounts', docId);
        await setDoc(apiAccountDoc, {
          apiAccountName: apiAccount,
          apiName: apiName,
          apiNameId: apiNameId,
          createdAt: new Date(),
          createdBy: 'yourUserId', // Replace with actual user ID
        });
        apiAccId = docId; // Use the new ID
      } else {
        apiAccId = apiAccountId; // Use the selected API Account ID
      }
    }

    // Prepare data for declared_api document
    const data = {
      apiName,
      baseUrl: apiUrl,
      apiTitle,
      method,
      variables,
      queryParams,
      headers,
      mainUrl,
      callbackUrl,
      uuid: docId,
      apiNameId, // Store the API Name ID
      apiAccountId, // Store the API Account ID
    };

    setLoading(true);

    try {
      await setDoc(doc(db, 'declared_api', docId), data);
      console.log('API Declaration saved to Firestore:', data);
      
      toast.success('API Declaration saved successfully!', {
        duration: 3000,
      });

      // Reset form fields
      setApiName('');
      setApiUrl('');
      setApiTitle('');
      setApiAccount('');
      setCallbackUrl('');
      setMethod('GET');
      setVariables([{ key: '', value: '' }]);
      setQueryParams([{ key: '', value: '' }]);
      setHeaders([{ key: '', value: '' }]);
    } catch (error) {
      console.error('Error saving to Firestore:', error);
      toast.error('Error saving API Declaration!', {
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const constructMainUrl = (baseUrl, params) => {
    if (!params.length) return baseUrl;

    const queryString = params
      .map(param => {
        if (param.key && param.value) {
          return `${encodeURIComponent(param.key)}=${encodeURIComponent(param.value)}`;
        }
        return null;
      })
      .filter(Boolean)
      .join('&');

    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}${queryString}`;
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-gray-800 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-white mb-4">Declare API</h1>
      <form className="space-y-4">
        <div className="flex space-x-4">
          <div className="flex-1 relative">
            <label className="block text-gray-300">API Name:</label>
            <input
              type="text"
              value={apiName}
              onChange={(e) => setApiName(e.target.value)}
              className="mt-1 p-3 w-full rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onFocus={toggleApiNamesDropdown} // Show dropdown on focus
            />
            <ChevronDownIcon 
              className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 cursor-pointer" 
              onClick={toggleApiNamesDropdown} // Toggle dropdown on icon click
            />
            {showApiNames && (
              <div className="absolute z-10 bg-gray-700 rounded-md mt-1 w-full">
                {apiNames.map((api, index) => (
                  <div
                    key={index}
                    className="p-2 hover:bg-gray-600 cursor-pointer"
                    onClick={() => handleSelectApiName(api)}
                  >
                    {api.name}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex-1 relative">
            <label className="block text-gray-300">API Account:</label>
            <input
              type="text"
              value={apiAccount}
              onChange={(e) => setApiAccount(e.target.value)}
              className="mt-1 p-3 w-full rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onFocus={toggleApiAccountsDropdown} // Show dropdown on focus
            />
            <ChevronDownIcon 
              className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 cursor-pointer" 
              onClick={toggleApiAccountsDropdown} // Toggle dropdown on icon click
            />
            {showApiAccounts && (
              <div className="absolute z-10 bg-gray-700 rounded-md mt-1 w-full">
                {apiAccounts.map((account, index) => (
                  <div
                    key={index}
                    className="p-2 hover:bg-gray-600 cursor-pointer"
                    onClick={() => handleSelectApiAccount(account)}
                  >
                    {account.account}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div>
          <label className="block text-gray-300">API Title:</label>
          <input
            type="text"
            value={apiTitle}
            onChange={(e) => setApiTitle(e.target.value)}
            className="mt-1 p-3 w-full rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-gray-300">API URL:</label>
          <input
            type="text"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            className="mt-1 p-3 w-full rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-gray-300">Method:</label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="mt-1 p-3 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
          </select>
        </div>
        <div>
          <label className="block text-gray-300">Variables:</label>
          {variables.map((variable, index) => (
            <div key={index} className="flex items-center space-x-2 mt-2">
              <input
                type="text"
                name="key"
                placeholder="Key"
                value={variable.key}
                onChange={(event) => handleVariableChange(index, event)}
                className="p-3 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                name="value"
                placeholder="Value"
                value={variable.value}
                onChange={(event) => handleVariableChange(index, event)}
                className="p-3 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {index < variables.length - 1 && (
                <MinusIcon
                  className="h-8 w-8 text-white cursor-pointer rounded-full bg-red-600 p-1"
                  onClick={() => handleRemoveVariable(index)}
                />
              )}
              {index === variables.length - 1 && (
                <PlusIcon
                  className="h-8 w-8 text-blue-500 cursor-pointer rounded-full bg-white p-1"
                  onClick={handleAddVariable}
                />
              )}
            </div>
          ))}
        </div>
        <div>
          <label className="block text-gray-300">Query Parameters:</label>
          {queryParams.map((param, index) => (
            <div key={index} className="flex items-center space-x-2 mt-2">
              <input
                type="text"
                name="key"
                placeholder="Key"
                value={param.key}
                onChange={(event) => handleQueryParamChange(index, event)}
                className="p-3 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                name="value"
                placeholder="Value"
                value={param.value}
                onChange={(event) => handleQueryParamChange(index, event)}
                className="p-3 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {index < queryParams.length - 1 && (
                <MinusIcon
                  className="h-8 w-8 text-white cursor-pointer rounded-full bg-red-600 p-1"
                  onClick={() => handleRemoveQueryParam(index)}
                />
              )}
              {index === queryParams.length - 1 && (
                <PlusIcon
                  className="h-8 w-8 text-blue-500 cursor-pointer rounded-full bg-white p-1"
                  onClick={handleAddQueryParam}
                />
              )}
            </div>
          ))}
        </div>
        <div>
          <label className="block text-gray-300">Headers:</label>
          {headers.map((header, index) => (
            <div key={index} className="flex items-center space-x-2 mt-2">
              <input
                type="text"
                name="key"
                placeholder="Header Key"
                value={header.key}
                onChange={(event) => handleHeaderChange(index, event)}
                className="p-3 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                name="value"
                placeholder="Header Value"
                value={header.value}
                onChange={(event) => handleHeaderChange(index, event)}
                className="p-3 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {index < headers.length - 1 && (
                <MinusIcon
                  className="h-8 w-8 text-white cursor-pointer rounded-full bg-red-600 p-1"
                  onClick={() => handleRemoveHeader(index)}
                />
              )}
              {index === headers.length - 1 && (
                <PlusIcon
                  className="h-8 w-8 text-blue-500 cursor-pointer rounded-full bg-white p-1"
                  onClick={handleAddHeader}
                />
              )}
            </div>
          ))}
        </div>
        <div>
          <label className="block text-gray-300">Callback URL:</label>
          <input
            type="text"
            value={callbackUrl}
            onChange={(e) => setCallbackUrl(e.target.value)}
            className="mt-1 p-3 w-full rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="button"
          onClick={handleDeclareVariables}
          className="mt-4 w-full p-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Declare Variable'}
        </button>
      </form>
     
    </div>
  );
} 