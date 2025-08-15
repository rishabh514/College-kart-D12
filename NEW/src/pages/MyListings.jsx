// src/pages/MyListings.jsx

import React, { useState, useEffect } from 'react';
import MyListingCard from '../components/listings/MyListingCard';
import { supabase } from '../supabaseClient';
import { useUI } from '../context/UIContext';
import Popup from '../components/common/Popup'; // Import Popup for details view
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle } from '@fortawesome/free-solid-svg-icons';


// This is the same DetailsPopupContent from your Marketplace page
const DetailsPopupContent = ({ product }) => {
    if (!product) return null;
    const [currentIndex, setCurrentIndex] = useState(0);
    const images = product.imageUrls || [];
    const goToPrevious = () => setCurrentIndex(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
    const goToNext = () => setCurrentIndex(currentIndex === images.length - 1 ? 0 : currentIndex + 1);
    const seller = product.profiles;

    return (
        <div id="popup-info" className="popup-info">
            <div className="popup-image-carousel mb-6">
                {images.length > 1 && (<button onClick={goToPrevious} className="carousel-btn prev">&lt;</button>)}
                <div className="carousel-images-container">
                    {images.length > 0 ? (<img src={images[currentIndex]} alt={`${product.productName} - slide ${currentIndex + 1}`} className="carousel-img" />) : (<img src="https://placehold.co/600x400/1e1e1e/a1a1aa?text=No+Image" alt="No image available" className="carousel-img" />)}
                </div>
                {images.length > 1 && (<button onClick={goToNext} className="carousel-btn next">&gt;</button>)}
            </div>
            <p><strong>Price:</strong> ₹{product.productPrice}</p>
            <p><strong>Category:</strong> {product.productCategory}</p>
            <p><strong>Product Age:</strong> {product.productAge}</p>
            <p><strong>Description:</strong> {product.longDescription}</p>
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


const MyListings = () => {
    const [myListings, setMyListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null); // For the details popup
    const { showToast } = useUI();

    const fetchMyListings = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("User not found.");

            // --- THIS QUERY IS NOW FIXED ---
            // It now joins the 'profiles' table to get seller info, just like the marketplace.
            const { data, error } = await supabase
                .from('listings')
                .select('*, profiles(*)') // <-- THE FIX IS HERE
                .eq('seller_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setMyListings(data || []);
        } catch (error) {
            console.error("Error fetching user listings:", error);
            showToast("Could not fetch your listings.", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyListings();
    }, []);

    const handleDelete = async (listingId) => {
        if (!window.confirm("Are you sure you want to permanently delete this listing?")) return;
        try {
            const { error } = await supabase.from('listings').delete().eq('id', listingId);
            if (error) throw error;
            fetchMyListings(); // Re-fetch to update the list
            showToast("Listing deleted successfully.", "success");
        } catch (error) {
            showToast("Failed to delete listing.", "error");
        }
    };

    const handleMarkAsSold = async (listingId) => {
        try {
            const { error } = await supabase
                .from('listings')
                .update({ status: 'sold' })
                .eq('id', listingId);
            if (error) throw error;
            fetchMyListings(); // Re-fetch to update the status
            showToast("Listing marked as sold!", "success");
        } catch (error) {
            showToast("Failed to update listing status.", "error");
        }
    };
    
    const handleViewDetails = (product) => {
        setSelectedProduct(product);
    };

    if (loading) {
        return <p className="text-gray-400 col-span-full text-center py-8">Loading your listings...</p>;
    }

    const pendingListings = myListings.filter(l => l.approval_status === 'pending');
    const activeListings = myListings.filter(l => l.approval_status === 'approved' && l.status === 'available');
    const soldOrRejectedListings = myListings.filter(l => l.status === 'sold' || l.approval_status === 'rejected');

    const renderListingGrid = (listings) => (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {listings.map(product => (
                <MyListingCard 
                    key={product.id} 
                    product={product} 
                    onDelete={() => handleDelete(product.id)}
                    onMarkAsSold={() => handleMarkAsSold(product.id)}
                    onViewDetails={handleViewDetails}
                />
            ))}
        </div>
    );

    return (
        <>
            <div id="my-listings" className="content-section space-y-12">
                {/* Pending Approval Section */}
                <div>
                    <h2 className="text-2xl font-bold text-white mb-6 border-b-2 border-yellow-500 pb-2">Pending Approval</h2>
                    {pendingListings.length > 0 ? renderListingGrid(pendingListings) : <p className="text-gray-400 text-center py-8">You have no listings waiting for approval.</p>}
                </div>

                {/* Active Listings Section */}
                <div>
                    <h2 className="text-2xl font-bold text-white mb-6 border-b-2 border-green-500 pb-2">Active Listings</h2>
                    {activeListings.length > 0 ? renderListingGrid(activeListings) : <p className="text-gray-400 text-center py-8">You have no active listings.</p>}
                </div>

                {/* Archived Listings Section */}
                <div>
                    <h2 className="text-2xl font-bold text-white mb-6 border-b-2 border-gray-600 pb-2">Archived Listings</h2>
                    {soldOrRejectedListings.length > 0 ? renderListingGrid(soldOrRejectedListings) : <p className="text-gray-400 text-center py-8">You have no sold or rejected listings.</p>}
                </div>
            </div>
            
            <Popup isOpen={!!selectedProduct} onClose={() => setSelectedProduct(null)} title={selectedProduct?.productName || "Listing Details"}>
                <DetailsPopupContent product={selectedProduct} />
            </Popup>
        </>
    );
};

export default MyListings;