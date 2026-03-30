# Smart Bay Lighting

A smart lighting control system for parking bays with real-time MQTT communication between Next.js dashboard and ESP32 microcontroller.

## Features

- 🏗️ **Self-Booking Dashboard** - Users can book parking bays with automated lighting control
- 💡 **Real-time Control** - Lights turn on/off automatically based on booking schedule
- 🔄 **MQTT Communication** - Bi-directional communication between dashboard and ESP32
- 📱 **Responsive UI** - Modern dashboard with real-time status updates
- ⏰ **Scheduler System** - Automated booking triggers (30s before start, 30s after end)

## Tech Stack

### Frontend
- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling
- **React Query** - State management & caching
- **MQTT.js** - Real-time communication

### Backend
- **Next.js API Routes** - RESTful endpoints
- **Prisma ORM** - Database management
- **SQLite** - Local database
- **MQTT Bridge** - ESP32 communication

### Hardware
- **ESP32-S3** - Microcontroller
- **MQTT (EMQX Public Broker)** - Device communication
- **Relay Modules** - Light control (GPIO 4, 5, 6)

## Prerequisites

- Node.js 18+ and npm
- PlatformIO (for ESP32 development)
- Wokwi Simulator (optional, for testing)

## Installation

### 1. Clone Repository

```bash
git clone <repository-url>
cd smart-bay-lighting
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Database

```bash
npx prisma generate
npx prisma migrate dev
```

## Running the Application

### Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the dashboard.

### Mock ESP32 Simulator (Node.js)

For testing without physical hardware:

```bash
node mock-esp32.js
```

This simulates ESP32 behavior:
- Connects to MQTT broker
- Subscribes to `smart-bay/booking` and `smart-bay/command`
- Publishes status updates every 10 seconds
- Handles booking events (turn lights on/off)

### Wokwi Simulator (ESP32 Simulation)

1. Open VS Code
2. Install Wokwi extension
3. Open `node-lighting/diagram.json`
4. Press `F1` → `Wokwi: Start Simulator`

The simulator will:
- Boot ESP32 with firmware
- Connect to MQTT broker
- Control virtual LEDs based on bookings

### Physical ESP32 Device

```bash
cd node-lighting
pio run --target upload
pio device monitor
```

## Project Structure

```
smart-bay-lighting/
├── src/
│   ├── app/
│   │   ├── api/              # API endpoints
│   │   │   ├── bays/         # Bay management
│   │   │   ├── bookings/     # Booking CRUD
│   │   │   ├── command/      # MQTT command endpoint
│   │   │   ├── sync/         # Device sync endpoint
│   │   │   └── info/         # Device info endpoint
│   │   ├── docs/             # API documentation
│   │   ├── monitoring/       # Device monitoring page
│   │   └── page.tsx          # Dashboard (self-booking)
│   ├── components/
│   │   ├── BaySelector.tsx   # Bay selection grid
│   │   ├── BookingCard.tsx   # Booking card with actions
│   │   ├── BookingList.tsx   # Active bookings list
│   │   ├── DateTimePicker.tsx # Custom datetime picker
│   │   └── Sidebar.tsx       # Navigation sidebar
│   ├── contexts/
│   │   └── MqttContext.tsx   # MQTT context provider
│   ├── hooks/
│   │   └── useBooking.ts     # React Query hooks
│   ├── lib/
│   │   ├── mqtt/
│   │   │   ├── bridge.ts     # Server-side MQTT bridge
│   │   │   ├── config.ts     # MQTT configuration
│   │   │   └── service.ts    # Client-side MQTT service
│   │   ├── bookingScheduler.ts # Automated booking triggers
│   │   └── prisma.ts         # Prisma client singleton
│   └── types/
│       └── booking.ts        # TypeScript types
├── node-lighting/
│   ├── src/main.cpp          # ESP32 firmware
│   ├── diagram.json          # Wokwi simulation config
│   └── platformio.ini        # PlatformIO config
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── dev.db                # SQLite database
└── mock-esp32.js             # Node.js ESP32 simulator
```

## API Endpoints

### Bookings

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/bookings` | Get all bookings |
| `POST` | `/api/bookings` | Create new booking |
| `PATCH` | `/api/bookings` | Extend booking time |
| `DELETE` | `/api/bookings?id=` | Cancel booking |

