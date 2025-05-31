'use client';

import { createContext, useContext, useReducer, useCallback, ReactNode, useEffect } from 'react';
import axios from 'axios';
import { AuthState, LoginCredentials, RegisterData, User, UpdateProfileData, ChangePasswordData } from '../types/auth';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (data: UpdateProfileData) => Promise<{ user: User }>;
  changePassword: (data: ChangePasswordData) => Promise<{ message: string }>;
}

// Create the context with an initial undefined value
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
};

type AuthAction =
  | { type: 'SET_LOADING' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'REGISTER_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'UPDATE_PROFILE'; payload: User }
  | { type: 'AUTH_ERROR' }
  | { type: 'LOGOUT' };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: true };
    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        isLoading: false,
        user: action.payload.user,
        token: action.payload.token,
      };
    case 'UPDATE_PROFILE':
      return {
        ...state,
        isLoading: false,
        user: action.payload,
      };
    case 'AUTH_ERROR':
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        isLoading: false,
        user: null,
        token: null,
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  // Function to store auth data with expiration
  const storeAuthData = (token: string, user: User, rememberMe: boolean = false) => {
    const storage = rememberMe ? localStorage : sessionStorage;
    const expirationTime = rememberMe ? Date.now() + (24 * 60 * 60 * 1000) : null; // 24 hours for remember me
    
    const authData = {
      token,
      user,
      expirationTime,
      rememberMe
    };
    
    console.log(`[Auth] Storing auth data - Remember Me: ${rememberMe}, Storage: ${rememberMe ? 'localStorage' : 'sessionStorage'}`, {
      expirationTime: expirationTime ? new Date(expirationTime).toLocaleString() : 'No expiration',
      user: user.email
    });
    
    storage.setItem('authData', JSON.stringify(authData));
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  // Function to clear auth data from both storages
  const clearAuthData = () => {
    localStorage.removeItem('authData');
    sessionStorage.removeItem('authData');
    localStorage.removeItem('token'); // Legacy cleanup
    delete axios.defaults.headers.common['Authorization'];
  };  // Function to check if stored auth data is valid
  const isAuthDataValid = (authData: { rememberMe?: boolean; expirationTime?: number | null }) => {
    if (!authData.rememberMe) return true; // Session storage doesn't expire
    if (!authData.expirationTime) return true; // No expiration set
    return Date.now() < authData.expirationTime;
  };

  // Initialize auth state from storage
  useEffect(() => {    const initializeAuth = () => {
      console.log('[Auth] Initializing auth state from storage...');
      
      // Check localStorage first (remember me)
      let storedData = localStorage.getItem('authData');
      let storage: Storage = localStorage;
      let storageType = 'localStorage';
        // If not found in localStorage, check sessionStorage
      if (!storedData) {
        storedData = sessionStorage.getItem('authData');
        storage = sessionStorage;
        storageType = 'sessionStorage';
      }      // Check for legacy token storage
      if (!storedData) {
        const legacyToken = localStorage.getItem('token');
        if (legacyToken) {
          console.log('[Auth] Found legacy token, cleaning up...');
          localStorage.removeItem('token');
          return;
        }
        console.log('[Auth] No stored auth data found');
      }if (storedData) {
        try {
          const authData = JSON.parse(storedData);
          console.log(`[Auth] Found auth data in ${storageType}:`, {
            user: authData.user?.email,
            rememberMe: authData.rememberMe,
            expirationTime: authData.expirationTime ? new Date(authData.expirationTime).toLocaleString() : 'No expiration'
          });
          
          if (isAuthDataValid(authData)) {
            console.log('[Auth] Auth data is valid, restoring session...');
            dispatch({ 
              type: 'LOGIN_SUCCESS', 
              payload: { user: authData.user, token: authData.token } 
            });
            axios.defaults.headers.common['Authorization'] = `Bearer ${authData.token}`;
          } else {
            console.log('[Auth] Auth data expired, clearing...');
            storage.removeItem('authData');
          }} catch (error) {
          // Invalid stored data, clear it
          console.error('Error parsing stored auth data:', error);
          clearAuthData();
        }
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      dispatch({ type: 'SET_LOADING' });
      const { data } = await axios.post(`${API_URL}/auth/login`, credentials);
      dispatch({ type: 'LOGIN_SUCCESS', payload: data });
      
      // Store token with remember me preference
      storeAuthData(data.token, data.user, credentials.rememberMe || false);
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR' });
      throw error;
    }
  }, []);
  const register = useCallback(async (userData: RegisterData) => {
    try {
      dispatch({ type: 'SET_LOADING' });
      const { data } = await axios.post(`${API_URL}/auth/register`, userData);
      dispatch({ type: 'REGISTER_SUCCESS', payload: data });
      
      // Store token without remember me for registration
      storeAuthData(data.token, data.user, false);
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR' });
      throw error;
    }
  }, []);
  const router = useRouter();
  
  const logout = useCallback(() => {
    clearAuthData();
    dispatch({ type: 'LOGOUT' });
    router.push('/');
  }, [router]);const updateProfile = useCallback(async (data: UpdateProfileData): Promise<{ user: User }> => {
    try {
      dispatch({ type: 'SET_LOADING' });
      const { data: responseData } = await axios.put<{ user: User }>(`${API_URL}/users/profile`, data, {
        headers: { Authorization: `Bearer ${state.token}` }
      });
      dispatch({ type: 'UPDATE_PROFILE', payload: responseData.user });
      return responseData;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to update profile');
      }
      throw error;
    }
  }, [state.token]);

  const changePassword = useCallback(async (data: ChangePasswordData): Promise<{ message: string }> => {
    try {
      dispatch({ type: 'SET_LOADING' });
      const { data: responseData } = await axios.put<{ message: string }>(`${API_URL}/users/change-password`, data, {
        headers: { Authorization: `Bearer ${state.token}` }
      });
      return responseData;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to change password');
      }
      throw error;
    }
  }, [state.token]);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, updateProfile, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};