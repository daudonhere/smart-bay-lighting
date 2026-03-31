'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useBookingStore } from '@/stores/useBookingStore';
import { useBayStore } from '@/stores/useBayStore';
import { DateTimePicker, BaySelector } from '.';
import { CreateBookingDto } from '@/types/booking';
import { User, Loader2 } from 'lucide-react';

interface BookingFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface Bay {
  id: string;
  isActive: boolean;
}

export function BookingForm({ onSuccess, onCancel }: BookingFormProps) {
  const queryClient = useQueryClient();
  const getBays = useBayStore((state) => state.getBays);
  const createBooking = useBookingStore((state) => state.createBooking);

  const { data: response } = useQuery({
    queryKey: ['bays'],
    queryFn: async () => {
      return getBays() as Promise<{ data: Bay[] }>;
    },
  });

  const baysData = response?.data || [];
  const bays: Bay[] = baysData.map((b) => ({
    id: b.id,
    isActive: b.isActive,
  }));

  const createMutation = useMutation({
    mutationFn: async (data: CreateBookingDto) => {
      return createBooking(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      setSelectedBay('');
      setCustomerName('');
      setStartTime('');
      setEndTime('');
      onSuccess?.();
    },
  });

  const [selectedBay, setSelectedBay] = useState<string>('');
  const [customerName, setCustomerName] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const minDateTime = new Date();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBay || !customerName || !startTime || !endTime) {
      return;
    }

    createMutation.mutate({
      bayId: selectedBay,
      customerName,
      startTime,
      endTime,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-zinc-400 mb-3">Select Bay</label>
        <BaySelector
          bays={bays}
          selectedBay={selectedBay}
          onSelect={setSelectedBay}
        />
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2 text-xs font-black text-zinc-500 uppercase tracking-[0.2em] px-1">
          <User className="w-3 h-3" />
          Customer Name
        </label>
        <input
          type="text"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="Enter customer name"
          className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-5 py-4 text-white placeholder-zinc-700 focus:outline-none focus:border-blue-500/50 transition-all"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DateTimePicker
          label="Start Time"
          value={startTime}
          onChange={setStartTime}
          minDate={minDateTime}
        />
        <DateTimePicker
          label="End Time"
          value={endTime}
          onChange={setEndTime}
          minDate={startTime ? new Date(startTime) : minDateTime}
        />
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={createMutation.isPending || !selectedBay}
          className="flex-1 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-white font-bold hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-[1.02] shadow-lg shadow-blue-600/20"
        >
          {createMutation.isPending ? (
            <span className="flex items-center justify-center gap-2 uppercase tracking-widest text-xs font-black">
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating...
            </span>
          ) : (
            <span className="uppercase tracking-widest text-xs font-black">Create Booking</span>
          )}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-4 rounded-2xl border border-zinc-800 text-zinc-500 font-bold uppercase tracking-widest text-xs hover:bg-zinc-900 transition-all"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
