import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import axiosClient from '../services/axiosClient';


const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('user');
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          if (parsed?.token) {
            // Check if token is still valid
            try {
              const res = await axiosClient.get('/auth/me');
              if (res?.success) {
                const updatedUser = { ...res.data, token: parsed.token };
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));
              } else {
                logout();
              }
            } catch (error) {
              // 401 will trigger logout
              logout();
            }
          } else {
            logout();
          }
        } catch {
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();

    // Listen for global 401 Unauthorized events from axiosClient
    const handleUnauthorized = () => {
      logout();
    };
    window.addEventListener('unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('unauthorized', handleUnauthorized);
    };
  }, [logout]);

  const login = useCallback((userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
