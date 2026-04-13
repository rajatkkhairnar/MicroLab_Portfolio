import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import Verify from './pages/Verify';
import DemoApp from './demo/DemoApp';

const ProtectedDemo = () => {
    const { isVerified } = useAuth();
    if (!isVerified) return <Navigate to="/verify" replace />;
    return <DemoApp />;
};

function App() {
    return (
        <AuthProvider>
            <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/verify" element={<Verify />} />
                <Route path="/demo/*" element={<ProtectedDemo />} />
            </Routes>
        </AuthProvider>
    );
}

export default App;
