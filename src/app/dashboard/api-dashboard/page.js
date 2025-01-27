"use client"    
import React, { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, setDoc, doc } from 'firebase/firestore';
import { ArrowUpIcon, ArrowRightIcon, ShoppingCartIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';

const ApiDashboard = () => {
    const [apiStats, setApiStats] = useState({
        totalApiNames: 0,
        totalAccounts: 0,
        totalApis: 0,
        activeApis: 0
    });
    const [apiStructure, setApiStructure] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchApiData = async () => {
            try {
                const apiNamesSnapshot = await getDocs(collection(db, 'api_names'));
                const apiNames = apiNamesSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    accounts: []
                }));

                const apiAccountsSnapshot = await getDocs(collection(db, 'api_accounts'));
                const apiAccounts = apiAccountsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    apis: []
                }));

                const declaredApisSnapshot = await getDocs(collection(db, 'declared_api'));
                const declaredApis = declaredApisSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                const structuredData = apiNames.map(apiName => {
                    const relatedAccounts = apiAccounts.filter(account => account.apiNameId === apiName.uuid);
                    return {
                        ...apiName,
                        accounts: relatedAccounts.map(account => ({
                            ...account,
                            apis: declaredApis.filter(api => api.apiAccountId === account.uuid)
                        }))
                    };
                });

                setApiStructure(structuredData);
                setApiStats({
                    totalApiNames: apiNames.length,
                    totalAccounts: apiAccounts.length,
                    totalApis: declaredApis.length,
                    activeApis: declaredApis.filter(api => api.status === 'active').length || 0
                });
                setLoading(false);
            } catch (error) {
                console.error('Error fetching API data:', error);
                setLoading(false);
            }
        };

        fetchApiData();
    }, []);

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    // Group accounts by apiNameId
    const groupedApiNames = apiStructure.reduce((acc, api) => {
        if (!acc[api.id]) {
            acc[api.id] = { ...api, accounts: [] };
        }
        api.accounts.forEach(account => {
            acc[api.id].accounts.push(account);
        });
        return acc;
    }, {});

    return (
        <div className="p-6 bg-gray-900 min-h-screen">
            <h1 className="text-3xl font-bold text-white mb-10">API Dashboard</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                {Object.entries(apiStats).map(([key, value]) => {
                    let icon;
                    let title;

                    switch (key) {
                        case 'totalApiNames':
                            icon = <ArrowUpIcon className="h-8 w-8 text-blue-300" />;
                            title = "Total API Names";
                            break;
                        case 'totalAccounts':
                            icon = <ArrowUpIcon className="h-8 w-8 text-yellow-300" />;
                            title = "Total Accounts";
                            break;
                        case 'totalApis':
                            icon = <ArrowUpIcon className="h-8 w-8 text-green-300" />;
                            title = "Total APIs";
                            break;
                        case 'activeApis':
                            icon = <ArrowUpIcon className="h-8 w-8 text-red-300" />;
                            title = "Active APIs";
                            break;
                        default:
                            icon = <ArrowUpIcon className="h-8 w-8 text-gray-300" />;
                            title = "Unknown Stat";
                    }

                    return (
                        <div key={key} className="bg-gray-800 rounded-lg p-4 sm:p-6 shadow-lg transition-transform transform hover:scale-105 flex flex-col justify-between">
                            <div className="flex items-center mb-2">
                                <div className="flex-shrink-0">
                                    {icon}
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-lg font-medium text-white">{title}</h3>
                                    <p className="text-2xl font-bold text-white">{value}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {Object.values(groupedApiNames).map((apiName) => (
                    <div key={apiName.id} className="bg-gray-800 rounded-lg p-4 sm:p-6 shadow-lg transition-transform transform hover:scale-105">
                        <div className="flex items-center mb-4">
                            <div className="bg-blue-600 rounded-full p-2">
                                <ArrowUpIcon className="h-4 w-4 text-white" />
                            </div>
                            <h2 className="text-xl font-bold bg text-white ml-3">{apiName.apiName}</h2>
                        </div>
                        
                        <h3 className="text-lg font-semibold text-gray-300 mb-2">Accounts</h3>
                        
                        <ul className="text-gray-300 mb-4">
                            {apiName.accounts.map((account) => (
                                <li key={account.id} className="mb-2 bg-slate-600 p-2 rounded-md">
                                    {account.apiAccountName}
                                </li>
                            ))}
                        </ul>

                        <Link 
                            href={`/dashboard/api-accounts/${apiName.id}`} 
                            className="mt-4 inline-flex items-center justify-center w-full bg-blue-700 text-white font-semibold rounded-lg py-2 hover:bg-blue-800 transition-colors"
                        >
                            View More
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ApiDashboard;
