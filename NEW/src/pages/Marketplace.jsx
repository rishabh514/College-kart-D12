import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faFilter, faUserCircle } from '@fortawesome/free-solid-svg-icons';
import ListingCard from '../components/listings/ListingCard';
import Popup from '../components/common/Popup';
import { useUI } from '../context/UIContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import MultiSelectDropdown from '../components/common/MultiSelectDropdown';

// Utility functions for seller initials avatar
const getInitials = (firstName, lastName) => {
    const first = firstName?.[0]?.toUpperCase() || '';
    const last = lastName?.[0]?.toUpperCase() || '';
    return first + last;
};

const avatarColors = [
    "#4f46e5", "#db2777", "#059669", "#f59e42", "#5a67d8", "#fbbf24", "#3b82f6", "#34d399", "#ec4899",
    "#ef4444", "#10b981", "#d97706", "#6d28d9", "#c026d3", "#2563eb", "#22d3ee"
];

const getRandomColor = (seed) => {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    const idx = Math.abs(hash) % avatarColors.length;
    return avatarColors[idx];
};

const categoryOptions = [
    "Books & Study Material", "Electronics & Gadgets", "Furniture & Room Essentials", "Stationery & Supplies",
    "Sports & Fitness Gear", "Clothing & Accessories", "Kitchen & Dining", "Tech & Mobile Accessories",
    "Gaming & Entertainment", "Hobby & Miscellaneous Items"
];

const hostels = {
    male: ['Bhaskaracharya Hostel (BCH)', 'Sir C. V. Raman Hostel (CVR)', 'Sir J.C. Bose Hostel (JCB)', 'Varahmihir Hostel (VMH)', 'Sir M. Visvesvaraya Hostel (SVS)', 'Homi Jehangir Bhabha Hostel (HJB)', 'Aryabhatta Hostel (ABH)', 'Ramanujan Hostel (RMJ)', 'Dr. APJ Abdul Kalam Hostel (APJ)', 'Type-II Hostel'],
    female: ['Sister Nivedita Hostel (SNH)', 'Kalpana Chawla Hostel (KCH)', 'Virangana Lakshmibai Hostel (VLB)']
};

