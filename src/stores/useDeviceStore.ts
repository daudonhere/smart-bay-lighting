import { create } from 'zustand';
import axios from 'axios';
import { DEVICE_API } from '@/app/api';

interface DeviceState {
  isSyncing: boolean;
  isSendingControl: boolean;
  error: string | null;
  syncDevice: (data?: unknown) => Promise<unknown>;
  getDeviceInfo: () => Promise<unknown>;
  sendControl: (command: string, bayId?: string) => Promise<unknown>;
}

export const useDeviceStore = create<DeviceState>((set) => ({
  isSyncing: false,
  isSendingControl: false,
  error: null,

  syncDevice: async (data) => {
    set({ isSyncing: true, error: null });
    try {
      const response = data 
        ? await axios.put(DEVICE_API.SYNC, data)
        : await axios.get(DEVICE_API.SYNC);
      set({ isSyncing: false });
      return response.data;
    } catch (error) {
      const message = axios.isAxiosError(error) ? error.response?.data?.error : 'Sync failed';
      set({ isSyncing: false, error: message });
      throw error;
    }
  },

  getDeviceInfo: async () => {
    try {
      const response = await axios.get(DEVICE_API.INFO);
      return response.data;
    } catch (error) {
      const message = axios.isAxiosError(error) ? error.response?.data?.error : 'Failed to get device info';
      set({ error: message });
      throw error;
    }
  },

  sendControl: async (command, bayId) => {
    set({ isSendingControl: true, error: null });
    try {
      const response = await axios.post(DEVICE_API.CONTROL, { command, bay_id: bayId });
      set({ isSendingControl: false });
      return response.data;
    } catch (error) {
      const message = axios.isAxiosError(error) ? error.response?.data?.error : 'Control command failed';
      set({ isSendingControl: false, error: message });
      throw error;
    }
  },
}));
