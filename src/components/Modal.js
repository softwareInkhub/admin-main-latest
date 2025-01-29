import React from 'react';
import { HiX } from 'react-icons/hi';

const Modal = ({ onClose, children }) => {
    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className="bg-gray-900 rounded-lg shadow-lg p-6 max-w-md w-full">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-white">Add API Name</h2>
                    <button onClick={onClose} className="text-white hover:text-red-500">
                        <HiX className="h-6 w-6" />
                    </button>
                </div>
                {children || <p>This is a sample modal content.</p>}
            </div>
        </div>
    );
};

export default Modal; 