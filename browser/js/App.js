import Player from './Player';
import Engine, { EVT_CUBE_MOVE } from './Engine';
import Network, {
  EVT_PEERS,
  EVT_PEER_READY,
  EVT_PEER_SYNC,
  EVT_START_GAME,
  EVT_MOVE,
  EVT_PEER_DISCONNECT
} from './Network';
import UI, { EVT_START, EVT_ASK, EVT_CONNECT, EVT_INVITE } from './UI';


export default class App {
  constructor() {
    this.player = new Player();
    this.playerNum = 0;
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

    // If user came from an invite link, initiate "ask" flow.
    this.ui.addEventListener(EVT_INVITE, ({ detail }) => {
      this.engine.weArePlayerOne();
      this.network.sendAsk(detail);
    });

    // ASK from UI is player initiated.
    this.ui.addEventListener(EVT_ASK, ({ detail }) => {
      this.engine.weArePlayerOne();
      this.network.sendAsk(detail);
    });

    // ASK coming from the network was initiated by a peer.
    this.network.addEventListener(EVT_ASK, ({ detail }) => {
      this.ui.handleAsk(detail);
    });

    // Both players have agreed, initiatite Peer2Peer connection.
    this.ui.addEventListener(EVT_CONNECT, ({ detail }) => {
      this.engine.weArePlayerTwo();
      this.network.connectToPeer(detail.peerId);
    });

    // Peer to peer message is available, both players get this event.
    this.network.addEventListener(EVT_PEER_READY, ({ detail }) => {
      this.ui.onPeerSync();
      this.playerNum = detail.playerNum;
      if (this.playerNum === 1) {
        this.network.syncTimeWithPeer();
      }
    });

    // Timestamps are synced up and we can negotiate the start of the game.
    this.network.addEventListener(EVT_PEER_SYNC, () => {
      if (this.playerNum !== 1) {
        console.error('Got sync event as second player, ignoring');
        return;
      }
      this.engine.initWorld();
      this.network.startGame(this.engine.getBoardData());
    });

    // Game is ready to go!
    this.network.addEventListener(EVT_START_GAME, ({ detail }) => {
      // We hijacked the error field to pass extra data.
      if (detail.error) {
        this.engine.initWorld(detail.error);
      }

      this.ui.hide();

      const startTime = parseInt(detail.arg, 10);
      const delay = startTime - this.network.time.now();
      this.engine.start(delay);
    });

    this.engine.addEventListener(EVT_CUBE_MOVE, ({ detail }) => {
      const finishAt = this.network.time.now() + detail.duration;
      this.network.sendMove(detail.direction, finishAt);
    });

    this.network.addEventListener(EVT_MOVE, ({ detail }) => {
      const duration = parseInt(detail.error, 10) - this.network.time.now();
      this.engine.initiateMoveOpponent(detail.arg, duration);
    });

    // Peer disconnect, restart.
    this.network.addEventListener(EVT_PEER_DISCONNECT, () => {
      this.engine.signalDisconnect();
     });
  }

  async start() {
    try {
      await this.network.init(this.player.id);
      this.ui.init();

      // TODO: remove this autostart.
      //this.ui.hide();
      //this.engine.start()
    } catch(e) {
      console.error('could not connect', e);
      this.ui.init();
      this.ui.setErrorMsg('ERROR: could not connect to lobby server');

      /*
      // Automatically start the game after displaying error message.
      setTimeout(() => {
        this.ui.hide();
        this.engine.start()
      }, 1000);
      */
    }
  }
}
