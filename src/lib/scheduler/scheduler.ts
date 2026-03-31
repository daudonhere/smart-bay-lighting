import { bookingScheduler } from './bookingScheduler';

if (process.env.NODE_ENV === 'development') {
  bookingScheduler.start();
}

export {};
