import type { Memento } from '@/configurator/bootstrap/state/memento';

export class Caretaker {
  private mementos: Memento[] = [];

  public addMemento(memento: Memento): void {
    this.mementos.push(memento);
  }

  public getMemento(index: number): Memento | undefined {
    return this.mementos.at(index);
  }
}
