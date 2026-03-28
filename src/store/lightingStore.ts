import { create } from 'zustand';

interface Light {
  id: string;
  name: string;
  isOn: boolean;
  brightness: number;
  color: string;
}

interface LightingState {
  lights: Light[];
  toggleLight: (id: string) => void;
  setBrightness: (id: string, brightness: number) => void;
  setColor: (id: string, color: string) => void;
  addLight: (name: string) => void;
  removeLight: (id: string) => void;
}

export const useLightingStore = create<LightingState>((set) => ({
  lights: [
    { id: '1', name: 'Living Room', isOn: false, brightness: 75, color: '#ffffff' },
    { id: '2', name: 'Bedroom', isOn: false, brightness: 50, color: '#ffffff' },
    { id: '3', name: 'Kitchen', isOn: false, brightness: 100, color: '#ffffff' },
  ],
  toggleLight: (id) =>
    set((state) => ({
      lights: state.lights.map((light) =>
        light.id === id ? { ...light, isOn: !light.isOn } : light
      ),
    })),
  setBrightness: (id, brightness) =>
    set((state) => ({
      lights: state.lights.map((light) =>
        light.id === id ? { ...light, brightness } : light
      ),
    })),
  setColor: (id, color) =>
    set((state) => ({
      lights: state.lights.map((light) =>
        light.id === id ? { ...light, color } : light
      ),
    })),
  addLight: (name) =>
    set((state) => ({
      lights: [
        ...state.lights,
        {
          id: Date.now().toString(),
          name,
          isOn: false,
          brightness: 75,
          color: '#ffffff',
        },
      ],
    })),
  removeLight: (id) =>
    set((state) => ({
      lights: state.lights.filter((light) => light.id !== id),
    })),
}));
