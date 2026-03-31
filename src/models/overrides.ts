import type { ConfigureAttribute, MetadataEntry } from '@fluid.inc/yr-configure-wrapper/core';

import type {
  MapAttributeValue,
  Components,
  ConfigurableAttribute,
  Grid,
  HeadlessProduct,
  Override,
  OverrideDictionary
} from '@/declarations/interfaces';
import type { Performance } from '@/models/performance';
import type { Logger } from '@/models/logger';
import type { MergedParams } from '@/declarations/types';

export class Overrides {
  ocHierarchy?: string = undefined!;
  originalComponents: Components = undefined!;
  mappedComponents: Override = undefined!;
  mappedAttributes: Override = undefined!;

  allAttributes: ConfigurableAttribute[] = undefined!;
  attributesDictionary: OverrideDictionary = undefined!;

  headlessProduct: HeadlessProduct = undefined!;
  allAttributesHeadless: ConfigurableAttribute[] = undefined!;
  attributesDictionaryHeadless: OverrideDictionary = undefined!;

  promoValues: string[] = [];
  notAvailableComponents: string[] = [];
  availableComponents: string[] = [];

  performance: Performance | undefined = undefined!;
  logger: Logger | undefined = undefined!;
  params: MergedParams;

  constructor(params: MergedParams, logger?: Logger, performance?: Performance) {
    this.logger = logger;
    this.performance = performance;
    this.params = params;
  }

  setOverridesAndHeadless(originalComponents: Components, headlessProduct: HeadlessProduct): void {
    this.originalComponents = originalComponents;
    this.headlessProduct = headlessProduct;
    this.allAttributesHeadless = headlessProduct.product.attributes;
  }

  setOverridesAndAttributes(originalComponents: Components, allAttributes: ConfigurableAttribute[]): void {
    this.originalComponents = originalComponents;
    this.allAttributes = allAttributes;
  }

  getComponentsURL(vendorId: string): string {
    const { currency, endpoint } = this.params;
    const componentsUrl = `${endpoint}/components?vendorId=${vendorId}&currency=${currency ?? 'USD'}`;
    return `${componentsUrl}/components?vendorId=${vendorId}&currency=${currency}`;
  }

  getAttributesDictionaryMap() {
    const attributesDictionary: OverrideDictionary = {};
    for (const attribute of this.allAttributes) {
      if (!attribute?.values) {
        return;
      }
      // eslint-disable-next-line no-unsafe-optional-chaining
      for (const value of attribute?.values) {
        const { vendorId, valueUsageVendorId, id } = value;
        if (vendorId) {
          attributesDictionary[vendorId] ??= [];
          if (valueUsageVendorId && valueUsageVendorId !== vendorId) {
            attributesDictionary[valueUsageVendorId] ??= [];
            attributesDictionary[valueUsageVendorId].push(value);
          } else {
            const curr = attributesDictionary[vendorId];
            const isAlreadyAdded = curr.find((av) => av.id === id);
            if (!isAlreadyAdded) {
              attributesDictionary[vendorId].push(value);
            }
          }
        }
      }
    }
    this.attributesDictionary = attributesDictionary;
    return attributesDictionary;
  }

  getAttributesDictionaryMapHeadless() {
    const attributesDictionary: OverrideDictionary = {};
    for (const attribute of this.allAttributesHeadless) {
      if (!attribute?.attributeValues) {
        return;
      }
      // eslint-disable-next-line no-unsafe-optional-chaining
      for (const value of attribute?.attributeValues) {
        const { vendorId, valueUsageVendorId, id } = value;
        if (vendorId) {
          attributesDictionary[vendorId] ??= [];
          if (valueUsageVendorId && valueUsageVendorId !== vendorId) {
            attributesDictionary[valueUsageVendorId] ??= [];
            attributesDictionary[valueUsageVendorId].push(value);
          } else {
            const curr = attributesDictionary[vendorId];
            const isAlreadyAdded = curr.find((av) => av.id === id);
            if (!isAlreadyAdded) {
              attributesDictionary[vendorId].push(value);
            }
          }
        }
      }
    }
    this.attributesDictionaryHeadless = attributesDictionary;
    return attributesDictionary;
  }

  joinProductHeadlessAttributes(attributes: ConfigurableAttribute[]): ConfigurableAttribute[] {
    const initialAttributes: ConfigurableAttribute[] = [];
    this.allAttributes = attributes?.reduce((acc: ConfigurableAttribute[], attr: ConfigurableAttribute) => {
      if (!attr.subAttributes) {
        return acc.concat(attr);
      }
      return acc.concat(attr, this.joinProductAttributes(attr.subAttributes));
    }, initialAttributes);
    return this.allAttributes;
  }

