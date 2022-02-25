import { purgeStatusLogs } from "../helpers/statusDB/purgeStatusLogs.js";
import exitHook from "exit-hook";
import Debug from "debug";
const debug = Debug("sensor-monitor:tasks:databaseCleanup");
const doTask = () => {
    const purgeCount = purgeStatusLogs();
    debug(purgeCount +
        " record" + (purgeCount === 1 ? "" : "s") +
        " purged.");
};
doTask();
const intervalID = setInterval(doTask, 86400 * 1000);
exitHook(() => {
    try {
        clearInterval(intervalID);
    }
    catch {
    }
});
