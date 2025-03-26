'use client'; // Context provider often needs client-side hooks

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface AuthUser {
  id: number;
  username: string;
  email: string;
  // Add other user fields if needed
}

interface AuthContextType {
  user: AuthUser | null;
  jwt: string | null;
  isLoading: boolean; // To handle initial loading of state
  login: (token: string, userData: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [jwt, setJwt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start loading initially
  const router = useRouter();

  // Effect to load token/user from storage on initial mount
  useEffect(() => {
    // Using localStorage for simplicity in dev. Use httpOnly cookies for production.
    const storedJwt = localStorage.getItem('strapi_jwt');
    const storedUser = localStorage.getItem('strapi_user');

    if (storedJwt && storedUser) {
      try {
        setJwt(storedJwt);
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error parsing stored auth data:", error);
        // Clear invalid stored data
        localStorage.removeItem('strapi_jwt');
        localStorage.removeItem('strapi_user');
      }
    }
    setIsLoading(false); // Finished loading initial state
  }, []);

  const login = (token: string, userData: AuthUser) => {
    setJwt(token);
    setUser(userData);
    // Store in localStorage (simple approach)
    localStorage.setItem('strapi_jwt', token);
    localStorage.setItem('strapi_user', JSON.stringify(userData));
  };

  const logout = () => {
    setJwt(null);
    setUser(null);
    // Clear from localStorage
    localStorage.removeItem('strapi_jwt');
    localStorage.removeItem('strapi_user');
    // Optional: Redirect to login or homepage after logout
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, jwt, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
