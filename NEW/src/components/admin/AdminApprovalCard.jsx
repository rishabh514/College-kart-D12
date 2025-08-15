import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes, faEye } from '@fortawesome/free-solid-svg-icons';

const AdminApprovalCard = ({ listing, onApprove, onReject, onViewDetails }) => {
    const seller = listing.profiles;
    // --- THIS LINE IS NOW FIXED ---
    const imageUrl = listing.listing_images?.[0]?.image_url || 'https://placehold.co/600x400/1e1e1e/a1a1aa?text=No+Image';

    return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-hidden flex flex-col">
            <div className="relative h-48">
                <img src={imageUrl} alt={listing.productName} className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded">PENDING</div>
            </div>
            <div className="p-4 flex-grow">
                <h3 className="text-lg font-bold text-white">{listing.productName}</h3>
                <p className="text-indigo-400 font-semibold">₹{listing.productPrice}</p>
                <p className="text-sm text-gray-400 mt-1">
                    Listed by: {seller?.firstName || 'N/A'} {seller?.lastName || ''}
                </p>
            </div>
            <div className="p-4 bg-gray-900/50 flex gap-2">
                <button 
                    onClick={() => onApprove(listing.id)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-3 rounded text-sm flex items-center justify-center gap-2 transition-colors"
                >
                    <FontAwesomeIcon icon={faCheck} /> Approve
                </button>
                <button 
                    onClick={() => onReject(listing.id)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-3 rounded text-sm flex items-center justify-center gap-2 transition-colors"
                >
                    <FontAwesomeIcon icon={faTimes} /> Reject
                </button>
                 <button 
                    onClick={() => onViewDetails(listing)}
                    className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-3 rounded text-sm transition-colors"
                >
                    <FontAwesomeIcon icon={faEye} />
                </button>
            </div>
        </div>
    );
};

export default AdminApprovalCard;
