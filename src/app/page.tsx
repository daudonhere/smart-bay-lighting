'use client';

import { useState, useEffect } from 'react';
import { Sidebar, BaySelector, DateTimePicker, BookingList } from '@/components';
import { useBays, useCreateBooking } from '@/hooks/useBooking';
import { useMqtt } from '@/contexts/MqttContext';

export default function Dashboard() {
  const { data: bays = [], isLoading: baysLoading, refetch: refetchBays } = useBays();
  const createBooking = useCreateBooking();
  const { lastStatus } = useMqtt();
  const [selectedBay, setSelectedBay] = useState<string>('');
  const [customerName, setCustomerName] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (lastStatus?.result?.data) {
      refetchBays();
    }
  }, [lastStatus, refetchBays]);

  const minDateTime = new Date();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBay || !customerName || !startTime || !endTime) {
      return;
    }

    setIsSubmitting(true);
    createBooking.mutate(
      {
        bayId: selectedBay,
        customerName,
        startTime,
        endTime,
      },
      {
        onSuccess: () => {
          setShowBookingForm(false);
          setSelectedBay('');
          setCustomerName('');
          setStartTime('');
          setEndTime('');
          refetchBays();
        },
        onError: () => {
          setIsSubmitting(false);
        },
      }
    );
  };

  return (
    <div className="h-screen flex overflow-hidden bg-[#0a0a0f]">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-zinc-900/50 backdrop-blur-md border-b border-zinc-800 shadow-sm flex-shrink-0">
          <div className="px-8 py-5">
            <h2 className="text-2xl font-bold text-zinc-100">Self Booking</h2>
            <p className="text-sm text-zinc-500 mt-1">Select your bay and book your session</p>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="bg-zinc-900/60 backdrop-blur-md rounded-2xl border border-zinc-800 p-8 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-zinc-100">Select Your Bay</h3>
                  <p className="text-sm text-zinc-500">Choose an available bay for your session</p>
                </div>
              </div>

              {baysLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-zinc-800 border-t-blue-500"></div>
                </div>
              ) : (
                <BaySelector
                  bays={bays}
                  selectedBay={selectedBay}
                  onSelect={setSelectedBay}
                />
              )}

              {selectedBay && (
                <div className="mt-6">
                  <button
                    onClick={() => setShowBookingForm(true)}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-500 hover:to-purple-500 font-semibold transition-all hover:scale-[1.02] shadow-lg shadow-blue-500/25"
                  >
                    Book This Bay
                  </button>
                </div>
              )}
            </div>

            <div className="bg-zinc-900/60 backdrop-blur-md rounded-2xl border border-zinc-800 shadow-xl">
              <div className="p-6 border-b border-zinc-800">
                <h3 className="text-xl font-bold text-zinc-100">BOOKING LIST</h3>
              </div>
              <div className="p-6">
                <BookingList />
              </div>
            </div>
          </div>

          {showBookingForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-12 shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
                <div className="flex items-center gap-3 mb-10">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-zinc-100">Booking Details</h3>
                    <p className="text-sm text-zinc-500">Complete your booking for {selectedBay}</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 pb-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-zinc-400 mb-2">Customer Name</label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Enter your name"
                        className="w-full rounded-xl border border-zinc-700 bg-zinc-800/50 px-4 py-3 text-zinc-100 placeholder-zinc-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-900 outline-none transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-zinc-400 mb-2">Selected Bay</label>
                      <div className="w-full rounded-xl border border-zinc-700 bg-zinc-800/50 px-4 py-3 text-zinc-100 uppercase">
                        {selectedBay.toUpperCase()}
                      </div>
                    </div>
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

                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowBookingForm(false)}
                      className="flex-1 py-3 rounded-xl border border-zinc-700 bg-zinc-800/50 text-zinc-300 font-semibold hover:bg-zinc-800 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all hover:scale-[1.02] shadow-lg shadow-blue-500/25"
                    >
                      {isSubmitting ? 'Booking...' : 'Confirm Booking'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
