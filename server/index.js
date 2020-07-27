import os from 'os';
import { Server } from 'ws';
import faker from 'faker';
import { WS_PORT } from '../shared/config';
import LobbyMessage, { CMD_LIST_PEERS } from '../shared/message/LobbyMessage';

const DEBUG = true;
const HOST = os.hostname();
const WS_URL = `http:\/\/${HOST}:${WS_PORT}\/`;

function generateName() {
  const nameOne = faker.name.firstName().toUpperCase();
  const nameTwo = faker.name.firstName().toUpperCase();
  const verb = faker.hacker.verb();

  return `${nameOne}${verb}${nameTwo}`
}

function debugClients(websockets) {
  if (DEBUG) {
    for (let socket of websockets.clients.values()) {
      console.log(socket.name);
    }
  }
}

function broadcaseMessageCmd(websockets, cmd) {
  const clients = [...websockets.clients.values()];
  const names = clients.map(s => s.name)
  const msg = new LobbyMessage(cmd, { names });

  for (let socket of websockets.clients.values()) {
    console.log('Sending msg::', msg.toString());
    socket.send(msg.toString());
  }
}

export function startServer() {

  // Start WebSocket Server.
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
      debugClients(websockets);
    });

    socket.on('close', () => {
      DEBUG && console.log('client disconneted');
      debugClients(websockets);
      broadcaseMessageCmd(websockets, CMD_LIST_PEERS);
    });

    // Inform peers of new connection.
    broadcaseMessageCmd(websockets, CMD_LIST_PEERS);
  });

  console.log('listing on', WS_URL);
}

// Start if we are the entry point.
if (!module.parent) {
  startServer();
}
