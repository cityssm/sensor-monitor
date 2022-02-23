import { config } from "../data/config.js";
const configFallbackValues = new Map();
configFallbackValues.set("application.applicationName", "Sensor Monitor");
configFallbackValues.set("application.httpPort", 7676);
configFallbackValues.set("settings.pollingMillis", 60000);
configFallbackValues.set("settings.purgeDays", 60);
configFallbackValues.set("configs", []);
export function getProperty(propertyName) {
    const propertyNameSplit = propertyName.split(".");
    let currentObject = config;
    for (const propertyNamePiece of propertyNameSplit) {
        if (Object.prototype.hasOwnProperty.call(currentObject, propertyNamePiece)) {
            currentObject = currentObject[propertyNamePiece];
        }
        else {
            return configFallbackValues.get(propertyName);
        }
    }
    return currentObject;
}
