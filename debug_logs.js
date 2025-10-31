import { LogsModel } from "./src/models/logs.model.js";

(async () => {
  try {
    const rows = await LogsModel.getAllLogs();
    console.log('Rows length:', rows.length);
    console.log(rows.slice(0,5));
  } catch (err) {
    console.error('Debug error while fetching logs:', err);
  } finally {
    process.exit(0);
  }
})();
