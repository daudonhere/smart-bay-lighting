'use client';

import { useState } from 'react';
import { useBays, useCreateBooking } from '@/hooks/useBooking';

interface BookingFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function BookingForm({ onSuccess, onCancel }: BookingFormProps) {
  const { data: bays = [] } = useBays();
  const createBooking = useCreateBooking();

  const [formData, setFormData] = useState({
    bayId: '',
    customerName: '',
    startTime: '',
    endTime: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createBooking.mutateAsync(formData, {
      onSuccess: () => {
        setFormData({ bayId: '', customerName: '', startTime: '', endTime: '' });
        onSuccess?.();
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">Bay</label>
          <select
            value={formData.bayId}
            onChange={(e) => setFormData({ ...formData, bayId: e.target.value })}
            className="w-full rounded-xl border border-slate-600 bg-slate-600/30 px-4 py-3 text-slate-100 focus:border-slate-400 focus:ring-2 focus:ring-slate-700 outline-none transition-all"
            required
          >
            <option value="">Select a bay</option>
            {bays.map((bay) => (
              <option key={bay.id} value={bay.id}>
                {bay.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">Customer Name</label>
          <input
            type="text"
            value={formData.customerName}
            onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
            placeholder="Enter customer name"
            className="w-full rounded-xl border border-slate-600 bg-slate-600/30 px-4 py-3 text-slate-100 placeholder-slate-500 focus:border-slate-400 focus:ring-2 focus:ring-slate-700 outline-none transition-all"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">Start Time</label>
          <input
            type="datetime-local"
            value={formData.startTime}
            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
            className="w-full rounded-xl border border-slate-600 bg-slate-600/30 px-4 py-3 text-slate-100 focus:border-slate-400 focus:ring-2 focus:ring-slate-700 outline-none transition-all"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">End Time</label>
          <input
            type="datetime-local"
            value={formData.endTime}
            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
            className="w-full rounded-xl border border-slate-600 bg-slate-600/30 px-4 py-3 text-slate-100 focus:border-slate-400 focus:ring-2 focus:ring-slate-700 outline-none transition-all"
            required
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={createBooking.isPending}
          className="flex-1 rounded-xl bg-slate-600 px-6 py-3 text-white font-semibold hover:bg-slate-500 disabled:opacity-50 transition-all hover:scale-[1.02]"
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
            className="px-6 py-3 rounded-xl border-2 border-slate-600 text-slate-300 font-semibold hover:bg-slate-600/30 transition-all"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
