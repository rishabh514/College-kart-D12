import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faVenusMars, faArrowRight, faPencilAlt, faCamera, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { useProfile } from '../context/ProfileContext';

// --- Constants (No changes) ---
const hostels = {
    girls: ['Sister Nivedita Hostel (SNH)', 'Kalpana Chawla Hostel (KCH)', 'Virangana Lakshmibai Hostel (VLB)'],
    boys: ['Bhaskaracharya Hostel (BCH)', 'Sir C. V. Raman Hostel (CVR)', 'Sir J.C. Bose Hostel (JCB)', 'Varahmihir Hostel (VMH)', 'Sir Vishveshwarya Hostel (VVS)', 'Homi Jehangir Bhabha Hostel (HJB)', 'Aryabhatt Hostel (ABH)', 'Ramanujan Hostel (RMH)', 'Dr. APJ Abdul Kalam Hostel (APJ)', 'Type II Block 1,2,3,4&5 Hostel (Type-II).']
};
const branchOptions = ["Biotechnology (BT)", "Chemical Engineering (CHE)", "Civil Engineering (CE)", "Computer Science & Engineering (CSE)", "Computer Science & Engineering (Data Science & Analytics) (CSDA)", "Electronics & Communication Engineering (ECE)", "Electronics Engineering (VLSI Design & Technology) (EVDT)", "Electrical Engineering (EE)", "Environmental Engineering (ENE)", "Engineering Physics (EP)", "Information Technology (IT)", "Information Technology (Cyber Security) (ITCY)", "Mathematics and Computing (MC)", "Mechanical Engineering (ME)", "Mechanical Engineering (Automotive Engineering) (MAM)", "Production & Industrial Engineering (PIE)", "Software Engineering (SE)"];
const countryCodes = [
    { name: 'India', code: '+91' }, { name: 'USA', code: '+1' }, { name: 'UK', code: '+44' },
];

const getInitialFormData = (profile = null) => ({
    firstName: profile?.firstName || '', lastName: profile?.lastName || '',
    email: profile?.email || '', branch: profile?.branch || '',
    year: profile?.year || '', gender: profile?.gender || '',
    isHosteller: profile?.isHosteller ?? false, hostelName: profile?.hostelName || '',
    countryCode: profile?.countryCode || '+91', whatsappNumber: profile?.whatsappNumber || '',
    profilePhotoPreview: profile?.profilePhotoUrl || null,
});

