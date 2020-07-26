import Socket, { EVT_MSG } from './Socket';

export const EVT_PEERS = 'peers';
export const FAKE_LATENCY = 200;

export default class Network extends EventTarget {
  constructor() {
    super();
    this.socket = new Socket();
    this.socket.addEventListener(EVT_MSG, (evt) => {
      console.log('got here anywy');
      switch (evt.type) {
        case EVT_MSG:
          this.onMessage(evt.detail);
          break;

        default:
          console.warn('Unknown event type', evt.type);
          break;
      }
    });
  }

  async init() {
    return this.socket.getRawSocket();
  }

  onMessage(detail) {
    this.dispatchEvent(new CustomEvent(EVT_PEERS, { detail }));
  }
}