  joinProductAttributes(attributes: ConfigurableAttribute[]): ConfigurableAttribute[] {
    const initialAttriutes: ConfigurableAttribute[] = [];
    const allAttributes = attributes?.reduce((acc: ConfigurableAttribute[], attr: ConfigurableAttribute) => {
      if (!attr.subAttributes) {
        return acc.concat(attr);
      }
      return acc.concat(attr, this.joinProductAttributes(attr.subAttributes));
    }, initialAttriutes);
    this.allAttributes = allAttributes;
    return this.allAttributes;
  }

  addComponent(components: Override, vendorId: string, active: boolean): Override {
    return (components[vendorId] = {
      valueUsages: {
        [vendorId]: { active }
      }
    });
  }

  mapComponents() {
    const notAvailableComponents: string[] = [];
    const availableComponents: string[] = [];
    const promoValues: string[] = [];
    const mappedComponents: Override = {};

    //TODO
    //params.allPromo
    const allPromo = false;
    //params.disableAll
    const disableAll = false;

    this.originalComponents?.grids?.forEach((grid: Grid) => {
      grid.components.forEach((component) => {
        const { vendorId, available } = component;
        if (!available) {
          notAvailableComponents.push(vendorId);
        }

        if (available) {
          const {
            suggestedRetailPrice: { hideDiscount, discountAmount, discountPercent }
          } = component;
          const hasDiscount = !hideDiscount && (discountAmount > 0 || discountPercent);
          if (hasDiscount || allPromo) {
            promoValues.push(vendorId);
          }
          availableComponents.push(vendorId);
        }

        const alreadyDefined = mappedComponents[vendorId];
        if (alreadyDefined) {
          return;
        }

        let attribute: MapAttributeValue[] = [];
        if (this.attributesDictionary) {
          attribute = this.attributesDictionary[vendorId]!;
        }
        if (this.attributesDictionaryHeadless) {
          attribute = this.attributesDictionaryHeadless[vendorId]!;
        }

        const active = disableAll ? false : available;
        if (attribute?.length) {
          attribute?.forEach((val) => {
            const avVendorId = val.vendorId;
            const usageVendorId = val.valueUsageVendorId ?? vendorId;
            const alreadyDefined = mappedComponents[avVendorId];
            if (alreadyDefined) {
              return;
            }

            if (!val.active) {
              this.addComponent(mappedComponents, usageVendorId, false);
            }

            const hasSkipOla = this.hasSkipOla(val?.metadata);
            if (hasSkipOla) {
              this.addComponent(mappedComponents, usageVendorId, true);
            }
            this.addComponent(mappedComponents, usageVendorId, active);
          });
        }
      });
    });
    this.mappedComponents = mappedComponents;
    this.promoValues = promoValues;
    this.notAvailableComponents = notAvailableComponents;
    this.availableComponents = availableComponents;
  }

  mapAttributes() {
    try {
      const mappedAttributes: Override = {};
      this.allAttributes.forEach((attribute) => {
        if (!attribute) {
          return;
        }
        const { alias, values } = attribute as ConfigurableAttribute;
        if (alias === 'outlet') {
          return;
        }
        values?.forEach((av) => {
          const { valueUsageVendorId, vendorId } = av;
          const sku = valueUsageVendorId ?? vendorId;
          //TODO delete
          if (sku === '1RB00500862L7_GRIDFK') {
            this.addComponent(mappedAttributes, sku, false);
            return;
          }
          //TODO DELETE
          if (
            sku === 'RBCP  47' ||
            sku === 'RBCP  48' ||
            sku === 'RBCP  49' ||
            sku === 'RBCP  50' ||
            sku === 'RBCP  51' ||
            sku === 'RBCP  52' ||
            sku === 'RBCP  53' ||
            sku === 'RBCP  54' ||
            sku === 'RBCP  55' ||
            sku === 'RBCP  56' ||
            sku === 'RBCP  57' ||
            sku === 'RBCP  58' ||
            sku === 'RBCP  59' ||
            sku === 'RBCP  60' ||
            sku === 'RBCP  61' ||
            sku === 'RBCP  62'
          ) {
            this.addComponent(mappedAttributes, sku, true);
            return;
          }
          const isOnComponents = this.mappedComponents[sku];
          if (isOnComponents) {
            this.addComponent(mappedAttributes, sku, true);
            return;
          }

          const isOnAttributes = mappedAttributes[sku];
          if (isOnAttributes) {
            return;
          }

          const hasSkipByHardcodedVendorId = this.hasSkipByHardcodedVendorId(sku);
          if (hasSkipByHardcodedVendorId) {
            this.addComponent(mappedAttributes, sku, true);
            return;
          }
          this.addComponent(mappedAttributes, sku, false);
        });
      });
      this.mappedAttributes = mappedAttributes;
    } catch (e) {
      this.logger?.error('');
      this.logger?.object(e);
    }
  }

