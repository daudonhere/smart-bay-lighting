'use client';

import { useEffect, useState } from 'react';
import { useMqtt } from '@/contexts/MqttContext';
import { useMqttCommand } from '@/hooks/useMqttCommand';
import { RelayStatus } from '@/lib/mqtt/config';
import { Sidebar } from '@/components';

export default function MonitoringPage() {
  const { connected, lastStatus } = useMqtt();
  const [lastUpdate, setLastUpdate] = useState<string>('');

  const defaultBays: RelayStatus[] = [
    { bay_id: 'bay-01', relay_pin: 4, active: false, lamps: { lamp_1: false, lamp_2: false }, end_time: null },
    { bay_id: 'bay-02', relay_pin: 5, active: false, lamps: { lamp_1: false, lamp_2: false }, end_time: null },
    { bay_id: 'bay-03', relay_pin: 6, active: false, lamps: { lamp_1: false, lamp_2: false }, end_time: null },
  ];

  const [bays, setBays] = useState<RelayStatus[]>(defaultBays);

  useEffect(() => {
    if (connected) {
      setLastUpdate(new Date().toLocaleTimeString());
    }
  }, [connected]);

  useEffect(() => {
    if (lastStatus) {
      setLastUpdate(new Date().toLocaleTimeString());

      if (lastStatus.result?.data) {
        const activeBookings = lastStatus.result.data.filter((item): item is NonNullable<typeof item> => item !== null && item.bay_id !== undefined);

        const bayData: RelayStatus[] = [...defaultBays];

        activeBookings.forEach((booking) => {
          const bayIndex = bayData.findIndex(b => b.bay_id === booking.bay_id);
          if (bayIndex >= 0) {
            bayData[bayIndex].active = true;
            bayData[bayIndex].lamps.lamp_1 = true;
            bayData[bayIndex].lamps.lamp_2 = true;
            bayData[bayIndex].end_time = booking.end_time || null;
          }
        });

        setBays(bayData);
      }
    }
  }, [lastStatus]);

  return (
    <div className="h-screen flex overflow-hidden bg-[#0a0a0f]">
      <Sidebar />

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
              {connected && (
                <span className="text-sm text-zinc-600">Last update: {lastUpdate}</span>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {bays.map((bay) => (
                <BayCard key={bay.bay_id} bay={bay} />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function BayCard({ bay }: { bay: RelayStatus }) {
  const { lastStatus } = useMqtt();
  const { mutate: sendCommand, isPending } = useMqttCommand();
  const [optimisticState, setOptimisticState] = useState<boolean | null>(null);

  const isBayInActiveList = lastStatus?.result?.data?.some((b: any) => b?.bay_id === bay.bay_id);
  const isActive = optimisticState !== null ? optimisticState : (isBayInActiveList ?? bay.active);

  useEffect(() => {
    if (isBayInActiveList !== undefined) {
      setOptimisticState(null);
    }
  }, [isBayInActiveList]);

  const handleToggle = () => {
    const newState = !isActive;
    setOptimisticState(newState);
    sendCommand({
      command: newState ? 'turn_on' : 'turn_off',
      bay_id: bay.bay_id,
    });
  };

  return (
    <div className={`rounded-2xl border p-6 backdrop-blur-md transition-all ${
      isActive
        ? 'border-blue-500/50 bg-blue-900/20 shadow-lg shadow-blue-500/10'
        : 'border-zinc-800 bg-zinc-900/60'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-bold text-zinc-100 uppercase">{bay.bay_id}</h4>
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
          isActive
            ? 'bg-green-600 text-white'
            : 'bg-red-600 text-white'
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
                isActive ? 'bg-green-400 animate-pulse' : 'bg-red-600'
              }`}></div>
              <span className={`text-xs uppercase ${isActive ? 'text-green-400' : 'text-red-500'}`}>
                Lamp 1
              </span>
            </div>
            <div className="flex-1 bg-zinc-800/50 rounded-lg p-3 text-center">
              <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${
                isActive ? 'bg-green-400 animate-pulse' : 'bg-red-600'
              }`}></div>
              <span className={`text-xs uppercase ${isActive ? 'text-green-400' : 'text-red-500'}`}>
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

      <button
        onClick={handleToggle}
        disabled={isPending}
        className={`mt-4 w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
          isActive
            ? 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white shadow-lg shadow-red-500/25'
            : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white shadow-lg shadow-green-500/25'
        } ${isPending ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02]'}`}
      >
        {isPending ? (
          <>
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Processing...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            {isActive ? 'Turn Off' : 'Turn On'}
          </>
        )}
      </button>
    </div>
  );
}
