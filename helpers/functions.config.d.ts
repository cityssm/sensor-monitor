import type * as configTypes from "../types/configTypes";
export declare function getProperty(propertyName: "application.applicationName"): string;
export declare function getProperty(propertyName: "application.httpPort"): number;
export declare function getProperty(propertyName: "settings.pollingMillis"): number;
export declare function getProperty(propertyName: "settings.purgeDays"): number;
export declare function getProperty(propertyName: "configs"): configTypes.SensorConfigs[];
