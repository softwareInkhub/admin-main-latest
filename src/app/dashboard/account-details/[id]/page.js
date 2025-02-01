"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { doc, getDoc, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase'; // Adjust the import based on your project structure

const AccountDetails = () => {
  const router = useRouter();
  const { id } = useParams(); // Get the ID from the URL
  const [accountDetails, setAccountDetails] = useState(null);
  const [declaredApis, setDeclaredApis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false); // State for edit mode

  console.log(id);
  

  useEffect(() => {
    const fetchAccountDetails = async () => {
      if (!id) return; // Exit if ID is not available

      // Fetch account details by apiAccountName
      const accountQuery = query(collection(db, 'api_accounts'), where('apiAccountName', '==', id));
      const accountSnapshot = await getDocs(accountQuery);

      if (!accountSnapshot.empty) {
        const accountData = accountSnapshot.docs[0].data();
        setAccountDetails(accountData);
      } else {
        console.error("No such account document!");
      }

      // Fetch declared APIs for this account
      const apiQuery = query(collection(db, 'declared_api'), where('apiAccountName', '==', id));
      const apiSnapshot = await getDocs(apiQuery);
      const apiData = apiSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDeclaredApis(apiData);

      setLoading(false);
    };

    fetchAccountDetails();
  }, [id]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing); // Toggle edit mode
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this account?")) {
      // Implement delete logic here
      const docRef = doc(db, 'api_accounts', id);
      await deleteDoc(docRef); // Delete the document from Firestore
      router.push('/dashboard/api-accounts'); // Redirect after deletion
    }
  };

  if (loading) return <div className="text-center text-white">Loading...</div>;

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <div className="flex justify-between mb-4">
        <h1 className="text-3xl font-bold">{accountDetails.apiAccountName}</h1>
        <div className="flex items-center">
          <button
            onClick={handleEditToggle}
            className="bg-yellow-600 text-white py-2 px-4 rounded hover:bg-yellow-700 transition duration-200 mr-2"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition duration-200"
          >
            Delete
          </button>
        </div>
      </div>
      <div className="bg-gray-800 p-4 rounded-lg shadow-md">
        {isEditing ? (
          // Render input fields for editing account details
          <>
            <label className="block text-white mb-2">API Name:</label>
            <input
              type="text"
              value={accountDetails.apiName}
              onChange={(e) => setAccountDetails({ ...accountDetails, apiName: e.target.value })}
              className="border border-gray-600 p-2 mb-4 w-full rounded bg-gray-700"
            />
            {/* Add more fields as necessary */}
            <div className="flex justify-end">
              <button
                onClick={handleEditToggle} // Save changes logic can be added here
                className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition duration-200 mr-2"
              >
                Save Changes
              </button>
              <button
                onClick={handleEditToggle}
                className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition duration-200"
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            {accountDetails.apiName && (
              <p><strong>API Name:</strong> {accountDetails.apiName}</p>
            )}
            {accountDetails.createdAt && (
              <p><strong>Created At:</strong> {new Date(accountDetails.createdAt).toLocaleString()}</p>
            )}
            {accountDetails.createdBy && (
              <p><strong>Created By:</strong> {accountDetails.createdBy}</p>
            )}
            {accountDetails.url && (
              <p><strong>URL:</strong> {accountDetails.url}</p>
            )}
            {accountDetails.clientId && (
              <p><strong>Client ID:</strong> {accountDetails.clientId}</p>
            )}
            {accountDetails.clientSecret && (
              <p><strong>Client Secret:</strong> {accountDetails.clientSecret}</p>
            )}
            {accountDetails.redirectUrl && (
              <p><strong>Redirect URL:</strong> {accountDetails.redirectUrl}</p>
            )}
            {accountDetails.headers && accountDetails.headers.length > 0 && (
              <>
                <h3 className="text-lg font-semibold mt-4">Headers:</h3>
                <ul className="list-disc ml-6">
                  {accountDetails.headers.map((header, index) => (
                    <li key={index}>
                      <strong>{header.key}:</strong> {header.value}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </>
        )}
      </div>

    
    </div>
  );
};

export default AccountDetails; 