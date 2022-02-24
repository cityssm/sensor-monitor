import fetch from "node-fetch";
import { addStatusLog } from "../helpers/statusDB/addStatusLog.js";

import type { StatusLog } from "../types/recordTypes";
import type { SensorConfig_AVTECH } from "../types/configTypes";


export const getStatuses = async (config: SensorConfig_AVTECH) => {

  const response = await fetch(config.statusURL);

  const statusTimeMillis = Date.now();

  const data = response.ok ? await response.json() : undefined;

  for (const sensor of config.sensors) {

    const log: StatusLog = {
      configKey: config.configKey,
      sensorKey: sensor.sensorKey,
      statusTimeMillis,
      isError: false
    };

    if (!data) {
      log.isError = true;
      log.sensorText = "Fetch Error " + response.status + ": " + response.statusText;

    } else {

      try {
        const sensorValue = data[sensor.sensorType + "Sensors"][sensor.sensorIndex][sensor.sensorValue.property];
        log.sensorValue = sensorValue;

        if (Object.prototype.hasOwnProperty.call(sensor.sensorValue, "max") && sensorValue > sensor.sensorValue.max) {
          log.sensorText = "Warning: Maximum Threshold Exceeded (" + sensor.sensorValue.max.toString() + " " + (sensor.sensorValue.unit || "") + ")";

        } else if (Object.prototype.hasOwnProperty.call(sensor.sensorValue, "min") && sensorValue < sensor.sensorValue.min) {
          log.sensorText = "Warning: Minimum Threshold Exceeded (" + sensor.sensorValue.min.toString() + " " + (sensor.sensorValue.unit || "") + ")";
        }

      } catch {
        log.isError = true;
        log.sensorText = "Parse Error: " + JSON.stringify(sensor);
      }
    }

    addStatusLog(log);
  }
};
