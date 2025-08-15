import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { useUI } from '../context/UIContext';
import Popup from '../components/common/Popup';
import BanUserPopup from '../components/common/BanUserPopup';
import AdminReportCard from '../components/admin/AdminReportCard';
import AdminApprovalCard from '../components/admin/AdminApprovalCard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faTimesCircle, faUserSlash, faUserCircle } from '@fortawesome/free-solid-svg-icons';

// --- FIXED DetailsPopupContent ---
const DetailsPopupContent = ({ product }) => {
    if (!product) {
        return <div className="text-zinc-400">Listing details are not available.</div>;
    }
    const [currentIndex, setCurrentIndex] = useState(0);
    // Change 1: Use `listing_images` instead of `imageUrls`
    const images = product.listing_images || [];
    const goToPrevious = () => setCurrentIndex(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
    const goToNext = () => setCurrentIndex(currentIndex === images.length - 1 ? 0 : currentIndex + 1);
    const seller = product.profiles;
    return (
        <div id="popup-info" className="popup-info">
            <div className="popup-image-carousel mb-6">
                {images.length > 1 && (<button onClick={goToPrevious} className="carousel-btn prev">&lt;</button>)}
                <div className="carousel-images-container">
                    {/* Change 2: Use `images[currentIndex].image_url` */}
                    {images.length > 0 ? (<img src={images[currentIndex].image_url} alt={`${product.productName} - slide ${currentIndex + 1}`} className="carousel-img" />) : (<img src="https://placehold.co/600x400/1e1e1e/a1a1aa?text=No+Image" alt="No image available" className="carousel-img" />)}
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

const ActionPopupContent = ({ report, onDelete, onIgnore, onBan }) => (
    <div className="space-y-4">
        <p className="text-zinc-300">Take action on the report for listing: <strong>{report.listings?.productName || 'N/A'}</strong></p>
        <div className="flex flex-col gap-4 mt-4">
            <button onClick={onDelete} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                <FontAwesomeIcon icon={faTrash} /> Delete Listing
            </button>
            <button onClick={onBan} className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                <FontAwesomeIcon icon={faUserSlash} /> Ban User
            </button>
            <button onClick={onIgnore} className="w-full bg-zinc-600 hover:bg-zinc-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                <FontAwesomeIcon icon={faTimesCircle} /> Ignore Report
            </button>
        </div>
    </div>
);


const AdminPage = () => {
    const [reports, setReports] = useState([]);
    const [pendingListings, setPendingListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedReport, setSelectedReport] = useState(null);
    const [isDetailsOpen, setDetailsOpen] = useState(false);
    const [isActionOpen, setActionOpen] = useState(false);
    const [isBanPopupOpen, setIsBanPopupOpen] = useState(false);
    const { showToast } = useUI();

    const fetchAdminData = useCallback(async () => {
        setLoading(true);
        try {
            // --- FIXED Fetch new reports query ---
            const { data: reportsData, error: reportsError } = await supabase
                .from('reports')
                // Change 3: Added listing_images(*) to the nested select for listings
                .select('*, listings(*, profiles(*), listing_images(*))')
                .eq('status', 'new');
            if (reportsError) throw reportsError;
            setReports(reportsData || []);

            // --- FIXED Fetch listings pending approval query ---
            const { data: pendingData, error: pendingError } = await supabase
                .from('listings')
                 // Change 4: Added listing_images(*) to this select
                .select('*, profiles(*), listing_images(*)')
                .eq('approval_status', 'pending');
            if (pendingError) throw pendingError;
            setPendingListings(pendingData || []);

        } catch (error) {
            showToast("Failed to fetch admin data.", "error");
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchAdminData();
    }, [fetchAdminData]);

    // --- (All handler functions below this line are unchanged and correct) ---

    const handleApprove = async (listingId) => {
        try {
            const { error } = await supabase
                .from('listings')
                .update({ approval_status: 'approved' })
                .eq('id', listingId);
            if (error) throw error;
            showToast("Listing approved!", "success");
            fetchAdminData();
        } catch (error) {
            showToast("Failed to approve listing.", "error");
        }
    };

    const handleReject = async (listingId) => {
        if (!window.confirm("Are you sure you want to reject this listing? It will be hidden from the user and marketplace.")) return;
        try {
            const { error } = await supabase
                .from('listings')
                .update({ approval_status: 'rejected' })
                .eq('id', listingId);
            if (error) throw error;
            showToast("Listing rejected.", "success");
            fetchAdminData();
        } catch (error) {
            showToast("Failed to reject listing.", "error");
        }
    };
    
    const handleViewDetails = (listing) => {
        setSelectedItem(listing);
        setDetailsOpen(true);
    };

    const handleAction = (report) => {
        setSelectedReport(report);
        setActionOpen(true);
    };

    const openBanPopup = () => {
        if (!selectedReport?.listings?.profiles) {
            showToast("Cannot ban user: Seller information is missing.", "error");
            return;
        }
        setActionOpen(false);
        setIsBanPopupOpen(true);
    };

    const closeBanPopup = () => {
        setIsBanPopupOpen(false);
        setSelectedReport(null);
    };

    const handleConfirmBan = async (banDurationInSeconds) => {
        const userToBan = selectedReport?.listings?.profiles;
        if (!userToBan) {
            showToast("Error: No user selected to ban.", "error");
            return;
        }
        const banUntil = new Date(Date.now() + banDurationInSeconds * 1000).toISOString();
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ banned_until: banUntil })
                .eq('id', userToBan.id);
            if (error) throw error;
            showToast(`User ${userToBan.email} has been banned.`, "success");
            fetchAdminData(); 
        } catch (error) {
            showToast(error.message || "Failed to ban user.", "error");
        } finally {
            closeBanPopup();
        }
    };

    const handleIgnoreReport = async () => {
        if (!selectedReport) return;
        try {
            const { error } = await supabase.from('reports').update({ status: 'ignored' }).eq('id', selectedReport.id);
            if (error) throw error;
            showToast("Report ignored.", "info");
            setActionOpen(false);
            fetchAdminData();
        } catch (error) {
            showToast("Failed to ignore report.", "error");
        }
    };
    
    const handleDeleteListing = async () => {
        if (!selectedReport?.listings?.id) return;
        try {
            await supabase.from('reports').delete().eq('reported_listing_id', selectedReport.listings.id);
            const { error } = await supabase.from('listings').delete().eq('id', selectedReport.listings.id);
            if (error) throw error;
            showToast("Listing and associated reports deleted.", "success");
            setActionOpen(false);
            fetchAdminData();
        } catch (error) {
            showToast("Failed to delete listing.", "error");
        }
    };

    return (
        <div className="content-section space-y-12">
            {/* PENDING APPROVALS SECTION */}
            <div>
                <h2 className="text-3xl font-bold text-white mb-8"><span className="title-gradient">Pending Approvals</span></h2>
                {loading ? <p className="text-zinc-400">Loading...</p> : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {pendingListings.length > 0 ? (
                            pendingListings.map(listing => (
                                <AdminApprovalCard
                                    key={listing.id}
                                    listing={listing}
                                    onApprove={handleApprove}
                                    onReject={handleReject}
                                    onViewDetails={handleViewDetails}
                                />
                            ))
                        ) : (
                            <div className="md:col-span-2 lg:col-span-3 text-center bg-zinc-800/50 p-8 rounded-lg">
                                <p className="text-zinc-300 text-lg">No listings are waiting for approval. Well done!</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
            
            {/* NEW REPORTS SECTION */}
            <div>
                <h2 className="text-3xl font-bold text-white mb-8"><span className="title-gradient">New Reports</span></h2>
                {loading ? <p className="text-zinc-400">Loading...</p> : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {reports.length > 0 ? (
                            reports.map(report => (
                                <AdminReportCard 
                                    key={report.id} 
                                    report={report} 
                                    onView={() => handleViewDetails(report.listings)} 
                                    onAction={handleAction} 
                                />
                            ))
                        ) : (
                            <div className="lg:col-span-2 text-center bg-zinc-800/50 p-8 rounded-lg">
                                <p className="text-zinc-300 text-lg">No new reports to show.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
            
            {/* POPUPS */}
            <Popup isOpen={isDetailsOpen} onClose={() => setDetailsOpen(false)} title={selectedItem?.productName || "Details"}>
                {selectedItem && <DetailsPopupContent product={selectedItem} />}
            </Popup>
            
            <Popup isOpen={isActionOpen} onClose={() => setActionOpen(false)} title="Take Action">
                {selectedReport && <ActionPopupContent report={selectedReport} onDelete={handleDeleteListing} onIgnore={handleIgnoreReport} onBan={openBanPopup} />}
            </Popup>

            {isBanPopupOpen && selectedReport?.listings?.profiles && (
                <BanUserPopup
                    user={selectedReport.listings.profiles}
                    onClose={closeBanPopup}
                    onConfirmBan={handleConfirmBan}
                />
            )}
        </div>
    );
};

export default AdminPage;