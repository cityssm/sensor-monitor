import createError from "http-errors";
import express from "express";

import compression from "compression";
import path from "path";

import routerDashboard from "./routes/dashboard.js";

import * as configFunctions from "./helpers/functions.config.js";
import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";
import * as stringFns from "@cityssm/expressjs-server-js/stringFns.js";
import * as htmlFns from "@cityssm/expressjs-server-js/htmlFns.js";

import { initializeDatabase } from "./helpers/statusDB/initializeDatabase.js";

import Debug from "debug";
const debug = Debug("sensor-monitor:app");


/*
 * INITALIZE THE DATABASE
 */

initializeDatabase();



/*
 * INITIALIZE APP
 */

export const app = express();

if (!configFunctions.getProperty("reverseProxy.disableEtag")) {
  app.set("etag", false);
}

// View engine setup
app.set("views", path.join("views"));
app.set("view engine", "ejs");

if (!configFunctions.getProperty("reverseProxy.disableCompression")) {
  app.use(compression());
}

app.use((request, _response, next) => {
  debug(`${request.method} ${request.url}`);
  next();
});

app.use(express.json());

app.use(express.urlencoded({
  extended: false
}));


/*
 * STATIC ROUTES
 */


 const urlPrefix = configFunctions.getProperty("reverseProxy.urlPrefix");


app.use(urlPrefix, express.static(path.join("public")));

app.use(urlPrefix + "/lib/bulma-a11y",
  express.static(path.join("node_modules", "@cityssm", "bulma-a11y")));

app.use(urlPrefix + "/lib/bulma-js",
  express.static(path.join("node_modules", "@cityssm", "bulma-js", "dist")));

app.use(urlPrefix + "/lib/bulma-webapp-js",
  express.static(path.join("node_modules", "@cityssm", "bulma-webapp-js", "dist")));

app.use(urlPrefix + "/lib/echarts",
  express.static(path.join("node_modules", "echarts", "dist")));

app.use(urlPrefix + "/lib/fa5",
  express.static(path.join("node_modules", "@fortawesome", "fontawesome-free")));


/*
 * ROUTES
 */


// Make the user and config objects available to the templates
app.use((_request, response, next) => {

  response.locals.buildNumber = process.env.npm_package_version;

  response.locals.configFunctions = configFunctions;
  response.locals.dateTimeFns = dateTimeFns;
  response.locals.stringFns = stringFns;
  response.locals.htmlFns = htmlFns;
  response.locals.urlPrefix = urlPrefix;

  next();
});


app.use(urlPrefix + "/", routerDashboard);


// Catch 404 and forward to error handler
app.use((_request, _response, next) => {
  next(createError(404));
});

// Error handler
app.use((error: createError.HttpError, request: express.Request, response: express.Response) => {

  // Set locals, only providing error in development
  response.locals.message = error.message;
  response.locals.error = request.app.get("env") === "development" ? error : {};

  // Render the error page
  response.status(error.status || 500);
  response.render("error");
});


export default app;
