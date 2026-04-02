export const DEVICE_API = {
  SYNC: '/api/device/sync',
  INFO: '/api/device/info',
  CONTROL: '/api/device/control',
} as const;

export const BOOKING_API = {
  LIST: '/api/booking/list',
  CREATE: '/api/booking/create',
  UPDATE: '/api/booking/update',
  DELETE: '/api/booking/delete',
} as const;

export const BAY_API = {
  LIST: '/api/bay/list',
  UPDATE: '/api/bay/update',
  DELETE: '/api/bay/delete',
} as const;
