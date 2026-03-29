'use client';

import { useState, useEffect } from 'react';

const endpoints: Endpoint[] = [
  {
    method: 'GET',
    path: '/api/bookings',
    summary: 'Get all bookings',
    body: null,
    response: {
      description: 'Returns array of bookings',
      example: {
        success: true,
        data: [
          {
            event: 'booking_started',
            booking_id: 'cm3qk1234',
            bay_id: 'bay-01',
            customer: 'John Doe',
            start_time: '2026-03-28T10:00:00.000Z',
            end_time: '2026-03-28T11:00:00.000Z',
          },
        ],
        count: 1,
      },
    },
  },
  {
    method: 'POST',
    path: '/api/bookings',
    summary: 'Create booking',
    body: {
      bayId: 'bay-01',
      customerName: 'John Doe',
      startTime: '2026-03-28T10:00',
      endTime: '2026-03-28T11:00',
    },
    response: {
      description: 'Returns booking event',
      example: {
        success: true,
        data: {
          event: 'booking_started',
          booking_id: 'cm3qk1234',
          bay_id: 'bay-01',
          customer: 'John Doe',
          start_time: '2026-03-28T10:00:00.000Z',
          end_time: '2026-03-28T11:00:00.000Z',
        },
      },
    },
  },
  {
    method: 'GET',
    path: '/api/bookings?id=',
    summary: 'Get booking by ID',
    body: null,
    note: 'Add booking ID after path',
    response: {
      description: 'Returns single booking or 404',
      example: {
        success: true,
        data: {
          event: 'booking_started',
          booking_id: 'cm3qk1234',
          bay_id: 'bay-01',
          customer: 'John Doe',
          start_time: '2026-03-28T10:00:00.000Z',
          end_time: '2026-03-28T11:00:00.000Z',
        },
      },
    },
  },
  {
    method: 'PUT',
    path: '/api/bookings',
    summary: 'Update booking',
    body: {
      id: 'cm3qk1234',
      status: 'completed',
    },
    note: 'Include id and fields to update (status: active/completed/cancelled, endTime, etc)',
    response: {
      description: 'Returns updated booking event',
      example: {
        success: true,
        data: {
          event: 'booking_ended',
          booking_id: 'cm3qk1234',
          bay_id: 'bay-01',
          customer: 'John Doe',
          start_time: '2026-03-28T10:00:00.000Z',
          end_time: '2026-03-28T11:00:00.000Z',
        },
      },
    },
  },
  {
    method: 'DELETE',
    path: '/api/bookings?id=',
    summary: 'Delete booking',
    body: null,
    note: 'Add booking ID after path',
    response: {
      description: 'Returns deleted booking event',
      example: {
        success: true,
        data: {
          event: 'booking_ended',
          booking_id: 'cm3qk1234',
          bay_id: 'bay-01',
          customer: 'John Doe',
          start_time: '2026-03-28T10:00:00.000Z',
          end_time: '2026-03-28T11:00:00.000Z',
        },
      },
    },
  },
  {
    method: 'GET',
    path: '/api/bays',
    summary: 'Get all bays',
    body: null,
    response: {
      description: 'Returns array of bays',
      example: {
        success: true,
        data: [
          {
            id: 'bay-01',
            name: 'bay-01',
            isActive: true,
            createdAt: '2026-03-28T08:00:00.000Z',
            updatedAt: '2026-03-28T08:00:00.000Z',
          },
        ],
        count: 8,
      },
    },
  },
  {
    method: 'POST',
    path: '/api/bays',
    summary: 'Create bays',
    body: {
      bays: ['bay-01', 'bay-02', 'bay-03'],
    },
    note: 'Leave body empty for default 8 bays, or provide custom bay names array',
    response: {
      description: 'Returns created bays count',
      example: {
        success: true,
        data: {
          created: 3,
          bays: ['bay-01', 'bay-02', 'bay-03'],
        },
      },
    },
  },
  {
    method: 'DELETE',
    path: '/api/bays',
    summary: 'Delete all bays',
    body: null,
    response: {
      description: 'Returns confirmation of deletion',
      example: {
        success: true,
        message: 'All bays deleted',
        data: { deleted: true },
      },
    },
  },
  {
    method: 'DELETE',
    path: '/api/bookings',
    summary: 'Delete all bookings',
    body: null,
    response: {
      description: 'Returns confirmation of deletion',
      example: {
        success: true,
        message: 'All bookings deleted',
        data: { deleted: true },
      },
    },
  },
];

