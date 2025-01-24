"use client"
import React, { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import Link from 'next/link';

const ApiAccountsPage = () => {
    const {id} = useParams();
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAccounts = async () => {
            if (!id) return; // Ensure ID is available
            try {
                const accountsQuery = query(collection(db, 'api_accounts'), where('apiNameId', '==', id));
                const accountsSnapshot = await getDocs(accountsQuery);
                const accountsData = await Promise.all(accountsSnapshot.docs.map(async (doc) => {
                    const accountData = { id: doc.id, ...doc.data() };
                    
                    // Fetch declared APIs for this account
                    const declaredApiQuery = query(collection(db, 'declared_api'), where('apiAccountId', '==', accountData.id));
                    const declaredApiSnapshot = await getDocs(declaredApiQuery);
                    const declaredApis = declaredApiSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                    return { ...accountData, declaredApis }; // Include declared APIs in the account data
                }));
                setAccounts(accountsData); // Set the fetched accounts
            } catch (error) {
                console.error("Error fetching accounts:", error); // Log any errors
            } finally {
                setLoading(false); // Set loading to false after fetching
            }
        };

        // Check if the router is ready before fetching accounts
        
            fetchAccounts(); // Call the fetch function
       
    }, [id]); // Ensure id and router.isReady are in the dependency array

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>; // Show loading state
    }

    return (
        <div className="p-6 bg-gray-900 min-h-screen">
            <h1 className="text-2xl font-bold text-white mb-4">Accounts Id for API Name: {id}</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {accounts.map(account => (
                    <div key={account.id} className="bg-gray-800 rounded-lg p-4 shadow-lg">
                        <h2 className="text-xl font-bold text-white mb-2 bg-blue-700 rounded-lg p-3">{account.apiAccountName}</h2>
                      
                        {/* Display declared APIs for this account */}
                        <div className="mt-2">
                            <h4 className="text-sm font-semibold text-gray-300 text-bold mt-2 mb-2 ">Declared APIs:</h4>
                            {account.declaredApis.length > 0 ? (
                                account.declaredApis.map(api => (
                                    <div key={api.id} className="text-gray-200 bg-gray-700 mb-2 rounded-lg p-3">
                                        {api.apiTitle} {/* Adjust this to the actual field name for the API name */}
                                    </div>
                                ))
                                
                            ) : (
                                <div className="text-gray-400">No declared APIs</div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            
        </div>
    );
};

export default ApiAccountsPage; 