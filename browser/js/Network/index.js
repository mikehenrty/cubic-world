import Socket, { EVT_MSG } from './Socket';
import WebRTC, { EVT_READY, EVT_DISCONNECT } from './WebRTC';
import TimeSync, { EVT_SYNC } from './TimeSync';
import {
  CMD_LIST_PEERS,
  CMD_REGISTER,
  CMD_ASK_TO_CONNECT
} from '/../shared/message/LobbyMessage';
import {
  CMD_START,
  CMD_START_ACK,
  CMD_MOVE
} from '/../shared/message/PeerMessage';
import { START_DELAY } from '../Engine/constants'


export const EVT_PEERS = CMD_LIST_PEERS;
export const EVT_PEER_READY = EVT_READY;
export const EVT_PEER_DISCONNECT = EVT_DISCONNECT;
export const EVT_PEER_SYNC = EVT_SYNC;
export const EVT_ASK = CMD_ASK_TO_CONNECT;
export const EVT_START_GAME = CMD_START;
export const EVT_START_ACK = CMD_START_ACK;
export const EVT_MOVE = CMD_MOVE;
export const FAKE_LATENCY = 200;  // TODO: for debugging.


export default class Network extends EventTarget {
  constructor() {
    super();
    this.socket = new Socket();
    this.webRTC = new WebRTC(this.socket);
    this.time = new TimeSync(this.webRTC);

    this.socket.addEventListener(EVT_PEERS,
      this.forward.bind(this, EVT_PEERS));

    this.socket.addEventListener(EVT_ASK,
      this.forward.bind(this, EVT_ASK));

    // When ready for P2P messaging.
    this.webRTC.addEventListener(EVT_READY,
      this.forward.bind(this, EVT_PEER_READY));

    // When ready to start match.
    this.webRTC.addEventListener(EVT_START_GAME,
      this.forward.bind(this, EVT_START_GAME));

    // When match start time was accepted signal start.
    /* TODO: REMOVE ACK
    this.webRTC.addEventListener(EVT_START_ACK,
      this.forward.bind(this, EVT_START_GAME));
      */

    // When ready to start match.
    this.webRTC.addEventListener(EVT_MOVE,
      this.forward.bind(this, EVT_MOVE));

    // When ready to start match.
    this.webRTC.addEventListener(EVT_DISCONNECT,
      this.forward.bind(this, EVT_PEER_DISCONNECT));

    // When timestamps are synced, go.
    this.time.addEventListener(EVT_SYNC,
      this.forward.bind(this, EVT_PEER_SYNC));
  }

  async init(id) {
    await this.socket.send(CMD_REGISTER, { id });
  }

  async send(cmd, params, error) {
    return this.socket.send(cmd, params, error);
  }

  forward(evt, { detail }) {
    this.dispatchEvent(new CustomEvent(evt, { detail }));
  }

  sendAsk(detail) {
    this.webRTC.authorizePeer(detail.peerId);
    return this.send(CMD_ASK_TO_CONNECT, detail);
  }

  connectToPeer(peerId) {
    this.webRTC.authorizePeer(peerId);
    this.webRTC.connect(peerId);
  }

  sendToPeer(cmd, param, err) {
    this.webRTC.send(cmd, param, this.time.now(), err);
  }

  syncTimeWithPeer() {
    this.time.sync();
  }

  startGame(boardData) {
    const startTime = this.time.now() + START_DELAY;
    this.sendToPeer(CMD_START, startTime, boardData);

    // Start game immediately for this player.
    this.dispatchEvent(new CustomEvent(CMD_START, {
      detail: {
        arg: startTime
      }
    }));
  }

  sendMove(direction, finishAt) {
    if (this.webRTC.isConnected()) {
      this.sendToPeer(CMD_MOVE, direction, finishAt);
    }
  }
}
