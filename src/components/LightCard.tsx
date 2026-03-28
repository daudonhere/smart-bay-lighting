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
  const { toggleLight, setBrightness, setColor } = useLightingStore();

  return (
    <div
      className={`p-6 rounded-xl border-2 transition-all duration-300 ${
        isOn
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {name}
        </h3>
        <button
          onClick={() => toggleLight(id)}
          className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${
            isOn ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
          }`}
        >
          <span
            className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform duration-300 ${
              isOn ? 'left-8' : 'left-1'
            }`}
          />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
            Brightness: {brightness}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={brightness}
            onChange={(e) => setBrightness(id, parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
            Color
          </label>
          <div className="flex gap-2">
            {['#ffffff', '#ffd700', '#ff6b6b', '#4ecdc4', '#a78bfa'].map((c) => (
              <button
                key={c}
                onClick={() => setColor(id, c)}
                className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                  color === c ? 'border-gray-900 dark:border-white scale-110' : 'border-transparent'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
