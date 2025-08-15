// src/context/ProfileContext.jsx

import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { supabase } from '../supabaseClient';
import { useUI } from './UIContext';

export const ProfileContext = createContext();
export const useProfile = () => useContext(ProfileContext);

export const ProfileProvider = ({ children }) => {
    const { showToast } = useUI();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = useCallback(async (user) => {
        try {
            setLoading(true);
            const { data, error, status } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error && status !== 406) throw error;
            if (data) setProfile(data);

        } catch (error) {
            showToast('Error loading profile data.', 'error');
            console.error('Error loading profile:', error);
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        const fetchInitialSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                await fetchProfile(session.user);
            } else {
                setLoading(false);
            }
        };
        fetchInitialSession();

        const { data: authListener } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                if (session) {
                    await fetchProfile(session.user);
                } else {
                    setProfile(null);
                }
            }
        );

        return () => {
            authListener.subscription?.unsubscribe();
        };
    }, [fetchProfile]);

    // --- THIS IS THE CORRECTED FUNCTION ---
    const updateProfile = useCallback(async (profileData) => {
        try {
            // 1. Get the current user directly from Supabase auth. This is always reliable.
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("You must be logged in to update your profile.");

            // 2. Perform the update WHERE the 'id' column matches the logged-in user's ID.
            const { error } = await supabase
                .from('profiles')
                .update(profileData)
                .eq('id', user.id); // Use user.id instead of profile.id

            if (error) throw error;

            // 3. Update the local state to instantly reflect the changes in the UI.
            setProfile(prevProfile => ({ ...(prevProfile || {}), id: user.id, ...profileData }));
            showToast('Profile Saved Successfully!', 'success');
        } catch (error) {
            console.error("Failed to save profile to Supabase", error);
            showToast('Error saving profile.', 'error');
        }
    }, [showToast]);

    const value = { profile, loading, updateProfile };

    return (
        <ProfileContext.Provider value={value}>
            {children}
        </ProfileContext.Provider>
    );
};