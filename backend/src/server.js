import "dotenv/config";

import app from "./app.js";
import { connectDB } from "./config/db.js";
import { logger } from "./utils/logger.js";

const PORT = Number(process.env.PORT) || 3000;

await connectDB();

app.listen(PORT, () => {
  logger.info(`Server listening on port ${PORT}`);
});

