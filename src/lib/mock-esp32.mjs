#!/usr/bin/env node

import mqtt from 'mqtt';

const MQTT_BROKER = 'mqtt://broker.emqx.io:1883';
const CLIENT_ID = `mock-esp32-${process.pid}`;

const BAYS = {
  'bay-01': { relayPin: 4, active: false, endTime: null },
  'bay-02': { relayPin: 5, active: false, endTime: null },
  'bay-03': { relayPin: 6, active: false, endTime: null },
};

console.log('\nMock ESP32 Simulator Starting...');
console.log('Connecting to MQTT broker:', MQTT_BROKER);

const client = mqtt.connect(MQTT_BROKER, {
  clientId: CLIENT_ID,
  reconnectPeriod: 1000,
});

client.on('connect', () => {
  console.log('MQTT Connected');
  
  client.subscribe('smart-bay/booking', (err) => {
    if (!err) {
      console.log('Subscribed to: smart-bay/booking');
    }
  });
  
  client.subscribe('smart-bay/command', (err) => {
    if (!err) {
      console.log('Subscribed to: smart-bay/command');
    }
  });

  publishStatus();

  setInterval(publishStatus, 10000);
});

client.on('message', (topic, message) => {
  try {
    const data = JSON.parse(message.toString());
    
    console.log('\nReceived on', topic + ':');
    console.log('   ', JSON.stringify(data, null, 2));
    
    if (topic === 'smart-bay/booking') {
      handleBooking(data);
    } else if (topic === 'smart-bay/command') {
      handleCommand(data);
    }
  } catch (err) {
    console.error('Failed to parse message:', err.message);
  }
});

function handleBooking(data) {
  const { event, bay_id, booking_id } = data;

  if (!BAYS[bay_id]) {
    console.log(`Unknown bay: ${bay_id}`);
    return;
  }
  
  if (event === 'booking_started') {
    turnOnRelay(bay_id);
    BAYS[bay_id].endTime = Date.now() + 3600000;
    console.log(`Booking ID: ${booking_id}`);
  } else if (event === 'booking_ended') {
    turnOffRelay(bay_id);
    BAYS[bay_id].endTime = null;
  } else if (event === 'booking_extended') {
    BAYS[bay_id].endTime = Date.now() + 3600000;
    console.log(`Booking extended`);
  }
  
  publishStatus();
}

function handleCommand(data) {
  const { command, bay_id } = data;
  
  if (!bay_id || !BAYS[bay_id]) {
    console.log(`Invalid bay: ${bay_id}`);
    return;
  }
  
  if (command === 'turn_on') {
    turnOnRelay(bay_id);
  } else if (command === 'turn_off') {
    turnOffRelay(bay_id);
  } else if (command === 'reset_error') {
    console.log(`🔧 Error reset for ${bay_id}`);
  }
  
  publishStatus();
}

function turnOnRelay(bayId) {
  BAYS[bayId].active = true;
  console.log(`\nRELAY ON: ${bayId} (GPIO ${BAYS[bayId].relayPin})`);
  console.log(`LAMP 1: ON`);
  console.log(`LAMP 2: ON`);
}

function turnOffRelay(bayId) {
  BAYS[bayId].active = false;
  console.log(`\nRELAY OFF: ${bayId} (GPIO ${BAYS[bayId].relayPin})`);
  console.log(`LAMP 1: OFF`);
  console.log(`LAMP 2: OFF`);
}

function publishStatus() {
  const status = {
    result: {
      success: true,
      data: Object.entries(BAYS)
        .filter((entry) => entry[1].active)
        .map(([bayId, bay]) => ({
          event: 'booking_started',
          booking_id: 'active-booking',
          bay_id: bayId,
          customer: 'Active User',
          start_time: new Date().toISOString(),
          end_time: new Date(bay.endTime || Date.now()).toISOString(),
        })),
      count: Object.values(BAYS).filter(b => b.active).length || 3,
    },
  };
  
  if (status.result.data.length === 0) {
    status.result.data = [null];
  }
  
  client.publish('smart-bay/status', JSON.stringify(status));
}

setInterval(() => {
  const now = Date.now();

  Object.entries(BAYS).forEach(([bayId, bay]) => {
    if (bay.active && bay.endTime && now >= bay.endTime) {
      console.log(`\nTimer EXPIRED: ${bayId}`);
      turnOffRelay(bayId);
      publishStatus();
    }
  });
}, 1000);

client.on('error', (err) => {
  console.error('MQTT Error:', err.message);
});

client.on('close', () => {
  console.log('MQTT Disconnected');
});

console.log('\nMock ESP32 Ready!');
console.log('Monitoring bookings...\n');
console.log('─'.repeat(50));
