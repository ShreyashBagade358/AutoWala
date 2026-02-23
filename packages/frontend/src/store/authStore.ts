import { create } from 'zustand';
import { User, Driver } from '@shared/types';
import { useRideStore } from './rideStore';

interface AuthState {
  user: User | null;
  driver: Driver | null;
  isLoading: boolean;
  error: string | null;
  initAuth: () => Promise<void>;
  login: (phone: string) => Promise<void>;
  loginWithOTP: (phone: string, otp: string) => Promise<void>;
  driverLogin: (phone: string) => Promise<void>;
  driverLoginWithOTP: (phone: string, otp: string) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  driver: null,
  isLoading: true,
  error: null,

  initAuth: async () => {
    try {
      const token = localStorage.getItem('autowala_token');
      const driverToken = localStorage.getItem('autowala_driver_token');
      
      if (token) {
        const response = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          const user = await response.json();
          set({ user, isLoading: false });
          return;
        }
      }
      
      if (driverToken) {
        const response = await fetch('/api/drivers/me', {
          headers: { Authorization: `Bearer ${driverToken}` }
        });
        if (response.ok) {
          const driver = await response.json();
          set({ driver, isLoading: false });
          return;
        }
      }
      
      set({ isLoading: false });
    } catch (error) {
      set({ isLoading: false });
    }
  },

  login: async (phone: string) => {
    set({ error: null });
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to send OTP');
      }
    } catch (error) {
      set({ error: 'Failed to send OTP. Please try again.' });
      throw error;
    }
  },

  loginWithOTP: async (phone: string, otp: string) => {
    set({ error: null });
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp }),
      });
      
      if (!response.ok) {
        throw new Error('Invalid OTP');
      }
      
      const { token, user } = await response.json();
      localStorage.setItem('autowala_token', token);
      set({ user });
    } catch (error) {
      set({ error: 'Invalid OTP. Please try again.' });
      throw error;
    }
  },

  driverLogin: async (phone: string) => {
    set({ error: null });
    try {
      const response = await fetch('/api/drivers/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to send OTP');
      }
    } catch (error) {
      set({ error: 'Failed to send OTP. Please try again.' });
      throw error;
    }
  },

  driverLoginWithOTP: async (phone: string, otp: string) => {
    set({ error: null });
    try {
      const response = await fetch('/api/drivers/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp }),
      });
      
      if (!response.ok) {
        throw new Error('Invalid OTP');
      }
      
      const { token, driver } = await response.json();
      localStorage.setItem('autowala_driver_token', token);
      set({ driver });
    } catch (error) {
      set({ error: 'Invalid OTP. Please try again.' });
      throw error;
    }
  },

  logout: () => {
    useRideStore.getState().clearSelections();
    localStorage.removeItem('autowala_token');
    localStorage.removeItem('autowala_driver_token');
    set({ user: null, driver: null });
  },

  updateUser: (data: Partial<User>) => {
    const { user } = get();
    if (user) {
      set({ user: { ...user, ...data } });
    }
  },
}));
