'use client';
import React from 'react';

const CreateMethodModal = ({ isOpen, onClose, onSubmit, allAccounts, newMethod, setNewMethod }) => {
  const handleCreateMethod = (e) => {
    e.preventDefault();
    onSubmit({ ...newMethod, apiAccountId: newMethod.apiAccountId });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80">
      <div className="bg-gray-800 p-6 rounded-lg text-white w-1/2">
        <h2 className="text-lg font-bold mb-4">Declare Method  </h2>
        <form onSubmit={handleCreateMethod}>
          {/* API Account */}
          {/* <label className="block text-white mb-2">API Account:</label> */}
          {/* <select
            value={newMethod.apiAccountId}
            onChange={(e) => setNewMethod({ ...newMethod, apiAccountId: e.target.value })}
            className="border border-gray-600 p-2 mb-4 w-full rounded bg-gray-700"
          >
            <option value="">Select API Account</option>
            {allAccounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.apiAccountName}
              </option>
            ))}
          </select> */}

          {/* API Title and Method in the same row */}
          <div className="flex mb-4">
            <div className="w-1/2 pr-2">
              <label className="block text-white mb-2">API Title:</label>
              <input
                type="text"
                value={newMethod.apiTitle}
                onChange={(e) => setNewMethod({ ...newMethod, apiTitle: e.target.value })}
                placeholder="Enter API Title"
                className="border border-gray-600 p-2 w-full rounded bg-gray-700"
              />
            </div>
            <div className="w-1/2 pl-2">
              <label className="block text-white mb-2">Method:</label>
              <select
                value={newMethod.method}
                onChange={(e) => setNewMethod({ ...newMethod, method: e.target.value })}
                className="border border-gray-600 p-2 w-full rounded bg-gray-700"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>
          </div>

          {/* API URL */}
          <label className="block text-white mb-2">API URL:</label>
          <input
            type="text"
            value={newMethod.mainUrl}
            onChange={(e) => setNewMethod({ ...newMethod, mainUrl: e.target.value })}
            placeholder="Enter API URL"
            className="border border-gray-600 p-2 mb-4 w-full rounded bg-gray-700"
          />

          {/* Client ID, Client Secret, and Redirect URL in the same row */}
          {/* <div className="flex mb-4">
            <div className="w-1/3 pr-2">
              <label className="block text-white mb-2">Client ID:</label>
              <input
                type="text"
                value={newMethod.clientId}
                onChange={(e) => setNewMethod({ ...newMethod, clientId: e.target.value })}
                placeholder="Enter Client ID"
                className="border border-gray-600 p-2 w-full rounded bg-gray-700"
              />
            </div>
            <div className="w-1/3 px-2">
              <label className="block text-white mb-2">Client Secret:</label>
              <input
                type="text"
                value={newMethod.clientSecret}
                onChange={(e) => setNewMethod({ ...newMethod, clientSecret: e.target.value })}
                placeholder="Enter Client Secret"
                className="border border-gray-600 p-2 w-full rounded bg-gray-700"
              />
            </div>
            <div className="w-1/3 pl-2">
              <label className="block text-white mb-2">Redirect URL:</label>
              <input
                type="text"
                value={newMethod.redirectUrl}
                onChange={(e) => setNewMethod({ ...newMethod, redirectUrl: e.target.value })}
                placeholder="Enter Redirect URL"
                className="border border-gray-600 p-2 w-full rounded bg-gray-700"
              />
            </div>
          </div> */}

          {/* Query Parameters Section */}
          <h3 className="text-lg font-semibold mb-2">Query Parameters:</h3>
          {newMethod.queryParams.map((param, index) => (
            <div key={index} className="flex mb-2">
              <input
                type="text"
                value={param.key}
                onChange={(e) => {
                  const updatedParams = [...newMethod.queryParams];
                  updatedParams[index].key = e.target.value;
                  setNewMethod({ ...newMethod, queryParams: updatedParams });
                }}
                placeholder="Key"
                className="border border-gray-600 p-2 rounded bg-gray-700 w-1/2 mr-2"
              />
              <input
                type="text"
                value={param.value}
                onChange={(e) => {
                  const updatedParams = [...newMethod.queryParams];
                  updatedParams[index].value = e.target.value;
                  setNewMethod({ ...newMethod, queryParams: updatedParams });
                }}
                placeholder="Value"
                className="border border-gray-600 p-2 rounded bg-gray-700 w-1/2"
              />
              <button
                type="button"
                onClick={() => {
                  const updatedParams = newMethod.queryParams.filter((_, i) => i !== index);
                  setNewMethod({ ...newMethod, queryParams: updatedParams });
                }}
                className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center ml-2"
              >
                -
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setNewMethod({ ...newMethod, queryParams: [...newMethod.queryParams, { key: '', value: '' }] })}
            className="bg-white text-blue-600 rounded-full w-8 h-8 flex items-center justify-center mb-4"
          >
            +
          </button>

          {/* Headers Section */}
          {/* <h3 className="text-lg font-semibold mb-2">Headers:</h3>
          {newMethod.headers.map((header, index) => (
            <div key={index} className="flex mb-2">
              <input
                type="text"
                value={header.key}
                onChange={(e) => {
                  const updatedHeaders = [...newMethod.headers];
                  updatedHeaders[index].key = e.target.value;
                  setNewMethod({ ...newMethod, headers: updatedHeaders });
                }}
                placeholder="Header Key"
                className="border border-gray-600 p-2 rounded bg-gray-700 w-1/2 mr-2"
              />
              <input
                type="text"
                value={header.value}
                onChange={(e) => {
                  const updatedHeaders = [...newMethod.headers];
                  updatedHeaders[index].value = e.target.value;
                  setNewMethod({ ...newMethod, headers: updatedHeaders });
                }}
                placeholder="Header Value"
                className="border border-gray-600 p-2 rounded bg-gray-700 w-1/2"
              />
              <button
                type="button"
                onClick={() => {
                  const updatedHeaders = newMethod.headers.filter((_, i) => i !== index);
                  setNewMethod({ ...newMethod, headers: updatedHeaders });
                }}
                className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center ml-2"
              >
                -
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setNewMethod({ ...newMethod, headers: [...newMethod.headers, { key: '', value: '' }] })}
            className="bg-white text-blue-600 rounded-full w-8 h-8 flex items-center justify-center mb-4"
          >
            +
          </button> */}

          <div className="flex justify-end mt-4">
            <button
              type="submit"
              className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-200 mr-2"
            >
              Save
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateMethodModal; 