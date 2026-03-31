import { schedule } from '@/libs/helpers';

export class AsyncTask {
  protected runMicrotask<T>(fn: () => T | Promise<T>): Promise<T> {
    return schedule(fn, 'microtask');
  }

  protected runIdle<T>(fn: () => T | Promise<T>): Promise<T> {
    return schedule(fn, 'idle');
  }

  protected runAnimation<T>(fn: () => T | Promise<T>): Promise<T> {
    return schedule(fn, 'animation');
  }
}
