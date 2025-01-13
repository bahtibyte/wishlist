import React, { createContext, useContext, ReactNode, useState } from 'react';
import { User } from '../graphql/types';

interface AppContextState {
    user: User | null;
    setUser: (user: User | null) => void;
}

const AppContext = createContext<AppContextState | undefined>(undefined);

export const useAppData = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppData must be used within an AppDataProvider');
    }
    return context;
};

interface AppProviderProps {
    children: ReactNode;
}

export const AppDataProvider: React.FC<AppProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);

    const value: AppContextState = {
        user,
        setUser,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