  mapAttributesHeadless() {
    try {
      const mappedAttributes: Override = {};
      this.allAttributesHeadless.forEach((attribute) => {
        const { alias } = attribute;
        if (alias === 'outlet') {
          return;
        }
        attribute?.attributeValues?.forEach((av) => {
          const { valueUsageVendorId, vendorId } = av;
          const sku = valueUsageVendorId ?? vendorId;
          if (!sku) {
            return;
          }
          //TODO DELETE
          if (sku === '1RB00500576_GRIDFK') {
            this.addComponent(mappedAttributes, sku, false);
            return;
          }
          //TODO DELETE
          if (
            sku === 'RBCP  47' ||
            sku === 'RBCP  48' ||
            sku === 'RBCP  49' ||
            sku === 'RBCP  50' ||
            sku === 'RBCP  51' ||
            sku === 'RBCP  52' ||
            sku === 'RBCP  53' ||
            sku === 'RBCP  54' ||
            sku === 'RBCP  55' ||
            sku === 'RBCP  56' ||
            sku === 'RBCP  57' ||
            sku === 'RBCP  58' ||
            sku === 'RBCP  59' ||
            sku === 'RBCP  60' ||
            sku === 'RBCP  61' ||
            sku === 'RBCP  62'
          ) {
            this.addComponent(mappedAttributes, sku, true);
            return;
          }
          const isOnComponents = this.mappedComponents[sku];
          if (isOnComponents) {
            this.addComponent(mappedAttributes, sku, true);
            return;
          }

          const isOnAttributes = mappedAttributes[sku];
          if (isOnAttributes) {
            return;
          }

          const hasSkipByHardcodedVendorId = this.hasSkipByHardcodedVendorId(sku);
          if (hasSkipByHardcodedVendorId) {
            this.addComponent(mappedAttributes, sku, true);
            return;
          }
          this.addComponent(mappedAttributes, sku, false);
        });
      });
      this.mappedAttributes = mappedAttributes;
    } catch (e) {
      this.logger?.error('');
      this.logger?.object(e);
    }
  }

  getHeadlessURL(): string {
    const { customer, product } = this.params;
    const API_KEYS_MAP: Record<number, string> = {
      1581: 'LUX-Ray-Ban-8taOhSR5AFyjt9tfxU',
      1479: 'O4K3L3Y78pihfgpR6R1ETlBWEAuvrnoIN2rKxqLH4FkU92tq',
      1590: 'LUX-Sunglass0Hut-yjt4tR3AFfx1UtaOhS'
    };
    const apiKey = API_KEYS_MAP[customer];
    return `https://prod-ingress.fluidconfigure.com/headless/customers/${customer}/products/${product}?apiKey=${apiKey}`;
  }

  getHeadlessProduct(): Promise<HeadlessProduct> {
    return new Promise((resolve, reject) => {
      const headlessURL = this.getHeadlessURL();
      fetch(headlessURL)
        .then(async (response) => {
          if (!response.ok) {
            return reject();
          }
          const { data } = await response.json();
          return resolve(data);
        })
        .catch(reject);
    });
  }

  getMock(product: number): Promise<Components> {
    console.log(product);
    const DEFAULT_COMPONENTS: Components = {
      wholesalePrice: 0,
      amount: 0.0,
      discountPercent: 0,
      modelCode: '',
      globalDiscountAmount: 0,
      vatIncluded: false,
      discountAmount: 0,
      vendorId: '',
      currency: 'USD',
      globalDiscountPercent: 0,
      grids: [
        {
          components: [],
          modelGrid: ''
        },
        {
          components: [],
          modelGrid: ''
        }
      ]
    };

    return new Promise((resolve) => {
      try {
        return resolve(DEFAULT_COMPONENTS as Components);
        /*import(`../libs/mocks/${product}.json`)
          .then((r: Components) => {
            return resolve(r);
          })
          .catch(() => resolve(DEFAULT_COMPONENTS as Components));*/
      } catch (e) {
        this.logger?.error('');
        this.logger?.object(e);
        return resolve(DEFAULT_COMPONENTS as Components);
      }
    });
  }

