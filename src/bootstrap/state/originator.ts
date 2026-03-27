import type { LoadState } from '@/bootstrap/state/load-state';
import { Memento } from '@/bootstrap/state/memento';

export class Originator {
  private state: LoadState = undefined!;

  public setState(state: LoadState): void {
    this.state = state;
  }

  public getState(): LoadState {
    return this.state;
  }

  public saveMemento(): Memento {
    return new Memento(this.state);
  }

  public restore(memento: Memento): void {
    this.state = memento.getState();
  }
}
