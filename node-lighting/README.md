# Node Lighting - ESP32 Firmware

Smart Bay lighting controller menggunakan ESP32-S3 dengan MQTT untuk komunikasi real-time.

## Hardware Setup

| Bay | GPIO Pin | Relay |
|-----|----------|-------|
| Bay 01 | GPIO 4 | Relay 1 |
| Bay 02 | GPIO 5 | Relay 2 |
| Bay 03 | GPIO 6 | Relay 3 |

## Configuration

Edit `src/main.cpp`:
```cpp
const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
```

## Build & Upload

```bash
cd node-lighting
pio run --target upload
```

## Serial Monitor

```bash
pio device monitor
```

## MQTT Topics

| Topic | Direction | Description |
|-------|-----------|-------------|
| `smart-bay/booking` | Dashboard → ESP32 | Booking events |
| `smart-bay/status` | ESP32 → Dashboard | Device status |
| `smart-bay/command` | Dashboard → ESP32 | Manual commands |

## Booking Event Format

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

## Status Response Format

```json
{
  "success": true,
  "device_id": "esp32-abc123",
  "bays": [
    {
      "bay_id": "bay-01",
      "relay_pin": 4,
      "active": true,
      "lamp_1": true,
      "lamp_2": true
    }
  ]
}
```

## Wokwi Simulator

1. Buka `diagram.json` di VSCode
2. F1 → Wokwi: Start Simulator

## Dependencies

- **PubSubClient** - MQTT client library
- **ArduinoJson** - JSON parsing
- **WiFi** - ESP32 WiFi (built-in)
