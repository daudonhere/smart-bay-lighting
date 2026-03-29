'use client';

import { useState } from 'react';
import { BookingForm, BookingList, Sidebar } from '@/components';

export default function Dashboard() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="h-screen flex overflow-hidden bg-[#0a0a0f]">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-zinc-900/50 backdrop-blur-md border-b border-zinc-800 shadow-sm flex-shrink-0">
          <div className="px-8 py-5 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-zinc-100">Booking Dashboard</h2>
              <p className="text-sm text-zinc-500 mt-1">Manage your sports field bookings</p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-500 hover:to-purple-500 transition-all font-medium flex items-center gap-2 hover:scale-105 shadow-lg shadow-blue-500/25"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {showForm ? 'Close' : 'New Booking'}
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          {showForm && (
            <div className="bg-zinc-900/60 backdrop-blur-md rounded-2xl border border-zinc-800 p-8 mb-8 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-zinc-100">Create New Booking</h3>
              </div>
              <BookingForm onSuccess={() => setShowForm(false)} onCancel={() => setShowForm(false)} />
            </div>
          )}

          <div className="bg-zinc-900/60 backdrop-blur-md rounded-2xl border border-zinc-800 shadow-xl">
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
              <h3 className="text-xl font-bold text-zinc-100">Active Bookings</h3>
            </div>
            <div className="p-6">
              <BookingList />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
