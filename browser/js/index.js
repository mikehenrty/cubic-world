import Engine from './game/Engine';
import Network, { EVT_PEERS } from './Network';
import UI from './UI';


const engine = new Engine();
const network = new Network();
const ui = new UI();

network.addEventListener(EVT_PEERS, (evt) => {
  console.log('engine, got evt', evt);
  ui.setPeerList(evt.detail);
});

ui.addEventListener(UI.EVT_START, (evt) => {
  engine.start();
});

async function run() {
  try {
    ui.start();
    await network.start();
  } catch(e) {
    ui.setErrorMsg('ERROR: could not connect');
    console.error('could not connect', e);
  } finally {
  }
}

run();
