'use client'; // Ensure this is a client component

import React, { useEffect, useState } from 'react';
import { db } from '@/lib/firebase'; // Import Firestore database
import { collection, getDocs, query, limit, startAfter } from 'firebase/firestore'; // Import Firestore functions
import ClipLoader from 'react-spinners/ClipLoader'; // Import a loading spinner
import { HiSearch } from 'react-icons/hi'; // Import search icon
import { ChevronDownIcon, Squares2X2Icon, ListBulletIcon, ViewColumnsIcon } from '@heroicons/react/24/outline'; // Import Heroicons

const DesignsComponent = () => {
    const [designs, setDesigns] = useState([]); // State to hold designs
    const [loading, setLoading] = useState(true); // Loading state
    const [loadingMore, setLoadingMore] = useState(false); // Loading more state
    const [searchTerm, setSearchTerm] = useState(''); // State for search term
    const [viewMode, setViewMode] = useState('grid'); // State for view mode (starting with 'list')
    const [dropdownOpen, setDropdownOpen] = useState(false); // State for dropdown visibility
    const [lastVisible, setLastVisible] = useState(null); // Last visible document for pagination

    useEffect(() => {
        const fetchDesigns = async () => {
            setLoading(true); // Set loading state to true
            try {
                const designsQuery = query(collection(db, 'designs'), limit(10)); // Fetch first 10 designs
                const designsSnapshot = await getDocs(designsQuery);
                const designsData = designsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setDesigns(designsData); // Set the designs
                setLastVisible(designsSnapshot.docs[designsSnapshot.docs.length - 1]); // Set last visible document
                console.log('Initial designs loaded:', designsData); // Debugging log
            } catch (error) {
                console.error('Error fetching designs:', error);
            } finally {
                setLoading(false); // Set loading state to false
            }
        };

        fetchDesigns(); // Call the fetch function
    }, []); // Empty dependency array to run once on mount

    const loadMoreDesigns = async () => {
        if (loadingMore || !lastVisible) return; // Prevent loading if already loading or no more designs
        setLoadingMore(true); // Set loading more state to true
        try {
            const designsQuery = query(collection(db, 'designs'), startAfter(lastVisible), limit(10)); // Fetch next 10 designs
            const designsSnapshot = await getDocs(designsQuery);
            const designsData = designsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            if (designsData.length > 0) {
                setDesigns(prevDesigns => [...prevDesigns, ...designsData]); // Append new designs
                setLastVisible(designsSnapshot.docs[designsSnapshot.docs.length - 1]); // Update last visible document
                console.log('More designs loaded:', designsData); // Debugging log
            }
        } catch (error) {
            console.error('Error fetching more designs:', error);
        } finally {
            setLoadingMore(false); // Set loading more state to false
        }
    };

    const handleScroll = () => {
        if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 50) {
            loadMoreDesigns(); // Load more designs when scrolled to the bottom
        }
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll); // Cleanup on unmount
    }, [lastVisible]); // Re-run effect when lastVisible changes

    const filteredDesigns = designs.filter(design =>
        design.designName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (design.designTags && design.designTags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
    );

    const handleViewChange = (mode) => {
        setViewMode(mode);
        setDropdownOpen(false); // Close dropdown after selection
        // Add a class to modernize the UI
        document.body.classList.add('modern-ui'); // Example class for modern UI
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <ClipLoader color="#ffffff" loading={loading} size={50} /> {/* Loading spinner */}
            </div>
        ); // Loading message
    }

    return (
        <div className="bg-gray-900 text-white rounded-lg p-6 shadow-lg max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-center">Designs</h2>
            <div className="flex items-center mb-6">
                <div className="relative flex-grow">
                    <input 
                        type="text" 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                        className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 transition-shadow duration-300 shadow-md hover:shadow-lg"
                        placeholder="Search by name or tags"
                    />
                    <HiSearch className="absolute top-3 right-3 text-gray-400" />
                </div>
                <div className="relative ml-4">
                    <button 
                        onClick={() => setDropdownOpen(!dropdownOpen)} 
                        className="bg-blue-600 p-3 rounded-lg hover:bg-blue-700 transition duration-300 flex items-center shadow-md hover:shadow-lg"
                    >
                        <span className="mr-2">View</span>
                        <ChevronDownIcon className="h-5 w-5" />
                    </button>
                    {dropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-black text-white rounded-md shadow-lg z-10">
                            <button onClick={() => handleViewChange('grid')} className="flex items-center w-full p-3 hover:bg-gray-800 transition">
                                <Squares2X2Icon className="h-5 w-5 mr-3" /> Grid
                            </button>
                            <button onClick={() => handleViewChange('list')} className="flex items-center w-full p-3 hover:bg-gray-800 transition">
                                <ListBulletIcon className="h-5 w-5 mr-3" /> List
                            </button>
                            <button onClick={() => handleViewChange('card')} className="flex items-center w-full p-3 hover:bg-gray-800 transition">
                                <ViewColumnsIcon className="h-5 w-5 mr-3" /> Card
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <div className={`grid ${viewMode === 'list' ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'} gap-6`}>
                {filteredDesigns.length > 0 ? (
                    filteredDesigns.map((design, index) => (
                        <div 
                            key={`${design.id}-${index}`} 
                            className={`bg-gray-800 rounded-lg shadow-md transition-transform transform hover:scale-105 hover:shadow-xl relative overflow-hidden p-4 ${viewMode === 'list' ? 'flex flex-col' : ''}`}
                        >
                            <img 
                                src={design.designImageUrl} 
                                alt={design.designName} 
                                className="rounded-md w-full h-full object-cover"
                                loading="lazy" 
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-center items-center text-white opacity-0 hover:opacity-100 transition-opacity">
                                <h3 className="text-xl font-semibold">{design.designName}</h3>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {design.designTags && design.designTags.map((tag, tagIndex) => (
                                        <span key={`${design.id}-${tagIndex}`} className="bg-blue-500 text-white text-xs px-3 py-1 rounded-full">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-white">No designs available.</div>
                )}
            </div>
            {loadingMore && (
                <div className="flex justify-center items-center mt-4">
                    <ClipLoader color="#ffffff" loading={loadingMore} size={30} />
                </div>
            )}
        </div>
    );
};

export default DesignsComponent;
