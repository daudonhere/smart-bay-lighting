import { prisma } from '@/lib/prisma';
import { mqttBridgeService } from '@/lib/mqtt/bridge';

const CHECK_INTERVAL = 10000;

interface BookingEvent {
  event: 'booking_created' | 'booking_started' | 'booking_extended' | 'booking_ended';
  booking_id: string;
  bay_id: string;
  customer: string;
  start_time: string;
  end_time: string;
}

class BookingScheduler {
  private processedBookings: Map<string, string> = new Map();
  private isRunning: boolean = false;

  start() {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;

    setInterval(() => this.checkBookings(), CHECK_INTERVAL);
    this.checkBookings();
  }

  stop() {
    this.isRunning = false;
  }

  private async checkBookings() {
    try {
      const now = new Date();
      const thirtySeconds = 30 * 1000;

      const bookings = await prisma.booking.findMany({
        where: {
          status: {
            in: ['created', 'started', 'extended'],
          },
        },
      });

      for (const booking of bookings) {
        const startTime = new Date(booking.startTime).getTime();
        const endTime = new Date(booking.endTime).getTime();
        const currentTime = now.getTime();

        if (booking.status === 'created') {
          const triggerTime = startTime - thirtySeconds;
          const processedKey = `${booking.id}-started`;

          if (currentTime >= triggerTime && !this.processedBookings.has(processedKey)) {
            await this.triggerEvent(booking, 'booking_started');
            this.processedBookings.set(processedKey, booking.status);
          }
        } else if (booking.status === 'started' || booking.status === 'extended') {
          const triggerTime = endTime + thirtySeconds;
          const processedKey = `${booking.id}-ended`;

          if (currentTime >= triggerTime && !this.processedBookings.has(processedKey)) {
            await this.triggerEvent(booking, 'booking_ended');
            this.processedBookings.set(processedKey, booking.status);
          }
        }
      }
    } catch {
    }
  }

  private async triggerEvent(
    booking: { id: string; bayId: string; customerName: string; startTime: Date; endTime: Date },
    event: 'booking_started' | 'booking_ended'
  ) {
    const eventData: BookingEvent = {
      event,
      booking_id: booking.id,
      bay_id: booking.bayId,
      customer: booking.customerName,
      start_time: booking.startTime.toISOString(),
      end_time: booking.endTime.toISOString(),
    };

    const statusUpdate = event === 'booking_started' ? 'started' : 'ended';

    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: statusUpdate,
      },
    });

    await prisma.bay.update({
      where: { id: booking.bayId },
      data: {
        isActive: event === 'booking_ended' ? true : false,
      },
    });

    await mqttBridgeService.publishBooking(eventData);
  }
}

export const bookingScheduler = new BookingScheduler();
