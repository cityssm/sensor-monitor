import fetch from "node-fetch";
import { addStatusLog } from "../helpers/statusDB/addStatusLog.js";
export const getStatuses = async (config) => {
    const response = await fetch(config.statusURL);
    const statusTimeMillis = Date.now();
    const data = response.ok ? await response.json() : undefined;
    for (const sensor of config.sensors) {
        const log = {
            configKey: config.configKey,
            sensorKey: sensor.sensorKey,
            statusTimeMillis,
            isError: false
        };
        if (!data) {
            log.isError = true;
            log.sensorText = "Fetch Error " + response.status + ": " + response.statusText;
        }
        else {
            try {
                const sensorValue = data[sensor.sensorType + "Sensors"][sensor.sensorIndex][sensor.sensorValue.property];
                log.sensorValue = sensorValue;
                log.sensorText = sensorValue;
            }
            catch {
                log.isError = true;
                log.sensorText = "Parse Error: " + JSON.stringify(sensor);
            }
        }
        addStatusLog(log);
    }
};
