
import React from 'react';
import { CloseIcon } from './icons';

const MobileSidebar: React.FC<{ isOpen: boolean; onClose: () => void; children: React.ReactNode }> = ({ isOpen, onClose, children }) => {
    return (
        <>
            <div className={`fixed inset-0 z-40 bg-black bg-opacity-25 transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose}></div>
            <div className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform lg:hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="h-full">
                    {children}
                </div>
                <button onClick={onClose} className="absolute top-2 right-2 p-1 text-gray-500 hover:text-gray-700">
                    <CloseIcon className="w-6 h-6" />
                </button>
            </div>
        </>
    );
};

export default MobileSidebar;
