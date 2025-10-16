/**
 * Winston Logger Configuration
 * Provides structured logging with multiple transports and log levels
 */

import winston from "winston";
import path from "path";
import { fileURLToPath } from "url";
import { config } from "../config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "blue",
};

// Tell winston about the custom colors
winston.addColors(colors);

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.printf((info) => {
    const { timestamp, level, message, stack, ...meta } = info;
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;

    // Add stack trace for errors
    if (stack) {
      log += `\n${stack}`;
    }

    // Add metadata if present
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta)}`;
    }

    return log;
  })
);

// Define which transports the logger should use
const transports = [
  // Console transport
  new winston.transports.Console({
    format: winston.format.combine(
      //winston.format.colorize({ all: true }),
      logFormat
    ),
  }),

  // File transport for errors
  new winston.transports.File({
    filename: path.join(__dirname, "../../logs/error.log"),
    level: "error",
    format: logFormat,
    maxsize: 10 * 10 * 1024, // 10MB
    maxFiles: 10,
    rotationFormat: () => "_" + new Date().toISOString().replace(/[:.]/g, "-"),
  }),

  // File transport for all logs
  new winston.transports.File({
    filename: path.join(__dirname, "../../logs/combined.log"),
    format: logFormat,
    maxsize: 10 * 10 * 1024, // 10MB
    maxFiles: 10,
    rotationFormat: () => "_" + new Date().toISOString().replace(/[:.]/g, "-"),
  }),
];

// Valid log levels (Winston order from highest to lowest priority)
const VALID_LOG_LEVELS = ["error", "warn", "info", "http", "debug"];

/**
 * Validate and get log level from configuration
 * Falls back to 'info' if invalid level is provided
 * @returns {string} Valid log level
 */
const getLogLevel = () => {
  const configLevel = config.logging.level;

  if (!VALID_LOG_LEVELS.includes(configLevel)) {
    console.warn(
      `[Logger] Invalid LOG_LEVEL "${configLevel}". Valid levels: ${VALID_LOG_LEVELS.join(
        ", "
      )}. Falling back to "info".`
    );
    return "info";
  }

  return configLevel;
};

// Create the logger instance
const logger = winston.createLogger({
  level: getLogLevel(),
  levels,
  transports,
  // Don't exit on handled exceptions
  exitOnError: false,
});

// Log the logger initialization (will only show if level allows info or higher)
logger.info("Logger initialized", {
  level: logger.level,
  environment: process.env.NODE_ENV || "development",
  configuredLevel: config.logging.level,
});

// Handle uncaught exceptions and unhandled rejections
logger.exceptions.handle(
  new winston.transports.File({
    filename: path.join(__dirname, "../../logs/exceptions.log"),
    format: logFormat,
  })
);

logger.rejections.handle(
  new winston.transports.File({
    filename: path.join(__dirname, "../../logs/rejections.log"),
    format: logFormat,
  })
);

// Create logs directory if it doesn't exist
import fs from "fs";
const logsDir = path.join(__dirname, "../../logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

export default logger;
