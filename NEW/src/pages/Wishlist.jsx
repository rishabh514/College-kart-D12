import React, { useContext, useState, useEffect } from 'react';
import { ProductContext } from '../context/ProductContext';
import ListingCard from '../components/listings/ListingCard';
import Popup from '../components/common/Popup';
import { useUI } from '../context/UIContext';
import { supabase } from '../supabaseClient';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle } from '@fortawesome/free-solid-svg-icons';

// This sub-component displays details in the popup, using the Supabase data structure.
const DetailsPopupContent = ({ product }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const images = product.imageUrls || [];
    const seller = product.profiles;

    const goToPrevious = () => setCurrentIndex(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
    const goToNext = () => setCurrentIndex(currentIndex === images.length - 1 ? 0 : currentIndex + 1);

    return (
        <div id="popup-info" className="popup-info">
            <div className="popup-image-carousel mb-6">
                {images.length > 1 && (<button onClick={goToPrevious} className="carousel-btn prev">&lt;</button>)}
                <div className="carousel-images-container">
                    {images.length > 0 ? (
                        <img src={images[currentIndex]} alt={`${product.productName} - slide ${currentIndex + 1}`} className="carousel-img" />
                    ) : (
                        <img src="https://placehold.co/600x400/1e1e1e/a1a1aa?text=No+Image" alt="No image available" className="carousel-img" />
                    )}
                </div>
                {images.length > 1 && (<button onClick={goToNext} className="carousel-btn next">&gt;</button>)}
            </div>
            
            <p><strong>Price:</strong> ₹{product?.productPrice}</p>
            <p><strong>Category:</strong> {product?.productCategory}</p>
            <p><strong>Product Age:</strong> {product?.productAge}</p>
            <p><strong>Description:</strong> {product?.longDescription}</p>
            <hr style={{ borderColor: 'var(--border-color)', margin: '25px 0' }} />
            
            <h3 style={{ color: 'var(--vibrant-cyan)', marginTop: 0, fontSize: '1.4rem' }} className="text-center">Seller Information</h3>
            <div className="flex flex-col items-center text-center gap-2 mt-4">
                <FontAwesomeIcon icon={faUserCircle} className="w-20 h-20 text-zinc-500" />
                <div className="mt-2">
                    <p className="font-bold text-lg text-white">{seller ? `${seller.firstName} ${seller.lastName}` : 'N/A'}</p>
                    <p className="text-zinc-400">{seller ? `${seller.branch}, ${seller.year}` : 'N/A'}</p>
                    <p className="text-zinc-400">{seller ? (seller.isHosteller ? seller.hostelName : 'Day Scholar') : 'N/A'}</p>
                </div>
            </div>
        </div>
    );
};

// ReportPopupContent remains a simple, unchanged form component.
const ReportPopupContent = ({ onSubmit }) => (
    <form id="report-form" onSubmit={onSubmit}>
        <div className="form-group mb-4">
            <label htmlFor="report-category">Reason for Reporting:</label>
            <select id="report-category" className="mt-2 w-full" required defaultValue=""><option value="" disabled>Select a reason...</option><option value="spam">Spam or Scam</option><option value="inappropriate">Inappropriate Content</option><option value="misleading">Misleading Information</option><option value="sold">Item Already Sold</option><option value="other">Other</option></select>
        </div>
        <div className="form-group mb-6">
            <label htmlFor="report-description">Additional Details:</label>
            <textarea id="report-description" rows="4" maxLength="300" className="mt-2 w-full" placeholder="Please provide more details..."></textarea>
        </div>
        <button type="submit" id="report-submit-btn">Submit Report</button>
    </form>
);

const Wishlist = () => {
    const { wishlist, toggleWishlist } = useContext(ProductContext);
    const { showToast } = useUI();
    const [wishlistedProducts, setWishlistedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isDetailsOpen, setDetailsOpen] = useState(false);
    const [isReportOpen, setReportOpen] = useState(false);

    useEffect(() => {
        const fetchWishlistedItems = async () => {
            setLoading(true);
            if (wishlist.length === 0) {
                setWishlistedProducts([]);
                setLoading(false);
                return;
            }
            try {
                const { data, error } = await supabase
                    .from('listings')
                    .select('*, profiles(*)')
                    .in('id', wishlist);

                if (error) throw error;
                setWishlistedProducts(data);
            } catch (error) {
                console.error("Error fetching wishlisted items:", error);
                showToast("Could not load your wishlist.", "error");
            } finally {
                setLoading(false);
            }
        };

        fetchWishlistedItems();
    }, [wishlist, showToast]);

    const handleRemoveFromWishlist = (productId) => {
        // 1. Optimistically remove the item from the local state for an instant UI update
        setWishlistedProducts(currentProducts =>
            currentProducts.filter(p => p.id !== productId)
        );
        // 2. Call the context function to update the global state and localStorage
        toggleWishlist(productId);
    };

    const handleViewDetails = (product) => {
        setSelectedProduct(product);
        setDetailsOpen(true);
    };

    const handleReport = (product) => {
        setSelectedProduct(product);
        setReportOpen(true);
    };
    
    const handleReportSubmit = (e) => {
        e.preventDefault();
        setReportOpen(false);
        showToast("Report submitted. Thank you for your feedback.");
    };

    return (
        <>
            <div id="wishlist" className="content-section">
                <div className="space-y-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-white text-center"><span className="title-gradient">My Wishlist</span></h2>
                    <div id="wishlist-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {loading ? (
                            <p className="text-gray-400 col-span-full text-center py-8">Loading your wishlist...</p>
                        ) : wishlistedProducts.length > 0 ? (
                            wishlistedProducts.map(product => (
                                <ListingCard 
                                    key={product.id} 
                                    product={product}
                                    onViewDetails={handleViewDetails}
                                    onReport={handleReport}
                                    onToggleWishlist={() => handleRemoveFromWishlist(product.id)}
                                />
                            ))
                        ) : (
                            <p className="text-gray-400 col-span-full text-center py-8">Your wishlist is empty. Click the heart on any item to add it here!</p>
                        )}
                    </div>
                </div>
            </div>
            <Popup isOpen={isDetailsOpen} onClose={() => setDetailsOpen(false)} title={selectedProduct?.productName}>
                {selectedProduct && <DetailsPopupContent product={selectedProduct} />}
            </Popup>
            <Popup isOpen={isReportOpen} onClose={() => setReportOpen(false)} title="Report Listing">
                <ReportPopupContent onSubmit={handleReportSubmit} />
            </Popup>
        </>
    );
};

export default Wishlist;