'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components';

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
  {
    method: 'POST',
    path: '/api/mqtt/command',
    summary: 'Send MQTT command to ESP32',
    body: {
      command: 'turn_on',
      bay_id: 'bay-01',
    },
    note: 'Commands: turn_on, turn_off, reset_error. Bay IDs: bay-01, bay-02, bay-03',
    response: {
      description: 'Returns command confirmation',
      example: {
        success: true,
        message: "Command 'turn_on' sent to bay-01",
        data: {
          command: 'turn_on',
          bay_id: 'bay-01',
        },
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
      <Sidebar />

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
