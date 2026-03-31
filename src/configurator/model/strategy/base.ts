import type { Caretaker } from '@/configurator/bootstrap/state/caretaker';
import type { LoadingState } from '@/configurator/bootstrap/state/loading-state';
import type { Originator } from '@/configurator/bootstrap/state/originator';

//import { updateUIStore } from '@/state/actions/ui';
//import { updateAPIStore } from '@/state/actions/apis';

//import type { APIsState } from '@/store/APIsStore';
//import { useUIStore, type UIState } from '@/store/UIStore';

import { AsyncTask } from '@/models/async-task';
//import { registerDependency } from '@/context/dependencies-apis';
//import { completeLayoutPromise, completeMenuPromise } from '@/lazy-imports';

//import type { Dependencies } from '@/declarations/interfaces';
//import { Theme } from '@/declarations/enums';

export abstract class BaseStrategy extends AsyncTask {
  protected caretaker: Caretaker = undefined!;
  protected originator: Originator = undefined!;
  protected state: LoadingState = undefined!;

  constructor(caretaker: Caretaker, originator: Originator) {
    super();
    this.caretaker = caretaker;
    this.originator = originator;
    this.state = originator.getState();
    const params = this.state?.getParams();
    if (params?.yrEnv) {
      //window.caretaker = this.caretaker;
    }
  }

  abstract init(): Promise<boolean>;

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

  public destroy() {
    this.caretaker = undefined!;
    this.originator = undefined!;
    this.state = undefined!;
  }
}
