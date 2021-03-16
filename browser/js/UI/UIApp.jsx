import { h } from 'preact';
import { useEffect, useState, useRef, useMemo } from 'preact/hooks';

import { EVT_SHOW, EVT_HIDE, EVT_PEER_LIST, EVT_ASKED_BY_PEER } from './index';

import './UIApp.css';

export default function UIApp({ UI, onStart, onAsk, onConfirm, onInviteLink }) {
  const [isHidden, setIsHidden] = useState(false);
  const [player, setPlayer] = useState(null);
  const [opponents, setOpponents] = useState({});
  const [message, setMessage] = useState('');

  const linkInput = useRef(null);

  // See if user followed an invite link.
  useEffect(() => {
    const url = window.location.href;
    const i = url.indexOf('#');
    // Check if we have an invite id on the hash.
    if (i === -1) {
      return;
    }
    
    setMessage('Connecting to your friend...');
    onInviteLink(url.slice(i + 1));
  }, [window.location.href, onInviteLink])

  // Event listeners from UI wrapper.
  useEffect(() => {
    const onHide = () => {
      setIsHidden(true);
    };
    const onShow = () => {
      setIsHidden(false);
    };
    const onPeerList = ({ detail }) => {
      const { player, opponents } = detail;
      console.log('player', player);
      setPlayer(player);
      setOpponents(opponents.reduce((accum, val) => {
        accum[val.id] = val.name;
        return accum;
      }, {}));
    }
    const onAskedByPeer = ({ detail }) => {
      const peerId = detail.from;
      const name = opponents[peerId] || 'Anonymous';
      if (confirm(`Do you wanna play ${name}?`)) {
        setMessage(`Connecting to ${name}...`);
        // Initiate WebRTC connection.
        onConfirm(peerId);
      }
    };
    const onPeerReady = () => {
      setMessage('Synchronizing clocks')
    }

    UI.addEventListener(EVT_HIDE, onHide);
    UI.addEventListener(EVT_SHOW, onShow);
    UI.addEventListener(EVT_PEER_LIST, onPeerList);
    UI.addEventListener(EVT_ASKED_BY_PEER, onAskedByPeer);

    return () => {
      UI.removeEventListener(EVT_HIDE, onHide);
      UI.removeEventListener(EVT_SHOW, onShow);
      UI.removeEventListener(EVT_PEER_LIST, onPeerList);
      UI.removeEventListener(EVT_ASKED_BY_PEER, onAskedByPeer);
    }
  }, [UI, opponents]);

  const onStartOffline = () => {
    setIsHidden(true);
    onStart();
  };

  const onCopy = () => {
    linkInput.current.focus();
    linkInput.current.select();
    document.execCommand('copy');
  };

  const onAskToPlay = (evt) => {
    const peerId = evt.currentTarget.dataset.peerId;
    if (!peerId || !opponents[peerId]) {
      setMessage(`Opponent not found: ${peerId}`);
      return;
    }

    setMessage(`Asking ${opponents[peerId]} to play...`);
    onAsk(peerId);
  };

  const peerLink = useMemo(() => {
    if (!player) {
      return '';
    }
    const url = new URL(window.location.href);
    return `${url.protocol}\/\/${url.host}${url.pathname}#${player.id}`;
  }, [player]);

  return (
    <div id="UI" class={isHidden ? 'hide' : ''}>
      <div id="background-container">
        <div id="bg-back"></div>
        <div id="bg-top"></div>
        <div id="bg-bottom"></div>
        <div id="bg-left"></div>
        <div id="bg-right"></div>
      </div>
      <div id="text-container">
        <h1>Welcome to Cubic!</h1>
        <p>Cubic is a multiplayer puzzle racing game.</p>
        <div id="online">
          <h3>Play Online</h3>
          { player && ( <p>Your name is "<b>{player.name}</b>!"</p> )}
          <p>{message}</p>
          {player && (
            <div>
              <button class="link-button" onClick={onCopy}>Copy Invite Link</button>
              <input class="peer-link" ref={linkInput} value={peerLink} />
            </div>
          )}
          <p class="signature">Give this link to a friend and Play Now!</p>
          <p style="margin-bottom: 0px; margin-top: 2rem;">Lobby</p>
          <ul>
            { Object.keys(opponents).length > 0 ? (
              Object.keys(opponents).map(id => (
                <li><button data-peer-id={id} onClick={onAskToPlay}>Play</button>
                <span>{`vs. ${opponents[id]}`}</span></li>
              ))
            ) : (<li>No pontential opponents right now.</li>)}
          </ul>
        </div>
        <button id="play-offline" onClick={onStartOffline}>Practice Offline</button>
        <p class="signature">
          Hacked together by <a target="_blank" href="https://twitter.com/mikehenrty">mikehenrty</a>.
        </p>
        <p class="signature">
          Souce code on <a href="https://github.com/mikehenrty/cubic-world/">GitHub</a>.
        </p>
      </div>
    </div>
  );
};
