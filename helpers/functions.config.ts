// eslint-disable-next-line node/no-unpublished-import
import { config } from "../data/config.js";

import type * as configTypes from "../types/configTypes";


/*
 * SET UP FALLBACK VALUES
 */

const configFallbackValues = new Map<string, unknown>();

configFallbackValues.set("application.applicationName", "Sensor Monitor");
configFallbackValues.set("application.httpPort", 7676);

configFallbackValues.set("reverseProxy.disableCompression", false);
configFallbackValues.set("reverseProxy.disableEtag", false);
configFallbackValues.set("reverseProxy.urlPrefix", "");

configFallbackValues.set("settings.pollingMillis", 60_000);
configFallbackValues.set("settings.viewDays", 5);
configFallbackValues.set("settings.historicalBucketMinutes", 5);
configFallbackValues.set("settings.purgeDays", 60);

configFallbackValues.set("configs", []);


/*
 * Set up getProperty()
 */


export function getProperty(propertyName: "application.applicationName"): string;
export function getProperty(propertyName: "application.httpPort"): number;

export function getProperty(propertyName: "reverseProxy.disableCompression"): boolean;
export function getProperty(propertyName: "reverseProxy.disableEtag"): boolean;
export function getProperty(propertyName: "reverseProxy.urlPrefix"): string;

export function getProperty(propertyName: "settings.pollingMillis"): number;
export function getProperty(propertyName: "settings.viewDays"): number;
export function getProperty(propertyName: "settings.historicalBucketMinutes"): number;
export function getProperty(propertyName: "settings.purgeDays"): number;

export function getProperty(propertyName: "configs"): configTypes.SensorConfigs[];



export function getProperty(propertyName: string): unknown {

  const propertyNameSplit = propertyName.split(".");

  let currentObject = config;

  for (const propertyNamePiece of propertyNameSplit) {

    if (Object.prototype.hasOwnProperty.call(currentObject, propertyNamePiece)) {
      currentObject = currentObject[propertyNamePiece];

    } else {
      return configFallbackValues.get(propertyName);
    }
  }

  return currentObject;
}
