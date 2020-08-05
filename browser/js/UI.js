import {
  CMD_ASK_TO_CONNECT,
  CMD_CONNECT_TO_PEER
} from '/../shared/message/LobbyMessage.js'


export const EVT_START = 'Start';
export const EVT_ASK = CMD_ASK_TO_CONNECT;
export const EVT_CONNECT = CMD_CONNECT_TO_PEER;


export default class UI extends EventTarget {
  constructor() {
    super();
    this.createDOM();
  }

  make(elementType, textContent, parent) {
    const el = document.createElement(elementType);

    if (textContent) {
      el.textContent = textContent;
    }

    if (parent) {
      parent.appendChild(el);
    } else if (this.rootEl) {
      this.rootEl.appendChild(el);
    }

    return el;
  }

  createDOM() {
    this.rootEl = this.make('div');
    this.rootEl.id = 'UI';

    this.welcomeMessage = this.make('h1', 'Welcome to Cubic!')
    this.explainer = this.make(
      'p',
      `Cubic is a multiplayer puzzle racing game.`,
    );

    /*
    this.explainer2 = this.make(
      'p',
      `The goal is roll your cube across 
       the finish line before your opponent.`,
    );
    */

    this.onlineContainer = this.make('div');
    this.onlineContainer.id = 'online';
    this.onlineInfo = this.make('h3', 'Play Online', this.onlineContainer);
    this.messageEl = this.make('p', 'Loading', this.onlineContainer);
    this.peerContainer = this.make('ul', null, this.onlineContainer);

    this.startButton = this.make('button', 'Practice Offline');
    this.startButton.id = 'play-offline';
    this.startButton.addEventListener('click', this.onStart.bind(this));

    this.signature = this.make('p');
    this.signature.classList.add('signature');
    this.signature.innerHTML =
      'Hacked together by <a target="_blank" href="https://twitter.com/mikehenrty">mikehenrty</a>.'

    this.signature2 = this.make('p');
    this.signature2.classList.add('signature');
    this.signature2.innerHTML =
      'Souce code on <a href="https://github.com/mikehenrty/cubic-world/">GitHub</a>.'

  }

  init() {
    document.body.appendChild(this.rootEl);
  }

  onStart() {
    this.hide();
    this.dispatchEvent(new Event(EVT_START));
  }

  hide() {
    this.rootEl.classList.add('hide');
  }

  show() {
    this.rootEl.classList.remove('hide');
  }

  setPeerList({ me, names }) {
    this.messageEl.innerHTML = `Your cubic persona is "<b>${me}</b>!"`;

    // Add connect buttons for each potential peer.
    this.peerContainer.innerHTML = '';
    names.filter(peer => peer.name !== me).forEach(peer => {
      const item = this.make('li', null, this.peerContainer);
      const askButton = this.make('button', `Play`, item);
      const description = this.make('span', `vs. "${peer.name}"`, item);
      askButton.classList.add('ask-to-connect');
      askButton.value = peer.id;
      askButton.addEventListener('click', this.ask.bind(this, peer));
    });
  }

  ask(peer) {
    this.dispatchEvent(new CustomEvent(CMD_ASK_TO_CONNECT, {
      detail: {
        peerId: peer.id,
        name: peer.name,
      }
    }));
  }

  handleAsk(detail) {
    if (confirm(`Do you wanna play ${detail.name}?`)) {
      // Initiate WebRTC connection.
      this.dispatchEvent(new CustomEvent(CMD_CONNECT_TO_PEER, {
        detail: {
          peerId: detail.from
        }
      }));
    }
  }

  setErrorMsg(msg) {
    this.messageEl.textContent = msg;
    this.messageEl.style.color = 'red';
  }

  setMsg(msg) {
    this.messageEl.textContent = msg;
    this.messageEl.style.color = 'black';
  }
}
