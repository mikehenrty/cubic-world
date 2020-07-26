import os from 'os';
import { Server } from 'ws';

const DEBUG = true;
const HOST = os.hostname();
const WS_PORT = 8081;
const WS_URL = `http:\/\/${HOST}:${WS_PORT}\/`;

export function debugClients(websockets) {
  DEBUG && console.log(websockets.clients);
}

export function startServer() {
  // WebSocket Server.
  const websockets = new Server({
    host: HOST,
    port: WS_PORT,
    clientTracking: true,
  });

  websockets.on('connection', socket => {
    DEBUG && console.log('NEW CONNECTION!');
    debugClients(websockets);

    socket.on('message', message => {
      DEBUG && console.log('got message', message);
      // handleMessage(socket, message);
      debugClients(websockets);
    });

    socket.on('close', () => {
      console.debug(`disconnect ${clients.getName(socket)}`);
      // clients.remove(socket);
      // broadcastListUpdate(socket);
      debugClients(websockets);
    });
  });
}

// Start if we are the entry point.
if (!module.parent) {
  startServer();
}
