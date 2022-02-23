export interface StatusLog {
    configKey: string;
    sensorKey: string;
    statusTimeMillis: number;
    isError: boolean;
    sensorValue?: number;
    sensorText?: string;
}
