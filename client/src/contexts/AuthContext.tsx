'use client';

import { createContext, useContext, useReducer, useCallback, ReactNode, useEffect } from 'react';
import axios from 'axios';
import api from '@/lib/api';
import { AuthState, LoginCredentials, RegisterData, User, UpdateProfileData, ChangePasswordData } from '../types/auth';
import { useRouter } from 'next/navigation';

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
  isLoading: true, // Start with loading true to prevent login page flash
};

type AuthAction =
  | { type: 'SET_LOADING' }
  | { type: 'SET_LOADING_FALSE' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'REGISTER_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'UPDATE_PROFILE'; payload: User }
  | { type: 'AUTH_ERROR' }
  | { type: 'LOGOUT' };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: true };
    case 'SET_LOADING_FALSE':
      return { ...state, isLoading: false };
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
  const [state, dispatch] = useReducer(authReducer, initialState);  // Function to store auth data with expiration
  const storeAuthData = (token: string, user: User, rememberMe: boolean = false) => {
    const storage = rememberMe ? localStorage : sessionStorage;
    const expirationTime = rememberMe ? Date.now() + (24 * 60 * 60 * 1000) : null; // 24 hours for remember me
    
    const authData = {
      token,
      user,
      expirationTime,
      rememberMe
    };
    
    storage.setItem('authData', JSON.stringify(authData));
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  // Function to clear auth data from both storages
  const clearAuthData = () => {    localStorage.removeItem('authData');
    sessionStorage.removeItem('authData');
    localStorage.removeItem('token'); // Legacy cleanup
    delete api.defaults.headers.common['Authorization'];
  };  // Function to check if stored auth data is valid
  const isAuthDataValid = (authData: { rememberMe?: boolean; expirationTime?: number | null }) => {
    if (!authData.rememberMe) return true; // Session storage doesn't expire
    if (!authData.expirationTime) return true; // No expiration set
    return Date.now() < authData.expirationTime;
  };  // Initialize auth state from storage
  useEffect(() => {
    // Note: isLoading is already true from initialState, so no need to set it again
    const initializeAuth = () => {
      // Check localStorage first (remember me)
      let storedData = localStorage.getItem('authData');
      let storage: Storage = localStorage;
      
      // If not found in localStorage, check sessionStorage
      if (!storedData) {
        storedData = sessionStorage.getItem('authData');
        storage = sessionStorage;
      }
      
      // Check for legacy token storage
      if (!storedData) {
        const legacyToken = localStorage.getItem('token');
        if (legacyToken) {
          localStorage.removeItem('token');
          return;
        }
      }

      if (storedData) {
        try {
          const authData = JSON.parse(storedData);
          
          if (isAuthDataValid(authData)) {
            dispatch({ 
              type: 'LOGIN_SUCCESS', 
              payload: { user: authData.user, token: authData.token } 
            });
            api.defaults.headers.common['Authorization'] = `Bearer ${authData.token}`;
          } else {
            storage.removeItem('authData');
          }        } catch {
          // Invalid stored data, clear it
          clearAuthData();
        }
      }
      dispatch({ type: 'SET_LOADING_FALSE' });
    };

    initializeAuth();
  }, []);  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      dispatch({ type: 'SET_LOADING' });
      
      const { data } = await api.post('/auth/login', credentials);
      
      dispatch({ type: 'LOGIN_SUCCESS', payload: data });
      
      // Store token with remember me preference
      storeAuthData(data.token, data.user, credentials.rememberMe || false);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Log minimal error info for debugging without exposing sensitive data
        console.error('[Auth] Login failed:', error.response?.status);
      }
      dispatch({ type: 'AUTH_ERROR' });
      throw error;
    }
  }, []);const register = useCallback(async (userData: RegisterData) => {
    try {
      dispatch({ type: 'SET_LOADING' });
      const { data } = await api.post('/auth/register', userData);
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
  }, [router]);  const updateProfile = useCallback(async (data: UpdateProfileData): Promise<{ user: User }> => {
    try {
      dispatch({ type: 'SET_LOADING' });
      const { data: responseData } = await api.put<{ user: User }>('/users/profile', data, {
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
      const { data: responseData } = await api.put<{ message: string }>('/users/change-password', data, {
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