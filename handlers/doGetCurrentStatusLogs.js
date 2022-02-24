import { getCurrentStatusLogs } from "../helpers/statusDB/getCurrentStatusLogs.js";
export const handler = (_request, response) => {
    const currentStatusLogs = getCurrentStatusLogs();
    return response.json({
        currentStatusLogs
    });
};
export default handler;
