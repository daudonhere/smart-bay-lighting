'use client';

import { useEffect, useState } from 'react';
import { useMqtt } from '@/contexts/MqttContext';
import { useMqttCommand } from '@/hooks/useMqttCommand';
import { RelayStatus } from '@/lib/mqtt/config';
import { Sidebar } from '@/components';
import { api } from '@/lib/api';

export default function MonitoringPage() {
  const { connected, lastStatus, deviceInfo } = useMqtt();
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [bays, setBays] = useState<RelayStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Load bays from database on mount
  useEffect(() => {
    async function loadBays() {
      try {
        const response = await api.get('/bays');
        const bayData: RelayStatus[] = response.data.data.map((bay: any) => ({
          bay_id: bay.name,
          relay_pin: 0,
          active: false,
          lamps: { lamp_1: false, lamp_2: false },
          end_time: null,
        }));
        setBays(bayData);
      } catch (err) {
        console.error('Failed to load bays:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadBays();
  }, []);

  // Update bays if deviceInfo received from MQTT
  useEffect(() => {
    if (deviceInfo?.bays) {
      const bayData: RelayStatus[] = deviceInfo.bays.map((bay) => ({
        bay_id: bay.bay_id,
        relay_pin: bay.relay_pin,
        active: false,
        lamps: { lamp_1: false, lamp_2: false },
        end_time: null,
      }));
      setBays(bayData);
    }
  }, [deviceInfo]);

  useEffect(() => {
    if (connected) {
      setLastUpdate(new Date().toLocaleTimeString());
    }
  }, [connected]);

  useEffect(() => {
    if (lastStatus) {
      setLastUpdate(new Date().toLocaleTimeString());

      if (lastStatus.result?.data && bays.length > 0) {
        const activeBookings = lastStatus.result.data.filter((item): item is NonNullable<typeof item> => item !== null && item.bay_id !== undefined);

        const bayData: RelayStatus[] = bays.map((bay) => {
          const activeBooking = activeBookings.find((b) => b.bay_id === bay.bay_id);
          if (activeBooking) {
            return {
              ...bay,
              active: true,
              lamps: { lamp_1: true, lamp_2: true },
              end_time: activeBooking.end_time || null,
            };
          }
          return bay;
        });

        setBays(bayData);
      }
    }
  }, [lastStatus, bays.length]);

  return (
    <div className="h-screen flex overflow-hidden bg-[#0a0a0f]">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-zinc-900/50 backdrop-blur-md border-b border-zinc-800 shadow-sm flex-shrink-0">
          <div className="px-8 py-5 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-zinc-100">Device Monitoring</h2>
              <p className="text-sm text-zinc-500 mt-1">
                {!isMounted || isLoading
                  ? 'Real-time relay & GPIO status from ESP32'
                  : deviceInfo?.bays
                    ? `${deviceInfo.bays.length} bay${deviceInfo.bays.length > 1 ? 's' : ''} connected`
                    : bays.length > 0
                      ? `${bays.length} bay${bays.length > 1 ? 's' : ''} from database`
                      : 'No bays available'}
              </p>
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
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <svg className="animate-spin w-12 h-12 mx-auto text-blue-500" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <p className="text-zinc-400 mt-4">Loading bays...</p>
                </div>
              </div>
            ) : bays.length === 0 ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <svg className="w-16 h-16 mx-auto text-zinc-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <p className="text-zinc-400 text-lg font-medium">No bays available</p>
                  <p className="text-zinc-500 text-sm mt-2">Connect ESP32 to sync bays automatically</p>
                </div>
              </div>
            ) : (
              <div className={`grid gap-6 ${
                bays.length === 1 ? 'grid-cols-1' :
                bays.length === 2 ? 'grid-cols-1 md:grid-cols-2' :
                'grid-cols-1 md:grid-cols-3'
              }`}>
                {bays.map((bay) => (
                  <BayCard key={bay.bay_id} bay={bay} />
                ))}
              </div>
            )}
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
