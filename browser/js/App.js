import Player from './Player';
import Engine from './Engine';
import Network, { EVT_PEERS, EVT_PEER_READY } from './Network';
import UI, { EVT_START, EVT_ASK, EVT_CONNECT } from './UI';


export default class App {
  constructor() {
    this.player = new Player();
    this.engine = new Engine();
    this.network = new Network();
    this.ui = new UI();
    this.initListeners();
  }

  initListeners() {
    this.network.addEventListener(EVT_PEERS, (evt) => {
      this.ui.setPeerList(evt.detail);
    });

    this.ui.addEventListener(EVT_START, () => {
      this.engine.start();
    });

    // ASK from UI is player initiated.
    this.ui.addEventListener(EVT_ASK, ({ detail }) => {
      this.network.sendAsk(detail);
    });

    // ASK coming from the network was initiated by a peer.
    this.network.addEventListener(EVT_ASK, ({ detail }) => {
      this.ui.handleAsk(detail);
    });

    // Both players have agreed, initiatite Peer2Peer connection.
    this.ui.addEventListener(EVT_CONNECT, ({ detail }) => {
      this.network.connectToPeer(detail.peerId);
    });

    // Peer to peer message is available.
    this.network.addEventListener(EVT_PEER_READY, ({ detail }) => {
      this.network.sendToPeer('hello', 'world');
    });
  }

  async start() {
    try {
      this.ui.init();
      await this.network.init(this.player.id);
    } catch(e) {
      console.error('could not connect', e);
      this.ui.setErrorMsg('ERROR: could not connect to lobby server');

      // Automatically start the game after displaying error message.
      setTimeout(() => {
        this.ui.hide();
        this.engine.start()
      }, 1000);
    }
  }
}
