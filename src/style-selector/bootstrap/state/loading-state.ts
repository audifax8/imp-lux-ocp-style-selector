import type { ConfigureJsons, MergedParams } from '@/declarations/types';

import type { Logger } from '@/models/logger';
import type { Performance } from '@/models/performance';
import type { CheckPointType } from '@/declarations/enums';

export type LoadingStateProps = {
  params: MergedParams;
  performance: Performance;
  logger: Logger;
  checkPoint: CheckPointType;
  configureJsons: ConfigureJsons;
};

export class LoadingState {
  private params: MergedParams = undefined!;
  private performance: Performance = undefined!;
  private logger: Logger = undefined!;
  private checkPoint: CheckPointType = undefined!;
  private configureJsons: ConfigureJsons = undefined!;

  public setCheckPoint(checkPoint: CheckPointType): void {
    this.checkPoint = checkPoint;
  }

  public setParams(params: MergedParams): void {
    this.params = params;
  }

  public setLogger(logger: Logger): void {
    this.logger = logger;
  }

  public setPerformance(performance: Performance): void {
    this.performance = performance;
  }

  public setConfigureJsons(configureJsons: ConfigureJsons): void {
    this.configureJsons = configureJsons;
  }

  public getCheckPoint(): CheckPointType {
    return this.checkPoint;
  }

  public getParams(): MergedParams {
    return this.params;
  }

  public getLogger(): Logger {
    return this.logger;
  }

  public getPerformance(): Performance {
    return this.performance;
  }

  public getConfigureJsons(): ConfigureJsons {
    return this.configureJsons;
  }

  public clone(updates: Partial<LoadingStateProps>): LoadingState {
    const newInstance = new LoadingState();
    newInstance.setParams(updates.params ?? this.params);
    newInstance.setPerformance(updates.performance ?? this.performance);
    newInstance.setLogger(updates.logger ?? this.logger);
    newInstance.setCheckPoint(updates.checkPoint ?? this.checkPoint);
    newInstance.setConfigureJsons(updates.configureJsons ?? this.configureJsons);
    return newInstance;
  }
}
