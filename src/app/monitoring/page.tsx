'use client';

import { useEffect, useState } from 'react';
import { useMqtt } from '@/contexts/MqttContext';
import { BayStatus, RelayStatus } from '@/lib/mqtt/config';

export default function MonitoringPage() {
  const { connected, lastStatus } = useMqtt();
  const [status, setStatus] = useState<BayStatus | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  useEffect(() => {
    if (lastStatus) {
      setStatus(lastStatus);
      setLastUpdate(new Date().toLocaleTimeString());
    }
  }, [lastStatus]);

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
            href="/docs"
            className="group flex items-center px-4 py-3 rounded-xl text-zinc-400 hover:bg-zinc-800/50 transition-all hover:scale-[1.02]"
          >
            <svg className="w-5 h-5 mr-3 text-zinc-600 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="font-medium">API Docs</span>
          </a>
          <a
            href="/monitoring"
            className="group flex items-center px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600/90 to-purple-600/90 text-white shadow-lg shadow-blue-500/20 transition-all hover:from-blue-600 hover:to-purple-600 hover:scale-[1.02]"
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="font-medium">Monitoring</span>
          </a>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-zinc-900/50 backdrop-blur-md border-b border-zinc-800 shadow-sm flex-shrink-0">
          <div className="px-8 py-5 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-zinc-100">Device Monitoring</h2>
              <p className="text-sm text-zinc-500 mt-1">Real-time relay & GPIO status from ESP32</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                <span className="text-sm text-zinc-400">MQTT: {connected ? 'Connected' : 'Disconnected'}</span>
              </div>
              <span className="text-sm text-zinc-600">Last update: {lastUpdate || 'Never'}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          {!status ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-zinc-800 border-t-blue-500 mb-4"></div>
                <p className="text-zinc-500">Waiting for device...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {status.bays.map((bay) => (
                  <BayCard key={bay.bay_id} bay={bay} />
                ))}
              </div>

              <div className="bg-zinc-900/60 backdrop-blur-md rounded-2xl border border-zinc-800 p-6">
                <h3 className="text-lg font-bold text-zinc-100 mb-4">Raw Device Data</h3>
                <pre className="bg-zinc-950 text-zinc-100 rounded-xl p-4 text-xs overflow-auto max-h-96 font-mono border border-zinc-800">
                  {JSON.stringify(status, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function BayCard({ bay }: { bay: RelayStatus }) {
  const isActive = bay.active;

  return (
    <div className={`rounded-2xl border p-6 backdrop-blur-md transition-all ${
      isActive 
        ? 'border-blue-500/50 bg-blue-900/20 shadow-lg shadow-blue-500/10' 
        : 'border-zinc-800 bg-zinc-900/60'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-bold text-zinc-100">{bay.bay_id}</h4>
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
          isActive 
            ? 'bg-green-600 text-white' 
            : 'bg-zinc-700 text-zinc-400'
        }`}>
          {isActive ? 'ACTIVE' : 'INACTIVE'}
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-zinc-500">Relay Pin</span>
          <span className="text-sm font-mono text-zinc-300">GPIO {bay.relay_pin}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-zinc-500">Relay Status</span>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-zinc-600'}`}></div>
            <span className={`text-sm ${isActive ? 'text-green-400' : 'text-zinc-500'}`}>
              {isActive ? 'ON' : 'OFF'}
            </span>
          </div>
        </div>

        <div className="border-t border-zinc-800 pt-3">
          <span className="text-sm text-zinc-500 block mb-2">Lamps Status</span>
          <div className="flex gap-4">
            <div className="flex-1 bg-zinc-800/50 rounded-lg p-3 text-center">
              <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${
                bay.lamps.lamp_1 ? 'bg-yellow-400 animate-pulse' : 'bg-zinc-600'
              }`}></div>
              <span className={`text-xs ${bay.lamps.lamp_1 ? 'text-yellow-400' : 'text-zinc-500'}`}>
                Lamp 1
              </span>
            </div>
            <div className="flex-1 bg-zinc-800/50 rounded-lg p-3 text-center">
              <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${
                bay.lamps.lamp_2 ? 'bg-yellow-400 animate-pulse' : 'bg-zinc-600'
              }`}></div>
              <span className={`text-xs ${bay.lamps.lamp_2 ? 'text-yellow-400' : 'text-zinc-500'}`}>
                Lamp 2
              </span>
            </div>
          </div>
        </div>

        {bay.end_time && (
          <div className="border-t border-zinc-800 pt-3">
            <span className="text-sm text-zinc-500">End Time</span>
            <p className="text-sm font-mono text-zinc-300 mt-1">
              {new Date(bay.end_time).toLocaleString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
