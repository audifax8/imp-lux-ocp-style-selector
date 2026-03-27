//import type { ConfigureCore } from '@fluid.inc/yr-configure-wrapper/core';
import type { ConfigureJsons, MergedParams } from '@/declarations/types';
//import type { ApisFactory } from '@/factory/apis-factory';
//import type { ObjectsFactory } from '@/factory/objects-factory';

import type { Logger } from '@/models/logger';
import type { Performance } from '@/models/performance';
/*import type { i18n } from '@/models/i18n';
import type { Headless } from '@/models/headless';
import type { Overrides } from '@/models/overrides';
import type { LuxAPI } from '@/models/lux';
import type { RtrWrapper } from '@/models/rtr';
import type { VmApiProxy } from '@/models/vm/vm-proxy';*/

import type { CheckPointType } from '@/declarations/enums';

export type LoadStateProps = {
  //core: ConfigureCore;
  //luxApi: LuxAPI;
  params: MergedParams;
  performance: Performance;
  logger: Logger;
  //overrides: Overrides;
  checkPoint: CheckPointType;
  configureJsons: ConfigureJsons;
  /*headless: Headless;
  apisFactory: ApisFactory;
  objectsFactory: ObjectsFactory;
  i18n: i18n;
  vmApiProxy: VmApiProxy;
  rtrWrapper: RtrWrapper;*/
};

export class LoadState {
  /*private core: ConfigureCore = undefined!;
  private luxApi: LuxAPI = undefined!;*/
  private params: MergedParams = undefined!;
  private performance: Performance = undefined!;
  private logger: Logger = undefined!;
  //private overrides: Overrides = undefined!;
  private checkPoint: CheckPointType = undefined!;
  private configureJsons: ConfigureJsons = undefined!;
  /*private headless: Headless = undefined!;
  private apisFactory: ApisFactory = undefined!;
  private objectsFactory: ObjectsFactory = undefined!;
  private i18n: i18n = undefined!;
  private vmApiProxy: VmApiProxy = undefined!;
  private rtrWrapper: RtrWrapper = undefined!;*/

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

  /*public setCore(core: ConfigureCore): void {
    this.core = core;
  }

  public setLuxApi(luxApi: LuxAPI): void {
    this.luxApi = luxApi;
  }*/

  public setConfigureJsons(configureJsons: ConfigureJsons): void {
    this.configureJsons = configureJsons;
  }

  /*public setOverrides(overrides: Overrides): void {
    this.overrides = overrides;
  }

  public setApisFactory(apisFactory: ApisFactory): void {
    this.apisFactory = apisFactory;
  }

  public setObjectsFactory(objectsFactory: ObjectsFactory): void {
    this.objectsFactory = objectsFactory;
  }

  public setHeadless(headless: Headless): void {
    this.headless = headless;
  }

  public setI18N(i18n: i18n): void {
    this.i18n = i18n;
  }

  public setVmApiProxy(vmApiProxy: VmApiProxy): void {
    this.vmApiProxy = vmApiProxy;
  }

  public setRTRWraper(rtrWrapper: RtrWrapper): void {
    this.rtrWrapper = rtrWrapper;
  }

  public getRTRWrapper(): RtrWrapper {
    return this.rtrWrapper;
  }

  public getVmApiProxy(): VmApiProxy {
    return this.vmApiProxy;
  }

  public getI18N(): i18n {
    return this.i18n;
  }*/

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

  /*public getCore(): ConfigureCore {
    return this.core;
  }

  public getLuxApi(): LuxAPI {
    return this.luxApi;
  }*/

  public getConfigureJsons(): ConfigureJsons {
    return this.configureJsons;
  }

  /*public getOverrides(): Overrides {
    return this.overrides;
  }

  public getApisFactory(): ApisFactory {
    return this.apisFactory;
  }

  public getObjectsFactory(): ObjectsFactory {
    return this.objectsFactory;
  }*/

  public clone(updates: Partial<LoadStateProps>): LoadState {
    const newInstance = new LoadState();

    //newInstance.setCore(updates.core ?? this.core);
    //newInstance.setLuxApi(updates.luxApi ?? this.luxApi);
    newInstance.setParams(updates.params ?? this.params);
    newInstance.setPerformance(updates.performance ?? this.performance);
    newInstance.setLogger(updates.logger ?? this.logger);
    //newInstance.setOverrides(updates.overrides ?? this.overrides);
    newInstance.setCheckPoint(updates.checkPoint ?? this.checkPoint);
    newInstance.setConfigureJsons(updates.configureJsons ?? this.configureJsons);
    /*newInstance.setApisFactory(updates.apisFactory ?? this.apisFactory);
    newInstance.setObjectsFactory(updates.objectsFactory ?? this.objectsFactory);
    newInstance.setHeadless(updates.headless ?? this.headless);
    newInstance.setI18N(updates.i18n ?? this.i18n);
    newInstance.setVmApiProxy(updates.vmApiProxy ?? this.vmApiProxy);
    newInstance.setRTRWraper(updates.rtrWrapper ?? this.rtrWrapper);*/

    return newInstance;
  }
}
