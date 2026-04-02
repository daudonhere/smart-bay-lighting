'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMqtt } from '@/providers/MqttProvider';
import { useDeviceStore } from '@/stores/useDeviceStore';
import { useBayStore } from '@/stores/useBayStore';
import { RelayStatus } from '@/lib/mqtt/config';
import { Topbar } from '@/components';
import { 
  RefreshCw, 
  Wifi, 
  WifiOff, 
  Clock, 
  Zap, 
  Lightbulb, 
  LightbulbOff,
  Cpu,
  Info,
  LayoutGrid,
  Power,
  AlertCircle
} from 'lucide-react';

interface BayData {
  id: string;
  relayPin: number;
  isActive: boolean;
}

export default function MonitoringPage() {
  const queryClient = useQueryClient();
  const { connected, lastStatus, lastUpdateTime } = useMqtt();

  const { syncDevice, getDeviceInfo } = useDeviceStore();
  const { getBays } = useBayStore();

  const { data: baysResponse, isLoading } = useQuery({
    queryKey: ['bays'],
    queryFn: async () => {
      const response = await getBays() as { data: BayData[] };
      return response.data.map((bay) => ({
        bay_id: bay.id,
        relay_pin: bay.relayPin,
        active: bay.isActive,
        lamps: { lamp_1: bay.isActive, lamp_2: bay.isActive },
        end_time: null,
      }));
    },
    staleTime: 0,
    refetchOnMount: true,
  });

  const bays = baysResponse || [];

  const syncMutation = useMutation({
    mutationFn: async () => {
      const infoResponse = await getDeviceInfo() as { data: unknown };
      await syncDevice(infoResponse.data);
      return queryClient.invalidateQueries({ queryKey: ['bays'] });
    },
  });

  const handleSync = () => {
    syncMutation.mutate();
  };

  const TopbarRight = (
    <div className="flex items-center gap-2 sm:gap-4">
      <div className="hidden lg:flex items-center gap-3 px-4 py-2 bg-zinc-900/50 border border-zinc-800 rounded-xl">
        <Clock className="w-3.5 h-3.5 text-zinc-500" />
        <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
          Updated: {lastUpdateTime || '---'}
        </span>
      </div>
      
      {connected && (
        <button
          onClick={handleSync}
          disabled={syncMutation.isPending}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-900/50 disabled:text-zinc-500 text-white text-xs font-black rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-emerald-600/20 uppercase tracking-widest"
        >
          {syncMutation.isPending ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <RefreshCw className="w-3.5 h-3.5" />
          )}
          <span className="hidden sm:inline">Sync Device</span>
        </button>
      )}

      <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-colors ${
        connected 
          ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' 
          : 'bg-rose-500/5 border-rose-500/20 text-rose-400'
      }`}>
        {connected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
        <span className="text-[10px] font-black uppercase tracking-tighter hidden md:inline">
          {connected ? 'MQTT Connected' : 'MQTT Disconnected'}
        </span>
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Topbar 
        title="System Monitoring" 
        subtitle={connected ? 'Real-time Live Data' : 'Offline Mode'} 
        rightElement={TopbarRight}
      />

      <main className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 max-w-[2000px] mx-auto w-full custom-scrollbar">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LayoutGrid className="w-4 h-4 text-blue-500" />
              <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Active Bays</h3>
            </div>
            {!isLoading && (
              <span className="px-2 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-[10px] font-black text-zinc-500">
                TOTAL: {bays.length}
              </span>
            )}
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin"></div>
                <Cpu className="w-6 h-6 text-blue-500 absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 animate-pulse" />
              </div>
              <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest animate-pulse">Initializing System...</p>
            </div>
          ) : !Array.isArray(bays) || bays.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center space-y-6 bg-zinc-900/20 border border-dashed border-zinc-800 rounded-3xl">
              <div className="w-20 h-20 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                <AlertCircle className="w-10 h-10 text-zinc-700" />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-bold text-zinc-400">No Hardware Found</p>
                <p className="text-sm text-zinc-600 max-w-xs mx-auto">Connect your ESP32 controller or start the mock simulator to begin monitoring.</p>
              </div>
              <button 
                onClick={handleSync}
                className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold rounded-xl transition-all border border-zinc-700 uppercase tracking-widest"
              >
                Retry Sync
              </button>
            </div>
          ) : (
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {bays.map((bay) => (
                <BayCard key={bay.bay_id} bay={bay} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function BayCard({ bay }: { bay: RelayStatus }) {
  const { lastStatus } = useMqtt();
  const queryClient = useQueryClient();
  const sendControl = useDeviceStore((state) => state.sendControl);

  const isBayInActiveList = lastStatus?.result?.data?.some((b: { bay_id?: string | null } | null) => b?.bay_id === bay.bay_id);
  const isActive = isBayInActiveList ?? bay.active;

  const controlMutation = useMutation({
    mutationFn: async (active: boolean) => {
      return sendControl(active ? 'turn_on' : 'turn_off', bay.bay_id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bays'] });
    },
  });

  const handleToggle = () => {
    controlMutation.mutate(!isActive);
  };

  return (
    <div className={`group relative rounded-[2rem] border transition-all duration-700 overflow-hidden ${
      isActive
        ? 'bg-blue-600/5 border-blue-500/40 shadow-[0_0_40px_rgba(59,130,246,0.15)]'
        : 'bg-[#050508] border-zinc-800/80 hover:border-zinc-700 shadow-2xl'
    }`}>
      {/* Decorative Gradient Inner Glow */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none ${
        isActive ? 'bg-gradient-to-br from-blue-500/10 via-transparent to-transparent' : 'bg-gradient-to-br from-zinc-800/5 via-transparent to-transparent'
      }`}></div>

      <div className="p-7 space-y-8 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 transform group-hover:scale-110 ${
              isActive ? 'bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)]' : 'bg-zinc-900 border border-zinc-800'
            }`}>
              <Zap className={`w-6 h-6 ${isActive ? 'text-white' : 'text-zinc-600'}`} />
            </div>
            <div>
              <h4 className={`text-base font-black uppercase tracking-tight transition-colors ${
                isActive ? 'text-white' : 'text-zinc-400'
              }`}>{bay.bay_id}</h4>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500/50"></span>
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">
                  GPIO {bay.relay_pin}
                </p>
              </div>
            </div>
          </div>
          
          <div className={`px-3 py-1.5 rounded-xl text-[9px] font-black tracking-[0.2em] uppercase border transition-all duration-500 ${
            isActive 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.1)]' 
              : 'bg-zinc-900/50 border-zinc-800 text-zinc-600'
          }`}>
            {isActive ? 'Live' : 'Standby'}
          </div>
        </div>

        {/* Improved Lamp Indicators */}
        <div className="grid grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className={`p-5 rounded-[1.5rem] border transition-all duration-700 flex flex-col items-center gap-4 ${
              isActive ? 'bg-blue-500/10 border-blue-500/20' : 'bg-zinc-900/20 border-zinc-800/50'
            }`}>
              <div className="relative">
                {isActive && (
                  <div className="absolute inset-0 bg-cyan-400 blur-xl opacity-40 animate-pulse"></div>
                )}
                <div className={`relative p-3 rounded-full transition-all duration-500 ${
                  isActive 
                    ? 'bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.6)]' 
                    : 'bg-zinc-800 border border-zinc-700'
                }`}>
                  {isActive ? <Lightbulb className="w-5 h-5 text-white" /> : <LightbulbOff className="w-5 h-5 text-zinc-600" />}
                </div>
              </div>
              <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isActive ? 'text-cyan-400' : 'text-zinc-700'}`}>
                Unit 0{i}
              </span>
            </div>
          ))}
        </div>

        {bay.end_time && (
          <div className="flex items-center gap-4 p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-black text-amber-500/60 uppercase tracking-widest">Session Ends</p>
              <p className="text-[13px] font-mono font-black text-amber-400">
                {new Date(bay.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </p>
            </div>
          </div>
        )}

        <button
          onClick={handleToggle}
          disabled={controlMutation.isPending}
          className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 shadow-2xl ${
            isActive
              ? 'bg-white text-rose-600 hover:bg-rose-50 shadow-rose-600/10'
              : 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-600/30'
          } ${controlMutation.isPending ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98]'}`}
        >
          {controlMutation.isPending ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Power className="w-4 h-4" />
          )}
          {controlMutation.isPending ? 'Syncing...' : isActive ? 'Emergency Stop' : 'Initiate Power'}
        </button>
      </div>
    </div>
  );
}
