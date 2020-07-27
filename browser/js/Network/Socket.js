import { WS_PORT } from '/../shared/config';
import LobbyMessage from '/../shared/message/LobbyMessage';


export const WS_HOST = 'ws://' + window.location.hostname + ':' + WS_PORT;
export const WS_EVT_MSG = 'message';


export default class Socket extends EventTarget {
  constructor() {
    super();
    this.ws = null;
  }

  async getRawSocket() {
    if (this.ws) {
      return this.ws;
    }

    return new Promise((res, rej) => {
      this.ws = new WebSocket(WS_HOST);
      this.ws.addEventListener(WS_EVT_MSG, this.onMessage.bind(this));

      this.ws.addEventListener('error', (e) => {
        console.error('error at websocket level', e);
        rej(e);
      });
      this.ws.addEventListener('open', () => {
        res();
      });
    });
  }

  onMessage({ data }) {
    // Get a LobbyMessage object from server message string.
    const msg = LobbyMessage.marshalFromString(data);
    this.dispatchEvent(new CustomEvent(msg.cmd, { detail: msg.params }));
  }
}
