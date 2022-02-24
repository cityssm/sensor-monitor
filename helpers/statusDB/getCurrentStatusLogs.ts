import sqlite from "better-sqlite3";

import * as configFunctions from "../functions.config.js";
import { statusDB as databasePath } from "../../data/databasePaths.js";

import type { CurrentStatusLog } from "../../types/recordTypes";


const config_viewDays = configFunctions.getProperty("settings.viewDays");


export const getCurrentStatusLogs = (viewDays = config_viewDays): CurrentStatusLog[] => {

  const database = sqlite(databasePath, {
    readonly: true
  });

  const results = database.prepare("select c.configKey, c.sensorKey, c.statusTimeMillis," +
    " c.isError, c.sensorValue, c.sensorText," +
    " h.sensorValueMin, h.sensorValueMax" +
    " from StatusLog c" +
    (" inner join (" +
      "select configKey, sensorKey," +
      " max(statusTimeMillis) as statusTimeMillisMax," +
      " min(sensorValue) as sensorValueMin," +
      " max(sensorValue) as sensorValueMax" +
      " from StatusLog" +
      " where statusTimeMillis >= ?" +
      " group by configKey, sensorKey" +
      ") h on c.configKey = h.configKey and c.sensorKey = h.sensorKey and c.statusTimeMillis = h.statusTimeMillisMax"))
    .all(Date.now() - (viewDays * 86_400 * 1000));

  database.close();

  return results;
};


export default getCurrentStatusLogs;
