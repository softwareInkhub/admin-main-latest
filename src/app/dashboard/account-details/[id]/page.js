"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase'; // Adjust the import based on your project structure

const AccountDetails = () => {
  const router = useRouter();
  const { id } = useParams(); // Get the ID from the URL
  const [accountDetails, setAccountDetails] = useState(null);
  const [declaredApis, setDeclaredApis] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAccountDetails = async () => {
      if (!id) return; // Exit if ID is not available

      // Fetch account details
      const accountDocRef = doc(db, 'api_accounts', id);
      const accountDocSnap = await getDoc(accountDocRef);

      if (accountDocSnap.exists()) {
        setAccountDetails(accountDocSnap.data());
      } else {
        console.error("No such account document!");
      }

      // Fetch declared APIs for this account
      const apiQuery = query(collection(db, 'declared_api'), where('apiAccountId', '==', id));
      const apiSnapshot = await getDocs(apiQuery);
      const apiData = apiSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDeclaredApis(apiData);

      setLoading(false);
    };

    fetchAccountDetails();
  }, [id]);

  if (loading) return <div className="text-center text-white">Loading...</div>;

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-4">{accountDetails.apiAccountName}</h1>
      <div className="bg-gray-800 p-4 rounded-lg shadow-md">
        <p><strong>API Name:</strong> {accountDetails.apiName}</p>
        <p><strong>Created At:</strong> {new Date(accountDetails.createdAt).toLocaleString()}</p>
        <p><strong>Created By:</strong> {accountDetails.createdBy}</p>
      </div>

      <h2 className="text-xl font-semibold mt-4">Declared APIs:</h2>
      <ul className="list-disc ml-6">
        {declaredApis.map(api => (
          <li key={api.id}>
            <strong>{api.apiTitle}</strong> - {api.mainUrl}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AccountDetails; 