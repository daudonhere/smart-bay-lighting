import { create } from 'zustand';
import axios from 'axios';
import { BAY_API } from '@/app/api';

interface BayState {
  error: string | null;
  getBays: () => Promise<unknown>;
  updateBay: (id: string, isActive: boolean) => Promise<unknown>;
  deleteBay: (id: string) => Promise<unknown>;
  deleteAllBays: () => Promise<unknown>;
}

export const useBayStore = create<BayState>((set) => ({
  error: null,

  getBays: async () => {
    try {
      const response = await axios.get(BAY_API.LIST);
      return response.data;
    } catch (error) {
      const message = axios.isAxiosError(error) ? error.response?.data?.error : 'Failed to fetch bays';
      set({ error: message });
      throw error;
    }
  },

  updateBay: async (id, isActive) => {
    try {
      const response = await axios.put(BAY_API.UPDATE, { id, isActive });
      return response.data;
    } catch (error) {
      const message = axios.isAxiosError(error) ? error.response?.data?.error : 'Failed to update bay';
      set({ error: message });
      throw error;
    }
  },

  deleteBay: async (id) => {
    try {
      const response = await axios.delete(`${BAY_API.DELETE}?id=${id}`);
      return response.data;
    } catch (error) {
      const message = axios.isAxiosError(error) ? error.response?.data?.error : 'Failed to delete bay';
      set({ error: message });
      throw error;
    }
  },

  deleteAllBays: async () => {
    try {
      const response = await axios.delete(BAY_API.DELETE);
      return response.data;
    } catch (error) {
      const message = axios.isAxiosError(error) ? error.response?.data?.error : 'Failed to delete all bays';
      set({ error: message });
      throw error;
    }
  },
}));
