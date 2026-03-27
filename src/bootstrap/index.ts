import { Caretaker } from '@/bootstrap/state/caretaker';
import { LoadState } from '@/bootstrap/state/load-state';
import { Originator } from '@/bootstrap/state/originator';
import type { LoadStateProps } from '@/bootstrap/state/load-state';
//import { StrategyContext } from '@/bootstrap/strategy/context';
//import { RTRTest } from '@/bootstrap/strategy/rtr-test';

import { CheckPointType } from '@/declarations/enums';
//import { ApisFactory } from '@/factory/apis-factory';
import { getInitQueryParams } from '@/libs/helpers';
//import { ObjectsFactory } from '@/factory/objects-factory';

export async function loadImplementation() {
  const params = getInitQueryParams();
  if (params.skeleton) return;
  //const { showPerformance, showLogs } = params;
  const state = new LoadState();
  const originator = new Originator();
  const caretaker = new Caretaker();
  //const apisFactory = new ApisFactory();
  //const objectsFactory = new ObjectsFactory();

  const utils: Partial<LoadStateProps> = {
    params,
    //apisFactory,
    //objectsFactory,
    checkPoint: CheckPointType.UTILS
  };

  /*if (showLogs) {
    const { Logger } = await import('@/models/logger');
    const logger = new Logger(showLogs ?? false);
    utils.logger = logger;
  }*/

  /*if (showPerformance) {
    const { Performance } = await import('@/models/performance');
    const performance = new Performance(showPerformance ?? false);
    utils.performance = performance;
  }*/

  const newState = state.clone(utils);
  originator.setState(newState);
  caretaker.addMemento(originator.saveMemento());

  //const initStrategy = apisFactory.buildInitStrategy(params.customer, caretaker, originator, newState);
  //const initStrategy = new RTRTest(caretaker, originator, state);
  //const strategyContext = new StrategyContext(initStrategy);
  //strategyContext.init();
}