const DetailsPopupContent = ({ product }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const images = product.listing_images || [];
    const goToPrevious = () => setCurrentIndex(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
    const goToNext = () => setCurrentIndex(currentIndex === images.length - 1 ? 0 : currentIndex + 1);
    const seller = product.profiles;

    const renderSellerAvatar = () => {
        if (seller?.profilePhotoUrl) {
            return (
                <img
                    src={seller.profilePhotoUrl}
                    alt={`${seller.firstName} ${seller.lastName}`}
                    className="w-20 h-20 rounded-full object-cover mb-2"
                />
            );
        } else {
            const initials = getInitials(seller?.firstName || '', seller?.lastName || '');
            const bgColor = getRandomColor(initials);
            return (
                <div
                    className="w-20 h-20 rounded-full flex items-center justify-center mb-2"
                    style={{
                        backgroundColor: bgColor,
                        color: '#fff',
                        fontWeight: 'bold',
                        fontSize: '2.3rem',
                        userSelect: 'none'
                    }}
                    aria-label="Seller Initials"
                >
                    {initials || <FontAwesomeIcon icon={faUserCircle} size="3x" />}
                </div>
            );
        }
    };

    return (
        <div id="popup-info" className="popup-info">
            <div className="popup-image-carousel mb-6">
                {images.length > 1 && (<button onClick={goToPrevious} className="carousel-btn prev">&lt;</button>)}
                <div className="carousel-images-container">
                    {images.length > 0 ? (
                        <img src={images[currentIndex].image_url} alt={`${product.productName} - slide ${currentIndex + 1}`} className="carousel-img" />
                    ) : (
                        <img src="https://raw.githubusercontent.com/rishabh514/College-kart-D12/main/NEW/src/Image.png.svg" alt="No image available" className="carousel-img" />
                    )}
                </div>
                {images.length > 1 && (<button onClick={goToNext} className="carousel-btn next">&gt;</button>)}
            </div>
            <p><strong>Price:</strong> ₹{product?.productPrice}</p>
            <p><strong>Category:</strong> {product?.productCategory}</p>
            <p><strong>Condition:</strong> {product?.shortDescription}</p>
            <p><strong>Product Age:</strong> {product?.productAge}</p>
            <p><strong>Description:</strong> {product?.longDescription}</p>
            <hr style={{ borderColor: 'var(--border-color)', margin: '25px 0' }} />
            <h3 style={{ color: 'var(--vibrant-cyan)', marginTop: 0, fontSize: '1.4rem' }} className="text-center">Seller Information</h3>
            <div className="flex flex-col items-center text-center gap-2 mt-4">
                {renderSellerAvatar()}
                <div className="mt-2">
                    <p className="font-bold text-lg text-white">{seller ? `${seller.firstName} ${seller.lastName}` : 'N/A'}</p>
                    <p className="text-zinc-400">{seller ? `${seller.branch}, ${seller.year}` : 'N/A'}</p>
                    <p className="text-zinc-400">{seller ? (seller.isHosteller ? seller.hostelName : 'Day Scholar') : 'N/A'}</p>
                </div>
            </div>
        </div>
    );
};

const ReportPopupContent = ({ onSubmit }) => (
    <form id="report-form" onSubmit={onSubmit}>
        <div className="form-group mb-4">
            <label htmlFor="report-category">Reason for Reporting:</label>
            <select id="report-category" name="category" className="mt-2 w-full" required defaultValue="">
                <option value="" disabled>Select a reason...</option>
                <option value="spam">Spam or Scam</option>
                <option value="inappropriate">Inappropriate Content</option>
                <option value="misleading">Misleading Information</option>
                <option value="sold">Item Already Sold</option>
                <option value="other">Other</option>
            </select>
        </div>
        <div className="form-group mb-6">
            <label htmlFor="report-description">Additional Details:</label>
            <textarea id="report-description" name="description" rows="4" maxLength="300" className="mt-2 w-full" placeholder="Please provide more details..."></textarea>
        </div>
        <button type="submit" id="report-submit-btn">Submit Report</button>
    </form>
);

const FilterPopupContent = ({ currentFilters, onApply, onClear }) => {
    const [tempFilters, setTempFilters] = useState(currentFilters);

    useEffect(() => {
        setTempFilters(prev => ({ ...prev, hostels: [] }));
    }, [tempFilters.gender]);

    const handleSortChange = (e) => {
        const [column, direction] = e.target.value.split(',');
        setTempFilters({ ...tempFilters, sortBy: { column, ascending: direction === 'asc' } });
    };

    const handleRadioChange = (e) => {
        const { name, value } = e.target;
        setTempFilters(prev => ({ ...prev, [name]: prev[name] === value ? null : value }));
    };

    const handleMultiSelectChange = (e, filterKey) => {
        const { value, checked } = e.target;
        const currentValues = tempFilters[filterKey] || [];
        if (checked) {
            setTempFilters({ ...tempFilters, [filterKey]: [...currentValues, value] });
        } else {
            setTempFilters({ ...tempFilters, [filterKey]: currentValues.filter(item => item !== value) });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onApply(tempFilters);
    };

    const availableHostels = tempFilters.gender ? hostels[tempFilters.gender] : [];

    return (
        <form onSubmit={handleSubmit} className="filter-popup-form">
            <div className="filter-content custom-scrollbar">
                <div className="space-y-6">
                    <div className="filter-section">
                        <h4 className="filter-title">Sort By</h4>
                        <div className="radio-pill-group">
                            <input type="radio" id="sort-newest" name="sortBy" value="created_at,desc" checked={tempFilters.sortBy.column === 'created_at'} onChange={handleSortChange} />
                            <label htmlFor="sort-newest">Newest</label>
                            <input type="radio" id="sort-asc" name="sortBy" value="productPrice,asc" checked={tempFilters.sortBy.column === 'productPrice' && tempFilters.sortBy.ascending} onChange={handleSortChange} />
                            <label htmlFor="sort-asc">Price: Low-High</label>
                            <input type="radio" id="sort-desc" name="sortBy" value="productPrice,desc" checked={tempFilters.sortBy.column === 'productPrice' && !tempFilters.sortBy.ascending} onChange={handleSortChange} />
                            <label htmlFor="sort-desc">Price: High-Low</label>
                        </div>
                    </div>

                    <div className="filter-section">
                        <h4 className="filter-title">Seller's Gender</h4>
                        <div className="radio-pill-group">
                            <input type="radio" id="gender-any" name="gender" value="" checked={!tempFilters.gender} onChange={handleRadioChange} />
                            <label htmlFor="gender-any">Any</label>
                            <input type="radio" id="gender-male" name="gender" value="male" checked={tempFilters.gender === 'male'} onChange={handleRadioChange} />
                            <label htmlFor="gender-male">Male</label>
                            <input type="radio" id="gender-female" name="gender" value="female" checked={tempFilters.gender === 'female'} onChange={handleRadioChange} />
                            <label htmlFor="gender-female">Female</label>
                        </div>
                    </div>

                    <div className="filter-section">
                        <h4 className="filter-title">Seller's Hostel</h4>
                        <MultiSelectDropdown
                            options={availableHostels}
                            selected={tempFilters.hostels}
                            onChange={(e) => handleMultiSelectChange(e, 'hostels')}
                            title="Hostels"
                            disabled={!tempFilters.gender}
                        />
                    </div>
                </div>
            </div>
            <div className="filter-actions">
                <button type="button" onClick={onClear} className="clear-button">Clear All</button>
                <button type="submit" className="apply-button">Apply Filters</button>
            </div>
        </form>
    );
};

const defaultFilters = {
    sortBy: { column: 'created_at', ascending: false },
    categories: [],
    gender: null,
    hostels: [],
};

const ITEMS_PER_PAGE = 9;

const Marketplace = () => {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState(defaultFilters);
    const { showToast } = useUI();
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isDetailsOpen, setDetailsOpen] = useState(false);
    const [isReportOpen, setReportOpen] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const handledShared = useRef(false);

    // New state for pagination
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    // Intersection Observer ref for infinite scroll
    const observer = useRef();
    const lastListingElementRef = useCallback(node => {
      if (loading || loadingMore || !hasMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
          setPage(prevPage => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    }, [loading, loadingMore, hasMore]);

    const fetchListings = useCallback(async (currentFilters, currentPage = 0) => {
        if (currentPage === 0) {
            setLoading(true);
            setListings([]);
        } else {
            setLoadingMore(true);
        }

        const from = currentPage * ITEMS_PER_PAGE;
        const to = from + ITEMS_PER_PAGE - 1;

        try {
            const { data: { user } } = await supabase.auth.getUser();
            let reportedListingIds = [];
            if (user) {
                const { data: reports, error: reportError } = await supabase
                    .from('reports')
                    .select('reported_listing_id')
                    .eq('reporter_id', user.id);
                if (reportError) console.error('Error fetching user reports:', reportError);
                else if (reports) reportedListingIds = reports.map(r => r.reported_listing_id);
            }

            let query = supabase
                .from('listings')
                .select(`*, created_at, profiles!inner(*), listing_images(*)`)
                .eq('status', 'available')
                .eq('approval_status', 'approved')
                .order(currentFilters.sortBy.column, { ascending: currentFilters.sortBy.ascending })
                .range(from, to);

            if (reportedListingIds.length > 0) {
                query = query.not('id', 'in', `(${reportedListingIds.join(',')})`);
            }

            if (searchTerm) {
                query = query.or(`productName.ilike.%${searchTerm}%,productCategory.ilike.%${searchTerm}%,shortDescription.ilike.%${searchTerm}%`);
            }
            if (currentFilters.categories.length > 0) {
                query = query.in('productCategory', currentFilters.categories);
            }
            if (currentFilters.gender) {
                query = query.eq('profiles.gender', currentFilters.gender);
            }
            if (currentFilters.hostels.length > 0) {
                query = query.in('profiles.hostelName', currentFilters.hostels);
            }

            const { data, error } = await query;
            if (error) throw error;
            
            setListings(prevListings => [...prevListings, ...(data || [])]);
            setHasMore((data?.length || 0) === ITEMS_PER_PAGE);

        } catch (error) {
            console.error("Error fetching listings:", error);
            showToast("Failed to load listings.", "error");
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [searchTerm, showToast]);

    useEffect(() => {
        const timer = setTimeout(() => {
            // Reset page and listings when filters or search terms change
            setPage(0);
            fetchListings(filters, 0);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm, filters, fetchListings]);

    const handleApplyFilters = (newPopupFilters) => {
        setFilters(prevFilters => ({
            ...prevFilters,
            sortBy: newPopupFilters.sortBy,
            gender: newPopupFilters.gender,
            hostels: newPopupFilters.hostels,
        }));
        setIsFilterOpen(false);
    };

    const handleClearPopupFilters = () => {
        setFilters(prevFilters => ({
            ...prevFilters,
            sortBy: defaultFilters.sortBy,
            gender: null,
            hostels: [],
        }));
        setIsFilterOpen(false);
    };

    const handleCategoryChange = (e) => {
        const { value, checked } = e.target;
        const currentCategories = filters.categories || [];
        if (checked) {
            setFilters({ ...filters, categories: [...currentCategories, value] });
        } else {
            setFilters({ ...filters, categories: currentCategories.filter(item => item !== value) });
        }
    };

    const handleViewDetails = useCallback((product) => {
        setSelectedProduct(product);
        setDetailsOpen(true);
        navigate(`/marketplace?listing=${product.id}`, { replace: true });
    }, [navigate]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const listingId = params.get('listing');
        if (listings.length > 0 && listingId && !handledShared.current) {
            const product = listings.find(p => String(p.id) === listingId);
            if (product) {
                handledShared.current = true;
                handleViewDetails(product);
            }
        }
    }, [listings, location.search, handleViewDetails]);

    const handleReport = (product) => {
        setSelectedProduct(product);
        setReportOpen(true);
    };

    const handleReportSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("You must be logged in to report a listing.");
            const formData = new FormData(e.target);
            const reportData = {
                category: formData.get('category'),
                description: formData.get('description'),
                reporter_id: user.id,
                reported_listing_id: selectedProduct?.id
            };
            if (!reportData.category || !reportData.reported_listing_id) throw new Error("Missing required report information.");
            const { error } = await supabase.from('reports').insert([reportData]);
            if (error) throw error;
            showToast("Report submitted. Thank you for your feedback.", "success");
        } catch (error) {
            console.error("Error submitting report:", error);
            showToast(error.message || "Failed to submit report.", "error");
        } finally {
            setReportOpen(false);
        }
    };

    const closeDetailsPopup = () => {
        setDetailsOpen(false);
        navigate('/marketplace', { replace: true });
    };

    return (
        <>
            <div className="space-y-8">
                {/* Search Bar and Filters */}
                <div className="flex flex-col md:flex-row gap-4 md:items-center">
                    <div className="relative w-full md:flex-grow">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                            <FontAwesomeIcon icon={faSearch} className="text-zinc-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search listings..."
                            className="input-field p-3 pl-12 rounded-lg w-full h-12"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex w-full md:w-auto gap-4">
                        <div className="flex-1 md:flex-initial md:w-56 h-12">
                            <MultiSelectDropdown
                                options={categoryOptions}
                                selected={filters.categories}
                                onChange={handleCategoryChange}
                                title="Categories"
                            />
                        </div>
                        <div className="flex-1 md:flex-initial md:w-auto h-12">
                            <button onClick={() => setIsFilterOpen(true)} className="input-field p-3 px-5 rounded-lg w-full h-full flex items-center justify-center gap-2 hover:border-indigo-400">
                                <FontAwesomeIcon icon={faFilter} className="text-zinc-400" />
                                <span className="font-semibold whitespace-nowrap">More Filters</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Listings Grid */}
                <div id="marketplace-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {listings.length > 0 ? (
                        listings.map((listing, index) => {
                            if (listings.length === index + 1) {
                                return (
                                    <ListingCard
                                        key={listing.id}
                                        product={listing}
                                        onViewDetails={handleViewDetails}
                                        onReport={handleReport}
                                        ref={lastListingElementRef}
                                    />
                                );
                            } else {
                                return (
                                    <ListingCard
                                        key={listing.id}
                                        product={listing}
                                        onViewDetails={handleViewDetails}
                                        onReport={handleReport}
                                    />
                                );
                            }
                        })
                    ) : (
                        loading ? (
                            <p className="text-gray-400 col-span-full text-center py-8">Loading listings...</p>
                        ) : (
                            <p className="text-gray-400 col-span-full text-center py-8">No listings found. Try adjusting your search or filters.</p>
                        )
                    )}
                    {loadingMore && (
                        <p className="text-gray-400 col-span-full text-center py-4">Loading more listings...</p>
                    )}
                    {!hasMore && !loading && listings.length > 0 && (
                        <p className="text-gray-400 col-span-full text-center py-4">You've seen all the listings!</p>
                    )}
                </div>
            </div>

            {/* Popups */}
            <Popup isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} title="More Filters & Sort">
                <FilterPopupContent
                    currentFilters={filters}
                    onApply={handleApplyFilters}
                    onClear={handleClearPopupFilters}
                />
            </Popup>
            <Popup isOpen={isDetailsOpen} onClose={closeDetailsPopup} title={selectedProduct?.productName}>
                {selectedProduct && <DetailsPopupContent product={selectedProduct} />}
            </Popup>
            <Popup isOpen={isReportOpen} onClose={() => setReportOpen(false)} title="Report Listing">
                <ReportPopupContent onSubmit={handleReportSubmit} />
            </Popup>
        </>
    );
};

export default Marketplace;