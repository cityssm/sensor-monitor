/* eslint-disable no-process-exit, unicorn/no-process-exit */

import { app } from "../app.js";

import http from "http";

import { fork } from "child_process";

import * as configFunctions from "../helpers/functions.config.js";

import Debug from "debug";
const debug = Debug("sensor-monitor:www");


const onError = (error: Error) => {

  if (error.syscall !== "listen") {
    throw error;
  }

  let doProcessExit = false;

  // handle specific listen errors with friendly messages
  switch (error.code) {

    case "EACCES":
      debug("Requires elevated privileges");
      doProcessExit = true;
      break;

    case "EADDRINUSE":
      debug("Port is already in use.");
      doProcessExit = true;
      break;

    default:
      throw error;
  }

  if (doProcessExit) {
    process.exit(1);
  }
};


const onListening = (server: http.Server) => {

  const addr = server.address();

  const bind = typeof addr === "string"
    ? "pipe " + addr
    : "port " + addr.port.toString();

  debug("Listening on " + bind);
};


/**
 * Initialize HTTP
 */


const httpPort = configFunctions.getProperty("application.httpPort");

if (httpPort) {

  const httpServer = http.createServer(app);

  httpServer.listen(httpPort);

  httpServer.on("error", onError);
  httpServer.on("listening", () => {
    onListening(httpServer);
  });

  debug("HTTP listening on " + httpPort.toString());
}

/**
 * Initialize background tasks
 */

fork("./tasks/configPoller");
//fork("./tasks/databaseCleaner");
