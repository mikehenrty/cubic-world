export default class UI extends EventTarget {
  constructor() {
    super();

    this.el = document.createElement('div');
    this.el.id = 'UI';
  }

  start() {
    document.body.appendChild(this.el);
  }

  hide() {
    this.el.classList.add('hide');
  }

  show() {
    this.el.classList.remove('hide');
  }

  setPeerList(list) {
    this.el.textContent = list.toString();
  }

  setErrorMsg(msg) {
    this.el.textContent = msg;
  }
}
