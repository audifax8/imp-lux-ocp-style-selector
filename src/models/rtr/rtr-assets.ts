import type { QuickLink, RtrAssetsAPI } from '@/declarations/interfaces';

export class RTRAssets {
  private assets: RtrAssetsAPI = undefined!;
  private assetsAlreadePreloaded: string[] = [];
  private quickLink: QuickLink = undefined!;

  public addAssetsAlreadyPreloaded(assetName: string): void {
    this.assetsAlreadePreloaded.push(assetName);
  }

  public setRTRAssets(assets: RtrAssetsAPI): void {
    this.assets = assets;
  }

  public isAssetAlreadyPreloaded(assetName: string): boolean {
    return this.assetsAlreadePreloaded.find((asset) => asset === assetName) ? true : false;
  }

  public setQuickLink(quickLink: QuickLink): void {
    this.quickLink = quickLink;
  }

  public prefetchListStartup(): void {
    this.prefetch(this.assets.prefetchListStartup);
  }

  public prefetchByKeyName(keyName: string): void {
    const isAlreadyDownloaded = this.assetsAlreadePreloaded?.find((name) => name === keyName);
    if (isAlreadyDownloaded) {
      return;
    }
    const urls = this.assets?.prefetchListConfigurableAttributes?.[keyName];
    if (urls?.length) {
      this.assetsAlreadePreloaded?.push(keyName);
      this.quickLink?.prefetch(urls, false, true);
    }
  }

  private prefetch(URLs: string[]): void {
    this.quickLink?.prefetch(URLs, false, true);
  }
}
