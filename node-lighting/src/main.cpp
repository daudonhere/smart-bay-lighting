#include <Arduino.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

const char* WIFI_SSID = "Wokwi-GUEST";
const char* WIFI_PASSWORD = "";
const char* MQTT_BROKER = "broker.emqx.io";
const int MQTT_PORT = 1883;

const char* TOPIC_BOOKING = "smart-bay/booking";
const char* TOPIC_STATUS = "smart-bay/status";
const char* TOPIC_COMMAND = "smart-bay/command";

const int RELAY_BAY1 = 4;
const int RELAY_BAY2 = 5;
const int RELAY_BAY3 = 6;

struct Bay {
  const char* bayId;
  int relayPin;
  bool active;
  bool hasError;
  unsigned long endTime;
};

Bay bays[3] = {
  {"bay-01", RELAY_BAY1, false, false, 0},
  {"bay-02", RELAY_BAY2, false, false, 0},
  {"bay-03", RELAY_BAY3, false, false, 0},
};

WiFiClient espClient;
PubSubClient client(espClient);

unsigned long lastStatusPublish = 0;
const unsigned long STATUS_INTERVAL = 10000;

void connectWiFi() {
  Serial.print("Connecting to WiFi");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println("\nWiFi connected! IP: " + WiFi.localIP().toString());
}

void turnOnBay(Bay& bay) {
  digitalWrite(bay.relayPin, HIGH);
  bay.active = true;
  bay.hasError = false;
  bay.endTime = millis() + 3600000;
  Serial.printf("BAY %s: ON\n", bay.bayId);
}

void turnOffBay(Bay& bay) {
  digitalWrite(bay.relayPin, LOW);
  bay.active = false;
  bay.endTime = 0;
  Serial.printf("BAY %s: OFF\n", bay.bayId);
}

void setErrorBay(Bay& bay) {
  bay.hasError = true;
  bay.active = false;
  digitalWrite(bay.relayPin, LOW);
  Serial.printf("BAY %s: ERROR\n", bay.bayId);
}

void publishBookingResponse(JsonVariant bookingData) {
  JsonDocument doc;
  JsonObject result = doc["result"].to<JsonObject>();
  result["success"] = true;
  
  JsonArray dataArray = result["data"].to<JsonArray>();
  JsonObject bookingObj = dataArray.add<JsonObject>();
  
  bookingObj["event"] = bookingData["event"] | "booking_started";
  bookingObj["booking_id"] = bookingData["booking_id"] | "";
  bookingObj["bay_id"] = bookingData["bay_id"] | "";
  bookingObj["customer"] = bookingData["customer"] | "";
  bookingObj["start_time"] = bookingData["start_time"] | "";
  bookingObj["end_time"] = bookingData["end_time"] | "";
  
  result["count"] = 1;
  
  char output[512];
  serializeJson(doc, output);
  client.publish(TOPIC_STATUS, output);
  Serial.printf("Booking response published\n");
}

void publishStatus() {
  JsonDocument doc;
  JsonObject result = doc["result"].to<JsonObject>();
  result["success"] = true;
  
  JsonArray dataArray = result["data"].to<JsonArray>();
  int activeCount = 0;
  
  for (int i = 0; i < 3; i++) {
    if (bays[i].active) {
      JsonObject bookingObj = dataArray.add<JsonObject>();
      bookingObj["event"] = "booking_started";
      bookingObj["booking_id"] = "active-booking";
      bookingObj["bay_id"] = bays[i].bayId;
      bookingObj["customer"] = "Active User";
      bookingObj["start_time"] = "2026-03-28T10:00:00.000Z";
      bookingObj["end_time"] = "2026-03-28T11:00:00.000Z";
      activeCount++;
    }
  }
  
  if (activeCount == 0) {
    dataArray.add<JsonObject>();
  }
  
  result["count"] = activeCount > 0 ? activeCount : 3;
  
  char output[512];
  serializeJson(doc, output);
  client.publish(TOPIC_STATUS, output);
}

void publishErrorReport() {
  JsonDocument doc;
  JsonObject result = doc["result"].to<JsonObject>();
  result["success"] = true;
  
  JsonArray dataArray = result["data"].to<JsonArray>();
  int errorCount = 0;
  
  for (int i = 0; i < 3; i++) {
    if (bays[i].hasError) {
      JsonObject errorObj = dataArray.add<JsonObject>();
      errorObj["bay_id"] = bays[i].bayId;
      errorObj["message"] = "failure";
      errorCount++;
    }
  }
  
  result["count"] = 3 - errorCount;
  
  char output[512];
  serializeJson(doc, output);
  client.publish(TOPIC_STATUS, output);
  Serial.printf("Error report published\n");
}

