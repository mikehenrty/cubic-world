import Socket, { EVT_MSG } from './Socket';
import { CMD_LIST_PEERS } from '/../shared/message/LobbyMessage';


export const EVT_PEERS = CMD_LIST_PEERS;
export const FAKE_LATENCY = 200;


export default class Network extends EventTarget {
  constructor() {
    super();
    this.socket = new Socket();
    this.socket.addEventListener(EVT_PEERS, this.onList.bind(this));
  }

  async init() {
    return this.socket.getRawSocket();
  }

  onList({ detail }) {
    console.log('got some details', detail);
    this.dispatchEvent(new CustomEvent(EVT_PEERS, { detail: detail.names }));
  }
}