interface ResponseData {
  status?: number;
  data?: unknown;
  error?: string;
  time?: string;
}

interface Endpoint {
  method: string;
  path: string;
  summary: string;
  body: Record<string, unknown> | null;
  note?: string;
  response?: {
    description: string;
    example: unknown;
  };
}

export default function ApiDocs() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<number>(-1);
  const [customBody, setCustomBody] = useState('');
  const [bookingId, setBookingId] = useState('');
  const [response, setResponse] = useState<ResponseData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setSelectedEndpoint(0);
  }, []);

  const endpoint = endpoints[selectedEndpoint] || endpoints[0];

  const handleSend = async () => {
    setIsLoading(true);
    setResponse(null);
    const startTime = Date.now();

    try {
      let path = endpoint?.path || '';
      
      if (endpoint?.path.includes('id=') && bookingId) {
        path = `${endpoint.path}${bookingId}`;
      }
      
      const options: RequestInit = {
        method: endpoint?.method,
        headers: { 'Content-Type': 'application/json' },
      };

      if (endpoint?.method === 'POST' || endpoint?.method === 'PUT') {
        const bodyData = customBody ? JSON.parse(customBody) : endpoint.body;
        options.body = JSON.stringify(bodyData);
      }

      const res = await fetch(path, options);
      const data = await res.json();

      setResponse({
        status: res.status,
        data,
        time: `${Date.now() - startTime}ms`,
      });
    } catch (err) {
      setResponse({
        error: err instanceof Error ? err.message : 'Unknown error',
        time: `${Date.now() - startTime}ms`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const methodColors: Record<string, string> = {
    get: 'bg-green-600 text-white',
    post: 'bg-yellow-600 text-white',
    put: 'bg-yellow-600 text-white',
    delete: 'bg-red-600 text-white',
  };

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
            href="/"
            className="group flex items-center px-4 py-3 rounded-xl text-zinc-400 hover:bg-zinc-800/50 transition-all hover:scale-[1.02]"
          >
            <svg className="w-5 h-5 mr-3 text-zinc-600 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="font-medium">Dashboard</span>
          </a>
          <a
            href="/monitoring"
            className="group flex items-center px-4 py-3 rounded-xl text-zinc-400 hover:bg-zinc-800/50 transition-all hover:scale-[1.02]"
          >
            <svg className="w-5 h-5 mr-3 text-zinc-600 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="font-medium">Monitoring</span>
          </a>
          <a
            href="/docs"
            className="group flex items-center px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600/90 to-purple-600/90 text-white shadow-lg shadow-blue-500/20 transition-all hover:from-blue-600 hover:to-purple-600 hover:scale-[1.02]"
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="font-medium">API Docs</span>
          </a>
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <div className="bg-gradient-to-br from-blue-600/50 to-purple-600/50 rounded-xl p-4 text-white border border-blue-500/30">
            <p className="text-sm font-medium">API Tester</p>
            <p className="text-xs opacity-80 mt-1">Test endpoints directly</p>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-zinc-900/50 backdrop-blur-md border-b border-zinc-800 shadow-sm flex-shrink-0">
          <div className="px-8 py-5">
            <h2 className="text-2xl font-bold text-zinc-100">API Documentation</h2>
            <p className="text-sm text-zinc-500 mt-1">Test Smart Bay Booking API endpoints directly from your browser</p>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600/50 to-purple-600/50 flex items-center justify-center border border-blue-500/30">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-zinc-100">Endpoints</h3>
              </div>
              {endpoints.map((ep, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedEndpoint(idx);
                    setCustomBody(ep.body ? JSON.stringify(ep.body, null, 2) : '');
                    setBookingId('');
                    setResponse(null);
                  }}
                  className={`w-full text-left p-4 rounded-xl border transition-all hover:scale-[1.02] ${
                    selectedEndpoint === idx
                      ? 'border-zinc-700 bg-zinc-800/50 shadow-lg shadow-blue-500/10'
                      : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`px-2 py-1 rounded-md text-xs font-bold uppercase shadow-sm ${
                        methodColors[ep.method.toLowerCase()]
                      }`}
                    >
                      {ep.method}
                    </span>
                    <code className="text-sm text-zinc-400 font-mono bg-zinc-800/50 px-2 py-1 rounded">{ep.path}</code>
                  </div>
                  <p className="text-sm text-zinc-500 font-medium">{ep.summary}</p>
                  {ep.note && (
                    <p className="text-xs text-amber-500 mt-2 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      {ep.note}
                    </p>
                  )}
                </button>
              ))}
            </div>

            <div className="space-y-4" suppressHydrationWarning>
              {isMounted && (
                <>
                  <div className="bg-zinc-900/60 backdrop-blur-md rounded-xl border border-zinc-800 p-6 shadow-xl">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600/50 to-purple-600/50 flex items-center justify-center border border-blue-500/30">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-bold text-zinc-100">Request</h3>
                    </div>
                    <div className="flex items-center gap-2 mb-4 p-3 bg-zinc-800/50 rounded-lg border border-zinc-800">
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                          methodColors[endpoint.method.toLowerCase()]
                        }`}
                      >
                        {endpoint.method}
                      </span>
                      <code className="text-sm text-zinc-400 font-mono">
                        {endpoint.path}
                      </code>
                    </div>

                    {endpoint.path.includes('id=') && (
                      <div className="mb-4">
                        <label className="block text-sm font-semibold text-zinc-400 mb-2">
                          Booking ID
                        </label>
                        <input
                          type="text"
                          value={bookingId}
                          onChange={(e) => setBookingId(e.target.value)}
                          placeholder="Enter booking ID (e.g., cm3qk...)"
                          className="w-full rounded-xl border border-zinc-700 bg-zinc-800/50 px-4 py-3 font-mono text-sm text-zinc-100 placeholder-zinc-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-900 outline-none transition-all"
                        />
                      </div>
                    )}

                    {(endpoint.method === 'POST' || endpoint.method === 'PUT') && (
                      <div>
                        <label className="block text-sm font-semibold text-zinc-400 mb-2">
                          Request Body (JSON)
                        </label>
                        <textarea
                          value={customBody}
                          onChange={(e) => setCustomBody(e.target.value)}
                          className="w-full h-36 rounded-xl border border-zinc-700 bg-zinc-800/50 px-4 py-3 font-mono text-sm text-zinc-100 placeholder-zinc-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-900 outline-none transition-all"
                        />
                      </div>
                    )}

                    <button
                      onClick={handleSend}
                      disabled={isLoading}
                      className="mt-4 w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all hover:scale-[1.02] cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25"
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Sending...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          Send Request
                        </>
                      )}
                    </button>
                  </div>

                  {endpoint.response && (
                    <div className="bg-zinc-900/60 backdrop-blur-md rounded-xl border border-zinc-800 p-6 shadow-xl">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600/50 to-purple-600/50 flex items-center justify-center border border-blue-500/30">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-bold text-zinc-100">Expected Response</h3>
                      </div>
                      <p className="text-sm text-zinc-500 mb-3">{endpoint.response.description}</p>
                      <pre className="bg-zinc-950 text-zinc-100 rounded-xl p-4 text-xs overflow-auto max-h-64 font-mono border border-zinc-800">
                        {JSON.stringify(endpoint.response.example, null, 2)}
                      </pre>
                    </div>
                  )}

                  {response && (
                    <div className="bg-zinc-900/60 backdrop-blur-md rounded-xl border border-zinc-800 p-6 shadow-xl">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600/50 to-purple-600/50 flex items-center justify-center border border-blue-500/30">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-bold text-zinc-100">Response</h3>
                      </div>
                      <div className="flex items-center gap-4 mb-4">
                        <span
                          className={`px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm ${
                            response.status && response.status >= 200 && response.status < 300
                              ? 'bg-green-600 text-white'
                              : response.status
                                ? 'bg-red-600 text-white'
                                : 'bg-zinc-700 text-white'
                          }`}
                        >
                          {response.status || 'Error'}
                        </span>
                        {response.time && (
                          <span className="text-sm text-zinc-500 bg-zinc-800/50 px-3 py-1.5 rounded-lg border border-zinc-800">
                            ⏱ {response.time}
                          </span>
                        )}
                      </div>
                      <pre className="bg-zinc-950 text-zinc-100 rounded-xl p-4 text-xs overflow-auto max-h-80 font-mono border border-zinc-800">
                        {JSON.stringify(response.data || { error: response.error }, null, 2)}
                      </pre>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
