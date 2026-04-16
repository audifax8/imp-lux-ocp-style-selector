import type { LoadingState } from '@/style-selector/bootstrap/state/loading-state';
import { Memento } from '@/style-selector/bootstrap/state/memento';

export class Originator {
  private state: LoadingState = undefined!;

  public setState(state: LoadingState): void {
    this.state = state;
  }

  public getState(): LoadingState {
    return this.state;
  }

  public saveMemento(): Memento {
    return new Memento(this.state);
  }

  public restore(memento: Memento): void {
    this.state = memento.getState();
  }
}
