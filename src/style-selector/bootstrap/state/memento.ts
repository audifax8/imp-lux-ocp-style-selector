import type { LoadingState } from '@/style-selector/bootstrap/state/loading-state';

export class Memento {
  private state: LoadingState = undefined!;

  constructor(state: LoadingState) {
    this.state = state;
  }

  public getState(): LoadingState {
    return this.state;
  }
}
