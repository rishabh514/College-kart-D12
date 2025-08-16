// src/context/ProfileContext.jsx

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { useUI } from './UIContext';

// 1. Create the context
export const ProfileContext = createContext();

// 2. Create the provider component
export const ProfileProvider = ({ children }) => {
    const { showToast } = useUI(); // Keep your UI context integration
    const [profile, setProfile] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true); // Always start true

    // This effect runs ONCE on mount and sets up the definitive auth listener.
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                setSession(session);

                if (session) {
                    try {
                        const { data, error } = await supabase
                            .from('profiles')
                            .select('*')
                            .eq('id', session.user.id)
                            .single();
                        
                        if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found, which is not a server error.
                            console.error('Error fetching profile:', error);
                        } else {
                            setProfile(data);
                        }
                    } catch (e) {
                         console.error('Exception while fetching profile:', e);
                         setProfile(null);
                    }
                } else {
                    setProfile(null);
                }
                
                // This is critical: loading becomes false after the FIRST auth event is handled.
                // It will not be set to true again, preventing flashes on tab focus.
                setLoading(false);
            }
        );

        // Cleanup the listener on component unmount
        return () => {
            subscription.unsubscribe();
        };
    }, []); // <-- CRITICAL: The empty array ensures this runs only ONCE.

    // Your custom updateProfile function, preserved and safe to use.
    const updateProfile = useCallback(async (profileData) => {
        const user = session?.user;
        if (!user) {
            showToast("You must be logged in to update your profile.", "error");
            return;
        }

        try {
            const { error } = await supabase
                .from('profiles')
                .update(profileData)
                .eq('id', user.id);

            if (error) throw error;

            // Optimistically update the local state for immediate UI feedback
            setProfile(prevProfile => ({ ...prevProfile, ...profileData }));
            showToast('Profile Saved Successfully!', 'success');
        } catch (error) {
            console.error("Failed to save profile to Supabase", error);
            showToast('Error saving profile.', 'error');
        }
    }, [session, showToast]);

    const value = {
        profile,
        session,
        loading,
        updateProfile // Expose your update function
    };

    return (
        <ProfileContext.Provider value={value}>
            {children}
        </ProfileContext.Provider>
    );
};

// 3. Custom hook to use the context
export const useProfile = () => {
    const context = useContext(ProfileContext);
    if (context === undefined) {
        throw new Error('useProfile must be used within a ProfileProvider');
    }
    return context;
};