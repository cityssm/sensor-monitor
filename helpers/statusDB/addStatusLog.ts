import sqlite from "better-sqlite3";

import type { StatusLog } from "../../types/recordTypes";

import { statusDB as databasePath } from "../../data/databasePaths.js";


export const addStatusLog = (log: StatusLog): boolean => {

  const database = sqlite(databasePath);

  const info = database.prepare("insert into StatusLog (" +
    "configKey, sensorKey, statusTimeMillis, isError, sensorValue, sensorText)" +
    " values (?, ?, ?, ?, ?, ?)")
    .run(log.configKey,
      log.sensorKey,
      log.statusTimeMillis,
      log.isError ? 1 : 0,
      log.sensorValue,
      log.sensorText);

  database.close();

  return (info.changes > 0);
};


export default addStatusLog;
