export class ProtocolDoesNotExistError extends Error {
  protocol: string;
  constructor(protocol) {
    super('Protocol [' + protocol + '] does not exists');
    this.name = 'ProtocolDoesNotExistError';
    this.protocol = protocol;
  }
}
