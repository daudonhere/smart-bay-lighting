// eslint-disable-next-line react-hooks/set-state-in-effect
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
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  const loadBayState = () => {
    const saved = localStorage.getItem('bayStates');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return {};
      }
    }
    return {};
  };

  const saveBayState = async (bayId: string, active: boolean) => {
    const saved = loadBayState();
    saved[bayId] = active;
    localStorage.setItem('bayStates', JSON.stringify(saved));

    try {
      await api.post('/command', {
        command: active ? 'turn_on' : 'turn_off',
        bay_id: bayId,
      });
    } catch {
      try {
        await api.put('/bays', {
          id: bayId,
          isActive: active,
        });
      } catch {}

      const reverted = loadBayState();
      reverted[bayId] = !active;
      localStorage.setItem('bayStates', JSON.stringify(reverted));
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const infoResponse = await api.get('/info');
      const deviceInfo = infoResponse.data as { data: { bays: Array<{ bay_id: string; relay_pin: number }> } };

      await api.put('/sync', deviceInfo.data);

      const baysResponse = await api.get('/bays');
      const bayData: RelayStatus[] = baysResponse.data.data.map((bay: { id: string; relayPin: number; isActive: boolean }) => ({
        bay_id: bay.id,
        relay_pin: bay.relayPin,
        active: bay.isActive,
        lamps: { lamp_1: bay.isActive, lamp_2: bay.isActive },
        end_time: null,
      }));
      setBays(bayData);
      setLastUpdate(new Date().toLocaleTimeString());
    } catch {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    async function loadBays() {
      try {
        const response = await api.get('/bays');
        const savedStates = loadBayState();
        const bayData: RelayStatus[] = response.data.data.map((bay: { id: string; relayPin: number; isActive: boolean }) => {
          const savedActive = savedStates[bay.id];
          const isActive = savedActive !== undefined ? savedActive : bay.isActive;
          return {
            bay_id: bay.id,
            relay_pin: bay.relayPin,
            active: isActive,
            lamps: { lamp_1: isActive, lamp_2: isActive },
            end_time: null,
          };
        });
        setBays(bayData);
      } catch {
      } finally {
        setIsLoading(false);
      }
    }

    loadBays();
  }, []);

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
    if (lastStatus?.result?.data) {
      setLastUpdate(new Date().toLocaleTimeString());

      const activeBaysIds = lastStatus.result.data
        .filter((item): item is NonNullable<typeof item> => item !== null && item.bay_id !== undefined)
        .map((item) => item.bay_id);

      const bayData: RelayStatus[] = bays.map((bay) => {
        const isActive = activeBaysIds.includes(bay.bay_id);
        return {
          ...bay,
          active: isActive,
          lamps: { lamp_1: isActive, lamp_2: isActive },
          end_time: null,
        };
      });

      setBays(bayData);
    }
  }, [lastStatus, bays]);

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
              {isMounted && connected && (
                <button
                  onClick={handleSync}
                  disabled={isSyncing}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-green-800 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-all hover:scale-105"
                >
                  {isSyncing ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Syncing...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Sync
                    </>
                  )}
                </button>
              )}
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                <span className="text-sm text-zinc-400">MQTT: {connected ? 'Connected' : 'Disconnected'}</span>
              </div>
              {connected && isMounted && (
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
                  <BayCard key={bay.bay_id} bay={bay} onSaveState={saveBayState} />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function BayCard({ bay, onSaveState }: { bay: RelayStatus; onSaveState: (bayId: string, active: boolean) => void }) {
  const { lastStatus } = useMqtt();
  const { mutate: sendCommand, isPending } = useMqttCommand();
  const [optimisticState, setOptimisticState] = useState<boolean | null>(null);

  const isBayInActiveList = lastStatus?.result?.data?.some((b: { bay_id?: string | null } | null) => b?.bay_id === bay.bay_id);
  const isActive = optimisticState !== null ? optimisticState : (isBayInActiveList ?? bay.active);

  useEffect(() => {
    if (isBayInActiveList !== undefined) {
      setOptimisticState(null);
    }
  }, [isBayInActiveList]);

  const handleToggle = () => {
    const newState = !isActive;
    setOptimisticState(newState);
    onSaveState(bay.bay_id, newState);
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
