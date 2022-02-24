/* eslint-disable unicorn/prefer-module */

import type * as recordTypes from "../types/recordTypes";
import type * as cityssmTypes from "@cityssm/bulma-webapp-js/src/types";

import type * as echartsTypes from "echarts";


declare const cityssm: cityssmTypes.cityssmGlobal;


declare const echarts: {
  init(element: HTMLElement): echartsTypes.ECharts;
}

interface Charts {
  [configKey: string]: {
    [sensorKey: string]: echartsTypes.ECharts;
  }
}

type ChartData = [
  Date, number
]


(() => {

  const charts: Charts = {};

  const clearTextColors = (element: HTMLElement) => {
    element.classList.remove("has-text-danger", "has-text-warning", "has-text-success", "has-text-grey")
  };

  const renderCurrentStatusLog = (
    currentStatusLog: recordTypes.CurrentStatusLog,
    sensorElement?: HTMLElement) => {

    let updateChart = false;

    if (!sensorElement) {
      sensorElement = document.querySelector(`[data-config-key='${currentStatusLog.configKey}']`)
        .querySelector(`[data-sensor-key='${currentStatusLog.sensorKey}']`);

      updateChart = true;
    }

    if (!sensorElement) {
      return;
    }

    const statusElement = sensorElement.querySelector(".sensor-status") as HTMLElement;
    clearTextColors(statusElement);

    if (currentStatusLog.isError) {
      statusElement.classList.add("has-text-warning");

    } else if (currentStatusLog.sensorText) {
      statusElement.classList.add("has-text-danger");

    } else {
      statusElement.classList.add("has-text-success");
    }

    for (const element of sensorElement.querySelectorAll("[data-field='sensorValue']")) {
      element.textContent = currentStatusLog.sensorValue.toString();
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

    // Update Chart

    if (updateChart) {

      const chart = charts[currentStatusLog.configKey][currentStatusLog.sensorKey];

      const data = chart.getOption().series[0].data as ChartData[];

      while (data.length > 10_000) {
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

    cityssm.postJSON("/doGetCurrentStatusLogs", {},
      (responseJSON: { currentStatusLogs: recordTypes.CurrentStatusLog[] }) => {

        for (const currentStatusLog of responseJSON.currentStatusLogs) {
          renderCurrentStatusLog(currentStatusLog);
        }
      });
  };

  const historicalStatusLogs: recordTypes.HistoricalStatusLogs = exports.historicalStatusLogs;

  const initializeSensor = (configKey: string, sensorKey: string, sensorElement: HTMLElement) => {

    const statusLogs = historicalStatusLogs[configKey][sensorKey];

    const currentStatusLog: recordTypes.CurrentStatusLog = {
      configKey,
      sensorKey,
      statusTimeMillis: statusLogs[statusLogs.length - 1].statusTimeMillis,
      isError: statusLogs[statusLogs.length - 1].isError,
      sensorValue: statusLogs[statusLogs.length - 1].sensorValue,
      sensorText: statusLogs[statusLogs.length - 1].sensorText,
      sensorValueMin: statusLogs[statusLogs.length - 1].sensorValue,
      sensorValueMax: statusLogs[statusLogs.length - 1].sensorValue
    };

    // Setup chart

    const chartElement = sensorElement.querySelector(".chart") as HTMLElement;
    const chart = echarts.init(chartElement);

    const chartOptions: echartsTypes.EChartsOption = {
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

      currentStatusLog.sensorValueMin = Math.min(currentStatusLog.sensorValueMin, statusLog.sensorValue);
      currentStatusLog.sensorValueMax = Math.max(currentStatusLog.sensorValueMax, statusLog.sensorValue);

      chartOptions.series[0].data.push(
        [new Date(statusLog.statusTimeMillis), statusLog.sensorValue]
      );
    }

    chart.setOption(chartOptions);

    charts[configKey][sensorKey] = chart;

    renderCurrentStatusLog(currentStatusLog, sensorElement);
  };

  const initialize = () => {

    for (const [configKey, config] of Object.entries(historicalStatusLogs)) {

      const configElement = document.querySelector(`[data-config-key='${configKey}']`);

      if (!configElement) {
        continue;
      }

      charts[configKey] = {};

      for (const [sensorKey, statusLogs] of Object.entries(config)) {

        const sensorElement = configElement.querySelector(`[data-sensor-key='${sensorKey}']`) as HTMLElement;

        if (!sensorElement || statusLogs.length === 0) {
          continue;
        }

        initializeSensor(configKey, sensorKey, sensorElement);
      }
    }
  };

  initialize();

  const pollingMillis = Number.parseInt(document.querySelector("main").dataset.pollingMillis, 10);
  window.setInterval(getCurrentStatusLogs, pollingMillis);
})();
