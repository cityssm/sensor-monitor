import sqlite from "better-sqlite3";
import { statusDB as databasePath } from "../../data/databasePaths.js";
import Debug from "debug";
const debug = Debug("sensor-monitor:initializeDatabase");
export const initializeDatabase = () => {
    const database = sqlite(databasePath);
    let doCreate = false;
    const row = database.prepare("select name from sqlite_master where type = 'table' and name = 'StatusLog'").get();
    if (!row) {
        debug("Creating " + databasePath);
        doCreate = true;
        database.prepare("create table if not exists StatusLog (" +
            "configKey varchar(50) not null," +
            " sensorKey varchar(50) not null," +
            " statusTimeMillis int not null," +
            " isError bit not null default 0," +
            " sensorValue numeric," +
            " sensorText text," +
            " primary key (configKey, sensorKey, statusTimeMillis)" +
            ") without rowid")
            .run();
    }
    database.close();
    return doCreate;
};
export default initializeDatabase;
