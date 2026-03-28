'use client';

import { useLightingStore } from '@/store';

interface LightCardProps {
  id: string;
  name: string;
  isOn: boolean;
  brightness: number;
  color: string;
}

export function LightCard({ id, name, isOn, brightness, color }: LightCardProps) {
  const { toggleLight, setBrightness, setColor, removeLight } = useLightingStore();

  return (
    <div className={`p-5 rounded-lg border transition-all ${isOn ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${isOn ? 'bg-green-500' : 'bg-gray-400'}`} />
          <h4 className="font-medium text-gray-900 dark:text-white">{name}</h4>
        </div>
        <button
          onClick={() => toggleLight(id)}
          className={`w-12 h-6 rounded-full transition-colors ${isOn ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
        >
          <div className={`w-5 h-5 bg-white rounded-full transition-transform ${isOn ? 'translate-x-6' : 'translate-x-0.5'}`} />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-500 dark:text-gray-400">Brightness</span>
            <span className="text-gray-900 dark:text-white font-medium">{brightness}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={brightness}
            onChange={(e) => setBrightness(id, parseInt(e.target.value))}
            className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>

        <div>
          <span className="text-sm text-gray-500 dark:text-gray-400">Color</span>
          <div className="flex gap-2 mt-2">
            {['#ffffff', '#ffd700', '#ff6b6b', '#4ecdc4', '#a78bfa'].map((c) => (
              <button
                key={c}
                onClick={() => setColor(id, c)}
                className={`w-6 h-6 rounded-full border-2 ${color === c ? 'border-gray-900 dark:border-white' : 'border-transparent'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <button
          onClick={() => removeLight(id)}
          className="w-full py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
        >
          Remove Light
        </button>
      </div>
    </div>
  );
}
