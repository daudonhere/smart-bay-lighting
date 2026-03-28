'use client';

import { useLightingStore } from '@/store';
import { LightCard } from '@/components';

export default function Home() {
  const { lights, addLight } = useLightingStore();

  const handleAddLight = () => {
    const name = prompt('Enter light name:');
    if (name) {
      addLight(name);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Smart Bay Lighting
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Control your home lighting from anywhere
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {lights.map((light) => (
            <LightCard key={light.id} {...light} />
          ))}
        </div>

        <div className="text-center">
          <button
            onClick={handleAddLight}
            className="px-6 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors"
          >
            Add New Light
          </button>
        </div>
      </div>
    </main>
  );
}
