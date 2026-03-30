import type { Caretaker } from '@/configurator/bootstrap/state/caretaker';
import type { LoadingState } from '@/configurator/bootstrap/state/loading-state';
import type { Originator } from '@/configurator/bootstrap/state/originator';

//import { updateUIStore } from '@/state/actions/ui';
//import { updateAPIStore } from '@/state/actions/apis';

//import type { APIsState } from '@/store/APIsStore';
//import { useUIStore, type UIState } from '@/store/UIStore';

import { schedule } from '@/libs/helpers';
//import { registerDependency } from '@/context/dependencies-apis';
//import { completeLayoutPromise, completeMenuPromise } from '@/lazy-imports';

//import type { Dependencies } from '@/declarations/interfaces';
//import { Theme } from '@/declarations/enums';

export abstract class BaseStrategy {
  protected caretaker: Caretaker = undefined!;
  protected originator: Originator = undefined!;
  protected state: LoadingState = undefined!;

  constructor(caretaker: Caretaker, originator: Originator) {
    this.caretaker = caretaker;
    this.originator = originator;
    this.state = originator.getState();
    const params = this.state?.getParams();
    if (params?.yrEnv) {
      //window.caretaker = this.caretaker;
    }
  }

  abstract init(): Promise<void>;

  /*protected updateAPIState(newApiState: APIsState) {
    //return updateAPIStore(newApiState);
  }*/

  /*protected updateUIState(newUIState: UIState) {
    //return updateUIStore(newUIState);
  }*/

  protected resolveLayoutPromise() {
    //this.resolveMenuPromise();
    //return completeLayoutPromise();
  }

  protected resolveMenuPromise() {
    /*const { isMobile, menuLoaded } = useUIStore.getState();
    if (!menuLoaded) {
      if (!isMobile) {
        completeMenuPromise();
      }
      this.updateUIState({ showSkeleton: false });
    }*/
  }

  /*protected registerDependency<K extends keyof Dependencies>(key: K, value: Dependencies[K]) {
    return registerDependency(key, value);
  }*/

  protected runMicrotask<T>(fn: () => T | Promise<T>): Promise<T> {
    return schedule(fn, 'microtask');
  }

  protected runIdle<T>(fn: () => T | Promise<T>): Promise<T> {
    return schedule(fn, 'idle');
  }

  protected runAnimation<T>(fn: () => T | Promise<T>): Promise<T> {
    return schedule(fn, 'animation');
  }

  public destroy() {
    this.caretaker = undefined!;
    this.originator = undefined!;
    this.state = undefined!;
  }
}
