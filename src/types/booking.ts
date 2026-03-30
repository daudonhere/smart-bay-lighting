export interface Booking {
  id: string;
  bayId: string;
  customerName: string;
  startTime: string;
  endTime: string;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface Bay {
  id: string;
  relayPin?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingDto {
  bayId: string;
  customerName: string;
  startTime: string;
  endTime: string;
}

export interface UpdateBookingDto {
  bayId?: string;
  customerName?: string;
  startTime?: string;
  endTime?: string;
  status?: 'active' | 'completed' | 'cancelled';
}

export interface BookingEventResponse {
  event: 'booking_started' | 'booking_ended' | 'booking_extended';
  booking_id: string;
  bay_id: string;
  customer: string;
  start_time: string;
  end_time: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
  error?: string;
  message?: string;
}

export interface BayStatus {
  bay_id: string;
  relay_pin: number;
  active: boolean;
  lamps: {
    lamp_1: boolean;
    lamp_2: boolean;
  };
  end_time: string | null;
}
