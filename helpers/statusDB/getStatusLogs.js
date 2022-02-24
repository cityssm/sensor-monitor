import sqlite from "better-sqlite3";
import * as configFunctions from "../functions.config.js";
import { statusDB as databasePath } from "../../data/databasePaths.js";
const config_viewDays = configFunctions.getProperty("settings.viewDays");
export const getStatusLogs = (configKey, sensorKey, viewDays = config_viewDays) => {
    const database = sqlite(databasePath, {
        readonly: true
    });
    const results = database.prepare("select statusTimeMillis, isError, sensorValue, sensorText" +
        " from StatusLog" +
        " where configKey = ?" +
        " and sensorKey = ?" +
        " and statusTimeMillis >= ?" +
        " order by statusTimeMillis")
        .all(configKey, sensorKey, Date.now() - (viewDays * 86400 * 1000));
    database.close();
    return results;
};
export default getStatusLogs;
