import React, { createContext, useContext, useState, useCallback } from 'react';
import { syncActiveChatId } from '../utils/notificationsState';

const Ctx = createContext(null);

export function ActiveChatProvider({ children }) {
    const [activeChatId, _setActiveChatId] = useState(null);
    const [activeMessages, setActiveMessages] = useState([]);

    const setActiveChatId = useCallback((id) => {
        _setActiveChatId(id);
        syncActiveChatId(id);
    }, []);

    const clearActiveChat = useCallback(() => {
        _setActiveChatId(null);
        syncActiveChatId(null);
        setActiveMessages([]);
    }, []);

    const appendToActive = useCallback((msg) => {
        setActiveMessages((prev) => [...prev, msg]);
    }, []);

    return (
        <Ctx.Provider value={{
                activeChatId,
                setActiveChatId,
                clearActiveChat,
                activeMessages,
                setActiveMessages,
                appendToActive,
            }}>
            {children}
        </Ctx.Provider>
    );
}

export function useActiveChat() {
    const ctx = useContext(Ctx);
    if (!ctx) throw new Error('useActiveChat must be used inside ActiveChatProvider');
    return ctx;
}
