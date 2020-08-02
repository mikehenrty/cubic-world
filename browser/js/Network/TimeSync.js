import { CMD_PING, CMD_PONG } from '/../shared/message/PeerMessage.js';

const SYNC_REPEATS = 10;

export const EVT_PING = CMD_PING;
export const EVT_PONG = CMD_PONG;
export const EVT_SYNC = 'TimeSync';

export default class TimeSync extends EventTarget {
  constructor(webRTC) {
    super();
    this.webRTC = webRTC;
    this.offset = 0;
    this.offsetSamples = [];
    this.syncing = false;

    this.webRTC.addEventListener(EVT_PING, this.onPing.bind(this));
  }

  now() {
    // TODO: retry performance.now
    return Math.round(Date.now() - this.offset);
  }

  onPing({ detail }) {
    console.log('got a ping', detail);
    // Avoid simulataneous syncing.
    if (this.syncing) {
      console.error('Cannot send pong while waiting for a pong');
      return;
    }
    this.webRTC.send(CMD_PONG, detail.timestamp, this.now());
  }

  // Sync should only be called from one of the peers.
  // The peer that syncs will offset her time to align
  // with the other peer's Date.now() result.
  sync() {
    this.syncing = true;

    const handlePong = ({ detail }) => {
      // https://en.wikipedia.org/wiki/Precision_Time_Protocol#Synchronization
      const T1 = detail.timestamp;
      const T1P = this.now();
      const T2 = parseInt(detail.arg, 10);
      const T2P = detail.timestamp;

      this.offsetSamples.push(0.5 * (T1P - T1 - T2P + T2));

      if (this.offsetSamples.length < SYNC_REPEATS) {
        setTimeout(() => {
          this.webRTC.send(CMD_PING, null, this.now());
        }, 200);

      } else {
        this.syncing = false;
        this.webRTC.removeEventListener(EVT_PONG, handlePong);

        console.log('offsets', this.offsetSamples);
        const offsetCount = this.offsetSamples.length;
        const offsetSum = this.offsetSamples.reduce((accum, offset) => {
          return accum + offset;
        }, 0);
        this.offset = Math.round(offsetSum / offsetCount);
        console.log('final offset', this.offset);
        this.dispatchEvent(new CustomEvent(EVT_SYNC));
      }
    }

    // Send the ping and wait for the pong.
    this.webRTC.addEventListener(EVT_PONG, handlePong);
    this.webRTC.send(CMD_PING, null, this.now());
  }

  debug() {
    setInterval(() => {
      console.log('--> ', Math.round(this.now()));
    }, 5);
  }
}
