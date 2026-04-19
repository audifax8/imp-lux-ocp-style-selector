import type { Caretaker } from '@/style-selector/bootstrap/state/caretaker';
import type { LoadingState } from '@/style-selector/bootstrap/state/loading-state';
import type { Originator } from '@/style-selector/bootstrap/state/originator';

import { AsyncTask } from '@/models/async-task';

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
      window.caretaker = this.caretaker;
    }
  }

  abstract init(): Promise<boolean>;

  protected resolveLayoutPromise() {
  }

  protected resolveMenuPromise() {
  }

  public destroy() {
    this.caretaker = undefined!;
    this.originator = undefined!;
    this.state = undefined!;
  }
}
