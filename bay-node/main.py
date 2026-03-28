from machine import Pin
import time

bays = {
    "bay-01": {"pin": 4, "end_time": None, "active": False},
    "bay-02": {"pin": 5, "end_time": None, "active": False},
    "bay-03": {"pin": 6, "end_time": None, "active": False}
}

pins = {}

for bay_id, bay in bays.items():
    p = Pin(bay["pin"], Pin.OUT)
    p.value(1)
    pins[bay_id] = p

def turn_on(bay_id):
    pins[bay_id].value(0)
    bays[bay_id]["active"] = True

def turn_off(bay_id):
    pins[bay_id].value(1)
    bays[bay_id]["active"] = False

def parse_time(_):
    return time.time() + 60

def handle_event(data):
    bay_id = data["bay_id"]
    if data["event"] == "booking_started":
        turn_on(bay_id)
        bays[bay_id]["end_time"] = parse_time(data["end_time"])
    elif data["event"] == "booking_extended":
        bays[bay_id]["end_time"] = parse_time(data["end_time"])
    elif data["event"] == "booking_ended":
        turn_off(bay_id)
        bays[bay_id]["end_time"] = None

def check_timers():
    now = time.time()
    for bay_id, bay in bays.items():
        if bay["active"] and bay["end_time"]:
            if now >= bay["end_time"]:
                turn_off(bay_id)
                bay["end_time"] = None

handle_event({
    "event": "booking_started",
    "bay_id": "bay-01",
    "end_time": "x"
})

handle_event({
    "event": "booking_started",
    "bay_id": "bay-02",
    "end_time": "x"
})

while True:
    check_timers()
    time.sleep(1)