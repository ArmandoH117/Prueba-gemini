import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { makeRequest } from '../services/fetchRequest';
import { getData } from '../utils/LocalStorage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loadingUser, setLoadingUser] = useState(true);

    const refreshUser = async () => {
        try {
            setLoadingUser(true);
            const userId = await getData('idUser');
            const data = await makeRequest(`/usuarios/info/${userId}`);
            
            setUser(data.data);
        } catch (err) {
            console.log(err)
            setUser(null);
        }
    };

    useEffect(() => {
        if (user) {
            setLoadingUser(false);
        }
    }, [user]);

    const signOut = () => {
        setUser(null);
    };

    useEffect(() => {
        refreshUser();
    }, []);

    const value = useMemo(() => ({ user, loadingUser, refreshUser, signOut, setUser }), [user, loadingUser]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
    return ctx;
};
