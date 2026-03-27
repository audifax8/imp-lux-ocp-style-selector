export class Logger {
  private logFn: (...args: unknown[]) => void;
  private errorFn: (...args: unknown[]) => void;
  private objectFn: (obj: unknown) => void;
  private customFn: (type: string, message: string) => void;
  private customObjectFn: (obj: unknown) => void;
  private noop = () => undefined;

  constructor(debug: boolean) {
    if (debug) {
      this.logFn = (...args) => console.log('[LOGGER INFO]: ', ...args);
      this.errorFn = (...args) => console.error('[LOGGER ERROR]: ', ...args);
      this.objectFn = (obj) => console.log('[LOGGER OBJECT]: ', obj);
      this.customFn = (type: string, message: string) => console.log(`${type}: `, message);
      this.customObjectFn = (obj) => console.log(obj);
    } else {
      this.logFn = this.noop;
      this.errorFn = this.noop;
      this.objectFn = this.noop;
      this.customFn = this.noop;
      this.customObjectFn = this.noop;
    }
  }

  log(msg: string) {
    this.logFn(msg);
  }

  error(msg: string) {
    this.errorFn(msg);
  }

  object(obj: unknown) {
    this.objectFn(obj);
  }

  custom(type: string, message: string): void {
    this.customFn(type, message);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  customObject(object: any): void {
    this.customObjectFn(object);
  }
}
