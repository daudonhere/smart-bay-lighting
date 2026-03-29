import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingApi, bayApi } from '@/lib/apiService';
import { CreateBookingDto, UpdateBookingDto, BookingEventResponse, ApiResponse, Bay } from '@/types/booking';

export function useBookings() {
  return useQuery({
    queryKey: ['bookings'],
    queryFn: async () => {
      const response = await bookingApi.getAll();
      return response.data || [];
    },
  });
}

export function useBays() {
  return useQuery({
    queryKey: ['bays'],
    queryFn: async () => {
      const response = await bayApi.getAll();
      return response.data || [];
    },
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateBookingDto) => {
      const response = await bookingApi.create(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

export function useUpdateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateBookingDto }) => {
      const response = await bookingApi.update(id, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

export function useDeleteBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await bookingApi.delete(id);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

export function useDeleteAllBookings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await bookingApi.deleteAll();
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

export function useDeleteAllBays() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await bayApi.deleteAll();
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bays'] });
    },
  });
}
