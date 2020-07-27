import guid from '/../shared/guid';


const STORAGE_PREFIX = 'CUBIC_'
const LAST_PLAYER_ID = STORAGE_PREFIX + 'PLAYER';
const PLAYER_CACHE = STORAGE_PREFIX + 'CACHE_';


export default class Player {
  constructor() {
    this.id = null;
    this.name = null;

    if (!this.loadFromStorage()) {
      this.createAndStoreNewPlayer();
    }
  }

  createAndStoreNewPlayer() {
    this.id = guid();
    this.data = {};
    localStorage[LAST_PLAYER_ID] = this.id;
    localStorage[PLAYER_CACHE + this.id] = JSON.stringify(this.data);
  }

  loadFromStorage() {
    const id = localStorage[LAST_PLAYER_ID];
    if (!id) {
      return false;
    }

    let data;
    try {
      data = JSON.parse(localStorage[PLAYER_CACHE + id]);
    } catch (e) {
      console.error('Could not parse player', id);
      return false;
    }
    if (!data) {
      return false;
    }

    this.id = id;
    this.name = data.name;
    return true;
  }
}
