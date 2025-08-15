import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRupeeSign, faCloudUploadAlt, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { ProfileContext } from '../context/ProfileContext';
import { useUI } from '../context/UIContext';
import { supabase } from '../supabaseClient';

const categoryOptions = ["Books & Study Material", "Electronics & Gadgets", "Furniture & Room Essentials", "Stationery & Supplies", "Sports & Fitness Gear", "Clothing & Accessories", "Kitchen & Dining", "Tech & Mobile Accessories", "Gaming & Entertainment", "Hobby & Miscellaneous Items"];

const CreateListing = () => {
    const { profile } = useContext(ProfileContext);
    const { showToast } = useUI();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        productName: '', productPrice: '', productCategory: '',
        productAgeYears: '0', productAgeMonths: '0',
        shortDescription: '', longDescription: '',
    });
    const [imageFiles, setImageFiles] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!profile) {
            showToast("Please create your profile first!", 'error');
            navigate('/');
        }
    }, [profile, navigate, showToast]);

    useEffect(() => {
        // Clean up object URLs to prevent memory leaks
        return () => {
            imagePreviews.forEach(url => URL.revokeObjectURL(url));
        }
    }, [imagePreviews]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files).slice(0, 3);
        setImageFiles(files);
        
        imagePreviews.forEach(url => URL.revokeObjectURL(url));
        const previews = files.map(file => URL.createObjectURL(file));
        setImagePreviews(previews);
    };

    // This is the simplified submit function that only handles text data
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

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
                // We now save a placeholder URL array
                imageUrls: [
                    'https://placehold.co/600x400/1e1e1e/a1a1aa?text=Image+1',
                    'https://placehold.co/600x400/1e1e1e/a1a1aa?text=Image+2',
                    'https://placehold.co/600x400/1e1e1e/a1a1aa?text=Image+3'
                ],
            };

            const { error: insertError } = await supabase.from('listings').insert([listingData]);
            if (insertError) throw insertError;

            showToast("Listing (text only) created successfully!", "success");
            navigate('/my-listings');

        } catch (error) {
            console.error('Error creating listing:', error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            showToast(errorMessage, "error");
        } finally {
            setLoading(false);
        }
    };

    if (!profile) return null;

    const branchAbbreviation = (profile.branch?.match(/\(([^)]+)\)/) || [])[1] || profile.branch;

    return (
        <div id="create-listing" className="content-section">
            <div className="form-container p-8 md:p-12 rounded-2xl w-full max-w-3xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold mb-3 text-center text-white">
                    <span className="title-gradient">Create a New Listing</span>
                </h2>
                <p className="text-center text-zinc-400 mb-10">Fill in the details to list your item for sale.</p>
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Seller Information Section */}
                    <div>
                        <h3 className="text-xl font-semibold text-zinc-200 border-b border-zinc-700 pb-2 mb-6">Seller Information</h3>
                        <div className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <input type="text" value={`${profile.firstName} ${profile.lastName}`} className="input-field p-3 rounded-lg w-full" disabled />
                                <input type="text" value={`${branchAbbreviation}, ${profile.year}`} className="input-field p-3 rounded-lg w-full" disabled />
                            </div>
                            <div className="grid md:grid-cols-3 gap-4">
                                <input type="text" value={profile.isHosteller ? profile.hostelName : 'Day Scholar'} className="input-field p-3 rounded-lg w-full" disabled />
                                <input type="text" value={profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1)} className="input-field p-3 rounded-lg w-full" disabled />
                                <input type="text" value={`${profile.countryCode} ${profile.whatsappNumber}`} className="input-field p-3 rounded-lg w-full" disabled />
                            </div>
                        </div>
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
                        <button type="submit" className="group stylish-button p-4 rounded-lg w-full text-lg font-semibold tracking-wide shadow-lg flex items-center justify-center" disabled={loading}>
                            {loading ? 'Listing...' : 'List My Item'}
                            {!loading && <FontAwesomeIcon icon={faArrowRight} className="ml-2 transition-transform group-hover:translate-x-1" />}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateListing;