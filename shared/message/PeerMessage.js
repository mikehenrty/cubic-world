const DELIM = '|';

export const CMD_PING = 'Ping';
export const CMD_PONG = 'Pong';
export const CMD_START = 'Start';
export const CMD_START_ACK = 'StartAck';
export const CMD_MOVE = 'Move'

export const ERR_MARSHAL = 'MarshalError'


export default class PeerMessage {
  static marshalFromString(str) {
    let cmd, arg, timestamp, error;

    try {
      let index;
      cmd = str.substr(0, index = str.indexOf(DELIM));
      str = str.substr(index + 1);
      arg = str.substr(0, index = str.indexOf(DELIM));
      str = str.substr(index + 1);
      timestamp = parseInt(str.substr(0, index = str.indexOf(DELIM)), 10);
      error = str.substr(index + 1);

      return new PeerMessage(cmd, arg, timestamp, error);
    } catch (e) {
      console.error('Could not marshal string', str, e);
      return PeerMessage.getErrorMessage(cmd, ERR_MARSHAL, 'Invalid input');
    }
  }

  constructor(cmd, arg, timestamp, error) {
    this.cmd = cmd || '';
    this.arg = arg || '';
    this.timestamp = timestamp || null;
    this.error = error || null;
  }

  toString() {
    const { cmd, arg, timestamp, error } = this;
    return `${cmd}${DELIM}${arg}${DELIM}${timestamp}${DELIM}${error || ''}`;
  }
}
