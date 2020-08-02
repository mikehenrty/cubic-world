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

  createDOM() {
    this.el = document.createElement('div');
    this.el.id = 'UI';

    this.messageEl = document.createElement('pre');
    this.peerContainer = document.createElement('div');
    this.startButton = document.createElement('button');
    this.startButton.textContent = 'Start Game';

    this.startButton.addEventListener('click', this.onStart.bind(this));

    this.el.appendChild(this.messageEl);
    this.el.appendChild(this.peerContainer);
    this.el.appendChild(this.startButton);
  }

  init() {
    document.body.appendChild(this.el);
  }

  onStart() {
    this.hide();
    this.dispatchEvent(new Event(EVT_START));
  }

  hide() {
    this.el.classList.add('hide');
  }

  show() {
    this.el.classList.remove('hide');
  }

  setPeerList({ me, names }) {
    this.messageEl.textContent = `Welcome ${me}!`;

    // Add connect buttons for each potential peer.
    this.peerContainer.innerHTML = '';
    names.filter(peer => peer.name !== me).forEach(peer => {
      const askButton = document.createElement('button');
      askButton.classList.add('ask-to-connect');
      askButton.textContent = `Connect to ${peer.name} - ${peer.id}`;
      askButton.value = peer.id;
      askButton.addEventListener('click', this.ask.bind(this, peer));
      this.peerContainer.appendChild(askButton);
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
