import React, { createContext, useState, useCallback, useContext } from 'react';
import Toast from '../components/common/Toast';

const UIContext = createContext();

export const useUI = () => useContext(UIContext);

export const UIProvider = ({ children }) => {
    const [toast, setToast] = useState({ message: '', show: false });

    const showToast = useCallback((message) => {
        setToast({ message, show: true });
        setTimeout(() => {
            setToast({ message: '', show: false });
        }, 3000);
    }, []);

    const value = { showToast };

    return (
        <UIContext.Provider value={value}>
            {children}
            <Toast message={toast.message} isVisible={toast.show} />
        </UIContext.Provider>
    );
};