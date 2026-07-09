import "dotenv/config";

import app from "./app.js";
import { connectDB } from "./config/db.js";
import { logger } from "./utils/logger.js";
import { StorageService } from "./services/storage.service.js";

const PORT = Number(process.env.PORT) || 3000;

await connectDB();
await StorageService.initBucket();

app.listen(PORT, () => {
  logger.info(`Server listening on port ${PORT}`);
});

