import fs from "node:fs";
import path from "node:path";
import winston from "winston";

const logsDir = path.resolve(process.cwd(), "logs");
fs.mkdirSync(logsDir, { recursive: true });

const toMessageString = (value) => {
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

export const logger = winston.createLogger({
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
  },
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.printf((info) => {
      const message = toMessageString(info.message);
      const stack = info.stack ? `\n${info.stack}` : "";
      return `${info.timestamp} ${info.level}: ${message}${stack}`;
    }),
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: path.join(logsDir, "error.log"),
      level: "error",
    }),
    new winston.transports.File({
      filename: path.join(logsDir, "combined.log"),
    }),
  ],
});

