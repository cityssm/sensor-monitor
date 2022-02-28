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

  const urlPrefix = exports.urlPrefix as string;

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

    // Update Chart

    if (updateChart) {

      const chartElement = sensorElement.querySelector(".chart");

      const chart = charts[currentStatusLog.configKey][currentStatusLog.sensorKey];

      const data = chart.getOption().series[0].data as ChartData[];

      while (data.length > 10_000) {
        data.shift();
      }

      const dataPoint = {
        value: [
          new Date(currentStatusLog.statusTimeMillis),
          currentStatusLog.sensorValue
        ]
      };

      if ((chartElement.dataset.min && Number.parseFloat(chartElement.dataset.min) > currentStatusLog.sensorValue) ||
        (chartElement.dataset.max && Number.parseFloat(chartElement.dataset.max) < currentStatusLog.sensorValue)) {
        dataPoint.symbol = "circle";
        dataPoint.symbolSize = 4;
        dataPoint.itemStyle = {
          color: "red"
        };
      } else {
        dataPoint.symbolSize = 0;
      }

      data.push(dataPoint);

      chart.setOption({
        series: {
          data: data
        }
      });
    }
  };

  const getCurrentStatusLogs = () => {

    cityssm.postJSON(urlPrefix + "/doGetCurrentStatusLogs", {},
      (responseJSON: { currentStatusLogs: recordTypes.CurrentStatusLog[] }) => {

        for (const currentStatusLog of responseJSON.currentStatusLogs) {
          renderCurrentStatusLog(currentStatusLog);
        }
      });
  };

  const historicalStatusLogs: recordTypes.HistoricalStatusLogs = exports.historicalStatusLogs;

  const initializeSensor = (configKey: string, sensorKey: string, sensorElement: HTMLElement) => {

    const statusLogs = historicalStatusLogs[configKey][sensorKey];

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
      yAxis: [{
        type: "value",
        min: "dataMin",
        max: "dataMax"
      }],
      series: [{
        data: [],
        type: "line",
        smooth: true
      }]
    };

    for (const statusLog of statusLogs) {

      const dataPoint = {
        value: [new Date(statusLog.statusTimeMillis), statusLog.sensorValue]
      };

      if ((chartElement.dataset.min && Number.parseFloat(chartElement.dataset.min) > statusLog.sensorValue) ||
        (chartElement.dataset.max && Number.parseFloat(chartElement.dataset.max) < statusLog.sensorValue)) {
        dataPoint.symbol = "circle";
        dataPoint.symbolSize = 4;
        dataPoint.itemStyle = {
          color: "red"
        };
      } else {
        dataPoint.symbolSize = 0;
      }

      chartOptions.series[0].data.push(dataPoint);
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

        const sensorElement = configElement.querySelector(`[data-sensor-key='${sensorKey}']`) as HTMLElement;

        if (!sensorElement || statusLogs.length === 0) {
          continue;
        }

        initializeSensor(configKey, sensorKey, sensorElement);
      }
    }

    const currentStatusLogs: recordTypes.CurrentStatusLog[] = exports.currentStatusLogs;

    for (const currentStatusLog of currentStatusLogs) {
      renderCurrentStatusLog(currentStatusLog);
    }
  };

  initialize();

  const pollingMillis = Number.parseInt(document.querySelector("main").dataset.pollingMillis, 10);
  window.setInterval(getCurrentStatusLogs, pollingMillis);
})();
