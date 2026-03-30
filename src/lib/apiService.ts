import { api } from './api';
import { Bay, CreateBookingDto, UpdateBookingDto, BookingEventResponse, ApiResponse } from '@/types/booking';

export const bookingApi = {
  getAll: async () => {
    const { data } = await api.get<ApiResponse<BookingEventResponse[]>>('/bookings');
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get<ApiResponse<BookingEventResponse>>(`/bookings?id=${id}`);
    return data;
  },

  create: async (data: CreateBookingDto) => {
    const response = await api.post<ApiResponse<BookingEventResponse>>('/bookings', data);
    return response.data;
  },

  update: async (id: string, data: UpdateBookingDto) => {
    const response = await api.patch<ApiResponse<BookingEventResponse>>('/bookings', { id, ...data });
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete<ApiResponse<BookingEventResponse>>(`/bookings?id=${id}`);
    return response.data;
  },

  deleteAll: async () => {
    const response = await api.delete<ApiResponse<{ deleted: boolean }>>('/bookings');
    return response.data;
  },
};

export const bayApi = {
  getAll: async () => {
    const { data } = await api.get<ApiResponse<Bay[]>>('/bays');
    return data;
  },

  createDefaults: async () => {
    const { data } = await api.post<ApiResponse<{ created: number; bays: string[] }>>('/bays');
    return data;
  },

  deleteAll: async () => {
    const response = await api.delete<ApiResponse<{ deleted: boolean }>>('/bays');
    return response.data;
  },
};
