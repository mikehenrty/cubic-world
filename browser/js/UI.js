export const EVT_START = 'start';
export default class UI extends EventTarget {
  constructor() {
    super();
    this.createDOM();
  }

  createDOM() {
    this.el = document.createElement('div');
    this.el.id = 'UI';

    this.messageEl = document.createElement('p');
    this.startButton = document.createElement('button');
    this.startButton.textContent = 'Start Game';

    this.startButton.addEventListener('click', this.onStart.bind(this));

    this.el.appendChild(this.messageEl);
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

  setPeerList(list) {
    this.messageEl.textContent = list.toString();
  }

  setErrorMsg(msg) {
    this.messageEl.textContent = msg;
  }
}
