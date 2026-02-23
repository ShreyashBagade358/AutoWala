import { create } from 'zustand';
import { Ride, Zone } from '@shared/types';

interface RideState {
  currentRide: Ride | null;
  recentRides: Ride[];
  availableZones: Zone[];
  selectedPickup: Zone | null;
  selectedDrop: Zone | null;
  estimatedFare: number | null;
  isLoading: boolean;
  error: string | null;
  
  setSelectedPickup: (zone: Zone | null) => void;
  setSelectedDrop: (zone: Zone | null) => void;
  fetchZones: () => Promise<void>;
  createRide: (pickupId: string, dropId: string) => Promise<void>;
  fetchRideStatus: (rideId: string) => Promise<void>;
  cancelRide: (rideId: string) => Promise<void>;
  fetchRecentRides: () => Promise<void>;
  clearSelections: () => void;
}

export const useRideStore = create<RideState>((set, get) => ({
  currentRide: null,
  recentRides: [],
  availableZones: [],
  selectedPickup: null,
  selectedDrop: null,
  estimatedFare: null,
  isLoading: false,
  error: null,

  setSelectedPickup: (zone) => {
    set({ selectedPickup: zone });
    const { selectedDrop } = get();
    if (zone && selectedDrop) {
      get().createRide(zone.id, selectedDrop.id);
    }
  },

  setSelectedDrop: (zone) => {
    set({ selectedDrop: zone });
    const { selectedPickup } = get();
    if (zone && selectedPickup) {
      get().createRide(selectedPickup.id, zone.id);
    }
  },

  fetchZones: async () => {
    set({ isLoading: true });
    try {
      const response = await fetch('/api/zones');
      const zones = await response.json();
      set({ availableZones: zones, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to load zones', isLoading: false });
    }
  },

  createRide: async (pickupId: string, dropId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/rides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pickupZoneId: pickupId, dropZoneId: dropId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create ride');
      }
      
      const ride = await response.json();
      set({ currentRide: ride, estimatedFare: ride.estimatedFare, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to create ride', isLoading: false });
    }
  },

  fetchRideStatus: async (rideId: string) => {
    try {
      const response = await fetch(`/api/rides/${rideId}`);
      if (response.ok) {
        const ride = await response.json();
        set({ currentRide: ride });
      }
    } catch (error) {
      console.error('Failed to fetch ride status:', error);
    }
  },

  cancelRide: async (rideId: string) => {
    try {
      await fetch(`/api/rides/${rideId}/cancel`, { method: 'POST' });
      set({ currentRide: null, selectedPickup: null, selectedDrop: null, estimatedFare: null });
    } catch (error) {
      set({ error: 'Failed to cancel ride' });
    }
  },

  clearSelections: () => set({ selectedPickup: null, selectedDrop: null, estimatedFare: null, currentRide: null }),

  fetchRecentRides: async () => {
    set({ isLoading: true });
    try {
      const response = await fetch('/api/rides/recent');
      if (response.ok) {
        const rides = await response.json();
        set({ recentRides: rides, isLoading: false });
      }
    } catch (error) {
      set({ isLoading: false });
    }
  },
}));
