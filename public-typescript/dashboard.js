"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    const urlPrefix = exports.urlPrefix;
    const charts = {};
    const clearTextColors = (element) => {
        element.classList.remove("has-text-danger", "has-text-warning", "has-text-success", "has-text-grey");
    };
    const renderCurrentStatusLog = (currentStatusLog, sensorElement) => {
        let updateChart = false;
        if (!sensorElement) {
            sensorElement = document.querySelector(`[data-config-key='${currentStatusLog.configKey}']`)
                .querySelector(`[data-sensor-key='${currentStatusLog.sensorKey}']`);
            updateChart = true;
        }
        if (!sensorElement) {
            return;
        }
        const statusElement = sensorElement.querySelector(".sensor-status");
        clearTextColors(statusElement);
        if (currentStatusLog.isError) {
            statusElement.classList.add("has-text-warning");
        }
        else if (currentStatusLog.sensorText) {
            statusElement.classList.add("has-text-danger");
        }
        else {
            statusElement.classList.add("has-text-success");
        }
        for (const element of sensorElement.querySelectorAll("[data-field='sensorValue']")) {
            element.textContent = currentStatusLog.sensorValue.toString();
        }
        for (const element of sensorElement.querySelectorAll("[data-field='statusTime']")) {
            element.textContent = new Date(currentStatusLog.statusTimeMillis).toLocaleString();
        }
        for (const element of sensorElement.querySelectorAll("[data-field='sensorValueMin']")) {
            element.textContent = currentStatusLog.sensorValueMin.toString();
        }
        for (const element of sensorElement.querySelectorAll("[data-field='sensorValueMax']")) {
            element.textContent = currentStatusLog.sensorValueMax.toString();
        }
        for (const element of sensorElement.querySelectorAll("[data-field='sensorText']")) {
            element.textContent = currentStatusLog.sensorText;
        }
        if (updateChart) {
            const chart = charts[currentStatusLog.configKey][currentStatusLog.sensorKey];
            const data = chart.getOption().series[0].data;
            while (data.length > 10000) {
                data.shift();
            }
            data.push([
                new Date(currentStatusLog.statusTimeMillis),
                currentStatusLog.sensorValue
            ]);
            chart.setOption({
                series: {
                    data: data
                }
            });
        }
    };
    const getCurrentStatusLogs = () => {
        cityssm.postJSON(urlPrefix + "/doGetCurrentStatusLogs", {}, (responseJSON) => {
            for (const currentStatusLog of responseJSON.currentStatusLogs) {
                renderCurrentStatusLog(currentStatusLog);
            }
        });
    };
    const historicalStatusLogs = exports.historicalStatusLogs;
    const initializeSensor = (configKey, sensorKey, sensorElement) => {
        const statusLogs = historicalStatusLogs[configKey][sensorKey];
        const chartElement = sensorElement.querySelector(".chart");
        const chart = echarts.init(chartElement);
        const chartOptions = {
            tooltip: {
                trigger: "axis"
            },
            xAxis: {
                type: "time"
            },
            yAxis: {
                type: "value",
                min: "dataMin",
                max: "dataMax"
            },
            series: [{
                    data: [],
                    type: "line",
                    showSymbol: false,
                    smooth: true
                }]
        };
        for (const statusLog of statusLogs) {
            chartOptions.series[0].data.push([new Date(statusLog.statusTimeMillis), statusLog.sensorValue]);
        }
        chart.setOption(chartOptions);
        charts[configKey][sensorKey] = chart;
    };
    const initialize = () => {
        for (const [configKey, config] of Object.entries(historicalStatusLogs)) {
            const configElement = document.querySelector(`[data-config-key='${configKey}']`);
            if (!configElement) {
                continue;
            }
            charts[configKey] = {};
            for (const [sensorKey, statusLogs] of Object.entries(config)) {
                const sensorElement = configElement.querySelector(`[data-sensor-key='${sensorKey}']`);
                if (!sensorElement || statusLogs.length === 0) {
                    continue;
                }
                initializeSensor(configKey, sensorKey, sensorElement);
            }
        }
        const currentStatusLogs = exports.currentStatusLogs;
        for (const currentStatusLog of currentStatusLogs) {
            renderCurrentStatusLog(currentStatusLog);
        }
    };
    initialize();
    const pollingMillis = Number.parseInt(document.querySelector("main").dataset.pollingMillis, 10);
    window.setInterval(getCurrentStatusLogs, pollingMillis);
})();
