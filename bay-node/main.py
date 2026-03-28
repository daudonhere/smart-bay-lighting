from machine import Pin
import time
import json
import network
from umqtt.simple import MQTTClient

WIFI_SSID = "YOUR_WIFI_SSID"
WIFI_PASSWORD = "YOUR_WIFI_PASSWORD"

MQTT_BROKER = "broker.emqx.io"
MQTT_CLIENT_ID = "esp32-" + str(time.time_ns())[:6]
MQTT_TOPICS = {
    'booking': b'smart-bay/booking',
    'status': b'smart-bay/status',
    'command': b'smart-bay/command',
}

BAYS = {
    "bay-01": {"relay_pin": 4, "lamp1": 1, "lamp2": 2, "end_time": None, "active": False},
    "bay-02": {"relay_pin": 5, "lamp1": 3, "lamp2": 4, "end_time": None, "active": False},
    "bay-03": {"relay_pin": 6, "lamp1": 7, "lamp2": 8, "end_time": None, "active": False},
}

relay_pins = {}
lamp_pins = {}

for bay_id, config in BAYS.items():
    relay = Pin(config["relay_pin"], Pin.OUT)
    relay.value(1)
    relay_pins[bay_id] = relay
    
    lamp1 = Pin(config["lamp1"], Pin.OUT)
    lamp2 = Pin(config["lamp2"], Pin.OUT)
    lamp1.value(0)
    lamp2.value(0)
    lamp_pins[bay_id] = (lamp1, lamp2)

client = None

def connect_wifi():
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)
    wlan.connect(WIFI_SSID, WIFI_PASSWORD)
    
    while not wlan.isconnected():
        time.sleep(1)

def mqtt_callback(topic, msg):
    try:
        data = json.loads(msg.decode())
        
        if topic == MQTT_TOPICS['booking']:
            handle_booking_event(data)
        elif topic == MQTT_TOPICS['command']:
            handle_command(data)
    except:
        pass

def handle_booking_event(data):
    bay_id = data.get("bay_id")
    event = data.get("event")
    
    if bay_id not in BAYS:
        return
    
    if event == "booking_started":
        turn_on(bay_id)
        BAYS[bay_id]["end_time"] = parse_time(data.get("end_time"))
    elif event == "booking_extended":
        BAYS[bay_id]["end_time"] = parse_time(data.get("end_time"))
    elif event == "booking_ended":
        turn_off(bay_id)
        BAYS[bay_id]["end_time"] = None

def handle_command(data):
    command = data.get("command")
    bay_id = data.get("bay_id")
    
    if command == "turn_on" and bay_id:
        turn_on(bay_id)
    elif command == "turn_off" and bay_id:
        turn_off(bay_id)
    elif command == "status_request":
        publish_status()

def turn_on(bay_id):
    relay_pins[bay_id].value(0)
    lamp_pins[bay_id][0].value(1)
    lamp_pins[bay_id][1].value(1)
    BAYS[bay_id]["active"] = True

def turn_off(bay_id):
    relay_pins[bay_id].value(1)
    lamp_pins[bay_id][0].value(0)
    lamp_pins[bay_id][1].value(0)
    BAYS[bay_id]["active"] = False

def parse_time(end_time_str):
    return time.time() + 3600

def check_timers():
    now = time.time()
    for bay_id, bay in BAYS.items():
        if bay["active"] and bay["end_time"]:
            if now >= bay["end_time"]:
                turn_off(bay_id)
                bay["end_time"] = None

def get_status_json():
    bays_status = []
    for bay_id, bay in BAYS.items():
        bays_status.append({
            "bay_id": bay_id,
            "relay_pin": bay["relay_pin"],
            "active": bay["active"],
            "lamps": {
                "lamp_1": lamp_pins[bay_id][0].value() == 1,
                "lamp_2": lamp_pins[bay_id][1].value() == 1,
            },
            "end_time": bay["end_time"]
        })
    
    return json.dumps({
        "success": True,
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "device_id": MQTT_CLIENT_ID,
        "bays": bays_status
    })

def publish_status():
    global client
    try:
        status = get_status_json()
        client.publish(MQTT_TOPICS['status'], status)
    except:
        pass

def connect_mqtt():
    global client
    client = MQTTClient(MQTT_CLIENT_ID, MQTT_BROKER)
    client.set_callback(mqtt_callback)
    client.connect()
    
    for topic in MQTT_TOPICS.values():
        client.subscribe(topic)

def main():
    connect_wifi()
    connect_mqtt()
    
    last_status_publish = 0
    status_interval = 5
    
    while True:
        try:
            client.check_msg()
            check_timers()
            
            if time.time() - last_status_publish > status_interval:
                publish_status()
                last_status_publish = time.time()
            
            time.sleep(0.1)
        except:
            time.sleep(1)

if __name__ == "__main__":
    main()
