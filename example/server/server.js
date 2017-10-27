const WebSocket = require('ws');
const fs = require('fs');

const opusPackets = './raw_opus/';
const interval = 0;
const packets;
const wss = new WebSocket.Server({ port: 8080 });

fs.readdir(opusPackets, (err, files) => {
    packets = files;
});

wss.on('connection', function connection(ws) {
      console.log('Socket connected. sending data...');
      setInterval(function() {
        sendPacket(ws);
      }, 50);
});

function sendPacket(ws) {
    const packet;
    if (typeof packet == undefined) return;
    if (packets.length ==0 ){
       clearInterval(interval);
       return;
    }
    
    packet = packet.shift();
    ws.send(packet);
}