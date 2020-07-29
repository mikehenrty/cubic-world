import Socket, { EVT_MSG } from './Socket';
import WebRTC, { EVT_READY } from './WebRTC';
import {
  CMD_LIST_PEERS,
  CMD_REGISTER,
  CMD_ASK_TO_CONNECT
} from '/../shared/message/LobbyMessage';


export const EVT_PEERS = CMD_LIST_PEERS;
export const EVT_PEER_READY = EVT_READY;
export const EVT_ASK = CMD_ASK_TO_CONNECT;
export const FAKE_LATENCY = 200;


export default class Network extends EventTarget {
  constructor() {
    super();
    this.socket = new Socket();
    this.webRTC = new WebRTC(this.socket);

    this.socket.addEventListener(EVT_PEERS, this.forward.bind(this, EVT_PEERS));
    this.socket.addEventListener(EVT_ASK, this.forward.bind(this, EVT_ASK));

    // When ready for P2P messaging.
    this.webRTC.addEventListener(EVT_READY,
      this.forward.bind(this, EVT_PEER_READY));
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
    this.webRTC.connect(peerId);
  }

  sendToPeer(cmd, param) {
    this.webRTC.send(cmd, param);
  }
}
