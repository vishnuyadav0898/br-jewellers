import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import swaggerDocsRouter from "./swagger/swagger.js";
import apiRouter from "./routes/index.js";
import ResponseHandler from "./utils/responseHandler.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  morgan("dev", {
    skip: () => process.env.NODE_ENV === "test",
  })
);

app.get("/health", (req, res) => {
  return ResponseHandler.success(res, "OK", { status: "up" });
});


app.use("/api-docs", swaggerDocsRouter);
app.use(apiRouter);

app.use((req, res) => {
  return ResponseHandler.notFound(res, `Route not found: ${req.originalUrl}`);
});

// ✅ Global error handler
app.use(ResponseHandler.handleErrors.bind(ResponseHandler));

export default app;