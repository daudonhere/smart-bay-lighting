'use client';

import { useState } from 'react';
import { useBays, useCreateBooking } from '@/hooks/useBooking';
import { DateTimePicker, BaySelector } from '.';

interface BookingFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface Bay {
  id: string;
  isActive: boolean;
}

export function BookingForm({ onSuccess, onCancel }: BookingFormProps) {
  const { data: baysData = [] } = useBays();
  const createBooking = useCreateBooking();

  const bays: Bay[] = baysData.map((b: { id: string; isActive: boolean }) => ({
    id: b.id,
    isActive: b.isActive,
  }));

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

    await createBooking.mutateAsync({
      bayId: selectedBay,
      customerName,
      startTime,
      endTime,
    }, {
      onSuccess: () => {
        setSelectedBay('');
        setCustomerName('');
        setStartTime('');
        setEndTime('');
        onSuccess?.();
      },
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

      <div>
        <label className="block text-sm font-semibold text-zinc-400 mb-2">Customer Name</label>
        <input
          type="text"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="Enter customer name"
          className="w-full rounded-xl border border-zinc-700 bg-zinc-800/50 px-4 py-3 text-zinc-100 placeholder-zinc-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-900 outline-none transition-all"
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
          disabled={createBooking.isPending || !selectedBay}
          className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-white font-semibold hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-[1.02] shadow-lg shadow-blue-500/25"
        >
          {createBooking.isPending ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Creating...
            </span>
          ) : (
            'Create Booking'
          )}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 rounded-xl border-2 border-zinc-700 text-zinc-400 font-semibold hover:bg-zinc-800/50 transition-all"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
