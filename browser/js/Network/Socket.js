import { WS_DOMAIN, WS_EXTERNAL_PORT } from '/../shared/config';
import LobbyMessage from '/../shared/message/LobbyMessage';


export const WS_HOST = 'wss://' + WS_DOMAIN + ':' + WS_EXTERNAL_PORT;
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
        console.error('error at websocket level', ''+e, e.type);
        rej(e);
      });
      this.ws.addEventListener('open', () => {
        res(this.ws);
      });
    });
  }

  async send(cmd, params, error) {
    console.log('sending', cmd, params, error);
    const socket = await this.getRawSocket();
    const msg = new LobbyMessage(cmd, params, error);
    socket.send(msg.toString());
  }

  onMessage({ data }) {
    // Get a LobbyMessage object from server message string.
    const msg = LobbyMessage.marshalFromString(data);
    this.dispatchEvent(new CustomEvent(msg.cmd, { detail: msg.params }));
  }
}
