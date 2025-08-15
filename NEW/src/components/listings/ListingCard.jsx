import React, { useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as farHeart } from '@fortawesome/free-regular-svg-icons';
import { faHeart as fasHeart, faUserCircle, faBookOpen, faHome, faShareAlt, faFlag } from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { useProducts } from '../../context/ProductContext';
import { useUI } from '../../context/UIContext';
import OptimizedImage from '../common/OptimizedImage';

const ListingCard = ({ product, onViewDetails, onReport, onToggleWishlist }) => {
    const { wishlist, toggleWishlist: contextToggleWishlist } = useProducts();
    const { showToast } = useUI();
    const isLiked = wishlist.includes(product.id);

    const seller = product.profiles;
    const imageUrl = product.imageUrls && product.imageUrls.length > 0
        ? product.imageUrls[0]
        : 'https://placehold.co/600x400/1e1e1e/a1a1aa?text=No+Image';
    
    const getListingLink = () => {
        const origin = window.location.origin;
        const marketplaceUrl = new URL('/marketplace', origin);
        marketplaceUrl.searchParams.set('listing', product.id);
        return marketplaceUrl.href;
    };

    // --- UPDATED WHATSAPP FUNCTIONS ---

    const handleWhatsApp = (e) => {
        e.stopPropagation();
        const link = getListingLink();
        // UPDATED: Added a newline character (\n) before the link
        const message = `Hi, I'm interested in your ${product.productName} listed on CollegeKart:\n${link}`;
        
        const whatsappNumber = `${seller?.countryCode || ''}${seller?.whatsappNumber || ''}`.replace('+', '');

        if (!whatsappNumber) {
            showToast("Seller's WhatsApp number is not available.", "error");
            return;
        }
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

    const handleShare = (e) => {
        e.stopPropagation();
        const link = getListingLink();
        // CORRECTED: This format with the newline (\n) matches your requirement.
        const shareMsg = `Hey, checkout this listing on CollegeKart:\n${link}`;
        
        navigator.clipboard.writeText(link).then(() => {
            showToast('Listing link copied to clipboard!');
        });

        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareMsg)}`;
        window.open(whatsappUrl, '_blank');
    };
    
    const handleWishlistClick = (e) => {
        e.stopPropagation();
        if (onToggleWishlist) {
            onToggleWishlist(product.id);
        } else {
            contextToggleWishlist(product.id);
        }
    };

    return (
        <div id={`listing-${product.id}`} className="listing-card" onClick={() => onViewDetails(product)}>
            <div className="product-image-container">
                <OptimizedImage
                    src={imageUrl}
                    alt={product.productName}
                    className="product-image"
                />
                <button
                    className={`wishlist-btn ${isLiked ? 'active' : ''}`}
                    title="Add to Wishlist"
                    onClick={handleWishlistClick}
                >
                    <FontAwesomeIcon icon={isLiked ? fasHeart : farHeart} />
                </button>
            </div>
            <div className="card-content">
                <div className="product-header">
                    <h3 className="product-name">{product.productName || 'Unnamed Product'}</h3>
                    <div className="product-price">₹{product.productPrice}</div>
                </div>
                <div className="product-category">{product.productCategory}</div>
                <p className="product-description">{product.shortDescription}</p>
                <div className="seller-info">
                    <div className="seller-tags">
                        <span><FontAwesomeIcon icon={faUserCircle} className="mr-1" /> {seller ? `${seller.firstName} ${seller.lastName}` : 'N/A'}</span>
                        <span><FontAwesomeIcon icon={faBookOpen} className="mr-1" /> {seller ? `${seller.branch}, ${seller.year}` : 'N/A'}</span>
                        <span><FontAwesomeIcon icon={faHome} className="mr-1" /> {seller ? (seller.isHosteller ? seller.hostelName : 'Day Scholar') : 'N/A'}</span>
                    </div>
                </div>
                <div className="card-actions">
                    <div className="secondary-actions">
                        <button className="action-btn whatsapp-btn" onClick={handleWhatsApp}>
                            <FontAwesomeIcon icon={faWhatsapp} /> Chat
                        </button>
                        <button className="action-btn share-btn" onClick={handleShare}>
                            <FontAwesomeIcon icon={faShareAlt} /> Share
                        </button>
                        <button className="action-btn report-btn" onClick={(e) => { e.stopPropagation(); onReport(product); }}>
                            <FontAwesomeIcon icon={faFlag} /> Report
                        </button>
                    </div>
                    <button className="action-btn view-details-btn" onClick={() => onViewDetails(product)}>
                        View Details
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ListingCard;

