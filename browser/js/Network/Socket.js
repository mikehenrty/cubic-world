import { WS_PORT } from '/../shared/config';

export const WS_HOST = 'ws://' + window.location.hostname + ':' + WS_PORT;
export const EVT_MSG = 'message';


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
      this.ws.addEventListener(EVT_MSG, this.onMessage.bind(this));

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
    const parts = data.split('|');
    const name = parts.shift();

    this.dispatchEvent(new CustomEvent(EVT_MSG, { detail: name }));
  }
}
