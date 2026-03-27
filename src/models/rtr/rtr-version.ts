import type { Performance } from '@/models/performance';
import type { Logger } from '@/models/logger';
import type { InitRTRPayload } from '@/declarations/interfaces';
import type { RtrBaseAPI } from '@/declarations/interfaces';

import type { RTRBackground } from '@/declarations/enums';

type ApiVersion = '7.2.2' | '4.0.0' | '4.1.1';

interface RTRVersionsMap {
  url: string;
  version: ApiVersion;
  windowObjectName: string;
  extraName?: string;
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
function downloadScript(url: string, onLoadCB: Function, priority?: 'high' | 'low' | 'auto') {
  const script = document.createElement('script');
  script.src = url;
  script.crossOrigin = 'anonymous';
  script.onload = () => onLoadCB(null, true);
  script.onerror = () => onLoadCB(`Error loading script ${url}`, null);
  script.async = true;
  script.fetchPriority = priority ?? 'auto';
  document.head.appendChild(script);
}

export class RTRVersion {
  protected DEFAULT_VERSION: RTRVersionsMap = {
    url: 'https://rtr-viewer.luxottica.com/lib/v/7.2.2/main.js',
    version: '7.2.2',
    windowObjectName: 'rtrViewer'
  };
  protected versionsMap: RTRVersionsMap[] = [
    this.DEFAULT_VERSION,
    {
      url: 'https://rtrmv.essilorluxottica.com/lib/v/4.0.0/main.umd.js',
      version: '4.0.0',
      windowObjectName: 'rtrViewerMV',
      extraName: 'viewer'
    },
    {
      url: 'https://rtrmv.essilorluxottica.com/lib/v/4.1.1/main.umd.js',
      version: '4.1.1',
      windowObjectName: 'rtrViewerMV',
      extraName: 'viewer'
    }
  ];

  protected version: ApiVersion = undefined!;
  protected RTR_ASSETS_URL = 'https://cp.luxottica.com/public/v1/prefetch/_vendorId_?qa=_rtrQa_';
  protected logger?: Logger = undefined!;
  protected performance?: Performance = undefined!;
  protected rendered: boolean = false;
  protected api: RtrBaseAPI = undefined!;
  protected lastTokenRendered!: string;

  constructor(urlVersion: string, logger?: Logger, performance?: Performance) {
    this.logger = logger;
    this.performance = performance;
    this.version = this.sanitizeVersion(urlVersion);
    this.logger?.log('[RTR] using v:' + this.version);
  }

  public sanitizeVersion(urlVersion: string) {
    const v = this.versionsMap.find((v) => v.version === urlVersion);
    if (v) {
      return v.version;
    }
    return this.DEFAULT_VERSION.version;
  }

  public getVersion() {
    return this.versionsMap.find((v) => v.version === this.version) ?? this.DEFAULT_VERSION;
  }

  public getInitObject() {
    return this.getVersion()?.windowObjectName;
  }

  public getAssetsURL(rtrVendorId: string): string {
    const assetsURL = this.RTR_ASSETS_URL.replace('_vendorId_', rtrVendorId).replace('_rtrQa_', 'false');
    return assetsURL;
  }

  public setAPI() {
    const { windowObjectName, extraName } = this.getVersion();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const value = (window as any)?.[windowObjectName];
    this.api = value;
    if (extraName) {
      this.api = value?.[extraName] as RtrBaseAPI;
    }
  }

  public downloadScript() {
    const { windowObjectName, url } = this.getVersion();
    return new Promise(async (resolve, reject) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const value = (window as any)?.[windowObjectName];
      if (value) {
        return resolve(false);
      }
      this.performance?.processStart('LoadingRTRScript');
      downloadScript(
        url,
        (error: string, succes: boolean) => {
          this.performance?.processEnd('LoadingRTRScript');
          this.performance?.logMeasure('LoadingRTRScript');
          if (error || !succes) {
            const rtrError = '[RTR] Error loading script';
            return reject(rtrError);
          }
          return resolve(true);
        },
        'high'
      );
    });
  }

  public async init(token: string, background: RTRBackground): Promise<boolean> {
    return new Promise(async (resolve) => {
      this.performance?.processStart('RenderingRTR');

      const initData: InitRTRPayload = {
        data: {
          settings: {
            background: {
              color: background
            },
            clearColor: background,
            showBackground: false,
            env: 'PROD',
            orbitPoint: false,
            highlightComponent: true,
            overviewVisibility: false,
            displayComponentPointer: true,
            automaticFramingComponent: true,
            buttonsVisibility: {
              tutorial: 'hidden',
              explosion: 'overlay',
              accessibility: 'overlay',
              //animationAtLanding: 'overlay',
              displayOverlay: 'visible'
            }
            /*buttonsVisibility: {
              accessibility: 'hidden',
              displayOverlay: 'visible',
              explosion: 'overlay',
              tutorial: 'overlay'
            }*/
          },
          id: {
            type: 'token',
            value: token
          },
          products: [
            {
              id: {
                type: 'token', // or 'moco' or 'token'
                value: token
              }
            }
          ],
          locale: 'en-US', // or any other available locale
          selector: '#container'
          //selector: '#viewer'
        },
        metadata: {
          envs: {
            asset: 'production',
            catalog: 'production',
            ms: 'production'
          },
          qa: false
        },
        callbacks: {
          onComponentSelected: (e: unknown) => {
            this.logger?.log('');
            this.logger?.object(e);
          },
          onActions: (e: unknown) => {
            this.logger?.log('');
            this.logger?.object(e);
            // one of the possible actions is "click" that will contains the
            // selected component slot in the token. When the user clicks on a
            // configurable part, then the camera frames the clicked component
            // provided that highlightComponentPart has been set to true
          },
          onClose: (e: unknown) => {
            this.logger?.log('[RTR] onClose cb');
            this.logger?.object(e);
          },
          onError: (e: unknown) => {
            console.log(e);
            this.performance?.processEnd('RenderingRTR');
            this.performance?.logMeasure('RenderingRTR');
            this.logger?.log('[RTR] onError cb');
            this.logger?.object(e);
            //Close RTR
            this.api?.dispose();
            //const rtrDisabled = true;
            //const rtrError = e?.code;
            //this.updateAPIStore({ rtrDisabled, rtrError, rtrOn: false });
            resolve(false);
          },
          onFocus: (detail: unknown) => {
            this.logger?.log('[RTR] onFocus cb');
            this.logger?.object(detail);
          },
          onRendered: () => {
            //TODO until callback is defined
            if (!this.rendered) {
              this.rendered = true;
              this.lastTokenRendered = token;
              this.performance?.processEnd('RenderingRTR');
              this.performance?.logMeasure('RenderingRTR');
              resolve(true);
            }
            this.logger?.log('[RTR] onRender cb');
          },
          onSettingsUpdated: (detail: unknown) => {
            this.logger?.log('[RTR] onSettingsUpdated cb');
            this.logger?.object(detail);
          },
          onWarning: (detail: unknown) => {
            this.logger?.log('[RTR] onWarning cb');
            this.logger?.object(detail);
          }
        }
      };
      try {
        await this.api?.init(initData);
        if (this.version !== '7.2.2') {
          resolve(true);
        }
      } catch (e) {
        this.logger?.log('');
        this.logger?.object(e);
        resolve(false);
      }
    });
  }
}
