import sqlite from "better-sqlite3";

import * as configFunctions from "../functions.config.js";
import { statusDB as databasePath } from "../../data/databasePaths.js";


const config_purgeDays = configFunctions.getProperty("settings.purgeDays");


export const purgeStatusLogs = (purgeDays = config_purgeDays): number => {

  const database = sqlite(databasePath);

  const info = database.prepare("delete from StatusLog" +
    " where statusTimeMillis <= ?")
    .run(Date.now() - (purgeDays * 86_400 * 1000));

  database.close();

  return info.changes;
};


export default purgeStatusLogs;
