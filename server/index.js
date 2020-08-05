import { Server } from 'ws';
import faker from 'faker';
import { WS_PORT } from '../shared/config';
import LobbyMessage, {
  CMD_LIST_PEERS,
  CMD_REGISTER,
  CMD_ASK_TO_CONNECT,
  CMD_SIGNALING
} from '../shared/message/LobbyMessage';

const DEBUG = false;
const HOST = '0.0.0.0';
const WS_URL = `http:\/\/${HOST}:${WS_PORT}\/`;

function generateName() {
  const nameOne = faker.name.firstName()
  const lastName = faker.name.lastName()
  let verb = faker.hacker.verb();
  verb = verb[0].toUpperCase() + verb.slice(1);

  return `${verb} ${nameOne}`;
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
  const names = clients.filter(s => s.id).map(({ id, name }) => ({ id, name }));
  const msg = new LobbyMessage(cmd, { names });

  for (let socket of websockets.clients.values()) {
    console.log('Sending msg::', msg.toString());
    msg.params.me = socket.name;
    socket.send(msg.toString());
  }
}

function forwardMsg(websockets, socket, msg) {
  const clients = [...websockets.clients.values()];
  const peer = clients.find(s => s.id === msg.params.peerId);
  if (!peer) {
    console.error('No socket found with id', msg.cmd, msg.params);
    return;
  }

  msg.params.from = socket.id;
  peer.send(msg.toString());
}

function handleMessage(websockets, socket, msg) {
  switch (msg.cmd) {
    case CMD_REGISTER:
      socket.id = msg.params.id
      socket.name = generateName();
      broadcaseMessageCmd(websockets, CMD_LIST_PEERS);
      break;

    case CMD_ASK_TO_CONNECT:
    case CMD_SIGNALING:
      forwardMsg(websockets, socket, msg);
      break;

    default:
      console.error('unknown command', msg);
      break;
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
    DEBUG && console.log('NEW CONNECTION!');
    debugClients(websockets);

    socket.on('message', message => {
      handleMessage(websockets, socket, LobbyMessage.marshalFromString(message));
      debugClients(websockets);
    });

    socket.on('close', () => {
      DEBUG && console.log('client disconneted');
      debugClients(websockets);
      broadcaseMessageCmd(websockets, CMD_LIST_PEERS);
    });
  });

  console.log('listing on', WS_URL);
}

// Start if we are the entry point.
if (!module.parent) {
  startServer();
}
