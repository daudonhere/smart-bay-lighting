import { create } from 'zustand';
import axios from 'axios';
import { CreateBookingDto, UpdateBookingDto } from '@/types/booking';
import { BOOKING_API } from '@/app/api';

interface BookingState {
  error: string | null;
  getBookings: () => Promise<unknown>;
  createBooking: (data: CreateBookingDto) => Promise<unknown>;
  updateBooking: (id: string, data: UpdateBookingDto) => Promise<unknown>;
  deleteBooking: (id: string) => Promise<unknown>;
  deleteAllBookings: () => Promise<unknown>;
}

export const useBookingStore = create<BookingState>((set) => ({
  error: null,

  getBookings: async () => {
    try {
      const response = await axios.get(BOOKING_API.LIST);
      return response.data;
    } catch (error) {
      const message = axios.isAxiosError(error) ? error.response?.data?.error : 'Failed to fetch bookings';
      set({ error: message });
      throw error;
    }
  },

  createBooking: async (data) => {
    try {
      const response = await axios.post(BOOKING_API.CREATE, data);
      return response.data;
    } catch (error) {
      const message = axios.isAxiosError(error) ? error.response?.data?.error : 'Failed to create booking';
      set({ error: message });
      throw error;
    }
  },

  updateBooking: async (id, data) => {
    try {
      const response = await axios.patch(`${BOOKING_API.UPDATE}/${id}`, { id, ...data });
      return response.data;
    } catch (error) {
      const message = axios.isAxiosError(error) ? error.response?.data?.error : 'Failed to update booking';
      set({ error: message });
      throw error;
    }
  },

  deleteBooking: async (id) => {
    try {
      const response = await axios.delete(`${BOOKING_API.DELETE}?id=${id}`);
      return response.data;
    } catch (error) {
      const message = axios.isAxiosError(error) ? error.response?.data?.error : 'Failed to delete booking';
      set({ error: message });
      throw error;
    }
  },

  deleteAllBookings: async () => {
    try {
      const response = await axios.delete(BOOKING_API.DELETE);
      return response.data;
    } catch (error) {
      const message = axios.isAxiosError(error) ? error.response?.data?.error : 'Failed to delete all bookings';
      set({ error: message });
      throw error;
    }
  },
}));
