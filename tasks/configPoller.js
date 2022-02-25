import { getStatuses as getStatuses_AVTECH } from "./configPoller/avtech.js";
import * as configFunctions from "../helpers/functions.config.js";
import { setIntervalAsync, clearIntervalAsync } from "set-interval-async/fixed/index.js";
import exitHook from "exit-hook";
const doTask = async () => {
    const configs = configFunctions.getProperty("configs");
    for (const config of configs) {
        switch (config.configType) {
            case "AVTECH":
                await getStatuses_AVTECH(config);
                break;
        }
    }
};
doTask();
const intervalID = setIntervalAsync(doTask, configFunctions.getProperty("settings.pollingMillis"));
exitHook(() => {
    try {
        clearIntervalAsync(intervalID);
    }
    catch {
    }
});
