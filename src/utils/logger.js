"use strict";

/**
 * ============================================================
 * LOGGER (Winston)
 * ============================================================
 *
 * Centraliza todos os logs da aplicacao.
 *
 * - Console: saida colorida e legivel durante o desenvolvimento.
 * - Arquivo "logs/combined-YYYY-MM-DD.log": todos os logs.
 * - Arquivo "logs/error-YYYY-MM-DD.log": apenas erros.
 *
 * Os arquivos giram (rotacionam) automaticamente por dia e
 * ficam compactados apos alguns dias, evitando que a pasta
 * de logs cresca indefinidamente.
 * ============================================================
 */

const path = require("path");
const winston = require("winston");
require("winston-daily-rotate-file");

const LOG_DIR = path.join(__dirname, "..", "..", "logs");
const LOG_LEVEL = process.env.LOG_LEVEL || "info";
const NODE_ENV = process.env.NODE_ENV || "development";

const baseFormat = winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    winston.format.splat()
);

const consoleFormat = winston.format.combine(
    baseFormat,
    winston.format.colorize(),
    winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
        const metaString =
            Object.keys(meta).length > 0 ? " " + JSON.stringify(meta) : "";

        return `${timestamp} [${level}]: ${stack || message}${metaString}`;
    })
);

const fileFormat = winston.format.combine(baseFormat, winston.format.json());

const combinedRotateTransport = new winston.transports.DailyRotateFile({
    dirname: LOG_DIR,
    filename: "combined-%DATE%.log",
    datePattern: "YYYY-MM-DD",
    maxSize: "10m",
    maxFiles: "14d",
    zippedArchive: true,
    format: fileFormat
});

const errorRotateTransport = new winston.transports.DailyRotateFile({
    dirname: LOG_DIR,
    filename: "error-%DATE%.log",
    datePattern: "YYYY-MM-DD",
    level: "error",
    maxSize: "10m",
    maxFiles: "30d",
    zippedArchive: true,
    format: fileFormat
});

const transports = [combinedRotateTransport, errorRotateTransport];

// Em desenvolvimento, tambem imprime no console.
// Em producao o console continua ativo (util para "docker logs"
// ou para acompanhar via terminal), mas sem cores no CI.
transports.push(
    new winston.transports.Console({
        format: NODE_ENV === "production" ? fileFormat : consoleFormat
    })
);

const logger = winston.createLogger({
    level: LOG_LEVEL,
    format: baseFormat,
    transports,
    exitOnError: false
});

// Captura erros nao tratados e rejeicoes de Promise para o log,
// em vez de deixar o processo morrer silenciosamente.
logger.exceptions.handle(
    new winston.transports.DailyRotateFile({
        dirname: LOG_DIR,
        filename: "exceptions-%DATE%.log",
        datePattern: "YYYY-MM-DD",
        maxSize: "10m",
        maxFiles: "30d",
        zippedArchive: true,
        format: fileFormat
    })
);

logger.rejectionHandlers = logger.rejectionHandlers || [];
process.on("unhandledRejection", (reason) => {
    logger.error("Unhandled Promise Rejection", { reason });
});

module.exports = logger;
