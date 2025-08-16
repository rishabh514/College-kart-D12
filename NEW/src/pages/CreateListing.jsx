import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRupeeSign, faCloudUploadAlt, faArrowRight, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { useProfile } from '../context/ProfileContext';
import { useUI } from '../context/UIContext';
import { supabase } from '../supabaseClient';
import imageCompression from 'browser-image-compression';

const categoryOptions = ["Books & Study Material", "Electronics & Gadgets", "Furniture & Room Essentials", "Stationery & Supplies", "Sports & Fitness Gear", "Clothing & Accessories", "Kitchen & Dining", "Tech & Mobile Accessories", "Gaming & Entertainment", "Hobby & Miscellaneous Items"];

// A helper function to check for an incomplete profile
const isProfileIncomplete = (p) => {
    if (!p) return true;
    const requiredFields = ['firstName', 'lastName', 'branch', 'year', 'whatsappNumber'];
    if (p.isHosteller && !p.hostelName) return true;
    return requiredFields.some(field => !p[field]);
};

const CreateListing = () => {
    const { profile, loading: profileLoading } = useProfile();
    const { showToast } = useUI();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        productName: '', productPrice: '', productCategory: '',
        productAgeYears: '0', productAgeMonths: '0',
        shortDescription: '', longDescription: '',
    });
    const [imageFiles, setImageFiles] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('List My Item');

    // Clean up object URLs to prevent memory leaks when the component unmounts
    useEffect(() => {
        return () => {
            imagePreviews.forEach(url => URL.revokeObjectURL(url));
        }
    }, [imagePreviews]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    
    // --- MODIFIED: handleImageChange with 15MB raw file validation ---
    const handleImageChange = (e) => {
        const newFiles = Array.from(e.target.files);

        // Validate raw file size (max 15 MB)
        const validFiles = newFiles.filter(file => {
            if (file.size > 15 * 1024 * 1024) {
                showToast(`'${file.name}' is larger than 15 MB and will be skipped.`, "error");
                return false;
            }
            return true;
        });

        // Combine the existing files with the new valid ones
        const combinedFiles = [...imageFiles, ...validFiles];
        const limitedFiles = combinedFiles.slice(0, 3);

        if (combinedFiles.length > 3) {
            showToast("You can upload a maximum of 3 images.", "info");
        }

        setImageFiles(limitedFiles);

        // Clean up old previews before creating new ones
        imagePreviews.forEach(url => URL.revokeObjectURL(url));
        const newPreviews = limitedFiles.map(file => URL.createObjectURL(file));
        setImagePreviews(newPreviews);
    };

    // --- NEW: Dedicated image compression function ---
    const compressImage = async (file) => {
        const options = {
            maxSizeMB: 0.5,            // Target size under 500 KB
            maxWidthOrHeight: 1280,    // Resize large images
            useWebWorker: true,
            fileType: "image/jpeg",    // Force JPG for better compression
        };

        try {
            const compressedFile = await imageCompression(file, options);
            console.log(
                `✅ ${file.name} | Original: ${(file.size / 1024 / 1024).toFixed(2)} MB → Compressed: ${(compressedFile.size / 1024).toFixed(2)} KB`
            );

            // Final check: if compression still results in a file > 500 KB, skip it
            if (compressedFile.size > 500 * 1024) {
                showToast(`'${file.name}' could not be compressed under 500 KB and will be skipped.`, "error");
                return null;
            }

            return compressedFile;
        } catch (error) {
            console.error(`❌ Compression failed for ${file.name}:`, error);
            showToast(`Could not process '${file.name}'. It will be skipped.`, "error");
            return null; // Return null if compression fails
        }
    };

    // --- MODIFIED: handleSubmit with pre-upload compression step ---
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isProfileIncomplete(profile)) {
            showToast("Please complete your profile before listing an item.", "error");
            return;
        }

        if (imageFiles.length === 0) {
            showToast("Please select at least one image.", "error");
            return;
        }

        setIsSubmitting(true);
        setLoadingMessage('Creating listing...');

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("You must be logged in.");

            const listingData = {
                productName: formData.productName,
                productPrice: formData.productPrice,
                productCategory: formData.productCategory,
                productAge: `${formData.productAgeYears} year(s), ${formData.productAgeMonths} month(s)`,
                shortDescription: formData.shortDescription,
                longDescription: formData.longDescription,
                seller_id: user.id,
                status: 'available',
            };

            const { data: newListing, error: insertError } = await supabase
                .from('listings')
                .insert(listingData)
                .select()
                .single();

            if (insertError) throw insertError;
            
            // Step 1: Compress images before uploading
            setLoadingMessage('Compressing images...');
            const compressedFiles = (await Promise.all(imageFiles.map(compressImage))).filter(Boolean); // .filter(Boolean) removes any nulls from failed compressions

            if (compressedFiles.length === 0) {
                 // This case handles if all selected images failed compression. We should not proceed.
                 // We might want to delete the created listing entry if no images can be uploaded.
                 // For now, we'll just show an error. A more robust solution could delete the orphaned listing.
                showToast("No images could be prepared for upload. Please try different images.", "error");
                throw new Error("Image compression failed for all selected files.");
            }

            // Step 2: Upload the successfully compressed images
            setLoadingMessage(`Uploading ${compressedFiles.length} image(s)...`);

            const uploadPromises = compressedFiles.map(async (file, index) => {
                const uploadFormData = new FormData();
                uploadFormData.append('image', file);
                uploadFormData.append('listing_id', newListing.id);
                uploadFormData.append('position', index);

                const { error: functionError } = await supabase.functions.invoke('listing-image-upload', {
                    body: uploadFormData,
                });

                if (functionError) throw new Error(`Failed to upload ${file.name}: ${functionError.message}`);
            });

            await Promise.all(uploadPromises);
            showToast("Listing created successfully!", "success");
            navigate('/my-listings');

        } catch (error) {
            console.error('Error creating listing:', error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            showToast(errorMessage, "error");
        } finally {
            setIsSubmitting(false);
            setLoadingMessage('List My Item');
        }
    };
    
    if (profileLoading) {
        return <div className="content-section text-center p-8 text-zinc-400">Loading...</div>;
    }

    const profileIsDeficient = isProfileIncomplete(profile);
    const branchAbbreviation = (profile?.branch?.match(/\(([^)]+)\)/) || [])[1] || profile?.branch;

    return (
        <div id="create-listing" className="content-section">
            <div className="form-container p-8 md:p-12 rounded-2xl w-full max-w-3xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold mb-3 text-center text-white">
                    <span className="title-gradient">Create a New Listing</span>
                </h2>
                <p className="text-center text-zinc-400 mb-10">Fill in the details to list your item for sale.</p>

                {profileIsDeficient && (
                    <div className="bg-yellow-900/50 border border-yellow-700 text-yellow-300 px-4 py-3 rounded-lg mb-8 flex items-center gap-4">
                        <FontAwesomeIcon icon={faExclamationTriangle} className="text-3xl" />
                        <div>
                            <h4 className="font-bold">Your profile is incomplete!</h4>
                            <p className="text-sm">
                                You can fill out the form, but you'll need to complete your profile before you can list an item.
                                <Link to="/profile" className="font-semibold underline hover:text-yellow-200 ml-1">
                                    Update your profile now
                                </Link>
                            </p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Seller Information Section */}
                    <div>
                        <h3 className="text-xl font-semibold text-zinc-200 border-b border-zinc-700 pb-2 mb-6">Seller Information</h3>
                        {profile ? (
                            <div className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <input type="text" value={`${profile.firstName || ''} ${profile.lastName || ''}`} className="input-field p-3 rounded-lg w-full" disabled />
                                    <input type="text" value={profile?.branch && profile?.year ? `${branchAbbreviation}, ${profile.year}` : `${branchAbbreviation || ''}${profile.year || ''}`} className="input-field p-3 rounded-lg w-full" disabled />
                                </div>
                                <div className="grid md:grid-cols-3 gap-4">
                                    <input type="text" value={profile.isHosteller ? (profile.hostelName || 'Hostel not set') : 'Day Scholar'} className="input-field p-3 rounded-lg w-full" disabled />
                                    <input type="text" value={(profile.gender?.charAt(0).toUpperCase() + profile.gender?.slice(1)) || ''} className="input-field p-3 rounded-lg w-full" disabled />
                                    <input type="text" value={`${profile.countryCode || ''} ${profile.whatsappNumber || ''}`} className="input-field p-3 rounded-lg w-full" disabled />
                                </div>
                            </div>
                        ) : (
                            <p className="text-zinc-400">Your seller information will appear here once your profile is complete.</p>
                        )}
                    </div>

                    {/* Product Details Section */}
                    <div>
                        <h3 className="text-xl font-semibold text-zinc-200 border-b border-zinc-700 pb-2 mb-6">Product Details</h3>
                        <div className="space-y-6">
                            <div>
                                <label htmlFor="productName" className="block text-sm font-medium mb-2 text-zinc-300">Product Name</label>
                                <input type="text" id="productName" name="productName" value={formData.productName} onChange={handleChange} placeholder="e.g., Scientific Calculator FX-991ES" className="input-field p-3 rounded-lg w-full" required />
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="productPrice" className="block text-sm font-medium mb-2 text-zinc-300">Product Price</label>
                                    <div className="relative">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><FontAwesomeIcon icon={faRupeeSign} className="text-zinc-400" /></div>
                                        <input type="number" id="productPrice" name="productPrice" value={formData.productPrice} onChange={handleChange} placeholder="500" className="input-field p-3 pl-10 rounded-lg w-full" required />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="productCategory" className="block text-sm font-medium mb-2 text-zinc-300">Product Category</label>
                                    <select id="productCategory" name="productCategory" value={formData.productCategory} onChange={handleChange} className="dropdown-field p-3 rounded-lg w-full" required>
                                        <option value="" disabled>Select a category</option>
                                        {categoryOptions.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-zinc-300">Product Age</label>
                                    <div className="flex items-center gap-4">
                                        <select name="productAgeYears" value={formData.productAgeYears} onChange={handleChange} className="dropdown-field p-3 rounded-lg w-full" required>
                                            {[...Array(6).keys()].map(i => <option key={i} value={i}>{i} Year{i !== 1 ? 's' : ''}</option>)}
                                        </select>
                                        <select name="productAgeMonths" value={formData.productAgeMonths} onChange={handleChange} className="dropdown-field p-3 rounded-lg w-full" required>
                                            {[...Array(12).keys()].map(i => <option key={i} value={i}>{i} Month{i !== 1 ? 's' : ''}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="shortDescription" className="block text-sm font-medium mb-2 text-zinc-300">Short Description</label>
                                <input type="text" id="shortDescription" name="shortDescription" value={formData.shortDescription} onChange={handleChange} placeholder="A brief, one-line summary of the product." className="input-field p-3 rounded-lg w-full" maxLength="100" required />
                            </div>
                            <div>
                                <label htmlFor="longDescription" className="block text-sm font-medium mb-2 text-zinc-300">Long Description</label>
                                <textarea id="longDescription" name="longDescription" value={formData.longDescription} onChange={handleChange} placeholder="Provide more details about the product's condition, features, and reason for selling." className="textarea-field p-3 rounded-lg w-full" rows="4"></textarea>
                            </div>
                        </div>
                    </div>

                    {/* Product Media Section */}
                    <div>
                        <h3 className="text-xl font-semibold text-zinc-200 border-b border-zinc-700 pb-2 mb-6">Product Media</h3>
                        <div>
                            <label className="block text-sm font-medium mb-2 text-zinc-300">Product Photos</label>
                            <label htmlFor="productPhotos" className="file-upload-label p-6 rounded-lg cursor-pointer flex flex-col items-center justify-center text-center">
                                <FontAwesomeIcon icon={faCloudUploadAlt} className="text-4xl text-zinc-400 mb-3" />
                                <span className="font-semibold text-indigo-400">{imageFiles.length > 0 ? `${imageFiles.length} image${imageFiles.length > 1 ? 's' : ''} selected` : 'Click to upload images'}</span>
                                <span className="text-xs text-zinc-500 mt-1">Max 3 images (PNG, JPG, WEBP)</span>
                            </label>
                            <input type="file" id="productPhotos" name="productPhotos" className="hidden" multiple accept="image/png, image/jpeg, image/webp" onChange={handleImageChange} />
                            <div id="image-previews" className="mt-4 grid grid-cols-3 gap-4">
                                {imagePreviews.map((preview, index) => (
                                    <div key={index} className="relative aspect-square border-2 border-zinc-700 rounded-lg overflow-hidden">
                                        <img src={preview} alt={`preview ${index}`} className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4">
                        <button type="submit" className="group stylish-button p-4 rounded-lg w-full text-lg font-semibold tracking-wide shadow-lg flex items-center justify-center" disabled={isSubmitting || profileIsDeficient}>
                            {isSubmitting ? loadingMessage : 'List My Item'}
                            {!isSubmitting && <FontAwesomeIcon icon={faArrowRight} className="ml-2 transition-transform group-hover:translate-x-1" />}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateListing;