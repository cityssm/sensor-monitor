export interface StatusLog {
  configKey?: string;
  sensorKey?: string;
  statusTimeMillis: number;
  isError: boolean;
  sensorValue?: number;
  sensorText?: string;
}


export interface CurrentStatusLog extends StatusLog {
  sensorValueMin: number;
  sensorValueMax: number;
}


export interface HistoricalStatusLogs {
  [configKey: string]: {
    [sensorKey: string]: StatusLog[];
  }
}
