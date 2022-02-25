import sqlite from "better-sqlite3";
import * as configFunctions from "../functions.config.js";
import { statusDB as databasePath } from "../../data/databasePaths.js";
const config_viewDays = configFunctions.getProperty("settings.viewDays");
const bucketMillis = configFunctions.getProperty("settings.historicalBucketMinutes") * 60 * 1000;
export const getStatusLogs = (configKey, sensorKey, viewDays = config_viewDays) => {
    const database = sqlite(databasePath, {
        readonly: true
    });
    const results = database.prepare("select" +
        " (statusTimeMillis - (statusTimeMillis % " + bucketMillis + ")) as statusTimeMillis," +
        " max(isError) as isError," +
        " round(avg(sensorValue), 2) as sensorValue," +
        " max(sensorText) as sensorText" +
        " from StatusLog" +
        " where configKey = ?" +
        " and sensorKey = ?" +
        " and statusTimeMillis >= ?" +
        " group by configKey, sensorKey, (statusTimeMillis - (statusTimeMillis % " + bucketMillis + "))" +
        " order by statusTimeMillis")
        .all(configKey, sensorKey, Date.now() - (viewDays * 86400 * 1000));
    database.close();
    return results;
};
export default getStatusLogs;
