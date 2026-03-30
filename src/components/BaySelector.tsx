'use client';

interface Bay {
  id: string;
  isActive: boolean;
  hasActiveBooking?: boolean;
  currentBooking?: {
    customerName: string;
    endTime: string;
  } | null;
}

interface BaySelectorProps {
  bays: Bay[];
  selectedBay: string;
  onSelect: (bayId: string) => void;
}

export function BaySelector({ bays, selectedBay, onSelect }: BaySelectorProps) {
  const getBayStatus = (bay: Bay) => {
    if (bay.hasActiveBooking) {
      return {
        status: 'Booked',
        color: 'text-red-400',
        bgColor: 'bg-red-900/20',
        borderColor: 'border-red-500/30',
      };
    }
    if (bay.isActive) {
      return {
        status: 'Available',
        color: 'text-green-400',
        bgColor: 'bg-green-900/20',
        borderColor: 'border-green-500/30',
      };
    }
    return {
      status: 'Unavailable',
      color: 'text-zinc-500',
      bgColor: 'bg-zinc-800/30',
      borderColor: 'border-zinc-700/30',
    };
  };

  if (bays.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-zinc-800/50 flex items-center justify-center">
          <svg className="w-10 h-10 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <p className="text-zinc-500 font-medium">No bays available</p>
        <p className="text-zinc-600 text-sm mt-1">Connect ESP32 to sync bays</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      {bays.map((bay) => {
        const bayStatus = getBayStatus(bay);
        const isDisabled = !bay.isActive || bay.hasActiveBooking;

        return (
          <button
            key={bay.id}
            type="button"
            onClick={() => !isDisabled && onSelect(bay.id)}
            disabled={isDisabled}
            className={`relative p-6 rounded-2xl border-2 transition-all hover:scale-105 ${
              selectedBay === bay.id
                ? `border-blue-500 ${bayStatus.bgColor} shadow-lg shadow-blue-500/20`
                : isDisabled
                ? `border-zinc-800 bg-zinc-900/30 opacity-50 cursor-not-allowed`
                : `border-zinc-700 bg-zinc-800/50 hover:border-zinc-600`
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                selectedBay === bay.id
                  ? 'bg-gradient-to-br from-blue-500 to-purple-500'
                  : isDisabled
                  ? 'bg-zinc-800'
                  : 'bg-gradient-to-br from-zinc-700 to-zinc-800'
              }`}>
                {isDisabled ? (
                  <svg className="w-6 h-6 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                  </svg>
                )}
              </div>
              <div className="text-center">
                <p className="font-bold text-zinc-100 uppercase">{bay.id}</p>
                <p className={`text-xs ${bayStatus.color}`}>
                  {bay.hasActiveBooking ? (
                    <span>
                      {bay.currentBooking?.customerName?.split(' ')[0] || 'Booked'}
                      {' '}until {new Date(bay.currentBooking?.endTime || '').toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  ) : (
                    bayStatus.status
                  )}
                </p>
              </div>
              {selectedBay === bay.id && (
                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
