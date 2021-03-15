import { h, render } from 'preact';
import UIApp from './UIApp';
import {
  CMD_ASK_TO_CONNECT,
  CMD_CONNECT_TO_PEER
} from '/shared/message/LobbyMessage.js'


export const EVT_START = 'Start';
export const EVT_INVITE = 'AcceptInvite';
export const EVT_ASK = CMD_ASK_TO_CONNECT;
export const EVT_CONNECT = CMD_CONNECT_TO_PEER;

// UI original events.
export const EVT_SHOW = 'Show';
export const EVT_HIDE = 'Hide';
export const EVT_PEER_LIST = 'PeerList';
export const EVT_ASKED_BY_PEER = 'PeerAsked';
export const EVT_PEER_SYNCING = 'PeerSyncing';

export default class UI extends EventTarget {
  constructor() {
    super();
  }

  // Create and render the UI react app.
  init() {
    const uiApp = (
      <UIApp
        UI={this}
        onStart={this.onStart.bind(this)}
        onAsk={this.onAsk.bind(this)}
        onConfirm={this.onConfirm.bind(this)}
        onInviteLink={this.onInviteLink.bind(this)}
      />
    );

    render(uiApp, document.body);
  }

  onStart() {
    this.dispatchEvent(new Event(EVT_START));
  }

  hide() {
    this.dispatchEvent(new Event(EVT_HIDE));
  }

  show() {
    this.dispatchEvent(new Event(EVT_SHOW));
  }

  getPeerLink(id) {
    const url = new URL(window.location.href);
    return `${url.protocol}\/\/${url.host}${url.pathname}#${id}`;
  }

  getInviteId() {
    const url = window.location.href;
    const i = url.indexOf('#');
    if (i !== -1) {
      return url.slice(i + 1);
    }
    return null;
  }

  setPeerList({ me, names }) {
    let player = null;

    // Separate player from opponents.
    const opponents = names.filter(nameData => {
      if (nameData.name === me) {
        player = nameData;
        return false;
      }

      return true;
    });

    this.dispatchEvent(new CustomEvent(EVT_PEER_LIST, { detail: { player, opponents }}));
  }

  onAsk(peerId) {
    this.dispatchEvent(new CustomEvent(CMD_ASK_TO_CONNECT, { detail: { peerId }}));
  }

  handleAsk(detail) {
    this.dispatchEvent(new CustomEvent(EVT_ASKED_BY_PEER, { detail }));
  }

  onConfirm(peerId) {
    this.dispatchEvent(new CustomEvent(CMD_CONNECT_TO_PEER, { detail: { peerId }}));
  }

  onPeerSync() {
    this.dispatchEvent(new Event(EVT_PEER_SYNCING));
  }

  onInviteLink(peerId) {
    this.dispatchEvent(new CustomEvent(EVT_INVITE, { detail: { peerId }}));
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
