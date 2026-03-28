#include <Arduino.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
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
  unsigned long endTime;
};

Bay bays[3] = {
  {"bay-01", RELAY_BAY1, false, 0},
  {"bay-02", RELAY_BAY2, false, 0},
  {"bay-03", RELAY_BAY3, false, 0},
};

WiFiClient espClient;
PubSubClient client(espClient);

unsigned long lastStatusPublish = 0;
const unsigned long STATUS_INTERVAL = 5000;

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
  bay.endTime = millis() + 3600000;
  Serial.printf("BAY %s: ON\n", bay.bayId);
}

void turnOffBay(Bay& bay) {
  digitalWrite(bay.relayPin, LOW);
  bay.active = false;
  bay.endTime = 0;
  Serial.printf("BAY %s: OFF\n", bay.bayId);
}

void callback(char* topic, byte* payload, unsigned int length) {
  StaticJsonDocument<512> doc;
  DeserializationError error = deserializeJson(doc, payload, length);
  
  if (error) {
    Serial.println("Failed to parse JSON");
    return;
  }
  
  const char* bayId = doc["bay_id"];
  
  if (strcmp(topic, TOPIC_BOOKING) == 0) {
    const char* event = doc["event"];
    
    for (int i = 0; i < 3; i++) {
      if (strcmp(bays[i].bayId, bayId) == 0) {
        if (strcmp(event, "booking_started") == 0) {
          turnOnBay(bays[i]);
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

void publishStatus() {
  StaticJsonDocument<512> doc;
  doc["success"] = true;
  doc["device_id"] = ("esp32-" + String(random(0xffff), HEX)).c_str();
  
  JsonArray baysArray = doc.createNestedArray("bays");
  
  for (int i = 0; i < 3; i++) {
    JsonObject bayObj = baysArray.createNestedObject();
    bayObj["bay_id"] = bays[i].bayId;
    bayObj["relay_pin"] = bays[i].relayPin;
    bayObj["active"] = bays[i].active;
    bayObj["lamp_1"] = digitalRead(bays[i].relayPin) == HIGH;
    bayObj["lamp_2"] = digitalRead(bays[i].relayPin) == HIGH;
  }
  
  char output[512];
  serializeJson(doc, output);
  client.publish(TOPIC_STATUS, output);
  Serial.printf("Status: %s\n", output);
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
  
  Serial.println("Bays initialized");
  Serial.println("Bay 01 -> GPIO 4");
  Serial.println("Bay 02 -> GPIO 5");
  Serial.println("Bay 03 -> GPIO 6");
  
  connectWiFi();
  connectMQTT();
  
  Serial.println("System ready!\n");
}

void loop() {
  client.loop();
  
  if (!client.connected()) {
    connectMQTT();
  }
  
  checkTimers();
  
  unsigned long now = millis();
  if (now - lastStatusPublish > STATUS_INTERVAL) {
    publishStatus();
    lastStatusPublish = now;
  }
  
  delay(100);
}
