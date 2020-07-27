import Socket, { EVT_MSG } from './Socket';
import { CMD_LIST_PEERS, CMD_REGISTER } from '/../shared/message/LobbyMessage';


export const EVT_PEERS = CMD_LIST_PEERS;
export const FAKE_LATENCY = 200;


export default class Network extends EventTarget {
  constructor() {
    super();
    this.socket = new Socket();
    this.socket.addEventListener(EVT_PEERS, this.onList.bind(this));
  }

  async init(id) {
    await this.socket.send(CMD_REGISTER, { id });
  }

  onList({ detail }) {
    this.dispatchEvent(new CustomEvent(EVT_PEERS, { detail }));
  }
}
