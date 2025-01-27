'use client'
import React, { useEffect, useState } from 'react';
import { db } from '@/lib/firebase'; // Import Firestore database
import { collection, getDocs } from 'firebase/firestore'; // Import Firestore functions
import Link from 'next/link'; // Ensure Link is imported

const ApiNamesComponent = () => {
    const [apiNames, setApiNames] = useState([]); // State to hold API names
    const [loading, setLoading] = useState(true); // Loading state

    useEffect(() => {
        const fetchApiNames = async () => {
            setLoading(true); // Set loading state to true
            try {
                const apiNamesSnapshot = await getDocs(collection(db, 'api_names')); // Fetch API names from Firestore
                const apiAccountsSnapshot = await getDocs(collection(db, 'api_accounts')); // Fetch API accounts

                const apiNamesData = apiNamesSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    accounts: [] // Initialize accounts array
                }));

                const apiAccountsData = apiAccountsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                // Associate accounts with their respective API names
                const structuredData = apiNamesData.map(apiName => {
                    const relatedAccounts = apiAccountsData.filter(account => account.apiNameId === apiName.id);
                    return {
                        ...apiName,
                        accounts: relatedAccounts
                    };
                });

                setApiNames(structuredData); // Set the structured API names with accounts
            } catch (error) {
                console.error('Error fetching API names:', error);
            } finally {
                setLoading(false); // Set loading state to false
            }
        };

        fetchApiNames(); // Call the fetch function
    }, []); // Empty dependency array to run once on mount

    if (loading) {
        return <div className="text-white">Loading API Names...</div>; // Loading message
    }

    return (
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg max-w-sm  text-white">
            <div className="flex items-center mb-4">
                <div className="bg-blue-600 rounded-full w-8 h-8 flex items-center justify-center mr-2">
                    <span className="text-white">↑</span>
                </div>
                <h2 className="text-2xl font-bold">Shopify</h2>
            </div>
            <h3 className="text-lg mb-2">Accounts</h3>
            <ul className="list-none p-0 mb-4">
                {apiNames.length > 0 ? (
                    apiNames.map((api) => (
                        <li key={api.id} className="mb-2  p-2 rounded-md">
                            <ul className="">
                                {api.accounts.map(account => (
                                    <li key={account.id} className="mb-2 bg-gray-700 rounded-lg p-2">
                                        {account.apiAccountName}
                                    </li>
                                ))}
                            </ul>
                            {/* Single View More Button for each API */}
                            <Link 
                                href={`/dashboard/api-accounts/${api.id}`} 
                                className="mt-2 inline-flex items-center justify-center bg-blue-700 text-white font-semibold rounded-lg py-2 px-4 hover:bg-blue-800 transition-colors"
                            >
                                View More
                            </Link>
                        </li>
                    ))
                ) : (
                    <li className="text-white">No API names available.</li>
                )}
            </ul>
        </div>
    );
};

export default ApiNamesComponent;