### Bays

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/bays` | Get all bays with status |
| `PUT` | `/api/bays` | Update bay status |
| `DELETE` | `/api/bays?id=` | Delete bay |

### Device Sync

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/sync` | Request device info from ESP32 |
| `PUT` | `/api/sync` | Sync device info to database |
| `GET` | `/api/info` | Get device info |

### Manual Control

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/command` | Send manual command to ESP32 |

## Architecture

### Device State Management

Device state is managed through a **multi-layer synchronization system**:

1. **Database (Source of Truth)**
   - Bay status stored in SQLite (`isActive` field)
   - Booking status tracked (`created`, `started`, `extended`, `ended`, `cancelled`)
   - All state changes persisted immediately

2. **MQTT Real-time Sync**
   - ESP32 publishes status every 10 seconds to `smart-bay/status`
   - Dashboard subscribes and updates UI in real-time
   - Two-way communication ensures consistency

3. **Client-side State**
   - React Query caches booking/bay data
   - MQTT context maintains live connection state
   - Optimistic updates for instant UI feedback

4. **State Flow**
   ```
   User Action → API → Database → MQTT → ESP32 → Status Update → Dashboard
   ```

### Duplicate Event Prevention

Multiple mechanisms prevent duplicate event processing:

1. **Scheduler Tracking**
   ```typescript
   private processedBookings: Map<string, string> = new Map();
   
   // Unique key per booking per event type
   const processedKey = `${booking.id}-started`;
   if (this.processedBookings.has(processedKey)) {
     return; // Skip already processed
   }
   ```

2. **Database Status Check**
   - Scheduler only processes bookings with specific status
   - `created` → can trigger `booking_started`
   - `started`/`extended` → can trigger `booking_ended`
   - Status update is atomic (Prisma transaction)

3. **Idempotent API Endpoints**
   - Same event published multiple times has no side effects
   - Database constraints prevent duplicate bookings
   - Status transitions are validated

4. **ESP32 Event Handling**
   ```cpp
   if (strcmp(event, "booking_started") == 0) {
     turnOnBay(bays[i]);  // Safe to call multiple times
   }
   ```
   - Relay state is idempotent (ON stays ON)
   - No cumulative effects from duplicate messages

## Booking Flow

### 1. Create Booking
```
User creates booking → status: "created" → Bay: available
```

### 2. Auto-Start (30s before start time)
```
Scheduler triggers → status: "started" → Bay: unavailable → MQTT: booking_started → ESP32: Light ON
```

### 3. Extend Booking (optional)
```
User extends → status: "extended" → New end time → MQTT: booking_extended → ESP32: Timer reset
```

### 4. Auto-End (30s after end time)
```
Scheduler triggers → status: "ended" → Bay: available → MQTT: booking_ended → ESP32: Light OFF
```

## Configuration

### MQTT Broker

Default: `mqtt://broker.emqx.io:1883` (public broker)

To use custom broker, update:
- `src/lib/mqtt/config.ts` (client)
- `src/lib/mqtt/bridge.ts` (server)
- `node-lighting/src/main.cpp` (ESP32)

### Database

SQLite database located at `prisma/dev.db`

To reset:
```bash
rm prisma/dev.db
npx prisma migrate dev
```

## Testing

### Manual Testing

1. Create booking with start time 1 minute from now
2. Wait for scheduler trigger (check console)
3. Verify bay status changes to "Booked" (red)
4. Check ESP32 terminal for light ON event
5. Wait for end time + 30s
6. Verify bay becomes available and light OFF

### API Testing

Use `/docs` page to test endpoints directly from browser.

## Troubleshooting

### ESP32 Not Connecting

1. Check WiFi connection (SSID: `Wokwi-GUEST` for simulator)
2. Verify MQTT broker is accessible
3. Check serial monitor for error messages

### Booking Not Triggering

1. Check scheduler is running (server console)
2. Verify booking start time is in the future
3. Check database status is `created` or `started`

### UI Not Updating

1. Check MQTT connection in browser console
2. Verify `lastStatus` is receiving data
3. Try manual sync button in monitoring page

## License

MIT
