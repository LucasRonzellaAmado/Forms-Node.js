"use strict";

const logger = require("../utils/logger");

// 404 - rota nao encontrada
function notFoundHandler(req, res, next) {
    res.status(404).json({
        success: false,
        message: "Rota nao encontrada: " + req.originalUrl
    });
}

// Handler central de erros. Deve ser o ULTIMO middleware
// registrado no Express (4 argumentos = error handler).
function errorHandler(err, req, res, next) {
    const statusCode = err.statusCode || 500;

    logger.error("Erro nao tratado na requisicao", {
        requestId: req.id,
        method: req.method,
        url: req.originalUrl,
        statusCode,
        message: err.message,
        stack: err.stack
    });

    const isProduction = process.env.NODE_ENV === "production";

    res.status(statusCode).json({
        success: false,
        message: isProduction
            ? "Ocorreu um erro ao processar sua solicitacao."
            : err.message,
        requestId: req.id
    });
}

module.exports = {
    notFoundHandler,
    errorHandler
};
