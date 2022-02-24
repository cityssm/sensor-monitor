import { Router } from "express";
import handler_dashboard from "../handlers/dashboard.js";
import handler_doGetCurrentStatusLogs from "../handlers/doGetCurrentStatusLogs.js";
export const router = Router();
router.get("/", handler_dashboard);
router.all("/doGetCurrentStatusLogs", handler_doGetCurrentStatusLogs);
export default router;
