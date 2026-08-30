"use strict";

/**
 * ============================================================
 * ENTENDA SUA BEXIGA - Servidor Node.js / Express
 * ============================================================
 *
 * Responsavel por:
 *  - Servir o formulario (frontend estatico em /public)
 *  - Receber as respostas via API (/api/avaliacoes)
 *  - Gravar cada resposta em uma planilha Excel (/data)
 *  - Registrar logs profissionais de tudo o que acontece
 * ============================================================
 */

const path = require("path");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");

const config = require("./config/env");
const logger = require("./utils/logger");
const assessmentRoutes = require("./routes/assessment.routes");
const { assignRequestId, httpLogger } = require("./middlewares/requestLogger");
const { notFoundHandler, errorHandler } = require("./middlewares/errorHandler");

const app = express();

// ------------------------------------------------------------
// Middlewares globais
// ------------------------------------------------------------
app.use(assignRequestId);
app.use(httpLogger);

app.use(
    helmet({
        contentSecurityPolicy: false // formulario usa <style>/<script> proprios servidos localmente
    })
);

app.use(
    cors({
        origin: config.corsOrigin === "*" ? true : config.corsOrigin.split(",")
    })
);

app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// ------------------------------------------------------------
// Frontend estatico (a pagina do formulario)
// ------------------------------------------------------------
app.use(express.static(path.join(__dirname, "..", "public")));

// ------------------------------------------------------------
// Rotas da API
// ------------------------------------------------------------
app.use("/api", assessmentRoutes);

// ------------------------------------------------------------
// 404 e erros
// ------------------------------------------------------------
app.use(notFoundHandler);
app.use(errorHandler);

// ------------------------------------------------------------
// Inicializacao do servidor
// ------------------------------------------------------------
const server = app.listen(config.port, () => {
    logger.info("Servidor iniciado", {
        porta: config.port,
        ambiente: config.nodeEnv,
        url: `http://localhost:${config.port}`
    });
});

// Encerramento gracioso (Ctrl+C, kill, etc.)
function shutdown(signal) {
    logger.info(`Sinal ${signal} recebido. Encerrando servidor...`);

    server.close(() => {
        logger.info("Servidor encerrado com sucesso.");
        process.exit(0);
    });

    // Se nao fechar em 10s, forca o encerramento.
    setTimeout(() => {
        logger.warn("Encerramento forcado apos timeout.");
        process.exit(1);
    }, 10000).unref();
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

process.on("uncaughtException", (error) => {
    logger.error("Excecao nao capturada (uncaughtException)", {
        message: error.message,
        stack: error.stack
    });
});

module.exports = app;
