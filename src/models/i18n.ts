/* eslint-disable */
import type { KeyString } from '@/declarations/types';

export class i18n {
  uiSettings: any = undefined!;
  fc2Labels: KeyString<string> = undefined!;

  constructor(uiSettings: any) {
    this.uiSettings = uiSettings;
    this.getConfigure2LocalizationKeys();
  }

  getLabel(label: string, fallback: string): string {
    return this.fc2Labels[label] ?? fallback;
  }

  private replaceText(string: string, options: any): string {
    for (const option in options) {
      if (options.hasOwnProperty(option)) {
        string = string.replace('{' + option + '}', options[option]);
      }
    }

    return string;
  }

  /**
    Convert a string that was underscored to camel-cased. Good for
    localization keys that are typically set in underscored.
    @method camelize
    @returns {String} Camel case version of argument
  **/
  private camelize(s: any) {
    const camelized = s.replace(/(?:^|[_])(\w)/g, function(_: any, c: any) {
      return c ? c.toUpperCase() : '';
    });
    return camelized[0].toLowerCase() + camelized.slice(1);
  }

  /**
    Get the correct translated text for the current locale
    @method getLang
    @param {String} key The key from the locale JSON you want to grab
    @return {String} Returns the value of the passed key
  **/
  public getLang(key: string, _default: string, replacements?: any): string {
    if (typeof this.uiSettings.globals.i18n[this.camelize(key)] !== 'undefined') {
      return this.replaceText(this.uiSettings.globals.i18n[this.camelize(key)], replacements);
    } else if (typeof this.uiSettings[this.camelize(key)] !== 'undefined') {
      return this.replaceText(this.uiSettings[this.camelize(key)], replacements);
    } else {
      /*if (workflow !== 'prod' && !applicationTextWarning) {
        const consoleCSS = 'background: #f5f785; color: black; padding: 5px;';
        console.log('%cMissing Application Text Labels: Available at the global object applicationText', consoleCSS);
        applicationTextWarning = true;
      }*/
      return this.replaceText(_default, replacements);
    }
  }

  private getConfigure2LocalizationKeys(): any {
    const fc2Labels: KeyString<string> = {};
    for (const componentName in this.uiSettings) {
      if (this.uiSettings.hasOwnProperty(componentName)) {
        const component = this.uiSettings[componentName];
        for (const key in component.i18n) {
          if (component.i18n.hasOwnProperty(key)) {
            const label = component.i18n[key];
            fc2Labels[key] ??= label;
          }
        }
      }
    }
    this.fc2Labels = fc2Labels;
    return fc2Labels;
  }
}
