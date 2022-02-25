export interface Config {
    application: {
        applicationName: string;
        httpPort: number;
    };
    reverseProxy?: {
        disableCompression: boolean;
        disableEtag: boolean;
        urlPrefix: string;
    };
    settings?: {
        pollingMillis?: number;
        viewDays?: number;
        historicalBucketMinutes?: number;
        purgeDays?: number;
    };
    configs: SensorConfigs[];
}
export declare type SensorConfigs = SensorConfig_AVTECH;
declare type SensorConfig_ConfigType = "AVTECH";
interface SensorConfig {
    configKey: string;
    configTitle?: string;
    configType: SensorConfig_ConfigType;
    sensors: {
        sensorKey: string;
        sensorTitle?: string;
    }[];
}
export interface SensorConfig_AVTECH extends SensorConfig {
    configKey: string;
    configTitle: string;
    configType: "AVTECH";
    statusURL: string;
    sensors: {
        sensorKey: string;
        sensorType: "digital" | "switch" | "analog";
        sensorIndex: number;
        sensorTitle?: string;
        sensorValue: {
            property: "temperature" | "state";
            unit: string;
            min?: number;
            max?: number;
        };
    }[];
}
export {};