const Profile = () => {
    const { profile, loading: profileLoading, updateProfile } = useProfile();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState(getInitialFormData());
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [availableHostels, setAvailableHostels] = useState([]);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (!profileLoading) {
            if (profile) {
                setFormData(getInitialFormData(profile));
                setIsEditing(false);
            } else {
                setIsEditing(true);
            }
        }
    }, [profile, profileLoading]);

    useEffect(() => {
        const genderMap = { male: 'boys', female: 'girls' };
        const type = genderMap[formData.gender] || '';
        setAvailableHostels(hostels[type] || []);
        if (isEditing && formData.gender !== (profile?.gender || '')) {
            setFormData(f => ({ ...f, hostelName: '' }));
        }
    }, [formData.gender, isEditing, profile?.gender]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "isHosteller") {
            setFormData(prev => ({ ...prev, isHosteller: value === 'yes' }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handlePhotoChange = (e) => { /* File upload logic will go here */ };
    const handlePhotoClick = () => isEditing && fileInputRef.current.click();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const { profilePhotoPreview, ...dataToSave } = formData;
        await updateProfile(dataToSave);
        setIsSubmitting(false);
        setIsEditing(false);
    };

    // --- THIS IS THE NEW, MORE ROBUST FUNCTION ---
    const handleEditClick = (event) => {
        event.preventDefault(); // Explicitly stop the form from submitting
        setIsEditing(true);      // Set the component to edit mode
    };

    if (profileLoading) {
        return <div className="text-center p-12 text-zinc-400">Loading your profile...</div>;
    }

    return (
        <div id="profile" className="content-section">
            <div className="form-container p-8 md:p-12 rounded-2xl w-full max-w-3xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold mb-3 text-center text-white">
                    <span className="title-gradient">{profile ? 'Your Profile' : 'Create Your Profile'}</span>
                </h2>
                <p className="text-center text-zinc-400 mb-8">
                    {isEditing ? 'Fill in your details to get started.' : 'View or edit your details below.'}
                </p>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <fieldset disabled={!isEditing} className="space-y-6">
                        {/* All your form fields are here, no changes needed inside */}
                        {/* ... Photo, Name, Email, Course, etc. ... */}
                        <div className="flex justify-center items-center">
                            <div className="relative">
                                <input type="file" ref={fileInputRef} onChange={handlePhotoChange} className="hidden" accept="image/png, image/jpeg, image/jpg" />
                                {formData.profilePhotoPreview ? (
                                    <img src={formData.profilePhotoPreview} alt="Profile" className="w-32 h-32 rounded-full object-cover border-4 border-zinc-700 cursor-pointer" onClick={handlePhotoClick} />
                                ) : (
                                    <div className="w-32 h-32 rounded-full border-4 border-zinc-700 bg-zinc-800 flex items-center justify-center cursor-pointer" onClick={handlePhotoClick}>
                                        <svg className="w-24 h-24 text-zinc-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path></svg>
                                    </div>
                                )}
                                {isEditing && (
                                    <button type="button" onClick={handlePhotoClick} className="absolute bottom-1 right-1 bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-indigo-700 transition-colors" aria-label="Change profile photo">
                                        <FontAwesomeIcon icon={faCamera} />
                                    </button>
                                )}
                            </div>
                        </div>
                        <div>
                            <label htmlFor="firstName" className="block text-sm font-medium mb-2 text-zinc-300">Full Name</label>
                            <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-2 md:gap-4">
                                <input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First Name" className="input-field p-3 rounded-lg w-full" required />
                                <input type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last Name" className="input-field p-3 rounded-lg w-full" required />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium mb-2 text-zinc-300">Email Address</label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5"><FontAwesomeIcon icon={faEnvelope} className="text-zinc-400" /></div>
                                <input type="email" id="email" name="email" value={formData.email} className="input-field p-3 pl-10 rounded-lg w-full" disabled />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2 text-zinc-300">Course Details</label>
                            <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-2 md:gap-4">
                                <div>
                                    <label className="block text-xs text-zinc-400 mb-1">Degree</label>
                                    <input type="text" value="B.Tech" className="input-field p-3 rounded-lg w-full bg-zinc-800 border-zinc-700 cursor-not-allowed" disabled />
                                </div>
                                <div>
                                    <label htmlFor="branch" className="block text-xs text-zinc-400 mb-1">Branch</label>
                                    <select id="branch" name="branch" value={formData.branch} onChange={handleChange} className="dropdown-field p-3 rounded-lg w-full" required>
                                        <option value="" disabled>Select Branch</option>
                                        {branchOptions.map(b => <option key={b} value={b}>{b}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-2 md:gap-4">
                            <div>
                                <label htmlFor="year" className="block text-sm font-medium mb-2 text-zinc-300">Year</label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><FontAwesomeIcon icon={faCalendarAlt} className="text-zinc-400" /></div>
                                    <select id="year" name="year" value={formData.year} onChange={handleChange} className="dropdown-field p-3 pl-10 rounded-lg w-full" required>
                                        <option value="" disabled>Select Year</option>
                                        <option>1st</option><option>2nd</option><option>3rd</option><option>4th</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="gender" className="block text-sm font-medium mb-2 text-zinc-300">Gender</label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><FontAwesomeIcon icon={faVenusMars} className="text-zinc-400" /></div>
                                    <select id="gender" name="gender" value={formData.gender} onChange={handleChange} className="dropdown-field p-3 pl-10 rounded-lg w-full" required>
                                        <option value="" disabled>Select Gender</option>
                                        <option value="male">Male</option><option value="female">Female</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2 text-zinc-300">Are you a Hosteller?</label>
                            <div className="flex space-x-4">
                                <div className="flex-1">
                                    <input type="radio" id="isHostellerYes" name="isHosteller" value="yes" checked={formData.isHosteller === true} onChange={handleChange} className="hidden radio-input" />
                                    <label htmlFor="isHostellerYes" className="radio-label">Yes</label>
                                </div>
                                <div className="flex-1">
                                    <input type="radio" id="isHostellerNo" name="isHosteller" value="no" checked={formData.isHosteller === false} onChange={handleChange} className="hidden radio-input" />
                                    <label htmlFor="isHostellerNo" className="radio-label">No</label>
                                </div>
                            </div>
                        </div>
                        {formData.isHosteller && (
                            <div className="space-y-4">
                                <label className="block text-sm font-medium text-zinc-300">Hostel Details</label>
                                <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-2 md:gap-4">
                                    <div>
                                        <label htmlFor="hostelType" className="block text-xs text-zinc-400 mb-1">Hostel Type</label>
                                        <input id="hostelType" name="hostelType" value={formData.gender ? formData.gender.charAt(0).toUpperCase() + formData.gender.slice(1) + ' Hostel' : ''} className="input-field p-3 rounded-lg w-full bg-zinc-800 border-zinc-700 cursor-not-allowed" disabled />
                                    </div>
                                    <div>
                                        <label htmlFor="hostelName" className="block text-xs text-zinc-400 mb-1">Hostel Name</label>
                                        <select id="hostelName" name="hostelName" value={formData.hostelName} onChange={handleChange} className="dropdown-field p-3 rounded-lg w-full" disabled={!formData.gender}>
                                            <option value="" disabled>Select Hostel</option>
                                            {availableHostels.map(h => <option key={h} value={h}>{h}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div>
                            <label htmlFor="whatsappNumber" className="block text-sm font-medium mb-2 text-zinc-300">WhatsApp Number</label>
                            <div className="flex items-center gap-2">
                                <div className="w-1/3">
                                    <select id="countryCode" name="countryCode" value={formData.countryCode} onChange={handleChange} className="dropdown-field p-3 rounded-lg w-full" required>
                                        {countryCodes.map(country => (<option key={country.name} value={country.code}>{country.name} ({country.code})</option>))}
                                    </select>
                                </div>
                                <div className="relative w-2/3">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5"><FontAwesomeIcon icon={faWhatsapp} className="text-zinc-400" /></div>
                                    <input type="tel" id="whatsappNumber" name="whatsappNumber" value={formData.whatsappNumber} onChange={handleChange} placeholder="98765 43210" className="input-field p-3 pl-10 rounded-lg w-full" required />
                                </div>
                            </div>
                        </div>

                    </fieldset>
                    
                    <div className="pt-4">
                        {isEditing ? (
                            <button type="submit" disabled={isSubmitting} className="group stylish-button p-4 rounded-lg w-full text-lg font-semibold tracking-wide flex items-center justify-center">
                                {isSubmitting ? 'Saving...' : (profile ? 'Save Changes' : 'Create Profile')}
                                {!isSubmitting && <FontAwesomeIcon icon={faArrowRight} className="ml-2 transition-transform group-hover:translate-x-1" />}
                            </button>
                        ) : (
                            <button 
                                type="button" 
                                onClick={handleEditClick} // Use the new, robust handler
                                className="group stylish-button p-4 rounded-lg w-full text-lg font-semibold tracking-wide flex items-center justify-center"
                            >
                                Edit Profile
                                <FontAwesomeIcon icon={faPencilAlt} className="ml-2" />
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Profile;

