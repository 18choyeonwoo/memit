import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { apiClient } from '../api/apiClient';
import { adaptUser } from '../api/adapters';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 앱 시작 시 저장된 토큰으로 세션 복원
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    apiClient.get('/users/me')
      .then(data => {
        setUser(adaptUser(data));
        setIsLoggedIn(true);
      })
      .catch(() => {
        localStorage.removeItem('access_token');
      });
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await apiClient.post('/auth/login', { email, password });
    localStorage.setItem('access_token', data.access_token);
    const adapted = adaptUser(data.user);
    setUser(adapted);
    setIsLoggedIn(true);
    return adapted;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    setUser(null);
    setIsLoggedIn(false);
  }, []);

  // 프로필 수정 후 user 상태 갱신
  const updateUser = useCallback((updates) => {
    setUser(prev => adaptUser({ ...prev, ...updates }));
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
