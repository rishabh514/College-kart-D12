import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTriangleExclamation, faEye, faCheckCircle, faUserCircle, faBookOpen, faHome } from '@fortawesome/free-solid-svg-icons';
import OptimizedImage from '../common/OptimizedImage'; // Assuming this component exists

const AdminReportCard = ({ report, onView, onAction }) => {
    const listing = report.listings;

    // A safe fallback if the listing data is missing (e.g., it was deleted)
    if (!listing) {
        return (
            <div className="listing-card bg-zinc-800 border border-red-500/50 p-4">
                <p className="text-white">Error: The listing for this report no longer exists.</p>
                <p className="font-mono text-xs mt-2 text-zinc-400">Report ID: {report.id}</p>
                {/* Allow ignoring the orphaned report */}
                <button onClick={() => onAction(report)} className="action-btn btn-delete mt-2">Clear Report</button>
            </div>
        );
    }
    
    const seller = listing.profiles; // Seller info is nested under listings
    // --- THIS BLOCK IS NOW FIXED ---
    const imageUrl = listing.listing_images && listing.listing_images.length > 0
        ? listing.listing_images[0].image_url
        : 'https://placehold.co/600x400/1e1e1e/a1a1aa?text=No+Image';

    return (
        <div className="listing-card" data-id={listing.id}>
            <div className="product-image-container">
                <OptimizedImage
                    src={imageUrl}
                    alt={listing.productName}
                    className="product-image"
                />
            </div>
            <div className="card-content">
                <div className="product-header">
                    <h3 className="product-name">{listing.productName}</h3>
                    <div className="product-price">₹{listing.productPrice}</div>
                </div>
                <div className="product-category">{listing.productCategory}</div>
                <p className="product-description">{listing.shortDescription}</p>
                <div className="seller-info">
                    <div className="seller-tags">
                        <span><FontAwesomeIcon icon={faUserCircle} className="mr-1" /> {seller ? `${seller.firstName} ${seller.lastName}` : 'N/A'}</span>
                        <span><FontAwesomeIcon icon={faBookOpen} className="mr-1" /> {seller ? `${seller.branch}, ${seller.year}` : 'N/A'}</span>
                        <span><FontAwesomeIcon icon={faHome} className="mr-1" /> {seller ? (seller.isHosteller ? seller.hostelName : 'Day Scholar') : 'N/A'}</span>
                    </div>
                </div>

                {/* --- ADMIN SPECIFIC SECTION --- */}
                <div className="border-t border-amber-500/30 my-3 pt-3">
                    <div className="flex items-center gap-2 text-amber-400">
                        <FontAwesomeIcon icon={faTriangleExclamation} />
                        <h4 className="font-bold text-sm">Report Reason: {report.category}</h4>
                    </div>
                    <p className="text-sm text-zinc-300 mt-1 italic">"{report.description || 'No details provided.'}"</p>
                </div>

                <div className="card-actions">
                    <div className="secondary-actions">
                         <button className="action-btn" onClick={() => onView(report)}>
                            <FontAwesomeIcon icon={faEye} /> Details
                        </button>
                    </div>
                    <button className="action-btn view-details-btn" onClick={() => onAction(report)}>
                        <FontAwesomeIcon icon={faCheckCircle} className="mr-2" /> Take Action
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminReportCard;