// store.ts
import create from "zustand";
import { Profile } from "./types";

interface UserLocation {
  latitude: number;
  longitude: number;
}

export interface NearestUser extends UserLocation {
  id: string; // Assuming IDs are strings, adjust according to your database schema
  display_name: string;
  bio: string;
  latitude: number;
  longitude: number;
}

interface LocationState {
  location: UserLocation | null;
  setLocation: (location: UserLocation) => void;
  nearestUsers: NearestUser[];
  setNearestUsers: (users: NearestUser[]) => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  location: null,
  setLocation: (location) => set({ location }),
  nearestUsers: [],
  setNearestUsers: (users) => set({ nearestUsers: users }),
}));

interface ProfileState {
  profile: Profile;
  setProfile: (profile: Profile) => void;
  updateProfile: (updates: Partial<Profile>) => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: { display_name: "", bio: "", avatar_url: "" },
  setProfile: (profile) => set({ profile }),
  updateProfile: (updates) =>
    set((state) => ({ profile: { ...state.profile, ...updates } })),
}));
