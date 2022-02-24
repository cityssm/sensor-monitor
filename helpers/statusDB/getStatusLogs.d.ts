import type { StatusLog } from "../../types/recordTypes";
export declare const getStatusLogs: (configKey: string, sensorKey: string, viewDays?: number) => StatusLog[];
export default getStatusLogs;
