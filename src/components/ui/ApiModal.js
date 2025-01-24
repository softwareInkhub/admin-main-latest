'use client';

// src/app/dashboard/connect-api/Modal.js
import React, { useState } from 'react';

const ApiModal = ({ isOpen, onClose, onSubmit }) => {
    const [createdAtMin, setCreatedAtMin] = useState('');
    const [createdAtMax, setCreatedAtMax] = useState('');

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formattedMin = createdAtMin ? formatDate(createdAtMin) : ''; // Format only if not empty
        const formattedMax = createdAtMax ? formatDate(createdAtMax) : ''; // Format only if not empty
        console.log(formattedMin, formattedMax);
        onSubmit({ created_at_min: formattedMin, created_at_max: formattedMax });
        onClose(); // Close the modal after submission
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg text-black">
                <h2 className="text-lg font-bold mb-4">Enter Date Range</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block mb-2">Created At Min:</label>
                        <input
                            type="date"
                            value={createdAtMin}
                            onChange={(e) => setCreatedAtMin(e.target.value)}
                            className="border rounded p-2 w-full"
                            required
                        />
                        <input
                            type="text"
                            placeholder="YYYY-MM-DD"
                            value={createdAtMin}
                            onChange={(e) => setCreatedAtMin(e.target.value)}
                            className="border rounded p-2 w-full mt-2"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block mb-2">Created At Max:</label>
                        <input
                            type="date"
                            value={createdAtMax}
                            onChange={(e) => setCreatedAtMax(e.target.value)}
                            className="border rounded p-2 w-full"
                            required
                        />
                        <input
                            type="text"
                            placeholder="YYYY-MM-DD"
                            value={createdAtMax}
                            onChange={(e) => setCreatedAtMax(e.target.value)}
                            className="border rounded p-2 w-full mt-2"
                        />
                    </div>
                    <button type="submit" className="bg-blue-500 text-white rounded p-2">Connect</button>
                    <button type="button" onClick={onClose} className="ml-2 bg-gray-300 rounded p-2">Cancel</button>
                </form>
            </div>
        </div>
    );
};

export default ApiModal;