import type { RequestHandler } from "express";

import { getCurrentStatusLogs } from "../helpers/statusDB/getCurrentStatusLogs.js";


export const handler: RequestHandler = (_request, response) => {

  const currentStatusLogs = getCurrentStatusLogs();

  return response.json({
    currentStatusLogs
  });
};


export default handler;
