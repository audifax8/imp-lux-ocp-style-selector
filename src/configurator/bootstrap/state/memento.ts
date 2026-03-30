import type { LoadingState } from '@/configurator/bootstrap/state/loading-state';

export class Memento {
  private state: LoadingState = undefined!;

  constructor(state: LoadingState) {
    this.state = state;
  }

  public getState(): LoadingState {
    return this.state;
  }
}