void callback(char* topic, byte* payload, unsigned int length) {
  JsonDocument doc;
  DeserializationError error = deserializeJson(doc, payload, length);
  
  if (error) {
    Serial.println("Failed to parse JSON");
    return;
  }
  
  const char* bayId = doc["bay_id"];
  
  if (strcmp(topic, TOPIC_BOOKING) == 0) {
    const char* event = doc["event"];
    
    bool bayFound = false;
    for (int i = 0; i < 3; i++) {
      if (strcmp(bays[i].bayId, bayId) == 0) {
        bayFound = true;
        
        if (strcmp(event, "booking_started") == 0) {
          turnOnBay(bays[i]);
          publishBookingResponse(doc.as<JsonVariant>());
        }
        else if (strcmp(event, "booking_ended") == 0) {
          turnOffBay(bays[i]);
        }
        else if (strcmp(event, "booking_extended") == 0) {
          bays[i].endTime = millis() + 3600000;
          Serial.printf("BAY %s: EXTENDED\n", bays[i].bayId);
        }
        break;
      }
    }
    
    if (!bayFound) {
      Serial.printf("Unknown bay: %s\n", bayId);
    }
  }
  else if (strcmp(topic, TOPIC_COMMAND) == 0) {
    const char* command = doc["command"];
    
    for (int i = 0; i < 3; i++) {
      if (strcmp(bays[i].bayId, bayId) == 0) {
        if (strcmp(command, "turn_on") == 0) {
          turnOnBay(bays[i]);
        }
        else if (strcmp(command, "turn_off") == 0) {
          turnOffBay(bays[i]);
        }
        else if (strcmp(command, "reset_error") == 0) {
          bays[i].hasError = false;
          Serial.printf("BAY %s: ERROR RESET\n", bays[i].bayId);
        }
        break;
      }
    }
  }
}

void connectMQTT() {
  client.setServer(MQTT_BROKER, MQTT_PORT);
  client.setCallback(callback);
  
  String clientId = "esp32-" + String(random(0xffff), HEX);
  
  while (!client.connected()) {
    Serial.print("Connecting to MQTT...");
    
    if (client.connect(clientId.c_str())) {
      Serial.println("connected");
      client.subscribe(TOPIC_BOOKING);
      client.subscribe(TOPIC_COMMAND);
      Serial.println("Subscribed to topics");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      delay(2000);
    }
  }
}

void checkTimers() {
  unsigned long now = millis();
  
  for (int i = 0; i < 3; i++) {
    if (bays[i].active && bays[i].endTime > 0) {
      if (now >= bays[i].endTime) {
        turnOffBay(bays[i]);
        Serial.printf("Timer EXPIRED: %s\n", bays[i].bayId);
      }
    }
  }
}

void checkErrors() {
  bool hasAnyError = false;
  for (int i = 0; i < 3; i++) {
    if (bays[i].hasError) {
      hasAnyError = true;
      break;
    }
  }
  
  if (hasAnyError) {
    publishErrorReport();
  }
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("\n=== Smart Bay ESP32 ===");
  
  pinMode(RELAY_BAY1, OUTPUT);
  pinMode(RELAY_BAY2, OUTPUT);
  pinMode(RELAY_BAY3, OUTPUT);
  
  digitalWrite(RELAY_BAY1, LOW);
  digitalWrite(RELAY_BAY2, LOW);
  digitalWrite(RELAY_BAY3, LOW);
  
  Serial.println("Bays initialized (ALL OFF)");
  Serial.println("Bay 01 -> GPIO 4");
  Serial.println("Bay 02 -> GPIO 5");
  Serial.println("Bay 03 -> GPIO 6");
  
  connectWiFi();
  connectMQTT();
  
  publishStatus();
  
  Serial.println("System ready!\n");
}

void loop() {
  client.loop();
  
  if (!client.connected()) {
    connectMQTT();
  }
  
  checkTimers();
  checkErrors();
  
  unsigned long now = millis();
  if (now - lastStatusPublish > STATUS_INTERVAL) {
    publishStatus();
    lastStatusPublish = now;
  }
  
  delay(100);
}
