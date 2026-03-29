'use client';

import { useMqttCommand } from '@/hooks/useMqttCommand';
import { useMqtt } from '@/contexts/MqttContext';
import { useState, useEffect } from 'react';

interface LightCardProps {
  bayId: 'bay-01' | 'bay-02' | 'bay-03';
  bayName: string;
  gpioPin: number;
  isActive: boolean;
}

export function LightCard({ bayId, bayName, gpioPin, isActive }: LightCardProps) {
  const { lastStatus } = useMqtt();
  const { mutate: sendCommand, isPending } = useMqttCommand();
  const [optimisticState, setOptimisticState] = useState<boolean | null>(null);

  const isBayInActiveList = lastStatus?.result?.data?.some((b: any) => b?.bay_id === bayId);
  const isLightOn = optimisticState !== null ? optimisticState : (isBayInActiveList ?? false);

  useEffect(() => {
    if (isBayInActiveList !== undefined) {
      setOptimisticState(null);
    }
  }, [isBayInActiveList]);

  const handleToggle = () => {
    const newState = !isLightOn;
    setOptimisticState(newState);
    sendCommand({
      command: newState ? 'turn_on' : 'turn_off',
      bay_id: bayId,
    });
  };

  return (
    <div className="bg-zinc-900/60 backdrop-blur-md rounded-2xl border border-zinc-800 p-6 shadow-lg hover:shadow-xl hover:shadow-blue-500/10 transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
            isLightOn 
              ? 'bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg shadow-green-500/30' 
              : 'bg-gradient-to-br from-zinc-700 to-zinc-800'
          }`}>
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-zinc-100">{bayName}</h3>
            <p className="text-sm text-zinc-500">GPIO {gpioPin}</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          isLightOn 
            ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
            : 'bg-zinc-700/50 text-zinc-400 border border-zinc-600/30'
        }`}>
          {isLightOn ? 'ON' : 'OFF'}
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <div className={`w-3 h-3 rounded-full ${isLightOn ? 'bg-green-400 animate-pulse' : 'bg-zinc-600'}`} />
        <span className="text-sm text-zinc-400">
          Relay {isLightOn ? 'activated' : 'deactivated'}
        </span>
      </div>

      <button
        onClick={handleToggle}
        disabled={isPending}
        className={`w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
          isLightOn
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
            {isLightOn ? 'Turn Off' : 'Turn On'}
          </>
        )}
      </button>
    </div>
  );
}
