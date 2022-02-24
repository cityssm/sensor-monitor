import * as configFunctions from "../helpers/functions.config.js";
import { getStatusLogs } from "../helpers/statusDB/getStatusLogs.js";
export const handler = (_request, response) => {
    const historicalStatusLogs = {};
    const configs = configFunctions.getProperty("configs");
    for (const config of configs) {
        historicalStatusLogs[config.configKey] = {};
        for (const sensor of config.sensors) {
            historicalStatusLogs[config.configKey][sensor.sensorKey] = getStatusLogs(config.configKey, sensor.sensorKey);
        }
    }
    return response.render("dashboard", {
        historicalStatusLogs
    });
};
export default handler;
