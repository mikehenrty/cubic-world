import Engine from './Engine';
import Network, { EVT_PEERS } from './Network';
import UI, { EVT_START } from './UI';


const engine = new Engine();
const network = new Network();
const ui = new UI();

network.addEventListener(EVT_PEERS, (evt) => {
  ui.setPeerList(evt.detail);
});

ui.addEventListener(EVT_START, (evt) => {
  engine.start();
});

async function run() {
  try {
    ui.init();
    await network.start();
  } catch(e) {
    console.error('could not connect', e);
    ui.setErrorMsg('ERROR: could not connect to lobby server');
  }
}

run();
