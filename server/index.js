import os from 'os';
import { Server } from 'ws';
import faker from 'faker';
import { WS_PORT } from '../shared/config';

const DEBUG = true;
const HOST = os.hostname();
const WS_URL = `http:\/\/${HOST}:${WS_PORT}\/`;

function generateName() {
  const nameOne = faker.name.firstName().toUpperCase();
  const nameTwo = faker.name.firstName().toUpperCase();
  const verb = faker.hacker.verb();
  const adjective = faker.hacker.adjective();
  const obj = faker.commerce.productName();

  return `${nameOne} and ${nameTwo} ${verb} ${obj} only when ${adjective}.`;
}

function debugClients(websockets) {
  if (DEBUG) {
    for (let socket of websockets.clients.values()) {
      console.log(socket.name);
    }
  }
}

function broadcaseMessage(websockets) {
  const clients = [...websockets.clients.values()];
  msg = JSON.stringify(clients.map(s => s.name));
  for (let socket of websockets.clients.values()) {
    socket.send(msg);
  }
}

export function startServer() {
  // WebSocket Server.
  const websockets = new Server({
    host: HOST,
    port: WS_PORT,
    clientTracking: true,
  });

  websockets.on('connection', socket => {
    socket.name = generateName();

    DEBUG && console.log('NEW CONNECTION!');
    debugClients(websockets);

    socket.on('message', message => {
      DEBUG && console.log('got message', message);
      // handleMessage(socket, message);
      debugClients(websockets);
    });

    socket.on('close', () => {
      DEBUG && console.log('client disconneted');
      debugClients(websockets);
    });

    // Send welcome message.
    // socket.send(socket.name);
    broadcaseMessage(websockets);
  });

  console.log('listing on', WS_URL);
}

// Start if we are the entry point.
if (!module.parent) {
  startServer();
}
