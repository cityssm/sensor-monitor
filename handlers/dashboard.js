import * as configFunctions from "../helpers/functions.config.js";
import { getStatusLogs } from "../helpers/statusDB/getStatusLogs.js";
import { getCurrentStatusLogs } from "../helpers/statusDB/getCurrentStatusLogs.js";
export const handler = (_request, response) => {
    const historicalStatusLogs = {};
    const configs = configFunctions.getProperty("configs");
    for (const config of configs) {
        historicalStatusLogs[config.configKey] = {};
        for (const sensor of config.sensors) {
            historicalStatusLogs[config.configKey][sensor.sensorKey] = getStatusLogs(config.configKey, sensor.sensorKey);
        }
    }
    const currentStatusLogs = getCurrentStatusLogs();
    return response.render("dashboard", {
        historicalStatusLogs,
        currentStatusLogs
    });
};
export default handler;
