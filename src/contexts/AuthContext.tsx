import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'admin' | 'sales-coordinator' | 'branding-manager';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  name: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Mock users for demo - in production, this would come from Supabase
const mockUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@superprint.com',
    role: 'admin',
    name: 'Admin User'
  },
  {
    id: '2',
    username: 'sales1',
    email: 'john.smith@superprint.com',
    role: 'sales-coordinator',
    name: 'John Smith'
  },
  {
    id: '3',
    username: 'branding1',
    email: 'sarah.wilson@superprint.com',
    role: 'branding-manager',
    name: 'Sarah Wilson'
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for saved user session
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      // Auto-login as admin for demo
      setUser(mockUsers[0]);
      localStorage.setItem('currentUser', JSON.stringify(mockUsers[0]));
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    // Mock authentication - in production, this would validate against Supabase
    const foundUser = mockUsers.find(u => u.username === username);
    if (foundUser && password === 'password') {
      setUser(foundUser);
      localStorage.setItem('currentUser', JSON.stringify(foundUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isAuthenticated: !!user 
    }}>
      {children}
    </AuthContext.Provider>
  );
};