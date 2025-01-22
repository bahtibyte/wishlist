import React, { createContext, useContext, ReactNode, useState } from 'react';
import { User, Event } from '@/graphql/types';

// TODO: Cache the data in storage so it can be preloaded on app start.
interface AppContextState {
  user: User | null;
  events: Event[];
  setUser: (user: User | null) => void;
  setEvents: (events: Event[]) => void;
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
  const [events, setEvents] = useState<Event[]>([]);

  const value: AppContextState = {
    user,
    events,
    setUser,
    setEvents,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
