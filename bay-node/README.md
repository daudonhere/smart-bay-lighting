# Smart Bay MQTT Setup

## Overview

Sistem ini menggunakan MQTT untuk komunikasi real-time antara dashboard Next.js dan ESP32.

## Topik MQTT

| Topik | Direction | Deskripsi |
|-------|-----------|-----------|
| `smart-bay/booking` | Dashboard → ESP32 | Event booking (started/ended/extended) |
| `smart-bay/status` | ESP32 → Dashboard | Status relay & GPIO real-time |
| `smart-bay/command` | Dashboard → ESP32 | Manual command (turn_on/turn_off) |

## Format Payload

### Booking Event (Dashboard → ESP32)
```json
{
  "event": "booking_started",
  "booking_id": "cm3qk1234",
  "bay_id": "bay-01",
  "customer": "John Doe",
  "start_time": "2026-03-28T10:00:00.000Z",
  "end_time": "2026-03-28T11:00:00.000Z"
}
```

### Status Response (ESP32 → Dashboard)
```json
{
  "success": true,
  "timestamp": "2026-03-28T10:30:00.000Z",
  "device_id": "esp32-abc123",
  "bays": [
    {
      "bay_id": "bay-01",
      "relay_pin": 4,
      "active": true,
      "lamps": {
        "lamp_1": true,
        "lamp_2": true
      },
      "end_time": 1711620000
    }
  ]
}
```

### Manual Command (Dashboard → ESP32)
```json
{
  "command": "turn_on",
  "bay_id": "bay-01",
  "booking_id": "manual-123"
}
```

## Setup ESP32

1. Install MicroPython di ESP32
2. Edit `bay-node/main.py`:
   - Ganti `WIFI_SSID` dan `WIFI_PASSWORD`
3. Upload ke ESP32:
   ```bash
   ampy --port /dev/ttyUSB0 put bay-node/main.py main.py
   ```

## Setup Dashboard

1. Install dependencies:
   ```bash
   npm install mqtt
   ```

2. (Optional) Set custom MQTT broker:
   ```bash
   export NEXT_PUBLIC_MQTT_BROKER_URL="ws://your-broker:8083/mqtt"
   ```

3. Run dashboard:
   ```bash
   npm run dev
   ```

## Monitoring

- Dashboard: `/monitoring` - Real-time relay status
- API: `/api/mqtt/status` - Get current device status
- API: `/api/mqtt/publish` - Publish manual events

## Public Broker

Default menggunakan public broker: `ws://broker.emqx.io:8083/mqtt`

Untuk production, setup MQTT broker sendiri:
- Mosquitto
- EMQX
- HiveMQ
