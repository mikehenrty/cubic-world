import Player from './Player';
import Engine from './Engine';
import Network, { EVT_PEERS } from './Network';
import UI, { EVT_START } from './UI';


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
  }

  async start() {
    try {
      this.ui.init();
      await this.network.init(this.player.id);
    } catch(e) {
      console.error('could not connect', e);
      this.ui.setErrorMsg('ERROR: could not connect to lobby server');
    }
  }
}
