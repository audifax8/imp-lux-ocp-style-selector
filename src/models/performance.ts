export class Performance {
  private startFn: (keyMark?: string) => void;
  private endFn: (keyMark?: string) => void;
  private measureFn: (keyMark?: string) => void;
  private noop = () => undefined;

  constructor(showPerformance: boolean) {
    if (showPerformance) {
      this.startFn = (keyMark) => performance.mark(`start${keyMark}`);
      this.endFn = (keyMark) => performance.mark(`end${keyMark}`);

      this.measureFn = (keyMark) => {
        try {
          if (!keyMark) return;
          const measure = performance.measure(keyMark, `start${keyMark}`, `end${keyMark}`);
          if (!measure) return;
          console.log('[PERFORMANCE]', `Total ${keyMark}: ${measure.duration}ms`);
        } catch (e) {
          console.error('[PERFORMANCE ERROR]');
          console.log(e);
        }
      };
    } else {
      this.startFn = this.noop;
      this.endFn = this.noop;
      this.measureFn = this.noop;
    }
  }

  processStart(keyMark?: string) {
    this.startFn(keyMark);
  }

  processEnd(keyMark?: string) {
    this.endFn(keyMark);
  }

  logMeasure(keyMark?: string) {
    this.measureFn(keyMark);
  }
}
