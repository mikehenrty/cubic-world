const DELIMETER = '|||';

export const CMD_LIST_PEERS = 'ListPeers';
export const ERR_MARSHAL = 'MarshalError'


export default class LobbyMessage {
  static marshalFromString(str) {
    let parts, cmd, params, error;

    try {
      parts = str.split(DELIMETER, 3);
      cmd = parts[0];
      params = JSON.parse(parts[1])
      error = parts[2];

      return new LobbyMessage(cmd, params, error);
    } catch (e) {
      console.error('Could not marshal string', str, e);
      return LobbyMessage.getErrorMessage(cmd, ERR_MARSHAL, 'Invalid input');
    }
  }

  static getErrorMessage(cmd, errorType, errorMsg) {
    return new LobbyMessage(cmd, { msg: errorMsg }, errorType);
  }

  constructor(cmd, params, error) {
    this.cmd = cmd || null;
    this.params = params || [];
    this.error = error || null;
  }

  toString() {
    const { cmd, params, error } = this;
    return [ cmd, JSON.stringify(params), error ].join(DELIMETER);
  }
}
