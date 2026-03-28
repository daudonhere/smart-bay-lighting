'use client';

import { useState } from 'react';
import { BookingForm, BookingList } from '@/components';
import { useBays } from '@/hooks/useBooking';

export default function Dashboard() {
  const [showForm, setShowForm] = useState(false);
  const { data: bays = [], isLoading } = useBays();

  const activeBays = bays.filter((b) => b.isActive).length;

  return (
    <div className="h-screen flex overflow-hidden bg-[#0a0a0f]">
      <aside className="w-72 bg-zinc-900/80 backdrop-blur-md border-r border-zinc-800 shadow-xl flex flex-col z-10">
        <div className="p-6 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Smart Bay
              </h1>
              <p className="text-xs text-zinc-500">Sports Lighting</p>
            </div>
          </div>
        </div>

        <nav className="mt-6 px-4 flex-1 space-y-2">
          <a
            href="#"
            className="group flex items-center px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600/90 to-purple-600/90 text-white shadow-lg shadow-blue-500/20 transition-all hover:from-blue-600 hover:to-purple-600 hover:scale-[1.02]"
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="font-medium">Dashboard</span>
          </a>
          <a
            href="/docs"
            className="group flex items-center px-4 py-3 rounded-xl text-zinc-400 hover:bg-zinc-800/50 transition-all hover:scale-[1.02]"
          >
            <svg className="w-5 h-5 mr-3 text-zinc-600 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="font-medium">API Docs</span>
          </a>
        </nav>
      </aside>

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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="group bg-zinc-900/60 backdrop-blur-md rounded-2xl p-6 border border-zinc-800 shadow-lg hover:shadow-xl hover:shadow-blue-500/10 transition-all hover:scale-[1.02]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-500 font-medium">Total Bays</p>
                  <p className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mt-2">
                    {isLoading ? '-' : bays.length}
                  </p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="group bg-zinc-900/60 backdrop-blur-md rounded-2xl p-6 border border-zinc-800 shadow-lg hover:shadow-xl hover:shadow-blue-500/10 transition-all hover:scale-[1.02]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-500 font-medium">Active Bays</p>
                  <p className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mt-2">
                    {activeBays}
                  </p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="group bg-zinc-900/60 backdrop-blur-md rounded-2xl p-6 border border-zinc-800 shadow-lg hover:shadow-xl hover:shadow-blue-500/10 transition-all hover:scale-[1.02]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-500 font-medium">Status</p>
                  <p className="text-xl font-bold text-zinc-100 mt-2">
                    {isLoading ? (
                      <span className="animate-pulse">Loading...</span>
                    ) : (
                      <span className="text-green-400">● Ready</span>
                    )}
                  </p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

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
              <h3 className="text-xl font-bold text-zinc-100">All Bookings</h3>
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