  async getLuxComponents(vendorId: string): Promise<Components> {
    const { subscriptionKey, region, ocId, skipLuxApi, ocHierarchy, product } = this.params;
    if (skipLuxApi) {
      this.logger?.log('[OVERRIDES] using mock components');
      const mock = await this.getMock(product);
      return new Promise((resolve) => {
        return resolve(mock);
      });
    }
    const componentsUrl = this.getComponentsURL(vendorId);
    this.performance?.processStart('LuxComponents');
    return new Promise((resolve, reject) => {
      const headers = new Headers(); // Currently empty
      headers.append('Ocp-Apim-Subscription-Key', subscriptionKey ?? '');
      headers.append('Accept', 'application/json');
      headers.append('OC-Id', ocId);
      headers.append('OC-Country', region ?? '');
      headers.append('Cache-Control', 'no-cache');
      if (ocHierarchy) {
        this.ocHierarchy = ocHierarchy;
        headers.append('OC-Hierarchy', ocHierarchy);
      }

      fetch(componentsUrl, { headers })
        .then(async (response) => {
          if (!response.ok) {
            this.performance?.processEnd('LuxComponents');
            this.performance?.logMeasure('LuxComponents');
            this.logger?.error('[OVERRIDES] error loading lux components');
            return reject();
          }
          this.performance?.processEnd('LuxComponents');
          this.performance?.logMeasure('LuxComponents');
          const data = await response.json();
          return resolve(data);
        })
        .catch((e) => {
          this.performance?.processEnd('LuxComponents');
          this.performance?.logMeasure('LuxComponents');
          this.logger?.error('[OVERRIDES] error loading lux components');
          this.logger?.object(e);
          reject(e);
        });
    });
  }

  hasSkipOla(metadata?: MetadataEntry[]): MetadataEntry | undefined {
    return metadata?.find((meta) => meta.key === 'skipOnLoadAvailability');
  }

  hasSkipByHardcodedVendorId(vendorId: string): boolean {
    const { customer } = this.params;

    const EXLUDE_VENDOR_IDS_LIST: Record<number, string[]> = {
      1479: ['ocpno-etching', 'no-mlb-logo', 'no-nfl-logo'],
      1581: [
        'Blank',
        'language_chinese_simplified',
        'language_chinese_traditional',
        'language_korean',
        'All lenses',
        'All Lenses',
        'true',
        'false'
      ]
    };
    const EXCLUDED_VENDOR_IDS = EXLUDE_VENDOR_IDS_LIST[customer] ?? [];
    const skipByHardcodedVendorId = EXCLUDED_VENDOR_IDS.includes(vendorId);
    return skipByHardcodedVendorId;
  }

  mergeComponentsAndAttributes() {
    const merged = {
      ...this.mappedAttributes,
      ...this.mappedComponents
    };
    return merged;
  }

  getProductOverrides(
    components: Components,
    attributes: ConfigureAttribute[]
  ): { promoValues: string[]; values: Override } {
    this.setOverridesAndAttributes(components, attributes);
    this.joinProductAttributes(attributes);
    this.getAttributesDictionaryMap();
    this.mapComponents();
    this.mapAttributes();
    return {
      promoValues: this.promoValues,
      values: this.mappedComponents
    };
  }

  getProductOverridesHeadless(
    components: Components,
    headlessProduct: HeadlessProduct
  ): { promoValues: string[]; values: Override } {
    this.setOverridesAndHeadless(components, headlessProduct);
    this.getAttributesDictionaryMapHeadless();
    this.mapComponents();
    this.mapAttributesHeadless();
    return {
      promoValues: this.promoValues,
      values: this.mappedComponents
    };
  }

  destroy(): void {
    this.ocHierarchy = undefined!;
    this.originalComponents = undefined!;
    this.mappedComponents = undefined!;
    this.mappedAttributes = undefined!;
    this.allAttributes = undefined!;
    this.allAttributesHeadless = undefined!;
    this.headlessProduct = undefined!;
    this.attributesDictionary = undefined!;
    this.attributesDictionaryHeadless = undefined!;
    this.promoValues = undefined!;
    this.notAvailableComponents = undefined!;
    this.availableComponents = undefined!;
  }
}
