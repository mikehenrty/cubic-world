import { CMD_SIGNALING } from '/../shared/message/LobbyMessage';


export const EVT_SIGNALING = CMD_SIGNALING;
export const EVT_READY = 'PeerReady';

export const SIG_OFFER = 'offer';
export const SIG_CANDIDATE = 'candidate';
export const SIG_ANSWER = 'answer';

export const READY_STATE_OPEN = 'open';
export const READY_STATE_CLOSED = 'closed';

// TODO: Consider add more stun servers
// https://gist.github.com/zziuni/3741933
export const ICE_STUN_SERVERS = {
  'iceServers': [
    { 'urls': ['stun:stun.l.google.com:19302'] }
  ]
}


window.RTCPeerConnection = window.RTCPeerConnection ||
  window.webkitRTCPeerConnection;

const CHANNEL_LABEL = 'p2p';


export default class WebRTC extends EventTarget {
  constructor(socket) {
    super();
    this.socket = socket;
    this.peerId = null;
    this.authorizedPeer = null;
    this.dataChannel = null;

    // this.socket.on('signaling', this.signalHandler.bind(this));
    this.socket.addEventListener(EVT_SIGNALING, this.onSignal.bind(this));
  }

  isConnected() {
    let channael = this.dataChannel;
    return channael && channael.readyState === READY_STATE_OPEN;
  };

  authorizePeer(peerId) {
    this.authorizedPeer = peerId;
  }

  // Initiate webRTC signaling (usually done be invitee).
  async connect(peerId) {
    this.authorizePeer(peerId);
    this.initPeerConnection(peerId);

    console.log('PLAYER 1, creating data channel to', this.peerId);
    this.dataChannel = this.peerConnection.createDataChannel(CHANNEL_LABEL, {
      ordered: false,
      maxRetransmits: 0,
    });
    this.initDataChannel()

    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);
    this.sendSignal(SIG_OFFER, offer);
  };

  initPeerConnection(peerId) {
    if (this.peerId && this.peerId !== peerId) {
      this.cleanUp();
    }

    this.peerId = peerId;
    this.peerConnection = new RTCPeerConnection(ICE_STUN_SERVERS);

    this.peerConnection.onicecandidate =
      this.candidateHandler.bind(this);

    this.peerConnection.oniceconnectionstatechange =
      this.stateChangeHandler.bind(this);

    this.peerConnection.ondatachannel =
      this.dataChannelHandler.bind(this);
  };

  initDataChannel() {
    this.dataChannel.onopen = this.dataChannel.onclose =
      this.dataChannelStateChange.bind(this);
    this.dataChannel.onmessage = this.onMessage.bind(this);
  }

  onMessage(evt) {
    console.error('On message not yet implemented!');
    throw evt;
  }

  send(cmd, param) {
    if (!this.dataChannel) {
      console.error('error, tried to call send when data channel null');
      return;
    }
    this.dataChannel.send(`${cmd}|${param || ''}`);
  };

  candidateHandler(evt) {
    if (evt.candidate) {
      this.sendSignal(SIG_CANDIDATE, evt.candidate);
    }
  }

  stateChangeHandler() {
    switch (this.peerConnection.iceConnectionState) {
      case 'completed':
        console.log('connection complete!', this.peerId);
        break;

      case 'connected':
        console.log('connected to', this.peerId);
        break;

      case 'disconnected':
        console.log('got the "official" disconnect message');
        this.disconnect();
        break;

      case 'checking':
        console.log('checking connection state...');
        break;

      case 'failed':
      case 'closed':
        console.log('disconnect from webrtc state change',
          this.peerConnection.iceConnectionState);
        break;

      default:
        console.log('UKNOWN webrtc state change',
          this.peerConnection.iceConnectionState);
        break;
    }
  };

  dataChannelHandler(evt) {
    this.dataChannel = evt.channel;
    this.initDataChannel();
  }

  sendSignal(signal, payload) {
    const peerId = this.peerId;
    this.socket.send(CMD_SIGNALING, { peerId, signal, payload });
  }

  onSignal({ detail }) {
    const { signal, payload, from } = detail;

    if (!this.authorizedPeer || this.authorizedPeer !== from) {
      console.log('attempted signal from unauthorized peer', from, signal);
      return;
    }

    if (from !== this.peerId) {
      console.log('PLAYER 2');
      this.initPeerConnection(from);
    }

    try {
      switch (signal) {
        case SIG_OFFER:
          this.handleSignalOffer(payload);
          break;

        case SIG_ANSWER:
          this.handleSignalAnswer(payload);
          break;

        case SIG_CANDIDATE:
          this.handleSignalCandidate(payload);
          break;

        default:
          console.log('unrecognized signaling message', signal);
          break;
      }

    } catch (e) {
      console.log('could not parse signaling message', e);
      return;
    }
  }

  async handleSignalOffer(data) {
    console.log('got an offer', data);
    try {
      const description = new RTCSessionDescription(data);
      await this.peerConnection.setRemoteDescription(description);
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      this.sendSignal(SIG_ANSWER, this.peerConnection.localDescription);
    } catch (err) {
      console.error('error handling offer', err);
    }
  }

  async handleSignalAnswer(data) {
    console.log('got an answer', data);
    try {
      const description = new RTCSessionDescription(data);
      await this.peerConnection.setRemoteDescription(description);
    } catch (e) {
      console.error('error setting answer', e);
    }
  }

  async handleSignalCandidate(data) {
    try {
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(data));
    } catch (e) {
      console.log('error adding ice candidate', e, data);
    }
  }

  dataChannelStateChange() {
    console.log('data channel state change', this.dataChannel.readyState);
    switch (this.dataChannel.readyState) {
      case READY_STATE_OPEN:
        const peerId = this.peerId;
        this.dispatchEvent(new CustomEvent(EVT_READY, { detail: { peerId } }));
        break;

      case READY_STATE_CLOSED:
        console.log('disconnect from data channel state change');
        break;

      default:
        break;
    }
  }


  disconnect() {
    console.log('webrtc disconnect', this.peerId);
    this.cleanUp();
    if (this.peerId) {
      var peerId = this.peerId;
      this.peerId = null;
      this.dispatchEvent(EVT_DISCONNECT, { detail: { peerId } });
    }
  };

  cleanUp() {
    if (this.dataChannel) {
      this.dataChannel.onopen = null;
      this.dataChannel.onclose = null;
      this.dataChannel.close();
      this.dataChannel = null;
    }

    if (this.peerConnection) {
      this.peerConnection.onicecandidate = null;
      this.peerConnection.oniceconnectionstatechange = null;
      this.peerConnection.ondatachannel = null;
      this.peerConnection.close();
      this.peerConnection = null;
    }
  }
}
