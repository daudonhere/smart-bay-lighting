'use client';

import { useState } from 'react';
import { Sidebar, Topbar } from '@/components';
import { DEVICE_API, BOOKING_API, BAY_API } from '@/app/api';
import { useMqtt } from '@/providers/MqttProvider';
import {
  Layers,
  Cpu,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  Hash,
  Terminal,
  Activity,
  Trash2,
  Plus,
  RefreshCw,
  Edit3,
  Monitor,
  Code,
  X,
  Wifi,
  WifiOff
} from 'lucide-react';

interface Endpoint {
  method: string;
  path: string;
  summary: string;
  description?: string;
  body: Record<string, unknown> | null;
  note?: string;
  response?: {
    description: string;
    example: unknown;
  };
}

interface ResponseData {
  status?: number;
  data?: unknown;
  error?: string;
  time?: string;
}

interface EndpointCategory {
  title: string;
  description: string;
  icon: React.ReactNode;
  endpoints: Endpoint[];
}

const endpointCategories: EndpointCategory[] = [
  {
    title: 'Booking Management',
    description: 'Endpoints for managing parking bay bookings',
    icon: <Layers className="w-5 h-5" />,
    endpoints: [
      {
        method: 'GET',
        path: BOOKING_API.LIST,
        summary: 'Get all bookings',
        body: null,
        response: {
          description: 'Returns array of bookings',
          example: {
            success: true,
            data: [
              {
                event: 'booking_created',
                booking_id: 'cm3qk1234',
                bay_id: 'bay-01',
                customer: 'John Doe',
                start_time: '2026-03-28T10:00:00.000Z',
                end_time: '2026-03-28T11:00:00.000Z',
                status: 'created',
              },
            ],
            count: 1,
          },
        },
      },
      {
        method: 'POST',
        path: BOOKING_API.CREATE,
        summary: 'Create booking',
        description: 'Create new booking. Lamp will auto-turn-on 30 seconds before start_time via scheduler.',
        body: {
          bayId: 'bay-01',
          customerName: 'John Doe',
          startTime: '2026-03-28T10:00:00',
          endTime: '2026-03-28T11:00:00',
        },
        response: {
          description: 'Returns booking_created event',
          example: {
            success: true,
            message: 'Booking created. Lamp will turn on 30 seconds before start time.',
            data: {
              event: 'booking_created',
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
        method: 'PATCH',
        path: BOOKING_API.UPDATE + '/',
        summary: 'Extend booking',
        description: 'Extend active booking by 1 hour or custom end time.',
        body: {
          id: 'cm3qk1234',
          endTime: '2026-03-28T12:00:00',
        },
        note: 'Extend only allowed if > 5 minutes before end time. Path must include booking ID (e.g., /api/booking/update/cm3qk1234).',
        response: {
          description: 'Returns booking_extended event',
          example: {
            success: true,
            message: 'Booking extended',
            data: {
              event: 'booking_extended',
              booking_id: 'cm3qk1234',
              bay_id: 'bay-01',
              customer: 'John Doe',
              start_time: '2026-03-28T10:00:00.000Z',
              end_time: '2026-03-28T12:00:00.000Z',
            },
          },
        },
      },
      {
        method: 'DELETE',
        path: BOOKING_API.DELETE + '?id=',
        summary: 'Cancel booking',
        body: null,
        note: 'Add booking ID after path (e.g., /api/booking/delete?id=cm3qk1234). Booking status will be set to cancelled, not permanently deleted.',
        response: {
          description: 'Returns booking_ended event',
          example: {
            success: true,
            message: 'Booking cancelled',
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
        path: BOOKING_API.DELETE,
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
    ],
  },
  {
    title: 'Bay Management',
    description: 'Endpoints for managing parking bays',
    icon: <Monitor className="w-5 h-5" />,
    endpoints: [
      {
        method: 'GET',
        path: BAY_API.LIST,
        summary: 'Get all bays',
        body: null,
        response: {
          description: 'Returns array of bays from database with current booking status',
          example: {
            success: true,
            data: [
              {
                id: 'bay-01',
                relayPin: 4,
                isActive: false,
                hasActiveBooking: false,
                currentBooking: null,
                createdAt: '2026-03-28T08:00:00.000Z',
                updatedAt: '2026-03-28T08:00:00.000Z',
              },
            ],
            count: 3,
          },
        },
      },
      {
        method: 'PUT',
        path: BAY_API.UPDATE,
        summary: 'Update bay status',
        description: 'Update physical status (isActive) of a bay manually.',
        body: {
          id: 'bay-01',
          isActive: true,
        },
        response: {
          description: 'Returns the updated bay object',
          example: {
            success: true,
            data: {
              id: 'bay-01',
              relayPin: 4,
              isActive: true,
              createdAt: '2026-03-28T08:00:00.000Z',
              updatedAt: '2026-03-31T08:00:00.000Z',
            },
          },
        },
      },
      {
        method: 'DELETE',
        path: BAY_API.DELETE + '?id=',
        summary: 'Delete bay by ID',
        body: null,
        note: 'Add bay ID after path (e.g., /api/bay/delete?id=bay-01)',
        response: {
          description: 'Returns confirmation of deletion',
          example: {
            success: true,
            message: "Bay 'bay-01' deleted",
            data: { deleted: true, id: 'bay-01' },
          },
        },
      },
      {
        method: 'DELETE',
        path: BAY_API.DELETE,
        summary: 'Delete all bays',
        body: null,
        response: {
          description: 'Returns confirmation of deletion',
          example: {
            success: true,
            message: 'All 3 bays deleted',
            data: { deleted: true, count: 3 },
          },
        },
      },
    ],
  },
  {
    title: 'Device & Control',
    description: 'Endpoints for ESP32 device management and control',
    icon: <Cpu className="w-5 h-5" />,
    endpoints: [
      {
        method: 'POST',
        path: DEVICE_API.CONTROL,
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
      {
        method: 'GET',
        path: DEVICE_API.SYNC,
        summary: 'Get system overview',
        body: null,
        note: 'Fetch bay data from database including active booking status.',
        response: {
          description: 'Returns list of bays with active booking info',
          example: {
            success: true,
            data: [
              {
                id: 'bay-01',
                relayPin: 4,
                isActive: true,
                hasActiveBooking: false,
                currentBooking: null,
                createdAt: '2026-03-29T15:45:04.690Z',
                updatedAt: '2026-03-30T03:43:25.345Z',
              },
            ],
            count: 3,
          },
        },
      },
      {
        method: 'PUT',
        path: DEVICE_API.SYNC,
        summary: 'Sync device to DB',
        body: {
          device_id: 'esp32-abc123',
          device_type: 'Smart Bay Controller',
          firmware_version: '1.0.0',
          bays: [
            { bay_id: 'bay-01', relay_pin: 4, name: 'bay-01' },
          ],
        },
        note: 'Usually called automatically via MQTT when ESP32 connects.',
        response: {
          description: 'Returns sync confirmation',
          example: {
            success: true,
            message: 'Device info synced',
            data: {
              device_id: 'esp32-abc123',
              device_type: 'Smart Bay Controller',
              firmware_version: '1.0.0',
              updated: 1,
              created: 0,
              bays: ['bay-01'],
            },
          },
        },
      },
      {
        method: 'GET',
        path: DEVICE_API.INFO,
        summary: 'Request ESP32 Info',
        body: null,
        note: 'Force request device_info ke ESP32 via MQTT. Timeout 5 detik jika device offline.',
        response: {
          description: 'Returns device info directly from ESP32',
          example: {
            success: true,
            data: {
              device_id: 'esp32-s3-123',
              firmware: '1.0.5',
              free_heap: 245000,
            },
          },
        },
      },
      {
        method: 'GET',
        path: DEVICE_API.STATUS,
        summary: 'Get MQTT Status',
        body: null,
        note: 'Check MQTT connection status and last heartbeat from device.',
        response: {
          description: 'Returns last known MQTT status',
          example: {
            success: true,
            data: {
              device_id: 'esp32-s3-123',
              timestamp: '2026-03-31T10:00:00.000Z',
              bays: [{ id: 'bay-01', status: 'ON' }],
            },
            mqtt: { connected: true },
          },
        },
      },
    ],
  },
];

export default function ApiDocs() {
  const [selectedCategory, setSelectedCategory] = useState<number>(0);
  const [selectedEndpoint, setSelectedEndpoint] = useState<number>(0);
  const [customBody, setCustomBody] = useState('');
  const [idParam, setIdParam] = useState('');
  const [response, setResponse] = useState<ResponseData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const category = endpointCategories[selectedCategory];
  const currentEndpoints = category?.endpoints || [];
  
  const endpoint = currentEndpoints[selectedEndpoint] || (currentEndpoints.length > 0 ? currentEndpoints[0] : null);

  const handleEndpointSelect = (ep: Endpoint, idx: number) => {
    setSelectedEndpoint(idx);
    setCustomBody(ep.body ? JSON.stringify(ep.body, null, 2) : '');
    setIdParam('');
    setResponse(null);
  };

  const handleSend = async () => {
    if (!endpoint) return;
    setIsLoading(true);
    setResponse(null);
    const startTime = Date.now();

    try {
      let path = endpoint.path;

      if (endpoint.path.includes('?id=') && idParam) {
        path = `${endpoint.path}${idParam}`;
      } else if (endpoint.path.endsWith('/') && idParam) {
        path = `${endpoint.path}${idParam}`;
      }

      const options: RequestInit = {
        method: endpoint.method,
        headers: { 'Content-Type': 'application/json' },
      };

      if (endpoint.method === 'POST' || endpoint.method === 'PUT' || endpoint.method === 'PATCH') {
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
    get: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    post: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    patch: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    put: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    delete: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  };

  const getMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case 'get': return <Hash className="w-3 h-3" />;
      case 'post': return <Plus className="w-3 h-3" />;
      case 'patch': return <Edit3 className="w-3 h-3" />;
      case 'put': return <RefreshCw className="w-3 h-3" />;
      case 'delete': return <Trash2 className="w-3 h-3" />;
      default: return <Hash className="w-3 h-3" />;
    }
  };

  const { connected, lastUpdateTime } = useMqtt();

  const TopbarRight = (
    <div className="flex items-center gap-2">
      <div className="hidden lg:flex items-center gap-3 px-4 py-2 bg-zinc-900/50 border border-zinc-800 rounded-xl">
        <Clock className="w-3.5 h-3.5 text-zinc-500" />
        <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
          Updated: {lastUpdateTime || '---'}
        </span>
      </div>

      <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-colors ${
        connected
          ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400'
          : 'bg-rose-500/5 border-rose-500/20 text-rose-400'
      }`}>
        {connected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
        <span className="text-[10px] font-black uppercase tracking-tighter hidden md:inline">
          {connected ? 'Connected' : 'Disconnected'}
        </span>
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Topbar 
        title="API Documentation" 
        subtitle="Interactive Explorer & Debugger" 
        rightElement={TopbarRight}
      />

      <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-8 space-y-8 max-w-[2000px] mx-auto w-full custom-scrollbar">
        <div className="flex flex-col xl:flex-row gap-8 h-full">
          
          <div className="flex flex-col gap-6 w-full xl:w-80 2xl:w-96 flex-shrink-0">
            <section className="space-y-3">
              <div className="flex items-center gap-2 px-2 mb-2">
                <Layers className="w-4 h-4 text-blue-500" />
                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Categories</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-1 gap-4">
                {endpointCategories.map((cat, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedCategory(idx);
                      setSelectedEndpoint(0);
                      setResponse(null);
                    }}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left group ${
                      selectedCategory === idx
                        ? 'bg-blue-600/10 border-blue-500/30 text-blue-400 shadow-lg shadow-blue-500/5'
                        : 'bg-zinc-900/40 border-zinc-800/50 hover:border-zinc-700 hover:bg-zinc-900/60'
                    }`}
                  >
                    <div className={`p-2 rounded-lg transition-colors ${
                      selectedCategory === idx ? 'bg-blue-500/20' : 'bg-zinc-800 group-hover:bg-zinc-700'
                    }`}>
                      {cat.icon}
                    </div>
                    <div>
                      <p className="text-sm font-bold tracking-tight">{cat.title}</p>
                      <p className="text-[10px] text-zinc-500 font-medium mt-0.5">{cat.endpoints.length} Endpoints</p>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            <section className="space-y-3">
              <div className="flex items-center gap-2 px-2 mb-2">
                <Activity className="w-4 h-4 text-purple-500" />
                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Endpoints</h3>
              </div>
              <div className="flex flex-col gap-3 max-h-[400px] xl:max-h-none overflow-y-auto pr-2 custom-scrollbar">
                {currentEndpoints.length > 0 ? (
                  currentEndpoints.map((ep, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleEndpointSelect(ep, idx)}
                      className={`group p-3 rounded-xl border transition-all text-left ${
                        selectedEndpoint === idx
                          ? 'bg-zinc-800 border-zinc-700 shadow-xl'
                          : 'bg-zinc-900/20 border-zinc-800/50 hover:bg-zinc-900/40 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-black uppercase border ${methodColors[ep.method.toLowerCase()]}`}>
                          {getMethodIcon(ep.method)}
                          {ep.method}
                        </span>
                        <code className="text-[10px] text-zinc-500 font-mono truncate bg-black/30 px-1.5 py-0.5 rounded">
                          {ep.path}
                        </code>
                      </div>
                      <p className="text-xs font-semibold text-zinc-300 group-hover:text-white transition-colors">{ep.summary}</p>
                    </button>
                  ))
                ) : null}
              </div>
            </section>
          </div>

          <div className="flex-1 flex flex-col gap-6 min-w-0">
            {endpoint ? (
              <div className="grid grid-cols-1 2xl:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <section className="bg-[#0a0a0f] border border-zinc-800/50 rounded-2xl p-6 shadow-2xl">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                          <Terminal className="w-5 h-5 text-zinc-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white tracking-tight">Request Explorer</h3>
                          <p className="text-xs text-zinc-500 font-medium mt-0.5">Configure and send API requests</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase border ${methodColors[endpoint.method.toLowerCase()]}`}>
                        {endpoint.method}
                      </span>
                    </div>

                    <div className="space-y-5">
                      <div className="bg-black/40 border border-zinc-800 rounded-xl p-3">
                        <code className="text-sm font-mono text-blue-400 flex items-center gap-2 break-all">
                          <span className="text-zinc-600">HOST</span>
                          {endpoint.path}
                          {idParam && (endpoint.path.includes('?id=') || endpoint.path.endsWith('/')) && (
                            <span className="text-amber-400">{idParam}</span>
                          )}
                        </code>
                      </div>

                      {endpoint.description && (
                        <p className="text-sm text-zinc-400 leading-relaxed bg-blue-500/5 border-l-2 border-blue-500/30 p-3 rounded-r-lg">
                          {endpoint.description}
                        </p>
                      )}

                      {(endpoint.path.includes('?id=') || endpoint.path.endsWith('/')) && (
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest px-1">ID Parameter</label>
                          <div className="relative">
                            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                            <input
                              type="text"
                              value={idParam}
                              onChange={(e) => setIdParam(e.target.value)}
                              placeholder="Enter resource ID (e.g., cm3qk...)"
                              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-sm font-mono focus:outline-none focus:border-blue-500/50 transition-all"
                            />
                          </div>
                        </div>
                      )}

                      {(endpoint.method === 'POST' || endpoint.method === 'PUT' || endpoint.method === 'PATCH') && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between px-1">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Payload (JSON)</label>
                            <Code className="w-3 h-3 text-zinc-600" />
                          </div>
                          <textarea
                            value={customBody}
                            onChange={(e) => setCustomBody(e.target.value)}
                            className="w-full h-48 bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-xs font-mono text-zinc-300 focus:outline-none focus:border-blue-500/50 transition-all custom-scrollbar resize-none"
                          />
                        </div>
                      )}

                      {endpoint.note && (
                        <div className="flex gap-3 p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                          <p className="text-xs text-amber-500/80 leading-relaxed font-medium">{endpoint.note}</p>
                        </div>
                      )}

                      <button
                        onClick={handleSend}
                        disabled={isLoading}
                        className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-sm hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-3 shadow-xl shadow-blue-600/20 mt-4"
                      >
                        {isLoading ? (
                          <RefreshCw className="w-5 h-5 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                        {isLoading ? 'EXECUTING...' : 'SEND REQUEST'}
                      </button>
                    </div>
                  </section>
                </div>

                <div className="space-y-6">
                  {response ? (
                    <section className="bg-[#0a0a0f] border-2 border-zinc-800 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
                      <div className="bg-zinc-900/80 px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Terminal className="w-4 h-4 text-blue-400" />
                          <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">Console Output</h3>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-black tracking-tighter ${
                            response.status && response.status >= 200 && response.status < 300
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-rose-500/20 text-rose-400'
                          }`}>
                            {response.status && response.status >= 200 && response.status < 300 ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                            STATUS: {response.status || 'ERROR'}
                          </span>
                          {response.time && (
                            <span className="flex items-center gap-1.5 px-2 py-1 bg-zinc-800 rounded-md text-[10px] font-bold text-zinc-400">
                              <Clock className="w-3 h-3" />
                              {response.time}
                            </span>
                          )}
                          <button 
                            onClick={() => setResponse(null)}
                            className="p-1.5 hover:bg-zinc-800 rounded-md text-zinc-500 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <div className="p-6 bg-black/60">
                        <pre className="text-[11px] font-mono text-zinc-300 overflow-auto max-h-[400px] xl:max-h-[600px] custom-scrollbar leading-loose">
                          {JSON.stringify(response.data || { error: response.error }, null, 2)}
                        </pre>
                      </div>
                    </section>
                  ) : endpoint.response ? (
                    <section className="bg-zinc-950/50 border border-zinc-800/50 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in duration-300">
                      <div className="bg-zinc-900/50 px-6 py-4 border-b border-zinc-800 flex items-center gap-3">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">Schema Response</h3>
                      </div>
                      <div className="p-6">
                        <p className="text-xs text-zinc-500 mb-4 font-medium italic">{"// " + endpoint.response.description}</p>
                        <div className="bg-[#050508] rounded-xl p-4 border border-zinc-800/50 relative group">
                          <pre className="text-[11px] font-mono text-emerald-400/90 overflow-auto max-h-[300px] xl:max-h-[400px] custom-scrollbar leading-relaxed">
                            {JSON.stringify(endpoint.response.example, null, 2)}
                          </pre>
                          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-400 transition-colors">
                              <Code className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </section>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8 text-center">
                <div className="max-w-sm space-y-4 opacity-40">
                  <div className="w-20 h-20 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-6">
                    <Code className="w-10 h-10 text-zinc-700" />
                  </div>
                  <h3 className="text-xl font-bold text-zinc-400">Select an Endpoint</h3>
                  <p className="text-sm text-zinc-600 font-medium">Choose an API endpoint from the sidebar to explore details, schema, and execute live requests.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
