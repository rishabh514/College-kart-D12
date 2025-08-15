import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faCheck, faEye } from '@fortawesome/free-solid-svg-icons';
import OptimizedImage from '../common/OptimizedImage'; // Using the same image component for consistency

// A helper function to get the correct status badge based on the listing's state.
const getStatusBadge = (product) => {
    if (product.approval_status === 'pending') {
        return <div className="absolute top-4 right-4 bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full shadow-lg">PENDING FOR APPROVAL</div>;
    }
    if (product.status === 'sold') {
        return <div className="absolute top-4 right-4 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">SOLD</div>;
    }
    if (product.approval_status === 'rejected') {
        return <div className="absolute top-4 right-4 bg-gray-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">REJECTED</div>;
    }
    return null; 
};

const MyListingCard = ({ product, onDelete, onMarkAsSold, onViewDetails }) => {
    const imageUrl = product.imageUrls?.[0] || 'https://placehold.co/600x400/1e1e1e/a1a1aa?text=No+Image';
    const statusBadge = getStatusBadge(product);

    // This function stops the card's main click event when a button is clicked.
    const handleButtonClick = (e, action) => {
        e.stopPropagation();
        action();
    };

    return (
        // --- REBUILT CARD STRUCTURE TO MATCH MARKETPLACE ---
        // The main onClick will now handle "View Details"
        <div 
            className="listing-card" 
            onClick={() => onViewDetails(product)}
        >
            {/* Image Container - Matches marketplace style */}
            <div className="product-image-container">
                <OptimizedImage
                    src={imageUrl}
                    alt={product.productName}
                    className="product-image"
                />
                {statusBadge}
            </div>

            {/* Content Area - Uses the exact same structure and classes as the marketplace card */}
            <div className="card-content">
                <div className="product-header">
                    <h3 className="product-name">{product.productName}</h3>
                    <div className="product-price">₹{product.productPrice}</div>
                </div>
                <div className="product-category">{product.productCategory}</div>
                <p className="product-description">{product.shortDescription}</p>
                
                {/* Action Buttons - Styled to be consistent with marketplace buttons */}
                <div className="card-actions">
                    <div className="secondary-actions">
                        {/* Conditionally render "Mark as Sold" button */}
                        {product.approval_status === 'approved' && product.status === 'available' && (
                            <button 
                                className="action-btn" 
                                style={{backgroundColor: '#16a34a', color: 'white'}}
                                onClick={(e) => handleButtonClick(e, onMarkAsSold)}
                            >
                                <FontAwesomeIcon icon={faCheck} /> Sold
                            </button>
                        )}
                        <button 
                            className="action-btn"
                            onClick={(e) => handleButtonClick(e, onDelete)}
                        >
                            <FontAwesomeIcon icon={faTrash} /> Delete
                        </button>
                    </div>
                    {/* The main action button is now "View Details" */}
                    <button className="action-btn view-details-btn">
                         <FontAwesomeIcon icon={faEye} className="mr-2" /> View Details
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MyListingCard;