import type { LoadState } from '@/bootstrap/state/load-state';

export class Memento {
  private state: LoadState = undefined!;

  constructor(state: LoadState) {
    this.state = state;
  }

  public getState(): LoadState {
    return this.state;
  }
}
