import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [isVerified, setIsVerified] = useState(() => {
        return localStorage.getItem('demo_verified') === 'true';
    });

    const verify = () => {
        localStorage.setItem('demo_verified', 'true');
        setIsVerified(true);
    };

    return (
        <AuthContext.Provider value={{ isVerified, verify }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
