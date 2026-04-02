'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Topbar, BaySelector, DateTimePicker, BookingList } from '@/components';
import { useBookingStore } from '@/stores/useBookingStore';
import { useBayStore } from '@/stores/useBayStore';
import { CreateBookingDto } from '@/types/booking';
import { 
  Calendar, 
  MapPin, 
  User, 
  Clock, 
  CheckCircle2, 
  X, 
  Plus, 
  LayoutGrid, 
  ClipboardList,
  ChevronRight,
  Loader2,
  Sparkles
} from 'lucide-react';

export default function Dashboard() {
  const queryClient = useQueryClient();
  const getBays = useBayStore((state) => state.getBays);
  const createBooking = useBookingStore((state) => state.createBooking);
  const getBookings = useBookingStore((state) => state.getBookings);
  
  const { data: response, isLoading: baysLoading } = useQuery({
    queryKey: ['bays'],
    queryFn: async () => {
      return getBays() as Promise<{ data: Array<{ id: string; isActive: boolean }> }>;
    },
    staleTime: 0,
    refetchOnMount: true,
  });

  const { data: bookingsResponse } = useQuery({
    queryKey: ['bookings'],
    queryFn: async () => {
      return getBookings() as Promise<{ data: any[] }>;
    },
    staleTime: 0,
  });

  const bays = response?.data || [];
  const existingBookings = bookingsResponse?.data || [];

  const createMutation = useMutation({
    mutationFn: async (data: CreateBookingDto) => {
      return createBooking(data);
    },
    onSuccess: () => {
      setShowBookingForm(false);
      setSelectedBay('');
      setCustomerName('');
      setStartTime('');
      setEndTime('');
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['bays'] });
    },
  });

  const [selectedBay, setSelectedBay] = useState<string>('');
  const [customerName, setCustomerName] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [showBookingForm, setShowBookingForm] = useState(false);

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
    <div className="flex-1 flex flex-col overflow-hidden">
      <Topbar 
        title="Self Booking" 
        subtitle="Reserve your space & control lights" 
      />

      <main className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 max-w-[1600px] mx-auto w-full custom-scrollbar">
        <div className="grid grid-cols-1 gap-8">
          <section className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative bg-[#0a0a0f] border border-zinc-800/50 rounded-3xl p-6 sm:p-8 shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                    <LayoutGrid className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Select Your Bay</h3>
                    <p className="text-sm text-zinc-500">Choose an available spot to begin</p>
                  </div>
                </div>
                {selectedBay && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl animate-in fade-in slide-in-from-right-4">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">{selectedBay} Selected</span>
                  </div>
                )}
              </div>

              {baysLoading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                  <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                  <p className="text-xs font-bold text-zinc-600 uppercase tracking-[0.2em]">Loading Inventory...</p>
                </div>
              ) : (
                <div className="animate-in fade-in duration-700">
                  <BaySelector
                    bays={bays}
                    selectedBay={selectedBay}
                    onSelect={setSelectedBay}
                  />
                </div>
              )}

              {selectedBay && (
                <div className="mt-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <button
                    onClick={() => setShowBookingForm(true)}
                    className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:from-blue-500 hover:to-indigo-500 transition-all hover:scale-[1.01] active:scale-[0.99] shadow-2xl shadow-blue-600/20 flex items-center justify-center gap-3"
                  >
                    <Sparkles className="w-5 h-5" />
                    Book {selectedBay.toUpperCase()} Now
                  </button>
                </div>
              )}
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <ClipboardList className="w-5 h-5 text-indigo-500" />
                <h3 className="text-lg font-bold text-white tracking-tight uppercase tracking-[0.1em]">Booking List</h3>
              </div>
              <div className="h-px flex-1 mx-6 bg-gradient-to-r from-zinc-800 to-transparent"></div>
            </div>
            
            <div className="bg-zinc-900/20 border border-zinc-800/50 rounded-3xl p-2 sm:p-6 backdrop-blur-sm">
              <BookingList />
            </div>
          </section>
        </div>

        {showBookingForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050508]/90 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-[#0a0a0f] border border-zinc-800 rounded-[2.5rem] shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto overflow-x-hidden animate-in zoom-in-95 duration-300 custom-scrollbar">
              <div className="sticky top-0 z-10 bg-[#0a0a0f]/80 backdrop-blur-lg border-b border-zinc-800/50 px-8 py-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                    <Plus className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Booking Details</h3>
                    <p className="text-xs text-zinc-500 font-medium uppercase tracking-widest">Complete your reservation</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-8 sm:p-12 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-xs font-black text-zinc-500 uppercase tracking-[0.2em] px-1">
                      <User className="w-3.5 h-3.5" />
                      Customer Name
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Who is booking?"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-4 px-6 text-white placeholder-zinc-700 focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all text-lg font-medium"
                      required
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-xs font-black text-zinc-500 uppercase tracking-[0.2em] px-1">
                      <MapPin className="w-3.5 h-3.5" />
                      Target Bay
                    </label>
                    <div className="w-full bg-blue-500/5 border border-blue-500/20 rounded-2xl py-4 px-6 text-blue-400 font-black text-xl uppercase tracking-tighter flex items-center justify-between">
                      {selectedBay}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <DateTimePicker
                    label="Start Time"
                    value={startTime}
                    onChange={setStartTime}
                    selectedBayId={selectedBay}
                    existingBookings={existingBookings}
                    type="start"
                  />
                  <DateTimePicker
                    label="End Time"
                    value={endTime}
                    onChange={setEndTime}
                    selectedBayId={selectedBay}
                    existingBookings={existingBookings}
                    type="end"
                    startTimeValue={startTime}
                  />
                </div>

                <div className="pt-6 flex flex-col sm:flex-row gap-4">
                  <button
                    type="button"
                    onClick={() => setShowBookingForm(false)}
                    className="flex-1 py-5 rounded-2xl border border-zinc-800 text-zinc-500 font-bold uppercase tracking-widest hover:bg-zinc-900 hover:text-white transition-all"
                  >
                    Discard
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="flex-[2] py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-blue-600/20 flex items-center justify-center gap-3"
                  >
                    {createMutation.isPending ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        Confirm Reservation
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
